import * as pdfjsLib from 'pdfjs-dist'
import { supabase } from './supabase'

// Configure PDF.js worker from CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

const EXTRACTION_PROMPT = `Analizá este brochure de un emprendimiento inmobiliario y extraé la siguiente información en formato JSON.
IMPORTANTE: Respondé SOLO con el JSON, sin texto adicional, sin markdown, sin backticks.

{
  "name": "nombre del emprendimiento",
  "location": "barrio/zona, ciudad",
  "direccion": "dirección exacta si aparece",
  "description": "descripción general del proyecto (2-3 párrafos)",
  "estado": "en_construccion | entrega_inmediata | preventa | disponible",
  "entrega": "fecha estimada de entrega si aparece",
  "tipologias_texto": "descripción de tipologías (ej: 1, 2 y 3 ambientes desde 40m² a 120m²)",
  "units_available": null,
  "total_units": null,
  "price_min": null,
  "price_max": null,
  "price_currency": "USD",
  "financiacion": "información de financiación si aparece",
  "amenities": ["amenity1", "amenity2"],
  "features": ["feature1", "feature2"]
}

Si algún dato no aparece en el brochure, usá null.
Para units_available, total_units, price_min y price_max usá solo números (sin formato).
Para amenities y features usá arrays de strings.

Texto del brochure:
`

export interface BrochureExtractionResult {
  name?: string | null
  location?: string | null
  direccion?: string | null
  description?: string | null
  estado?: string | null
  entrega?: string | null
  tipologias_texto?: string | null
  units_available?: number | null
  total_units?: number | null
  price_min?: number | null
  price_max?: number | null
  price_currency?: string | null
  financiacion?: string | null
  amenities?: string[] | null
  features?: string[] | null
}

/**
 * Extract text from a PDF file using pdf.js
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ')
    fullText += `--- Página ${i} ---\n${pageText}\n\n`
  }

  return fullText.trim()
}

/**
 * Upload a PDF file to Supabase Storage (bucket: brochures)
 * Returns the public URL
 */
export async function uploadBrochureToStorage(file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase no configurado')

  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const fileName = `${timestamp}-${safeName}`

  const { error } = await supabase.storage
    .from('brochures')
    .upload(fileName, file, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (error) throw new Error(`Error al subir PDF: ${error.message}`)

  const { data: urlData } = supabase.storage
    .from('brochures')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}

/**
 * Send extracted text to Claude API to parse brochure data
 * Uses anthropic-dangerous-direct-browser-access header for CORS
 */
export async function extractProjectDataWithClaude(
  pdfText: string
): Promise<BrochureExtractionResult> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('API key de Anthropic no configurada (VITE_ANTHROPIC_API_KEY)')

  // Truncate text if too long (Claude has limits)
  const maxChars = 80000
  const truncatedText = pdfText.length > maxChars
    ? pdfText.substring(0, maxChars) + '\n\n[... texto truncado por longitud ...]'
    : pdfText

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: EXTRACTION_PROMPT + truncatedText,
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      `Error de Claude API (${response.status}): ${errorData?.error?.message || response.statusText}`
    )
  }

  const data = await response.json()
  const content = data.content?.[0]?.text

  if (!content) throw new Error('Respuesta vacía de Claude')

  // Try to parse JSON from the response
  try {
    // Try direct parse first
    return JSON.parse(content)
  } catch {
    // Try to find JSON in the response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('No se pudo extraer datos estructurados del brochure. Respuesta: ' + content.substring(0, 200))
  }
}

/**
 * Full brochure processing pipeline:
 * 1. Upload PDF to storage
 * 2. Extract text with pdf.js
 * 3. Send to Claude for data extraction
 * Returns extracted data + brochure URL
 */
export async function processBrochure(
  file: File,
  onProgress?: (step: string) => void
): Promise<{ data: BrochureExtractionResult; brochureUrl: string }> {
  // Step 1: Upload to storage
  onProgress?.('Subiendo PDF a storage...')
  const brochureUrl = await uploadBrochureToStorage(file)

  // Step 2: Extract text
  onProgress?.('Extrayendo texto del PDF...')
  const pdfText = await extractTextFromPDF(file)

  if (!pdfText || pdfText.length < 50) {
    throw new Error(
      'No se pudo extraer texto del PDF. Es posible que sea un PDF basado en imágenes. Intentá con un PDF que contenga texto seleccionable.'
    )
  }

  // Step 3: Send to Claude
  onProgress?.('Analizando con IA...')
  const data = await extractProjectDataWithClaude(pdfText)

  return { data, brochureUrl }
}
