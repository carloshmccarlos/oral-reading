'use client'

import * as React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Slider, Switch, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui'

interface VocabularyItem {
  id: string
  phrase: string
  meaningEn: string
  meaningZh: string | null
  type: string | null
  storyId: string
}

interface StoryReaderProps {
  body: string
  vocabularyItems: VocabularyItem[]
  footer?: React.ReactNode
}

function isWordChar (char: string) {
  return /[a-z0-9]/i.test(char)
}

function isBoundaryMatch (text: string, startIndex: number, endIndex: number) {
  const before = text[startIndex - 1]
  const after = text[endIndex]

  const beforeIsWord = before ? isWordChar(before) : false
  const afterIsWord = after ? isWordChar(after) : false

  return !beforeIsWord && !afterIsWord
}

function findNextValidMatch (textLower: string, phraseLower: string, fromIndex: number) {
  let index = textLower.indexOf(phraseLower, fromIndex)

  while (index !== -1) {
    const endIndex = index + phraseLower.length
    if (isBoundaryMatch(textLower, index, endIndex)) {
      return { index, endIndex }
    }

    index = textLower.indexOf(phraseLower, index + 1)
  }

  return null
}

function buildStableKey (value: string) {
  // Small deterministic hash for stable React keys without pulling in a dependency.
  let hash = 0
  for (let index = 0; index < value.length; index++) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0
  }
  return Math.abs(hash).toString(36)
}

function parseMarkdownParagraph (paragraph: string) {
  // Minimal Markdown support:
  // - Paragraphs split by blank lines
  // - *italic* segments treated as internal thoughts (styled via `.thought`)
  const parts = paragraph.split(/(\*[^*]+\*)/g).filter(Boolean)

  return parts.map((part, partIndex) => {
    const isItalic = part.startsWith('*') && part.endsWith('*') && part.length > 2

    if (!isItalic) {
      return { key: buildStableKey(`t:${partIndex}:${part}`), type: 'text' as const, value: part }
    }

    const value = part.slice(1, -1)
    return { key: buildStableKey(`i:${partIndex}:${value}`), type: 'thought' as const, value }
  })
}

function buildHighlightedNodes ({
  text,
  vocabularyItems,
  isTranslationsVisible
}: {
  text: string
  vocabularyItems: VocabularyItem[]
  isTranslationsVisible: boolean
}) {
  // Highlight vocabulary phrases inside the story article.
  // This does NOT sync with the vocabulary list (no cross-linking).
  if (!text || vocabularyItems.length === 0) {
    return [text]
  }

  const textLower = text.toLowerCase()

  const itemsForMatching = [...vocabularyItems]
    .filter((item) => item.phrase.trim().length > 0)
    .sort((a, b) => b.phrase.length - a.phrase.length)
    .map((item) => ({
      ...item,
      phraseLower: item.phrase.toLowerCase()
    }))

  const nodes: React.ReactNode[] = []
  let cursor = 0

  function pushText (value: string, key: string) {
    if (!value) {
      return
    }

    nodes.push(
      <React.Fragment key={key}>{value}</React.Fragment>
    )
  }

  while (cursor < text.length) {
    let bestMatch: {
      item: (typeof itemsForMatching)[number]
      index: number
      endIndex: number
    } | null = null

    for (const item of itemsForMatching) {
      const match = findNextValidMatch(textLower, item.phraseLower, cursor)
      if (!match) {
        continue
      }

      if (!bestMatch || match.index < bestMatch.index || (match.index === bestMatch.index && item.phrase.length > bestMatch.item.phrase.length)) {
        bestMatch = {
          item,
          index: match.index,
          endIndex: match.endIndex
        }
      }
    }

    if (!bestMatch) {
      pushText(text.slice(cursor), `t:${cursor}:end`)
      break
    }

    if (bestMatch.index > cursor) {
      pushText(text.slice(cursor, bestMatch.index), `t:${cursor}:${bestMatch.index}`)
    }

    const matchedText = text.slice(bestMatch.index, bestMatch.endIndex)

    nodes.push(
      <Tooltip key={`h:${bestMatch.item.id}:${bestMatch.index}:${bestMatch.endIndex}`}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="term inline appearance-none border-0 bg-transparent"
          >
            {matchedText}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <div className="text-sm font-semibold">{bestMatch.item.phrase}</div>
            {bestMatch.item.type && (
              <div className="text-xs text-white/70">{bestMatch.item.type}</div>
            )}
            <div className="text-sm">{bestMatch.item.meaningEn}</div>
            {isTranslationsVisible && bestMatch.item.meaningZh && (
              <div className="text-sm text-white/80">{bestMatch.item.meaningZh}</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    )

    cursor = bestMatch.endIndex
  }

  return nodes
}

export function StoryReader ({ body, vocabularyItems, footer }: StoryReaderProps) {
  const [isTranslationsVisible, setIsTranslationsVisible] = React.useState(true)
  const [fontSizeStep, setFontSizeStep] = React.useState(1)

  const fontSizeRem = React.useMemo(() => {
    const remSizes = [1.125, 1.25, 1.375]
    return remSizes[fontSizeStep] ?? remSizes[1]
  }, [fontSizeStep])

  const normalizedBody = body.trim()
  const paragraphs = React.useMemo(() => {
    if (!normalizedBody) {
      return []
    }

    return normalizedBody.split(/\n\n+/g).map((p) => p.trim()).filter(Boolean)
  }, [normalizedBody])

  if (!normalizedBody) {
    return (
      <div className="rounded-sm border border-dashed border-border bg-surface p-12 text-center">
        <div className="mb-4 text-4xl">📝</div>
        <h3 className="mb-2 font-serif text-2xl">Story Coming Soon</h3>
        <p className="text-base text-text-muted">
          This scenario is in our library, but the full narrative hasn&apos;t been written yet.
          Check back soon!
        </p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_340px] lg:gap-16">
        <div>
          <div id="reading-settings" className="mb-8 flex flex-col gap-4 rounded-sm border border-border bg-white p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-semibold">Reading settings</div>
              <div className="text-sm text-text-muted">{vocabularyItems.length} phrases</div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex items-center justify-between gap-3 text-sm md:w-[200px]">
                <span className="text-text-muted">Translations</span>
                <Switch
                  checked={isTranslationsVisible}
                  onCheckedChange={setIsTranslationsVisible}
                  aria-label="Toggle Chinese translations"
                />
              </div>

              <div className="flex items-center gap-3 md:w-[240px]">
                <span className="text-sm text-text-muted">Aa</span>
                <Slider
                  value={[fontSizeStep]}
                  min={0}
                  max={2}
                  step={1}
                  onValueChange={(value) => {
                    const next = value[0]
                    if (typeof next !== 'number') {
                      return
                    }
                    setFontSizeStep(next)
                  }}
                  aria-label="Story font size"
                />
              </div>
            </div>
          </div>

          <div className="story-content font-body text-xl leading-relaxed text-text-body" style={{ fontSize: `${fontSizeRem}rem` }}>
            {paragraphs.map((paragraph, paragraphIndex) => {
              const tokens = parseMarkdownParagraph(paragraph)
              const key = buildStableKey(`${paragraphIndex}:${paragraph}`)

              return (
                <p key={key}>
                  {tokens.map((token) => {
                    if (token.type === 'thought') {
                      return (
                        <span key={token.key} className="thought">
                          {token.value}
                        </span>
                      )
                    }

                    return (
                      <React.Fragment key={token.key}>
                        {buildHighlightedNodes({
                          text: token.value,
                          vocabularyItems,
                          isTranslationsVisible
                        })}
                      </React.Fragment>
                    )
                  })}
                </p>
              )
            })}
          </div>

          <div className="mt-12 lg:hidden">
            <Accordion type="single" collapsible>
              <AccordionItem value="vocabulary">
                <AccordionTrigger>
                  View Vocabulary List ({vocabularyItems.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {vocabularyItems.length === 0 ? (
                      <div className="text-sm text-text-muted">No vocabulary items yet.</div>
                    ) : (
                      vocabularyItems.map((item) => (
                        <div key={item.id} className="rounded-sm border border-border bg-white p-4">
                          <div className="font-semibold">{item.phrase}</div>
                          <div className="text-sm text-text-muted">{item.meaningEn}</div>
                          {isTranslationsVisible && item.meaningZh && (
                            <div className="mt-1 text-sm text-text-muted">{item.meaningZh}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {footer}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--nav-height)+2rem)]">
            <div className="rounded-sm border border-border bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="mb-6 flex items-center justify-between font-serif text-xl">
                <span>Key Phrases</span>
                <span className="rounded bg-[#eee] px-2 py-0.5 text-sm">{vocabularyItems.length} Items</span>
              </div>

              {/* Story highlighting is enabled, but the vocabulary list does not link/sync to the story text. */}
              {vocabularyItems.length === 0 ? (
                <p className="text-sm text-text-muted">Vocabulary items will appear here once the story content is added.</p>
              ) : (
                <div className="space-y-4">
                  {vocabularyItems.map((item) => (
                    <div key={item.id} className="rounded-sm bg-[#FAFAF8] p-3">
                      <div className="font-semibold text-text-main">{item.phrase}</div>
                      <div className="text-sm text-text-muted">{item.meaningEn}</div>
                      {isTranslationsVisible && item.meaningZh && (
                        <div className="mt-1 text-sm text-text-muted">{item.meaningZh}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-sm bg-[#E8E8E8] p-4 text-center text-sm text-text-muted">
              Practice tip: Try reading the story aloud to improve pronunciation.
            </div>
          </div>
        </aside>
      </div>
    </TooltipProvider>
  )
}
