// Cron endpoint for story generation
// POST /api/cron/generate-stories
// Protected by CRON_SECRET
import { NextRequest, NextResponse } from 'next/server'
import { claimNextJob, createMissingJobs } from '@/lib/db/jobs'
import { generateStoryAndAudioForScenario } from '@/lib/generation-pipeline'

// Default limit per cron run
const DEFAULT_LIMIT = 1

function isCronAuthorized (request: NextRequest, cronSecret: string) {
  const authHeader = request.headers.get('authorization')
  if (authHeader === `Bearer ${cronSecret}`) {
    return true
  }

  // Vercel Cron requests include this header.
  // This allows scheduled runs without requiring a secret in the URL.
  const isVercelCron = request.headers.get('x-vercel-cron')
  if (isVercelCron === '1' || isVercelCron === 'true') {
    return true
  }

  return false
}

export async function POST (request: NextRequest) {
  // Verify authorization
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('[Cron] CRON_SECRET not configured')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  if (!isCronAuthorized(request, cronSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse optional parameters from request body
  let limit = DEFAULT_LIMIT
  let dryRun = false
  let generateAudio = false

  try {
    const body = await request.json().catch(() => ({}))
    if (typeof body.limit === 'number' && body.limit > 0) {
      limit = Math.min(body.limit, 1) // Always generate 1 story per cron call
    }
    if (typeof body.dryRun === 'boolean') {
      dryRun = body.dryRun
    }
    if (typeof body.generateAudio === 'boolean') {
      generateAudio = body.generateAudio
    }
  } catch {
    // Use defaults if body parsing fails
  }

  // Enforce the contract even if the request body tries to override.
  limit = 1

  console.log(`[Cron] Starting story generation run (limit: ${limit}, dryRun: ${dryRun}, generateAudio: ${generateAudio})`)

  // Create jobs for any scenarios missing stories
  const newJobsCreated = await createMissingJobs()
  if (newJobsCreated > 0) {
    console.log(`[Cron] Created ${newJobsCreated} new jobs for missing stories`)
  }

  // Generate a unique lock ID for this run
  const lockId = `cron-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  const results: Array<{
    scenarioSlug: string
    success: boolean
    error?: string
  }> = []

  // Process jobs sequentially up to limit
  for (let i = 0; i < limit; i++) {
    const scenario = await claimNextJob(lockId)

    if (!scenario) {
      console.log(`[Cron] No more jobs available after processing ${i} scenarios`)
      break
    }

    console.log(`[Cron] Processing job ${i + 1}/${limit}: ${scenario.slug}`)

    if (dryRun) {
      console.log(`[Cron] Dry run - skipping actual generation for: ${scenario.slug}`)
      results.push({ scenarioSlug: scenario.slug, success: true })
      continue
    }

    const result = await generateStoryAndAudioForScenario(scenario, { shouldGenerateAudio: generateAudio })
    results.push({
      scenarioSlug: scenario.slug,
      success: result.success,
      error: result.error
    })

    // Small delay between jobs to avoid rate limiting
    if (i < limit - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  const succeeded = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  console.log(`[Cron] Completed run: ${succeeded} succeeded, ${failed} failed`)

  return NextResponse.json({
    success: true,
    newJobsCreated,
    processed: results.length,
    succeeded,
    failed,
    results
  })
}

// Also support GET for Vercel Cron (which uses GET by default)
export async function GET (request: NextRequest) {
  // For Vercel Cron, check the CRON_SECRET in query or header
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  if (!isCronAuthorized(request, cronSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Create a mock POST request and forward to POST handler
  const postRequest = new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers
  })

  return POST(postRequest)
}
