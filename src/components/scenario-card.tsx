// Scenario card component for displaying scenarios in the places/scenarios listing
// Shows title, description, tags, and meta info with hover effects

import Link from 'next/link'

interface ScenarioCardProps {
  slug: string
  title: string
  shortDescription: string
  categoryName: string
  placeName: string
  readTime?: string
  difficulty?: string
}

export function ScenarioCard ({
  slug,
  title,
  shortDescription,
  categoryName,
  placeName,
  readTime = '4 min',
  difficulty = 'Beginner'
}: ScenarioCardProps) {
  return (
    <Link
      href={`/stories/${slug}`}
      className="group flex min-h-[320px] cursor-pointer flex-col justify-between rounded-sm border border-border bg-white p-8 transition-all duration-400 hover:-translate-y-1 hover:border-text-main hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
    >
      <div className="mb-4">
        {/* Tags row */}
        <div className="mb-6 flex gap-2">
          <span className="rounded bg-bg px-2 py-1 text-[0.7rem] font-semibold uppercase tracking-wide">
            {categoryName}
          </span>
          <span className="rounded bg-bg px-2 py-1 text-[0.7rem] font-semibold uppercase tracking-wide">
            {placeName}
          </span>
        </div>

        <h3 className="mb-4 font-serif text-[1.75rem] leading-tight">{title}</h3>

        <p className="text-[0.95rem] leading-relaxed text-text-muted">
          {shortDescription || 'A realistic scenario to practice everyday English.'}
        </p>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-bg pt-6">
        <div className="flex gap-4 text-sm font-medium text-text-muted">
          <span>⏱ {readTime}</span>
          <span>⚡ {difficulty}</span>
        </div>

        {/* Read button circle */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg transition-all duration-300 group-hover:-rotate-45 group-hover:bg-accent">
          →
        </div>
      </div>
    </Link>
  )
}
