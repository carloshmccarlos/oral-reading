import { db, pool } from './client'
import { categories, places, scenarios } from './schema'

import scenariors from '../../../memory-bank/scenariors'

function toDisplayName (key: string) {
  const overrides: Record<string, string> = {
    BuildingsAndFacilities: 'Buildings & Facilities',
    StoresAndMarkets: 'Stores & Markets',
    FoodAndDining: 'Food & Dining',
    PublicPlaces: 'Public Places',
    SchoolAcademic: 'School & Academic',
    WorkOffices: 'Work & Offices',
    OutdoorsNature: 'Outdoors & Nature'
  }

  if (overrides[key]) {
    return overrides[key]
  }

  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .trim()
}

// Category descriptions for seeding into the database
const categoryDescriptions: Record<string, string> = {
  Home: 'The vocabulary of your daily routine. From waking up to managing chores and winding down.',
  'Buildings & Facilities': 'Navigating shared spaces in apartments, offices, and public buildings.',
  'Stores & Markets': 'Transactions, browsing, and asking for help. The language of buying things.',
  'Food & Dining': 'Ordering food, making reservations, and dining out experiences.',
  'Public Places': 'Parks, libraries, stations, and other public spaces we all share.',
  'School & Academic': 'Classroom interactions, studying, and campus life vocabulary.',
  'Work & Offices': 'Professional settings, meetings, and workplace communication.',
  Transportation: 'Getting from point A to B. Dealing with delays, tickets, and directions.',
  'Outdoors & Nature': 'Hiking, camping, and enjoying the natural world.',
  Services: 'Banks, hospitals, salons, and other service interactions.'
}

function slugify (value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\//g, ' ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function shortHash (value: string) {
  // Deterministic, small hash for stable slugs without huge URLs.
  // Not cryptographic.
  let hash = 0
  for (const char of value) {
    hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0
  }
  return Math.abs(hash).toString(36).slice(0, 6)
}

function buildScenarioTitle (seedText: string, placeName: string) {
  return `${seedText} (${placeName})`
}

async function main () {
  // This seed script mirrors the previous Prisma seed behavior, but uses Drizzle.
  // It is idempotent via ON CONFLICT upserts.
  for (const [categoryKey, categoryPlaces] of Object.entries(scenariors)) {
    const categoryName = toDisplayName(categoryKey)
    const categorySlug = slugify(categoryName)

    // Get description from the categoryDescriptions map
    const categoryDescription = categoryDescriptions[categoryName] || null

    const [categoryRow] = await db
      .insert(categories)
      .values({
        sourceKey: categoryKey,
        name: categoryName,
        slug: categorySlug,
        description: categoryDescription
      })
      .onConflictDoUpdate({
        target: categories.sourceKey,
        set: {
          name: categoryName,
          slug: categorySlug,
          description: categoryDescription,
          updatedAt: new Date()
        }
      })
      .returning()

    for (const [placeKey, scenarioSeeds] of Object.entries(categoryPlaces)) {
      const placeName = placeKey
      const placeSlug = slugify(placeName)

      const [placeRow] = await db
        .insert(places)
        .values({
          categoryId: categoryRow.id,
          sourceKey: placeKey,
          name: placeName,
          slug: placeSlug,
          description: null
        })
        .onConflictDoUpdate({
          target: [places.categoryId, places.sourceKey],
          set: {
            name: placeName,
            slug: placeSlug,
            updatedAt: new Date()
          }
        })
        .returning()

      for (const seedText of scenarioSeeds) {
        const scenarioSlug = `${categorySlug}-${placeSlug}-${shortHash(seedText)}`
        const scenarioTitle = buildScenarioTitle(seedText, placeName)

        await db
          .insert(scenarios)
          .values({
            slug: scenarioSlug,
            title: scenarioTitle,
            shortDescription: '',
            seedText,
            categoryId: categoryRow.id,
            placeId: placeRow.id
          })
          .onConflictDoUpdate({
            target: [scenarios.placeId, scenarios.seedText],
            set: {
              slug: scenarioSlug,
              title: scenarioTitle,
              categoryId: categoryRow.id,
              updatedAt: new Date()
            }
          })
      }
    }
  }

  // Basic sanity check: ensure at least one category exists after seeding.
  const sanity = await db.select().from(categories).limit(1)
  if (sanity.length === 0) {
    throw new Error('Seed failed: no categories inserted')
  }
}

main()
  .then(async () => {
    await pool.end()
  })
  .catch(async (err) => {
    console.error(err)
    await pool.end()
    process.exit(1)
  })
