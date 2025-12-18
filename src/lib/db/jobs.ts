// Story generation job helpers for cron pipeline
import { and, desc, eq, isNull, lt, or, sql } from 'drizzle-orm'
import { db } from './client'
import {
  categories,
  places,
  scenarios,
  stories,
  storyGenerationJobs,
  vocabularyItems
} from './schema'

// Max retry attempts for failed jobs
const MAX_ATTEMPTS = 5

// Lock timeout in minutes (stale locks older than this can be reclaimed)
const LOCK_TIMEOUT_MINUTES = 10

// Job status type
export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed'

export interface AdminJobRow {
  id: string
  scenarioId: string
  scenarioSlug: string
  scenarioTitle: string
  status: string
  attemptCount: number
  lastError: string | null
  lastAttemptAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// Scenario data needed for story generation
export interface ScenarioForGeneration {
  id: string
  slug: string
  title: string
  seedText: string
  placeName: string
  categoryName: string
}

// Create jobs for all scenarios that don't have stories yet
export async function createMissingJobs (): Promise<number> {
  // Find scenarios without stories and without existing jobs
  const missingScenarios = await db
    .select({ id: scenarios.id })
    .from(scenarios)
    .leftJoin(stories, eq(scenarios.id, stories.scenarioId))
    .leftJoin(storyGenerationJobs, eq(scenarios.id, storyGenerationJobs.scenarioId))
    .where(and(isNull(stories.id), isNull(storyGenerationJobs.id)))

  if (missingScenarios.length === 0) {
    return 0
  }

  // Insert jobs for missing scenarios
  await db.insert(storyGenerationJobs).values(
    missingScenarios.map((s) => ({
      scenarioId: s.id,
      status: 'queued' as const
    }))
  )

  return missingScenarios.length
}

// Claim the next available job for processing
// Returns null if no jobs available
export async function claimNextJob (lockId: string): Promise<ScenarioForGeneration | null> {
  const now = new Date()
  const lockTimeout = new Date(now.getTime() - LOCK_TIMEOUT_MINUTES * 60 * 1000)

  // Find and claim a job in a single transaction
  const result = await db.transaction(async (tx) => {
    // Find next available job:
    // - status = 'queued' OR (status = 'failed' AND attemptCount < MAX_ATTEMPTS)
    // - not locked OR lock is stale
    const availableJobs = await tx
      .select({ id: storyGenerationJobs.id, scenarioId: storyGenerationJobs.scenarioId })
      .from(storyGenerationJobs)
      .where(
        and(
          or(
            eq(storyGenerationJobs.status, 'queued'),
            and(
              eq(storyGenerationJobs.status, 'failed'),
              lt(storyGenerationJobs.attemptCount, MAX_ATTEMPTS)
            )
          ),
          or(
            isNull(storyGenerationJobs.lockedAt),
            lt(storyGenerationJobs.lockedAt, lockTimeout)
          )
        )
      )
      // Prefer processing fresh queued jobs first, then retry failed jobs.
      // Within each group, process older jobs first.
      .orderBy(
        sql`case when ${storyGenerationJobs.status} = 'queued' then 0 else 1 end`,
        storyGenerationJobs.createdAt
      )
      .limit(1)

    if (availableJobs.length === 0) {
      return null
    }

    const job = availableJobs[0]

    // Claim the job by updating it
    await tx
      .update(storyGenerationJobs)
      .set({
        status: 'running',
        lockedAt: now,
        lockedBy: lockId,
        lastAttemptAt: now,
        attemptCount: sql`${storyGenerationJobs.attemptCount} + 1`,
        updatedAt: now
      })
      .where(eq(storyGenerationJobs.id, job.id))

    // Fetch scenario details for generation
    const scenarioData = await tx
      .select({
        id: scenarios.id,
        slug: scenarios.slug,
        title: scenarios.title,
        seedText: scenarios.seedText,
        placeName: places.name,
        categoryName: categories.name
      })
      .from(scenarios)
      .innerJoin(places, eq(scenarios.placeId, places.id))
      .innerJoin(categories, eq(scenarios.categoryId, categories.id))
      .where(eq(scenarios.id, job.scenarioId))
      .limit(1)

    return scenarioData[0] || null
  })

  return result
}

// Mark a job as succeeded
export async function markJobSucceeded (scenarioId: string): Promise<void> {
  await db
    .update(storyGenerationJobs)
    .set({
      status: 'succeeded',
      lockedAt: null,
      lockedBy: null,
      lastError: null,
      updatedAt: new Date()
    })
    .where(eq(storyGenerationJobs.scenarioId, scenarioId))
}

// Mark a job as failed (will be retried if under MAX_ATTEMPTS)
export async function markJobFailed (scenarioId: string, error: string): Promise<void> {
  await db
    .update(storyGenerationJobs)
    .set({
      // Mark as failed. The runner will retry up to MAX_ATTEMPTS.
      status: 'failed',
      lockedAt: null,
      lockedBy: null,
      lastError: error,
      updatedAt: new Date()
    })
    .where(eq(storyGenerationJobs.scenarioId, scenarioId))
}

// Upsert a story and its vocabulary items
export async function upsertStoryWithVocabulary (
  scenarioId: string,
  scenarioSlug: string,
  storyData: {
    title: string
    body: string
    audioUrl?: string
  },
  keyPhrases: Array<{
    phrase: string
    meaningEn: string
    meaningZh?: string
    type?: string
  }>
): Promise<string> {
  return await db.transaction(async (tx) => {
    // Upsert story
    const [storyRow] = await tx
      .insert(stories)
      .values({
        slug: scenarioSlug,
        title: storyData.title,
        body: storyData.body,
        scenarioId,
        // Avoid passing `undefined` into DB bindings. We only set `audioUrl` when we actually have a URL.
        // This also ensures we don't wipe an existing `audio_url` during re-generation.
        ...(storyData.audioUrl ? { audioUrl: storyData.audioUrl } : {})
      })
      .onConflictDoUpdate({
        target: stories.scenarioId,
        set: {
          slug: scenarioSlug,
          title: storyData.title,
          body: storyData.body,
          // Only update audioUrl if provided (don't wipe existing)
          ...(storyData.audioUrl ? { audioUrl: storyData.audioUrl } : {}),
          updatedAt: new Date()
        }
      })
      .returning({ id: stories.id })

    const storyId = storyRow.id

    // Upsert vocabulary items
    for (const phrase of keyPhrases) {
      await tx
        .insert(vocabularyItems)
        .values({
          storyId,
          phrase: phrase.phrase,
          meaningEn: phrase.meaningEn,
          meaningZh: phrase.meaningZh,
          type: phrase.type
        })
        .onConflictDoUpdate({
          target: [vocabularyItems.storyId, vocabularyItems.phrase],
          set: {
            meaningEn: phrase.meaningEn,
            meaningZh: phrase.meaningZh,
            type: phrase.type,
            updatedAt: new Date()
          }
        })
    }

    return storyId
  })
}

// Update story audio URL after upload
export async function updateStoryAudioUrl (scenarioId: string, audioUrl: string): Promise<void> {
  await db
    .update(stories)
    .set({
      audioUrl,
      updatedAt: new Date()
    })
    .where(eq(stories.scenarioId, scenarioId))
}

export async function getJobsPage (options: {
  limit: number
  offset: number
}): Promise<AdminJobRow[]> {
  const limit = Math.min(Math.max(options.limit, 1), 200)
  const offset = Math.max(options.offset, 0)

  return await db
    .select({
      id: storyGenerationJobs.id,
      scenarioId: storyGenerationJobs.scenarioId,
      scenarioSlug: scenarios.slug,
      scenarioTitle: scenarios.title,
      status: storyGenerationJobs.status,
      attemptCount: storyGenerationJobs.attemptCount,
      lastError: storyGenerationJobs.lastError,
      lastAttemptAt: storyGenerationJobs.lastAttemptAt,
      createdAt: storyGenerationJobs.createdAt,
      updatedAt: storyGenerationJobs.updatedAt
    })
    .from(storyGenerationJobs)
    .innerJoin(scenarios, eq(storyGenerationJobs.scenarioId, scenarios.id))
    .orderBy(desc(storyGenerationJobs.updatedAt))
    .limit(limit)
    .offset(offset)
}

export async function getJobsTotalCount (): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(storyGenerationJobs)

  return row?.count || 0
}

// Get job counts by status for admin dashboard
export async function getJobStatusCounts () {
  const result = await db
    .select({
      status: storyGenerationJobs.status,
      count: sql<number>`count(*)::int`
    })
    .from(storyGenerationJobs)
    .groupBy(storyGenerationJobs.status)

  const counts: Record<JobStatus, number> = {
    queued: 0,
    running: 0,
    succeeded: 0,
    failed: 0
  }

  for (const row of result) {
    counts[row.status as JobStatus] = row.count
  }

  return counts
}
