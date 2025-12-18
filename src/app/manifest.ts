import type { MetadataRoute } from 'next'
import { siteDescription, siteName, siteTitle } from '@/lib/site'

export default function manifest (): MetadataRoute.Manifest {
  return {
    name: siteTitle,
    short_name: siteName,
    description: siteDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#F7F7F5',
    theme_color: '#F7F7F5',
    icons: [
      {
        src: '/icons/icon-192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  }
}
