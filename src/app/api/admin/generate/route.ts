import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { adminSessionCookieName, isAdminSessionValid } from '@/lib/admin-auth'
import { runGenerationBatch } from '@/lib/generation-runner'

function normalizeNumber (value?: number) {
  if (!value || Number.isNaN(value) || value < 1) {
    return 1
  }

  return Math.floor(value)
}

export async function POST (request: NextRequest) {
  const sessionCookie = request.cookies.get(adminSessionCookieName)?.value
  if (!isAdminSessionValid(sessionCookie)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))

  const limit = normalizeNumber(typeof body.limit === 'number' ? body.limit : undefined)
  const dryRun = Boolean(body.dryRun)
  const generateAudio = Boolean(body.generateAudio)

  const result = await runGenerationBatch({
    limit,
    dryRun,
    generateAudio,
    lockPrefix: 'manual'
  })

  return NextResponse.json(result)
}
