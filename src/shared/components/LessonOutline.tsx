import type { LessonStepDefinition } from './LessonFlow'

export interface LessonOutlineProps {
  /** The full sequential step array for the current lesson. */
  steps: LessonStepDefinition[]
  /** 0-based active step index. */
  currentIndex: number
  /** Callback to navigate directly to any step index. */
  onSelectStep: (index: number) => void
  /** Optional full lesson title shown in the outline header. */
  lessonTitle?: string
  /** Optional lesson number for display, e.g. "١" or "1". */
  lessonNumber?: string
  /** Optional lesson eyebrow, e.g. "الجملة الفعلية". */
  lessonEyebrow?: string
  /** Presentation variant: desktop sticky sidebar or mobile drawer sheet. */
  variant?: 'sidebar' | 'drawer'
  /** Optional callback when a step is selected or outline closed. */
  onClose?: () => void
  /** Additional CSS class name. */
  className?: string
}

interface StepGroup {
  name: string
  items: Array<{
    step: LessonStepDefinition
    index: number
  }>
}

/**
 * Groups sequential lesson steps by their `group` metadata while strictly preserving
 * their original sequential order.
 */
function groupSteps(steps: LessonStepDefinition[]): StepGroup[] {
  const groups: StepGroup[] = []
  steps.forEach((step, index) => {
    const groupName = step.group || 'محتوى الدرس'
    const lastGroup = groups[groups.length - 1]
    if (lastGroup && lastGroup.name === groupName) {
      lastGroup.items.push({ step, index })
    } else {
      groups.push({
        name: groupName,
        items: [{ step, index }],
      })
    }
  })
  return groups
}

/**
 * Permanent, reusable Lesson Outline navigation component.
 *
 * It provides a structured, clickable roadmap of all lesson steps:
 * - Data-driven from the current lesson's step definitions
 * - Groups steps visually under clear section headings
 * - Clearly highlights the active step with badge, icon, title, and current marker
 * - Shows progress with step count and a subtle progress bar
 * - Clicking any step navigates immediately via the sequential pager (no anchor hashes / no long-page rendering)
 * - Safe for RTL Arabic and embedded LTR elements
 */
export function LessonOutline({
  steps,
  currentIndex,
  onSelectStep,
  lessonTitle,
  lessonEyebrow,
  variant = 'sidebar',
  onClose,
  className = '',
}: LessonOutlineProps) {
  const total = steps.length
  const percent = total > 0 ? Math.round(((currentIndex + 1) / total) * 100) : 0
  const groups = groupSteps(steps)

  return (
    <nav
      className={`lesson-outline lesson-outline--${variant} ${className}`.trim()}
      aria-label="فهرس خطوات الدرس"
    >
      <header className="lesson-outline__header">
        {(lessonEyebrow || lessonTitle) && (
          <div className="lesson-outline__lesson-info">
            {lessonEyebrow && <span className="lesson-outline__eyebrow">{lessonEyebrow}</span>}
            {lessonTitle && <div className="lesson-outline__lesson-title">{lessonTitle}</div>}
          </div>
        )}

        <div className="lesson-outline__progress-box">
          <div className="lesson-outline__progress-labels">
            <span className="lesson-outline__progress-title">مسار الدرس</span>
            <span className="lesson-outline__progress-count">
              <bdi>{currentIndex + 1}</bdi> / <bdi>{total}</bdi>
            </span>
          </div>
          <div className="lesson-outline__progress-bar" aria-hidden="true">
            <span
              className="lesson-outline__progress-fill"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </header>

      <div className="lesson-outline__groups">
        {groups.map((group) => (
          <div key={group.name} className="lesson-outline__group">
            <div className="lesson-outline__group-title">{group.name}</div>
            <ul className="lesson-outline__list" role="list">
              {group.items.map(({ step, index }) => {
                const isActive = index === currentIndex
                const isPassed = index < currentIndex
                const displayTitle = step.shortTitle || step.title
                return (
                  <li key={step.id} className="lesson-outline__item-wrap" role="listitem">
                    <button
                      type="button"
                      className={`lesson-outline__item ${isActive ? 'is-active' : ''} ${
                        isPassed ? 'is-passed' : ''
                      }`}
                      onClick={() => {
                        onSelectStep(index)
                        onClose?.()
                      }}
                      aria-current={isActive ? 'step' : undefined}
                      aria-label={`الخطوة ${index + 1}: ${displayTitle}`}
                    >
                      <span className="lesson-outline__badge" aria-hidden="true">
                        <bdi>{index + 1}</bdi>
                      </span>
                      {step.icon && (
                        <span className="lesson-outline__icon" aria-hidden="true">
                          {step.icon}
                        </span>
                      )}
                      <span className="lesson-outline__item-title">
                        {displayTitle}
                      </span>
                      {isActive && (
                        <span className="lesson-outline__current-marker" aria-hidden="true">
                          ◀
                        </span>
                      )}
                      {!isActive && isPassed && (
                        <span className="lesson-outline__check-marker" aria-hidden="true">
                          ✓
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )
}
