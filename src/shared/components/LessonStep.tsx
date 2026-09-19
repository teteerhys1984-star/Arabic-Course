import { forwardRef, type ReactNode } from 'react'

interface LessonStepProps {
  id: string
  title: string
  description?: string
  children: ReactNode
}

/**
 * Renders exactly ONE lesson step's content — never the whole lesson at once.
 *
 * This is the leaf of the sequential architecture:
 *   LessonShell → LessonFlow → LessonStep → current step content only
 *
 * `LessonFlow` is responsible for mounting only the active `LessonStep`; this component
 * never reaches into siblings, never scrolls to an anchor, and never relies on a
 * viewport-observing scroll-spy. It simply presents the current step's title and body,
 * and exposes a focusable heading so LessonFlow can move keyboard focus here after
 * deliberate navigation.
 */
export const LessonStep = forwardRef<HTMLHeadingElement, LessonStepProps>(
  function LessonStep({ id, title, description, children }, ref) {
    return (
      <section className="lesson-step" id={id} aria-labelledby={`${id}-title`}>
        <header className="lesson-step__heading">
          <h2 id={`${id}-title`} tabIndex={-1} ref={ref}>
            {title}
          </h2>
          {description && <p>{description}</p>}
        </header>
        <div className="lesson-step__body">{children}</div>
      </section>
    )
  },
)
