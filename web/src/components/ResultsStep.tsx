import { type ReactNode, useEffect, useState } from 'react'
import type { CheckResult } from '../types'
import PartIcon from './PartIcon'
import ResultCard, { VERDICT_LABEL } from './ResultCard'

// At most two sentences, ten words together: "5 of 8 parts look reasonable. 3 questions to ask."
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

// One card per screen: the overview, then one card per part, then one card per question for the seller.
export default function ResultsStep({ result, onBack }: Props) {
  const [index, setIndex] = useState(0)
  const parts = result.results
  const questions = parts.flatMap((r) => (r.ask_seller ? [r.ask_seller] : []))
  const last = parts.length + questions.length

  // Each card starts at the top of the screen, like turning a page.
  useEffect(() => window.scrollTo({ top: 0 }), [index])

  let position: string
  let card: ReactNode
  if (index === 0) {
    position = 'Overview'
    card = (
      <article className="card">
        <p className="overview">{overview(result)}</p>
        {questions.length > 0 && (
          <p className="overview-sub">
            {questions.length} {questions.length === 1 ? 'question' : 'questions'} to ask.
          </p>
        )}
        {/* One icon per part in its verdict color; the cards that follow say each verdict in words. */}
        <ul className="part-icons">
          {parts.map((r, i) => (
            <li key={i} className={`verdict-${r.verdict}`} aria-label={`${r.part_label}: ${VERDICT_LABEL[r.verdict]}`}>
              <PartIcon type={r.line.part_type} />
            </li>
          ))}
        </ul>
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
    const n = index - parts.length
    position = questions.length > 1 ? `Ask the seller · ${n} of ${questions.length}` : 'Ask the seller'
    card = (
      <article className="card">
        <p className="question">{questions[n - 1]}</p>
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
