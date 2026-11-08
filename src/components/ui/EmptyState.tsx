import type { ReactNode } from 'react'

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="ui-empty-state" role="status">
      <strong>{title}</strong>
      {children && <p>{children}</p>}
      {action}
    </div>
  )
}
