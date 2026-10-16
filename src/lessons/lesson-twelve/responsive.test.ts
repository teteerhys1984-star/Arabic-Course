import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync('src/lessons/lesson-twelve/lesson.css', 'utf8')
const component = readFileSync('src/lessons/LessonTwelve.tsx', 'utf8')

describe('lesson 12 — responsive and accessibility regression guards', () => {
  it('keeps mobile table captions in a full-width block, not an anonymous narrow table box', () => {
    const mobile = css.slice(css.indexOf('@media (max-width: 600px)'))
    expect(mobile).toMatch(/\.twelve-table caption\s*\{[^}]*display: block;[^}]*width: 100%;/)
    expect(mobile).toContain('content: attr(data-label)')
    expect(component).toContain('<caption>')
    expect(component).toContain('scope="col"')
    expect(component).toContain('scope="row"')
  })

  it('uses locally scoped readable metadata, keyboard focus and touch-sized controls without shared style edits', () => {
    expect(css).toContain('.twelve-lesson .test-page__hint')
    expect(css).toContain('.twelve-lesson .test-question__type')
    expect(css).toContain('color: #40594f')
    expect(css).toContain(':focus-visible')
    expect(css).toContain('min-height: 48px')
    expect(css).toContain('overflow-wrap: anywhere')
    expect(css).not.toContain('white-space: nowrap')
  })

  it('keeps separate outline group names for summary and next-lesson teaser to avoid duplicate shared group keys', () => {
    expect(component).toMatch(/id: 'summary', title: 'خلاصة الدرس للحفظ', group: 'الخاتمة'/)
    expect(component).toMatch(/id: 'next', title: 'تمهيد للدرس الثالث عشر', group: 'الدرس التالي'/)
    expect(component).toContain('aria-expanded={showHomework}')
    expect(component).toContain('aria-expanded={showSolutions && submitted}')
    expect(component).toContain('aria-label={item.n === 1')
  })
})
