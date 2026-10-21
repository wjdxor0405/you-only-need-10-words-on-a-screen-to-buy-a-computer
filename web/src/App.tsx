import { useState } from 'react'
import { checkPrices } from './api'
import ConfirmStep, { type DraftLine, toDraft, toPartLine } from './components/ConfirmStep'
import ResultsStep from './components/ResultsStep'
import { SAMPLE_LINES } from './sampleQuote'
import type { CheckResult } from './types'

type Step = 'confirm' | 'results'

// All state lives here; nothing is saved, so closing the tab clears it.
export default function App() {
  const [step, setStep] = useState<Step>('confirm')
  const [lines, setLines] = useState<DraftLine[]>(() => SAMPLE_LINES.map(toDraft))
  const [result, setResult] = useState<CheckResult | null>(null)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCheck() {
    setChecking(true)
    setError(null)
    try {
      setResult(await checkPrices(lines.map(toPartLine)))
      setStep('results')
    } catch {
      setError('Checking failed — is the server running? See the server log.')
    } finally {
      setChecking(false)
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Quote Check</h1>
        <p>Paste the PC quote you were given and see, part by part, whether each price is reasonable — and why.</p>
      </header>
      {step === 'confirm' && (
        <ConfirmStep lines={lines} onChange={setLines} onCheck={handleCheck} checking={checking} error={error} />
      )}
      {step === 'results' && result && <ResultsStep result={result} onBack={() => setStep('confirm')} />}
    </main>
  )
}
