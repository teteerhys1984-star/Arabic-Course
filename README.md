# Arabic Course

An independent Arabic-first educational web application built with React, TypeScript, and Vite. The site is a course platform: a homepage **course index (lesson hub)** links to independent lessons, and each lesson is presented as **one continuous long page** with sticky scroll-anchor section navigation. Lesson 1 teaches the three Arabic parts of speech: الاسم والفعل والحرف.

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

Lessons no longer display any WhatsApp/contact block; this is a permanent course-wide rule for all future lessons.

## Permanent, reusable lesson architecture

Every future lesson reuses the same presentation model and only supplies new authoritative content:

- **Course index homepage / lesson hub** (`src/app/CourseHome.tsx`) — lists lessons and titles only, never full lesson content.
- **Hash routing** (`src/app/useHashRoute.ts`) — keeps the single permanent `Arabic-Course` URL; `#/` is the index and `#/lesson/<id>` opens a lesson independently. No separate website per lesson.
- **Long-page lesson shell** (`src/shared/components/LessonShell.tsx`) — one continuous vertical page: hero, sticky header, progress, and the full lesson body.
- **Scroll-anchor section navigation** (`src/shared/components/SectionNav.tsx`) — compact sticky anchors that smooth-scroll within the same page (never tabs that replace content), with a scroll-spy that highlights the active section.
- **Lesson registry** (`src/lessons/registry.ts`) — single source of truth driving both the index and each lesson's section navigation.

## Architecture

- `src/app/` — course router, homepage index, and app shell
- `src/lessons/` — lesson modules and the lesson registry
- `src/shared/` — reusable shell, section navigation, educational, quiz, direction, and teacher components
- `src/styles/` — RTL-first responsive presentation styles
- `scripts/check-rtl.mjs` — static RTL foundation validation
- `scripts/check-architecture.mjs` — reusable-architecture validation (index homepage, routing, long-page shell, scroll-anchor nav)
- `scripts/check-lesson1.mjs` — Lesson 1 source-fidelity audit and WhatsApp-removal guard
- `docs/lesson1-source-inventory.md` — authoritative Lesson 1 source-section inventory (fidelity contract)
- `.github/workflows/pages.yml` — build, validation, and GitHub Pages deployment

The production base path is `/Arabic-Course/`, matching this repository.
