import { useEffect, useState } from 'react'
import { PlainError, checkPrices, readQuote } from './api'
import ConfirmStep, { type DraftLine, toDraft, toPartLine } from './components/ConfirmStep'
import ResultsStep from './components/ResultsStep'
import StepBar, { type Step } from './components/StepBar'
import UploadStep from './components/UploadStep'
import type { CheckResult } from './types'

// All state lives here; nothing is saved, so closing the tab clears it.
export default function App() {
  const [step, setStep] = useState<Step>('upload')
  const [quoteText, setQuoteText] = useState('')
  const [quoteImage, setQuoteImage] = useState<File | null>(null)
  const [unreadable, setUnreadable] = useState<string | null>(null)
  const [lines, setLines] = useState<DraftLine[]>([])
  const [result, setResult] = useState<CheckResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // A new step starts at the top, which matters on a phone.
  useEffect(() => window.scrollTo({ top: 0 }), [step])

  async function handleRead() {
    setBusy(true)
    setError(null)
    try {
      const read = await readQuote(quoteImage ? { image: quoteImage } : { text: quoteText })
      setLines(read.lines.map(toDraft))
      setUnreadable(
        read.lines.length > 0
          ? null
          : quoteImage
            ? "We couldn't read this image. Try a clearer one."
            : "We couldn't find PC parts in this text.",
      )
      setResult(null)
      setStep('confirm')
    } catch (e) {
      setError(e instanceof PlainError ? e.message : 'Reading failed. Try again, or paste the text.')
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
      setError('Checking failed. Is the server running?')
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
      {/* The title only on ①: each later screen keeps its ten words for the quote. */}
      {step === 'upload' && (
        <header className="page-header">
          <h1>Quote Check</h1>
        </header>
      )}
      <StepBar current={step} onGo={goTo} />
      {step === 'upload' && (
        <UploadStep
          text={quoteText}
          onTextChange={setQuoteText}
          image={quoteImage}
          onImageChange={setQuoteImage}
          onRead={handleRead}
          reading={busy}
          error={error}
        />
      )}
      {step === 'confirm' && (
        <ConfirmStep
          lines={lines}
          onChange={setLines}
          onCheck={handleCheck}
          checking={busy}
          error={error}
          unreadable={lines.length === 0 ? unreadable : null}
          onTryAnother={() => {
            setQuoteImage(null)
            goTo('upload')
          }}
        />
      )}
      {step === 'results' && result && <ResultsStep result={result} onBack={() => goTo('confirm')} />}
    </main>
  )
}
