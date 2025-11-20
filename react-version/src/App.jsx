
import React, { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

function generateEmptySeries(length = 30, fillValue = 0) {
  return Array.from({ length }).map(() => fillValue)
}

export default function App() {
  // Form state
  const [age, setAge] = useState(30)
  const [gender, setGender] = useState('male')
  const [bp, setBp] = useState(120)
  const [chol, setChol] = useState(200)
  const [glucose, setGlucose] = useState(100)

  // Prediction result
  const [prediction, setPrediction] = useState(null)
  const [status, setStatus] = useState('Mock')

  // Activity log
  const [logs, setLogs] = useState([])

  // Charts
  const [hrSeries, setHrSeries] = useState(generateEmptySeries(30, 72))
  const [bpSeries, setBpSeries] = useState(generateEmptySeries(30, 120))
  const labels = Array.from({ length: hrSeries.length }).map(() => '')

  useEffect(() => {
    const id = setInterval(() => {
      const newHR = Math.round(60 + Math.random() * 40)
      const newBP = Math.round(100 + Math.random() * 40)
      setHrSeries(prev => [...prev.slice(1), newHR])
      setBpSeries(prev => [...prev.slice(1), newBP])
      pushLog(`Metrics update — HR: ${newHR} bpm, BP: ${newBP} mmHg`)
    }, 2000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function pushLog(msg) {
    setLogs(prev => [ `[${new Date().toLocaleTimeString()}] ${msg}`, ...prev ].slice(0, 200))
  }

  function showPredictionResult(obj) {
    setPrediction(obj)
  }

  function mockPredict({ age, bp, chol, glucose }) {
    let score = 0
    if (age > 50) score += 1
    if (bp > 140) score += 1
    if (chol > 240) score += 1
    if (glucose > 126) score += 1
    const mapping = ['Low risk', 'Low risk', 'Moderate risk', 'High risk', 'Very high risk']
    return {
      prediction: mapping[Math.min(score, 4)],
      confidence: 0.6 + score * 0.1,
      notes: 'This is a mock prediction for demo purposes.'
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = { age: Number(age), gender, bp: Number(bp), chol: Number(chol), glucose: Number(glucose) }
    setPrediction({ loading: true })
    try {
      const res = await fetch('http://localhost:3000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Network response not ok')
      const data = await res.json()
      showPredictionResult(data)
      setStatus('Live')
      pushLog('Prediction returned: ' + data.prediction)
    } catch (err) {
      const m = mockPredict(payload)
      showPredictionResult(m)
      setStatus('Mock')
      pushLog('Prediction (mock) returned: ' + m.prediction)
    }
  }

  function handleRunMock() {
    const m = mockPredict({ age: Number(age), bp: Number(bp), chol: Number(chol), glucose: Number(glucose) })
    showPredictionResult(m)
    setStatus('Mock')
    pushLog('Manual mock prediction: ' + m.prediction)
  }

  const hrData = {
    labels,
    datasets: [
      {
        label: 'Heart Rate (bpm)',
        data: hrSeries,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 0
      },
    ],
  }
  const bpData = {
    labels,
    datasets: [
      {
        label: 'Systolic BP (mmHg)',
        data: bpSeries,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 0
      },
    ],
  }

//   const commonOptions = {
//     responsive: true,
//     plugins: { legend: { display: true } },
//     animation: false,
//     scales: { y: { beginAtZero: false } }
//   }
const commonOptions = {
  responsive: true,
  plugins: { 
    legend: { 
      display: true,
      labels: { font: { size: 10 } }
    } 
  },
  animation: false,
  scales: {
    x: { ticks: { display: false } },
    y: { ticks: { font: { size: 10 } } }
  },
  elements: { point: { radius: 0 } }
}





  return (
    <div className="app">
      <header className="header">
        <h1>Smart Health</h1>
        <p className="tagline">A simple, human-friendly health demo (React)</p>
      </header>

      <main className="container">
        <section className="left">
          <div className="card" aria-labelledby="prediction-heading">
            <h2 id="prediction-heading">Disease Prediction</h2>
            <form onSubmit={handleSubmit} className="predict-grid" aria-label="Prediction form">
              <label>
                <div style={{fontSize:12, color:'#6b7280'}}>Age</div>
                <input type="number" value={age} onChange={e => setAge(e.target.value)} min="0" max="120" />
              </label>

              <label>
                <div style={{fontSize:12, color:'#6b7280'}}>Gender</div>
                <select value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </label>

              <label>
                <div style={{fontSize:12, color:'#6b7280'}}>Blood Pressure (Systolic)</div>
                <input type="number" value={bp} onChange={e => setBp(e.target.value)} />
              </label>

              <label>
                <div style={{fontSize:12, color:'#6b7280'}}>Cholesterol</div>
                <input type="number" value={chol} onChange={e => setChol(e.target.value)} />
              </label>

              <label>
                <div style={{fontSize:12, color:'#6b7280'}}>Glucose</div>
                <input type="number" value={glucose} onChange={e => setGlucose(e.target.value)} />
              </label>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
                <button type="submit">Predict</button>
                <button type="button" onClick={handleRunMock} className="secondary">Run Mock</button>
              </div>
            </form>

            <div className={`result ${prediction ? '' : 'hidden'}`} aria-live="polite">
              {prediction && prediction.loading ? (
                <div>Running prediction...</div>
              ) : prediction ? (
                <div>
                  <strong>Prediction:</strong> {prediction.prediction} <br />
                  <strong>Confidence:</strong> {(Number(prediction.confidence) * 100).toFixed(1)}% <br />
                  <strong>Notes:</strong> {prediction.notes || '—'}
                </div>
              ) : null}
            </div>
          </div>

          <div className="card" aria-labelledby="metrics-heading">
            <h2 id="metrics-heading">Live Health Metrics</h2>
            <div className="charts-grid">
              <div>
                <Line data={hrData} options={{ ...commonOptions, scales: { y: { suggestedMin: 40, suggestedMax: 160 } } }} />
              </div>
              <div>
                <Line data={bpData} options={{ ...commonOptions, scales: { y: { suggestedMin: 80, suggestedMax: 200 } } }} />
              </div>
            </div>
          </div>
        </section>

        <aside className="right" aria-labelledby="summary-heading">
          <div className="card">
            <h2 id="summary-heading">Patient Summary</h2>
            <ul id="patient-summary" style={{listStyle:'none', paddingLeft:0, margin:0}}>
              <li><strong>Name:</strong> Demo Patient</li>
              <li><strong>Age:</strong> {age}</li>
              <li><strong>Last Sync:</strong> <span id="last-sync">—</span></li>
              <li><strong>Status:</strong> {status}</li>
            </ul>
          </div>

          <div className="card" aria-labelledby="activity-heading">
            <h2 id="activity-heading">Activity Log</h2>
            <ul id="log" style={{listStyle:'none', paddingLeft:0}}>
              {logs.map((l, i) => <li key={i}>{l}</li>)}
            </ul>
          </div>
        </aside>
      </main>

      <footer className="site-footer">
        <small style={{color:'#6b7280'}}>Demo — tries real ML endpoint at <code>http://localhost:5000/predict</code> then falls back to mock.</small>
      </footer>
    </div>
  )
}
