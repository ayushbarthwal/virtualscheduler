import { useState } from 'react'
import AlgorithmSelector from './components/AlgorithmSelector'
import ProcessConfigPanel from './components/ProcessConfigPanel'
import ResultsPanel from './components/ResultsPanel'
import Header from './components/Header'

function App() {
  // Step: 0 = select algorithm, 1 = process/config, 2 = results
  const [step, setStep] = useState(0)
  const [selectedAlgo, setSelectedAlgo] = useState(null)
  const [workload, setWorkload] = useState([
    { process: 'P1', arrival: 0, burst: 5, priority: 1 }
  ])
  const [contextSwitch, setContextSwitch] = useState(1)
  const [timeQuantum, setTimeQuantum] = useState(2)
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Validation helpers
  const isWorkloadValid = () => {
    if (workload.length === 0) return false
    for (const row of workload) {
      if (
        !row.process ||
        typeof row.arrival !== 'number' || row.arrival < 0 ||
        typeof row.burst !== 'number' || row.burst < 1 ||
        typeof row.priority !== 'number' || row.priority < 1
      ) return false
    }
    return true
  }

  // Handlers for workload table
  const handleWorkloadChange = (idx, key, value) => {
    setWorkload(prev =>
      prev.map((row, i) => i === idx ? { ...row, [key]: value } : row)
    )
  }

  const addWorkloadRow = () => {
    setWorkload(prev => [
      ...prev,
      { process: `P${prev.length + 1}`, arrival: prev.length, burst: 1, priority: 1 }
    ])
  }

  const removeWorkloadRow = (idx) => {
    setWorkload(prev => prev.filter((_, i) => i !== idx))
  }

  const handleContextSwitchChange = (e) => {
    const val = Number(e.target.value)
    setContextSwitch(val >= 0 ? val : 0)
  }

  const handleTimeQuantumChange = (e) => {
    const val = Number(e.target.value)
    setTimeQuantum(val >= 1 ? val : 1)
  }

  // Step 1: Algorithm selection
  const handleAlgorithmSelect = (algoKey) => {
    setSelectedAlgo(algoKey)
    setStep(1)
  }

  // Step 2: Run simulation
  const handleRunSimulation = async () => {
    if (!isWorkloadValid()) {
      setError('Please enter valid workload inputs for all processes.')
      return
    }
    setLoading(true)
    setError(null)
    setMetrics(null)

    const payload = {
      algorithm: selectedAlgo,
      context_switch: contextSwitch,
      time_quantum: timeQuantum,
      workload
    }

    try {
      const res = await fetch('http://localhost:5000/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to schedule')
      } else if (data.error) {
        setError(data.error)
      } else {
        setMetrics(data)
        setStep(2)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />
      {step === 0 && (
        <AlgorithmSelector
          selected={selectedAlgo}
          onSelect={handleAlgorithmSelect}
        />
      )}
      {step === 1 && (
        <ProcessConfigPanel
          workload={workload}
          onWorkloadChange={handleWorkloadChange}
          addWorkloadRow={addWorkloadRow}
          removeWorkloadRow={removeWorkloadRow}
          contextSwitch={contextSwitch}
          onContextSwitchChange={handleContextSwitchChange}
          timeQuantum={timeQuantum}
          onTimeQuantumChange={handleTimeQuantumChange}
          onRun={handleRunSimulation}
          isWorkloadValid={isWorkloadValid}
          loading={loading}
          error={error}
        />
      )}
      {step === 2 && metrics && (
        <ResultsPanel metrics={metrics} />
      )}
    </div>
  )
}

export default App