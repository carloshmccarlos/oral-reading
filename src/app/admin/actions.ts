'use server'

import { cookies } from 'next/headers'
import { adminSessionCookieName, isAdminSessionValid } from '@/lib/admin-auth'
import { runGenerationBatch } from '@/lib/generation-runner'

function normalizeLimit (value?: number) {
  if (!value || Number.isNaN(value) || value < 1) {
    return 1
  }

  return Math.floor(value)
}

export async function triggerManualGeneration (input: { limit?: number }) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(adminSessionCookieName)?.value
  if (!isAdminSessionValid(sessionCookie)) {
    throw new Error('Unauthorized request')
  }

  const limit = normalizeLimit(input.limit)

  const runResult = await runGenerationBatch({
    limit,
    lockPrefix: 'manual'
  })

  return runResult
}
