import type { PartType, Verdict } from '../types'
import PartIcon from './PartIcon'

// The verdict as a mark as well as a color, so the row reads without telling colors apart.
const MARK: Record<Verdict, string> = {
  reasonable: '✓',
  worth_questioning: '!',
  unusually_low: '!',
  cant_verify: '?',
}

export interface PartIconItem {
  type: PartType
  label: string // read by screen readers: "Graphics card: Unusually low"
  verdict?: Verdict // colors the ring on ③
  caption?: string // the price under the icon on ②; the user's own number, so not counted
  problem?: boolean // a line that still needs a name or price
}

interface Props {
  items: PartIconItem[]
  current?: number // the part on screen, when the row shows where the user is
  onSelect?: (index: number) => void
  onAdd?: () => void
  small?: boolean // one row above a card instead of a grid on its own card
}

// One icon per part, wordless: the overview and ② use it as a grid, the part cards and ②'s
// line pages as the position ("Part 4 of 8" without the words). Tapping an icon opens that part.
export default function PartIcons({ items, current, onSelect, onAdd, small }: Props) {
  return (
    <ul className={small ? 'part-icons small' : 'part-icons'}>
      {items.map((item, i) => {
        const className = [
          item.verdict ? `verdict-${item.verdict}` : '',
          item.problem ? 'problem' : '',
          i === current ? 'current' : '',
        ].join(' ')
        const icon = (
          <>
            <PartIcon type={item.type} />
            {item.verdict && (
              <span className="verdict-mark" aria-hidden="true">
                {MARK[item.verdict]}
              </span>
            )}
          </>
        )
        return (
          <li key={i} className={className}>
            {onSelect ? (
              <button
                className="part-icon-button"
                aria-label={item.label}
                aria-current={i === current ? 'true' : undefined}
                onClick={() => onSelect(i)}
              >
                {icon}
              </button>
            ) : (
              <span className="part-icon-button" role="img" aria-label={item.label}>
                {icon}
              </span>
            )}
            {item.caption && (
              <span className="part-icon-caption" data-words="skip">
                {item.caption}
              </span>
            )}
          </li>
        )
      })}
      {onAdd && (
        <li>
          <button className="part-icon-button add" aria-label="Add a line" onClick={onAdd}>
            +
          </button>
        </li>
      )}
    </ul>
  )
}
