import type { MouseEvent } from 'react'
import type { LessonMeta } from '../lessons/registry'
import { navigate } from './useHashRoute'

/**
 * One premium lesson card on the course index. Purely presentational and fully driven by
 * a `LessonMeta` registry entry, so future lessons appear automatically:
 *
 *   lessonRegistry → LessonCard[] → lesson grid (CourseHome)
 *
 * Accessibility: the lesson title is a real link (`#/lesson/<id>`, the existing hash
 * route). Its `::after` overlay stretches over the whole card so the entire card is
 * clickable while screen readers hear a single, concise link name (the title). The CTA
 * is a visual affordance only, so it is not announced twice.
 */
export function LessonCard({ lesson }: { lesson: LessonMeta }) {
  const href = `#/lesson/${lesson.id}`

  function open(event: MouseEvent<HTMLAnchorElement>) {
    // Let the browser handle new-tab / new-window gestures natively.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    // Same navigation as before (route change + land at the top of the lesson).
    navigate({ name: 'lesson', lessonId: lesson.id })
  }

  return (
    <article className={lesson.available ? 'lesson-card' : 'lesson-card lesson-card--soon'}>
      <span className="lesson-card__watermark" aria-hidden="true">
        {lesson.number}
      </span>

      <div className="lesson-card__header">
        <p className="lesson-card__number">
          الدرس <bdi>{lesson.number}</bdi>
        </p>
        <p className="lesson-card__eyebrow">{lesson.eyebrow}</p>
      </div>

      <h3 className="lesson-card__title">
        {lesson.available ? (
          <a className="lesson-card__link" href={href} onClick={open}>
            {lesson.title}
          </a>
        ) : (
          lesson.title
        )}
      </h3>

      <p className="lesson-card__summary">{lesson.summary}</p>

      <div className="lesson-card__footer">
        <span className="lesson-card__duration">
          <svg className="lesson-card__clock" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7.5V12l3 2" />
          </svg>
          <span>
            <bdi>{lesson.duration}</bdi> دقيقة
          </span>
        </span>
        {lesson.available ? (
          <span className="lesson-card__cta" aria-hidden="true">
            ابدأ الدرس <span className="lesson-card__arrow">←</span>
          </span>
        ) : (
          <span className="lesson-card__soon">قريبًا</span>
        )}
      </div>
    </article>
  )
}
