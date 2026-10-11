/**
 * اختبارات منطق تصحيح اختبار الدرس السابع (الفعل الصحيح والفعل المعتل).
 *
 * التصحيح آلي بالكامل: ٢٠ سؤالًا × درجة واحدة = ٢٠ درجة، بلا درجات تُراجع يدويًا،
 * والنتيجة النهائية تُجمع من أحدث نتيجة صالحة لكل صفحة (لا ازدواج في العدّ).
 */
import { describe, expect, it } from 'vitest'
import { gradePage } from '../../shared/test'
import type { AnswerMap } from '../../shared/test'
import { testDefinition } from './content'
import { TEST_TOTALS, earnedMarks, gradeLesson7 } from './grading'

const questions = testDefinition.pages.flatMap((page) => page.questions)

function answersOf(mode: 'correct' | 'wrong-first' | 'empty'): AnswerMap {
  const answers: AnswerMap = {}
  for (const question of questions) {
    const field = question.fields[0]
    if (field.kind !== 'choice' || mode === 'empty') continue
    const value =
      mode === 'correct' ? field.answer : (field.options.find((option) => option !== field.answer) ?? field.answer)
    answers[`${question.id}:0`] = [value]
  }
  return answers
}

describe('morphology lesson 07 grading — constants', () => {
  it('exposes the approved totals (20 questions / 4 pages / 1 mark each)', () => {
    expect(TEST_TOTALS).toEqual({
      questions: 20,
      pages: 4,
      marksPerQuestion: 1,
      total: 20,
      manualMax: 0,
    })
    expect(testDefinition.pages).toHaveLength(TEST_TOTALS.pages)
    expect(questions).toHaveLength(TEST_TOTALS.questions)
    expect(testDefinition.pages.map((page) => page.questions.length)).toEqual([5, 5, 5, 5])
  })
})

describe('morphology lesson 07 grading — gradeLesson7', () => {
  it('scores a fully correct attempt with 20 marks and full completion', () => {
    const result = gradeLesson7(answersOf('correct'))
    expect(result.correct).toBe(20)
    expect(result.wrong).toBe(0)
    expect(result.unanswered).toBe(0)
    expect(result.manual).toBe(0)
    expect(result.total).toBe(20)
    expect(result.pagesChecked).toBe(4)
    expect(result.complete).toBe(true)
    expect(earnedMarks(result)).toBe(20)
  })

  it('scores wrong and unanswered attempts without leaking manual marks', () => {
    const wrong = gradeLesson7(answersOf('wrong-first'))
    expect(wrong.correct).toBe(0)
    expect(wrong.wrong).toBe(20)
    expect(wrong.unanswered).toBe(0)
    expect(wrong.manual).toBe(0)
    expect(earnedMarks(wrong)).toBe(0)

    const empty = gradeLesson7(answersOf('empty'))
    expect(empty.unanswered).toBe(20)
    expect(empty.complete).toBe(true)
  })

  it('keeps harakat significant: strict matching rejects an unvoweled word', () => {
    const answers: AnswerMap = {}
    const first = questions[0]
    answers[`${first.id}:0`] = ['xxx']
    const result = gradePage(testDefinition.pages[0], answers, 'strict')
    expect(result.statuses[first.id]).toBe('wrong')
  })

  it('combines only the checked pages and stays incomplete until every page is checked', () => {
    const partial = gradeLesson7(answersOf('correct'), [testDefinition.pages[0].id, testDefinition.pages[1].id])
    expect(partial.pagesChecked).toBe(2)
    expect(partial.pagesTotal).toBe(4)
    expect(partial.complete).toBe(false)
    expect(partial.correct).toBe(10)
  })

  it('replaces (never doubles) a page result when rechecked', () => {
    const first = gradePage(testDefinition.pages[0], answersOf('correct'), 'strict')
    const again = gradePage(testDefinition.pages[0], answersOf('wrong-first'), 'strict')
    const combined = gradeLesson7(answersOf('wrong-first'), [])
    expect(combined.correct).toBe(0)
    expect(first.correct).toBe(5)
    expect(again.correct).toBe(0)
  })
})
