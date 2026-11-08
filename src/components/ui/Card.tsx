import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode
  as?: 'article' | 'section' | 'div'
}

export function Card({ as: Element = 'article', children, className = '', ...props }: CardProps) {
  return <Element className={`ui-card ${className}`.trim()} {...props}>{children}</Element>
}
