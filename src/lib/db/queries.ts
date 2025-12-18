// Database query helpers for fetching categories, places, and scenarios
// These are used by server components to fetch data from the database

import { eq, count, asc, isNotNull } from 'drizzle-orm'
import { db } from './client'
import { categories, places, scenarios, stories, vocabularyItems } from './schema'

// Get data summary counts for admin dashboard
export async function getDataSummary () {
  const [
    categoryCount,
    placeCount,
    scenarioCount,
    storyCount,
    storiesWithAudio,
    vocabularyCount
  ] = await Promise.all([
    db.select({ count: count() }).from(categories),
    db.select({ count: count() }).from(places),
    db.select({ count: count() }).from(scenarios),
    db.select({ count: count() }).from(stories),
    db.select({ count: count() }).from(stories).where(isNotNull(stories.audioUrl)),
    db.select({ count: count() }).from(vocabularyItems)
  ])

  return {
    categories: categoryCount[0]?.count || 0,
    places: placeCount[0]?.count || 0,
    scenarios: scenarioCount[0]?.count || 0,
    stories: storyCount[0]?.count || 0,
    storiesWithAudio: storiesWithAudio[0]?.count || 0,
    vocabularyItems: vocabularyCount[0]?.count || 0
  }
}

// Fetch all categories with their place counts
export async function getCategories () {
  const result = await db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      description: categories.description,
      sourceKey: categories.sourceKey
    })
    .from(categories)
    .orderBy(asc(categories.name))

  return result
}

// Fetch a single category by slug
export async function getCategoryBySlug (slug: string) {
  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1)

  return result[0] || null
}

// Fetch places for a category with scenario counts
export async function getPlacesByCategory (categoryId: string) {
  const result = await db
    .select({
      id: places.id,
      slug: places.slug,
      name: places.name,
      description: places.description,
      categoryId: places.categoryId,
      scenarioCount: count(scenarios.id)
    })
    .from(places)
    .leftJoin(scenarios, eq(places.id, scenarios.placeId))
    .where(eq(places.categoryId, categoryId))
    .groupBy(places.id)
    .orderBy(asc(places.name))

  return result
}

// Fetch all places with their category info and scenario counts
export async function getAllPlaces () {
  const result = await db
    .select({
      id: places.id,
      slug: places.slug,
      name: places.name,
      description: places.description,
      categoryId: places.categoryId,
      categorySlug: categories.slug,
      categoryName: categories.name,
      scenarioCount: count(scenarios.id)
    })
    .from(places)
    .leftJoin(categories, eq(places.categoryId, categories.id))
    .leftJoin(scenarios, eq(places.id, scenarios.placeId))
    .groupBy(places.id, categories.slug, categories.name)
    .orderBy(asc(categories.name), asc(places.name))

  return result
}

// Fetch a single place by slug and category slug
export async function getPlaceBySlug (categorySlug: string, placeSlug: string) {
  const result = await db
    .select({
      id: places.id,
      slug: places.slug,
      name: places.name,
      description: places.description,
      categoryId: places.categoryId,
      categorySlug: categories.slug,
      categoryName: categories.name
    })
    .from(places)
    .innerJoin(categories, eq(places.categoryId, categories.id))
    .where(eq(places.slug, placeSlug))
    .limit(1)

  // Filter by category slug in memory since we need to join
  const filtered = result.filter(p => p.categorySlug === categorySlug)
  return filtered[0] || null
}

// Fetch scenarios for a place
export async function getScenariosByPlace (placeId: string) {
  const result = await db
    .select({
      id: scenarios.id,
      slug: scenarios.slug,
      title: scenarios.title,
      shortDescription: scenarios.shortDescription,
      categoryId: scenarios.categoryId,
      placeId: scenarios.placeId
    })
    .from(scenarios)
    .where(eq(scenarios.placeId, placeId))
    .orderBy(asc(scenarios.title))

  return result
}

// Fetch all scenarios with category and place info
export async function getAllScenarios () {
  const result = await db
    .select({
      id: scenarios.id,
      slug: scenarios.slug,
      title: scenarios.title,
      shortDescription: scenarios.shortDescription,
      categorySlug: categories.slug,
      categoryName: categories.name,
      placeSlug: places.slug,
      placeName: places.name
    })
    .from(scenarios)
    .innerJoin(categories, eq(scenarios.categoryId, categories.id))
    .innerJoin(places, eq(scenarios.placeId, places.id))
    .orderBy(asc(categories.name), asc(places.name), asc(scenarios.title))

  return result
}

export async function getScenariosByCategoryId (categoryId: string) {
  const result = await db
    .select({
      id: scenarios.id,
      slug: scenarios.slug,
      title: scenarios.title,
      shortDescription: scenarios.shortDescription,
      categorySlug: categories.slug,
      categoryName: categories.name,
      placeSlug: places.slug,
      placeName: places.name
    })
    .from(scenarios)
    .innerJoin(categories, eq(scenarios.categoryId, categories.id))
    .innerJoin(places, eq(scenarios.placeId, places.id))
    .where(eq(scenarios.categoryId, categoryId))
    .orderBy(asc(places.name), asc(scenarios.title))

  return result
}

// Fetch a single scenario by slug with full details
export async function getScenarioBySlug (slug: string) {
  const result = await db
    .select({
      id: scenarios.id,
      slug: scenarios.slug,
      title: scenarios.title,
      shortDescription: scenarios.shortDescription,
      categorySlug: categories.slug,
      categoryName: categories.name,
      placeSlug: places.slug,
      placeName: places.name,
      storyId: stories.id,
      storySlug: stories.slug,
      storyTitle: stories.title,
      storyBody: stories.body,
      audioUrl: stories.audioUrl
    })
    .from(scenarios)
    .innerJoin(categories, eq(scenarios.categoryId, categories.id))
    .innerJoin(places, eq(scenarios.placeId, places.id))
    .leftJoin(stories, eq(scenarios.id, stories.scenarioId))
    .where(eq(scenarios.slug, slug))
    .limit(1)

  return result[0] || null
}

// Fetch story by scenario slug (for the story page)
export async function getStoryByScenarioSlug (scenarioSlug: string) {
  const result = await db
    .select({
      id: stories.id,
      slug: stories.slug,
      title: stories.title,
      body: stories.body,
      audioUrl: stories.audioUrl,
      scenarioId: stories.scenarioId,
      scenarioSlug: scenarios.slug,
      scenarioTitle: scenarios.title,
      categorySlug: categories.slug,
      categoryName: categories.name,
      placeSlug: places.slug,
      placeName: places.name
    })
    .from(stories)
    .innerJoin(scenarios, eq(stories.scenarioId, scenarios.id))
    .innerJoin(categories, eq(scenarios.categoryId, categories.id))
    .innerJoin(places, eq(scenarios.placeId, places.id))
    .where(eq(scenarios.slug, scenarioSlug))
    .limit(1)

  return result[0] || null
}

export async function getVocabularyItemsByStoryId (storyId: string) {
  const result = await db
    .select({
      id: vocabularyItems.id,
      phrase: vocabularyItems.phrase,
      meaningEn: vocabularyItems.meaningEn,
      meaningZh: vocabularyItems.meaningZh,
      type: vocabularyItems.type,
      storyId: vocabularyItems.storyId
    })
    .from(vocabularyItems)
    .where(eq(vocabularyItems.storyId, storyId))
    .orderBy(asc(vocabularyItems.phrase))

  return result
}

// Get today's scenario using sequential rotation based on date
// This ensures the same scenario is shown for the entire day
export async function getTodayScenario () {
  // Get all scenarios with their category and place info
  const allScenarios = await db
    .select({
      id: scenarios.id,
      slug: scenarios.slug,
      title: scenarios.title,
      shortDescription: scenarios.shortDescription,
      categoryName: categories.name,
      placeName: places.name
    })
    .from(scenarios)
    .innerJoin(categories, eq(scenarios.categoryId, categories.id))
    .innerJoin(places, eq(scenarios.placeId, places.id))
    .orderBy(asc(scenarios.id))

  if (allScenarios.length === 0) {
    return null
  }

  // Calculate which scenario to show based on the current date
  // Using days since epoch to get a consistent index for each day
  const today = new Date()
  const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24))
  const scenarioIndex = daysSinceEpoch % allScenarios.length

  return allScenarios[scenarioIndex]
}
