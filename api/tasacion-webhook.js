// api/tasacion-webhook.js
// Proxy webhook to n8n - triggers PDF generation + WhatsApp delivery
// This avoids exposing n8n URL in frontend code

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const N8N_WEBHOOK_URL = process.env.N8N_TASACION_WEBHOOK_URL;
  
  if (!N8N_WEBHOOK_URL) {
    console.error('N8N_TASACION_WEBHOOK_URL not configured');
    // Still return 200 to not block the frontend
    return res.status(200).json({ ok: true, queued: false, reason: 'webhook_not_configured' });
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      console.error('n8n webhook error:', response.status, await response.text());
      return res.status(200).json({ ok: true, queued: false, reason: 'webhook_error' });
    }

    return res.status(200).json({ ok: true, queued: true });
  } catch (err) {
    console.error('n8n webhook failed:', err.message);
    // Don't fail the frontend request
    return res.status(200).json({ ok: true, queued: false, reason: 'webhook_unreachable' });
  }
}
