import { useState } from 'react'
import { SAMPLE_QUOTE_TEXT } from '../sampleQuote'

export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

// Checked here for a quick message; the server checks again.
export function imageProblem(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return 'Use a PNG, JPEG, or WebP screenshot.'
  if (file.size > MAX_IMAGE_BYTES) return 'Over 5 MB. Try a smaller screenshot.'
  return null
}

interface Props {
  text: string
  onTextChange: (text: string) => void
  image: File | null
  onImageChange: (image: File | null) => void
  onRead: () => void
  reading: boolean
  error: string | null
}

// One lead line carries the state (explanation, ready, reading, or error), so the screen stays
// within ten words; everything else is a button or the user's own quote.
export default function UploadStep({ text, onTextChange, image, onImageChange, onRead, reading, error }: Props) {
  const [dragging, setDragging] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [pasting, setPasting] = useState(text.trim() !== '')

  function pick(file: File | undefined) {
    if (!file) return
    const problem = imageProblem(file)
    setFileError(problem)
    onImageChange(problem ? null : file)
    if (!problem) setPasting(false)
  }

  const problem = fileError ?? error
  const lead = problem
    ? problem
    : reading
      ? 'Reading… this takes a few seconds.'
      : image
        ? 'Screenshot ready.'
        : pasting
          ? 'Paste the quote text.'
          : 'Is each price fair? See the proof.'
  const canRead = (image !== null || (pasting && text.trim() !== '')) && !reading

  return (
    <section className="card">
      <p className={problem ? 'lead error' : 'lead'} role={problem ? 'alert' : undefined}>
        {lead}
      </p>
      {pasting && !image ? (
        <textarea
          className="quote-text"
          aria-label="Quote text"
          data-words="skip"
          rows={8}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
        />
      ) : (
        // Styled as the main button; dropping a file on it works too.
        <label
          className={`drop-area${dragging ? ' dragging' : ''}${image ? ' has-file' : ''}`}
          data-words="skip"
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            pick(e.dataTransfer.files[0])
          }}
        >
          <input
            type="file"
            accept={IMAGE_TYPES.join(',')}
            className="visually-hidden"
            onChange={(e) => {
              pick(e.target.files?.[0])
              e.target.value = ''
            }}
          />
          {image ? image.name : 'Choose a screenshot'}
        </label>
      )}
      <div className="actions">
        {image ? (
          <button className="secondary" onClick={() => onImageChange(null)}>
            Remove
          </button>
        ) : pasting ? (
          <button className="secondary" onClick={() => setPasting(false)}>
            Back
          </button>
        ) : (
          <>
            <button className="secondary" onClick={() => setPasting(true)}>
              Paste text
            </button>
            <button
              className="secondary"
              onClick={() => {
                setFileError(null)
                onTextChange(SAMPLE_QUOTE_TEXT)
                setPasting(true)
              }}
            >
              Try a sample quote
            </button>
          </>
        )}
        {(image || pasting) && (
          <button className="primary" disabled={!canRead} onClick={onRead}>
            {reading ? 'Reading…' : 'Read quote'}
          </button>
        )}
      </div>
    </section>
  )
}
