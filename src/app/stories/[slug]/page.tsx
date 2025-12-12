// Story detail page - the main reading experience
// Mirrors the layout from memory-bank/UI/scenario.html

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getScenarioBySlug } from '@/lib/db/queries'

interface StoryPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata ({ params }: StoryPageProps) {
  const { slug } = await params
  const scenario = await getScenarioBySlug(slug)

  if (!scenario) {
    return { title: 'Story Not Found | Read Oral English' }
  }

  return {
    title: `${scenario.title} | Read Oral English`,
    description: scenario.shortDescription || `Read "${scenario.title}" - a scenario set in ${scenario.placeName}`
  }
}

export default async function StoryPage ({ params }: StoryPageProps) {
  const { slug } = await params
  const scenario = await getScenarioBySlug(slug)

  // If scenario not found, show 404
  if (!scenario) {
    notFound()
  }

  // Check if story content exists
  const hasStory = scenario.storyBody && scenario.storyBody.trim().length > 0

  return (
    <div className="min-h-screen">
      {/* Minimal header with back link */}
      <div className="border-b border-black/5 py-4">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6">
          <Link
            href={`/scenarios?category=${scenario.categorySlug}&place=${scenario.placeSlug}`}
            className="flex items-center gap-2 text-sm uppercase tracking-wide text-text-muted transition-colors hover:text-text-main"
          >
            ← {scenario.placeName} Scenarios
          </Link>

          <div className="font-serif italic">Read Oral English.</div>

          {/* Font size control placeholder */}
          <div className="w-[100px] text-right">
            <span className="cursor-pointer text-xl">Aa</span>
          </div>
        </div>
      </div>

      {/* Main content layout */}
      <main className="mx-auto max-w-[1100px] px-6 pb-32 pt-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_340px] lg:gap-16">
          {/* Left column: Story content */}
          <article>
            {/* Story header */}
            <header className="mb-10 border-b border-border pb-8">
              <div className="mb-4 flex gap-4 text-xs uppercase tracking-widest text-text-muted">
                <span>{scenario.placeName}</span>
                <span>•</span>
                <span>{scenario.categoryName}</span>
                <span>•</span>
                <span>4 Min</span>
              </div>

              <h1 className="mb-4 font-serif text-4xl leading-tight md:text-5xl">
                {scenario.storyTitle || scenario.title}
              </h1>

              <p className="text-lg italic text-text-muted">
                {scenario.shortDescription || 'A realistic scenario to practice everyday English.'}
              </p>
            </header>

            {/* Story body */}
            <div className="story-content font-body text-xl leading-relaxed text-text-body">
              {hasStory && scenario.storyBody ? (
                // Render story body (for now as plain text, will add markdown/highlighting later)
                <div className="space-y-8">
                  {scenario.storyBody.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                // Placeholder when no story content exists yet
                <div className="rounded-sm border border-dashed border-border bg-surface p-12 text-center">
                  <div className="mb-4 text-4xl">📝</div>
                  <h3 className="mb-2 font-serif text-2xl">Story Coming Soon</h3>
                  <p className="text-base text-text-muted">
                    This scenario is in our library, but the full narrative hasn&apos;t been written yet.
                    Check back soon!
                  </p>
                </div>
              )}
            </div>

            {/* Mobile vocab trigger */}
            <button className="mt-12 w-full rounded-sm border border-text-main bg-white p-4 text-center font-semibold lg:hidden">
              View Vocabulary List
            </button>

            {/* Navigation footer */}
            <div className="mt-16 flex justify-between border-t border-border pt-8">
              <Link
                href={`/scenarios?category=${scenario.categorySlug}&place=${scenario.placeSlug}`}
                className="text-text-muted hover:text-text-main"
              >
                ← Back to Scenarios
              </Link>
              <span className="font-semibold">
                More stories coming soon →
              </span>
            </div>
          </article>

          {/* Right column: Vocabulary sidebar (desktop only) */}
          <aside className="hidden lg:block">
            <div className="sticky top-[calc(var(--nav-height)+2rem)]">
              <div className="rounded-sm border border-border bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <div className="mb-6 flex items-center justify-between font-serif text-xl">
                  <span>Key Phrases</span>
                  <span className="rounded bg-[#eee] px-2 py-0.5 text-sm">
                    Coming Soon
                  </span>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-text-muted">
                    Vocabulary items will appear here once the story content is added.
                    Each highlighted phrase in the story will have its definition and
                    optional Chinese translation shown in this panel.
                  </p>
                </div>
              </div>

              {/* Practice prompt */}
              <div className="mt-6 rounded-sm bg-[#E8E8E8] p-4 text-center text-sm text-text-muted">
                Practice tip: Try reading the story aloud to improve pronunciation.
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Audio player dock (placeholder) */}
      {scenario.audioUrl && (
        <div className="fixed bottom-5 left-1/2 z-50 flex w-[90%] max-w-[600px] -translate-x-1/2 items-center justify-between rounded-[60px] bg-text-main px-5 py-2.5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
          <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black hover:bg-accent">
            ▶
          </button>

          <div className="mx-6 flex grow flex-col justify-center">
            <div className="text-sm font-medium">
              Playing: {scenario.storyTitle || scenario.title}
            </div>
            <div className="mt-1 h-[3px] w-full rounded bg-white/20">
              <div className="h-full w-[35%] rounded bg-accent" />
            </div>
          </div>

          <button className="text-xs font-semibold text-white/70 hover:text-white">
            1.0x
          </button>
        </div>
      )}
    </div>
  )
}
