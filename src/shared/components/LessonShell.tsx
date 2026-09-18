import { useEffect, useState, type ReactNode } from 'react'
import type { LessonMeta } from '../../lessons/registry'
import { navigate } from '../../app/useHashRoute'
import { SectionNav } from './SectionNav'
import { ProgressBar } from './ProgressBar'

interface LessonShellProps {
  lesson: LessonMeta
  /** 0–100 completion of the lesson's interactive milestones. */
  progress: number
  /** The one continuous lesson body (all authoritative sections live here). */
  children: ReactNode
}

/**
 * Permanent, reusable presentation shell for every Arabic lesson.
 *
 * It renders one continuous long page: a strong hero, a compact sticky header that
 * carries the reusable scroll-anchor section navigation and live progress, then the full
 * lesson body. Future lessons reuse this shell unchanged and only supply different
 * authoritative content plus their own `nav` items in the registry.
 */
export function LessonShell({ lesson, progress, children }: LessonShellProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 320)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const previous = document.title
    document.title = `${lesson.documentTitle} · دروس العربية`
    return () => {
      document.title = previous
    }
  }, [lesson.documentTitle])

  return (
    <div className="lesson-page" dir="rtl" id="top">
      <header className={scrolled ? 'lesson-topbar lesson-topbar--condensed' : 'lesson-topbar'}>
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
              <small>الدرس <bdi>{lesson.number}</bdi> · {lesson.eyebrow}</small>
            </span>
          </a>
          <SectionNav items={lesson.nav} />
        </div>
        <div className="lesson-topbar__progress" aria-hidden={!scrolled}>
          <span style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
        </div>
      </header>

      <main className="lesson-main">
        <section className="hero" aria-labelledby="page-title">
          <a
            className="hero__back"
            href="#/"
            onClick={(event) => {
              event.preventDefault()
              navigate({ name: 'home' })
            }}
          >
            <span aria-hidden="true">→</span> كل الدروس
          </a>
          <div className="hero__meta">
            <span>الدرس <bdi>{lesson.number}</bdi></span>
            <span aria-hidden="true">•</span>
            <span>{lesson.strand}</span>
            <span aria-hidden="true">•</span>
            <span><bdi>{lesson.duration}</bdi> دقيقة</span>
          </div>
          <p className="hero__eyebrow">{lesson.eyebrow}</p>
          <h1 id="page-title">{lesson.title}</h1>
          <p className="hero__lead">{lesson.summary}</p>
          <div className="hero__actions">
            <a className="button button--primary" href={`#${lesson.nav[0]?.id ?? ''}`}>
              ابدأ الدرس <span aria-hidden="true">←</span>
            </a>
            <span className="hero__hint">رحلة تعلّم واحدة متصلة من التمهيد حتى الاختبار</span>
          </div>
          <div className="hero__letters" aria-label={lesson.parts.join(' ')} dir="rtl">
            {lesson.parts.map((part, index) => (
              <span key={part} className="hero__letters-item">
                <bdi>{part}</bdi>
                {index < lesson.parts.length - 1 && <span aria-hidden="true">–</span>}
              </span>
            ))}
          </div>
          <ProgressBar value={progress} label="تقدمك في الدرس" />
        </section>

        <div className="lesson-body">{children}</div>
      </main>

      <footer className="lesson-footer">
        <p>
          منصة مستقلة لتعلّم اللغة العربية <span aria-hidden="true">✦</span> الدرس {' '}
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
