// server.js -- mock ML backend for demo
// Run: npm install && npm start

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // allows calls from localhost:5173 (Vite) or other origins
app.use(bodyParser.json());

// Basic health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Mock ML backend running' });
});

/**
 * POST /predict
 * Expect JSON payload:
 * {
 *   age: number,
 *   gender: "male" | "female",
 *   bp: number,
 *   chol: number,
 *   glucose: number
 * }
 *
 * Response:
 * {
 *   prediction: string,
 *   confidence: number (0..1),
 *   notes: string
 * }
 */
app.post('/predict', (req, res) => {
  const payload = req.body || {};
  const age = Number(payload.age || 30);
  const bp = Number(payload.bp || 120);
  const chol = Number(payload.chol || 200);
  const glucose = Number(payload.glucose || 100);

  // Simple heuristic classifier (demo only)
  let score = 0;
  if (age > 50) score++;
  if (bp > 140) score++;
  if (chol > 240) score++;
  if (glucose > 126) score++;

  const mapping = ['Low risk', 'Low risk', 'Moderate risk', 'High risk', 'Very high risk'];
  const prediction = mapping[Math.min(score, 4)];
  const confidence = Math.min(0.95, 0.6 + score * 0.12);

  res.json({
    prediction,
    confidence,
    notes: 'Mock model (heuristic). Replace with a real model for production.'
  });
});

/**
 * GET /metrics
 * Returns a single snapshot of simulated vitals
 */
app.get('/metrics', (req, res) => {
  const sample = {
    heartRate: Math.round(60 + Math.random() * 40),
    systolic: Math.round(100 + Math.random() * 40),
    diastolic: Math.round(60 + Math.random() * 20),
    ts: new Date().toISOString()
  };
  res.json(sample);
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock ML backend listening on http://localhost:${PORT}`);
});
