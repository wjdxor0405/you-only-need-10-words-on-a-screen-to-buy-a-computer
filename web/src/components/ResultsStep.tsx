import type { CheckResult, Verdict } from '../types'
import ResultRow, { VERDICT_LABEL } from './ResultRow'

const SUMMARY_ORDER: Verdict[] = ['reasonable', 'worth_questioning', 'unusually_low', 'cant_verify']

function overview(result: CheckResult) {
  const count = (verdicts: Verdict[]) => result.results.filter((r) => verdicts.includes(r.verdict)).length
  const parts = [
    [count(['reasonable']), 'look reasonable'],
    [count(['worth_questioning', 'unusually_low']), 'need a closer look'],
    [count(['cant_verify']), "couldn't be verified"],
  ]
    .filter(([n]) => n)
    .map(([n, text]) => `${n} ${text}`)
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts[0]
  return `Of ${result.results.length} parts, ${list}.`
}

interface Props {
  result: CheckResult
  onBack: () => void
}

export default function ResultsStep({ result, onBack }: Props) {
  const counts = SUMMARY_ORDER.map((verdict) => ({
    verdict,
    count: result.results.filter((r) => r.verdict === verdict).length,
  })).filter((c) => c.count > 0)
  const questions = result.results.flatMap((r) => (r.ask_seller ? [r.ask_seller] : []))

  return (
    <section className="card">
      <h2>Results</h2>
      <p className="overview">{overview(result)}</p>
      <div className="summary">
        <ul className="summary-counts">
          {counts.map(({ verdict, count }) => (
            <li key={verdict} className={`verdict-${verdict}`}>
              <span className="dot" aria-hidden="true" />
              {count} {VERDICT_LABEL[verdict]}
            </li>
          ))}
        </ul>
        <p className="summary-total">
          Quote total <strong>${result.total_usd.toLocaleString('en-US')}</strong>
        </p>
      </div>
      {questions.length > 0 && (
        <div className="ask-seller">
          <h3>Questions to ask the seller</h3>
          <ol>
            {questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
        </div>
      )}
      <p className="muted">Click a line to see the evidence.</p>
      <ul className="result-rows">
        {result.results.map((r, i) => (
          <ResultRow key={i} result={r} ruleText={result.rule_text} sampleNote={result.sample_data_note} />
        ))}
      </ul>
      <div className="actions">
        <button className="link-button" onClick={onBack}>
          ← Edit parts
        </button>
      </div>
    </section>
  )
}
