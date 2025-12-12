# Architecture – Oral Reading Website

## Directory Structure

```
oral-reading/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout with fonts and metadata
│   │   ├── globals.css         # Tailwind theme and global styles
│   │   ├── page.tsx            # Home page
│   │   ├── about/
│   │   │   └── page.tsx        # About page (Phase 3 scaffold)
│   │   ├── categories/
│   │   │   └── page.tsx        # Categories page (Phase 3 scaffold)
│   │   ├── places/
│   │   │   └── page.tsx        # Places page (Phase 3 scaffold)
│   │   ├── scenarios/
│   │   │   └── page.tsx        # Scenarios page (Phase 3 scaffold)
│   │   ├── today/
│   │   │   └── page.tsx        # Today page (Phase 3 scaffold)
│   │   └── demo/
│   │       └── page.tsx        # Component demo page (dev only)
│   │
│   ├── components/
│   │   ├── site-header.tsx     # Global header shell
│   │   ├── site-nav.tsx        # Header navigation (active state)
│   │   ├── site-footer.tsx     # Global footer shell
│   │   └── ui/                 # shadcn/ui base components
│   │       ├── index.ts        # Barrel export
│   │       ├── button.tsx      # Button with variants
│   │       ├── card.tsx        # Card with header/content/footer
│   │       ├── tooltip.tsx     # Tooltip for phrase definitions
│   │       ├── switch.tsx      # Toggle for translations
│   │       ├── slider.tsx      # Font size control
│   │       └── accordion.tsx   # Collapsible vocabulary panel
│   │
│   ├── lib/
│   │   ├── utils.ts            # cn() class merge utility
│   │   └── db/
│   │       ├── schema.ts       # Drizzle schema (tables + relations)
│   │       ├── client.ts       # Drizzle DB client + pooled pg connection
│   │       └── seed.ts         # Database seed (scenariors.ts → tables)
│   │
│   └── test/
│       └── setup.ts            # Vitest setup with jest-dom
│
├── e2e/                        # Playwright E2E tests
│   └── home.spec.ts
│
├── public/                     # Static assets
├── memory-bank/                # Project documentation
│
├── biome.json                  # Linter/formatter config
├── drizzle.config.ts            # drizzle-kit config (schema + migrations)
├── vitest.config.ts            # Unit test config
├── playwright.config.ts        # E2E test config
├── tsconfig.json               # TypeScript config
└── package.json
```

## Key Files Explained

### Configuration

| File | Purpose |
|------|---------|
| `biome.json` | Linting and formatting rules (single quotes, no semicolons) |
| `tsconfig.json` | TypeScript strict mode, path aliases (`@/*` → `src/*`) |
| `vitest.config.ts` | Unit test runner with React plugin and jsdom |
| `playwright.config.ts` | E2E tests across Chrome, Firefox, Safari, Mobile |
| `drizzle.config.ts` | drizzle-kit config (Postgres dialect, schema path, output folder) |

### Source Files

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout (fonts) + global shell (header/footer/main) |
| `src/app/globals.css` | Tailwind v4 theme tokens + global typography baseline |
| `src/app/*/page.tsx` | Route pages (Phase 3 scaffolds; Phase 4 becomes data-driven) |
| `src/app/page.tsx` | Home page (hero + full-width marquee + daily scenario + category grid) |
| `src/components/site-header.tsx` | Sticky header shell (logo + nav + Start Reading CTA) |
| `src/components/site-nav.tsx` | Header nav (client-only to show active underline) |
| `src/components/site-footer.tsx` | Footer shell (minimal link columns) |
| `src/components/category-card.tsx` | Home page “Pick a Context” category card |
| `src/components/daily-scenario-card.tsx` | Home page “Daily Scenario / Today” feature card |
| `src/components/marquee.tsx` | Full-width marquee banner used on the Home page |
| `src/lib/utils.ts` | `cn()` function for merging Tailwind classes |
| `src/lib/db/schema.ts` | Drizzle schema (tables, constraints, relations) |
| `src/lib/db/client.ts` | Drizzle DB client + pooled Postgres connection |
| `src/lib/db/seed.ts` | Idempotent seed from `memory-bank/scenariors.ts` |
| `src/components/ui/*` | Reusable UI components based on Radix primitives |

## Design Tokens

Defined in `src/app/globals.css` using Tailwind v4 `@theme`:

```css
--color-bg: #F7F7F5          /* Warm bone background */
--color-surface: #FFFFFF      /* Card/panel background */
--color-text-main: #111111    /* Primary text */
--color-text-body: #2C2C2C    /* Story body text */
--color-text-muted: #666666   /* Secondary text */
--color-accent: #D6E865       /* Acid lime highlight */
--color-border: #E0E0E0       /* Borders */

--font-sans: Inter            /* UI text */
--font-serif: Playfair Display /* Headlines, story titles */
--font-body: Georgia          /* Story reading text */

--radius-sm: 8px              /* Cards, inputs */
--radius-pill: 100px          /* Buttons */
--radius-lg: 20px             /* Hero cards */
```

## Component Architecture

### UI Components (`src/components/ui/`)

All components follow shadcn/ui patterns:
- Built on Radix UI primitives for accessibility
- Styled with Tailwind + CVA (class-variance-authority)
- Forwarded refs for composition
- Variant props for different styles

**Button Variants:**
- `default` - Black bg, white text, accent on hover
- `outline` - Border only, fills on hover
- `ghost` - Transparent, subtle hover
- `link` - Underline on hover

**Card** - Hover effect changes to accent background

**Tooltip** - Used for phrase definitions in stories

**Switch** - Translation visibility toggle

**Slider** - Font size adjustment

**Accordion** - Mobile vocabulary panel

## Rendering Strategy

- **Server Components** by default for all pages
- **Client Components** only for:
  - Interactive controls (Switch, Slider)
  - Tooltips with hover state
  - Demo page with useState
  - Active-link styling in global navigation (`site-nav.tsx`)

## Home Page Composition (`src/app/page.tsx`)

- The Home page is a Server Component and fetches:
  - `getCategories()` for the context/category grid
  - `getTodayScenario()` for the “Daily Scenario” card
- It composes three presentational components:
  - `CategoryCard` (one per category)
  - `DailyScenarioCard` (featured “Today” card)
  - `Marquee` (wrapped to break out of the `max-w-container` shell so it spans the full viewport width)

## Database Schema (PostgreSQL)

The database is managed using **Drizzle ORM** and `drizzle-kit`. The source of truth is `src/lib/db/schema.ts`.

### Table: `categories`

Columns:
- `id` (text, PK, default `uuid`)
- `slug` (text, not null, unique)
- `name` (text, not null)
- `description` (text, nullable)
- `source_key` (text, not null, unique) — stable key from `memory-bank/scenariors.ts`
- `created_at` (timestamptz, not null, default now)
- `updated_at` (timestamptz, not null, default now)

Constraints / indexes:
- `categories_pkey` on `id`
- unique on `slug`
- unique on `source_key`

### Table: `places`

Columns:
- `id` (text, PK, default `uuid`)
- `slug` (text, not null)
- `name` (text, not null)
- `description` (text, nullable)
- `source_key` (text, not null) — stable key from `memory-bank/scenariors.ts`
- `category_id` (text, not null) — references `categories.id`
- `created_at` (timestamptz, not null, default now)
- `updated_at` (timestamptz, not null, default now)

Constraints / indexes:
- `places_pkey` on `id`
- `places_category_source_key_unique` unique on (`category_id`, `source_key`)
- `places_category_slug_unique` unique on (`category_id`, `slug`)

### Table: `scenarios`

Columns:
- `id` (text, PK, default `uuid`)
- `slug` (text, not null, unique)
- `title` (text, not null)
- `short_description` (text, not null, default '')
- `seed_text` (text, not null) — original scenario seed string
- `category_id` (text, not null) — references `categories.id`
- `place_id` (text, not null) — references `places.id`
- `created_at` (timestamptz, not null, default now)
- `updated_at` (timestamptz, not null, default now)

Constraints / indexes:
- `scenarios_pkey` on `id`
- unique on `slug`
- `scenarios_category_id_idx` index on `category_id`
- `scenarios_place_id_idx` index on `place_id`
- `scenarios_place_seed_text_unique` unique on (`place_id`, `seed_text`) for idempotent seeding

### Table: `stories`

Columns:
- `id` (text, PK, default `uuid`)
- `slug` (text, not null, unique)
- `title` (text, not null)
- `body` (text, not null, default '') — Markdown body (Phase 5+)
- `audio_url` (text, nullable)
- `scenario_id` (text, not null, unique) — enforces strict 1:1 with `scenarios`
- `created_at` (timestamptz, not null, default now)
- `updated_at` (timestamptz, not null, default now)

Constraints / indexes:
- `stories_pkey` on `id`
- unique on `slug`
- unique on `scenario_id`

### Table: `vocabulary_items`

Columns:
- `id` (text, PK, default `uuid`)
- `phrase` (text, not null)
- `meaning_en` (text, not null)
- `meaning_zh` (text, nullable)
- `type` (text, nullable)
- `story_id` (text, not null) — references `stories.id`
- `created_at` (timestamptz, not null, default now)
- `updated_at` (timestamptz, not null, default now)

Constraints / indexes:
- `vocabulary_items_pkey` on `id`
- `vocabulary_items_story_id_idx` index on `story_id`
- `vocabulary_items_story_phrase_unique` unique on (`story_id`, `phrase`)

## Testing Strategy

- **Unit Tests** (Vitest): Component rendering and behavior
- **E2E Tests** (Playwright): Full user flows across browsers
- **Type Checking**: TypeScript strict mode
- **Linting**: Biome for code quality

## Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # Run Biome linter
pnpm format       # Format with Biome
pnpm fix          # Auto-fix lint issues
pnpm test         # Run unit tests
pnpm test:e2e     # Run E2E tests
```
