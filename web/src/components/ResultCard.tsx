import { useState } from 'react'
import type { LineResult, Verdict } from '../types'
import PartIcon from './PartIcon'
import PriceBar from './PriceBar'

export const VERDICT_LABEL: Record<Verdict, string> = {
  reasonable: 'Reasonable',
  worth_questioning: 'Worth questioning',
  unusually_low: 'Unusually low',
  cant_verify: "Can't verify",
}

// One sentence each, so a Can't verify proof stays within ten words.
function cantVerifyText(result: LineResult) {
  if (result.cant_verify_reason === 'not_in_sample') return 'No prices for this in our sample data.'
  if (result.swap_risk) return 'Without a model, a cheaper part could be swapped in.'
  return 'This name fits several products in our data.'
}

export function usd(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

interface Props {
  result: LineResult
  ruleText: string
  sampleNote: string
}

// One part per card: a beginner can stop at the verdict; "Show proof" turns the card into its
// evidence, so the card and its proof are separate screens of at most ten words each.
export default function ResultCard({ result, ruleText, sampleNote }: Props) {
  const [open, setOpen] = useState(false)
  const { line, verdict } = result

  return (
    <article className={`card result-card verdict-${verdict}`}>
      {open ? (
        <div className="proof">
          {/* The user's own quote text: shown as written, not counted. */}
          <p className="proof-name" data-words="skip">
            <PartIcon type={line.part_type} />“{line.name}”
          </p>
          {result.typical_price_usd !== null ? (
            <>
              <div data-words="skip">
                <PriceBar
                  quoted={line.price_usd}
                  typical={result.typical_price_usd}
                  listings={result.listings}
                  verdict={verdict}
                />
                <table className="listings">
                  <thead>
                    <tr>
                      <th>Store</th>
                      <th>Price</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.listings.map((listing, i) => (
                      <tr key={i}>
                        <td>{listing.store}</td>
                        <td>{usd(listing.price_usd)}</td>
                        <td>{listing.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="proof-rule">{ruleText}</p>
              <p>{sampleNote}</p>
            </>
          ) : (
            <p className={result.swap_risk ? 'proof-reason note' : 'proof-reason'}>{cantVerifyText(result)}</p>
          )}
        </div>
      ) : (
        <>
          <p className="card-context">
            <PartIcon type={line.part_type} />
            {result.part_label} · {usd(line.price_usd)}
          </p>
          <p className="verdict-phrase">
            <span className="dot" aria-hidden="true" />
            {VERDICT_LABEL[verdict]}
          </p>
          <p className="headline">{result.headline}</p>
          {result.advice && <p className="advice">{result.advice}</p>}
        </>
      )}
      <button className="secondary wide" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? 'Back to card' : 'Show proof'}
      </button>
    </article>
  )
}
