'use client'

import Link from 'next/link'
import * as React from 'react'

interface ScenarioListItem {
  id: string
  slug: string
  title: string
  shortDescription: string
  categorySlug: string
  categoryName: string
  placeSlug: string
  placeName: string
}

interface CategoryListItem {
  id: string
  slug: string
  name: string
}

interface PlaceListItem {
  id: string
  slug: string
  name: string
  scenarioCount: number
}

export interface ScenariosExplorerProps {
  category: CategoryListItem
  places: PlaceListItem[]
  scenarios: ScenarioListItem[]
}

function getBreadcrumbItemKey (item: { label: string, href?: string }, index: number) {
  if (item.href) {
    return `${item.href}::${item.label}`
  }
  return `${item.label}::${index}`
}

function BreadcrumbNav ({ items }: { items: Array<{ label: string, href?: string }> }) {
  return (
    <nav className="text-xs font-medium uppercase tracking-widest text-text-muted">
      {items.map((item, index) => (
        <span key={getBreadcrumbItemKey(item, index)}>
          {index > 0 && <span className="mx-2">/</span>}
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-text-main">
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

function ScenarioCardClient ({
  slug,
  title,
  shortDescription,
  categoryName,
  placeName,
}: {
  slug: string
  title: string
  shortDescription: string
  categoryName: string
  placeName: string
}) {
  return (
    <Link
      href={`/stories/${slug}`}
      className="group flex min-h-[320px] cursor-pointer flex-col justify-between rounded-sm border border-border bg-white p-8 transition-all duration-400 hover:-translate-y-1 hover:border-text-main hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
    >
      <div className="mb-4">
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
          <span>⏱ 4 min</span>
          <span>⚡ Beginner</span>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg transition-all duration-300 group-hover:-rotate-45 group-hover:bg-accent">
          →
        </div>
      </div>
    </Link>
  )
}

function readFiltersFromLocation () {
  if (typeof window === 'undefined') {
    return { placeSlug: null as string | null }
  }

  const url = new URL(window.location.href)
  const placeSlug = url.searchParams.get('place')

  return {
    placeSlug: placeSlug || null,
  }
}

function writeFiltersToUrl ({
  categorySlug,
  placeSlug,
}: {
  categorySlug: string
  placeSlug: string | null
}) {
  // Keep the URL in sync without triggering a Next.js navigation.
  // This preserves shareable links while avoiding extra DB fetches.
  const url = new URL(window.location.href)

  url.searchParams.set('category', categorySlug)

  if (placeSlug) {
    url.searchParams.set('place', placeSlug)
  } else {
    url.searchParams.delete('place')
  }

  const query = url.searchParams.toString()
  const newUrl = `${url.pathname}${query ? `?${query}` : ''}`

  if (newUrl === `${window.location.pathname}${window.location.search}`) {
    return
  }

  window.history.replaceState(null, '', newUrl)
}

export function ScenariosExplorer ({ category, places, scenarios }: ScenariosExplorerProps) {

  const [hasInitializedFromUrl, setHasInitializedFromUrl] = React.useState(false)
  const [selectedPlaceSlug, setSelectedPlaceSlug] = React.useState<string | null>(null)

  React.useEffect(() => {
    const { placeSlug } = readFiltersFromLocation()
    const isValidPlace = placeSlug ? places.some((p) => p.slug === placeSlug) : true
    setSelectedPlaceSlug(isValidPlace ? placeSlug : null)
    setHasInitializedFromUrl(true)
  }, [places])

  const selectedPlace = React.useMemo(() => {
    if (!selectedPlaceSlug) {
      return null
    }

    const place = places.find((p) => p.slug === selectedPlaceSlug)
    return place || null
  }, [places, selectedPlaceSlug])

  const filteredScenarios = React.useMemo(() => {
    if (selectedPlaceSlug) {
      return scenarios.filter((s) => s.placeSlug === selectedPlaceSlug)
    }

    return scenarios
  }, [scenarios, selectedPlaceSlug])

  React.useEffect(() => {
    if (!hasInitializedFromUrl) {
      return
    }

    writeFiltersToUrl({ categorySlug: category.slug, placeSlug: selectedPlaceSlug })
  }, [hasInitializedFromUrl, category.slug, selectedPlaceSlug])

  const handlePopState = React.useCallback(() => {
    const { placeSlug } = readFiltersFromLocation()
    const isValidPlace = placeSlug ? places.some((p) => p.slug === placeSlug) : true
    setSelectedPlaceSlug(isValidPlace ? placeSlug : null)
  }, [places])

  React.useEffect(() => {
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [handlePopState])

  const breadcrumbItems: Array<{ label: string, href?: string }> = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: category.name }
  ]

  if (selectedPlace) {
    breadcrumbItems.push({ label: selectedPlace.name })
  }

  const pageTitle = selectedPlace
    ? selectedPlace.name
    : category.name

  return (
    <div className="py-20">
      <section className="border-b border-text-main pb-8">
        <Link
          href="/categories"
          className="mb-8 inline-flex items-center text-sm uppercase tracking-wide text-text-muted transition-all hover:-translate-x-1 hover:text-text-main"
        >
          ← Back to Categories
        </Link>

        <BreadcrumbNav items={breadcrumbItems} />
        <h1 className="mt-6 -ml-1 font-serif text-6xl leading-none md:text-7xl">{pageTitle}</h1>
      </section>

      <section className="py-8">
        <nav aria-label="Scenario filters" className="space-y-4">
          {places.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                key="all-places"
                type="button"
                onClick={() => {
                  setSelectedPlaceSlug(null)
                }}
                className={`whitespace-nowrap rounded-pill border px-5 py-2 text-sm transition-colors ${
                  !selectedPlaceSlug
                    ? 'border-text-main bg-text-main text-white'
                    : 'border-border bg-white text-text-muted hover:border-text-main hover:text-text-main'
                }`}
              >
                All Places
              </button>

              {places.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => {
                    setSelectedPlaceSlug(place.slug)
                  }}
                  className={`whitespace-nowrap rounded-pill border px-5 py-2 text-sm transition-colors ${
                    selectedPlaceSlug === place.slug
                      ? 'border-text-main bg-text-main text-white'
                      : 'border-border bg-white text-text-muted hover:border-text-main hover:text-text-main'
                  }`}
                >
                  {place.name}
                </button>
              ))}
            </div>
          )}
        </nav>
      </section>

      <section className="py-8">
        {filteredScenarios.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredScenarios.map((scenario) => (
              <ScenarioCardClient
                key={scenario.id}
                slug={scenario.slug}
                title={scenario.title}
                shortDescription={scenario.shortDescription}
                categoryName={scenario.categoryName}
                placeName={scenario.placeName}
              />
            ))}

            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-sm border border-dashed border-border bg-transparent p-8 text-center">
              <div className="mb-4 text-3xl">✍️</div>
              <h3 className="mb-2 font-serif text-xl">Request a Scenario</h3>
              <p className="text-sm text-text-muted">Have a specific situation you want to learn?</p>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg text-text-muted">
              No scenarios found. Try selecting a different category or place.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedPlaceSlug(null)
              }}
              className="mt-4 inline-block text-text-main underline hover:no-underline"
            >
              View all scenarios
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
