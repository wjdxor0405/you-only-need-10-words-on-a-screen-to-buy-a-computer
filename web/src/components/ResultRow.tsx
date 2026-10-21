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

const CANT_VERIFY_TEXT = {
  not_in_sample: "This product isn't in our sample data, so we have no prices to compare it with. We won't guess.",
  name_too_vague:
    "The name doesn't say which maker or model this is, so we can't tell which prices to compare it with. We won't guess.",
}

function usd(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

interface Props {
  result: LineResult
  ruleText: string
  sampleNote: string
}

export default function ResultRow({ result, ruleText, sampleNote }: Props) {
  const [open, setOpen] = useState(false)
  const { line, verdict } = result

  return (
    <li className={`result-row verdict-${verdict}`}>
      <button className="result-summary" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="part-type">
          <PartIcon type={line.part_type} />
          {line.part_type}
        </span>
        <span className="part-name">{line.name}</span>
        <span className="part-price">{usd(line.price_usd)}</span>
        <span className="verdict">
          <span className="dot" aria-hidden="true" />
          {VERDICT_LABEL[verdict]} · {result.headline}
        </span>
        <span className="chevron" aria-hidden="true">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="evidence">
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
              {verdict === 'unusually_low' && (
                <p className="note">Much cheaper than usual. Check that it's the exact model and that it's new.</p>
              )}
              <p className="rule">{ruleText}</p>
            </>
          ) : (
            result.cant_verify_reason && <p>{CANT_VERIFY_TEXT[result.cant_verify_reason]}</p>
          )}
          {result.swap_risk && (
            <p className="note">
              Without a maker and model name, a cheaper part could be put in and you'd have nothing to point to. Ask the
              seller for the exact model.
            </p>
          )}
          <p className="sample-label">{sampleNote}</p>
        </div>
      )}
    </li>
  )
}
