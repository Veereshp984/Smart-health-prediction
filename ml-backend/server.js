// Simple mock backend to test the frontend prediction flow
// Run with: npm install && npm start

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Basic check to confirm the server is running
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Mock backend running' });
});

// Mock prediction endpoint
app.post('/predict', (req, res) => {
  const data = req.body || {};

  const age = Number(data.age || 30);
  const bp = Number(data.bp || 120);
  const chol = Number(data.chol || 200);
  const glucose = Number(data.glucose || 100);

  // Very simple scoring logic just to mimic an ML model
  let score = 0;
  if (age > 50) score++;
  if (bp > 140) score++;
  if (chol > 240) score++;
  if (glucose > 126) score++;

  const levels = ['Low risk', 'Low risk', 'Moderate risk', 'High risk', 'Very high risk'];

  res.json({
    prediction: levels[Math.min(score, 4)],
    confidence: Math.min(0.95, 0.6 + score * 0.12),
    notes: 'This is only a mock result for testing the frontend.'
  });
});

// Quick metrics endpoint to simulate health readings
app.get('/metrics', (req, res) => {
  res.json({
    heartRate: Math.round(60 + Math.random() * 40),
    systolic: Math.round(100 + Math.random() * 40),
    diastolic: Math.round(60 + Math.random() * 20),
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Mock backend running on http://localhost:${PORT}`);
});
