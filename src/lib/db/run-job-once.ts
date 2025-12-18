import { and, eq, isNull, lt, or } from 'drizzle-orm'

import { generateStoryAndAudioForScenario } from '../generation-pipeline'
import { db, pool } from './client'
import { claimNextJob, createMissingJobs } from './jobs'
import { categories, places, scenarios, storyGenerationJobs } from './schema'

function hasFlag (flag: string) {
  return process.argv.includes(flag)
}

function getArgValue (name: string) {
  const index = process.argv.indexOf(name)
  if (index === -1) return null
  const value = process.argv[index + 1]
  return value || null
}

function warnIfMissingEnv (name: string) {
  if (!process.env[name]) {
    console.warn(`[Run Job Once] Missing env: ${name}`)
    return true
  }

  return false
}

async function peekNextScenarioSlug () {
  // This is a local test helper: preview one available job without claiming/locking it.
  // It prevents leaving jobs stuck in `running` when you only want to inspect what would run.

  const now = new Date()
  const lockTimeout = new Date(now.getTime() - 10 * 60 * 1000)

  const rows = await db
    .select({
      slug: scenarios.slug
    })
    .from(storyGenerationJobs)
    .innerJoin(scenarios, eq(storyGenerationJobs.scenarioId, scenarios.id))
    .innerJoin(places, eq(scenarios.placeId, places.id))
    .innerJoin(categories, eq(scenarios.categoryId, categories.id))
    .where(
      and(
        or(
          eq(storyGenerationJobs.status, 'queued'),
          and(
            eq(storyGenerationJobs.status, 'failed'),
            lt(storyGenerationJobs.attemptCount, 5)
          )
        ),
        or(
          isNull(storyGenerationJobs.lockedAt),
          lt(storyGenerationJobs.lockedAt, lockTimeout)
        )
      )
    )
    .limit(1)

  return rows[0]?.slug || null
}

async function main () {
  const isDryRun = hasFlag('--dryRun') || hasFlag('--dry-run')
  const shouldGenerateAudio = hasFlag('--with-audio') || hasFlag('--withAudio') || process.env.GENERATE_AUDIO === 'true'
  const rawLimit = getArgValue('--limit') || getArgValue('--max')
  const limit = rawLimit ? Math.max(1, Number(rawLimit) || 0) : null
  const lockId = getArgValue('--lockId') || `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  warnIfMissingEnv('DATABASE_URL')
  if (!isDryRun) {
    warnIfMissingEnv('SILICONFLOW_API_KEY')
    if (shouldGenerateAudio) {
      warnIfMissingEnv('SILICONFLOW_TTS_MODEL')
      warnIfMissingEnv('CLOUDFLARE_R2_ACCOUNT_ID')
      warnIfMissingEnv('CLOUDFLARE_R2_ACCESS_KEY_ID')
      warnIfMissingEnv('CLOUDFLARE_R2_SECRET_ACCESS_KEY')
      warnIfMissingEnv('CLOUDFLARE_R2_BUCKET_NAME')
      warnIfMissingEnv('CLOUDFLARE_R2_PUBLIC_URL')
    } else {
      console.log('[Run Job Once] Audio generation disabled (story-only mode)')
    }
  }

  // Ensure jobs exist before trying to claim one.
  const newJobsCreated = await createMissingJobs()
  console.log(`[Run Job Once] Created ${newJobsCreated} missing jobs`)

  if (isDryRun) {
    const nextSlug = await peekNextScenarioSlug()
    console.log(`[Run Job Once] Dry run - next job would be: ${nextSlug || '(none)'}`)
    return
  }

  // In local development we typically want to initialize everything.
  // We process jobs sequentially so we can see clear logs and avoid overwhelming external APIs.
  let processed = 0
  let succeeded = 0
  let failed = 0

  while (true) {
    if (limit && processed >= limit) {
      console.log(`[Run Job Once] Reached limit (${limit}), stopping`) 
      break
    }

    const scenario = await claimNextJob(lockId)
    if (!scenario) {
      break
    }

    processed += 1
    console.log(`[Run Job Once] (${processed}${limit ? `/${limit}` : ''}) Claimed job for: ${scenario.slug}`)

    const result = await generateStoryAndAudioForScenario(scenario, { shouldGenerateAudio })
    if (!result.success) {
      failed += 1
      console.error(`[Run Job Once] Failed: ${result.error || 'Unknown error'}`)
      process.exitCode = 1
      continue
    }

    succeeded += 1
  }

  console.log('[Run Job Once] Done')
  console.log(`[Run Job Once] Summary: processed=${processed} succeeded=${succeeded} failed=${failed}`)
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
