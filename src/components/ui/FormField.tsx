import type { InputHTMLAttributes, ReactNode } from 'react'

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: ReactNode
  error?: string
}

export function FormField({ label, hint, error, id, ...props }: FormFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  return (
    <label className="ui-form-field" htmlFor={fieldId}>
      <span>{label}</span>
      <input id={fieldId} aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined} aria-invalid={Boolean(error)} {...props} />
      {hint && <small id={hintId}>{hint}</small>}
      {error && <small className="ui-form-field__error" id={errorId} role="alert">{error}</small>}
    </label>
  )
}
