export type Step = 'upload' | 'confirm' | 'results'

const STEPS: { id: Step; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'confirm', label: 'Confirm' },
  { id: 'results', label: 'Results' },
]

interface Props {
  current: Step
  onGo: (step: Step) => void
}

// Three dots and the current step's name: one word on every screen instead of seven.
// Earlier steps' dots can be tapped to go back; later ones cannot.
export default function StepBar({ current, onGo }: Props) {
  const currentIndex = STEPS.findIndex((s) => s.id === current)
  return (
    <nav className="step-bar" aria-label="Steps">
      <ol>
        {STEPS.map((step, i) => {
          const state = i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'todo'
          return (
            <li key={step.id} className={`step step-${state}`}>
              <button
                disabled={state !== 'done'}
                onClick={() => onGo(step.id)}
                aria-label={`Step ${i + 1}, ${step.label}`}
                aria-current={state === 'active' ? 'step' : undefined}
              />
            </li>
          )
        })}
      </ol>
      <span className="step-name">{STEPS[currentIndex].label}</span>
    </nav>
  )
}
