import { claimNextJob, createMissingJobs } from '@/lib/db/jobs'
import { generateStoryAndAudioForScenario } from '@/lib/generation-pipeline'

const DEFAULT_LIMIT = 1
const INTER_JOB_DELAY_MS = 1000

export interface GenerationRunOptions {
  limit?: number
  dryRun?: boolean
  generateAudio?: boolean
  lockPrefix?: string
}

export interface GenerationRunResult {
  success: boolean
  newJobsCreated: number
  processed: number
  succeeded: number
  failed: number
  results: Array<{
    scenarioSlug: string
    success: boolean
    error?: string
  }>
}

function clampLimit (limit?: number) {
  if (!limit || Number.isNaN(limit)) {
    return DEFAULT_LIMIT
  }

  const normalized = Math.floor(limit)
  if (normalized < 1) {
    return 1
  }

  return normalized
}

export async function runGenerationBatch (
  options: GenerationRunOptions = {}
): Promise<GenerationRunResult> {
  const limit = clampLimit(options.limit)
  const dryRun = Boolean(options.dryRun)
  const shouldGenerateAudio = Boolean(options.generateAudio)
  const lockPrefix = options.lockPrefix || 'manual'

  const newJobsCreated = await createMissingJobs()
  if (newJobsCreated > 0) {
    console.log(`[Generation] Created ${newJobsCreated} new jobs for missing stories`)
  }

  const lockId = `${lockPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  const results: GenerationRunResult['results'] = []

  for (let i = 0; i < limit; i++) {
    const scenario = await claimNextJob(lockId)
    if (!scenario) {
      console.log(`[Generation] No jobs available after ${i} iterations`)
      break
    }

    console.log(`[Generation] Processing ${scenario.slug} (${i + 1}/${limit})`)

    if (dryRun) {
      results.push({ scenarioSlug: scenario.slug, success: true })
    } else {
      const generationResult = await generateStoryAndAudioForScenario(scenario, {
        shouldGenerateAudio
      })

      results.push({
        scenarioSlug: scenario.slug,
        success: generationResult.success,
        error: generationResult.error
      })
    }

    if (i < limit - 1) {
      await new Promise((resolve) => setTimeout(resolve, INTER_JOB_DELAY_MS))
    }
  }

  const succeeded = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  console.log(`[Generation] Finished run: processed=${results.length}, success=${succeeded}, failed=${failed}`)

  return {
    success: true,
    newJobsCreated,
    processed: results.length,
    succeeded,
    failed,
    results
  }
}
