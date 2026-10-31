import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { LessonMorphologyFourteen } from '../LessonMorphologyFourteen'

describe('morphology lesson 14 — RTL and narrow-screen resilience', () => {
  it('sets RTL and Arabic word isolation and has narrow-screen table overflow rules', () => {
    const { container } = render(<LessonMorphologyFourteen />)
    expect(container.querySelector('.m14-lesson')).toHaveAttribute('dir', 'rtl')
    const styles = readFileSync('src/styles/morphology-lesson-14.css', 'utf8')
    expect(styles).toMatch(/@media\s*\(max-width:\s*640px\)/)
    expect(styles).toContain('overflow-x:auto')
    expect(styles).toContain('unicode-bidi:isolate')
    expect(styles).toContain('min-width:0')
  })
})
