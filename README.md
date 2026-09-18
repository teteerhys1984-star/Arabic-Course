# Arabic Course

An independent Arabic-first educational web application built with React, TypeScript, and Vite.

## Commands

```bash
npm install
npm run dev
npm run validate
npm run build
```

The app has an RTL-first component foundation, direction-safe mixed text, shared quizzes, lesson navigation, progress display, and a clearly labelled front-end-only Teacher's Space gate.

## Architecture

- `src/lessons/` — lesson modules and the lesson registry
- `src/shared/` — reusable educational, quiz, direction, and teacher components
- `src/utils/` — cross-cutting utilities
- `scripts/check-rtl.mjs` — static RTL foundation validation
- `.github/workflows/pages.yml` — build, validation, and GitHub Pages deployment

The production base path is `/Arabic-Course/`, matching this repository.
