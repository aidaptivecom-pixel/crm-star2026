// api/generate-report.js
// Generates tasación PDF report via Gotenberg, uploads to Supabase Storage, returns URL
// Called from n8n workflow after lead unlocks tasación

export const maxDuration = 30;

const GOTENBERG_URL = process.env.GOTENBERG_URL || 'http://135.181.24.249:3000';
const SUPABASE_URL = 'https://wuoptaejdobinsmmkmoq.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1b3B0YWVqZG9iaW5zbW1rbW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTEwMzQwNiwiZXhwIjoyMDg0Njc5NDA2fQ.SIQ0tlRI1JCnSpBz1UV3-Y6OQPld3STYxyhaCnu5gBs';

function fmt(n) { return 'USD ' + Math.round(n).toLocaleString('es-AR'); }

function buildHTML(d) {
  const refId = d.ref_id || 'STR-00000';
  const barrio = d.neighborhood || '';
  const tipo = d.property_type || '';
  const address = d.address || barrio + ', CABA';
  const m2 = d.size_m2 || 0;
  const rooms = d.rooms || '-';
  const value = d.estimated_value || 0;
  const mn = d.estimated_value_min || value * 0.9;
  const mx = d.estimated_value_max || value * 1.1;
  const pm2 = d.price_per_m2 || (m2 ? Math.round(value / m2) : 0);
  const comps = d.comparables_count || 5;
  const conf = d.confidence || 75;
  const confColor = conf > 70 ? '#25D366' : conf > 40 ? '#D4A745' : '#e74c3c';
  const now = new Date();
  const date = now.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;1,700&family=Inter:wght@300;400;500;600&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#2C2420;color:#fff;padding:40px;max-width:800px;margin:0 auto}
h1,h2{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-style:italic;text-transform:uppercase}
.header{text-align:center;padding:30px 0;border-bottom:2px solid #D4A745}
.header h1{font-size:28px;color:#D4A745;margin-bottom:4px}
.ref{font-size:12px;color:rgba(255,255,255,.5);letter-spacing:2px}
.date{font-size:13px;color:rgba(255,255,255,.4);margin-top:8px}
.vs{text-align:center;padding:40px 0;background:linear-gradient(145deg,#352D28,#3E3530);border-radius:16px;margin:24px 0;border:1px solid rgba(212,167,69,.2)}
.vm{font-family:'Barlow Condensed',sans-serif;font-size:48px;font-weight:700;color:#D4A745}
.vr{font-size:15px;color:rgba(255,255,255,.6);margin-top:8px}
.stats{display:flex;gap:16px;margin:24px 0}
.stat{flex:1;background:rgba(255,255,255,.03);padding:20px;border-radius:10px;text-align:center}
.sv{font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:600}
.sl{font-size:11px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:1px;margin-top:4px}
.sec{margin:28px 0}
.sec h2{font-size:18px;color:#D4A745;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,.06)}
.pd{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px}
.pi{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04)}
.pi .l{color:rgba(255,255,255,.5);font-size:13px}
.pi .v{font-weight:500;font-size:14px}
.cb{height:6px;background:#3E3530;border-radius:4px;overflow:hidden;margin-top:8px}
.cf{height:100%;border-radius:4px}
.footer{text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid rgba(255,255,255,.06)}
.footer p{font-size:12px;color:rgba(255,255,255,.3);line-height:1.6}
.brand{color:#D4A745;font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;font-style:italic;text-transform:uppercase;margin-bottom:8px}
.disc{font-size:11px;color:rgba(255,255,255,.3);font-style:italic;margin-top:20px;line-height:1.5}
</style></head><body>
<div class="header"><h1>Informe de Tasación Express</h1><div class="ref">REF: ${refId}</div><div class="date">${date}</div></div>
<div class="vs"><div class="vm">${fmt(value)}</div><div class="vr">Rango de mercado: ${fmt(mn)} – ${fmt(mx)}</div></div>
<div class="stats"><div class="stat"><div class="sv">${fmt(pm2)}</div><div class="sl">USD / m²</div></div><div class="stat"><div class="sv">${comps}</div><div class="sl">Comparables</div></div><div class="stat"><div class="sv">${conf}%</div><div class="sl">Confianza</div></div></div>
<div class="sec"><h2>Datos de la Propiedad</h2><div class="pd">
<div class="pi"><span class="l">Dirección</span><span class="v">${address}</span></div>
<div class="pi"><span class="l">Barrio</span><span class="v">${barrio}</span></div>
<div class="pi"><span class="l">Tipo</span><span class="v">${tipo}</span></div>
<div class="pi"><span class="l">Superficie</span><span class="v">${m2} m²</span></div>
<div class="pi"><span class="l">Ambientes</span><span class="v">${rooms}</span></div>
</div></div>
<div class="sec"><h2>Nivel de Confianza</h2><p style="font-size:13px;color:rgba(255,255,255,.6);margin-bottom:12px">Basado en ${comps} propiedades comparables en ${barrio}</p><div class="cb"><div class="cf" style="width:${conf}%;background:${confColor}"></div></div></div>
<p class="disc">* Valores estimados basados en propiedades similares publicadas en la zona. Una tasación formal con visita permite obtener un valor más preciso. Este informe no constituye una tasación oficial.</p>
<div class="footer"><div class="brand">Star Real Estate Argentina</div><p>starargentina.com.ar | WhatsApp: 11-6214-8113</p></div>
</body></html>`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const data = req.body;
    const refId = data.ref_id || 'STR-00000';
    const filename = `Tasacion-${refId}.pdf`;

    // 1. Build HTML
    const html = buildHTML(data);

    // 2. Convert to PDF via Gotenberg
    const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
    const formBody = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="files"; filename="index.html"',
      'Content-Type: text/html; charset=utf-8',
      '',
      html,
      `--${boundary}--`,
      ''
    ].join('\r\n');

    const pdfRes = await fetch(`${GOTENBERG_URL}/forms/chromium/convert/html`, {
      method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
      body: formBody,
    });

    if (!pdfRes.ok) {
      const errText = await pdfRes.text();
      console.error('Gotenberg error:', pdfRes.status, errText);
      return res.status(502).json({ error: 'PDF generation failed', detail: errText });
    }

    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());

    // 3. Upload to Supabase Storage
    const storagePath = `${refId}/${filename}`;
    const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/tasaciones/${storagePath}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/pdf',
        'x-upsert': 'true',
      },
      body: pdfBuffer,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error('Storage upload error:', uploadRes.status, errText);
      return res.status(502).json({ error: 'Storage upload failed', detail: errText });
    }

    const pdfUrl = `${SUPABASE_URL}/storage/v1/object/public/tasaciones/${storagePath}`;

    return res.status(200).json({
      success: true,
      pdf_url: pdfUrl,
      filename: filename,
      ref_id: refId,
      size_bytes: pdfBuffer.length,
    });

  } catch (err) {
    console.error('generate-report error:', err);
    return res.status(500).json({ error: err.message });
  }
}
