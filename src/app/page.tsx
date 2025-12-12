// Home page - main landing page with hero, daily scenario, and category grid
// Mirrors the design from memory-bank/UI/home.html

import Link from 'next/link'
import { CategoryCard } from '@/components/category-card'
import { DailyScenarioCard } from '@/components/daily-scenario-card'
import { Marquee } from '@/components/marquee'
import { Button } from '@/components/ui'
import { getCategories, getTodayScenario } from '@/lib/db/queries'

export default async function Home() {
  // Fetch categories and today's scenario from database
  const categories = await getCategories()
  const todayScenario = await getTodayScenario()

  // Category icons mapping
  const categoryIcons: Record<string, string> = {
    Home: '🏠',
    'Buildings & Facilities': '🏢',
    'Stores & Markets': '🛍️',
    'Food & Dining': '🍽️',
    'Public Places': '🏛️',
    'School & Academic': '📚',
    'Work & Offices': '💼',
    Transportation: '🚇',
    'Outdoors & Nature': '🌳',
    Services: '🏥',
  }

  const categoryCards = categories
    .slice(0, 8)
    .map((category, index) => (
      <CategoryCard
        key={category.id}
        name={category.name}
        slug={category.slug}
        icon={categoryIcons[category.name] || '📁'}
        index={index + 1}
      />
    ))

  return (
    <div>
      {/* Hero Section */}
      <section className="py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          {/* Hero Text */}
          <div>
            <h1 className="font-serif text-[3.5rem] leading-[1.1] lg:text-[4.5rem]">
              <span className="block text-[0.8em] italic text-text-muted">
                Don&apos;t study English.
              </span>
              Steal the Context.
            </h1>
            <p className="mt-6 max-w-[450px] text-[1.1rem] text-text-muted">
              Stop memorizing lists. Read short, realistic stories full of the micro-actions,
              inner thoughts, and casual phrases native speakers actually use.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/categories">Browse Categories</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/about">How it works</Link>
              </Button>
            </div>
          </div>

          {/* Hero Visual - Story snippet preview */}
          <div className="relative flex h-[400px] flex-col justify-center rounded-[20px] border border-text-main bg-surface p-8 shadow-[10px_10px_0px_var(--color-accent)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[12px_12px_0px_var(--color-accent)]">
            <div className="mb-4 text-xs uppercase tracking-[1px] text-text-muted">
              Scenario: Bedroom • Finding Keys
            </div>
            <p className="font-serif text-[1.8rem] leading-[1.4]">
              I sighed and began to{' '}
              <span className="cursor-pointer rounded bg-accent px-1">rummage through</span> the
              messy drawer, hoping to{' '}
              <span className="cursor-pointer rounded bg-accent px-1">spot</span> them under the
              receipts.
            </p>
            {/* Progress indicator */}
            <div className="mt-8 flex items-center gap-2 opacity-60">
              <div className="h-1 w-8 rounded-full bg-text-main" />
              <div className="h-1 flex-1 rounded-full bg-border" />
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Banner */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
        <Marquee />
      </div>

      {/* Daily Scenario Section */}
      {todayScenario && (
        <section className="my-16 md:my-24">
          <DailyScenarioCard scenario={todayScenario} />
        </section>
      )}

      {/* Category Grid Section */}
      <section className="my-16 md:my-24">
        {/* Section Header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl">Pick a Context</h2>
            <p className="mt-2 text-text-muted">
              Where do you want to be fluent today?
            </p>
          </div>
          <Link
            href="/categories"
            className="text-sm underline underline-offset-4 transition-colors hover:text-text-muted"
          >
            View all
          </Link>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{categoryCards}</div>
      </section>
    </div>
  )
}
