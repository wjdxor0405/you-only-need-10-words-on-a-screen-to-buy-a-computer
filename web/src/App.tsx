import { useState } from 'react'
import { checkPrices, readQuote } from './api'
import ConfirmStep, { type DraftLine, toDraft, toPartLine } from './components/ConfirmStep'
import ResultsStep from './components/ResultsStep'
import StepBar, { type Step } from './components/StepBar'
import UploadStep from './components/UploadStep'
import type { CheckResult } from './types'

// All state lives here; nothing is saved, so closing the tab clears it.
export default function App() {
  const [step, setStep] = useState<Step>('upload')
  const [quoteText, setQuoteText] = useState('')
  const [lines, setLines] = useState<DraftLine[]>([])
  const [result, setResult] = useState<CheckResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRead() {
    setBusy(true)
    setError(null)
    try {
      const read = await readQuote(quoteText)
      if (read.lines.length === 0) {
        setError(read.problem?.message ?? "We couldn't find any PC parts in this quote.")
        return
      }
      setLines(read.lines.map(toDraft))
      setResult(null)
      setStep('confirm')
    } catch {
      setError('Reading failed — check the server log. You can still try again.')
    } finally {
      setBusy(false)
    }
  }

  async function handleCheck() {
    setBusy(true)
    setError(null)
    try {
      setResult(await checkPrices(lines.map(toPartLine)))
      setStep('results')
    } catch {
      setError('Checking failed — is the server running? See the server log.')
    } finally {
      setBusy(false)
    }
  }

  function goTo(next: Step) {
    setError(null)
    setStep(next)
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Quote Check</h1>
        <p>Paste the PC quote you were given and see, part by part, whether each price is reasonable — and why.</p>
      </header>
      <StepBar current={step} onGo={goTo} />
      {step === 'upload' && (
        <UploadStep text={quoteText} onTextChange={setQuoteText} onRead={handleRead} reading={busy} error={error} />
      )}
      {step === 'confirm' && (
        <ConfirmStep lines={lines} onChange={setLines} onCheck={handleCheck} checking={busy} error={error} />
      )}
      {step === 'results' && result && <ResultsStep result={result} onBack={() => goTo('confirm')} />}
    </main>
  )
}
