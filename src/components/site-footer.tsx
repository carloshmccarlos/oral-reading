import Link from 'next/link'

export function SiteFooter () {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-container grid-cols-1 gap-12 px-8 py-16 md:grid-cols-[1fr_2fr]">
        <div>
          <div className="font-serif text-2xl italic">OR — Oral Reading.</div>
          <p className="mt-3 max-w-xs text-sm text-text-muted">
            Modern language learning through immersion in everyday narrative contexts.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 md:grid-cols-2">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide">Explore</div>
            <div className="mt-4 flex flex-col gap-3 text-sm text-text-muted">
              <Link href="/scenarios" className="hover:text-text-main">Start Reading</Link>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold uppercase tracking-wide">Learn</div>
            <div className="mt-4 flex flex-col gap-3 text-sm text-text-muted">
              <Link href="/about" className="hover:text-text-main">About</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border px-8 py-8 text-center text-sm text-text-muted">
        © {new Date().getFullYear()} OR — Oral Reading.
      </div>
    </footer>
  )
}
