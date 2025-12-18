import Link from 'next/link'
import { Button } from '@/components/ui'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-(--nav-height) max-w-container items-center justify-between px-8">
        <Link href="/" className="font-serif text-2xl font-semibold italic">
          OR
        </Link>

        <div className="flex items-center gap-6">
          {/*<div className="flex md:hidden">
            <Link href="/about" className="text-sm font-medium text-text-main hover:opacity-70">
              About
            </Link>
          </div>*/}

          <Button asChild>
            <Link href="/categories">Start Reading</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
