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
│   │   ├── places/
│   │   │   └── page.tsx        # Places listing with category filter
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
```

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

2. **Places Page** (`/places?category=slug`)
   - URL-filtered listing of places
   - Uses search params for category filtering

3. **Scenarios Page** (`/scenarios?category=slug&place=slug`)
   - URL-filtered listing of scenarios
   - Filter bar for category selection
   - Uses search params for category/place filtering

4. **Story Page** (`/stories/[slug]`)
   - Two-column layout: story content + vocabulary sidebar
   - Reading typography with `.story-content`, `.term`, `.thought` classes
   - Uses `getScenarioBySlug()` and `getVocabularyItemsByStoryId()`

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

## Rendering Strategy

- Server Components by default.
- Client Components only for interactive controls (switch/slider/tooltips).

## Linting / Formatting

- Biome is the linter/formatter.

## Notes

- Prisma has been removed from the repo and is no longer part of the data layer.
