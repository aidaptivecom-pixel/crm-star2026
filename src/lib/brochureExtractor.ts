import * as pdfjsLib from 'pdfjs-dist'
import { supabase } from './supabase'

// Configure PDF.js worker from CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

const VISION_EXTRACTION_PROMPT = `Analizá estas imágenes de un brochure de un emprendimiento inmobiliario y extraé la siguiente información en formato JSON.
IMPORTANTE: Respondé SOLO con el JSON, sin texto adicional, sin markdown, sin backticks.

Revisá TODAS las páginas cuidadosamente. Buscá:
- El nombre del emprendimiento (suele estar en la portada, header o logo — leé texto dentro de imágenes/logos)
- Ubicación y dirección exacta
- Tipologías de unidades (ambientes, superficies)
- Precios: buscá tablas de precios, listados de unidades. Extraé el precio mínimo y máximo. Si hay precio por m², extraelo también.
- Amenities y características del proyecto
- Estado del proyecto y fecha de entrega
- Información de financiación
- Teléfono de contacto y sitio web (suelen aparecer en headers/footers)

REGLAS DE INFERENCIA:
- Si TODAS las fotos/imágenes son renders 3D y NO hay fotos reales del edificio terminado → estado = "en_construccion"
- Si hay fotos reales del edificio terminado → estado = "entrega_inmediata"
- Si hay tablas de precios con unidades listadas, CONTÁ las unidades para units_available
- Para precio por m², buscá columnas tipo "VALOR M2" o "USD/m²" y extraé el mínimo y máximo

{
  "name": "nombre del emprendimiento",
  "location": "barrio/zona, ciudad (ej: Belgrano, CABA)",
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
  "precio_m2_min": null,
  "precio_m2_max": null,
  "financiacion": "información de financiación si aparece",
  "amenities": ["amenity1", "amenity2"],
  "features": ["feature1", "feature2"],
  "tipologias": [
    {"ambientes": "2 Amb", "superficie": "42-67 m² cubiertos", "superficieTotal": "54-94 m²", "unidades": 5, "precio_desde": 209657},
    {"ambientes": "3 Amb", "superficie": "73-75 m² cubiertos", "superficieTotal": "94 m²", "unidades": 3, "precio_desde": 332267}
  ],
  "contact_phone": "teléfono si aparece",
  "website": "sitio web si aparece",
  "best_image_pages": [1, 5, 18]
}

Para best_image_pages: indicá los números de página (empezando en 1) que tienen las MEJORES imágenes visuales del proyecto — renders exteriores, vistas aéreas, fotos de amenities, fachada. Elegí entre 3 y 6 páginas. NO incluyas páginas de tablas de precios, texto, planos técnicos ni páginas con solo logos.

Para tipologias: agrupá por cantidad de ambientes. Si hay tablas de precios con unidades individuales, contá cuántas unidades hay de cada tipo. El campo "unidades" es la cantidad disponible de ese tipo. "precio_desde" es el precio más bajo de ese tipo de unidad (buscalo en las tablas de precios). Si no podés determinar un dato, usá null.

Si algún dato no aparece en el brochure, usá null.
Para valores numéricos usá solo números (sin formato, sin puntos de miles).
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
  tipologias?: any[] | null
  contact_phone?: string | null
  website?: string | null
  best_image_pages?: number[] | null
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
 * Upload selected page images to Supabase Storage
 * Returns array of public URLs
 */
async function uploadProjectImages(
  images: string[],
  pageNumbers: number[],
  slug: string,
  onProgress?: (step: string) => void
): Promise<string[]> {
  if (!supabase) return []

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token || supabaseAnonKey

  const urls: string[] = []

  for (let i = 0; i < pageNumbers.length; i++) {
    const pageIdx = pageNumbers[i] - 1 // Convert 1-indexed to 0-indexed
    if (pageIdx < 0 || pageIdx >= images.length) continue

    onProgress?.(`Subiendo imagen ${i + 1}/${pageNumbers.length}...`)

    const base64 = images[pageIdx]
    const blob = await fetch(`data:image/jpeg;base64,${base64}`).then(r => r.blob())
    const fileName = `${slug}-${i + 1}.jpg`

    const res = await fetch(`${supabaseUrl}/storage/v1/object/brochures/${fileName}`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'image/jpeg',
        'x-upsert': 'true',
      },
      body: blob,
    })

    if (res.ok) {
      urls.push(`${supabaseUrl}/storage/v1/object/public/brochures/${fileName}`)
    }
  }

  return urls
}

/**
 * Full brochure processing pipeline (Vision-first):
 * 1. Render PDF pages as images
 * 2. Send images to Claude Vision for data extraction
 * 3. Upload PDF to storage
 * 4. Upload best images to storage
 * Returns extracted data + brochure URL
 */
export async function processBrochure(
  file: File,
  onProgress?: (step: string) => void
): Promise<{ data: BrochureExtractionResult; brochureUrl: string; imageUrls: string[] }> {
  // Step 1: Render pages as images
  onProgress?.('Renderizando páginas del PDF...')
  const images = await renderPDFPagesToImages(file, 100, 1.5, onProgress)

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

  // Step 4: Upload best images
  let imageUrls: string[] = []
  if (data.best_image_pages && data.best_image_pages.length > 0) {
    try {
      const slug = data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '') : `project-${Date.now()}`
      imageUrls = await uploadProjectImages(images, data.best_image_pages, slug, onProgress)
    } catch (err) {
      console.warn('No se pudieron subir las imágenes:', err)
    }
  }

  return { data, brochureUrl, imageUrls }
}
