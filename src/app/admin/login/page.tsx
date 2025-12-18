import Link from 'next/link'

export default async function AdminLoginPage (props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const searchParams = await props.searchParams
  const hasError = searchParams?.error === '1'

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-text-main mb-2">Admin Login</h1>
        <p className="text-text-muted mb-8">Enter the admin secret to continue</p>

        {hasError ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Invalid secret
          </div>
        ) : null}

        <form method="post" action="/api/admin/login" className="bg-surface rounded-lg border border-border p-6">
          <label className="block text-sm font-medium text-text-main mb-2" htmlFor="secret">
            Admin Secret
          </label>
          <input
            id="secret"
            name="secret"
            type="password"
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-text-main outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter secret"
            autoComplete="current-password"
            required
          />

          <button
            type="submit"
            className="mt-4 w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Sign in
          </button>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-text-muted underline">
              Back to site
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
