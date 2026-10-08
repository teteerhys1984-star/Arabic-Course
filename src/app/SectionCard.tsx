import type { MouseEvent } from 'react'
import {
  getSectionLessons,
  lessonsCountLabel,
  toArabicDigits,
  type SectionMeta,
} from '../sections/sectionRegistry'
import { navigate } from './useHashRoute'

/**
 * One premium section card on the platform home. Purely presentational and fully driven
 * by a `SectionMeta` registry entry, so the home page never needs manual edits:
 *
 *   sectionRegistry → SectionCard[] → section grid (CourseHome)
 *
 * The lesson count shown on the card is derived from the lesson registry (every lesson
 * declares its `sectionId`), so it stays truthful automatically as lessons are added.
 * Sections without lessons yet are still fully clickable — they open the section page
 * with its elegant empty state, never a dead card or a broken link.
 *
 * Accessibility: the section title is a real link (`#/sections/<id>`). Its `::after`
 * overlay stretches over the whole card so the entire card is clickable while screen
 * readers hear a single, concise link name (the title). The CTA is a visual affordance
 * only, so it is not announced twice.
 */
export function SectionCard({ section }: { section: SectionMeta }) {
  const availableCount = getSectionLessons(section.id).filter((lesson) => lesson.available).length
  const isEmpty = availableCount === 0
  const href = `#/sections/${section.id}`

  function open(event: MouseEvent<HTMLAnchorElement>) {
    // Let the browser handle new-tab / new-window gestures natively.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigate({ name: 'section', sectionId: section.id })
  }

  return (
    <article
      className={`section-card section-card--${section.accent}${isEmpty ? ' section-card--empty' : ''}`}
    >
      <span className="section-card__watermark" aria-hidden="true">
        {section.glyph}
      </span>

      <div className="section-card__header">
        <span className="section-card__mark" aria-hidden="true">
          {section.glyph}
        </span>
        <p className="section-card__order">
          القسم <bdi>{toArabicDigits(section.order)}</bdi>
        </p>
      </div>

      <h3 className="section-card__title">
        <a className="section-card__link" href={href} onClick={open}>
          {section.title}
        </a>
      </h3>

      <p className="section-card__description">{section.description}</p>

      <div className="section-card__footer">
        <span
          className={
            isEmpty ? 'section-card__count section-card__count--empty' : 'section-card__count'
          }
        >
          <svg className="section-card__book" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 6.5C10.8 5.2 9 4.5 6.8 4.5c-.9 0-1.6.1-2.3.3v12.4c.7-.2 1.4-.3 2.3-.3 2.2 0 4 .7 5.2 2 1.2-1.3 3-2 5.2-2 .9 0 1.6.1 2.3.3V4.8c-.7-.2-1.4-.3-2.3-.3-2.2 0-4 .7-5.2 2z" />
            <path d="M12 6.5v12.4" />
          </svg>
          {lessonsCountLabel(availableCount)}
        </span>
        <span className="section-card__cta" aria-hidden="true">
          تصفح القسم <span className="section-card__arrow">←</span>
        </span>
      </div>
    </article>
  )
}
