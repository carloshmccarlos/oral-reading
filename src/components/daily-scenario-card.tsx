// Daily scenario card component for the home page
// Displays the "Today's Scenario" with image area, title, description, and CTA

import Link from 'next/link'

interface DailyScenarioCardProps {
  scenario: {
    id: string
    slug: string
    title: string
    shortDescription: string
    categoryName: string
    placeName: string
  }
}

export function DailyScenarioCard({ scenario }: DailyScenarioCardProps) {
  const backgroundImage =
    "url(\"data:image/svg+xml;utf8,<svg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'><circle cx='50' cy='50' r='40' fill='%23D6E865' opacity='0.5'/></svg>\")"

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-[var(--radius-lg)] bg-surface md:grid-cols-2">
      {/* Image/Visual area */}
      <div
        className="relative flex min-h-[300px] items-center justify-center bg-[#EAEAEA]"
        style={{ backgroundImage, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Decorative "Today" text */}
        <span className="font-serif text-[5rem] text-white mix-blend-overlay">
          Today
        </span>
      </div>

      {/* Content area */}
      <div className="flex flex-col justify-center p-8 md:p-12">
        {/* Tag pill */}
        <span className="mb-4 inline-block w-fit rounded-full bg-bg px-3 py-1 text-xs font-semibold uppercase tracking-wide">
          Daily Scenario
        </span>

        {/* Title */}
        <h2 className="mb-4 font-serif text-2xl md:text-3xl">{scenario.title}</h2>

        {/* Description */}
        <p className="mb-6 text-text-muted">
          {scenario.shortDescription ||
            `Practice everyday English in the ${scenario.placeName.toLowerCase()}.`}
        </p>

        {/* Meta info */}
        <div className="mb-6 flex gap-4 text-sm">
          <span>
            <strong>{scenario.categoryName}</strong> · {scenario.placeName}
          </span>
        </div>

        {/* CTA Button */}
        <Link
          href={`/stories/${scenario.slug}`}
          className="inline-flex w-fit items-center justify-center rounded-pill bg-text-main px-6 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-accent hover:text-text-main"
        >
          Read Scenario
        </Link>
      </div>
    </div>
  )
}
