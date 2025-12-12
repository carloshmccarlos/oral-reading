// Places listing page with filtering by category
// Shows all places grouped by category or filtered by a specific category

import Link from 'next/link'
import { Breadcrumb } from '@/components/breadcrumb'
import { PlaceCard } from '@/components/place-card'
import { getCategories, getAllPlaces, getCategoryBySlug, getPlacesByCategory } from '@/lib/db/queries'

export const metadata = {
  title: 'Places | Read Oral English'
}

interface PlacesPageProps {
  searchParams: Promise<{
    category?: string
  }>
}

export default async function PlacesPage ({ searchParams }: PlacesPageProps) {
  const params = await searchParams
  const categorySlug = params.category

  // Fetch all categories for filter display
  const allCategories = await getCategories()

  let places
  let selectedCategory = null

  if (categorySlug) {
    selectedCategory = await getCategoryBySlug(categorySlug)
    if (selectedCategory) {
      places = await getPlacesByCategory(selectedCategory.id)
    } else {
      places = await getAllPlaces()
    }
  } else {
    places = await getAllPlaces()
  }

  // Build breadcrumb items with explicit type for optional href
  const breadcrumbItems: Array<{ label: string; href?: string }> = [
    { label: 'Home', href: '/' },
    { label: 'Places' }
  ]

  if (selectedCategory) {
    breadcrumbItems.pop()
    breadcrumbItems.push({ label: 'Places', href: '/places' })
    breadcrumbItems.push({ label: selectedCategory.name })
  }

  return (
    <div className="py-20">
      {/* Page header */}
      <section className="border-b border-text-main pb-14">
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="mt-4 font-serif text-5xl text-text-main md:text-6xl">
          {selectedCategory ? selectedCategory.name : 'All Places'}
        </h1>
        <p className="mt-5 max-w-xl text-lg text-text-muted">
          {selectedCategory
            ? `Browse places in the ${selectedCategory.name} category.`
            : 'Browse all places and filter by category to find scenarios.'}
        </p>
      </section>

      {/* Category filter bar */}
      <div className="flex gap-4 overflow-x-auto border-b border-border py-6">
        <Link
          href="/places"
          className={`whitespace-nowrap rounded-pill border px-5 py-2 text-sm transition-colors ${
            !categorySlug
              ? 'border-text-main bg-text-main text-white'
              : 'border-border bg-transparent hover:border-text-main hover:bg-white'
          }`}
        >
          All Places
        </Link>

        {allCategories.map((cat) => (
          <Link
            key={cat.id}
            href={`/places?category=${cat.slug}`}
            className={`whitespace-nowrap rounded-pill border px-5 py-2 text-sm transition-colors ${
              categorySlug === cat.slug
                ? 'border-text-main bg-text-main text-white'
                : 'border-border bg-transparent hover:border-text-main hover:bg-white'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Places grid */}
      <section className="py-16">
        {places.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {places.map((place) => {
              // Handle both query result shapes (getAllPlaces vs getPlacesByCategory)
              const catSlug = 'categorySlug' in place
                ? (place.categorySlug as string | null)
                : selectedCategory?.slug
              const catName = 'categoryName' in place
                ? (place.categoryName as string | null)
                : selectedCategory?.name

              return (
                <div key={place.id} className="flex flex-col">
                  <PlaceCard
                    name={place.name}
                    slug={place.slug}
                    categorySlug={catSlug || ''}
                    scenarioCount={place.scenarioCount}
                  />
                  {/* Show category label when viewing all places */}
                  {!selectedCategory && catName && (
                    <span className="mt-2 text-xs text-text-muted">
                      {catName}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg text-text-muted">
              No places found. Try selecting a different category.
            </p>
            <Link
              href="/places"
              className="mt-4 inline-block text-text-main underline hover:no-underline"
            >
              View all places
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
