import * as pdfjsLib from 'pdfjs-dist'
import { supabase } from './supabase'

// Configure PDF.js worker from CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

const VISION_EXTRACTION_PROMPT = `Analizá estas imágenes de un brochure de un emprendimiento inmobiliario y extraé la siguiente información en formato JSON.
IMPORTANTE: Respondé SOLO con el JSON, sin texto adicional, sin markdown, sin backticks.

Revisá TODAS las páginas cuidadosamente. Buscá:
- El nombre del emprendimiento (suele estar en la portada o header)
- Ubicación y dirección
- Tipologías de unidades (ambientes, superficies)
- Precios si aparecen
- Amenities y características
- Estado del proyecto y fecha de entrega
- Información de financiación

{
  "name": "nombre del emprendimiento",
  "location": "barrio/zona, ciudad",
  "direccion": "dirección exacta si aparece",
  "description": "descripción general del proyecto (2-3 párrafos, rica en detalles)",
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
Para amenities y features usá arrays de strings.`

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
 * Render PDF pages as images (base64 JPEG)
 * Renders up to maxPages pages at the given scale
 */
export async function renderPDFPagesToImages(
  file: File,
  maxPages: number = 15,
  scale: number = 1.5,
  onProgress?: (step: string) => void
): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const totalPages = Math.min(pdf.numPages, maxPages)
  const images: string[] = []

  for (let i = 1; i <= totalPages; i++) {
    onProgress?.(`Procesando página ${i}/${totalPages}...`)
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')!

    await page.render({ canvasContext: ctx, viewport, canvas } as any).promise

    // Convert to JPEG base64 (quality 0.7 to keep size manageable)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
    // Extract base64 data without the data:image/jpeg;base64, prefix
    const base64 = dataUrl.split(',')[1]
    images.push(base64)

    // Clean up
    canvas.width = 0
    canvas.height = 0
  }

  return images
}

/**
 * Extract text from a PDF file using pdf.js (fallback method)
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

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  // Get the authenticated token from session
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token || supabaseAnonKey

  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const fileName = `${timestamp}-${safeName}`

  // Direct fetch to bypass SDK storage bug not sending auth token
  const res = await fetch(`${supabaseUrl}/storage/v1/object/brochures/${fileName}`, {
    method: 'POST',
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${token}`,
      'Content-Type': file.type || 'application/pdf',
    },
    body: file,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Error al subir PDF: ${err.message || err.error || res.statusText}`)
  }

  return `${supabaseUrl}/storage/v1/object/public/brochures/${fileName}`
}

/**
 * Send PDF page images to Claude Vision API to extract brochure data
 */
export async function extractProjectDataWithVision(
  images: string[]
): Promise<BrochureExtractionResult> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('API key de Anthropic no configurada (VITE_ANTHROPIC_API_KEY)')

  // Build content array with images + prompt
  const content: any[] = []

  // Add each page as an image
  for (let i = 0; i < images.length; i++) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: images[i],
      },
    })
  }

  // Add the extraction prompt at the end
  content.push({
    type: 'text',
    text: VISION_EXTRACTION_PROMPT,
  })

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
          content,
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
  const responseText = data.content?.[0]?.text

  if (!responseText) throw new Error('Respuesta vacía de Claude')

  // Try to parse JSON from the response
  try {
    return JSON.parse(responseText)
  } catch {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('No se pudo extraer datos estructurados del brochure. Respuesta: ' + responseText.substring(0, 200))
  }
}

/**
 * Full brochure processing pipeline (Vision-first):
 * 1. Render PDF pages as images
 * 2. Send images to Claude Vision for data extraction
 * 3. Upload PDF to storage
 * Returns extracted data + brochure URL
 */
export async function processBrochure(
  file: File,
  onProgress?: (step: string) => void
): Promise<{ data: BrochureExtractionResult; brochureUrl: string }> {
  // Step 1: Render pages as images
  onProgress?.('Renderizando páginas del PDF...')
  const images = await renderPDFPagesToImages(file, 15, 1.5, onProgress)

  if (!images || images.length === 0) {
    throw new Error('No se pudieron renderizar las páginas del PDF.')
  }

  // Step 2: Send to Claude Vision
  onProgress?.('Analizando con IA (visión)...')
  const data = await extractProjectDataWithVision(images)

  // Step 3: Try to upload PDF (non-blocking)
  let brochureUrl = ''
  try {
    onProgress?.('Guardando PDF...')
    brochureUrl = await uploadBrochureToStorage(file)
  } catch (err) {
    console.warn('No se pudo subir el PDF a storage (RLS):', err)
  }

  return { data, brochureUrl }
}
