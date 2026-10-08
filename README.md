# Arabic Course

An independent Arabic-first educational web application built with React, TypeScript, and Vite. The site is a course platform organized as **Arabic Platform → Section → Lessons → LessonFlow**: the homepage lists the platform's five main sections as premium cards, each section page lists its own lessons (or an elegant empty state while it has none), and every lesson opens independently as a sequential, one-step-at-a-time flow. Lesson 1 teaches the three Arabic parts of speech: الاسم والفعل والحرف.

## Commands

```bash
npm install
npm run dev
npm run validate
npm run build
```

The app includes:

- a complete Arabic RTL Lesson 1 source covering الكلام، الاسم، الفعل، والحرف;
- direction-safe mixed text, isolated numbers, and RTL-safe tables;
- source-preserving examples, worked solutions, noun-sign cards, verb classification, the Grammar Detective game, and the five-second challenge;
- the official 20-question end-of-lesson test with student interaction (SELECT → change → CHECK → reveal); and
- a clearly labelled front-end-only Teacher's Space containing the complete answer key, corrections, teacher notes, expected mistakes, and mastery criterion.

Lesson content never displays a WhatsApp/contact block; this is a permanent course-wide rule for all future lessons. The course has exactly **one** official contact element — **المهندس سومر شاهين** with a real WhatsApp link (`wa.me/963930215022`) — declared once in `src/shared/contact/instructorDetails.ts` and rendered by the shared shells, centered in the top bar of the index and of every lesson. It is never duplicated inside lesson content.

## Permanent, reusable platform architecture

The platform's information architecture is **Arabic Platform → Section → Lessons → LessonFlow**. From now on every new lesson belongs to exactly one section, and the UI is never edited by hand when a lesson is added:

- **Section registry** (`src/sections/sectionRegistry.ts`) — single source of truth for the five permanent sections: **الأساسيات والنحو** (`basics-grammar`), **الصرف** (`morphology`), **الإملاء** (`spelling`), **البلاغة** (`rhetoric`), and **القراءة والفهم والتعبير** (`reading-expression`). Each section carries its id, order, title, a short general scope description, and visual metadata (glyph + accent).
- **Lesson registry** (`src/lessons/registry.ts`) — every lesson entry declares its one `sectionId` (typed as `SectionId`), so a future lesson (e.g. `lesson-11` with `sectionId: 'morphology'`) appears automatically under the right section, in the right grid, with the correct lesson count on the section card.
- **Platform home** (`src/app/CourseHome.tsx`) — the sections are the first navigation level: five data-driven `SectionCard`s, never full lesson content and never the lessons directly.
- **Section page** (`src/app/SectionPage.tsx`) — the section's lesson grid (the same premium `LessonCard` components) or an elegant empty state («لا توجد دروس مضافة إلى هذا القسم بعد.») for sections without lessons yet; empty sections are still fully clickable, never broken.
- **Hash routing** (`src/app/useHashRoute.ts`) — keeps the single permanent `Arabic-Course` URL: `#/` is the home (section index), `#/sections` aliases it, `#/sections/<id>` opens a section, and the lesson deep links `#/lesson/<id>` are permanent and unchanged.
- **Breadcrumbs** (`src/app/Breadcrumbs.tsx`) — the hierarchy is always visible: اللغة العربية ← القسم on a section page, and اللغة العربية ← القسم ← الدرس on a lesson page.
- **Sequential lesson shell** (`src/shared/components/LessonShell.tsx`) — reusable chrome for every lesson: `LessonShell → LessonFlow → LessonStep → current step content only`, with the السابق / التالي pager.

## Architecture

- `src/app/` — course router, platform home (section index), section page, section/lesson cards, breadcrumbs, and app shell
- `src/sections/` — the section registry: the five permanent sections and the derived section → lessons grouping
- `src/lessons/` — lesson modules and the lesson registry (every lesson declares its `sectionId`)
- `src/shared/` — reusable shell, educational, quiz, direction, teacher, and contact components
- `src/shared/contact/` — the single source of truth for the instructor's phone number and the shared, centered WhatsApp contact element
- `src/styles/` — RTL-first responsive presentation styles (`sections.css` carries the section index, section cards, section hero, empty state, and breadcrumbs; `contact.css` carries the contact element's layout and states)
- `scripts/check-rtl.mjs` — static RTL foundation validation
- `scripts/check-architecture.mjs` — reusable-architecture validation (section-index home, data-driven section pages, sectionId on every lesson, routing, sequential lesson flow)
- `scripts/check-lesson1.mjs` — Lesson 1 source-fidelity audit and WhatsApp-removal guard
- `docs/lesson1-source-inventory.md` — authoritative Lesson 1 source-section inventory (fidelity contract)
- `.github/workflows/pages.yml` — build, validation, and GitHub Pages deployment

The production base path is `/Arabic-Course/`, matching this repository.
