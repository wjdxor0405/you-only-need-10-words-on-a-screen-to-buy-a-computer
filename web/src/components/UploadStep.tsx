import { useEffect, useState } from 'react'
import { SAMPLE_QUOTE_TEXT } from '../sampleQuote'

export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

// Checked here for a quick message; the server checks again.
export function imageProblem(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return 'Use a PNG, JPEG, or WebP screenshot.'
  if (file.size > MAX_IMAGE_BYTES) return 'Over 5 MB. Try a smaller screenshot.'
  return null
}

// The chosen screenshot itself instead of its file name: no words, and easier to recognize.
function Thumbnail({ file }: { file: File }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])
  return url ? <img className="thumbnail" src={url} alt={file.name} /> : null
}

function lineCount(text: string) {
  const n = text.split('\n').filter((line) => line.trim()).length
  return `${n} ${n === 1 ? 'line' : 'lines'}`
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
// within ten words. The user's quote is kept whole but shown folded: a line count for text,
// a thumbnail for a screenshot.
export default function UploadStep({ text, onTextChange, image, onImageChange, onRead, reading, error }: Props) {
  const [dragging, setDragging] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [pasting, setPasting] = useState(text.trim() !== '')
  // A pasted quote folds into "11 lines"; "Edit" opens it again.
  const [folded, setFolded] = useState(text.trim() !== '')

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
      ? 'Reading… a few seconds.'
      : image
        ? 'Screenshot ready.'
        : pasting
          ? folded
            ? 'Quote ready.'
            : 'Paste the quote text.'
          : 'Is each price fair? See the proof.'
  const canRead = (image !== null || (pasting && text.trim() !== '')) && !reading

  return (
    <section className="card">
      <p className={problem ? 'lead error' : 'lead'} role={problem ? 'alert' : undefined}>
        {lead}
      </p>
      {pasting && !image ? (
        folded ? (
          <div className="quote-chip">
            <svg className="part-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 3h9l4 4v14H6z M15 3v4h4 M9 11h7 M9 14h7 M9 17h5" />
            </svg>
            <span className="quote-chip-count">{lineCount(text)}</span>
            <button className="secondary" disabled={reading} onClick={() => setFolded(false)}>
              Edit
            </button>
          </div>
        ) : (
          <textarea
            className="quote-text"
            aria-label="Quote text"
            data-words="skip"
            rows={8}
            autoFocus
            value={text}
            onChange={(e) => {
              onTextChange(e.target.value)
              // Fold once a paste lands; typing by hand keeps the box open.
              if ((e.nativeEvent as InputEvent).inputType === 'insertFromPaste' && e.target.value.trim()) {
                setFolded(true)
              }
            }}
          />
        )
      ) : (
        // Styled as the main button, so not counted; dropping a file on it works too.
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
          {image ? <Thumbnail file={image} /> : 'Add screenshot'}
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
            <button
              className="secondary"
              onClick={() => {
                setPasting(true)
                setFolded(false)
              }}
            >
              Paste text
            </button>
            <button
              className="secondary"
              onClick={() => {
                setFileError(null)
                onTextChange(SAMPLE_QUOTE_TEXT)
                setPasting(true)
                setFolded(true)
              }}
            >
              Try sample
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
