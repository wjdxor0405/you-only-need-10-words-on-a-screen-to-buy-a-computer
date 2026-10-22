import { type ReactNode, useEffect, useState } from 'react'
import type { CheckResult, Verdict } from '../types'
import ResultCard, { VERDICT_LABEL, usd } from './ResultCard'

const SUMMARY_ORDER: Verdict[] = ['reasonable', 'worth_questioning', 'unusually_low', 'cant_verify']
// Two per card keeps the questions card within 120 characters (server/tests/test_card_text.py).
const QUESTIONS_PER_CARD = 2

function overview(result: CheckResult) {
  const total = result.results.length
  const ok = result.results.filter((r) => r.verdict === 'reasonable').length
  if (ok === total && total > 1) return `All ${total} parts look reasonable.`
  return `${ok} of ${total} ${total === 1 ? 'part looks' : 'parts look'} reasonable.`
}

interface Props {
  result: CheckResult
  onBack: () => void
}

// One card per screen: the overview, then one card per part, then the questions to ask the seller.
export default function ResultsStep({ result, onBack }: Props) {
  const [index, setIndex] = useState(0)
  const parts = result.results
  const questions = parts.flatMap((r) => (r.ask_seller ? [r.ask_seller] : []))
  const questionCards = Math.ceil(questions.length / QUESTIONS_PER_CARD)
  const last = parts.length + questionCards

  // Each card starts at the top of the screen, like turning a page.
  useEffect(() => window.scrollTo({ top: 0 }), [index])

  let position: string
  let card: ReactNode
  if (index === 0) {
    const counts = SUMMARY_ORDER.map((verdict) => ({
      verdict,
      count: parts.filter((r) => r.verdict === verdict).length,
    })).filter((c) => c.count > 0)
    position = 'Overview'
    card = (
      <article className="card">
        <p className="overview">{overview(result)}</p>
        <ul className="summary-counts">
          {counts.map(({ verdict, count }) => (
            <li key={verdict} className={`verdict-${verdict}`}>
              <span className="dot" aria-hidden="true" />
              {count} {VERDICT_LABEL[verdict]}
            </li>
          ))}
        </ul>
        <p className="card-context">Parts total {usd(result.total_usd)}</p>
      </article>
    )
  } else if (index <= parts.length) {
    position = `Part ${index} of ${parts.length}`
    card = (
      <ResultCard
        key={index}
        result={parts[index - 1]}
        ruleText={result.rule_text}
        sampleNote={result.sample_data_note}
      />
    )
  } else {
    const page = index - parts.length - 1
    const start = page * QUESTIONS_PER_CARD
    position = questionCards > 1 ? `Questions ${page + 1} of ${questionCards}` : 'Questions'
    card = (
      <article className="card">
        <h2>Questions to ask the seller</h2>
        <ol className="questions" start={start + 1}>
          {questions.slice(start, start + QUESTIONS_PER_CARD).map((q, i) => (
            <li key={start + i}>{q}</li>
          ))}
        </ol>
      </article>
    )
  }

  return (
    <section aria-label="Results">
      <p className="position">{position}</p>
      {card}
      <div className="pager">
        {index === 0 ? (
          <button className="secondary" onClick={onBack}>
            Edit parts
          </button>
        ) : (
          <button className="secondary" onClick={() => setIndex(index - 1)}>
            Back
          </button>
        )}
        {index < last && (
          <button className="primary" onClick={() => setIndex(index + 1)}>
            Next
          </button>
        )}
      </div>
    </section>
  )
}
