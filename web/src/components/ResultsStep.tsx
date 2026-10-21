import type { CheckResult, Verdict } from '../types'
import ResultRow, { VERDICT_LABEL } from './ResultRow'

const SUMMARY_ORDER: Verdict[] = ['reasonable', 'worth_questioning', 'unusually_low', 'cant_verify']

interface Props {
  result: CheckResult
  onBack: () => void
}

export default function ResultsStep({ result, onBack }: Props) {
  const counts = SUMMARY_ORDER.map((verdict) => ({
    verdict,
    count: result.results.filter((r) => r.verdict === verdict).length,
  })).filter((c) => c.count > 0)

  return (
    <section className="card">
      <h2>Results</h2>
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
