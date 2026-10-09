import { useEffect, useMemo } from 'react'
import { TestRunner, useTestEngine, type TestDefinition, type TestQuestion } from '../test'
import type { QuizQuestionData } from './types'

interface QuizProps {
  id?: string
  title?: string
  questions: QuizQuestionData[]
  onComplete?: (score: number, total: number) => void
}

/**
 * The shared quick-check quiz — now built on the platform-wide test framework
 * (src/shared/test), so it inherits the same page-level checking behaviour as
 * every lesson test:
 *
 *  - the «تحقّق من الإجابات» action checks the quiz page without requiring every
 *    question to be answered first (unanswered questions are reported);
 *  - after checking, each question shows correct / wrong / unanswered feedback
 *    with the explanation;
 *  - answers can be edited and rechecked — the page result is replaced, never
 *    double-counted.
 *
 * The legacy props (`id`, `title`, `questions`, `onComplete`) are unchanged.
 */
export function Quiz({ id = 'quiz', title = 'اختبار قصير', questions, onComplete }: QuizProps) {
  const test = useMemo<TestDefinition>(
    () => ({
      id: `${id}-quiz`,
      title,
      description: 'أجب عن الأسئلة، ثم تحقّق من إجاباتك في نهاية الصفحة.',
      pages: [
        {
          id: `${id}-page`,
          title: 'أسئلة التحقق',
          questions: questions.map<TestQuestion>((question, index) => {
            const correctLabel =
              question.options.find((option) => option.id === question.correctOptionId)?.label ??
              question.correctOptionId
            return {
              id: question.id,
              number: index + 1,
              prompt: question.prompt,
              fields: [{ kind: 'choice', options: question.options.map((option) => option.label), answer: correctLabel }],
              solution: correctLabel,
              explanation: question.explanation,
            }
          }),
        },
      ],
    }),
    [id, title, questions],
  )

  return (
    <section className="quiz" aria-labelledby={`${id}-title`}>
      <div className="quiz__heading">
        <div>
          <p className="card__eyebrow">تدريب تفاعلي</p>
          <h3 id={`${id}-title`}>{title}</h3>
        </div>
      </div>
      <QuizEngine test={test} onComplete={onComplete} />
    </section>
  )
}

/**
 * Bridges the shared engine to the legacy `onComplete(score, total)` callback:
 * fires with the page's latest result whenever a check completes or is replaced.
 */
function QuizEngine({
  test,
  onComplete,
}: {
  test: TestDefinition
  onComplete?: (score: number, total: number) => void
}) {
  const engine = useTestEngine(test)
  const page = test.pages[0]
  const result = engine.pageResults[page.id]

  useEffect(() => {
    if (result && onComplete) onComplete(result.correct, result.total)
  }, [result, onComplete])

  return <TestRunner test={test} engine={engine} />
}
