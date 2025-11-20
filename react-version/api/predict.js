// react-version/api/predict.js
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ status: 'ok', message: 'Mock API — POST /api/predict' });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const data = req.body || {};
  const age = Number(data.age || 30);
  const bp = Number(data.bp || 120);
  const chol = Number(data.chol || 200);
  const glucose = Number(data.glucose || 100);

  // Simple heuristic logic (same behaviour as your previous mock)
  let score = 0;
  if (age > 50) score++;
  if (bp > 140) score++;
  if (chol > 240) score++;
  if (glucose > 126) score++;

  const levels = ['Low risk', 'Low risk', 'Moderate risk', 'High risk', 'Very high risk'];
  const prediction = levels[Math.min(score, 4)];
  const confidence = Math.min(0.95, 0.6 + score * 0.12);

  res.json({
    prediction,
    confidence,
    notes: 'Mock result served by Vercel Serverless Function'
  });
}
