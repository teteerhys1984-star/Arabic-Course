/**
 * اختبارات منطق تصحيح اختبار الدرس الثالث (٢٠ سؤالًا، درجة لكل سؤال).
 *
 * تغطي:
 *  - الإجابات الصحيحة كاملةً تعطي ٢٠ من ٢٠، والفارغة تعطي صفرًا مع كل الأسئلة غير المجابة؛
 *  - الصفحة غير المتحقَّق منها لا تدخل النتيجة، ولا تكتمل النتيجة قبل تحقق كل الصفحات؛
 *  - الإجابة النصية تُقبل مع اختلاف الحركات والمسافات (المحرك المشترك)؛
 *  - لا توجد أسئلة يدوية في هذا الدرس.
 */
import { describe, expect, it } from 'vitest'
import { testDefinition } from './content'
import type { AnswerMap } from '../../shared/test'
import { TEST_TOTALS, earnedMarks, gradeLesson3 } from './grading'

const key = (questionId: string, fieldIndex: number) => `${questionId}:${fieldIndex}`

/** كل حقل بإجابته الصحيحة الأولى المقبولة. */
function correctAnswers(): AnswerMap {
  const answers: AnswerMap = {}
  for (const page of testDefinition.pages) {
    for (const question of page.questions) {
      question.fields.forEach((field, index) => {
        if (field.kind === 'select' || field.kind === 'choice') answers[key(question.id, index)] = [field.answer]
        else if (field.kind === 'multi') answers[key(question.id, index)] = [...field.answers]
        else if (field.kind === 'text') answers[key(question.id, index)] = [field.accept[0]]
        else throw new Error(`unexpected field kind ${field.kind} in lesson 3`)
      })
    }
  }
  return answers
}

const allPageIds = testDefinition.pages.map((page) => page.id)

describe('morphology lesson 03 — grading', () => {
  it('uses the 20-question, one-mark-each policy with no manual part', () => {
    expect(TEST_TOTALS).toMatchObject({ questions: 20, pages: 4, marksPerQuestion: 1, total: 20, manualMax: 0 })
    const essayFields = testDefinition.pages.flatMap((page) =>
      page.questions.flatMap((question) => question.fields.filter((field) => field.kind === 'essay')),
    )
    expect(essayFields).toHaveLength(0)
  })

  it('scores every question correct when every answer is correct and all pages are checked', () => {
    const result = gradeLesson3(correctAnswers(), allPageIds)
    expect(result.total).toBe(20)
    expect(result.correct).toBe(20)
    expect(result.wrong).toBe(0)
    expect(result.unanswered).toBe(0)
    expect(result.complete).toBe(true)
    expect(earnedMarks(result)).toBe(20)
  })

  it('counts an empty submission as unanswered, not wrong', () => {
    const result = gradeLesson3({}, allPageIds)
    expect(result.correct).toBe(0)
    expect(result.unanswered).toBe(20)
    expect(result.wrong).toBe(0)
  })

  it('leaves unchecked pages out of the result and keeps it incomplete', () => {
    const answers = correctAnswers()
    const onlyFirst = gradeLesson3(answers, [allPageIds[0]])
    expect(onlyFirst.pagesChecked).toBe(1)
    expect(onlyFirst.total).toBe(5)
    expect(onlyFirst.correct).toBe(5)
    expect(onlyFirst.complete).toBe(false)
  })

  it('separates a wrong answer from an unanswered one', () => {
    const answers = correctAnswers()
    const firstChoice = testDefinition.pages[0].questions[0]
    const firstField = firstChoice.fields[0]
    if (firstField.kind !== 'choice' && firstField.kind !== 'select') throw new Error('expected a choice field')
    const wrong = firstField.options.find((option) => option !== firstField.answer)
    if (!wrong) throw new Error('expected a wrong option')
    answers[key(firstChoice.id, 0)] = [wrong]
    delete answers[key(testDefinition.pages[3].questions[4].id, 0)]

    const result = gradeLesson3(answers, allPageIds)
    expect(result.wrong).toBe(1)
    expect(result.unanswered).toBe(1)
    expect(result.correct).toBe(18)
  })

  it('accepts a text answer that differs only in harakat and spacing', () => {
    const textQuestion = testDefinition.pages.flatMap((page) => page.questions).find((question) =>
      question.fields.some((field) => field.kind === 'text'),
    )
    if (!textQuestion) throw new Error('expected a text question')
    const index = textQuestion.fields.findIndex((field) => field.kind === 'text')
    const field = textQuestion.fields[index]
    if (field.kind !== 'text') throw new Error('expected a text field')

    const answers = correctAnswers()
    answers[key(textQuestion.id, index)] = [field.accept[0].replace(/[\u064B-\u065F]/g, '')]
    const result = gradeLesson3(answers, allPageIds)
    expect(result.correct).toBe(20)
    expect(result.wrong).toBe(0)
  })
})
