import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync('src/lessons/basics-lesson-14/lesson.css', 'utf8')
const component = readFileSync('src/lessons/LessonBasicsFourteen.tsx', 'utf8')
const mobile = css.slice(css.indexOf('@media (max-width: 600px)'))

describe('basics lesson 14 — responsive and accessibility regression guards', () => {
  it('keeps mobile table captions in a full-width block, not an anonymous narrow table box', () => {
    expect(mobile).toMatch(/\.fourteen-table caption\s*\{[^}]*display: block;[^}]*width: 100%;/)
    expect(mobile).toContain('content: attr(data-label)')
    expect(component).toContain('<caption>')
    expect(component).toContain('scope="col"')
    expect(component).toContain('scope="row"')
  })

  it('uses locally scoped readable metadata, keyboard focus and touch-sized controls without shared style edits', () => {
    expect(css).toContain('.fourteen-lesson .test-page__hint')
    expect(css).toContain('.fourteen-lesson .test-question__type')
    expect(css).toContain('color: #40594f')
    expect(css).toContain(':focus-visible')
    expect(css).toContain('min-height: 48px')
    expect(css).toContain('overflow-wrap: anywhere')
    expect(css).not.toContain('white-space: nowrap')
    expect(css).not.toMatch(/text-align:\s*(left|right)/)
    expect(css).not.toMatch(/(margin|padding)-(left|right):/)
    expect(css).not.toMatch(/direction:\s*(ltr|rtl)/)
  })

  it('wraps long Arabic tokens and keeps the RTL flow without physical direction overrides', () => {
    expect(component).toContain('dir="rtl"')
    expect(component).toContain('<bdi>')
    expect(component).toContain('className="fourteen-lesson"')
    expect(component).not.toMatch(/<img|https?:\/\//)
  })

  it('keeps disclosure controls, the working source button and a real next-lesson link', () => {
    expect(component).toMatch(/id: 'next', title: 'الدرس التالي: كان وأخواتها', group: 'الدرس التالي'/)
    expect(component).toContain('aria-expanded={showHomework}')
    expect(component).toContain('aria-expanded={showSolutions && submitted}')
    expect(component).toContain('صحّح إجاباتي')
    expect(component).toContain('revealFeedback={false}')
    expect(component).toContain('href={nextLesson.route}')
    expect(component).not.toContain('href="#/lesson/basics-lesson-14')
  })
})
