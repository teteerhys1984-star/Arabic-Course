import {
  hasManualPart,
  questionSolution,
  readableAnswer,
  answerKey,
} from '../grading'
import type { TestEngine } from '../useTestEngine'
import type { TestField, TestPage, TestQuestion, QuestionStatus } from '../types'

/**
 * Renders exactly ONE test page and — at its end — the page-level checking
 * action «تحقّق من الإجابات».
 *
 * Contract (docs/lesson-test-standards.md):
 *  - Checking evaluates ONLY this page; unanswered questions are reported as
 *    «لم تُجب», never block checking, and never require the remaining pages.
 *  - After checking, every question shows a status pill: correct / wrong /
 *    unanswered / manual-review. Auto questions also show the correct answer
 *    and the explanation; essay parts are marked «يُراجع يدويًا» and their
 *    model answers stay in the Teacher Space.
 *  - Fields are never locked after checking: the student may edit and recheck.
 *    Editing invalidates the page result (see useTestEngine), and rechecking
 *    replaces it — scores are never double-counted.
 */

const statusLabels: Record<QuestionStatus, string> = {
  correct: 'إجابة صحيحة',
  wrong: 'إجابة غير صحيحة',
  unanswered: 'لم تُجب',
  manual: 'يُراجع يدويًا',
}

interface TestPageViewProps {
  page: TestPage
  engine: TestEngine
  /** Hide the check actions (e.g. when the page is embedded in a larger runner header). */
  showActions?: boolean
  /** Optional prefix for per-question test ids, e.g. «lesson8-test» → «lesson8-test-q1». */
  questionTestIdPrefix?: string
}

export function TestPageView({ page, engine, showActions = true, questionTestIdPrefix }: TestPageViewProps) {
  const result = engine.pageResults[page.id]
  const checked = Boolean(result)

  return (
    <section
      className="test-page"
      data-testid={`test-page-${page.id}`}
      aria-label={page.title}
    >
      <header className="test-page__header">
        <h3 className="test-page__title">{page.title}</h3>
        <span className="test-page__count">
          <bdi>{page.questions.length}</bdi> {page.questions.length === 1 ? 'سؤال' : 'أسئلة'}
        </span>
      </header>
      {page.description && <p className="test-page__description">{page.description}</p>}

      <div className="test-page__questions">
        {page.questions.map((question) => (
          <QuestionView
            key={question.id}
            question={question}
            engine={engine}
            checked={checked}
            status={result?.statuses[question.id]}
            questionTestIdPrefix={questionTestIdPrefix}
          />
        ))}
      </div>

      {showActions && (
        <div className="test-page__actions">
          <button
            type="button"
            className="button button--primary"
            onClick={() => engine.checkPage(page.id)}
          >
            {checked ? 'أعِد التحقّق من الإجابات' : 'تحقّق من الإجابات'}
          </button>
          {checked && (
            <button
              type="button"
              className="button button--ghost"
              onClick={() => engine.uncheckPage(page.id)}
            >
              إخفاء التغذية الراجعة
            </button>
          )}
          {!checked && (
            <p className="test-page__hint">
              يمكنك التحقق حتى لو لم تُجب عن كل الأسئلة؛ الأسئلة غير المجابة تُحتسب «لم تُجب».
            </p>
          )}
          {checked && result && (
            <PageSummary pageId={page.id} result={result} totalQuestions={page.questions.length} />
          )}
        </div>
      )}
    </section>
  )
}

function PageSummary({
  pageId,
  result,
  totalQuestions,
}: {
  pageId: string
  result: NonNullable<TestEngine['pageResults'][string]>
  totalQuestions: number
}) {
  return (
    <div className="test-page__summary" role="status" data-testid={`test-page-summary-${pageId}`}>
      <p className="test-page__score">
        نتيجة هذه الصفحة: <bdi>{result.correct}</bdi> صحيحة، <bdi>{result.wrong}</bdi> غير صحيحة،{' '}
        <bdi>{result.unanswered}</bdi> لم تُجب{result.manual > 0 ? <>، و<bdi>{result.manual}</bdi> للمراجعة مع المعلم</> : null}.
      </p>
      <p className="test-page__hint">
        إذا عدّلتَ إجابة، أعد التحقق — نتيجة الصفحة تُستبدل ولا تتضاعف.
      </p>
      <p className="test-page__hint test-page__hint--muted">
        ({totalQuestions} سؤال في هذه الصفحة)
      </p>
    </div>
  )
}

function QuestionView({
  question,
  engine,
  checked,
  status,
  questionTestIdPrefix,
}: {
  question: TestQuestion
  engine: TestEngine
  checked: boolean
  status?: QuestionStatus
  questionTestIdPrefix?: string
}) {
  const manual = hasManualPart(question)
  return (
    <fieldset
      className="test-question"
      data-question-number={question.number}
      data-testid={`${questionTestIdPrefix ?? 'test-question'}-${question.id}`}
    >
      <legend>
        <span className="question-number">
          السؤال <bdi>{question.number}</bdi>
        </span>{' '}
        {question.type && <span className="test-question__type">{question.type}</span>}
        {question.level && <span className="test-question__level">{question.level}</span>}
        <span className="test-question__prompt question-text">
          <PromptText text={question.prompt} />
        </span>
      </legend>
      {question.sentence && (
        <p className="test-question__sentence">
          <bdi>{question.sentence}</bdi>
        </p>
      )}

      <div className="test-question__fields">
        {question.fields.map((field, fieldIndex) => (
          <FieldView
            key={`${question.id}-${fieldIndex}`}
            question={question}
            field={field}
            fieldIndex={fieldIndex}
            engine={engine}
          />
        ))}
      </div>

      {checked && status && (
        <div
          className={`test-question__feedback test-question__feedback--${status}`}
          data-testid={`test-feedback-${question.id}`}
        >
          <p className="test-question__status">
            <span className={`test-pill test-pill--${status}`}>{statusLabels[status]}</span>
            {manual && status !== 'manual' && <span className="test-pill test-pill--manual">الجزء التفسيري يُراجع يدويًا</span>}
          </p>
          <StudentAnswer question={question} engine={engine} />
          {(status !== 'manual' || question.revealEssaySolution) && <CorrectAnswer question={question} />}
          {status === 'manual' && (
            <p className="test-question__manual-note">تم تسجيل إجابتك للمراجعة مع المعلم.</p>
          )}
          {status !== 'correct' && question.explanation && (
            <p className="test-question__explanation">
              <strong>التفسير:</strong> {question.explanation}
            </p>
          )}
          {status === 'correct' && question.explanation && (
            <p className="test-question__explanation">
              <strong>التفسير:</strong> {question.explanation}
            </p>
          )}
        </div>
      )}
    </fieldset>
  )
}

/** Renders a prompt preserving its line breaks (questions use '\n' for sub-lines). */
export function PromptText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, lineIndex) => (
        <span className="question-text__line" key={`${lineIndex}-${line.slice(0, 8)}`}>
          {line || '\u00a0'}
        </span>
      ))}
    </>
  )
}

function StudentAnswer({ question, engine }: { question: TestQuestion; engine: TestEngine }) {
  const parts: string[] = []
  question.fields.forEach((field, index) => {
    const value = readableAnswer(field, engine.answers[answerKey(question.id, index)])
    if (value !== null) parts.push(field.label ? `${field.label}: ${value}` : value)
  })
  if (parts.length === 0) return null
  return (
    <p className="test-question__yours">
      <strong>إجابتك:</strong> <bdi>{parts.join(' — ')}</bdi>
    </p>
  )
}

function CorrectAnswer({ question }: { question: TestQuestion }) {
  const solution = questionSolution(question)
  if (!solution) return null
  return (
    <p className="test-question__correct">
      <strong>الإجابة الصحيحة:</strong> <bdi>{solution}</bdi>
    </p>
  )
}

function FieldView({
  question,
  field,
  fieldIndex,
  engine,
}: {
  question: TestQuestion
  field: TestField
  fieldIndex: number
  engine: TestEngine
}) {
  const value = engine.answers[answerKey(question.id, fieldIndex)] ?? []
  const label = field.label ?? `إجابة السؤال ${question.number}`
  const ariaLabel = `${question.prompt} — ${label}`
  const set = (next: string[]) => engine.setAnswer(question.id, fieldIndex, next)

  if (field.kind === 'choice') {
    return (
      <div className="test-field test-field--choice" role="radiogroup" aria-label={ariaLabel}>
        {field.options.map((option) => (
          <label key={option}>
            <input
              type="radio"
              name={`${question.id}-${fieldIndex}`}
              value={option}
              checked={value[0] === option}
              onChange={() => set([option])}
            />
            <span>
              <bdi>{option}</bdi>
            </span>
          </label>
        ))}
      </div>
    )
  }

  if (field.kind === 'select') {
    return (
      <label className="test-field test-field--select">
        <span>{field.label}</span>
        <select
          value={value[0] ?? ''}
          aria-label={ariaLabel}
          onChange={(event) => set([event.target.value])}
        >
          <option value="">اختر…</option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    )
  }

  if (field.kind === 'multi') {
    return (
      <div className="test-field test-field--multi">
        <p className="test-field__label">{field.label}</p>
        <div className="test-field--choice" role="group" aria-label={ariaLabel}>
          {field.options.map((option) => (
            <label key={option}>
              <input
                type="checkbox"
                value={option}
                checked={value.includes(option)}
                onChange={() =>
                  set(value.includes(option) ? value.filter((entry) => entry !== option) : [...value, option])
                }
              />
              <span>
                <bdi>{option}</bdi>
              </span>
            </label>
          ))}
        </div>
      </div>
    )
  }

  if (field.kind === 'text') {
    return (
      <label className="test-field test-field--text">
        {field.label && <span>{field.label}</span>}
        <input
          value={value[0] ?? ''}
          placeholder={field.placeholder}
          aria-label={ariaLabel}
          onChange={(event) => set([event.target.value])}
        />
      </label>
    )
  }

  return (
    <label className="test-field test-field--essay">
      <span>
        {field.label} <small>(يُراجع يدويًا)</small>
      </span>
      <textarea
        rows={3}
        value={value[0] ?? ''}
        placeholder={field.placeholder}
        aria-label={ariaLabel}
        onChange={(event) => set([event.target.value])}
      />
    </label>
  )
}
