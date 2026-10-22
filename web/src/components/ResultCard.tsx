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

function cantVerifyText(result: LineResult) {
  if (result.cant_verify_reason === 'not_in_sample') {
    return "This product isn't in our sample data, so we have no prices to compare it with. We won't guess."
  }
  if (result.swap_risk) {
    return "The name doesn't say which maker or model this is, so we can't tell which prices to compare it with. We won't guess."
  }
  return "This name could be more than one product in our sample data, so we can't tell which prices to compare it with. We won't guess."
}

export function usd(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

interface Props {
  result: LineResult
  ruleText: string
  sampleNote: string
}

// One part per card: a beginner can stop at the verdict; "Show proof" opens the evidence.
export default function ResultCard({ result, ruleText, sampleNote }: Props) {
  const [open, setOpen] = useState(false)
  const { line, verdict } = result

  return (
    <article className={`card result-card verdict-${verdict}`}>
      <p className="card-context">
        <PartIcon type={line.part_type} />
        {result.part_label} · {usd(line.price_usd)}
      </p>
      <p className="spec-label">{result.display_name}</p>
      <p className="verdict-phrase">
        <span className="dot" aria-hidden="true" />
        {VERDICT_LABEL[verdict]}
      </p>
      <p className="headline">{result.headline}</p>
      <p className="advice">{result.advice}</p>
      <button className="secondary wide" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? 'Hide proof' : 'Show proof'}
      </button>
      {open && (
        <div className="proof">
          <p>As written on the quote: {line.name}</p>
          {result.typical_price_usd !== null ? (
            <>
              <PriceBar
                quoted={line.price_usd}
                typical={result.typical_price_usd}
                listings={result.listings}
                verdict={verdict}
              />
              <p>
                Quoted <strong>{usd(line.price_usd)}</strong> · typical price{' '}
                <strong>{usd(result.typical_price_usd)}</strong>, the middle of these {result.listings.length} listings:
              </p>
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
              <p>{ruleText}</p>
            </>
          ) : (
            <p className="proof-reason">{cantVerifyText(result)}</p>
          )}
          {result.swap_risk && (
            <p className="note">
              Without a maker and model name, a cheaper part could be put in and you'd have nothing to point to. Ask the
              seller for the exact model.
            </p>
          )}
          <p>{sampleNote}</p>
        </div>
      )}
    </article>
  )
}
