export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Anthropic API key not configured on server' })

  try {
    const { imageUrls, images, prompt } = req.body

    if (!prompt) {
      return res.status(400).json({ error: 'prompt required' })
    }

    // Support both URL-based (new) and base64 (legacy) modes
    const content = []

    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      // New mode: download images from URLs and convert to base64
      for (let i = 0; i < imageUrls.length; i++) {
        try {
          const imgRes = await fetch(imageUrls[i])
          if (!imgRes.ok) {
            console.warn(`Failed to download image ${i + 1}: ${imgRes.status}`)
            continue
          }
          const arrayBuffer = await imgRes.arrayBuffer()
          const base64 = Buffer.from(arrayBuffer).toString('base64')
          content.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: base64,
            },
          })
        } catch (err) {
          console.warn(`Error downloading image ${i + 1}:`, err.message)
        }
      }
    } else if (images && Array.isArray(images) && images.length > 0) {
      // Legacy mode: base64 images sent directly (small PDFs)
      for (const img of images) {
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: img,
          },
        })
      }
    } else {
      return res.status(400).json({ error: 'imageUrls or images array required' })
    }

    if (content.length === 0) {
      return res.status(400).json({ error: 'No images could be loaded' })
    }

    content.push({ type: 'text', text: prompt })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content }],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return res.status(response.status).json({
        error: `Claude API error (${response.status}): ${errorData?.error?.message || response.statusText}`,
      })
    }

    const data = await response.json()
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: 'Extract failed: ' + err.message })
  }
}
