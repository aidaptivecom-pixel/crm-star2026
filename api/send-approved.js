export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const response = await fetch('https://star.igreen.com.ar/webhook/send-approved', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-Auth': process.env.N8N_WEBHOOK_KEY || '',
      },
      body: JSON.stringify(req.body),
    })
    const text = await response.text()
    try {
      const data = JSON.parse(text)
      res.status(response.status).json(data)
    } catch {
      res.status(response.status).json({ status: 'ok', raw: text || null })
    }
  } catch (err) {
    res.status(500).json({ error: 'n8n unavailable: ' + err.message })
  }
}
