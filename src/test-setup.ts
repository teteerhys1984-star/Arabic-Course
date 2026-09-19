import '@testing-library/jest-dom/vitest'

// jsdom exposes window.scrollTo as a stub that logs "Not implemented" to the console
// when called. LessonFlow calls it after deliberate step navigation; replace the stub
// unconditionally with a silent no-op so tests run cleanly.
if (typeof window !== 'undefined') {
  window.scrollTo = () => {}
}
