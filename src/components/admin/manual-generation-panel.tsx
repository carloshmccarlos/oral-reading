'use client'

import { useCallback, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'

const MAX_LIMIT = 5

interface ApiResult {
  success: boolean
  processed: number
  succeeded: number
  failed: number
  results: Array<{
    scenarioSlug: string
    success: boolean
    error?: string
  }>
}

function clampLimit (value: number) {
  if (!Number.isFinite(value) || value < 1) {
    return 1
  }

  if (value > MAX_LIMIT) {
    return MAX_LIMIT
  }

  return Math.floor(value)
}

export function ManualGenerationPanel () {
  const [limitInput, setLimitInput] = useState('1')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [result, setResult] = useState<ApiResult | null>(null)

  const resolvedLimit = useMemo(() => {
    const parsed = Number(limitInput)
    return clampLimit(parsed)
  }, [limitInput])

  const onSubmit = useCallback(async () => {
    setIsSubmitting(true)
    setErrorMessage(null)
    setResult(null)

    try {
      const response = await fetch('/api/cron', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ limit: resolvedLimit })
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        setErrorMessage(payload.error || 'Generation failed. Check logs for details.')
        return
      }

      const payload = await response.json() as ApiResult
      setResult(payload)
    } catch (error) {
      console.error('[ManualGenerationPanel] Failed to trigger cron', error)
      setErrorMessage('Unexpected error while calling the API.')
    } finally {
      setIsSubmitting(false)
    }
  }, [resolvedLimit])

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1">
          <label htmlFor="generation-limit" className="text-sm font-medium text-text-main">
            Stories to generate (1-{MAX_LIMIT})
          </label>
          <input
            id="generation-limit"
            type="number"
            min={1}
            max={MAX_LIMIT}
            value={limitInput}
            onChange={(event) => setLimitInput(event.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-text-main outline-none focus:ring-2 focus:ring-primary"
            disabled={isSubmitting}
          />
          <p className="mt-1 text-xs text-text-muted">
            Values outside the allowed range will be clamped automatically.
          </p>
        </div>
        <Button onClick={onSubmit} disabled={isSubmitting} className="h-11 w-full sm:w-auto">
          {isSubmitting ? 'Generating…' : `Generate ${resolvedLimit}`}
        </Button>
      </div>

      {errorMessage ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <div className="mt-4 space-y-2 text-sm text-text-body">
          <div className="font-medium text-text-main">
            {result.succeeded} succeeded · {result.failed} failed (processed {result.processed})
          </div>
          {result.results.length > 0 ? (
            <ul className="space-y-1 rounded-md border border-border bg-bg px-3 py-2 text-xs text-text-muted">
              {result.results.map((item) => (
                <li key={item.scenarioSlug} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-medium text-text-main">{item.scenarioSlug}</span>
                  <span className={item.success ? 'text-green-600' : 'text-red-600'}>
                    {item.success ? 'Success' : item.error || 'Failed'}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
