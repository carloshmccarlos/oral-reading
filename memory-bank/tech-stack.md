# Tech Stack – Read Oral English

## 1. High-Level Overview

- **Framework:** Next.js (App Router, React 18, TypeScript)
- **Language:** TypeScript end-to-end
- **Rendering:** RSC-first, mix of static generation (SSG) and server-side rendering (SSR) where needed
- **Styling & UI:** Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Animations:** Framer Motion for subtle page and element transitions
- **State & URL Params:** React state + URL search parameters
- **Validation:** Zod for runtime schema validation (forms, URL/query params, server data)
- **Data Layer:** PostgreSQL + Drizzle ORM (drizzle-orm + drizzle-kit)
- **Deployment:** Vercel (app) + managed Postgres (e.g., Neon/Supabase/Railway)
- **Storage:** PostgreSQL for structured content; static assets (audio, images) in `/public` or object storage (e.g., S3-compatible) later
- **Analytics:** Vercel Analytics + optional PostHog for event tracking

This stack is optimized for: fast reading experience, clean UI, simple deployment, and clear content hierarchy (Category → Place → Scenario → Story → Vocabulary List).

---

## 2. Application Architecture

- **Directory layout**
  - `src/app` – Next.js App Router routes (`/`, `/categories`, `/scenarios`, `/stories/[storySlug]`, `/about`)
  - `src/components` – shared UI components (cards, layout, navigation, story reader, phrase tooltip, vocab panel)
  - `src/components/_...` – feature-scoped private components when needed
  - `src/lib` – utilities (Drizzle DB client, schema, queries, feature helpers, analytics, etc.)
  - `src/lib/db/schema.ts` – data models for categories, places, scenarios, stories, vocabulary entries
  - `drizzle.config.ts` – Drizzle configuration

- **Rendering strategy**
  - Use **React Server Components** by default for pages and most components.
  - Use **static generation (SSG)** with incremental revalidation for:
    - `/` Home
    - `/categories`
    - `/scenarios` list (revalidate periodically as content grows)
    - `/stories/[storySlug]` story pages (static content is ideal for reading + SEO).
  - Use small **client components** only where necessary:
    - Interactive reading controls (font size selector, translation toggle, audio controls)
    - Hover/tap tooltips for phrases

---

## 3. Frontend Stack

- **Next.js + React**
  - App Router for file-based routing and nested layouts.
  - Layouts to share navigation and basic shell across routes.
  - Metadata API for SEO-friendly titles and descriptions per story and route.

- **TypeScript**
  - Strict mode for type safety across pages, components, and data layer.
  - Interfaces for domain entities: `Category`, `Place`, `Scenario`, `Story`, `VocabularyItem`.

- **Tailwind CSS**
  - Mobile-first, utility-based styling for layouts, spacing, and typography.
  - Use a minimal neutral palette with a small set of accent colors for highlights and buttons.
  - Responsive breakpoints to ensure a comfortable reading experience on mobile, tablet, and desktop.

- **shadcn/ui (Radix UI)**
  - Accessible, composable building blocks:
    - `Tooltip` for phrase explanations (with optional Chinese translation)
    - `Switch` or `Toggle` for translation visibility controls
    - `Slider` or segmented control for font size adjustments
    - `Accordion` / `Collapsible` for vocabulary panel on mobile
    - `Card`, `Button`, `Tabs`, etc. for home, categories, and scenarios pages.

- **Framer Motion**
  - Subtle animations for:
    - Page transitions between key routes
    - Fading in story content
    - Expanding/collapsing vocabulary panels or toggles.
  - Keep animations minimal to maintain reading focus.


---

## 4. Data & Backend

- **Database: PostgreSQL**
  - Well-suited for relational content model:
    - Category → Place → Scenario → Story → Vocabulary List.
  - Easy to host on Neon, Supabase, or Railway.

- **ORM: Drizzle ORM**
  - Type-safe SQL with lightweight, explicit schema definitions.
  - Migrations via `drizzle-kit`.
  - Use Drizzle schemas as the source of truth for DB structure.

- **Data modeling (conceptual)**
  - `Category`: id, slug, name, description.
  - `Place`: id, slug, name, categoryId.
  - `Scenario`: id, slug, title, shortDescription, categoryId, placeId.
  - `Story`: id, slug, scenarioId, title, body (rich text or structured blocks), audioUrl (optional).
  - `VocabularyItem`: id, storyId, phrase, meaningEn, meaningZh, type (phrasal verb, idiom, etc.), startOffset/endOffset or other linking mechanism.

- **Content storage**
  - MVP: store story body as rich text (e.g., Markdown or JSON) in the database.
  - Highlights:
    - Either pre-process stories server-side to inject highlight spans, or
    - Store positional metadata (e.g., offsets) and map them when rendering.

- **Audio**
  - Store narration files as static MP3/WebM in `/public/audio/...`.
  - Reference them via `audioUrl` field in `Story`.
  - Render audio using native `<audio>` element or shadcn/ui-compatible component.

- **APIs**
  - Prefer **server components + direct Drizzle queries** over REST/GraphQL for internal consumption.
  - Add dedicated API routes only when needed (e.g., tracking events, future authenticated features).

- **Validation (Zod)**
  - Shared Zod schemas for domain entities and payloads (stories, scenarios, vocabulary items).
  - Validate URL/search params and any user input for interactive controls (e.g., filters).
  - Narrow and validate data loaded from the database or external sources at runtime.

---

## 5. Navigation, UX, and Components

- **Routes** (App Router):
  - `/` – Home, intro, “Start Reading”, “Browse by Category”, “Today’s Scenario”.
  - `/categories` – list of categories.
  - `/scenarios` – scenario cards filtered by category/place.
  - `/stories/[storySlug]` – main story reading page with highlights and vocabulary panel.
  - `/about` – how to use the site and explanation of learning tools.

- **Key components** (in `src/components`):
  - `layout` components: header, footer, main layout, responsive shell.
  - `home` components: hero, category overview, Today’s Scenario card.
  - `categories`/`places`/`scenarios` components: filter bar, list cards, breadcrumbs.
  - `story` components:
    - Story reader (typography-optimized, responsive)
    - Phrase highlight wrapper (client component)
    - Translation toggle
    - Font size control
    - Vocabulary panel (sidebar on desktop, collapsible below on mobile)
    - Audio player.

---

## 6. Analytics & Success Metrics

- **Metrics to capture (aligned with success criteria)**
  - Story page views and completion events (e.g., scroll depth or time-on-page).
  - Interactions with highlighted phrases (hover/tap/open tooltip).
  - Usage of “Today’s Scenario” entry on home.

- **Tools**
  - Vercel Analytics: basic page performance and usage.
  - Optional: PostHog for event-based analytics (custom events for phrase interactions and completion).

---

## 7. Developer Experience & Quality

- **Tooling**
  - TypeScript (strict).
  - ESLint with Next.js + Tailwind + import rules.
  - Prettier for consistent formatting.
  - Zod for runtime schema validation with shared schemas between server and client where appropriate.

- **Testing**
  - Unit and component tests: Vitest + React Testing Library.
  - E2E tests: Playwright for key flows (Browse by Category, Daily Scenario, Story reading + highlights).

- **Performance & Accessibility**
  - Optimize for Core Web Vitals (LCP, CLS, FID):
    - Static pages for stories and lists where possible.
    - Lazy-load non-critical components (e.g., analytics, heavier client widgets).
  - Use Radix/shadcn for accessible components (tooltips, toggles, accordions).
  - High-contrast theme and readable typography per design document.
