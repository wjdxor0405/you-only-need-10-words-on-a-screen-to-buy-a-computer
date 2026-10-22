export type Step = 'upload' | 'confirm' | 'results'

const STEPS: { id: Step; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'confirm', label: 'Confirm parts' },
  { id: 'results', label: 'Results' },
]

interface Props {
  current: Step
  onGo: (step: Step) => void
}

// Earlier steps can be clicked to go back; later ones cannot.
export default function StepBar({ current, onGo }: Props) {
  const currentIndex = STEPS.findIndex((s) => s.id === current)
  return (
    <ol className="step-bar">
      {STEPS.map((step, i) => {
        const state = i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'todo'
        return (
          <li key={step.id} className={`step step-${state}`}>
            <button disabled={state !== 'done'} onClick={() => onGo(step.id)} aria-current={state === 'active' ? 'step' : undefined}>
              <span className="step-number">{i + 1}</span>
              {step.label}
            </button>
          </li>
        )
      })}
    </ol>
  )
}
