export const siteName = 'OR'
export const siteTitle = 'OR — Oral Reading'
export const siteDescription =
  'Improve spoken English with short, realistic stories set in everyday contexts. Read, learn phrases in context, and practice with optional narration audio.'

// SEO: Centralize the site URL so metadata routes (robots/sitemap) and layout metadata stay consistent.
export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  )
}
