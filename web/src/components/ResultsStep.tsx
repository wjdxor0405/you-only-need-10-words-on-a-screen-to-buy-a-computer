import { type ReactNode, useEffect, useState } from 'react'
import type { CheckResult } from '../types'
import PartIcons from './PartIcons'
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
// The part cards show where the user is with the row of part icons instead of "Part 4 of 8".
export default function ResultsStep({ result, onBack }: Props) {
  const [index, setIndex] = useState(0)
  const parts = result.results
  const questions = parts.flatMap((r) => (r.ask_seller ? [r.ask_seller] : []))
  const last = parts.length + questions.length

  // Each card starts at the top of the screen, like turning a page.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [index])

  // One icon per part in its verdict color; tapping one opens that part's card.
  const icons = parts.map((r) => ({
    type: r.line.part_type,
    label: `${r.part_label}: ${VERDICT_LABEL[r.verdict]}`,
    verdict: r.verdict,
  }))

  let position: ReactNode = null
  let card: ReactNode
  if (index === 0) {
    card = (
      <article className="card">
        <p className="overview">{overview(result)}</p>
        {questions.length > 0 && (
          <p className="overview-sub">
            {questions.length} {questions.length === 1 ? 'question' : 'questions'} to ask.
          </p>
        )}
        <PartIcons items={icons} onSelect={(i) => setIndex(i + 1)} />
      </article>
    )
  } else if (index <= parts.length) {
    position = <PartIcons items={icons} current={index - 1} onSelect={(i) => setIndex(i + 1)} small />
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
    position = <p className="position">{questions.length > 1 ? `Ask the seller · ${n}/${questions.length}` : 'Ask the seller'}</p>
    card = (
      <article className="card">
        <p className="question">{questions[n - 1]}</p>
      </article>
    )
  }

  return (
    <section aria-label="Results">
      {position}
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
