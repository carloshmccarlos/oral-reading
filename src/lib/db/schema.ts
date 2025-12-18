    import crypto from 'node:crypto'

import { relations } from 'drizzle-orm'
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique
} from 'drizzle-orm/pg-core'

// This schema mirrors the existing Prisma schema models so we can migrate to Drizzle
// without changing domain concepts (Category -> Place -> Scenario -> Story -> VocabularyItem).

export const categories = pgTable('categories', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  sourceKey: text('source_key').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
})

export const places = pgTable(
  'places',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    sourceKey: text('source_key').notNull(),
    categoryId: text('category_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    unique('places_category_source_key_unique').on(table.categoryId, table.sourceKey),
    unique('places_category_slug_unique').on(table.categoryId, table.slug)
  ]
)

export const scenarios = pgTable(
  'scenarios',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    shortDescription: text('short_description').notNull().default(''),
    seedText: text('seed_text').notNull(),
    categoryId: text('category_id').notNull(),
    placeId: text('place_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index('scenarios_category_id_idx').on(table.categoryId),
    index('scenarios_place_id_idx').on(table.placeId),
    unique('scenarios_place_seed_text_unique').on(table.placeId, table.seedText)
  ]
)

export const stories = pgTable(
  'stories',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    body: text('body').notNull().default(''),
    audioUrl: text('audio_url'),
    scenarioId: text('scenario_id').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
  }
)

export const vocabularyItems = pgTable(
  'vocabulary_items',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    phrase: text('phrase').notNull(),
    meaningEn: text('meaning_en').notNull(),
    meaningZh: text('meaning_zh'),
    type: text('type'),
    storyId: text('story_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index('vocabulary_items_story_id_idx').on(table.storyId),
    unique('vocabulary_items_story_phrase_unique').on(table.storyId, table.phrase)
  ]
)

export const categoriesRelations = relations(categories, ({ many }) => ({
  places: many(places),
  scenarios: many(scenarios)
}))

export const placesRelations = relations(places, ({ one, many }) => ({
  category: one(categories, {
    fields: [places.categoryId],
    references: [categories.id]
  }),
  scenarios: many(scenarios)
}))

export const scenariosRelations = relations(scenarios, ({ one }) => ({
  category: one(categories, {
    fields: [scenarios.categoryId],
    references: [categories.id]
  }),
  place: one(places, {
    fields: [scenarios.placeId],
    references: [places.id]
  }),
  story: one(stories, {
    fields: [scenarios.id],
    references: [stories.scenarioId]
  })
}))

export const storiesRelations = relations(stories, ({ one, many }) => ({
  scenario: one(scenarios, {
    fields: [stories.scenarioId],
    references: [scenarios.id]
  }),
  vocabularyItems: many(vocabularyItems)
}))

export const vocabularyItemsRelations = relations(vocabularyItems, ({ one }) => ({
  story: one(stories, {
    fields: [vocabularyItems.storyId],
    references: [stories.id]
  })
}))

// Story generation job tracking table for cron pipeline
export const storyGenerationJobs = pgTable(
  'story_generation_jobs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    scenarioId: text('scenario_id').notNull().unique(),
    status: text('status').notNull().default('queued'), // queued | running | succeeded | failed
    attemptCount: integer('attempt_count').notNull().default(0),
    lockedAt: timestamp('locked_at', { withTimezone: true }),
    lockedBy: text('locked_by'),
    lastError: text('last_error'),
    lastAttemptAt: timestamp('last_attempt_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index('story_generation_jobs_status_idx').on(table.status)
  ]
)

export const storyGenerationJobsRelations = relations(storyGenerationJobs, ({ one }) => ({
  scenario: one(scenarios, {
    fields: [storyGenerationJobs.scenarioId],
    references: [scenarios.id]
  })
}))
