import { reasonableRange, wholeUsd as usd } from '../money'
import type { Listing, Verdict } from '../types'

// Where the quoted price sits against the reasonable range (-30% to +10% of typical),
// with each sample listing as a dot. Drawn from the same numbers the server judged with.
interface Props {
  quoted: number
  typical: number
  listings: Listing[]
  verdict: Verdict
}

export default function PriceBar({ quoted, typical, listings, verdict }: Props) {
  const low = typical * 0.7
  const high = typical * 1.1
  const prices = listings.map((l) => l.price_usd)
  const min = Math.min(quoted, low, ...prices)
  const max = Math.max(quoted, high, ...prices)
  const pad = (max - min) * 0.12
  const start = min - pad
  const span = max + pad - start
  const at = (price: number) => ((price - start) / span) * 100

  // Keep labels inside the bar near the edges.
  const anchor = (pos: number) => (pos < 12 ? 'start' : pos > 88 ? 'end' : 'middle')

  return (
    <figure className="price-bar" aria-label={`Quoted ${usd(quoted)}, typical ${usd(typical)}, reasonable range ${reasonableRange(typical)}`}>
      <div className="price-bar-labels top">
        <span className={`price-label quoted verdict-${verdict} anchor-${anchor(at(quoted))}`} style={{ left: `${at(quoted)}%` }}>
          Quoted {usd(quoted)}
        </span>
      </div>
      <div className="price-bar-track">
        <div className="price-bar-band" style={{ left: `${at(low)}%`, width: `${at(high) - at(low)}%` }} />
        {prices.map((price, i) => (
          <span key={i} className="price-bar-listing" style={{ left: `${at(price)}%` }} />
        ))}
        <span className="price-bar-typical" style={{ left: `${at(typical)}%` }} />
        <span className={`price-bar-quoted verdict-${verdict}`} style={{ left: `${at(quoted)}%` }} />
      </div>
      <div className="price-bar-labels bottom">
        <span className={`price-label anchor-${anchor(at(typical))}`} style={{ left: `${at(typical)}%` }}>
          Typical (middle) {usd(typical)}
        </span>
      </div>
      {/* The band is keyed by the range sentence under the table. */}
      <figcaption className="price-bar-legend">
        <span><span className="legend-dot" /> A store listing</span>
      </figcaption>
    </figure>
  )
}
