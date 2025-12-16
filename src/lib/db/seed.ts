import { db, pool } from './client'
import { and, eq } from 'drizzle-orm'
import { categories, places, scenarios, stories, vocabularyItems } from './schema'

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

function getPilotStorySeed () {
  // Phase 6 pilot content:
  // - Provides one real story body (stored as Markdown) so the Story page and vocabulary UI are testable.
  // - Links to an existing scenario seed in the scenario bank.
  return {
    categoryKey: 'Home',
    placeKey: 'Bedroom',
    seedText: 'Searching for a lost item',
    title: 'Where did I put those keys?',
    body: `I checked my phone. 8:15 AM. *I am definitely going to be late.*

I grabbed my backpack from the floor and swung it over my shoulder. Everything was ready—laptop, charger, lunch. But as I reached for the door handle, I realized my pockets felt light. Too light.

I patted my jeans. Nothing. *Seriously? Not today.*

I dropped my bag and ran back to the bedroom. I started to rummage through the mess on my dresser. Old receipts, loose change, a few hair ties... but no keys.

*Okay, retrace your steps,* I told myself. I came in last night, tossed my jacket on the chair, and...

I dashed over to the chair and checked the jacket pockets. I pulled the pockets inside out. Empty. I felt a wave of heat rise up my neck.

"Where on earth did I put them?" I muttered under my breath.

I got down on my knees to peer under the bed. Maybe they fell off the nightstand? All I saw were dust bunnies and an old sock. I stood up and scanned the room one more time.

Then, I saw a glint of metal. They were sticking out from under yesterday's jeans on the floor.

I snatched them up, let out a huge sigh of relief, and ran for the door.`
  }
}

function getPilotVocabularyItems () {
  // Phase 6 pilot vocabulary:
  // These phrases are present in the pilot story body and should be highlighted at render time.
  return [
    {
      phrase: 'rummage through',
      meaningEn: 'To search for something by moving things around carelessly.',
      meaningZh: '翻找 / 翻箱倒柜',
      type: 'phrasal verb'
    },
    {
      phrase: 'came in',
      meaningEn: 'To enter a room or building.',
      meaningZh: '进门 / 进来',
      type: 'phrasal verb'
    },
    {
      phrase: 'dashed over',
      meaningEn: 'To run or move somewhere very quickly.',
      meaningZh: '冲过去',
      type: 'phrasal verb'
    },
    {
      phrase: 'muttered',
      meaningEn: 'To speak quietly so that it is difficult for others to hear, often when complaining.',
      meaningZh: '嘀咕 / 喃喃自语',
      type: 'verb'
    },
    {
      phrase: 'peer under',
      meaningEn: 'To look closely or carefully at something, especially when it is hard to see.',
      meaningZh: '往...底下窥视',
      type: 'phrasal verb'
    },
    {
      phrase: 'scanned the room',
      meaningEn: 'To look through a place quickly to find something.',
      meaningZh: '扫视房间',
      type: 'phrase'
    },
    {
      phrase: 'sticking out',
      meaningEn: 'To extend beyond the surface or edge of something; to be visible.',
      meaningZh: '伸出 / 露出来',
      type: 'phrasal verb'
    },
    {
      phrase: 'snatched them up',
      meaningEn: 'To take something quickly and roughly.',
      meaningZh: '一把抓起',
      type: 'phrase'
    }
  ]
}

async function main () {
  // This seed script mirrors the previous Prisma seed behavior, but uses Drizzle.
  // It is idempotent via ON CONFLICT upserts.
  const pilot = getPilotStorySeed()
  const pilotVocab = getPilotVocabularyItems()

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

        if (categoryKey === pilot.categoryKey && placeKey === pilot.placeKey && seedText === pilot.seedText) {
          const [scenarioRow] = await db
            .select({
              id: scenarios.id,
              slug: scenarios.slug,
              title: scenarios.title
            })
            .from(scenarios)
            .where(and(eq(scenarios.placeId, placeRow.id), eq(scenarios.seedText, seedText)))
            .limit(1)

          if (!scenarioRow) {
            throw new Error('Pilot seed failed: scenario row not found after upsert')
          }

          const [storyRow] = await db
            .insert(stories)
            .values({
              slug: scenarioRow.slug,
              title: pilot.title,
              body: pilot.body,
              audioUrl: null,
              scenarioId: scenarioRow.id
            })
            .onConflictDoUpdate({
              target: stories.scenarioId,
              set: {
                slug: scenarioRow.slug,
                title: pilot.title,
                body: pilot.body,
                audioUrl: null,
                updatedAt: new Date()
              }
            })
            .returning({
              id: stories.id
            })

          for (const vocab of pilotVocab) {
            await db
              .insert(vocabularyItems)
              .values({
                storyId: storyRow.id,
                phrase: vocab.phrase,
                meaningEn: vocab.meaningEn,
                meaningZh: vocab.meaningZh,
                type: vocab.type
              })
              .onConflictDoUpdate({
                target: [vocabularyItems.storyId, vocabularyItems.phrase],
                set: {
                  meaningEn: vocab.meaningEn,
                  meaningZh: vocab.meaningZh,
                  type: vocab.type,
                  updatedAt: new Date()
                }
              })
          }
        }
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
