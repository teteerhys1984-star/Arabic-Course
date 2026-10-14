import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const styles = readFileSync('src/lessons/spelling-lesson-06.css', 'utf8')

describe('spelling lesson 6 — responsive and motion-safe styles', () => {
  it('provides a single-column layout at tablet/mobile widths without splitting Arabic words', () => {
    expect(styles).toMatch(/@media \(max-width: 760px\)[\s\S]*?\.spell6-definition-grid, \.spell6-example-grid[\s\S]*?grid-template-columns: minmax\(0, 1fr\)/u)
    expect(styles).toMatch(/\.spell6-word-focus__whole\s*\{[^}]*word-break: normal;[^}]*overflow-wrap: normal;/u)
    expect(styles).toContain('.spell6-activity-card')
  })

  it('keeps long teacher tables scrollable and provides a narrow-phone breakpoint', () => {
    expect(styles).toMatch(/\.spell6-table-scroll\s*\{[^}]*overflow-x: auto;/u)
    expect(styles).toContain('@media (max-width: 420px)')
    expect(styles).toMatch(/\.spell6-opening__chairs\s*\{[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/u)
  })

  it('respects reduced-motion preferences and has a high-visibility keyboard focus outline', () => {
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)')
    expect(styles).toMatch(/:focus-visible\s*\{[^}]*outline: 3px solid/u)
  })
})
