import { type ReactNode, useEffect, useState } from 'react'
import { copyText } from '../clipboard'
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

// What "Copy" puts on the clipboard: one message to paste to the seller, every question in it.
function sellerMessage(questions: string[]) {
  if (questions.length === 1) return questions[0]
  return ['Questions about the quote:', ...questions.map((q, i) => `${i + 1}. ${q}`)].join('\n')
}

interface Props {
  result: CheckResult
  onBack: () => void
}

// One card per screen: the overview, then one card per part, then one card per question for the seller.
// The part cards show where the user is with the row of part icons instead of "Part 4 of 8".
export default function ResultsStep({ result, onBack }: Props) {
  const [index, setIndex] = useState(0)
  const [copy, setCopy] = useState<'idle' | 'copied' | 'failed'>('idle')
  const parts = result.results
  const questions = parts.flatMap((r, part) => (r.ask_seller ? [{ text: r.ask_seller, part }] : []))
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
  const openPart = (part: number) => setIndex(part + 1)
  const openQuestion = (n: number) => setIndex(parts.length + n + 1)

  async function copyAll() {
    setCopy((await copyText(sellerMessage(questions.map((q) => q.text)))) ? 'copied' : 'failed')
  }

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
        <PartIcons items={icons} onSelect={openPart} />
      </article>
    )
  } else if (index <= parts.length) {
    const part = index - 1
    const question = questions.findIndex((q) => q.part === part)
    position = <PartIcons items={icons} current={part} onSelect={openPart} small />
    card = (
      <ResultCard
        key={index}
        result={parts[part]}
        ruleText={result.rule_text}
        sampleNote={result.sample_data_note}
        onAsk={question === -1 ? undefined : () => openQuestion(question)}
      />
    )
  } else {
    // A question is something the user sends, so it sits in a sent-message bubble with a way to send
    // it; the icon row marks the part it is about.
    const n = index - parts.length
    const { text, part } = questions[n - 1]
    position = (
      <>
        <PartIcons items={icons} current={part} onSelect={openPart} small />
        <p className="position">{questions.length > 1 ? `Ask the seller · ${n}/${questions.length}` : 'Ask the seller'}</p>
      </>
    )
    card = (
      <>
        <article className="bubble">
          <p className="question">{text}</p>
        </article>
        <button className="primary wide" onClick={copyAll}>
          {copy === 'copied'
            ? 'Copied ✓'
            : copy === 'failed'
              ? "Couldn't copy"
              : questions.length > 1
                ? `Copy all ${questions.length}`
                : 'Copy'}
        </button>
      </>
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
        {/* On a question, copying is the main action, so Next steps back to an outline. */}
        {index < last && (
          <button className={index > parts.length ? 'secondary' : 'primary'} onClick={() => setIndex(index + 1)}>
            Next
          </button>
        )}
      </div>
    </section>
  )
}
