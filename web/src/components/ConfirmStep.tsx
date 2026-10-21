import { PART_TYPES, type PartLine, type PartType } from '../types'

// A part line while it is being edited: the price stays text so the box can be empty.
export interface DraftLine {
  id: number
  part_type: PartType
  name: string
  price: string
}

let nextId = 1

export function toDraft(line: PartLine): DraftLine {
  return { id: nextId++, part_type: line.part_type, name: line.name, price: String(line.price_usd) }
}

export function toPartLine(draft: DraftLine): PartLine {
  return { part_type: draft.part_type, name: draft.name.trim(), price_usd: Number(draft.price) }
}

function isValid(draft: DraftLine) {
  return draft.name.trim() !== '' && draft.price.trim() !== '' && Number(draft.price) >= 0
}

interface Props {
  lines: DraftLine[]
  onChange: (lines: DraftLine[]) => void
  onCheck: () => void
  checking: boolean
  error: string | null
}

export default function ConfirmStep({ lines, onChange, onCheck, checking, error }: Props) {
  function update(id: number, patch: Partial<DraftLine>) {
    onChange(lines.map((line) => (line.id === id ? { ...line, ...patch } : line)))
  }

  const canCheck = lines.length > 0 && lines.every(isValid) && !checking

  return (
    <section className="card">
      <h2>Confirm parts</h2>
      <p className="muted">Check that each line matches your quote. Fix a misread name or price, or delete a line that isn't a part.</p>
      <div className="part-rows">
        <div className="part-row part-row-head" aria-hidden="true">
          <span>Part</span>
          <span>Product name</span>
          <span>Price (USD)</span>
          <span />
        </div>
        {lines.map((line) => (
          <div className="part-row" key={line.id}>
            <select
              aria-label="Part type"
              value={line.part_type}
              onChange={(e) => update(line.id, { part_type: e.target.value as PartType })}
            >
              {PART_TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <input
              aria-label="Product name"
              value={line.name}
              placeholder="e.g. Corsair RM650e"
              onChange={(e) => update(line.id, { name: e.target.value })}
            />
            <input
              aria-label="Price in USD"
              className="price-input"
              type="number"
              min="0"
              step="0.01"
              value={line.price}
              onChange={(e) => update(line.id, { price: e.target.value })}
            />
            <button
              className="icon-button"
              aria-label={`Delete ${line.name || 'line'}`}
              onClick={() => onChange(lines.filter((l) => l.id !== line.id))}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="actions">
        <button
          className="link-button"
          onClick={() => onChange([...lines, toDraft({ part_type: 'Other', name: '', price_usd: 0 })])}
        >
          + Add a line
        </button>
        <button className="primary" disabled={!canCheck} onClick={onCheck}>
          {checking ? 'Checking…' : 'Check prices'}
        </button>
      </div>
      {!lines.every(isValid) && <p className="hint">Every line needs a product name and a price.</p>}
      {error && <p className="error">{error}</p>}
    </section>
  )
}
