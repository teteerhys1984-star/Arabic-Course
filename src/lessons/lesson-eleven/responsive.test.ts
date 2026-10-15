import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const styles = readFileSync('src/lessons/lesson-eleven/lesson.css', 'utf8')
const lesson = readFileSync('src/lessons/LessonEleven.tsx', 'utf8')

describe('lesson 11 — RTL and narrow-screen presentation safeguards', () => {
  it('renders original vowel marks attached to base letters and keeps the lesson RTL', () => {
    expect(lesson).toContain('className="eleven-lesson" dir="rtl"')
    expect(lesson).toContain('<bdi>{mark.glyph}</bdi>')
    expect(lesson).toContain('<bdi>{focus}</bdi>')
    expect(styles).toMatch(/\.eleven-focus\s*\{[^}]*font-family: 'Noto Naskh Arabic'/u)
    expect(styles).not.toMatch(/\.eleven-lesson\s*\{[^}]*font-size:\s*(?:0\.|[0-9]+px)/u)
  })

  it('keeps data tables as labelled stacked rows on phones rather than horizontal scrollers', () => {
    expect(styles).toContain('@media (max-width: 680px)')
    expect(styles).toMatch(/\.eleven-table tbody th, \.eleven-table tbody td\s*\{[^}]*display: grid;/u)
    expect(styles).toMatch(/\.eleven-table tbody th::before, \.eleven-table tbody td::before\s*\{[^}]*content: attr\(data-label\);/u)
    expect(styles).toMatch(/\.eleven-table caption\s*\{[^}]*display: block; width: 100%/u)
    expect(styles).toMatch(/\.eleven-table th, \.eleven-table td\s*\{[^}]*overflow-wrap: break-word;[^}]*word-break: normal;/u)
  })

  it('keeps page summaries and correction actions in one visible flex column on mobile', () => {
    expect(styles).toMatch(/\.eleven-lesson \.test-page__actions\s*\{\s*flex-wrap: nowrap;/u)
    expect(styles).toMatch(/\.eleven-lesson \.test-page__summary\s*\{\s*flex-basis: auto; width: 100%; min-width: 0;/u)
    expect(styles).toContain('.eleven-lesson .test-field--choice label { min-height: 44px; }')
    expect(lesson).toContain('<TestPageView page={page} engine={engine} revealFeedback={showTestFeedback}')
  })
})
