// SiliconFlow API client for story generation and TTS

// Story generation response structure
export interface GeneratedStory {
  title: string
  bodyMarkdown: string
  keyPhrases: Array<{
    phrase: string
    meaningEn: string
    meaningZh?: string
    type?: string
  }>
}

function escapeControlCharsInsideJsonStrings (value: string) {
  // DeepSeek occasionally outputs literal newlines/tabs inside JSON string values.
  // JSON requires these to be escaped, so we normalize them to keep parsing resilient.
  let output = ''
  let isInsideString = false
  let isEscape = false

  for (let i = 0; i < value.length; i++) {
    const char = value[i]

    if (!isInsideString) {
      output += char
      if (char === '"') {
        isInsideString = true
      }
      continue
    }

    if (isEscape) {
      output += char
      isEscape = false
      continue
    }

    if (char === '\\') {
      output += char
      isEscape = true
      continue
    }

    if (char === '"') {
      output += char
      isInsideString = false
      continue
    }

    if (char === '\n') {
      output += '\\n'
      continue
    }

    if (char === '\r') {
      output += '\\r'
      continue
    }

    if (char === '\t') {
      output += '\\t'
      continue
    }

    if (char === '\b') {
      output += '\\b'
      continue
    }

    if (char === '\f') {
      output += '\\f'
      continue
    }

    const code = char.charCodeAt(0)
    if (code >= 0 && code < 0x20) {
      output += `\\u${code.toString(16).padStart(4, '0')}`
      continue
    }

    output += char
  }

  return output
}

function stripMarkdownCodeFence (value: string) {
  // Some model responses still wrap JSON in a ```json fence.
  const match = value.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (match?.[1]) {
    return match[1].trim()
  }
  return value.trim()
}

function extractFirstJsonObject (value: string) {
  // Extract the first { ... } block from a response that may include extra pre/post text.
  const start = value.indexOf('{')
  if (start < 0) {
    return null
  }

  let depth = 0
  let isInsideString = false
  let isEscape = false

  for (let i = start; i < value.length; i++) {
    const char = value[i]

    if (isInsideString) {
      if (isEscape) {
        isEscape = false
        continue
      }
      if (char === '\\') {
        isEscape = true
        continue
      }
      if (char === '"') {
        isInsideString = false
      }
      continue
    }

    if (char === '"') {
      isInsideString = true
      continue
    }

    if (char === '{') {
      depth++
      continue
    }

    if (char === '}') {
      depth--
      if (depth === 0) {
        return value.slice(start, i + 1)
      }
    }
  }

  return null
}

function removeTrailingCommas (value: string) {
  // Make parsing resilient to trailing commas: {"a": 1,} / [1,]
  return value.replace(/,\s*([}\]])/g, '$1')
}

function quoteKnownKeys (value: string) {
  // Targeted recovery for "almost JSON" where the model emits unquoted known keys.
  return value.replace(
    /([,{\[]\s*)(title|bodyMarkdown|keyPhrases|phrase|meaningEn|meaningZh|type)\s*:/g,
    '$1"$2":'
  )
}

async function readChatCompletionStreamContent (response: Response) {
  if (!response.body) {
    throw new Error('Missing response body for streaming completion')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  let buffer = ''
  let content = ''

  while (true) {
    const result = await reader.read()
    if (result.done) {
      break
    }

    buffer += decoder.decode(result.value, { stream: true })

    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) {
        continue
      }

      const data = trimmed.slice('data:'.length).trim()
      if (!data) {
        continue
      }

      if (data === '[DONE]') {
        return content
      }

      try {
        const parsed = JSON.parse(data) as {
          choices?: Array<{
            delta?: { content?: unknown }
            message?: { content?: unknown }
          }>
        }

        const chunkContent =
          parsed.choices?.[0]?.delta?.content ??
          parsed.choices?.[0]?.message?.content

        if (typeof chunkContent === 'string') {
          content += chunkContent
        } else if (Array.isArray(chunkContent)) {
          content += chunkContent.map((part) => {
            if (typeof part === 'string') return part
            if (part && typeof part === 'object' && 'text' in part && typeof (part as { text?: unknown }).text === 'string') {
              return (part as { text: string }).text
            }
            return ''
          }).join('')
        }
      } catch {
        // Ignore malformed SSE frames (rare) and keep accumulating.
      }
    }
  }

  return content
}

function parseGeneratedStoryFromContent (rawContent: unknown): GeneratedStory {
  const content = Array.isArray(rawContent)
    ? rawContent.map((part) => {
      if (typeof part === 'string') {
        return part
      }
      if (part && typeof part === 'object' && 'text' in part && typeof (part as { text?: unknown }).text === 'string') {
        return (part as { text: string }).text
      }
      return ''
    }).join('')
    : typeof rawContent === 'string'
      ? rawContent
      : null

  if (!content) {
    throw new Error('No content in story generation response')
  }

  const trimmed = stripMarkdownCodeFence(content)
  const candidates = [
    trimmed,
    extractFirstJsonObject(trimmed),
    extractFirstJsonObject(content)
  ].filter((candidate): candidate is string => typeof candidate === 'string' && candidate.trim().length > 0)

  let lastError: unknown = null

  for (const candidate of candidates) {
    const normalized = escapeControlCharsInsideJsonStrings(
      quoteKnownKeys(removeTrailingCommas(candidate.trim()))
    )

    try {
      return JSON.parse(normalized) as GeneratedStory
    } catch (error) {
      lastError = error
    }
  }

  console.error('[SiliconFlow] Failed to parse story JSON from model output', {
    rawPreview: content.slice(0, 1200)
  })

  throw new Error(`Failed to parse story JSON: ${(lastError as Error)?.message || String(lastError)}`)
}

function getSiliconFlowApiKey() {
  const apiKey = process.env.SILICONFLOW_API_KEY

  if (!apiKey) {
    throw new Error('Missing SILICONFLOW_API_KEY in environment variables')
  }

  return apiKey
}

// Build the story generation prompt from scenario data
function buildStoryPrompt(scenario: {
  title: string
  seedText: string
  placeName: string
  categoryName: string
}) {
  // Prompt rules mirrored from memory-bank/prompt.txt.
  // Keep the response contract JSON-only so `response_format: { type: 'json_object' }` works reliably.
  return `Scenario: ${scenario.seedText}
Task:
Write a detailed, casual, realistic daily-life article in American spoken English for English learners.
The writing should feel like talking to a friend, a vlog narration, or inner monologue — NOT formal writing.

Context:

Scenario: ${scenario.seedText}

Place: ${scenario.placeName}

Category: ${scenario.categoryName}

Tone & Style:

Very casual, natural American English

Sounds like real speech, not a textbook

Content Requirements:

Micro-actions: describe tiny movements and behaviors (hands, posture, facial expressions, walking, bending, touching objects, sounds)

Objects everywhere: everyday items (desk, bed, phone, cables, mug, drawer, chair, floor)

Spoken English focus: heavy use of phrasal verbs, casual idioms, filler expressions

Natural flow: no teaching tone, no explanations inside the story

Language Rules:

Use short to medium sentences

Use contractions (I'm, it's, gotta, kinda)

Avoid formal vocabulary

Avoid perfect grammar if it sounds unnatural

Length:

400–700 words

Formatting rules for the story body:

Paragraphs separated by blank lines

IMPORTANT: Do NOT use any markdown formatting in the story body.
- Do NOT wrap words or phrases in *asterisks* or _underscores_.
- Do NOT use **bold**, headings, lists, or code blocks.
- Output plain text only.

Key Phrases & Words rules (VERY IMPORTANT):

ALL phrases MUST appear exactly in the article text

Copy the phrase verbatim from the article (no rewriting)

If the phrase is a verb or phrasal verb, keep the exact form used
(e.g. “digging around”, “muttered”, “yanked it open”)

Do NOT convert verbs to base form in the phrase field

ONLY list words or short phrases (NO full sentences)

After phrase generation, check that each phrase actually appears in the article

Focus on:

movement verbs

phrasal verbs

casual idioms

object names

spoken expressions

Key phrase explanation rules:

phrase: exact text from the article

meaningEn: explain the base / normal form and meaning

Example:
phrase: "digging around"
meaningEn: "dig around — to search messily or without order"

meaningZh: Chinese explanation of the base meaning

type: one of

movement

phrasal verb

idiom

object

spoken expression
Number of key phrases:

25–30 (enough to cover the best phrases without risking output truncation)

Response format (STRICT):
You MUST respond with valid JSON only (no markdown, no extra text).
IMPORTANT: Within JSON string values, you MUST escape newlines as \\n (do not output raw line breaks inside a quoted string).
Use this exact structure:

{
"title": "A short, engaging title (casual American English)",
"bodyMarkdown": "The full story text with paragraphs separated by blank lines.",
"keyPhrases": [
{
"phrase": "",
"meaningEn": "",
"meaningZh": "",
"type": ""
}
]
}
`
}

// Generate a story for a scenario using Qwen model
export async function generateStory(scenario: {
  title: string
  seedText: string
  placeName: string
  categoryName: string
}): Promise<GeneratedStory> {
  const apiKey = getSiliconFlowApiKey()
  const model = process.env.SILICONFLOW_STORY_MODEL

  if (!model) {
    throw new Error('Missing SILICONFLOW_STORY_MODEL in environment variables')
  }

  // DeepSeek JSON mode is most reliable when:
  // - we provide an explicit system message enforcing JSON output
  // - we send message content as a plain string (per SiliconFlow docs)
  const prompt = buildStoryPrompt(scenario)

  const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant designed to output JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: true,
      enable_thinking: false,
      temperature: 0.7,

      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    const requestId = response.headers.get('x-request-id')
    console.error('[SiliconFlow] Story generation request failed', {
      status: response.status,
      requestId,
      model,
      errorText: errorText || '(no body)',
    })
    throw new Error(`Story API error: ${response.status} - ${errorText || '(no body)'}`)
  }

  const streamedContent = await readChatCompletionStreamContent(response)
  const parsed = parseGeneratedStoryFromContent(streamedContent)

  if (!parsed.title || !parsed.bodyMarkdown || !Array.isArray(parsed.keyPhrases)) {
    throw new Error('Invalid story response structure')
  }

  // Some models still wrap phrases in *asterisks* for emphasis.
  // Our reader treats *...* as special markup, so strip emphasis markers here.
  parsed.bodyMarkdown = parsed.bodyMarkdown
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')

  if (parsed.keyPhrases.length > 30) {
    parsed.keyPhrases = parsed.keyPhrases.slice(0, 30)
  }

  return parsed
}

// Strip markdown formatting for TTS input
function stripMarkdownForTTS(markdown: string): string {
  return (
    markdown
      // Remove italic markers but keep the text
      .replace(/\*([^*]+)\*/g, '$1')
      // Remove any remaining markdown syntax
      .replace(/[#*_`]/g, '')
      // Normalize whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  )
}

// Generate audio narration using SiliconFlow TTS
export async function generateAudio(storyBody: string): Promise<Buffer> {
  const apiKey = process.env.SILICONFLOW_API_KEY
  const ttsModel = process.env.SILICONFLOW_TTS_MODEL
  const ttsVoice = process.env.SILICONFLOW_TTS_VOICE

  if (!apiKey) {
    throw new Error('Missing SILICONFLOW_API_KEY in environment variables')
  }

  if (!ttsModel) {
    throw new Error('Missing SILICONFLOW_TTS_MODEL in environment variables')
  }

  const plainText = stripMarkdownForTTS(storyBody)

  // SiliconFlow voices are model-specific (e.g. `fnlp/MOSS-TTSD-v0.5:alex`) and do not accept OpenAI voices like `alloy`.
  // - If SILICONFLOW_TTS_VOICE is provided, we use it.
  // - For MOSS-TTSD, default to a known built-in voice.
  // - For other models, omit `voice` unless configured.
  const defaultVoice = ttsVoice || (ttsModel.includes('MOSS-TTSD') ? `${ttsModel}:alex` : null)

  async function requestTts(voice: string | null) {
    const body: Record<string, unknown> = {
      model: ttsModel,
      input: plainText,
      response_format: 'mp3',
    }

    if (voice) {
      body.voice = voice
    }

    return await fetch('https://api.siliconflow.cn/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  }

  // Call SiliconFlow TTS endpoint
  let response = await requestTts(defaultVoice)

  if (!response.ok) {
    const errorText = await response.text()

    // If the configured/default voice is invalid, retry once without `voice`.
    if (response.status === 400 && errorText.includes('Invalid voice') && defaultVoice) {
      console.warn('[SiliconFlow] Invalid voice, retrying without voice')
      response = await requestTts(null)
      if (!response.ok) {
        const retryErrorText = await response.text()
        throw new Error(`TTS API error: ${response.status} - ${retryErrorText}`)
      }
    } else {
      throw new Error(`TTS API error: ${response.status} - ${errorText}`)
    }
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
