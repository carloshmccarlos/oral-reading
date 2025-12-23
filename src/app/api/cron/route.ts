// Cron endpoint for story generation or manual admin runs
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { adminSessionCookieName, isAdminSessionValid } from '@/lib/admin-auth'
import { runGenerationBatch } from '@/lib/generation-runner'

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

function isAdminAuthorized (request: NextRequest) {
  const sessionCookie = request.cookies.get(adminSessionCookieName)?.value
  return isAdminSessionValid(sessionCookie)
}

async function readBodyOptions (request: NextRequest) {
  try {
    const body = await request.json()
    return {
      limit: typeof body.limit === 'number' ? body.limit : undefined,
      dryRun: typeof body.dryRun === 'boolean' ? body.dryRun : undefined,
      generateAudio: typeof body.generateAudio === 'boolean' ? body.generateAudio : undefined
    }
  } catch {
    return {}
  }
}

export async function POST (request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('[Cron] CRON_SECRET not configured')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const cronRequest = isCronAuthorized(request, cronSecret)
  const adminRequest = isAdminAuthorized(request)

  if (!cronRequest && !adminRequest) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const options = await readBodyOptions(request)

  const runResult = await runGenerationBatch({
    limit: options.limit,
    dryRun: options.dryRun,
    generateAudio: options.generateAudio,
    lockPrefix: cronRequest ? 'cron' : 'manual'
  })

  return NextResponse.json(runResult)
}

// Also support GET for Vercel Cron (which uses GET by default)
export async function GET (request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  if (!isCronAuthorized(request, cronSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const runResult = await runGenerationBatch({
    lockPrefix: 'cron'
  })

  return NextResponse.json(runResult)
}
