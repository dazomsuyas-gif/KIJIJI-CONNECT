import { Link } from 'react-router-dom'

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav className="ui-breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => <span key={item.label}>{index > 0 && <span aria-hidden="true"> / </span>}{item.href ? <Link to={item.href}>{item.label}</Link> : <strong aria-current="page">{item.label}</strong>}</span>)}
    </nav>
  )
}
