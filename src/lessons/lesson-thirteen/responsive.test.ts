import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync('src/lessons/lesson-thirteen/lesson.css', 'utf8')
const component = readFileSync('src/lessons/LessonThirteen.tsx', 'utf8')

describe('lesson 13 — responsive and accessibility regression guards', () => {
  it('keeps mobile table captions in a full-width block, not an anonymous narrow table box', () => {
    const mobile = css.slice(css.indexOf('@media (max-width: 600px)'))
    expect(mobile).toMatch(/\.thirteen-table caption\s*\{[^}]*display: block;[^}]*width: 100%;/)
    expect(mobile).toContain('content: attr(data-label)')
    expect(component).toContain('<caption>')
    expect(component).toContain('scope="col"')
    expect(component).toContain('scope="row"')
  })

  it('uses locally scoped readable metadata, keyboard focus and touch-sized controls without shared style edits', () => {
    expect(css).toContain('.thirteen-lesson .test-page__hint')
    expect(css).toContain('.thirteen-lesson .test-question__type')
    expect(css).toContain('color: #40594f')
    expect(css).toContain(':focus-visible')
    expect(css).toContain('min-height: 48px')
    expect(css).toContain('overflow-wrap: anywhere')
    expect(css).not.toContain('white-space: nowrap')
  })

  it('keeps disclosure controls, the working source button and a linkless next-lesson teaser', () => {
    expect(component).toMatch(/id: 'summary', title: 'عاشرًا: ملخّص الدرس للحفظ', group: 'الخاتمة'/)
    expect(component).toMatch(/id: 'next', title: 'الدرس التالي: الأسماء الخمسة', group: 'الدرس التالي'/)
    expect(component).toContain('aria-expanded={showHomework}')
    expect(component).toContain('aria-expanded={showSolutions && submitted}')
    expect(component).toContain('صحّح إجاباتي')
    expect(component).toContain('revealFeedback={false}')
    expect(component).not.toContain('href="#/lesson/lesson-14')
  })
})
