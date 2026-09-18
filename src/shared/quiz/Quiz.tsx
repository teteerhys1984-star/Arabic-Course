import { useMemo, useState } from 'react'
import type { QuizQuestionData } from './types'

interface QuizProps {
  title?: string
  questions: QuizQuestionData[]
}

type Answers = Record<string, string>

export function Quiz({ title = 'اختبار قصير', questions }: QuizProps) {
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

  return (
    <section className="quiz" aria-labelledby="quiz-title">
      <div className="quiz__heading">
        <div>
          <p className="card__eyebrow">تدريب تفاعلي</p>
          <h3 id="quiz-title">{title}</h3>
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

        return (
          <fieldset className="quiz__question" key={question.id} disabled={checked}>
            <legend><bdi>{questionIndex + 1}.</bdi> {question.prompt}</legend>
            <div className="quiz__options">
              {question.options.map((option) => (
                <label key={option.id}>
                  <input
                    type="radio"
                    name={question.id}
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
          <button className="button button--primary" type="button" disabled={!allAnswered} onClick={() => setChecked(true)}>
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
