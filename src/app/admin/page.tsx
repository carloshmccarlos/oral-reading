// Admin page for data summary and story generation job monitoring
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { ManualGenerationPanel } from '@/components/admin/manual-generation-panel'
import { adminSessionCookieName, isAdminSessionValid } from '@/lib/admin-auth'
import { getJobsPage, getJobsTotalCount, getJobStatusCounts } from '@/lib/db/jobs'
import { getDataSummary } from '@/lib/db/queries'

// Status badge colors for job status
function getStatusColor (status: string) {
  switch (status) {
    case 'queued':
      return 'bg-yellow-100 text-yellow-800'
    case 'running':
      return 'bg-blue-100 text-blue-800'
    case 'succeeded':
      return 'bg-green-100 text-green-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Format date for display
function formatDate (date: Date | null) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export default async function AdminPage (props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  // Redirect to login if not authenticated.
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(adminSessionCookieName)?.value
  if (!isAdminSessionValid(sessionCookie)) {
    redirect('/admin/login')
  }

  const searchParams = await props.searchParams
  const rawPage = searchParams?.page
  const pageString = Array.isArray(rawPage) ? rawPage[0] : rawPage
  const page = Math.max(1, Number(pageString || '1') || 1)
  const pageSize = 50

  const [jobsTotal, jobCounts, dataSummary] = await Promise.all([
    getJobsTotalCount(),
    getJobStatusCounts(),
    getDataSummary()
  ])

  const totalPages = Math.max(1, Math.ceil(jobsTotal / pageSize))
  const safePage = Math.min(page, totalPages)
  if (safePage !== page) {
    redirect(`/admin?page=${safePage}`)
  }

  const offset = (safePage - 1) * pageSize
  const jobs = await getJobsPage({ limit: pageSize, offset })

  const hasPrevious = safePage > 1
  const hasNext = safePage < totalPages
  const startIndex = jobsTotal === 0 ? 0 : offset + 1
  const endIndex = Math.min(offset + jobs.length, jobsTotal)

  const totalJobs = jobCounts.queued + jobCounts.running + jobCounts.succeeded + jobCounts.failed

  // Calculate story generation progress
  const storyProgress = dataSummary.scenarios > 0
    ? Math.round((dataSummary.stories / dataSummary.scenarios) * 100)
    : 0
  const audioProgress = dataSummary.stories > 0
    ? Math.round((dataSummary.storiesWithAudio / dataSummary.stories) * 100)
    : 0

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-container mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-text-main mb-2">Admin Dashboard</h1>
        <p className="text-text-muted mb-8">Data overview and story generation monitoring</p>

        <div className="flex justify-end mb-8">
          <Link href="/api/admin/logout" className="text-sm text-text-muted underline">
            Logout
          </Link>
        </div>

        {/* Section 1: Data Summary */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-text-main mb-4">Data Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-text-main">{dataSummary.categories}</div>
              <div className="text-sm text-text-muted">Categories</div>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-text-main">{dataSummary.places}</div>
              <div className="text-sm text-text-muted">Places</div>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-text-main">{dataSummary.scenarios}</div>
              <div className="text-sm text-text-muted">Scenarios</div>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-primary">{dataSummary.stories}</div>
              <div className="text-sm text-text-muted">Stories</div>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-primary">{dataSummary.storiesWithAudio}</div>
              <div className="text-sm text-text-muted">With Audio</div>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-text-main">{dataSummary.vocabularyItems}</div>
              <div className="text-sm text-text-muted">Vocabulary</div>
            </div>
          </div>

          {/* Progress bars */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-body">Story Generation Progress</span>
                <span className="text-text-muted">{dataSummary.stories} / {dataSummary.scenarios}</span>
              </div>
              <div className="h-2 bg-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${storyProgress}%` }}
                />
              </div>
              <div className="text-xs text-text-muted mt-1">{storyProgress}% complete</div>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-body">Audio Generation Progress</span>
                <span className="text-text-muted">{dataSummary.storiesWithAudio} / {dataSummary.stories}</span>
              </div>
              <div className="h-2 bg-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>
              <div className="text-xs text-text-muted mt-1">{audioProgress}% complete</div>
            </div>
          </div>
        </section>

        {/* Section 2: Story Generation Jobs */}
        <section>
          <h2 className="text-xl font-semibold text-text-main mb-4">Story Generation Jobs</h2>

          {/* Job status summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-text-main">{totalJobs}</div>
              <div className="text-sm text-text-muted">Total Jobs</div>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-yellow-600">{jobCounts.queued}</div>
              <div className="text-sm text-text-muted">Queued</div>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-blue-600">{jobCounts.running}</div>
              <div className="text-sm text-text-muted">Running</div>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-green-600">{jobCounts.succeeded}</div>
              <div className="text-sm text-text-muted">Succeeded</div>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-red-600">{jobCounts.failed}</div>
              <div className="text-sm text-text-muted">Failed</div>
            </div>
          </div>

          {/* Jobs table */}
          <div className="bg-surface rounded-lg border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h2 className="font-semibold text-text-main">Generation Jobs</h2>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <div className="text-xs text-text-muted">
                    {jobsTotal === 0 ? '0 jobs' : `${startIndex}-${endIndex} of ${jobsTotal}`}
                  </div>
                  <div className="flex items-center gap-3">
                    {hasPrevious ? (
                      <Link
                        href={`/admin?page=${safePage - 1}`}
                        className="text-xs text-text-muted underline"
                      >
                        Prev
                      </Link>
                    ) : (
                      <span className="text-xs text-text-muted">Prev</span>
                    )}

                    <span className="text-xs text-text-muted">Page {safePage} / {totalPages}</span>

                    {hasNext ? (
                      <Link
                        href={`/admin?page=${safePage + 1}`}
                        className="text-xs text-text-muted underline"
                      >
                        Next
                      </Link>
                    ) : (
                      <span className="text-xs text-text-muted">Next</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-bg">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-text-muted">Scenario</th>
                    <th className="px-4 py-3 text-left font-medium text-text-muted">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-text-muted">Attempts</th>
                    <th className="px-4 py-3 text-left font-medium text-text-muted">Last Attempt</th>
                    <th className="px-4 py-3 text-left font-medium text-text-muted">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                        No jobs found. Run the cron endpoint to create jobs for scenarios without stories.
                      </td>
                    </tr>
                  ) : (
                    jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-bg/50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-text-main truncate max-w-xs" title={job.scenarioTitle}>
                            {job.scenarioTitle}
                          </div>
                          <div className="text-xs text-text-muted">{job.scenarioSlug}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-body">{job.attemptCount}</td>
                        <td className="px-4 py-3 text-text-muted">{formatDate(job.lastAttemptAt)}</td>
                        <td className="px-4 py-3">
                          {job.lastError ? (
                            <span className="text-red-600 text-xs truncate max-w-xs block" title={job.lastError}>
                              {job.lastError.slice(0, 50)}{job.lastError.length > 50 ? '...' : ''}
                            </span>
                          ) : (
                            <span className="text-text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-semibold text-text-main">Manual Generation</h3>
              <p className="mb-4 text-sm text-text-muted">
                Trigger the generation cron directly from the dashboard. Requests reuse your admin session, so no secret is needed.
              </p>
              <ManualGenerationPanel />
            </div>
            <div className="p-4 bg-surface rounded-lg border border-border">
              <h3 className="font-semibold text-text-main mb-2">Cron Endpoint</h3>
              <p className="text-sm text-text-body mb-2">
                External schedulers can still call the API directly:
              </p>
              <code className="block bg-bg px-3 py-2 rounded text-sm font-mono text-text-body">
                POST /api/cron/generate-stories<br />
                Authorization: Bearer {'<CRON_SECRET>'}
              </code>
              <p className="text-xs text-text-muted mt-2">
                Optional body: {'{ "limit": 3, "dryRun": false }'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
