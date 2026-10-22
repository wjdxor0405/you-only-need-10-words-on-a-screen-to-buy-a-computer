import { SAMPLE_QUOTE_TEXT } from '../sampleQuote'

interface Props {
  text: string
  onTextChange: (text: string) => void
  onRead: () => void
  reading: boolean
  error: string | null
}

export default function UploadStep({ text, onTextChange, onRead, reading, error }: Props) {
  return (
    <section className="card">
      <h2>Upload your quote</h2>
      <p className="muted">Paste the quote exactly as you got it. We'll pull out each part and its price for you to check.</p>
      <textarea
        className="quote-text"
        aria-label="Quote text"
        rows={10}
        placeholder={'CPU: AMD Ryzen 5 7600 ... $199\nGraphics: RTX 4060 8GB ... $299\n...'}
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
      />
      <div className="actions">
        <button className="link-button" onClick={() => onTextChange(SAMPLE_QUOTE_TEXT)}>
          Try a sample quote
        </button>
        <button className="primary" disabled={!text.trim() || reading} onClick={onRead}>
          {reading ? 'Reading…' : 'Read quote'}
        </button>
      </div>
      {reading && <p className="hint">Reading your quote — this takes a few seconds.</p>}
      {error && <p className="error">{error}</p>}
    </section>
  )
}
