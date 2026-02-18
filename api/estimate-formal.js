export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const SCRAPER_URL = process.env.SCRAPER_URL || 'https://scraper-star.135.181.24.249.sslip.io'
    const API_KEY = process.env.SCRAPER_API_KEY || 'star_scraper_0ef4b43a2785c724afb3b53d9fa52a952f4ff9960c4598a7'

    const response = await fetch(`${SCRAPER_URL}/estimate-formal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
      body: JSON.stringify(req.body),
    })
    const data = await response.json()
    res.status(response.status).json(data)
  } catch (err) {
    res.status(500).json({ error: 'Scraper unavailable: ' + err.message })
  }
}
