import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site'

export const runtime = 'nodejs'

export const revalidate = 3600

export default async function sitemap (): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const now = new Date()

  const base: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1
    },
    {
      url: `${siteUrl}/categories`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4
    }
  ]

  try {
    const { getAllScenarios } = await import('@/lib/db/queries')
    const scenarios = await getAllScenarios()

    return base.concat(
      scenarios.map((scenario) => ({
        url: `${siteUrl}/stories/${scenario.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.6
      }))
    )
  } catch (err) {
    console.error('sitemap generation failed', err)
    return base
  }
}
