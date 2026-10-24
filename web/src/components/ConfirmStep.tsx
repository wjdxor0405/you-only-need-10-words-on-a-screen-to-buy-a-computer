import { useState } from 'react'
import { PART_LABEL, PART_TYPES, type PartLine, type PartType } from '../types'
import PartIcon from './PartIcon'

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
  // Set when the reader found no part lines; replaces the empty list with a way back.
  unreadable: string | null
  onTryAnother: () => void
}

export default function ConfirmStep({ lines, onChange, onCheck, checking, error, unreadable, onTryAnother }: Props) {
  // Ids of the cards showing edit fields instead of the line as read.
  const [editing, setEditing] = useState<number[]>([])
  // The summary comes first; the line list opens under "Fix parts", or at once if a line needs fixing.
  const [fixing, setFixing] = useState(() => !lines.every(isValid))

  function update(id: number, patch: Partial<DraftLine>) {
    onChange(lines.map((line) => (line.id === id ? { ...line, ...patch } : line)))
  }

  function addLine() {
    const draft = toDraft({ part_type: 'Other', name: '', price_usd: 0 })
    draft.price = ''
    onChange([...lines, draft])
    setEditing([...editing, draft.id])
    setFixing(true)
  }

  const canCheck = lines.length > 0 && lines.every(isValid) && !checking

  if (unreadable) {
    return (
      <section className="card">
        <p className="lead unreadable">{unreadable}</p>
        <div className="actions">
          <button className="secondary" onClick={addLine}>
            + Add lines by hand
          </button>
          <button className="primary" onClick={onTryAnother}>
            Try another screenshot or paste text
          </button>
        </div>
      </section>
    )
  }

  const checkButton = (
    <button className="primary" disabled={!canCheck} onClick={onCheck}>
      {checking ? 'Checking…' : 'Check prices'}
    </button>
  )

  if (!fixing) {
    return (
      <section className="card">
        {error ? (
          <p className="lead error">{error}</p>
        ) : (
          <p className="lead">
            We read {lines.length} {lines.length === 1 ? 'part' : 'parts'}. Look right?
          </p>
        )}
        <ul className="part-icons">
          {lines.map((line) => (
            <li key={line.id} aria-label={PART_LABEL[line.part_type]}>
              <PartIcon type={line.part_type} />
            </li>
          ))}
        </ul>
        <div className="actions">
          <button className="secondary" onClick={() => setFixing(true)}>
            Fix parts
          </button>
          {checkButton}
        </div>
      </section>
    )
  }

  return (
    <section>
      {error ? (
        <p className="lead error">{error}</p>
      ) : (
        <p className="lead">Check each line against your quote.</p>
      )}
      {/* The user's lines as read: their quote, not the app's words, so not counted. */}
      <ul className="part-cards" data-words="skip">
        {lines.map((line) =>
          editing.includes(line.id) ? (
            <li className="card part-card" key={line.id}>
              <label className="field">
                Part
                <select value={line.part_type} onChange={(e) => update(line.id, { part_type: e.target.value as PartType })}>
                  {PART_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {PART_LABEL[type]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Product name
                <textarea
                  rows={2}
                  value={line.name}
                  placeholder="e.g. Corsair RM650e"
                  onChange={(e) => update(line.id, { name: e.target.value.replace(/\n/g, ' ') })}
                />
              </label>
              <label className="field">
                Price (USD)
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={line.price}
                  onChange={(e) => update(line.id, { price: e.target.value })}
                />
              </label>
              <div className="pager">
                <button
                  className="secondary danger"
                  onClick={() => {
                    onChange(lines.filter((l) => l.id !== line.id))
                    setEditing(editing.filter((id) => id !== line.id))
                  }}
                >
                  Delete
                </button>
                <button
                  className="primary"
                  disabled={!isValid(line)}
                  onClick={() => setEditing(editing.filter((id) => id !== line.id))}
                >
                  Done
                </button>
              </div>
            </li>
          ) : (
            <li className="card part-card" key={line.id}>
              <p className="card-context">
                <PartIcon type={line.part_type} />
                {PART_LABEL[line.part_type]}
              </p>
              <p className="part-name">{line.name || 'No name'}</p>
              <div className="part-price-row">
                <span className="part-price">{line.price.trim() ? `$${line.price}` : 'No price'}</span>
                <button className="secondary" onClick={() => setEditing([...editing, line.id])}>
                  Fix
                </button>
              </div>
              {!isValid(line) && <p className="hint">This line needs a product name and a price.</p>}
            </li>
          ),
        )}
      </ul>
      <div className="actions">
        <button className="secondary" onClick={addLine}>
          + Add a line
        </button>
        {checkButton}
      </div>
    </section>
  )
}
