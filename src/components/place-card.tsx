// Place card component for displaying places in the categories directory
// Shows place name, scenario count, and hover effects

import Link from 'next/link'

interface PlaceCardProps {
  name: string
  slug: string
  categorySlug: string
  scenarioCount: number
  isPopular?: boolean
}

export function PlaceCard ({
  name,
  slug,
  categorySlug,
  scenarioCount,
  isPopular = false
}: PlaceCardProps) {
  return (
    <Link
      href={`/scenarios?category=${categorySlug}&place=${slug}`}
      className="group relative flex min-h-[140px] cursor-pointer flex-col justify-between overflow-hidden rounded-sm border border-border bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-text-main hover:bg-[#FAFAF8]"
    >
      {/* Popular badge */}
      {isPopular && (
        <span className="absolute right-0 top-0 rounded-bl-lg bg-accent px-2 py-1 text-[0.65rem] font-semibold">
          🔥 Popular
        </span>
      )}

      <h3 className="font-serif text-xl">{name}</h3>

      <div className="mt-auto flex items-center justify-between text-sm text-text-muted">
        <span>{scenarioCount} Scenario{scenarioCount !== 1 ? 's' : ''}</span>
        <span className="translate-x-[-10px] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          →
        </span>
      </div>
    </Link>
  )
}
