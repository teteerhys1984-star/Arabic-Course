import { useEffect, type ReactNode } from 'react'
import type { LessonMeta } from '../../lessons/registry'
import { navigate } from '../../app/useHashRoute'

interface LessonShellProps {
  lesson: LessonMeta
  /** The lesson's sequential flow (LessonFlow), one step visible at a time. */
  children: ReactNode
}

/**
 * Permanent, reusable presentation shell for every Arabic lesson.
 *
 *   LessonShell → LessonFlow → LessonStep → current step content only
 *
 * The shell owns the page chrome only: the brand header and a light hero identifying the
 * lesson. It never renders lesson content itself and never provides scroll-anchor
 * navigation — the student's only way through a lesson is the sequential
 * السابق / التالي pager driven by LessonFlow. Future lessons reuse this shell unchanged.
 */
export function LessonShell({ lesson, children }: LessonShellProps) {
  useEffect(() => {
    const previous = document.title
    document.title = `${lesson.documentTitle} · دروس العربية`
    return () => {
      document.title = previous
    }
  }, [lesson.documentTitle])

  return (
    <div className="lesson-page" dir="rtl">
      <header className="lesson-topbar">
        <div className="lesson-topbar__inner">
          <a
            className="brand"
            href="#/"
            onClick={(event) => {
              event.preventDefault()
              navigate({ name: 'home' })
            }}
            aria-label="العودة إلى فهرس الدورة"
          >
            <span className="brand__mark" aria-hidden="true">ض</span>
            <span>
              <b>دروس العربية</b>
              <small>
                الدرس <bdi>{lesson.number}</bdi> · {lesson.eyebrow}
              </small>
            </span>
          </a>
        </div>
      </header>

      <main className="lesson-main">{children}</main>

      <footer className="lesson-footer">
        <p>
          منصة مستقلة لتعلّم اللغة العربية <span aria-hidden="true">✦</span> الدرس{' '}
          <bdi>{lesson.number}</bdi>: {lesson.eyebrow}
        </p>
        <a
          href="#/"
          className="lesson-footer__home"
          onClick={(event) => {
            event.preventDefault()
            navigate({ name: 'home' })
          }}
        >
          العودة إلى فهرس الدورة
        </a>
      </footer>
    </div>
  )
}
