/**
 * اختبارات منطق تصحيح اختبار الدرس الخامس (أوزان الفعل الثلاثي المزيد).
 *
 * التصحيح آلي بالكامل: ٢٠ سؤالًا × درجة واحدة = ٢٠ درجة، بلا درجات تُراجع يدويًا،
 * والنتيجة النهائية تُجمع من أحدث نتيجة صالحة لكل صفحة (لا ازدواج في العدّ).
 */
import { describe, expect, it } from 'vitest'
import { gradePage } from '../../shared/test'
import type { AnswerMap } from '../../shared/test'
import { testDefinition } from './content'
import { TEST_TOTALS, earnedMarks, gradeLesson5 } from './grading'

const questions = testDefinition.pages.flatMap((page) => page.questions)

function answersOf(mode: 'correct' | 'wrong-first' | 'empty'): AnswerMap {
  const answers: AnswerMap = {}
  for (const question of questions) {
    const field = question.fields[0]
    if (field.kind !== 'choice' || mode === 'empty') continue
    const value = mode === 'correct' ? field.answer : field.options.find((option) => option !== field.answer) ?? field.answer
    answers[`${question.id}:0`] = [value]
  }
  return answers
}

describe('morphology lesson 05 grading — constants', () => {
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
  })
})

describe('morphology lesson 05 grading — gradeLesson5', () => {
  it('scores a fully correct attempt with 20 marks and full completion', () => {
    const result = gradeLesson5(answersOf('correct'))
    expect(result.correct).toBe(20)
    expect(result.wrong).toBe(0)
    expect(result.unanswered).toBe(0)
    expect(result.manual).toBe(0)
    expect(result.pagesChecked).toBe(4)
    expect(result.complete).toBe(true)
    expect(earnedMarks(result)).toBe(20)
  })

  it('scores wrong and unanswered attempts without leaking manual marks', () => {
    const wrong = gradeLesson5(answersOf('wrong-first'))
    expect(wrong.correct).toBe(0)
    expect(wrong.wrong).toBe(20)
    expect(earnedMarks(wrong)).toBe(0)

    const empty = gradeLesson5(answersOf('empty'))
    expect(empty.unanswered).toBe(20)
    expect(empty.complete).toBe(true)
  })

  it('combines only the checked pages and stays incomplete until every page is checked', () => {
    const result = gradeLesson5(answersOf('correct'), ['morph5-concepts'])
    expect(result.pagesChecked).toBe(1)
    expect(result.pagesTotal).toBe(4)
    expect(result.complete).toBe(false)
    expect(result.total).toBe(5)
    expect(result.correct).toBe(5)
    expect(earnedMarks(result)).toBe(5)
  })

  it('replaces (never doubles) a page result when rechecked', () => {
    const page = testDefinition.pages[0]
    const first = gradePage(page, answersOf('correct'), 'strict')
    const second = gradePage(page, answersOf('wrong-first'), 'strict')
    expect(first.correct).toBe(5)
    expect(second.correct).toBe(0)
    expect(second.wrong).toBe(5)
  })
})
