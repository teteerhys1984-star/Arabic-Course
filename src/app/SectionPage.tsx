import { useEffect, type MouseEvent } from 'react'
import {
  getSectionLessons,
  lessonsCountLabel,
  type SectionMeta,
} from '../sections/sectionRegistry'
import { navigate } from './useHashRoute'
import { Breadcrumbs } from './Breadcrumbs'
import { LessonCard } from './LessonCard'
import { InstructorContact } from '../shared/contact/InstructorContact'

/**
 * One platform section (`#/sections/<id>`), fully data-driven:
 *
 *   sectionRegistry → SectionPage → getSectionLessons(section.id) → LessonCard[] grid
 *                                 → (or the elegant empty state when there is none)
 *
 * The page renders the breadcrumb trail (اللغة العربية ← القسم), a light section hero
 * carrying the section's identity (mark, title, scope, lesson count), and then either
 * the section's lesson grid — the same premium `LessonCard` components and responsive
 * grid used platform-wide — or a clear empty state for sections without lessons yet.
 *
 * An empty section never looks broken: no dead links, no invented placeholder lessons,
 * no fake future tabs — just the honest message
 * «لا توجد دروس مضافة إلى هذا القسم بعد.» with a way back to the sections.
 *
 * Like the platform home and the lesson shell, this page shell renders the one official
 * contact element (`InstructorContact`), centered in the top bar, exactly once.
 */
export function SectionPage({ section }: { section: SectionMeta }) {
  const lessons = getSectionLessons(section.id)
  const availableCount = lessons.filter((lesson) => lesson.available).length

  useEffect(() => {
    const previous = document.title
    document.title = `${section.title} · دروس العربية`
    return () => {
      document.title = previous
    }
  }, [section.title])

  function goHome(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigate({ name: 'home' })
  }

  return (
    <div className="course-home" dir="rtl" id="top">
      <header className="course-topbar">
        <a
          className="brand"
          href="#/"
          onClick={goHome}
          aria-label="العودة إلى أقسام المنصة"
        >
          <span className="brand__mark" aria-hidden="true">ض</span>
          <span>
            <b>دروس العربية</b>
            <small>منصة مستقلة لتعلّم اللغة العربية</small>
          </span>
        </a>
        <InstructorContact />
      </header>

      <main className="course-main">
        <Breadcrumbs
          crumbs={[
            { label: 'اللغة العربية', route: { name: 'home' } },
            { label: section.title, current: true },
          ]}
        />

        <section
          className={`section-hero section-hero--${section.accent}`}
          aria-labelledby="section-title"
        >
          <span className="section-hero__watermark" aria-hidden="true">
            {section.glyph}
          </span>
          <span className="section-hero__mark" aria-hidden="true">
            {section.glyph}
          </span>
          <p className="section-hero__eyebrow">قسم</p>
          <h1 id="section-title">{section.title}</h1>
          <p className="section-hero__lead">{section.description}</p>
          <p className="section-hero__meta">
            <svg className="section-hero__book" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 6.5C10.8 5.2 9 4.5 6.8 4.5c-.9 0-1.6.1-2.3.3v12.4c.7-.2 1.4-.3 2.3-.3 2.2 0 4 .7 5.2 2 1.2-1.3 3-2 5.2-2 .9 0 1.6.1 2.3.3V4.8c-.7-.2-1.4-.3-2.3-.3-2.2 0-4 .7-5.2 2z" />
              <path d="M12 6.5v12.4" />
            </svg>
            {lessonsCountLabel(availableCount)}
          </p>
        </section>

        {lessons.length > 0 ? (
          <section className="lesson-index" aria-labelledby="section-lessons-title">
            <h2 className="lesson-index__title" id="section-lessons-title">
              دروس القسم
            </h2>
            <ol className="lesson-index__list" role="list" aria-labelledby="section-lessons-title">
              {lessons.map((lesson) => (
                <li key={lesson.id}>
                  <LessonCard lesson={lesson} />
                </li>
              ))}
            </ol>
          </section>
        ) : (
          <section className={`section-empty section-empty--${section.accent}`} aria-labelledby="section-empty-title">
            <div className="section-empty__panel">
              <span className="section-empty__mark" aria-hidden="true">
                {section.glyph}
              </span>
              <h2 className="section-empty__title" id="section-empty-title">
                لا توجد دروس مضافة إلى هذا القسم بعد.
              </h2>
              <p className="section-empty__text">
                عند إضافة أول درس إلى قسم «{section.title}» سيظهر هنا تلقائيًا ضمن شبكة الدروس.
              </p>
              <span className="section-empty__ornament" aria-hidden="true">
                ✦
              </span>
              <a className="button button--ghost section-empty__back" href="#/" onClick={goHome}>
                العودة إلى الأقسام
              </a>
            </div>
          </section>
        )}
      </main>

      <footer className="course-footer">
        <p>
          منصة مستقلة لتعلّم اللغة العربية <span aria-hidden="true">✦</span> {section.title}
        </p>
      </footer>
    </div>
  )
}
