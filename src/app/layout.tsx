import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

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
  title: 'Read Oral English | Context-Based Learning',
  description:
    'Help English learners improve spoken English through realistic daily life narratives set in familiar contexts.',
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
