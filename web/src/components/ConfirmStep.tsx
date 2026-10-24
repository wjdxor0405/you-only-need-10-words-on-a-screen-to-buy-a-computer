import { useEffect, useState } from 'react'
import { PART_LABEL, PART_TYPES, type PartLine, type PartType } from '../types'
import PartIcon from './PartIcon'
import PartIcons from './PartIcons'

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

function price(draft: DraftLine) {
  return draft.price.trim() ? `$${draft.price.trim()}` : 'No price'
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

// The summary first: the count, and each part's icon with its price to hold against the quote.
// "Fix parts" or an icon opens the lines one per screen, like the results.
export default function ConfirmStep({ lines, onChange, onCheck, checking, error, unreadable, onTryAnother }: Props) {
  // 'summary', or the index of the line on screen; a line that needs fixing opens at once.
  const [view, setView] = useState<'summary' | number>(() => {
    const bad = lines.findIndex((line) => !isValid(line))
    return bad === -1 ? 'summary' : bad
  })
  // Ids of the lines showing edit fields instead of the line as read.
  const [editing, setEditing] = useState<number[]>([])

  // Each line starts at the top of the screen, like turning a page.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [view])

  function update(id: number, patch: Partial<DraftLine>) {
    onChange(lines.map((line) => (line.id === id ? { ...line, ...patch } : line)))
  }

  function addLine() {
    const draft = toDraft({ part_type: 'Other', name: '', price_usd: 0 })
    draft.price = ''
    onChange([...lines, draft])
    setEditing([...editing, draft.id])
    setView(lines.length)
  }

  function remove(index: number) {
    const id = lines[index].id
    onChange(lines.filter((line) => line.id !== id))
    setEditing(editing.filter((e) => e !== id))
    setView(lines.length === 1 ? 'summary' : Math.min(index, lines.length - 2))
  }

  if (unreadable) {
    return (
      <section className="card">
        <p className="lead unreadable">{unreadable}</p>
        <div className="actions">
          <button className="secondary" onClick={addLine}>
            + Add by hand
          </button>
          <button className="primary" onClick={onTryAnother}>
            Try again
          </button>
        </div>
      </section>
    )
  }

  const icons = lines.map((line) => ({
    type: line.part_type,
    label: `${PART_LABEL[line.part_type]}, ${line.name || 'no name'}, ${price(line)}`,
    problem: !isValid(line),
  }))

  if (view === 'summary' || view >= lines.length) {
    const needFixing = lines.filter((line) => !isValid(line)).length
    const lead =
      lines.length === 0
        ? 'No parts yet. Add one.'
        : needFixing > 0
          ? `${needFixing} ${needFixing === 1 ? 'part needs' : 'parts need'} a name or price.`
          : `We read ${lines.length} ${lines.length === 1 ? 'part' : 'parts'}. Look right?`
    return (
      <section className="card">
        <p className={error ? 'lead error' : 'lead'}>{error ?? lead}</p>
        <PartIcons
          items={icons.map((icon, i) => ({ ...icon, caption: price(lines[i]) }))}
          onSelect={setView}
          onAdd={addLine}
        />
        <div className="actions">
          {lines.length > 0 && (
            <button className="secondary" onClick={() => setView(0)}>
              Fix parts
            </button>
          )}
          <button
            className="primary"
            disabled={lines.length === 0 || needFixing > 0 || checking}
            onClick={onCheck}
          >
            {checking ? 'Checking…' : 'Check prices'}
          </button>
        </div>
      </section>
    )
  }

  const index = view
  const line = lines[index]
  const isEditing = editing.includes(line.id)
  const last = index === lines.length - 1

  return (
    <section aria-label={`Line ${index + 1} of ${lines.length}`}>
      <PartIcons items={icons} current={index} onSelect={setView} small />
      {isEditing ? (
        <article className="card part-card">
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
            Name
            <textarea
              rows={2}
              value={line.name}
              placeholder="e.g. Corsair RM650e"
              onChange={(e) => update(line.id, { name: e.target.value.replace(/\n/g, ' ') })}
            />
          </label>
          <label className="field">
            Price ($)
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
            <button className="secondary danger" onClick={() => remove(index)}>
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
        </article>
      ) : (
        <>
          <article className="card part-card">
            <p className="card-context">
              <PartIcon type={line.part_type} />
              {PART_LABEL[line.part_type]}
            </p>
            {/* The user's line as read: their quote, not the app's words, so not counted. */}
            <p className="part-name" data-words="skip">
              {line.name || 'No name'}
            </p>
            <div className="part-price-row">
              <span className="part-price" data-words="skip">
                {price(line)}
              </span>
              <button className="secondary" onClick={() => setEditing([...editing, line.id])}>
                Fix
              </button>
            </div>
            {!isValid(line) && <p className="hint">Needs fixing.</p>}
          </article>
          <div className="pager">
            <button className="secondary" onClick={() => setView(index === 0 ? 'summary' : index - 1)}>
              Back
            </button>
            <button className="primary" onClick={() => setView(last ? 'summary' : index + 1)}>
              {last ? 'Done' : 'Next'}
            </button>
          </div>
        </>
      )}
    </section>
  )
}
