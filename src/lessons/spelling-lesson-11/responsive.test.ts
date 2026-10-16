import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const styles = readFileSync('src/lessons/spelling-lesson-11/lesson.css', 'utf8')
const lesson = readFileSync('src/lessons/LessonSpellingEleven.tsx', 'utf8')

describe('spelling lesson 11 — RTL, responsive and accessibility safeguards', () => {
  it('keeps the lesson RTL-isolated with its own visual identity', () => {
    expect(lesson).toContain('className="tanween-lab-lesson" dir="rtl"')
    expect(lesson).toContain("import './spelling-lesson-11/lesson.css'")
    // هوية مستقلة: لا تُستخدم بادئات الدرس العاشر ولا ألوانه.
    expect(lesson).not.toContain('spell10-')
    expect(styles).not.toContain('#172c3b')
    expect(styles).toContain('.tanween-lab-lesson')
    // لا اتجاهات فيزيائية في ملف الأنماط.
    expect(styles).not.toMatch(/text-align:\s*(left|right)/)
    expect(styles).not.toMatch(/direction:\s*(left|right)/)
  })

  it('shows the tanween marks large enough not to be clipped', () => {
    expect(styles).toMatch(/\.tl-palette__glyph\s*\{[^}]*line-height:\s*1\.9/u)
    expect(styles).toMatch(/\.tl-palette__glyph\s*\{[^}]*padding-block:\s*0\.15rem/u)
    expect(styles).toMatch(/\.tl-specimen__word\s*\{[^}]*line-height:\s*1\.95/u)
    expect(styles).toMatch(/\.tl-lab__word\s*\{[^}]*line-height:\s*1\.95/u)
    expect(styles).toMatch(/font-size:\s*clamp\(1\.7rem/u)
    // لا قصّ للعلامات في حاويات الكلمات.
    expect(styles).not.toMatch(/\.tl-palette[^}]*overflow:\s*hidden/u)
    expect(styles).not.toMatch(/\.tl-specimens[^}]*overflow:\s*hidden/u)
  })

  it('stacks the lab, the tables and the cards on phones without horizontal scrolling of the page', () => {
    expect(styles).toContain('@media (max-width: 640px)')
    expect(styles).toMatch(
      /@media \(max-width: 640px\)[\s\S]*?\.tl-palette\s*\{\s*grid-template-columns:\s*1fr;/u,
    )
    expect(styles).toMatch(
      /@media \(max-width: 640px\)[\s\S]*?\.tl-table thead\s*\{[\s\S]*?clip-path:\s*inset\(50%\);/u,
    )
    expect(styles).toMatch(
      /\.tl-table td::before\s*\{[^}]*content:\s*attr\(data-label\)/u,
    )
    expect(styles).toContain('@media (max-width: 420px)')
    expect(styles).toMatch(/\.tl-table\s*\{[^}]*border-collapse:\s*collapse;/u)
  })

  it('keeps readable tap targets, a strong focus ring and reduced-motion support', () => {
    expect(styles).toMatch(/\.tl-mark-button,\s*\.tl-choice-button\s*\{[^}]*min-height:\s*44px;/u)
    expect(styles).toMatch(/:focus-visible\s*\{\s*outline:\s*3px solid/u)
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)')
    expect(styles).toMatch(/@media \(max-width: 640px\)[\s\S]*?\.tl-table[^{]*\{[^}]*word-break|\.tl-table th,\s*\.tl-table td\s*\{[^}]*word-break:\s*normal;/u)
  })

  it('grades the independent pages through the shared gated page view', () => {
    expect(lesson).toContain('revealFeedback={showTestFeedback}')
    expect(lesson).toContain('<TestPageView')
    expect(lesson).toContain('questionTestIdPrefix="spell11-question"')
    expect(lesson).toMatch(/disabled=\{!baseEngine\.allPagesChecked\}/u)
    expect(lesson.indexOf('<SolutionsArea')).toBeLessThan(lesson.indexOf('<TeacherSpace>'))
    expect(lesson.slice(lesson.indexOf('<TeacherSpace>')).includes('<SolutionsArea')).toBe(false)
  })
})
