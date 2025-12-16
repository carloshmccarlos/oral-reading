// Categories page - displays all categories with their places in a directory layout
// Mirrors the "Context Directory" design from memory-bank/UI/categories.html

import Link from 'next/link'
import { Breadcrumb } from '@/components/breadcrumb'
import { PlaceCard } from '@/components/place-card'
import { getCategories, getPlacesByCategory } from '@/lib/db/queries'

export const metadata = {
  title: 'Categories | Read Oral English',
}

// Category index labels for visual hierarchy
const categoryLabels: Record<string, string> = {
  Home: ' — Private Life',
  'Buildings & Facilities': ' — Shared Spaces',
  'Stores & Markets': ' — Commerce',
  'Food & Dining': ' — Eating Out',
  'Public Places': ' — Public Life',
  'School & Academic': ' — Education',
  'Work & Offices': ' — Professional',
  Transportation: ' — Transit',
  'Outdoors & Nature': ' — Nature',
  Services: ' — Services',
}



export default async function CategoriesPage() {
  // Fetch all categories from database
  const categories = await getCategories()

  // Only show a small preview set of places per category on this page.
  const maxPlacesPerCategory = 8

  // Fetch places for each category with scenario counts
  const categoriesWithPlaces = await Promise.all(
    categories.map(async (category) => {
      const places = await getPlacesByCategory(category.id)
      return { ...category, places }
    })
  )

  return (
    <div className="py-20">
      {/* Page header */}
      <section className="border-b border-text-main pb-14">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Categories' }]} />
        <h1 className="mt-4 font-serif text-5xl text-text-main md:text-6xl">
          The Context Directory
        </h1>
        <p className="mt-5 max-w-xl text-lg text-text-muted">
          Select a setting to view available scenarios. Real English happens in specific places, not
          in grammar tables.
        </p>
      </section>
      {/* Category sections */}
      {categoriesWithPlaces.map((category, index) => (
        <section
          key={category.id}
          className={`py-16 ${index < categoriesWithPlaces.length - 1 ? 'border-b border-border' : ''}`}
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_2.5fr] lg:gap-16">
            {/* Left: Category label */}
            <div className="relative">
              <span className="mb-2 block font-serif text-base italic text-text-muted">
                {categoryLabels[category.name] ||
                  `${String(index + 1).padStart(2, '0')} — Category`}
              </span>
              <h2 className="mb-4 text-4xl font-normal">{category.name}</h2>
              <p className="max-w-[280px] text-[0.95rem] leading-relaxed text-text-muted">
                {category.description || 'Explore scenarios in this category.'}
              </p>
            </div>

            {/* Right: Places grid */}
            <div>
              <div className="mb-4 flex items-center justify-end">
                <Link
                  href={`/scenarios?category=${category.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-text-main underline underline-offset-4 hover:text-text-body"
                >
                  View all
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {category.places.slice(0, maxPlacesPerCategory).map((place, placeIndex) => (
                  <PlaceCard
                    key={place.id}
                    name={place.name}
                    slug={place.slug}
                    categorySlug={category.slug}
                    scenarioCount={place.scenarioCount}
                    isPopular={placeIndex === 0 && place.scenarioCount > 3}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA Box */}
      <div className="mt-8 rounded-sm bg-text-main p-16 text-center text-bg">
        <h2 className="mb-4 font-serif text-4xl">Don&apos;t see a context?</h2>
        <p className="mb-8 text-[#999]">We add new scenarios weekly based on user requests.</p>
        <Link
          href="/about"
          className="inline-block rounded-pill bg-accent px-8 py-4 font-semibold text-text-main transition-colors hover:bg-accent-hover"
        >
          Request a Topic
        </Link>
      </div>

      {/* Close the page wrapper opened at the start of the return block */}
    </div>

  )
}
