// Story + Audio generation pipeline
// Orchestrates: story generation → audio generation → R2 upload → DB upsert
import {
  markJobFailed,
  markJobSucceeded,
  updateStoryAudioUrl,
  upsertStoryWithVocabulary,
  type ScenarioForGeneration
} from './db/jobs'
import { uploadAudioToR2 } from './r2'
import { generateAudio, generateStory } from './siliconflow'

function sleep (ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRetryableGenerationError (error: unknown) {
  const message = error instanceof Error ? error.message : String(error)

  // Retry on transient conditions:
  // - HTTP 5xx
  // - HTTP 429
  // - common network failures
  // - SiliconFlow occasional "unknown error" payload
  if (/\b429\b/.test(message)) return true
  if (/\b5\d\d\b/.test(message)) return true
  if (message.includes('fetch failed')) return true
  if (message.includes('ECONNRESET')) return true
  if (message.includes('ETIMEDOUT')) return true
  if (message.includes('Request processing failed')) return true

  return false
}

async function withRetries<T> (label: string, fn: () => Promise<T>, options?: {
  maxAttempts?: number
}): Promise<T> {
  const maxAttempts = options?.maxAttempts || 5

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const isRetryable = isRetryableGenerationError(error)

      if (!isRetryable || attempt >= maxAttempts) {
        throw error
      }

      const backoffMs = Math.min(8000, 1000 * (2 ** (attempt - 1)))
      console.warn(`[Pipeline] ${label} failed (attempt ${attempt}/${maxAttempts}): ${message}`)
      console.warn(`[Pipeline] Retrying in ${backoffMs}ms...`)
      await sleep(backoffMs)
    }
  }

  throw new Error(`[Pipeline] ${label} failed after ${maxAttempts} attempts`)
}

// Process a single scenario: generate story, generate audio, upload, save to DB
export async function generateStoryAndAudioForScenario (
  scenario: ScenarioForGeneration,
  options?: {
    shouldGenerateAudio?: boolean
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[Pipeline] Starting generation for scenario: ${scenario.slug}`)

    // Audio generation is optional. We default it OFF right now.
    // Enable it by passing { shouldGenerateAudio: true }.
    const shouldGenerateAudio = options?.shouldGenerateAudio === true

    // Step 1: Generate story content
    console.log(`[Pipeline] Generating story for: ${scenario.title}`)
    const storyData = await withRetries('Story generation', async () => {
      return await generateStory({
        title: scenario.title,
        seedText: scenario.seedText,
        placeName: scenario.placeName,
        categoryName: scenario.categoryName
      })
    }, { maxAttempts: 5 })
    console.log(`[Pipeline] Story generated: "${storyData.title}" (${storyData.keyPhrases.length} phrases)`)

    // Step 2: Upsert story and vocabulary to DB (without audio URL first)
    console.log(`[Pipeline] Saving story to database...`)
    await upsertStoryWithVocabulary(
      scenario.id,
      scenario.slug,
      {
        title: storyData.title,
        body: storyData.bodyMarkdown
      },
      storyData.keyPhrases
    )
    console.log(`[Pipeline] Story saved to database`)

    if (!shouldGenerateAudio) {
      console.log('[Pipeline] Skipping audio generation (story-only mode)')
      await markJobSucceeded(scenario.id)
      console.log(`[Pipeline] ✓ Completed generation for: ${scenario.slug}`)
      return { success: true }
    }

    // Step 3: Generate audio narration
    console.log(`[Pipeline] Generating audio narration...`)
    const audioBuffer = await withRetries('Audio generation', async () => {
      return await generateAudio(storyData.bodyMarkdown)
    }, { maxAttempts: 5 })
    console.log(`[Pipeline] Audio generated: ${audioBuffer.length} bytes`)

    // Step 4: Upload audio to R2
    console.log(`[Pipeline] Uploading audio to R2...`)
    const audioUrl = await uploadAudioToR2(audioBuffer, scenario.slug)
    console.log(`[Pipeline] Audio uploaded: ${audioUrl}`)

    // Step 5: Update story with audio URL
    console.log(`[Pipeline] Updating story with audio URL...`)
    await updateStoryAudioUrl(scenario.id, audioUrl)

    // Step 6: Mark job as succeeded
    await markJobSucceeded(scenario.id)
    console.log(`[Pipeline] ✓ Completed generation for: ${scenario.slug}`)

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`[Pipeline] ✗ Failed generation for ${scenario.slug}:`, errorMessage)

    // Mark job as failed (will be retried)
    await markJobFailed(scenario.id, errorMessage)

    return { success: false, error: errorMessage }
  }
}
