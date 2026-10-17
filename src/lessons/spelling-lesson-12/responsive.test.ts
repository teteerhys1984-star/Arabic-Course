import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const styles = readFileSync('src/lessons/spelling-lesson-12/lesson.css', 'utf8')
const lesson = readFileSync('src/lessons/LessonSpellingTwelve.tsx', 'utf8')

describe('spelling lesson 12 — RTL, responsive and accessibility safeguards', () => {
  it('keeps the lesson RTL-isolated with its own visual identity', () => {
    expect(lesson).toContain('className="omit-add-lesson" dir="rtl"')
    expect(lesson).toContain("import './spelling-lesson-12/lesson.css'")
    // هوية مستقلة: لا تُستخدم بادئات الدرس الحادي عشر ولا ألوانه.
    expect(lesson).not.toContain('spell11-teacher')
    expect(styles).not.toContain('#593f9e')
    expect(styles).toContain('.omit-add-lesson')
    // لا اتجاهات فيزيائية في ملف الأنماط.
    expect(styles).not.toMatch(/text-align:\s*(left|right)/)
    expect(styles).not.toMatch(/direction:\s*(left|right)/)
  })

  it('keeps generous line heights so diacritics are never clipped', () => {
    expect(styles).toMatch(/\.omit-add-lesson\s*\{[^}]*line-height:\s*1\.95/u)
    expect(styles).toMatch(/\.omit-add-lesson bdi,\s*\n\s*\.omit-add-lesson \.ol-hero-word,[\s\S]*?line-height:\s*1\.95/u)
  })

  it('stacks the tables and the cards on phones without horizontal scrolling of the page', () => {
    expect(styles).toContain('@media (max-width: 640px)')
    // الجداول تتحوّل إلى بطاقات بيانات موسومة بدل الاقتطاع.
    expect(styles).toMatch(
      /@media \(max-width: 640px\)[\s\S]*?\.ol-table thead\s*\{[\s\S]*?clip-path:\s*inset\(50%\);/u,
    )
    expect(styles).toMatch(/\.ol-table td::before\s*\{[^}]*content:\s*attr\(data-label\)/u)
    expect(styles).toContain('@media (max-width: 420px)')
    expect(styles).toMatch(/\.ol-table\s*\{[^}]*border-collapse:\s*collapse;/u)
  })

  it('keeps readable tap targets, a strong focus ring and reduced-motion support', () => {
    expect(styles).toMatch(/:focus-visible\s*\{\s*outline:\s*3px solid/u)
    expect(styles).toMatch(/\.ol-protocol__number\s*\{[^}]*min-block-size:\s*44px;/u)
    expect(styles).toMatch(/\.ol-protocol__number\s*\{[^}]*min-inline-size:\s*44px;/u)
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)')
  })

  it('grades the independent pages through the shared gated page view', () => {
    expect(lesson).toContain('revealFeedback={showTestFeedback}')
    expect(lesson).toContain('<TestPageView')
    expect(lesson).toContain('questionTestIdPrefix="spell12-question"')
    expect(lesson).toMatch(/disabled=\{!baseEngine\.allPagesChecked\}/u)
    expect(lesson.indexOf('<SolutionsArea')).toBeLessThan(lesson.indexOf('<TeacherSpace>'))
    expect(lesson.slice(lesson.indexOf('<TeacherSpace>')).includes('<SolutionsArea')).toBe(false)
  })
})
