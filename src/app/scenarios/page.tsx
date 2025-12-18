// Scenarios listing page with filtering by category and place
// Mirrors the layout from memory-bank/UI/places.html

import { ScenariosExplorer } from '@/components/scenarios-explorer'
import { notFound, redirect } from 'next/navigation'
import {
  getCategoryBySlug,
  getPlacesByCategory,
  getScenariosByCategoryId
} from '@/lib/db/queries'

export const metadata = {
  title: 'Scenarios',
  description: 'Pick a place and start reading: short, realistic scenarios designed for oral reading and shadowing practice.',
  alternates: { canonical: '/scenarios' }
}

interface ScenariosPageProps {
  searchParams: Promise<{
    category?: string
  }>
}

export default async function ScenariosPage ({ searchParams }: ScenariosPageProps) {
  const params = await searchParams

  if (!params.category) {
    redirect('/categories')
  }

  const category = await getCategoryBySlug(params.category)
  if (!category) {
    notFound()
  }

  const [placesInCategory, scenarios] = await Promise.all([
    getPlacesByCategory(category.id),
    getScenariosByCategoryId(category.id)
  ])

  return (
    <ScenariosExplorer
      category={{ id: category.id, slug: category.slug, name: category.name }}
      places={placesInCategory.map((place) => ({
        id: place.id,
        slug: place.slug,
        name: place.name,
        scenarioCount: place.scenarioCount
      }))}
      scenarios={scenarios}
    />
  )
}
