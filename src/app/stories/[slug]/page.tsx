// Story detail page - the main reading experience
// Mirrors the layout from memory-bank/UI/scenario.html

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { StoryReader } from '@/components/story-reader'
import { getScenarioBySlug, getVocabularyItemsByStoryId } from '@/lib/db/queries'

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

  const storyId = scenario.storyId
  const vocabularyItems = storyId ? await getVocabularyItemsByStoryId(storyId) : []

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

          <div className="w-[100px]" />
        </div>
      </div>

      {/* Main content layout */}
      <main className="mx-auto max-w-[1100px] px-6 pb-32 pt-12">
        <div>
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

            <StoryReader
              body={scenario.storyBody || ''}
              vocabularyItems={vocabularyItems}
              footer={(
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
              )}
            />
          </article>
        </div>
      </main>

      {/* Audio player dock (placeholder) */}
      {scenario.audioUrl && (
        <div className="fixed bottom-5 left-1/2 z-50 flex w-[90%] max-w-[600px] -translate-x-1/2 items-center justify-between rounded-[60px] bg-text-main px-5 py-2.5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
          <button type="button" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black hover:bg-accent">
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

          <button type="button" className="text-xs font-semibold text-white/70 hover:text-white">
            1.0x
          </button>
        </div>
      )}
    </div>
  )
}
