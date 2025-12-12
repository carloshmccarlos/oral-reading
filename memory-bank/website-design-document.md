# Casual English Narratives – Website Design Document

## 1. Product Overview

**Website Name (Working Title):** Oral Reading
**Purpose:** Help English learners improve spoken English, natural phrases, and vocabulary by reading realistic daily life narratives set in familiar contexts (home, school, stores, transportation, etc.).

The site emphasizes **context-based learning** instead of isolated vocabulary lists. Learners read short narrative scenes rich in micro-actions, internal thoughts, and casual speech, then interact with highlighted phrases and learning tools.

---

## 2. Target Audience


- **Users who want real-life conversational English**, not textbook-style sentences
- **Learners who prefer context-based learning**, stories, and scenario-based practice
- **Busy users** who want short, self-contained scenarios (5–10 minutes per story)

User goals:
- **Understand and use casual, spoken English** in everyday situations
- **Pick up phrases, idioms, and phrasal verbs** naturally through stories
- **Practice consistently** with daily scenarios and lightweight review tools

---

## 3. Core Value Proposition

- **Realistic narrative scenes** instead of artificial dialogs
- **Micro-actions and objects** (e.g., opening drawers, tossing clothes, tapping a card) to mirror real life
- **Internal monologue + spoken lines** so users see what people *think* and *say*
- **Highlighted phrases with explanations** (including Chinese translations for key terms)
- **Interactive learning tools** (vocabulary lists) directly connected to each story
- **Optional audio narration** for each story to support listening and shadowing practice

The website should feel like following someone’s day and “stealing” their natural English.

---

## 4. Information Architecture

### 4.1 Top-Level Structure

- **Home**
  - Intro to the concept
  - Quick entry points: “Start Reading”, “Browse by Place”, “Today’s Scenario”
- **Categories**
  - Category overview (Home, School, Outdoors, Stores, Transportation, Services, etc.)
  - Each category leads to **Places** which shows **Scenarios**

- **Places**
  - Places overview (Bedroom, etc.)
  - Each place shows **Scenarios**

- **Scenarios**
  - Scenario article page

- **Help / About**
  - How to use the site
  - Explanation of highlights, translations, and tools

### 4.2 Content Hierarchy

**Home → Category → Place → Scenario → Learning Tools**

1. **Home**
2. **Category** (e.g., Home)
3. **Place** within category (e.g., Bedroom, Kitchen, Living Room)
4. **Scenario** (narrative article with interactions, e.g., “Looking for something lost in the 
5. **Embedded Learning Tools** (vocabulary lists)


## 5. Scenario Library Design

### 5.1 Data Model Overview

The scenario library is backed by a structured scenario bank (mirroring the content of the `scenariors` data file). All content is organized into three levels:

1. **Category** – a broad life area (e.g., Home, Transportation, Services).
2. **Place** – a specific location within that category (e.g., Bedroom, Bus Stop, Post Office).
3. **Scenario seed** – a short situation phrase that describes a typical micro-scene in that place (e.g., “Searching for a lost item”, “Picking up packages”, “Starting a work session”).

Design principles:

- **One scenario seed → one narrative story**: each seed is intended to become a full story page.
- **Multiple seeds per place**: places like "Bedroom" or "Grocery Store / Supermarket" have many seeds, giving variety while reusing the same environment.
- **Consistent metadata**: every scenario is always tied to exactly one category and one place so browsing, filtering, and future recommendations remain simple.

### 5.2 Categories & Places

The initial seed data covers the following **categories → places**, which define the navigation structure for the Scenario Library:

- **Home**
  - Bedroom, Master Bedroom, Guest Bedroom, Kids' Room, Bathroom, Master Bathroom, Kitchen, Dining Room, Living Room, Laundry Room, Balcony, Patio, Entryway / Hallway, Storage Room, Home Office, Garage, Basement, Attic, Walk-in Closet, Pantry
- **Buildings & Facilities**
  - Apartment Lobby, Elevator, Stairwell, Rooftop, Underground Parking, Gym, Swimming Pool, Mailroom, Reception Desk, Security Office, Conference Hall, Public Lounge, Vending Machine Area
- **Stores & Markets**
  - Grocery Store / Supermarket, Convenience Store, Clothing Store, Electronics Store, Pharmacy, Bookstore, Furniture Store, Bakery, Café, Farmers Market, Pet Store, Toy Store, Hardware Store, Beauty Supply Store, Sports Store, Jewelry Store, Thrift Shop, Department Store, Music Store
- **Food & Dining**
  - Restaurant, Fast Food Place, Food Court, Coffee Shop, Ice Cream Shop, Buffet, Bar, Dessert Shop, Tea House, Street Food Stall, BBQ Restaurant
- **Public Places**
  - Park, Playground, Street, Sidewalk, Bus Stop, Train Station, Airport, Library, Museum, Theater, Cinema, Mall, Public Restroom, Community Center, Sports Stadium, Swimming Pool (Public), Skate Park, Fountain Plaza, City Square
- **School & Academic**
  - Classroom, Hallway, Cafeteria, Dorm Room, Study Room, Library (school), Lab, Gymnasium, Locker Room, Auditorium, School Bus, Teacher’s Office, Counseling Office, Computer Lab
- **Work & Offices**
  - Office Desk, Break Room, Meeting Room, Elevator Lobby, Reception Area, Coworking Space, Pantry, Printing Room, Warehouse, Server Room
- **Transportation**
  - Car, Bus, Train, Subway, Taxi / Ride-share, Bicycle / Bike Lane, Airport Gate, Airplane, Train Platform, Ticket Counter, Ferry, Ship Deck, Gas Station, Parking Lot, Toll Booth
- **Outdoors & Nature**
  - Beach, Forest, Mountain Trail, Riverbank, Garden, Backyard, Lakeside, Meadow, Campsite, Desert, Cliffside, Waterfall, Hiking Hut, Botanical Garden
- **Services**
  - Hospital, Clinic, Post Office, Bank, Salon / Barbershop, Repair Shop, Dentist, Optician, Police Station, Fire Station, Government Office, Embassy, Laundry Shop, Dry Cleaner, Printing Shop

These lists are seeded from the current scenario data and can grow over time as more places and scenarios are added.

### 5.3 Scenario Entries & Cards

Each **scenario** in the library (once a seed becomes a full narrative story) should have at least:

- **Title** – short and concrete (e.g., “Looking for Your Lost Keys in the Bedroom”, “Picking up packages in the apartment lobby”).
- **Short description** – one-sentence summary of the situation and goal of the scene.
- **Category & place** – automatically derived from the scenario bank (e.g., Home → Bedroom, Services → Post Office).
- **Scenario seed label** – the original short phrase from the scenario bank (for internal use and content planning; may or may not be shown to users).

On the **Scenario Library** page, users browse scenario cards. Each card should show:

- **Title**
- **Category + place** (e.g., “Home · Bedroom”, “Stores & Markets · Grocery Store / Supermarket”)
- **Short description**

From a user’s perspective, the flow is:

1. Choose a **category** (e.g., Home).
2. Choose a **place** within that category (e.g., Bedroom).
3. See a list of **scenario cards** generated from the seeds for that place.
4. Click a card to open the **full story page** for that scenario.
---

## 6. Narrative Story Design

### 6.1 Story Length & Structure

- **Length:** 400–700 words per story
- **Point of View:** Usually first-person (“I”) or close third-person to show thoughts
- **Tone:** Casual, friendly, slightly humorous where appropriate

Typical structure:
- **Opening context**: Where, when, and what’s going on
- **Micro-actions**: Step-by-step actions involving real objects (opening drawers, scrolling phone, grabbing keys)
- **Internal thoughts**: Worries, reactions, jokes, decisions
- **Spoken lines**: Short, natural dialogue or muttering (e.g., “Where did I put that…?”)
- **Resolution**: The situation wraps up; optionally leads into a related future scenario

### 6.2 Language Focus

Stories should be rich in:
- **Spoken English phrases** and fillers (e.g., “you know”, “kind of”, “like”, “basically”)
- **Phrasal verbs** (look for, run into, pick up, put away)
- **Common idioms and chunks** (e.g., “on the bright side”, “in a rush”)
- **Movement verbs and micro-actions** (reach for, toss, slam, shuffle, sip, lean over)
- **Everyday object vocabulary** (drawer, remote, receipt, charger, mug)

### 6.3 Highlighted Elements

Within each story, certain words/phrases are **visually highlighted**:
- Movement verbs
- Phrasal verbs
- Idioms
- Casual phrases / discourse markers
- Key object words (optional)
- but do not see them as words/phrases tags

On hover or tap, a small tooltip or panel shows:
- Simple English definition
- Optional Chinese translation
---

## 7. Story Page Layout & User Experience

### 7.1 General Layout

- **Main content area:** The narrative text, centered with comfortable line length and spacing
- **Highlight behavior:** Key phrases visually distinct (e.g., subtle color/underline) without overwhelming the text
- **Right sidebar:** Shows a list of all key phrases in the story

Example sections on the story page:
- Story title + place
- Audio controls to play/pause the full-story narration (with basic playback options)
- Narrative body with interactive highlights
- Toggle controls (e.g., show/hide translations)
- Phrase summary panel

### 7.2 Interactive Reading Controls

- **Translation toggle:**
  - Global toggle: show/hide Chinese translations in tooltips or phrase list
  - Per-phrase: tap/hover to reveal translation when hidden

### 7.3 Accessibility & Readability

- High contrast between text and background
- Adjustable font size (at least basic small/medium/large options)
- Responsive layout for mobile, tablet, and desktop



## 8. Highlighted Vocabulary & Phrase Panel

On each story page, a dedicated panel lists all key phrases:

- Phrase or word
- Short English meaning
- Optional concise Chinese translation

The panel helps users **quickly review all targets** from the story without scanning the full text again.

---
## 12. Visual & Interaction Design

### 12.1 Visual Style

- **Overall style:** Minimalist, clean, and calm
- **Color usage:**
  - Neutral background for reading
  - One or two accent colors for highlights and buttons
  - Subtle colors for highlights so text remains comfortable to read
- **Typography:**
  - Simple, legible sans-serif for body text
  - Clear hierarchy for titles, subtitles, and metadata (place)

### 12.2 Phrase Highlighting

- Phrases should be **noticeable but not loud**
- Possible styling (to be refined):
  - Slightly tinted background
  - Underline or dotted underline

### 12.3 Layout Principles

- **Reading first:** The narrative is the central element; all tools are secondary and supportive
- **Progressive disclosure:** Advanced details (translations, examples) appear on hover/tap instead of always visible
- **Responsive:** On smaller screens, side panels move below the story; phrase panel stacks as a collapsible section

---

## 13. Navigation & User Flow

### 13.1 Main Flows

1. **Browse by Category**
   - Home → Categories → Choose Category → Choose Place → Choose Scenario → Story Page

3. **Daily Scenario Flow**
   - Home → Click “Today’s Scenario” → Story Page 

### 13.2 Example Detailed Flow

- User selects **Home → Bedroom → “Looking for something lost in the bedroom”**
- On the story page:
  - Reads the narrative
  - Plays the audio narration and practices shadowing key parts of the story
  - Hovers/taps highlighted phrases to see meanings and translations
  - Scrolls down to review the vocabulary list from this scenario
---

## 14. Content Guidelines

### 14.1 Tone & Style

- Conversational, friendly, and modern
- Light humor where appropriate (small jokes, relatable frustrations)
- Avoid heavy slang that becomes outdated quickly; prefer broadly useful casual expressions

### 14.2 Cultural Neutrality

- Choose scenarios that are widely relatable globally (losing keys, running late, ordering coffee)
- Avoid region-specific references that require extra cultural background, unless the phrase itself is being taught explicitly

---

## 15. Non-Goals (Out of Scope for Now)

- Full grammar explanations for every sentence
- Long-form novels or multi-chapter narratives
- Complex social features (friends, direct messaging)
- Detailed technical or implementation information (this document is product/UX-focused only)

---

## 16. Success Criteria

Early success signals:
- Users **finish stories** and interact with highlighted phrases
- Users use the site regularly via the **Daily Scenario** entry point

Longer-term, success is when learners feel they are naturally **picking up everyday English phrases in context** and returning because the stories feel realistic, helpful, and enjoyable.
