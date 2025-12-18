# Implementation Plan — Cron Story + Audio Generation (SiliconFlow Qwen3-Omni)

## Goal

Automatically (on a schedule) generate:

- A **Story** for a **Scenario** (insert/upsert into Postgres via Drizzle)
- A **narration audio file** for that Story
- Upload the audio to object storage (Cloudflare R2 recommended) using an object key **named by the scenario slug**, and save the resulting public URL into `stories.audio_url`

The pipeline must be **idempotent**, **safe to retry**, and **cost-controlled**.

---

## Current State (confirmed)

- DB schema (Drizzle):
  - `scenarios`: `id`, `slug`, `title`, `seedText`, `categoryId`, `placeId`, …
  - `stories`: `id`, `slug` (unique), `title`, `body`, `audioUrl`, `scenarioId` (unique), …
  - `vocabulary_items`: already exists (optional for future extraction)
- App expects story routes at `/stories/[slug]`.
- Current convention (seed) is:
  - `stories.slug === scenarios.slug`
  - `stories.scenarioId === scenarios.id`
  - `stories.audioUrl` is a **public** URL (R2 recommended).

---

## Key Design Decisions

### 1) Cron execution model

Because Next.js serverless/runtime processes are not reliable for long-running background work, the recommended design is:

- **A protected Next.js API route** that runs one “generation batch” (`/api/cron/generate-stories`)
- Triggered by:
  - **Vercel Cron** (if deployed on Vercel), or
  - **GitHub Actions schedule** calling the endpoint, or
  - Any external cron service (UptimeRobot / cron-job.org) calling the endpoint

This keeps deployment simple and avoids maintaining a separate worker service.

### 2) Idempotency + locking

We need to ensure that two cron invocations don’t generate the same scenario simultaneously.

Recommended approach:

- Add a small **job table** to track work and provide a lock.
- Use a DB transaction to “claim” **exactly one** scenario job at a time.
- Process jobs **sequentially**: for each claimed scenario, run a single end-to-end function that does:
  - Generate story
  - Generate audio
  - Upload audio
  - Upsert/update DB
  - Mark the job finished
- Only after that function completes (success or failure), claim the next job.

### 3) Storage

- Upload audio to **Cloudflare R2**.
- Use an object key based on the scenario slug, e.g.
  - `stories/audio/<scenarioSlug>.mp3`

### 4) Content format

- Story body stored as **Markdown** in `stories.body`.
- Use existing `memory-bank/prompt.txt` as the base writing prompt, but make output **machine-parseable**.

---

## Data Model Changes (recommended)

### A) Add a generation job table

Create a new table (Drizzle schema + migration), e.g. `story_generation_jobs`:

- `id` (uuid/text)
- `scenarioId` (text, NOT NULL, UNIQUE)
- `status` (text, NOT NULL)
  - `queued` | `running` | `succeeded` | `failed`
- `attemptCount` (int, default 0)
- `lockedAt` (timestamp, nullable)
- `lockedBy` (text, nullable)  // e.g. request id
- `lastError` (text, nullable)
- `lastAttemptAt` (timestamp, nullable)
- `createdAt`, `updatedAt`

Constraints:

- **UNIQUE**(`scenarioId`) so each scenario has at most one job row.

This table enables:

- Selecting scenarios without stories
- Claiming work safely
- Tracking failures and retries

### B) Optional: store audio object key

Either:

- Derive public URL from `CLOUDFLARE_R2_PUBLIC_URL + objectKey`, and store only `audioUrl` (current behavior), or
- Store `audioObjectKey` in DB as well (requires schema change) for better traceability.

---

## External Integrations

### 1) SiliconFlow (Qwen/Qwen3-Omni-30B-A3B-Instruct)

You already have `openai` SDK installed. The plan is to use it in **OpenAI-compatible mode**:

- `baseURL`: `https://api.siliconflow.cn/v1`
- `apiKey`: SiliconFlow API key from env (`SILICONFLOW_API_KEY`)
- `model`: `Qwen/Qwen3-Omni-30B-A3B-Instruct`

Output needs to include:

- `title`
- `body` (Markdown)
- `keyPhrases` list (will be auto-inserted into `vocabulary_items`)

### 2) Cloudflare R2 upload

To upload audio, use the S3-compatible API via AWS SDK v3:

- Add dependency: `@aws-sdk/client-s3`
- Env vars:
  - `CLOUDFLARE_R2_ACCOUNT_ID`
  - `CLOUDFLARE_R2_ACCESS_KEY_ID`
  - `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
  - `CLOUDFLARE_R2_BUCKET_NAME`
  - `CLOUDFLARE_R2_PUBLIC_URL`

Then upload:

- `Bucket = CLOUDFLARE_R2_BUCKET_NAME`
- `Key = stories/audio/<scenarioSlug>.mp3`
- `ContentType = audio/mpeg`

Set `stories.audioUrl = join(CLOUDFLARE_R2_PUBLIC_URL, Key)`.

---

## Prompt + Response Contract (make it parseable)

Update the story-generation prompt to enforce a strict response format.

Recommended output format: **JSON only** (best for parsing), e.g.

```json
{
  "title": "...",
  "bodyMarkdown": "...",
  "keyPhrases": [
    {
      "phrase": "rummage through",
      "meaningEn": "...",
      "meaningZh": "...",
      "type": "phrasal verb"
    }
  ]
}
```

Notes:

- Keep `bodyMarkdown` to the same “paragraphs split by blank lines” style that the current StoryReader handles.
- Keep internal thoughts as `*italic*` since your renderer already supports it.
- If audio generation is separate, don’t require the story model to output audio.

---

## Audio Generation Contract

Use a **separate TTS endpoint** (confirmed):

- SiliconFlow TTS model/endpoint (to be configured)
- Input = story text (strip Markdown or convert to plain text)
- Output = MP3
- Audio filename/object key: `stories/audio/<scenario.slug>.mp3`

Env vars needed:
- `SILICONFLOW_TTS_MODEL` (TTS model name)
- Or separate TTS endpoint if different from main API

---

## Cron Endpoint Design

### Route

- `POST /api/cron/generate-stories`

### Auth

- Require `Authorization: Bearer <CRON_SECRET>`
- Env var: `CRON_SECRET`

### Parameters (optional)

- `limit` (number of scenarios per run, default: 3)
- `dryRun` (boolean)

### Behavior

- Loop and claim **one job at a time** until `limit` jobs are processed (or no queued jobs remain)
- For each claimed scenario, call one function (conceptually: `generateStoryAndAudioForScenario(scenario)`):
  - Generate story JSON
  - Upsert `stories` (by `scenarioId`)
  - Generate audio
  - Upload audio to R2
  - Update `stories.audioUrl`
  - Mark job `succeeded`
- On failure:
  - Increment `attemptCount`
  - Store `lastError`
  - Mark back to `queued` for automatic retry (up to `MAX_ATTEMPTS`)

### Timeouts

Serverless timeouts can be tight. To avoid a single long run:

- Keep `limit` small (e.g. 1–3)
- Run cron more frequently (e.g. every 10–30 minutes)

---

## Scenario Selection Logic

### Initial backfill

Create job rows for all scenarios missing a story:

- `INSERT INTO story_generation_jobs (scenarioId, status) SELECT scenarios.id, 'queued' FROM scenarios LEFT JOIN stories ... WHERE stories.id IS NULL` (conceptually)

### Claiming a job safely

Within a transaction:

- Select one queued job:
  - `status = 'queued'`
  - OR `status = 'failed'` with `attemptCount < MAX_ATTEMPTS`
  - AND `lockedAt IS NULL OR lockedAt < now() - LOCK_TTL`
- Update it to `running`, set `lockedAt`, `lockedBy`, `lastAttemptAt`, increment `attemptCount`

This is the core “lock” that prevents duplicates.

---

## Upsert Rules (DB)

When writing `stories`:

- `scenarioId` is unique: use it as the upsert target.
- Always set:
  - `slug = scenarios.slug`
  - `title = generated.title` (or keep existing if you want manual override later)
  - `body = generated.bodyMarkdown`
- For `audioUrl`:
  - Only set after successful upload
  - Avoid wiping an existing `audioUrl` if re-running (use `coalesce` or conditional logic)

---

## Observability / Ops

- Log per job:
  - scenario slug
  - timings (story generation, audio generation, upload)
  - token usage (if available)
  - job status
- Add basic protection against runaway cost:
  - `MAX_ATTEMPTS` (e.g. 3)
  - `DAILY_MAX_GENERATIONS`
  - `limit` per cron run

Optional enhancements:

- Send failures to a webhook (Discord/Slack) or store a `lastError` for admin review.

---

## Security Notes (must-do)

- Do not commit API keys.
- Move any keys currently in code into `.env.local` and use env vars.
- Protect the cron endpoint with `CRON_SECRET`.

---

## Implementation Phases

### Phase 1 — Foundations

- Add env vars and config scaffolding
- Add R2 upload utility (S3 client)
- Add SiliconFlow client wrapper (OpenAI SDK with SiliconFlow base URL)

**Validation**

- A local script can call SiliconFlow and return a generated JSON object.
- A local script can upload a dummy MP3 to R2 and you can open the public URL.

### Phase 2 — DB job model

- Add `story_generation_jobs` table via Drizzle
- Add helpers:
  - create missing jobs
  - claim next job
  - mark success/failure

**Validation**

- Manually run a Node script to create jobs for missing stories.
- Confirm “claiming” marks a job running and blocks a second claim.

### Phase 3 — Generation pipeline

- Implement “generate story JSON” from a scenario
- Implement “generate audio” from the story text
- Upload audio to R2 using key = `<scenarioSlug>.mp3`
- Upsert `stories` and set `audioUrl`

**Validation**

- Pick one scenario with no story.
- Run pipeline once.
- Confirm:
  - `stories` row exists with `slug = scenario.slug`
  - `stories.body` has Markdown and renders correctly
  - R2 contains `stories/audio/<slug>.mp3`
  - story page shows audio dock

### Phase 4 — Cron endpoint + scheduling

- Add `/api/cron/generate-stories`
- Add auth guard (`CRON_SECRET`)
- Add `limit` support
- Configure scheduler (choose one):
  - Vercel Cron
  - GitHub Actions scheduled curl
  - External cron service

**Validation**

- Call the endpoint manually with the secret and confirm it processes exactly `limit` jobs.

### Phase 5 — Backfill + steady-state

- Run a backfill to enqueue all scenarios missing stories.
- Let cron generate gradually.
- **First day**: backfill will create jobs for all scenarios; cron will process 3 at a time until complete.

**Validation**

- Track counts:
  - scenarios total
  - stories total
  - jobs succeeded/failed

### Phase 6 — Admin page

- Add `/admin` route (or `/admin/jobs`)
- Display job status table:
  - Scenario slug/title
  - Job status (queued/running/succeeded/failed)
  - Attempt count
  - Last error (if any)
  - Timestamps
- Add basic auth or protect with env var check

**Validation**

- Open admin page and confirm job data displays correctly
- Verify status updates in real-time after cron runs

---

## Confirmed Decisions

- **Deployment**: Vercel (use Vercel Cron)
- **SiliconFlow base URL**: `https://api.siliconflow.cn/v1`
- **Audio generation**: Separate TTS endpoint (not Omni model)
- **Audio format**: MP3
- **R2 object key**: `stories/audio/<scenarioSlug>.mp3`
- **Vocabulary**: Auto-insert `keyPhrases` into `vocabulary_items` table
- **Cron limit**: 3 scenarios per run
- **Retry strategy**: Failed jobs stay `queued` for automatic retry
- **Admin page**: Add job monitoring dashboard at `/admin`
