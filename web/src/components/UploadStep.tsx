import { useState } from 'react'
import { SAMPLE_QUOTE_TEXT } from '../sampleQuote'

export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

// Checked here for a quick message; the server checks again.
export function imageProblem(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return 'Use a PNG, JPEG, or WebP screenshot.'
  if (file.size > MAX_IMAGE_BYTES) return 'That image is over 5 MB. Try a smaller screenshot.'
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

export default function UploadStep({ text, onTextChange, image, onImageChange, onRead, reading, error }: Props) {
  const [dragging, setDragging] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  function pick(file: File | undefined) {
    if (!file) return
    const problem = imageProblem(file)
    setFileError(problem)
    onImageChange(problem ? null : file)
  }

  return (
    <section className="card">
      <h2>Upload your quote</h2>
      <p className="step-intro">Add a screenshot of the quote, or paste its text.</p>
      <label
        className={`drop-area${dragging ? ' dragging' : ''}${image ? ' has-file' : ''}`}
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
        {image ? (
          <span>
            <strong>{image.name}</strong> is ready to read.
          </span>
        ) : (
          <span>
            <strong>Choose a screenshot</strong> or drop it here
            <small>PNG, JPEG, or WebP, up to 5 MB</small>
          </span>
        )}
      </label>
      {image && (
        <button className="secondary wide" onClick={() => onImageChange(null)}>
          Remove screenshot
        </button>
      )}
      {fileError && <p className="error">{fileError}</p>}
      <p className="or">or paste the text</p>
      <textarea
        className="quote-text"
        aria-label="Quote text"
        rows={6}
        disabled={image !== null}
        placeholder={image ? 'Remove the screenshot to paste text instead.' : 'CPU: AMD Ryzen 5 7600 ... $199\nGraphics: RTX 4060 8GB ... $299\n...'}
        value={image ? '' : text}
        onChange={(e) => onTextChange(e.target.value)}
      />
      <div className="actions">
        <button
          className="secondary"
          onClick={() => {
            onImageChange(null)
            onTextChange(SAMPLE_QUOTE_TEXT)
          }}
        >
          Try a sample quote
        </button>
        <button className="primary" disabled={(!image && !text.trim()) || reading} onClick={onRead}>
          {reading ? 'Reading…' : 'Read quote'}
        </button>
      </div>
      {reading && <p className="hint">Reading your quote — this takes a few seconds.</p>}
      {error && <p className="error">{error}</p>}
    </section>
  )
}
