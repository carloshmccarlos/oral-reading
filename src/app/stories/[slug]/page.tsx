// Story detail page - the main reading experience
// Mirrors the layout from memory-bank/UI/scenario.html

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { StoryAudioDock } from '@/components/story-audio-dock'
import { StoryReader } from '@/components/story-reader'
import { getScenarioBySlug, getVocabularyItemsByStoryId } from '@/lib/db/queries'
import { siteName } from '@/lib/site'

interface StoryPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: StoryPageProps) {
  const { slug } = await params
  const scenario = await getScenarioBySlug(slug)

  if (!scenario) {
    return { title: 'Story Not Found' }
  }

  const description =
    scenario.shortDescription ||
    `A short story for oral reading practice set in ${scenario.placeName}.`

  return {
    title: scenario.title,
    description,
    alternates: { canonical: `/stories/${scenario.slug}` },
    openGraph: {
      type: 'article',
      title: scenario.title,
      description,
      siteName,
      url: `/stories/${scenario.slug}`
    },
    twitter: {
      card: 'summary_large_image',
      title: scenario.title,
      description
    }
  }
}

export default async function StoryPage({ params }: StoryPageProps) {
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
          <div className="w-[100px]" />
        </div>
      </div>

      {/* Main content layout */}
      <main className="mx-auto max-w-[1100px] px-6 pb-32 pt-8">
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

              {/*<p className="text-lg italic text-text-muted">*/}
              {/*  {scenario.shortDescription || 'A realistic scenario to practice everyday English.'}*/}
              {/*</p>*/}
            </header>

            <StoryReader
              body={scenario.storyBody || ''}
              vocabularyItems={vocabularyItems}
              footer={
                <div className="mt-16 flex justify-between border-t border-border pt-8">
                  <Link
                    href={`/scenarios?category=${scenario.categorySlug}&place=${scenario.placeSlug}`}
                    className="text-text-muted hover:text-text-main"
                  >
                    ← Back to Scenarios
                  </Link>
                  <span className="font-semibold">More stories coming soon →</span>
                </div>
              }
            />
          </article>
        </div>
      </main>

      {/* Audio dock: plays the story narration from a Cloudflare R2 (public) URL. */}
      {scenario.audioUrl && (
        <StoryAudioDock src={scenario.audioUrl} title={scenario.storyTitle || scenario.title} />
      )}
    </div>
  )
}
