import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PaginationControlsProps {
  page: number
  totalPages: number
  totalItems: number
  startIndex: number
  endIndex: number
  basePath?: string
  className?: string
}

function createPageNumbers (page: number, totalPages: number) {
  const maxButtons = 5
  const end = Math.min(totalPages, Math.max(page - 2, 1) + maxButtons - 1)
  const start = Math.max(1, Math.min(page - 2, end - maxButtons + 1))

  const values: number[] = []
  for (let current = start; current <= end; current++) {
    values.push(current)
  }

  return values
}

export function PaginationControls ({
  page,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  basePath = '/admin',
  className
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null
  }

  const pageNumbers = createPageNumbers(page, totalPages)
  const makeHref = (target: number) => `${basePath}?page=${target}`

  return (
    <div className={cn('flex flex-col gap-3 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between', className)}>
      <div>
        {startIndex}-{endIndex} of {totalItems} jobs
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {page > 1 ? (
          <Link href={makeHref(page - 1)} className="rounded-full border border-border px-3 py-1 text-text-main hover:border-text-main">
            Prev
          </Link>
        ) : (
          <span className="rounded-full border border-border/60 px-3 py-1 text-text-muted">Prev</span>
        )}

        {pageNumbers.map((value) => (
          value === page ? (
            <span key={value} className="rounded-full bg-text-main px-3 py-1 text-white">
              {value}
            </span>
          ) : (
            <Link
              key={value}
              href={makeHref(value)}
              className="rounded-full border border-border px-3 py-1 text-text-main hover:border-text-main"
            >
              {value}
            </Link>
          )
        ))}

        {page < totalPages ? (
          <Link href={makeHref(page + 1)} className="rounded-full border border-border px-3 py-1 text-text-main hover:border-text-main">
            Next
          </Link>
        ) : (
          <span className="rounded-full border border-border/60 px-3 py-1 text-text-muted">Next</span>
        )}
      </div>
    </div>
  )
}
