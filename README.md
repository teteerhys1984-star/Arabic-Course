# Arabic Course

An independent Arabic-first educational web application built with React, TypeScript, and Vite. Lesson 1 teaches the three Arabic parts of speech: الاسم والفعل والحرف.

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
- the official 20-question end-of-lesson test with student interaction;
- a clearly labelled front-end-only Teacher's Space containing the complete answer key, corrections, teacher notes, expected mistakes, and mastery criterion; and
- the requested WhatsApp contact for المهندس سومر شاهين at `0930215022`.

## Architecture

- `src/lessons/` — lesson modules and the lesson registry
- `src/shared/` — reusable educational, quiz, direction, and teacher components
- `src/styles/` — RTL-first responsive presentation styles
- `scripts/check-rtl.mjs` — static RTL foundation validation
- `.github/workflows/pages.yml` — build, validation, and GitHub Pages deployment

The production base path is `/Arabic-Course/`, matching this repository.
