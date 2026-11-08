import type { ReactNode } from 'react'

export function Toast({ children, onDismiss }: { children: ReactNode; onDismiss?: () => void }) {
  return <div className="ui-toast" role="status">{children}{onDismiss && <button type="button" aria-label="Dismiss notification" onClick={onDismiss}>×</button>}</div>
}
