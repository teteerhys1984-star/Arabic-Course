import { autoFields, buildSolutionEntries, questionSolution } from '../grading'
import { useTestEngine, type TestEngine } from '../useTestEngine'
import { PromptText } from './TestPageView'
import type { SolutionEntry, TestDefinition, TestPage } from '../types'

/**
 * The shared Solutions Area — the platform-wide standard structure for test
 * solutions (docs/lesson-test-standards.md):
 *
 *   - the test / assessment title;
 *   - per question: the question number and a concise question reference;
 *   - the correct answer;
 *   - a clear, appropriately detailed explanation (never shortened away);
 *   - an additional example only when useful;
 *   - an explicit manual-review status where applicable;
 *   - a clear distinction between source-provided answers and
 *     platform-generated model answers.
 *
 * Exposure rule: in student mode a page's solutions are revealed ONLY after the
 * student checked that page — checking one page never exposes the solutions of
 * unchecked pages. Teacher mode (`mode="teacher"`) always reveals everything,
 * including the detailed teacher-only model answers.
 */

interface SolutionsAreaProps {
  test: TestDefinition
  /** Student-facing: reveal per checked page. Teacher Space: pass mode="teacher". */
  mode?: 'student' | 'teacher'
  /** Optional externally-owned engine (recommended inside lessons). */
  engine?: TestEngine
  /** Override the default title («حلول …»). */
  title?: string
  eyebrow?: string
  testId?: string
}

const statusLabels: Record<string, string> = {
  correct: 'إجابة صحيحة',
  wrong: 'إجابة غير صحيحة',
  unanswered: 'لم تُجب',
  manual: 'يُراجع يدويًا',
}

export function SolutionsArea({
  test,
  mode = 'student',
  engine: engineProp,
  title,
  eyebrow = 'منطقة الحلول',
  testId,
}: SolutionsAreaProps) {
  const ownEngine = useTestEngine(test)
  const engine = engineProp ?? ownEngine
  const groups = buildSolutionEntries(test, engine.answers, engine.pageResults, { teacher: mode === 'teacher' })
  const revealedCount = groups.filter((group) => group.entries.some((entry) => entry.revealed)).length
  const allRevealed = revealedCount === groups.length

  return (
    <section
      className={`solutions-area${mode === 'teacher' ? ' solutions-area--teacher' : ''}`}
      data-testid={testId ?? `solutions-${test.id}`}
      aria-label={title ?? `حلول ${test.title}`}
    >
      <header className="solutions-area__header">
        <p className="card__eyebrow">{eyebrow}</p>
        <h3>{title ?? `حلول ${test.title}`}</h3>
        {mode === 'student' && !allRevealed && (
          <p className="solutions-area__gate">
            تظهر الحلول صفحةً صفحةً: تحقّق من الصفحة أولًا لتُكشف حلولها. ({revealedCount} من {groups.length} صفحات مكشوفة)
          </p>
        )}
      </header>

      {groups.length > 1 && (
        <nav className="solutions-area__nav" aria-label="الانتقال بين صفحات الحلول">
          {groups.map((group, index) => (
            <span key={group.page.id} className="solutions-area__nav-item">
              {group.entries.some((entry) => entry.revealed) ? '✓ ' : ''}
              {group.page.title}
              {index < groups.length - 1 ? ' · ' : ''}
            </span>
          ))}
        </nav>
      )}

      {groups.map((group) => (
        <SolutionGroup key={group.page.id} page={group.page} entries={group.entries} mode={mode} />
      ))}
    </section>
  )
}

function SolutionGroup({
  page,
  entries,
  mode,
}: {
  page: TestPage
  entries: SolutionEntry[]
  mode: 'student' | 'teacher'
}) {
  const revealed = entries.some((entry) => entry.revealed)
  return (
    <div className="solutions-area__group" data-testid={`solutions-page-${page.id}`}>
      <h4 className="solutions-area__group-title">{page.title}</h4>
      {revealed ? (
        <ol className="solutions-area__list">
          {entries.map((entry) => (
            <SolutionItem key={entry.question.id} entry={entry} mode={mode} />
          ))}
        </ol>
      ) : (
        <p className="solutions-area__locked">
          🔒 تحقّق من هذه الصفحة أولًا («تحقّق من الإجابات» في نهاية الصفحة) لتُكشف الحلول.
        </p>
      )}
    </div>
  )
}

function SolutionItem({ entry, mode }: { entry: SolutionEntry; mode: 'student' | 'teacher' }) {
  const { question, status, studentAnswer } = entry
  const solution = questionSolution(question)
  const hasEssay = question.fields.some((field) => field.kind === 'essay')
  const essayOnly = autoFields(question).length === 0
  // Students never see the model answer of an essay-only question — it stays in
  // the Teacher Space until the teacher reviews it manually.
  const showAnswer =
    mode === 'teacher'
      ? Boolean(question.teacherAnswer ?? solution)
      : (!essayOnly || question.revealEssaySolution === true) && Boolean(solution)
  const answerText = mode === 'teacher' ? (question.teacherAnswer ?? solution) : solution

  return (
    <li className="solution-item" data-testid={`solution-${question.id}`}>
      <p className="solution-item__head">
        <span className="question-number">
          السؤال <bdi>{question.number}</bdi>
        </span>{' '}
        <span className="question-text">
          <PromptText text={question.prompt} />
        </span>
        {question.sentence && (
          <>
            {' '}
            — <bdi>{question.sentence}</bdi>
          </>
        )}
      </p>

      {status && (
        <p className="solution-item__status">
          <span className={`test-pill test-pill--${status}`}>{statusLabels[status]}</span>
          {hasEssay && status !== 'manual' && (
            <span className="test-pill test-pill--manual">الجزء التفسيري يُراجع يدويًا</span>
          )}
        </p>
      )}

      {studentAnswer && (
        <p className="solution-item__yours">
          <strong>إجابتك:</strong> <bdi>{studentAnswer}</bdi>
        </p>
      )}

      {showAnswer && (
        <p className="solution-item__answer">
          <strong>الإجابة الصحيحة:</strong> <bdi>{answerText}</bdi>
        </p>
      )}

      {!showAnswer && (
        <p className="solution-item__manual">يُراجع يدويًا مع المعلم — الإجابة النموذجية في منطقة المعلم.</p>
      )}

      {question.rule && (
        <p className="solution-item__rule">
          <strong>القاعدة:</strong> {question.rule}
        </p>
      )}

      {question.explanation && (
        <p className="solution-item__explanation">
          <strong>التفسير:</strong> {question.explanation}
          {!question.sourceAnswer && <small className="solution-item__badge"> — توضيح تعليمي من المنصة</small>}
        </p>
      )}

      {question.example && (
        <p className="solution-item__example">
          <strong>مثال إضافي:</strong> <bdi>{question.example}</bdi>
        </p>
      )}

      {question.parsing && question.parsing.length > 0 && (
        <div className="solution-item__parsing">
          <strong>الإعراب الكامل:</strong>
          <ul>
            {question.parsing.map((line) => (
              <li key={line}>
                <bdi>{line}</bdi>
              </li>
            ))}
          </ul>
        </div>
      )}

      {question.sourceAnswer && (
        <p className="solution-item__source">
          <strong>الجواب المعتمد من المصدر:</strong> <bdi>{question.sourceAnswer}</bdi>
        </p>
      )}

      {hasEssay && (
        <p className="solution-item__manual-badge">
          <span className="test-pill test-pill--manual">يُراجع يدويًا</span>
        </p>
      )}
    </li>
  )
}
