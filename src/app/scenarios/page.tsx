// Scenarios listing page with filtering by category and place
// Mirrors the layout from memory-bank/UI/places.html

import { and, asc, eq } from 'drizzle-orm'
import Link from 'next/link'
import { Breadcrumb } from '@/components/breadcrumb'
import { ScenarioCard } from '@/components/scenario-card'
import { db } from '@/lib/db/client'
import { getAllScenarios, getCategoryBySlug, getPlacesByCategory } from '@/lib/db/queries'
import { categories, places, scenarios } from '@/lib/db/schema'

export const metadata = {
  title: 'Scenarios | Read Oral English',
}

interface ScenariosPageProps {
  searchParams: Promise<{
    category?: string
    place?: string
  }>
}

export default async function ScenariosPage({ searchParams }: ScenariosPageProps) {
  const params = await searchParams
  const categorySlug = params.category
  const placeSlug = params.place

  // Build query based on filters
  // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
  let filteredScenarios

  let selectedCategory = null
  let selectedPlace = null
  let placesInCategory: Awaited<ReturnType<typeof getPlacesByCategory>> = []

  if (categorySlug) {
    selectedCategory = await getCategoryBySlug(categorySlug)

    if (selectedCategory) {
      placesInCategory = await getPlacesByCategory(selectedCategory.id)

      if (placeSlug) {
        // Find the selected place
        selectedPlace = placesInCategory.find((p) => p.slug === placeSlug) || null

        if (selectedPlace) {
          // Filter by both category and place
          filteredScenarios = await db
            .select({
              id: scenarios.id,
              slug: scenarios.slug,
              title: scenarios.title,
              shortDescription: scenarios.shortDescription,
              categorySlug: categories.slug,
              categoryName: categories.name,
              placeSlug: places.slug,
              placeName: places.name,
            })
            .from(scenarios)
            .innerJoin(categories, eq(scenarios.categoryId, categories.id))
            .innerJoin(places, eq(scenarios.placeId, places.id))
            .where(
              and(
                eq(scenarios.categoryId, selectedCategory.id),
                eq(scenarios.placeId, selectedPlace.id)
              )
            )
            .orderBy(asc(scenarios.title))
        } else {
          // Place not found, show all in category
          filteredScenarios = await db
            .select({
              id: scenarios.id,
              slug: scenarios.slug,
              title: scenarios.title,
              shortDescription: scenarios.shortDescription,
              categorySlug: categories.slug,
              categoryName: categories.name,
              placeSlug: places.slug,
              placeName: places.name,
            })
            .from(scenarios)
            .innerJoin(categories, eq(scenarios.categoryId, categories.id))
            .innerJoin(places, eq(scenarios.placeId, places.id))
            .where(eq(scenarios.categoryId, selectedCategory.id))
            .orderBy(asc(places.name), asc(scenarios.title))
        }
      } else {
        // Filter by category only
        filteredScenarios = await db
          .select({
            id: scenarios.id,
            slug: scenarios.slug,
            title: scenarios.title,
            shortDescription: scenarios.shortDescription,
            categorySlug: categories.slug,
            categoryName: categories.name,
            placeSlug: places.slug,
            placeName: places.name,
          })
          .from(scenarios)
          .innerJoin(categories, eq(scenarios.categoryId, categories.id))
          .innerJoin(places, eq(scenarios.placeId, places.id))
          .where(eq(scenarios.categoryId, selectedCategory.id))
          .orderBy(asc(places.name), asc(scenarios.title))
      }
    } else {
      // Category not found, show all
      filteredScenarios = await getAllScenarios()
    }
  } else {
    // No filters, show all scenarios
    filteredScenarios = await getAllScenarios()
  }

  // Build breadcrumb items with explicit type for optional href
  const breadcrumbItems: Array<{ label: string; href?: string }> = [{ label: 'Home', href: '/' }]
  if (selectedCategory) {
    breadcrumbItems.push({ label: 'Categories', href: '/categories' })
    breadcrumbItems.push({
      label: selectedCategory.name,
      href: `/scenarios?category=${selectedCategory.slug}`,
    })
  }
  if (selectedPlace) {
    breadcrumbItems.push({ label: selectedPlace.name })
  } else if (!selectedCategory) {
    breadcrumbItems.push({ label: 'Scenarios' })
  }

  // Page title based on filters
  const pageTitle = selectedPlace
    ? selectedPlace.name
    : selectedCategory
      ? selectedCategory.name
      : 'All Scenarios'

  const pageDescription = selectedPlace
    ? `Explore scenarios set in ${selectedPlace.name}. Practice real English in context.`
    : selectedCategory
      ? `Browse all places and scenarios in the ${selectedCategory.name} category.`
      : 'Pick a category and place to see scenario cards.'

  return (
    <div className="py-20">
      {/* Place/Category Hero */}
      <section className="border-b border-text-main pb-8">
        {/* Back link when filtered */}
        {selectedCategory && (
          <Link
            href={selectedPlace ? `/scenarios?category=${selectedCategory.slug}` : '/categories'}
            className="mb-8 inline-flex items-center text-sm uppercase tracking-wide text-text-muted transition-all hover:-translate-x-1 hover:text-text-main"
          >
            ← Back to {selectedPlace ? selectedCategory.name : 'Categories'}
          </Link>
        )}

        <Breadcrumb items={breadcrumbItems} />

        <div className="mt-6 grid grid-cols-1 items-end gap-8 md:grid-cols-[1.5fr_1fr]">
          <h1 className="-ml-1 font-serif text-6xl leading-none md:text-7xl">{pageTitle}</h1>
          <p className="pb-2 text-lg text-text-muted">{pageDescription}</p>
        </div>
      </section>

      {/* Filter Bar */}
      {/* <div className="flex gap-4 overflow-x-auto border-b border-border py-6">
        <Link
          href="/scenarios"
          className={`whitespace-nowrap rounded-pill border px-5 py-2 text-sm transition-colors ${
            !categorySlug
              ? 'border-text-main bg-text-main text-white'
              : 'border-border bg-transparent hover:border-text-main hover:bg-white'
          }`}
        >
          All Scenarios
        </Link>

        {allCategories.map((cat) => (
          <Link
            key={cat.id}
            href={`/scenarios?category=${cat.slug}`}
            className={`whitespace-nowrap rounded-pill border px-5 py-2 text-sm transition-colors ${
              categorySlug === cat.slug
                ? 'border-text-main bg-text-main text-white'
                : 'border-border bg-transparent hover:border-text-main hover:bg-white'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>*/}

      {/* Scenarios Grid */}
      <section className="py-8">
        {filteredScenarios.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredScenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                slug={scenario.slug}
                title={scenario.title}
                shortDescription={scenario.shortDescription}
                categoryName={scenario.categoryName}
                placeName={scenario.placeName}
              />
            ))}

            {/* Request scenario card */}
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-sm border border-dashed border-border bg-transparent p-8 text-center">
              <div className="mb-4 text-3xl">✍️</div>
              <h3 className="mb-2 font-serif text-xl">Request a Scenario</h3>
              <p className="text-sm text-text-muted">
                Have a specific situation you want to learn?
              </p>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg text-text-muted">
              No scenarios found. Try selecting a different category or place.
            </p>
            <Link
              href="/scenarios"
              className="mt-4 inline-block text-text-main underline hover:no-underline"
            >
              View all scenarios
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
