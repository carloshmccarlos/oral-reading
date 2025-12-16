# Progress Log – Oral Reading Website

## Phase 1: Project Setup and Tooling ✅

**Completed:** December 12, 2025

### What was done:

1. **Project Structure Migration**
   - Migrated from root `app/` to `src/app/` and `src/components/` structure
   - Updated `tsconfig.json` path aliases to point to `src/*`

2. **TypeScript Strict Mode**
   - Enabled all strict TypeScript compiler options: `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitAny`, `noImplicitThis`

3. **Biome Configuration**
   - Replaced ESLint with Biome for linting and formatting
   - Configured single quotes, no semicolons, ES5 trailing commas
   - Set up lint rules for unused variables/imports, const usage

4. **Tailwind CSS with Design Tokens**
   - Configured custom theme variables from UI prototypes:
     - Colors: `bg`, `surface`, `text-main`, `text-body`, `text-muted`, `accent`, `border`
     - Typography: Inter (sans) and Playfair Display (serif)
     - Spacing: `container` (1200px), `nav-height` (70px)
     - Border radius: `sm` (8px), `pill` (100px), `lg` (20px)

5. **shadcn/ui Components**
   - Created base UI components: Button, Card, Tooltip, Switch, Slider, Accordion
   - All components styled with project design tokens
   - Utility function `cn()` for class merging

6. **Testing Framework**
   - Vitest + React Testing Library for unit/component tests
   - Playwright for E2E tests
   - Initial test suite for Button component (4 tests passing)

### Key Files Created:
- `src/app/layout.tsx` - Root layout with fonts
- `src/app/globals.css` - Tailwind theme configuration
- `src/app/page.tsx` - Home page placeholder
- `src/app/demo/page.tsx` - Component demo page
- `src/components/ui/*` - UI component library
- `src/lib/utils.ts` - Utility functions
- `biome.json` - Linter/formatter config
- `vitest.config.ts` - Unit test config
- `playwright.config.ts` - E2E test config

---

## Phase 2: Database and Data Modeling ✅

**Completed:** December 12, 2025

### What was done:

1. **ORM Migration (Prisma → Drizzle)**
   - Removed Prisma tooling and source files
   - Added Drizzle ORM (`drizzle-orm`) and migration tooling (`drizzle-kit`) with Postgres (`pg`)

2. **Drizzle Configuration + DB Layer**
   - Added `drizzle.config.ts` for drizzle-kit
   - Added Drizzle schema at `src/lib/db/schema.ts`
   - Added Drizzle client at `src/lib/db/client.ts` using a pooled `pg` connection

3. **Database Seeding**
   - Added `src/lib/db/seed.ts` to seed Categories, Places, and Scenarios from `memory-bank/scenariors.ts`
   - Ensured the seed is idempotent via conflict upserts

4. **DevEx fixes**
   - Ensured environment variables are loaded for Node-run scripts (so `db:seed` can read `DATABASE_URL`)

### Key Files Created/Updated:
- `drizzle.config.ts`
- `src/lib/db/schema.ts`
- `src/lib/db/client.ts`
- `src/lib/db/seed.ts`
- `package.json`

---

## Next Steps: Phase 3 - Global Layout and Navigation Shell
- Create the root layout and global shell
- Design the navigation structure
- Set up basic typography and reading-friendly layout

---

## Phase 3: Global Layout and Navigation Shell ✅

**Completed:** December 12, 2025

### What was done:

1. **Global Layout Shell**
   - Added a shared header/footer shell in `src/app/layout.tsx`
   - Standardized page container width and horizontal padding using design tokens

2. **Navigation Structure**
   - Added header + footer navigation components
   - Final nav requirement implemented: only **About** and **Start Reading** are exposed (logo still links Home)
   - Start Reading navigates to `/scenarios`

3. **Reading-Friendly Typography Baseline**
   - Added global heading typography baseline in `src/app/globals.css` to match the static HTML prototypes

4. **Route Scaffolding**
   - Added placeholder pages for the main routes to support navigation and future Phase 4 data-driven pages

### Key Files Created/Updated:
- `src/components/site-header.tsx`
- `src/components/site-nav.tsx`
- `src/components/site-footer.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/app/about/page.tsx`
- `src/app/categories/page.tsx`
- `src/app/places/page.tsx`
- `src/app/scenarios/page.tsx`
- `src/app/today/page.tsx`

---

## Phase 4: Content Browsing Flows (Categories, Places, Scenarios) ✅

**Completed:** December 12, 2025

### What was done:

1. **Database Query Helpers**
   - Created `src/lib/db/queries.ts` with reusable query functions for fetching categories, places, scenarios, and stories
   - Functions include: `getCategories`, `getPlacesByCategory`, `getScenariosByPlace`, `getStoryBySlug`

2. **Categories Page (`/categories`)**
   - Implemented directory layout matching `memory-bank/UI/categories.html`
   - Displays all categories with their places in a grid layout
   - Each category section has a left label block (index, heading, description) and right place cards grid
   - Category descriptions seeded to database via `src/lib/db/seed.ts`

3. **Places Page (`/places`)**
   - URL-based filtering by category using search parameters
   - Responsive grid of place cards with scenario counts

4. **Scenarios Page (`/scenarios`)**
   - URL-based filtering by category and place
   - Scenario cards with title, tags, description, and meta info
   - Links to corresponding story pages

5. **Story Detail Page (`/stories/[slug]`)**
   - Two-column layout: story content (left) + vocabulary sidebar (right)
   - Reading typography styles for narrative text
   - Supports `.term` and `.thought` inline styling classes

6. **Reusable Components**
   - `Breadcrumb` - hierarchical navigation trail
   - `PlaceCard` - card for displaying places with scenario counts
   - `ScenarioCard` - card for displaying scenarios with metadata

### Key Files Created/Updated:
- `src/lib/db/queries.ts` - Database query helpers
- `src/app/categories/page.tsx` - Categories directory page
- `src/app/places/page.tsx` - Places listing with filtering
- `src/app/scenarios/page.tsx` - Scenarios listing with filtering
- `src/app/stories/[slug]/page.tsx` - Story detail page
- `src/components/breadcrumb.tsx` - Breadcrumb navigation
- `src/components/place-card.tsx` - Place card component
- `src/components/scenario-card.tsx` - Scenario card component
- `src/app/globals.css` - Added reading typography styles
- `src/lib/db/seed.ts` - Added category descriptions

## Phase 5: Home Page and Daily Scenario ✅

**Completed:** December 12, 2025

### What was done:

1. **Home page UI alignment (home.html parity)**
   - Updated `src/app/page.tsx` hero typography/spacing and CTA button styling to match `memory-bank/UI/home.html`.
   - Made the marquee banner span full viewport width (break out of the global `max-w-container` shell).
   - Adjusted the Home page category grid layout to match the prototype and render correctly with DB-driven categories.

2. **Created missing Home page components**
   - Implemented `src/components/category-card.tsx` (it was previously an empty file, causing the Home page to fail compilation).
   - Updated `src/components/daily-scenario-card.tsx` styling to match the prototype (card radius, left panel background `#EAEAEA`, accent circle overlay).

3. **shadcn/ui Step 5 verification**
   - Confirmed the initial shadcn/ui component set is present and renderable via `src/app/demo/page.tsx`.

4. **DevEx cleanup**
   - Fixed Biome/formatter issues introduced during the Home page UI iteration so the project can build and lint cleanly.

### Key Files Created/Updated:
- `src/app/page.tsx` - Home page hero/marquee/category grid adjustments
- `src/components/category-card.tsx` - Category card used on the Home page
- `src/components/daily-scenario-card.tsx` - Daily scenario ("Today") card styling updates

---

## Phase 6: Story Model and Vocabulary ✅

**Completed:** December 15, 2025

### What was done:

1. **Pilot Story + Vocabulary data**
   - Added an idempotent pilot Story seed with a Markdown body.
   - Seeded pilot Vocabulary Items (phrase + English meaning + optional Chinese + type) linked to the pilot Story.

2. **Query support for story vocabulary**
   - Added a query helper for fetching vocabulary items by `storyId` so the Story UI can render tooltips and the vocab list.

3. **Story reading UI (interactive client component)**
   - Added `StoryReader` to render paragraphs, internal thoughts (`*italic*`), and reading controls.
   - Implemented translation visibility toggle and font size presets.

4. **Vocabulary highlighting + tooltips (no list ↔ story sync)**
   - Implemented pattern-matching highlights in the story body and tooltips for definitions.
   - Kept the vocabulary list independent (no hover/focus linking between list items and highlighted terms).

5. **Story page wiring**
   - Updated the Story page route to fetch vocabulary items and render `StoryReader`.

### Key Files Created/Updated:
- `src/components/story-reader.tsx` - Reading UI, highlighting/tooltips, translation + font size controls
- `src/app/stories/[slug]/page.tsx` - Story route wiring (scenario + vocabulary fetch)
- `src/lib/db/queries.ts` - Added vocabulary query helper
- `src/lib/db/seed.ts` - Pilot story + vocabulary seed

