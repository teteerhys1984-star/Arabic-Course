import { useEffect, useRef, useState, type ReactNode } from 'react'
import { LessonStep } from './LessonStep'
import { LessonOutline } from './LessonOutline'

export interface LessonStepDefinition {
  /** Stable step id (used for the DOM id and step tracking, never a route change). */
  id: string
  /** Step title rendered by LessonStep. */
  title: string
  /** Optional short title for outline display. */
  shortTitle?: string
  /** Optional grouping / section name in the outline roadmap. */
  group?: string
  /** Optional icon for the step in the outline roadmap. */
  icon?: string
  /** Optional short description rendered under the title. */
  description?: string
  /** The step's own content. Rendered only while this step is the active one. */
  render: () => ReactNode
}

interface LessonFlowProps {
  steps: LessonStepDefinition[]
  /** Called whenever the active step changes, with a 0–100 completion percentage. */
  onProgressChange?: (value: number) => void
  /** Called once the student presses "إتمام الدرس" on the final step. */
  onFinish?: () => void
  /** Optional full lesson title for the outline. */
  lessonTitle?: string
  /** Optional localized lesson number for the outline. */
  lessonNumber?: string
  /** Optional lesson eyebrow for the outline. */
  lessonEyebrow?: string
}

/**
 * Drives the sequential lesson experience: exactly one step is mounted at a time.
 *
 *   LessonShell → LessonFlow → LessonStep → current step content only → السابق / التالي
 *
 * LessonFlow owns which step is active and renders it through a single LessonStep —
 * never the whole lesson at once. A persistent LessonOutline provides a visual roadmap
 * and direct step navigation on desktop and a compact drawer on mobile. There is no
 * scroll-spy, no anchor navigation, and no continuous long document: moving between
 * steps swaps the mounted content, resets scroll to the top of the step, and moves
 * keyboard focus so the change is obvious to assistive technology.
 */
export function LessonFlow({
  steps,
  onProgressChange,
  onFinish,
  lessonTitle,
  lessonNumber,
  lessonEyebrow,
}: LessonFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const total = steps.length
  const current = steps[currentIndex]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === total - 1

  useEffect(() => {
    const percent = Math.round(((currentIndex + 1) / total) * 100)
    onProgressChange?.(percent)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, total])

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    if (!mobileDrawerOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [mobileDrawerOpen])

  // Close mobile drawer on Escape key
  useEffect(() => {
    if (!mobileDrawerOpen) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileDrawerOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileDrawerOpen])

  function goTo(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= total) return
    setCurrentIndex(nextIndex)
    setMobileDrawerOpen(false)
    // Deliberate navigation always lands the student at the top of the new step, and
    // moves focus there so keyboard and screen-reader users notice the step changed.
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      headingRef.current?.focus()
    })
  }

  function handlePrevious() {
    goTo(currentIndex - 1)
  }

  function handleNext() {
    if (isLast) {
      onFinish?.()
      return
    }
    goTo(currentIndex + 1)
  }

  if (!current) return null

  return (
    <div className="lesson-flow-container">
      {/* Mobile outline trigger */}
      <div className="lesson-flow__mobile-bar">
        <button
          type="button"
          className="lesson-flow__mobile-trigger"
          onClick={() => setMobileDrawerOpen(true)}
          aria-expanded={mobileDrawerOpen}
          aria-controls="lesson-mobile-drawer"
          aria-label="عرض فهرس خطوات الدرس"
        >
          <span className="lesson-flow__mobile-trigger-icon" aria-hidden="true">
            {current.icon || '📑'}
          </span>
          <span className="lesson-flow__mobile-trigger-text">
            <strong>محتويات الدرس</strong>
            <small>
              {current.shortTitle || current.title} (<bdi>{currentIndex + 1}</bdi> / <bdi>{total}</bdi>)
            </small>
          </span>
          <span className="lesson-flow__mobile-trigger-action" aria-hidden="true">
            استعراض ▾
          </span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div
          id="lesson-mobile-drawer"
          className="lesson-mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="محتويات الدرس"
        >
          <div
            className="lesson-mobile-drawer__backdrop"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="lesson-mobile-drawer__content">
            <header className="lesson-mobile-drawer__header">
              <h3>محتويات الدرس</h3>
              <button
                type="button"
                className="lesson-mobile-drawer__close"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="إغلاق محتويات الدرس"
              >
                ✕
              </button>
            </header>
            <div className="lesson-mobile-drawer__body">
              <LessonOutline
                steps={steps}
                currentIndex={currentIndex}
                onSelectStep={goTo}
                lessonTitle={lessonTitle}
                lessonNumber={lessonNumber}
                lessonEyebrow={lessonEyebrow}
                variant="drawer"
                onClose={() => setMobileDrawerOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Two-column layout on desktop: sticky sidebar + active step */}
      <div className="lesson-layout">
        <aside className="lesson-layout__sidebar" aria-label="فهرس الدرس الجانبي">
          <LessonOutline
            steps={steps}
            currentIndex={currentIndex}
            onSelectStep={goTo}
            lessonTitle={lessonTitle}
            lessonNumber={lessonNumber}
            lessonEyebrow={lessonEyebrow}
            variant="sidebar"
          />
        </aside>

        <div className="lesson-layout__main">
          <div className="lesson-flow">
            <div className="lesson-flow__progress" role="status" aria-live="polite">
              الخطوة <bdi>{currentIndex + 1}</bdi> من <bdi>{total}</bdi>
            </div>

            <div className="lesson-flow__track" aria-hidden="true">
              <span
                className="lesson-flow__track-fill"
                style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
              />
            </div>

            {/* Subtle step transition: a fresh key remounts the stage, replaying the fade-in. */}
            <div className="lesson-flow__stage" key={current.id}>
              <LessonStep
                id={current.id}
                title={current.title}
                description={current.description}
                ref={headingRef}
              >
                {current.render()}
              </LessonStep>
            </div>

            <nav className="lesson-flow__pager" aria-label="التنقل بين خطوات الدرس">
              <button
                type="button"
                className="button button--secondary lesson-flow__prev"
                onClick={handlePrevious}
                disabled={isFirst}
              >
                <span aria-hidden="true">←</span> السابق
              </button>
              <button
                type="button"
                className="button button--primary lesson-flow__next"
                onClick={handleNext}
              >
                {isLast ? 'إتمام الدرس' : <>التالي <span aria-hidden="true">→</span></>}
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}
