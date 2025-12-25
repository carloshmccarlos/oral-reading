# Oral Reading — Master Product & Implementation Document

This single reference merges the previous *Implementation Plan*, *Progress Log*, and *Website Design Document* so product, UX, and engineering stay aligned as the platform evolves.

---

## 1. Product Overview

### 1.1 Purpose
Oral Reading helps English learners absorb natural, conversational language by reading realistic micro-scenarios (400–700 words) grounded in everyday environments. Stories showcase internal thoughts, spoken lines, and micro-actions so learners “steal the context” instead of memorizing isolated vocabulary.

### 1.2 Target Audience & Goals
- Learners who prefer context-based practice and short, self-contained scenes (5–10 minutes).
- Users who want everyday phrasing (phrasal verbs, fillers, idioms) plus optional Chinese translations.
- Busy people seeking consistent practice through daily scenarios and lightweight review tools (highlight panel, vocabulary list, narration audio).

### 1.3 Core Value Proposition
1. **Real-life narratives** with micro-actions, inner monologue, and dialogue.
2. **Highlighted phrases** (movement verbs, idioms, discourse markers) with definitions/translations.
3. **Interactive learning tools** (phrase list, translation toggle, font size control).
4. **Optional narration audio** for listening + shadowing.

---

## 2. Experience & Design System

### 2.1 Information Architecture
```
Home → Category → Place → Scenario → Learning Tools
```
- **Categories** (Home, Stores, Services, Outdoors, etc.) mirror directories in `scenariors.ts`.
- **Places** are specific contexts (Bedroom, Office Desk).
- **Scenarios** are seeds converted into full stories (strict 1:1 relationship).
- **Learning Tools** (highlighted phrases, vocabulary panel, audio dock) live on every story page.

### 2.2 Scenario Library Principles
- One scenario seed becomes exactly one story.
- Every scenario belongs to a single category and place; multiple seeds exist per place.
- Cards surface title, category/place label, and short description to guide browsing.

### 2.3 Story Page Experience
- **Layout:** Narrative column + vocabulary sidebar (sidebar collapses on mobile).
- **Controls:** Translation toggle, font-size slider, tooltip definitions, audio dock when `audioUrl` exists.
- **Accessibility:** High contrast, responsive typography, keyboard-friendly components (shadcn/ui + Radix).

### 2.4 Visual Guidelines
- Calm palette (bg/surface/text-main/accent) defined in Tailwind theme.
- Serif body font for stories, sans-serif for UI metadata.
- Highlights should be noticeable but unobtrusive (subtle tint/underline).
- Progressive disclosure: translations and definitions appear on hover/tap instead of cluttering the narrative.

---

## 3. Implementation Plan (Phases)

| Phase | Scope & Key Actions | Validation |
|-------|--------------------|------------|
| **1. Project Setup** | Next.js (App Router) bootstrap, strict TS, Biome linting, Tailwind tokens, shadcn/ui primitives, Vitest + Playwright harness. | Dev server runs, lint/test suites clean. |
| **2. Data Modeling** | Switch to Drizzle ORM, define schema (categories → places → scenarios → stories → vocabulary), seed scenario metadata from `scenariors.ts`. | Migrations applied, seed idempotent. |
| **3. Global Shell** | Layout scaffolding, shared header/footer/nav, base typography, placeholder routes. | Navigation links render, responsive shell matches prototypes. |
| **4. Browsing Flows** | Categories, scenario filtering, story route wiring, reusable cards/breadcrumbs. | Compare pages against static prototypes, ensure deep links resolve. |
| **5. Home & Daily Scenario** | Hero parity, category grid cards, daily scenario component, marquee. | Visual QA vs `home.html`. |
| **6. Story + Vocabulary** | Pilot story Markdown, vocabulary highlighting, StoryReader controls. | Highlights + tooltips render correctly; vocab panel populated. |
| **7. Audio Narration** | StoryAudioDock client component, R2 audio URLs, seed support. | Audio dock appears when `audioUrl` exists, playback works. |
| **8. About Page** | Full “How it Works” content mirroring `about.html`, highlight explanations. | Section-by-section parity. |
| **9. Story Generation Pipeline** | Job table helpers, `runGenerationBatch`, cron/API endpoint, admin dashboard monitoring, Cloudflare R2 + SiliconFlow integration. | Manual/cron runs processed safely, job statuses observable. |
| **10–11. QA & Deployment** | Analytics, accessibility, unit/E2E coverage, staging/prod envs, smoke tests, content expansion. | Tests green, staging/production parity confirmed. |

---

## 4. Progress Log (Summary)

| Phase | Status | Highlights |
|-------|--------|------------|
| 1. Project Setup | ✅ (Dec 12, 2025) | App structure migrated to `src/`, strict TS, Biome, Tailwind tokens, shadcn/ui components, Vitest + Playwright ready. |
| 2. Database & Modeling | ✅ (Dec 12) | Prisma removed, Drizzle schema/client/seed added, db tooling configured. |
| 3. Global Layout | ✅ (Dec 12) | Shared header/footer, nav limited to About + Start Reading, typography baseline. |
| 4. Browsing Flows | ✅ (Dec 12) | Categories & scenarios pages, story route, card components, breadcrumb. |
| 5. Home & Daily Scenario | ✅ (Dec 12) | Hero + category grid parity, category cards, daily scenario card styling. |
| 6. Story Model & Vocabulary | ✅ (Dec 15) | Pilot story + vocab seed, StoryReader w/ highlights, translations, font size. |
| 7. Audio Narration | ✅ (Dec 16) | StoryAudioDock, story page wiring, pilot audio env support, R2 test MP3. |
| 8. About Page | ✅ (Dec 16) | Prototype-accurate help page with highlight/translation explainer. |
| 9. Cron Story Generation | ✅ (Dec 18) | Cron endpoint processes single job per run, Vercel schedule `*/10 * * * *`, auth via `CRON_SECRET` or `x-vercel-cron`. |
| 10+. Analytics / Deployment | 🚧 | To be executed after cron steady-state: analytics, accessibility, staging/prod smoke tests, ongoing content expansion. |

Additional recent work:
- **Manual Generation Panel:** Admin dashboard control to run `runGenerationBatch` with any positive limit. Calls `/api/admin/generate` (cookie-auth) and surfaces per-scenario results.
- **Pagination Controls:** Job table paginated (10 per page) with reusable UI component.
- **Limit Removal:** Generation batch no longer caps at 5 stories; only enforces limit ≥ 1.
- **401 Fix (Production):** Manual generation fetch now includes `credentials: 'include'`; API route validates `admin_session` cookie and returns structured errors.

---

## 5. Operational Notes

### 5.1 Story Generation Pipeline
- **Entry Points:** `/api/cron` (cron or admin session) and `/api/admin/generate` (admin-only).
- **Job Safety:** `story_generation_jobs` tracks status, attempts, locks, and errors. Claims jobs sequentially to avoid duplicate work.
- **External Dependencies:** SiliconFlow (story + TTS) via OpenAI-compatible SDK, Cloudflare R2 (AWS S3 client).
- **Observability:** Log scenario slug, timings, success/failure, plus store `lastError` on the job row.

### 5.2 Auth & Security
- Admin login issues a signed `admin_session` cookie (`httpOnly`, `sameSite: 'lax'`, `secure` in production).
- Admin-only APIs verify that cookie; client fetches must send `credentials: 'include'`.
- Cron endpoints accept either `Authorization: Bearer <CRON_SECRET>` or Vercel’s `x-vercel-cron` header.

### 5.3 Content Expansion
- Stories stored as Markdown with optional `audioUrl`.
- Vocabulary items include phrase, meaning_en, optional meaning_zh, and type.
- Highlights rely on phrase pattern matching; editor changes must preserve phrases or update vocabulary entries accordingly.

---

## 6. Next Actions

1. **Analytics & Accessibility (Phase 10):** instrument key interactions, run audits, address findings.
2. **Deployment Hardening (Phase 11):** finalize staging/prod envs, run smoke tests post-deploy.
3. **Automation Enhancements:** once cron backlog clears, consider daily caps, admin notifications, and richer job metrics.
4. **Content Backfill:** continue converting scenario seeds into full stories with vocab + audio to reach initial launch target.

This document should now be treated as the living source of truth for product/design/engineering alignment. Update it whenever architecture, design, or roadmap decisions change.
