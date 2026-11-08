export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="ui-stepper" aria-label="Progress">
      {steps.map((step, index) => (
        <li key={step} className={index <= current ? 'is-complete' : ''} aria-current={index === current ? 'step' : undefined}>
          <span>{index + 1}</span>{step}
        </li>
      ))}
    </ol>
  )
}
