// Breadcrumb navigation component for hierarchical browsing
// Displays path: Home → Category → Place → Scenario

import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb ({ items }: BreadcrumbProps) {
  return (
    <nav className="text-xs font-medium uppercase tracking-widest text-text-muted">
      {items.map((item, index) => (
        <span key={item.label}>
          {index > 0 && <span className="mx-2">/</span>}
          {item.href ? (
            <Link
              href={item.href}
              className="transition-colors hover:text-text-main"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-text-main">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
