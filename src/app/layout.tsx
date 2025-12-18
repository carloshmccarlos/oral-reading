import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { getSiteUrl, siteDescription, siteName, siteTitle } from '@/lib/site'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
})

const playfair = Playfair_Display({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  // SEO: This is the canonical base URL used to resolve relative metadata URLs.
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    'oral reading',
    'spoken English',
    'English learning',
    'context-based learning',
    'daily scenarios',
    'shadowing',
    'listening practice'
  ],
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    siteName,
    title: siteTitle,
    description: siteDescription,
    url: '/',
    locale: 'en_US'
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  },
  manifest: '/manifest.webmanifest'
}

export const viewport: Viewport = {
  themeColor: '#F7F7F5',
  colorScheme: 'light'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        {/* Global shell (Phase 3): consistent header/footer across routes */}
        <div className="min-h-screen">
          <SiteHeader />
          <main className="mx-auto max-w-container px-8">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  )
}
