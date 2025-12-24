'use server'

import { cookies } from 'next/headers'
import { adminSessionCookieName, isAdminSessionValid } from '@/lib/admin-auth'
import { runGenerationBatch } from '@/lib/generation-runner'

const MAX_LIMIT = 5

function clampLimit (value?: number) {
  if (!value || Number.isNaN(value) || value < 1) {
    return 1
  }

  if (value > MAX_LIMIT) {
    return MAX_LIMIT
  }

  return Math.floor(value)
}

export async function triggerManualGeneration (input: { limit?: number }) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(adminSessionCookieName)?.value
  if (!isAdminSessionValid(sessionCookie)) {
    throw new Error('Unauthorized request')
  }

  const limit = clampLimit(input.limit)

  const runResult = await runGenerationBatch({
    limit,
    lockPrefix: 'manual'
  })

  return runResult
}
