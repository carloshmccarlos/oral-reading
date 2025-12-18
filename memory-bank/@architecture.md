# Architecture – Oral Reading Website

## Directory Structure

```
oral-reading/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout with fonts and metadata
│   │   ├── globals.css         # Tailwind theme and global styles
│   │   ├── page.tsx            # Home page
│   │   ├── categories/
│   │   │   └── page.tsx        # Categories directory page
│   │   ├── scenarios/
│   │   │   └── page.tsx        # Scenarios listing with filters
│   │   ├── stories/
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Story detail page (reading view)
│   │   ├── about/
│   │   │   └── page.tsx        # About page
│   │   ├── today/
│   │   │   └── page.tsx        # Today's scenario (placeholder)
│   │   └── demo/
│   │       └── page.tsx        # Component demo page (dev only)
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui base components
│   │   │   ├── index.ts        # Barrel export
│   │   │   ├── button.tsx      # Button with variants
│   │   │   ├── card.tsx        # Card with header/content/footer
│   │   │   ├── tooltip.tsx     # Tooltip for phrase definitions
│   │   │   ├── switch.tsx      # Toggle for translations
│   │   │   ├── slider.tsx      # Font size control
│   │   │   └── accordion.tsx   # Collapsible vocabulary panel
│   │   ├── story-audio-dock.tsx # Story narration audio dock (client)
│   │   ├── site-header.tsx     # Global header with navigation
│   │   ├── site-nav.tsx        # Navigation links component
│   │   ├── site-footer.tsx     # Global footer
│   │   ├── breadcrumb.tsx      # Hierarchical breadcrumb navigation
│   │   ├── place-card.tsx      # Card for displaying places
│   │   └── scenario-card.tsx   # Card for displaying scenarios
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts       # Drizzle schema (PostgreSQL)
│   │   │   ├── client.ts       # Drizzle client (pg Pool + drizzle)
│   │   │   ├── seed.ts         # Seeds DB from memory-bank/scenariors.ts
│   │   │   └── queries.ts      # Reusable database query functions
│   │   └── utils.ts            # cn() class merge utility
│   │
│   └── test/
│       └── setup.ts            # Vitest setup with jest-dom
│
├── drizzle/                    # drizzle-kit generated SQL migrations
├── e2e/                        # Playwright E2E tests
│   └── home.spec.ts
│
├── public/                     # Static assets
├── memory-bank/                # Project documentation
│
├── drizzle.config.ts           # drizzle-kit config
├── biome.json                  # Linter/formatter config
├── vitest.config.ts            # Unit test config
├── playwright.config.ts        # E2E test config
├── tsconfig.json               # TypeScript config
└── package.json

## Data Layer (PostgreSQL + Drizzle)

### Overview

- Drizzle is the only ORM.
- The schema is defined in `src/lib/db/schema.ts`.
- Migrations are generated and applied via `drizzle-kit`.
- The seed script reads `memory-bank/scenariors.ts` and upserts:
  - Categories
  - Places
  - Scenarios

### Environment Variables

- `DATABASE_URL`
  - Used by both `drizzle-kit` (migrations) and the runtime DB client.
  - The Node-run scripts (like `db:seed`) load env from `.env.local` first, then `.env`.
- `CLOUDFLARE_R2_PUBLIC_URL`
  - Optional base URL used by the seed script to construct a public audio URL for the pilot story.
- `PILOT_STORY_AUDIO_OBJECT_KEY`
  - Optional R2 object key (path) for the pilot story audio.
  - Used together with `CLOUDFLARE_R2_PUBLIC_URL`.
- `PILOT_STORY_AUDIO_URL`
  - Optional full public URL for the pilot story audio (overrides the base URL + object key approach).

### Scripts

```bash
pnpm db:generate   # drizzle-kit generate
pnpm db:migrate    # drizzle-kit migrate
pnpm db:seed       # tsx src/lib/db/seed.ts
```

## Database Schema (Full)

This schema mirrors the domain hierarchy:

Category → Place → Scenario → Story → VocabularyItem

**Note:** The current Drizzle migrations are generated with **0 foreign keys** (drizzle-kit reports `0 fks`).
Relationships are modeled at the ORM level via Drizzle `relations()`.

### Table: `categories`

- **Columns**
  - **`id`**: `text` (PK, default UUID)
  - **`slug`**: `text` (NOT NULL, UNIQUE)
  - **`name`**: `text` (NOT NULL)
  - **`description`**: `text` (NULL)
  - **`source_key`**: `text` (NOT NULL, UNIQUE) (stable key from `scenariors.ts`)
  - **`created_at`**: `timestamp with time zone` (NOT NULL, default now)
  - **`updated_at`**: `timestamp with time zone` (NOT NULL, default now)

- **Relations**
  - **1 → many** `places`
  - **1 → many** `scenarios`

### Table: `places`

- **Columns**
  - **`id`**: `text` (PK, default UUID)
  - **`slug`**: `text` (NOT NULL)
  - **`name`**: `text` (NOT NULL)
  - **`description`**: `text` (NULL)
  - **`source_key`**: `text` (NOT NULL) (stable key from `scenariors.ts`)
  - **`category_id`**: `text` (NOT NULL) (logical relation to `categories.id`)
  - **`created_at`**: `timestamp with time zone` (NOT NULL, default now)
  - **`updated_at`**: `timestamp with time zone` (NOT NULL, default now)

- **Constraints**
  - **UNIQUE** (`category_id`, `source_key`) as `places_category_source_key_unique`
  - **UNIQUE** (`category_id`, `slug`) as `places_category_slug_unique`

- **Relations**
  - **many → 1** `category`
  - **1 → many** `scenarios`

### Table: `scenarios`

- **Columns**
  - **`id`**: `text` (PK, default UUID)
  - **`slug`**: `text` (NOT NULL, UNIQUE)
  - **`title`**: `text` (NOT NULL)
  - **`short_description`**: `text` (NOT NULL, default empty string)
  - **`seed_text`**: `text` (NOT NULL) (seed string from `scenariors.ts`)
  - **`category_id`**: `text` (NOT NULL) (logical relation to `categories.id`)
  - **`place_id`**: `text` (NOT NULL) (logical relation to `places.id`)
  - **`created_at`**: `timestamp with time zone` (NOT NULL, default now)
  - **`updated_at`**: `timestamp with time zone` (NOT NULL, default now)

- **Indexes**
  - `scenarios_category_id_idx` on (`category_id`)
  - `scenarios_place_id_idx` on (`place_id`)

- **Constraints**
  - **UNIQUE** (`place_id`, `seed_text`) as `scenarios_place_seed_text_unique`

- **Relations**
  - **many → 1** `category`
  - **many → 1** `place`
  - **1 → 1** `story`

### Table: `stories`

- **Columns**
  - **`id`**: `text` (PK, default UUID)
  - **`slug`**: `text` (NOT NULL, UNIQUE)
  - **`title`**: `text` (NOT NULL)
  - **`body`**: `text` (NOT NULL, default empty string)
  - **`audio_url`**: `text` (NULL)
  - **`scenario_id`**: `text` (NOT NULL, UNIQUE) (logical relation to `scenarios.id`)
  - **`created_at`**: `timestamp with time zone` (NOT NULL, default now)
  - **`updated_at`**: `timestamp with time zone` (NOT NULL, default now)

- **Relations**
  - **1 → 1** `scenario`
  - **1 → many** `vocabulary_items`

### Table: `vocabulary_items`

- **Columns**
  - **`id`**: `text` (PK, default UUID)
  - **`phrase`**: `text` (NOT NULL)
  - **`meaning_en`**: `text` (NOT NULL)
  - **`meaning_zh`**: `text` (NULL)
  - **`type`**: `text` (NULL)
  - **`story_id`**: `text` (NOT NULL) (logical relation to `stories.id`)
  - **`created_at`**: `timestamp with time zone` (NOT NULL, default now)
  - **`updated_at`**: `timestamp with time zone` (NOT NULL, default now)

- **Indexes**
  - `vocabulary_items_story_id_idx` on (`story_id`)

- **Constraints**
  - **UNIQUE** (`story_id`, `phrase`) as `vocabulary_items_story_phrase_unique`

- **Relations**
  - **many → 1** `story`

## Query Layer (`src/lib/db/queries.ts`)

Reusable async functions for fetching data from the database:

- **`getCategories()`** - Returns all categories ordered by name
- **`getPlacesByCategory(categoryId)`** - Returns places for a category with scenario counts
- **`getScenariosByPlace(placeId)`** - Returns scenarios for a place with category/place info
- **`getScenariosByCategory(categoryId)`** - Returns all scenarios in a category
- **`getStoryBySlug(slug)`** - Returns a story with its vocabulary items
- **`getVocabularyItemsByStoryId(storyId)`** - Returns vocabulary items for a story (used by the Story reader)

## Page Components

### Content Browsing Flow

1. **Categories Page** (`/categories`)
   - Directory layout with category sections
   - Each section: left label block + right place cards grid
   - Uses `getCategories()` and `getPlacesByCategory()`

2. **Scenarios Page** (`/scenarios?category=slug&place=slug`)
   - URL-filtered listing of scenarios
   - Client-side place filter updates state and keeps the URL in sync

3. **Story Page** (`/stories/[slug]`)
   - Two-column layout: story content + vocabulary sidebar
   - Reading typography with `.story-content`, `.term`, `.thought` classes
   - Uses `getScenarioBySlug()` and `getVocabularyItemsByStoryId()`

4. **About Page** (`/about`)
   - Static help/method page aligned to `memory-bank/UI/about.html`
   - Explains the site approach, phrase highlights, translations, and audio shadowing

## Phase 6: Story Model + Vocabulary (Implementation Notes)

### Pilot Content (Seed)

- `src/lib/db/seed.ts` now inserts **one pilot Story** with a Markdown body and **pilot vocabulary items**.
- The pilot Story is linked 1:1 to a seeded Scenario via `stories.scenario_id`.
- Purpose: keep the seed idempotent while providing real data for Story rendering + highlights.

### Story Rendering

- `src/components/story-reader.tsx` is a **Client Component** responsible for:
  - Rendering the Story body as paragraphs (split by blank lines)
  - Minimal Markdown support: `*italic*` segments render as `.thought`
  - Highlighting vocabulary phrases by pattern matching against the rendered text
  - Tooltip definitions using the existing Radix/shadcn `Tooltip`
  - Desktop vocabulary sidebar + mobile accordion list
  - Reading controls: translation toggle (`Switch`) + font size (`Slider`)

### Data Flow

- Server Component: `src/app/stories/[slug]/page.tsx`
  - Fetch scenario + story body via `getScenarioBySlug(slug)`
  - Fetch vocabulary via `getVocabularyItemsByStoryId(storyId)`
  - Pass data into `StoryReader` (client) for interactivity

## Phase 7: Audio Narration (Implementation Notes)

- `stories.audio_url` stores a public URL to a narration audio file (Cloudflare R2 recommended).
- Story playback UI is handled by `src/components/story-audio-dock.tsx` (Client Component) using native HTML audio.
- The Story page (`src/app/stories/[slug]/page.tsx`) renders the dock only when `audioUrl` is present.
- `src/lib/db/seed.ts` supports setting pilot story audio via:
  - `PILOT_STORY_AUDIO_URL`, or
  - `CLOUDFLARE_R2_PUBLIC_URL` + `PILOT_STORY_AUDIO_OBJECT_KEY`
- Reseeding is designed to preserve an existing `audio_url` rather than overwriting it.

## Rendering Strategy

- Server Components by default.
- Client Components only for interactive controls (switch/slider/tooltips).

## Linting / Formatting

- Biome is the linter/formatter.

## Phase 8: Cron Story + Audio Generation (Implementation Notes)

### Overview

Automated pipeline to generate stories and audio narration for all scenarios:

- **Cron endpoint**: `POST /api/cron/generate-stories`
- **Scheduler**: Vercel Cron (every 10 minutes via `vercel.json`)
- **AI model**: SiliconFlow `Qwen/Qwen3-Omni-30B-A3B-Instruct` for story generation
- **TTS**: SiliconFlow TTS endpoint for audio narration
- **Storage**: Cloudflare R2 at `stories/audio/<scenarioSlug>.mp3`

### New Files

- `src/lib/r2.ts` - R2 upload utility using AWS SDK v3
- `src/lib/siliconflow.ts` - SiliconFlow client for story generation + TTS
- `src/lib/generation-pipeline.ts` - Orchestrates story → audio → upload → DB
- `src/lib/db/jobs.ts` - Job queue helpers (claim, mark success/fail, etc.)
- `src/app/api/cron/generate-stories/route.ts` - Protected cron endpoint
- `src/app/admin/page.tsx` - Admin dashboard for job monitoring
- `vercel.json` - Vercel Cron configuration

### New Table: `story_generation_jobs`

- **Columns**
  - **`id`**: `text` (PK, default UUID)
  - **`scenario_id`**: `text` (NOT NULL, UNIQUE)
  - **`status`**: `text` (NOT NULL, default 'queued') - queued | running | succeeded | failed
  - **`attempt_count`**: `integer` (NOT NULL, default 0)
  - **`locked_at`**: `timestamp with time zone` (NULL)
  - **`locked_by`**: `text` (NULL)
  - **`last_error`**: `text` (NULL)
  - **`last_attempt_at`**: `timestamp with time zone` (NULL)
  - **`created_at`**: `timestamp with time zone` (NOT NULL, default now)
  - **`updated_at`**: `timestamp with time zone` (NOT NULL, default now)

- **Indexes**
  - `story_generation_jobs_status_idx` on (`status`)

### Environment Variables (new)

- `SILICONFLOW_API_KEY` - API key for SiliconFlow
- `SILICONFLOW_STORY_MODEL` - Model for story generation (default: `Qwen/Qwen3-Omni-30B-A3B-Instruct`)
- `SILICONFLOW_TTS_MODEL` - Model for TTS audio generation
- `CLOUDFLARE_R2_ACCOUNT_ID` - R2 account ID
- `CLOUDFLARE_R2_ACCESS_KEY_ID` - R2 access key
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY` - R2 secret key
- `CLOUDFLARE_R2_BUCKET_NAME` - R2 bucket name
- `CRON_SECRET` - Secret for authenticating cron requests
- `ADMIN_SECRET` - Secret for protecting `/admin` (login form sets httpOnly cookie)

### Pipeline Flow

1. Cron endpoint receives request (authenticated via `CRON_SECRET` or Vercel Cron header `x-vercel-cron`)
2. Create jobs for any scenarios missing stories
3. Loop: claim one job → generate story → generate audio → upload to R2 → upsert DB → mark succeeded
4. Failed jobs stay `queued` for automatic retry (up to 3 attempts)
5. Default limit: 1 scenario per cron run

### Admin Page

- Route: `/admin`
- Displays job status counts (queued/running/succeeded/failed)
- Shows job table with scenario, status, attempts, errors, timestamps

## Notes

- Prisma has been removed from the repo and is no longer part of the data layer.
