# Implementation Plan â€?Oral Reading Website

This plan turns the product design and tech stack into concrete, step-by-step implementation work. Each step includes a validation test to confirm correct behavior. No code is specified; follow the official documentation of each tool for exact commands and syntax.

---

## Key Decisions

| Decision | Choice |
|----------|--------|
| Story body format | Markdown |
| Vocabulary linking | Pattern matching (store phrases, match at render time) |
| Scenario:Story relationship | Strictly 1:1, no future expansion |
| Today's Scenario algorithm | Sequential rotation through all scenarios |
| Mobile vocabulary panel | Bottom sheet |
| Category/Place descriptions | None for now (leave blank) |
| Scenario short descriptions | Leave blank for manual entry later |
| Audio storage | Cloudflare R2 (audio uploaded manually later) |
| Analytics | Vercel Analytics only |
| Testing approach | Batch tests at the end of each phase |

---

## Phase 1 â€?Project Setup and Tooling

1. **Initialize the Next.js project structure**
   - Create a new Next.js project using the App Router with TypeScript enabled.
   - Ensure the main source directories follow the structure: `src/app` and `src/components`.
   - Test: Start the development server and open the root URL in the browser. Confirm that the default Next.js starter page loads without runtime or TypeScript errors.

2. **Configure TypeScript strict mode**
   - Enable strict TypeScript settings in the project configuration so all files are checked strictly.
   - Test: Introduce a small intentional type mismatch in a temporary file and confirm the TypeScript compiler flags it, then remove the mismatch.

3. **Set up base linting and formatting**
   - Configure Biome for linting and formatting for Next.js, React, TypeScript, and Tailwind-friendly formatting.
   - Define Biome rules to enforce consistent imports, basic correctness checks, and formatting conventions across `src/app` and `src/components`.
   - Test: Run Biome in both format and check/lint modes across the repository. Confirm it reports no issues after you address any findings, and confirm that re-running it results in no further changes.

4. **Install and configure Tailwind CSS**
   - Add Tailwind CSS and its configuration, ensuring it scans `src/app` and `src/components`.
   - Map the color palette, typography, and spacing tokens from the static HTML prototypes in `memory-bank/UI` (for example, `home.html`, `categories.html`, `places.html`, `scenario.html`, `about.html`) into the Tailwind theme so that background colors, accent color, and fonts match the design.
   - Test: Recreate the header and hero from `memory-bank/UI/home.html` using Tailwind utilities and shadcn/ui components in a temporary page, then open both versions side by side and visually confirm that colors, fonts, spacing, and responsive behavior closely match.

5. **Integrate shadcn/ui components**
   - Install shadcn/ui and configure it to work with Tailwind and the App Router.
   - Generate a minimal initial set of components: Button, Card, Tooltip, Switch/Toggle, Slider or segmented control, Accordion/Collapsible.
   - Test: Create a temporary demo page that renders each of these components. Verify that they render correctly, respond to interactions, and match the visual style goals.

6. **Set up basic testing framework**
   - Add a unit/component testing framework (for example, Vitest plus React Testing Library) and an end-to-end testing framework (for example, Playwright).
   - Test: Write a minimal placeholder test for one component and one simple page. Run both unit and E2E test suites and confirm they pass.

---

## Phase 2 â€?Database and Data Modeling

7. **Configure PostgreSQL connection**
   - Decide on the development database provider (local or managed) and create a database for this project.
   - Configure a connection string for the development environment using environment variables.
   - Test: Use a database client or command-line tool to connect with the same connection string and verify that the connection succeeds.

8. **Define Drizzle schema models**
   - Define the database schema in `src/lib/db/schema.ts` using Drizzleâ€™s Postgres schema helpers.
   - Ensure the relations mirror the hierarchy encoded in `scenariors`: top-level keys as categories, nested object keys as places, and string arrays as scenario seeds (each intended to become one Scenario/Story pair).
   - Test: Generate migrations from the Drizzle schema and confirm the generated SQL includes tables for Category, Place, Scenario, Story, and VocabularyItem and constraints that match the intended relationships.

9. **Run initial database migration**
   - Generate and apply the first migration using `drizzle-kit` to create the tables corresponding to the defined Drizzle schema.
   - Test: Inspect the database (via GUI or CLI) and confirm all tables and constraints exist with the expected columns, uniqueness rules, and indexes.

10. **Create a shared Drizzle database client helper**
    - Implement a single, reusable Drizzle database client in `src/lib/db/client.ts` using a pooled Postgres connection.
    - Test: From a single server-side script or temporary route, perform a simple read from the database and confirm it returns successfully.

11. **Seed the database with initial categories and places**
    - Use `memory-bank/scenariors.ts` as the single source of truth for initial categories and places. Treat each top-level key as a category and each nested object key as a place within that category.
    - When seeding, derive human-readable names and slugs from these keys (for example, mapping `BuildingsAndFacilities` to a display name like â€œBuildings & Facilitiesâ€? while preserving a stable link back to the original keys for future resync.
    - Test: After running the seed script, query the database or use a temporary route to list all categories and places and compare them against `scenariors.ts`. Confirm that:
      - Every top-level key in `scenariors` has a corresponding Category record.
      - Every nested place key has a corresponding Place record associated with the correct Category.

12. **Seed the database with scenario seeds (without full stories)**
    - For each array entry under each place in `memory-bank/scenariors.ts`, create a Scenario record linked to the appropriate Category and Place. Use the string itself as the base for the Scenario title and derive a short description consistent with the product tone.
    - Do not yet add full narrative bodies; only basic metadata (title, short description, and links to Category and Place) so that the Scenario library can be browsed even before stories are written.
    - Test: For at least one sample path (for example, Home â†?Bedroom), count the number of scenario strings in `scenariors.ts` and verify that the same number of Scenario records exists in the database, each correctly linked to the Home category and Bedroom place.

---

## Phase 3 â€?Global Layout and Navigation Shell

13. **Create the root layout and global shell**
   - Implement a root layout in the App Router that includes a header, footer, and main content area, using the header and footer structure from `memory-bank/UI/home.html` and `categories.html` as the primary visual reference.
   - Ensure the layout uses responsive Tailwind classes and matches the sticky header behavior, typography, spacing, and background treatment shown in the static HTML designs.
   - Test: Load at least two routes (for example, Home and Categories) in the Next.js app and open `home.html` / `categories.html` in a browser. Visually compare that the header, footer, and overall shell closely resemble the prototypes while still allowing the main content area to change between routes.

14. **Design the navigation structure**
    - Add navigation links for Home, Categories, Places, Scenarios (if needed), Todayâ€™s Scenario, and About.
    - Ensure navigation behaves well on mobile (for example, collapsible or stacked layout) and desktop.
    - Test: Click through all navigation items in the browser and verify that each route loads and that the active or selected state is visually clear.

15. **Set up basic typography and reading-friendly layout**
   - Define global typography styles and content width for narrative text to ensure a comfortable reading experience, using the body text and headings in `scenario.html` and `about.html` as reference for sizes and line lengths.
   - Apply them to main content containers so text is well sized and line length is reasonable on different screens, mirroring the feel of the static prototypes while leveraging Tailwind utilities.
   - Test: Create a temporary reading page that mirrors a section of `scenario.html` or `about.html`, then compare them side by side on mobile, tablet, and desktop widths to confirm similar line length, font hierarchy, and spacing.

---

## Phase 4 â€?Content Browsing Flows ( Categories, Places, Scenarios)

16. **Implement the Categories page**
   - Implement the `/categories` page to mirror the "Context Directory" layout from `memory-bank/UI/categories.html`, with a page header (breadcrumb, title, subtitle) followed by directory sections for each category.
   - For each category section, render a left-hand label block (index, heading, short description) and a right-hand grid of place cards driven from the database (derived from `scenariors.ts`), including scenario counts where available.
   - Test: Visit the Categories page in the browser and compare it with `categories.html`. Confirm that all seeded categories appear with a similar structure and styling, that each place card links into the correct place/scenario listing, and that the layout remains responsive.

17. **Implement the Places listing page with filtering**
   - Create a page that lists places, filtered by the selected category using URL search parameters and the chosen URL state library; this data should power the place cards shown in the category directory layout.
   - Display places in a responsive grid or list similar to the place cards in `categories.html`, with labels such as â€œHome Â· Bedroomâ€? scenario counts, and optional badges (for example, "Popular").
   - Test: Open the places page (or the places section within `/categories`) with different category parameters and confirm that only the correct places for that category are shown, and that the card layout visually aligns with the static design.

18. **Implement the Scenarios listing page**
   - Build a page that lists scenario cards filtered by category and place, using URL search parameters, following the layout of `memory-bank/UI/places.html` (place hero, filter pill bar, scenario card grid, and optional "Request a Scenario" card).
   - Each scenario card should display title, tags, short description, and meta information (such as read time and difficulty) consistent with the visual design, and link to the corresponding Story page.
   - Test: For a sample place (such as Bedroom), compare the implemented scenarios page with `places.html`. Confirm that the hero header, filter bar, card layout, and hover behavior feel similar, and that clicking a card navigates to the correct Story route.

19. **Wire up breadcrumb navigation for hierarchical browsing**
    - Add breadcrumbs that reflect the path: Home â†?Category â†?Place â†?Scenario.
    - Display them consistently on places and scenarios pages.
    - Test: Navigate from Home to Category, then to Place, then to Scenario. Confirm the breadcrumb trail updates correctly at each level and links back to previous levels work.

20. **Implement the Story detail route**
   - Create the main reading page that loads data for a Story by a unique identifier and displays the title, place, narrative body, and related metadata, using `memory-bank/UI/scenario.html` as the structural reference (minimal header with back link, left-column story, right-column sidebar on desktop, and bottom audio dock).
   - Use server-side rendering with static generation and revalidation where appropriate so that stories load quickly and are SEO-friendly while still reflecting updates.
   - Test: Navigate to a sample story URL by clicking a scenario card and compare the page to `scenario.html`. Confirm that the header, title block, story typography, and basic two-column layout (or stacked layout on mobile) match the design while being fully data-driven.

21. **Connect Scenarios to Stories**
    - Ensure each Scenario is associated with exactly one Story in the data model.
    - Test: For at least one scenario, create a linked Story and verify through a test query that you can start at Scenario and traverse to its Story.

22. **Apply reading-focused layout to the Story page**
   - Use a reading layout similar to `scenario.html`, with a comfortable serif body font, large line height, and clear separation between intro, paragraphs, and internal thoughts.
   - Keep side panels (such as the vocabulary list) in a sticky sidebar on desktop and move them behind a "View Vocabulary" trigger on mobile, so the narrative remains primary while still allowing easy access to learning tools.
   - Test: Open a story on mobile and desktop and compare it visually with `scenario.html`. Verify that text is easy to read, there is no horizontal scrolling, the sidebar and mobile vocab trigger behave as expected, and the overall feel matches the prototype.

---

## Phase 5 — Home Page and Daily Scenario

23. **Implement the Home page hero section**
   - Port the hero area from `memory-bank/UI/home.html` into a React + Tailwind + shadcn/ui implementation, including the main headline ("Don't study English. Steal the Context."), supporting description, and primary/secondary calls to action.
   - Ensure the hero includes clear primary actions such as Start Reading, Browse by Category/Scenarios, and a link to an explanation of how the method works, matching the structure and spacing of the prototype.
   - Test: Load the Home page and compare it to `home.html` on both desktop and mobile. Confirm that core value propositions are visible without scrolling, that the CTAs are in similar positions, and that typography and spacing are close to the design.

24. **Display category and place overviews on Home**
   - Show a concise overview of key categories and a small selection of places or scenarios to invite exploration, mirroring the "Pick a Context" grid from `home.html` (cards for Home, Stores, Transit, Social, etc.).
   - Use cards styled similarly to the cat-card elements in `home.html` (icon, name, meta line, subtle hover state) and link them into deeper pages such as `/categories` or filtered place views.
   - Test: Load the Home page and compare the category card section to `home.html`. Click several cards and confirm they navigate to the correct Categories or Places/Scenarios pages and that the visual behavior (hover, layout) is consistent.

25. **Implement the Today's Scenario logic**
   - Decide on a simple algorithm to select a "Today's Scenario" (for example, random from active scenarios, or rotating by date).
   - Ensure the selection is reproducible for a given day so that users see the same scenario if they return that day.
   - Test: Implement a visual layout for Today's Scenario similar to the "Daily Scenario" section in `home.html` (image or illustration area, tag pill, title, description, meta counts, CTA), then reload the Home page multiple times on the same day and confirm that the chosen scenario stays consistent; simulate a different day and confirm that both the selected scenario and its card content update.

26. **Create the Today's Scenario card component**
    - Design a dedicated card on Home that shows the title, category, place, and short description of the selected scenario.
    - Include a clear call-to-action to read the story.
    - Test: On Home, confirm that the Today's Scenario card displays valid data and that clicking it navigates directly to the corresponding Story page.

---

## Phase 6 — Story Model and Vocabulary

27. **Extend data model to store story bodies and audio references**
    - Store the Story body as **Markdown** text in the database.
    - Store an optional audio URL pointing to **Cloudflare R2** (audio files will be uploaded manually later).
    - Test: Add at least one Story record manually with a sample Markdown body and audio URL, then confirm via database inspection that the fields are saved correctly.

28. **Define vocabulary and highlight linking strategy**
   - Use **pattern matching**: store vocabulary phrases in the database and match them against the story Markdown at render time to produce highlights.
   - This approach is simpler and avoids offset drift when story text is edited.
   - Test: For one story, define a small set of phrases, render the story, and verify that each phrase is highlighted in the correct location without collisions, producing a visual effect similar to the highlights in `scenario.html`.

29. **Seed vocabulary items for a pilot story**
    - For one selected story, create several VocabularyItem records including phrase, English meaning, optional Chinese translation, and type (such as phrasal verb or idiom).
    - Test: Query vocabulary items for that story and confirm they return with correct phrases, meanings, and types.

30. **Render highlighted phrases in the Story text**
    - Update story rendering so phrases that match vocabulary items are visually highlighted according to the design (subtle color, background, or underline).
    - Ensure highlights do not disrupt reading flow or break words awkwardly.
    - Test: Open the pilot story and visually confirm that only the intended phrases are highlighted and that the rest of the text remains unchanged.

31. **Add phrase tooltips with meanings and translations**
    - Make each highlighted phrase interactive with hover (desktop) or tap (mobile) to show a tooltip or panel containing the English meaning and optional Chinese translation.
    - Use accessible tooltip components for focus and keyboard support.
    - Test: On desktop, hover and keyboard-focus over phrases to open tooltips; on mobile, tap phrases. Confirm that tooltips display correct text and close reliably.

32. **Build the vocabulary list panel on the Story page**
   - Add a right-side panel (or below-content section on mobile) listing all vocabulary items for the story, including phrase, English meaning, and optional Chinese translation, modeled on the "Key Phrases" panel in `scenario.html`.
   - Ensure the panel is easy to scan, supports a highlighted state when a term is active, and does not distract from the main narrative, using spacing and typography close to the static design.
   - Test: Open the pilot story on desktop and mobile and compare the panel to `scenario.html`. Confirm the location, item styling, and interaction (including highlight states) work as intended and that all items from the database appear with accurate data.

33. **Add translation visibility controls**
    - Implement a global toggle (for example, a switch) to show or hide translations in both tooltips and the vocabulary panel.
    - Ensure default behavior is sensible for the target audience.
    - Test: Switch translations on and off and confirm that translations hide and show correctly in both highlights and the vocabulary list, without requiring a full page reload.

34. **Add basic font size controls**
    - Provide a simple control (such as a slider or segmented control) to adjust story body font size between at least three presets (small, medium, large).
    - Ensure changes apply only to reading-related text and do not break layout.
    - Test: Toggle through all font sizes on mobile and desktop. Confirm that text remains readable and within the viewport without layout overlaps or clipping.

---

## Phase 7 — Audio Narration Integration

35. **Prepare sample audio files for pilot stories**
    - For at least one story, obtain or create a narration audio file in a web-friendly format and place it in the designated static assets location.
    - Test: Attempt to open the audio file directly in the browser and confirm it plays without errors.

36. **Link audio files in the Story data**
    - Add audio URLs to the corresponding Story records in the database.
    - Test: Query a Story record in a temporary debug view and verify that the audio URL matches the actual audio file path.

37. **Add audio controls to the Story page**
    - Include a simple audio player on the Story page that can play, pause, and seek through the narration.
    - Ensure the player is positioned near the story title or at the top of the content area.
    - Test: Open the Story page, play the audio, pause, and seek. Confirm that audio syncs correctly and there are no overlapping playbacks when navigating between stories.

38. **Refine audio UX for reading and shadowing**
    - Ensure that the audio player's controls are accessible and that volume and progress indicators are easy to use.
    - Consider remembering the last playback position for basic shadowing practice, if within scope.
    - Test: Perform a full listening session on desktop and mobile, checking for glitches, control clarity, and no significant layout shifts while audio is playing.

---

## Phase 8 — About Page

39. **Implement the About / Help page content**
   - Add a page explaining how to use the site, highlighting the narrative approach, phrase highlighting, translations, vocabulary panel, and audio, using `memory-bank/UI/about.html` as the layout and visual reference (hero mission statement, dark "problem" section, method/legend section, features grid, and signature block).
   - Include short â€œhow to read effectivelyâ€?guidance for users within or alongside the method/legend section, keeping tone and structure consistent with the prototype text.
   - Test: Navigate to the About page from the main navigation and compare it side by side with `about.html`. Verify that all major sections exist in the same order, carry similar content, and maintain the intended hierarchy and readability.

40. **Explain highlight and translation behavior**
    - On the About or a dedicated help section, document what highlighted phrases mean and how to interact with them.
    - Include an explanation of the translation toggle and any limitations.
    - Test: Ask a test user or teammate to read the page and then describe, in their own words, how they think highlights and translations work. Adjust content if their understanding is unclear.

---

## Phase 9 — URL State, Filters, and Interactivity

41. **Implement URL-based filtering for Places**
    - Use URL query parameters to filter places by category in a way that supports bookmarking and sharing.
    - Ensure backward and forward browser navigation behaves intuitively when filters change.
    - Test: Change filters on the Places page, then use the browser back and forward buttons. Confirm filters and results update correctly in sync with the URL.

42. **Implement URL-based filtering for Scenarios**
    - Apply the same URL-based filtering approach to the Scenarios page, filtering by both category and place.
    - Test: Share a scenario list URL with specific filters to another browser or device and confirm that opening the link shows the same filtered list.

43. **Keep interactive controls minimal and focused**
    - Ensure that font size, translation toggle, and any other interactive controls are implemented as small, focused client-side components while leaving the rest of the page as server-rendered.
    - Test: Inspect the bundle or network tab in the browser to confirm that client-side JavaScript is limited to the necessary interactive parts and that the initial page loads quickly.

---

## Phase 10 — Analytics, Performance, and Accessibility

44. **Integrate basic analytics**
    - Add pageview tracking using the chosen analytics tools and ensure that Story page views are captured.
    - Test: Visit several pages in a development or staging environment and confirm that pageviews appear in the analytics dashboard.

45. **Track key learning interactions**
    - Add event tracking for interactions such as opening phrase tooltips, toggling translations, and using the Todayâ€™s Scenario entry.
    - Test: Trigger each interaction in a test environment and verify that corresponding events (with clear names) appear in the analytics tool.

46. **Evaluate Core Web Vitals**
    - Run performance audits using browser tools or external services to measure LCP, CLS, and FID.
    - Test: Confirm that all key pages (Home, Categories, Places, Scenarios, Story) achieve acceptable performance scores and that regressions are documented and addressed.

47. **Perform accessibility checks**
    - Use automated accessibility testing tools and manual checks for keyboard navigation, focus states, and sufficient color contrast.
    - Test: Navigate through Home, listing pages, and Story pages using only the keyboard. Confirm that all interactive elements are reachable and clearly focused, and that automated tools report no critical accessibility violations.

---

## Phase 11 — Testing, QA, and Content Expansion

48. **Write unit tests for core components**
    - Add tests for layout, navigation, cards, story reader, and interactive controls (font size, translation toggle).
    - Test: Run the unit test suite and ensure all tests pass. Intentionally break one component behavior to confirm that tests fail appropriately, then fix it.

49. **Create E2E tests for main user flows**
    - Implement end-to-end tests covering: Browse by Category â†?Place â†?Scenario â†?Story; Todayâ€™s Scenario â†?Story; using highlights and vocabulary panel.
    - Test: Run the E2E suite in a clean environment. Confirm that the tests simulate realistic user behavior and complete without failures.

50. **Conduct manual QA on multiple devices**
    - Manually review the site on different screen sizes and browsers (desktop, tablet, mobile) focusing on reading comfort and interaction clarity.
    - Test: Document all visual or interaction issues found, open tickets for them, and verify they are resolved in subsequent test passes.

51. **Add more stories and vocabulary items**
    - Gradually convert additional scenario seeds into full narrative stories with associated vocabulary entries and (when available) audio.
    - Test: After each batch of content additions, spot-check several new stories to ensure navigation, highlighting, vocabulary lists, and audio all work as expected.

---

## Phase 13 â€?Deployment and Environments

52. **Set up staging and production environments**
    - Configure hosting for the application and managed PostgreSQL instances for staging and production.
    - Test: Deploy the application to staging, then verify that all main routes load and can connect to the staging database without errors.

53. **Configure environment variables for each environment**
    - Set environment variables for database URLs, analytics keys, and any other secrets separately for staging and production.
    - Test: In each environment, verify that the app reads the correct environment values (for example, by temporarily exposing them in a debug route or log, then removing the debug code).

54. **Run smoke tests after each deployment**
    - Define a small set of smoke checks: Home loads, Categories and Places list correctly, at least one Story page renders with highlights and vocabulary, and Todayâ€™s Scenario works.
    - Test: After deploying to staging and production, perform these smoke checks manually or via automated scripts and confirm that all pass.

55. **Monitor real-user behavior and iterate**
    - Once users start using the site, monitor analytics, performance metrics, and error logs.
    - Test: At regular intervals, review analytics for story completions, highlight interactions, and Todayâ€™s Scenario usage to confirm they align with the success criteria. Use this data to prioritize future improvements.
