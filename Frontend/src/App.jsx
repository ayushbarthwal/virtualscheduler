import { useState } from 'react'
import './App.css'

const ALGORITHMS = [
  'FCFS', 'SJF', 'SRTF', 'RR', 'Priority', 'MLFQ'
]

function App() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [algorithm, setAlgorithm] = useState(ALGORITHMS[0])
  const [file, setFile] = useState(null)
  const [contextSwitch, setContextSwitch] = useState(2)

  const handleFileChange = (e) => setFile(e.target.files[0])
  const handleAlgorithmChange = (e) => setAlgorithm(e.target.value)
  const handleContextSwitchChange = (e) => setContextSwitch(e.target.value)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMetrics(null)

    const formData = new FormData()
    formData.append('algorithm', algorithm)
    formData.append('context_switch', contextSwitch)
    if (file) formData.append('workload', file)

    try {
      const res = await fetch('http://localhost:5000/api/schedule', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to schedule')
      } else if (data.error) {
        setError(data.error)
      } else {
        setMetrics(data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Helper to render metrics table if metrics is an array
  const renderTable = (data) => (
    <table border="1" cellPadding="8">
      <thead>
        <tr>
          {Object.keys(data[0]).map(key => <th key={key}>{key}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx}>
            {Object.values(row).map((val, i) => <td key={i}>{val}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )

  return (
    <div className="app-container">
      <h1>Virtual Scheduler</h1>
      <form onSubmit={handleSubmit} style={{marginBottom: 32}}>
        <label>
          Scheduling Algorithm:&nbsp;
          <select value={algorithm} onChange={handleAlgorithmChange}>
            {ALGORITHMS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <label style={{marginLeft: 16}}>
          Context Switch Time:&nbsp;
          <input
            type="number"
            min="0"
            value={contextSwitch}
            onChange={handleContextSwitchChange}
            style={{width: 60}}
          />
        </label>
        <label style={{marginLeft: 16}}>
          Workload File (CSV/JSON):&nbsp;
          <input type="file" accept=".csv,.json" onChange={handleFileChange} />
        </label>
        <button type="submit" style={{marginLeft: 16}}>Run Scheduler</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p style={{color: 'red'}}>Error: {error}</p>}
      {metrics && metrics.metrics && Array.isArray(metrics.metrics) && metrics.metrics.length > 0 && renderTable(metrics.metrics)}
      {metrics && metrics.metrics && Array.isArray(metrics.metrics) && metrics.metrics.length === 0 && (
        <p>No metrics returned.</p>
      )}
      {/* If metrics is an object (not array), show JSON */}
      {metrics && (!metrics.metrics || !Array.isArray(metrics.metrics)) && (
        <pre style={{textAlign: 'left', margin: '0 auto', maxWidth: 800}}>
          {JSON.stringify(metrics, null, 2)}
        </pre>
      )}
      {/* Display charts if present */}
      {metrics && metrics.charts && metrics.charts.length > 0 && (
        <div style={{marginTop: 32}}>
          <h2>Generated Charts</h2>
          {metrics.charts.map((chart, idx) => (
            <div key={idx} style={{marginBottom: 16}}>
              <img
                src={`http://localhost:5000/api/charts/${chart}`}
                alt={chart}
                style={{maxWidth: '100%', border: '1px solid #ccc'}}
              />
              <div>{chart}</div>
            </div>
          ))}
        </div>
      )}
      {/* Display PDF reports if present */}
      {metrics && metrics.reports && metrics.reports.length > 0 && (
        <div style={{marginTop: 32}}>
          <h2>PDF Reports</h2>
          {metrics.reports.map((pdf, idx) => (
            <div key={idx}>
              <a
                href={`http://localhost:5000/api/reports/${pdf}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {pdf}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App