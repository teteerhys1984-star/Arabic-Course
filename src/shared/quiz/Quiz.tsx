import { useMemo, useState } from 'react'
import type { QuizQuestionData } from './types'

interface QuizProps {
  id?: string
  title?: string
  questions: QuizQuestionData[]
  onComplete?: (score: number, total: number) => void
}

type Answers = Record<string, string>

export function Quiz({ id = 'quiz', title = 'اختبار قصير', questions, onComplete }: QuizProps) {
  const [answers, setAnswers] = useState<Answers>({})
  const [checked, setChecked] = useState(false)
  const allAnswered = questions.every((question) => answers[question.id])
  const score = useMemo(
    () => questions.filter((question) => answers[question.id] === question.correctOptionId).length,
    [answers, questions],
  )

  function reset() {
    setAnswers({})
    setChecked(false)
  }

  function checkAnswers() {
    setChecked(true)
    onComplete?.(score, questions.length)
  }

  return (
    <section className="quiz" aria-labelledby={`${id}-title`}>
      <div className="quiz__heading">
        <div>
          <p className="card__eyebrow">تدريب تفاعلي</p>
          <h3 id={`${id}-title`}>{title}</h3>
        </div>
        {checked && (
          <p className="quiz__score" role="status">
            النتيجة: <bdi>{score} / {questions.length}</bdi>
          </p>
        )}
      </div>

      {questions.map((question, questionIndex) => {
        const isCorrect = answers[question.id] === question.correctOptionId
        const correctLabel = question.options.find(
          (option) => option.id === question.correctOptionId,
        )?.label
        const questionLabel = `${id}-question-${questionIndex + 1}`

        return (
          <fieldset className="quiz__question" key={question.id} disabled={checked} aria-labelledby={questionLabel}>
            <legend id={questionLabel}><span className="question-number">السؤال <bdi>{questionIndex + 1}</bdi></span>{' '}{question.prompt}</legend>
            <div className="quiz__options">
              {question.options.map((option) => (
                <label key={option.id}>
                  <input
                    type="radio"
                    name={`${id}-${question.id}`}
                    value={option.id}
                    checked={answers[question.id] === option.id}
                    onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {checked && (
              <div className={`quiz__feedback quiz__feedback--${isCorrect ? 'correct' : 'incorrect'}`}>
                <strong>{isCorrect ? 'إجابة صحيحة' : 'إجابة غير صحيحة'}</strong>
                {!isCorrect && <p>الإجابة الصحيحة: {correctLabel}</p>}
                <p>{question.explanation}</p>
              </div>
            )}
          </fieldset>
        )
      })}

      <div className="quiz__actions">
        {!checked ? (
          <button className="button button--primary" type="button" disabled={!allAnswered} onClick={checkAnswers}>
            تحقق من الإجابات
          </button>
        ) : (
          <button className="button button--secondary" type="button" onClick={reset}>
            أعد المحاولة
          </button>
        )}
        {!allAnswered && !checked && <p>أجب عن جميع الأسئلة أولًا.</p>}
      </div>
    </section>
  )
}
