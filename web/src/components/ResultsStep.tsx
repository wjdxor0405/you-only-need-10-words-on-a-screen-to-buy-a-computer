import { type ReactNode, useEffect, useState } from 'react'
import { copyText } from '../clipboard'
import type { CheckResult } from '../types'
import PartIcons from './PartIcons'
import ResultCard, { VERDICT_LABEL } from './ResultCard'

// One sentence: "5 of 8 parts look reasonable." The questions are a button under the icons.
function overview(result: CheckResult) {
  const total = result.results.length
  const ok = result.results.filter((r) => r.verdict === 'reasonable').length
  if (ok === total && total > 1) return `All ${total} parts look reasonable.`
  return `${ok} of ${total} ${total === 1 ? 'part looks' : 'parts look'} reasonable.`
}

// What "Copy" puts on the clipboard: one message to paste to the seller, every question in it,
// opened and closed like a customer asking before buying rather than a list of charges.
function sellerMessage(questions: string[]) {
  const body = questions.length === 1 ? questions : questions.map((q, i) => `${i + 1}. ${q}`)
  const opener = questions.length === 1 ? 'Hi! A quick question before I decide:' : 'Hi! A few quick questions before I decide:'
  return [opener, ...body, 'Thanks!'].join('\n')
}

interface Props {
  result: CheckResult
  onBack: () => void
}

// One card per screen: the overview, then one card per part, then one card per question for the seller.
// The part cards show where the user is with the row of part icons instead of "Part 4 of 8".
// Back returns to the card the user came from, so a jump to a question or a part comes back to where it started.
export default function ResultsStep({ result, onBack }: Props) {
  const [index, setIndex] = useState(0)
  const [history, setHistory] = useState<number[]>([])
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
  function go(to: number) {
    setHistory([...history, index])
    setIndex(to)
  }
  function back() {
    setIndex(history.length > 0 ? history[history.length - 1] : index - 1)
    setHistory(history.slice(0, -1))
  }
  const openPart = (part: number) => go(part + 1)
  const openQuestion = (n: number) => go(parts.length + n + 1)

  async function copyAll() {
    setCopy((await copyText(sellerMessage(questions.map((q) => q.text)))) ? 'copied' : 'failed')
  }

  let position: ReactNode = null
  let card: ReactNode
  if (index === 0) {
    card = (
      <article className="card">
        <p className="overview">{overview(result)}</p>
        <PartIcons items={icons} onSelect={openPart} />
        {/* Straight to what to do, for someone who won't page through every part. */}
        {questions.length > 0 && (
          <button className="secondary wide" onClick={() => openQuestion(0)}>
            {questions.length} {questions.length === 1 ? 'question' : 'questions'} to ask
          </button>
        )}
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
          <button className="secondary" onClick={back}>
            Back
          </button>
        )}
        {/* On a question, copying is the main action, so Next steps back to an outline. */}
        {index < last && (
          <button className={index > parts.length ? 'secondary' : 'primary'} onClick={() => go(index + 1)}>
            Next
          </button>
        )}
      </div>
    </section>
  )
}
