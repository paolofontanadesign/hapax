export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });

  const key = process.env.WINDY_API_KEY;
  if (!key) return res.status(500).json({ error: 'WINDY_API_KEY not configured' });

  // Windy max radius = 250km. We search broad then score client-side.
  const radius = 250;

  try {
    const url = `https://api.windy.com/webcams/api/v3/webcams` +
      `?nearby=${lat},${lon},${radius}` +
      `&limit=20` +
      `&fields=webcamId,title,location,player,status,lastUpdatedOn`;

    const upstream = await fetch(url, { headers: { 'x-windy-api-key': key } });
    if (!upstream.ok) {
      const text = await upstream.text();
      return res.status(upstream.status).json({ error: text });
    }
    const data = await upstream.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
