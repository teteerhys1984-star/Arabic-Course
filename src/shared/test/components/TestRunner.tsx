import { useState } from 'react'
import { TestPageView } from './TestPageView'
import { useTestEngine, type TestEngine } from '../useTestEngine'
import type { TestDefinition } from '../types'

/**
 * Shared test runner: renders a whole `TestDefinition` (one or more pages) with
 * internal page navigation, a «تحقّق من الإجابات» action at the end of EVERY page
 * (rendered by TestPageView), and — once every page has a valid check — the
 * final result combining the latest valid page results.
 *
 * The runner works standalone (it creates its own engine) or controlled (pass
 * an engine created in the lesson component, so answers and page results survive
 * LessonFlow step navigation).
 */
interface TestRunnerProps {
  test: TestDefinition
  /** Optional externally-owned engine (recommended inside lessons). */
  engine?: TestEngine
  /** Extra class for lesson-specific styling hooks. */
  className?: string
  /** data-testid suffix, e.g. «lesson1-official-test». */
  testId?: string
  /** Optional prefix for per-question test ids, e.g. «lesson8-test» → «lesson8-test-q1». */
  questionTestIdPrefix?: string
}

export function TestRunner({ test, engine: engineProp, className, testId, questionTestIdPrefix }: TestRunnerProps) {
  const ownEngine = useTestEngine(test)
  const engine = engineProp ?? ownEngine
  const [currentIndex, setCurrentIndex] = useState(0)
  const total = test.pages.length
  const current = test.pages[Math.min(currentIndex, total - 1)]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === total - 1

  if (!current) return null

  const totalQuestions = test.pages.reduce((sum, page) => sum + page.questions.length, 0)

  return (
    <div
      className={`official-test test-runner${className ? ` ${className}` : ''}`}
      data-testid={testId ?? `test-runner-${test.id}`}
      aria-label={test.title}
    >
      <div className="official-test__intro">
        <strong>{test.title}</strong>
        <span>
          <bdi>{totalQuestions}</bdi> سؤالًا في <bdi>{total}</bdi> {total === 1 ? 'صفحة' : 'صفحات'}
        </span>
        {test.description && <p>{test.description}</p>}
      </div>

      {total > 1 && (
        <nav className="test-runner__pages" aria-label="صفحات الاختبار">
          {test.pages.map((page, index) => {
            const isCurrent = index === currentIndex
            const isChecked = engine.isPageChecked(page.id)
            return (
              <button
                key={page.id}
                type="button"
                className={`test-runner__page${isCurrent ? ' test-runner__page--current' : ''}${isChecked ? ' test-runner__page--checked' : ''}`}
                aria-current={isCurrent ? 'true' : undefined}
                onClick={() => setCurrentIndex(index)}
              >
                <span className="test-runner__page-number">
                  <bdi>{index + 1}</bdi>
                </span>
                <span className="test-runner__page-title">{page.title}</span>
                {isChecked && <span className="test-runner__page-done" aria-hidden="true">✓</span>}
              </button>
            )
          })}
        </nav>
      )}

      <TestPageView page={current} engine={engine} questionTestIdPrefix={questionTestIdPrefix} />

      {total > 1 && (
        <nav className="test-runner__pager" aria-label="التنقل بين صفحات الاختبار">
          <button
            type="button"
            className="button button--secondary"
            disabled={isFirst}
            onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
          >
            <span aria-hidden="true">←</span> الصفحة قبلها
          </button>
          <button
            type="button"
            className="button button--secondary"
            disabled={isLast}
            onClick={() => setCurrentIndex((index) => Math.min(total - 1, index + 1))}
          >
            الصفحة بعدها <span aria-hidden="true">→</span>
          </button>
        </nav>
      )}

      <FinalResult engine={engine} />
    </div>
  )
}

function FinalResult({ engine }: { engine: TestEngine }) {
  const { finalResult, allPagesChecked } = engine
  if (!allPagesChecked) {
    return (
      <p className="test-runner__progress" role="status">
        تم التحقق من <bdi>{finalResult.pagesChecked}</bdi> من <bdi>{finalResult.pagesTotal}</bdi> صفحات —
        أكمل التحقق من كل الصفحات لإظهار النتيجة النهائية.
      </p>
    )
  }
  const { correct, total, wrong, unanswered, manual, byGroup } = finalResult
  const groups = Object.entries(byGroup)
  return (
    <div className="test-runner__final" role="status" data-testid="test-final-result">
      <p className="test-runner__final-score">
        النتيجة النهائية: <bdi>{correct} / {total}</bdi>
      </p>
      <ul className="test-runner__final-counts">
        <li>
          إجابات صحيحة: <bdi>{correct}</bdi>
        </li>
        <li>
          إجابات غير صحيحة: <bdi>{wrong}</bdi>
        </li>
        <li>
          أسئلة لم تُجب: <bdi>{unanswered}</bdi>
        </li>
        {manual > 0 && (
          <li>
            أسئلة للمراجعة مع المعلم: <bdi>{manual}</bdi>
          </li>
        )}
      </ul>
      {groups.length > 1 && (
        <ul className="test-runner__final-groups">
          {groups.map(([group, stats]) => (
            <li key={group}>
              {group}: <bdi>{stats.correct} / {stats.total}</bdi>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="button button--secondary" onClick={engine.resetTest}>
        إعادة الاختبار
      </button>
    </div>
  )
}
