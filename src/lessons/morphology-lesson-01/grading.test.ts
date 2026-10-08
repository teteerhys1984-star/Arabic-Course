import { describe, expect, it } from 'vitest'
import { answerKey, gradeTest, type AnswerMap } from './grading'
import { testQuestions } from './content'

function answersFor(entries: Record<string, string[]>): AnswerMap {
  return entries
}

describe('morphology lesson 1 — exam structure', () => {
  it('contains exactly the 45 source questions, numbered 1 to 45 without gaps', () => {
    expect(testQuestions).toHaveLength(45)
    expect(testQuestions.map((question) => question.number)).toEqual(
      Array.from({ length: 45 }, (_, index) => index + 1),
    )
  })

  it('keeps the source question-type distribution (10/10/10/5/5/5)', () => {
    const count = (type: string) => testQuestions.filter((question) => question.type === type).length
    expect(count('اختيار من متعدد')).toBe(10)
    expect(count('صح أو خطأ')).toBe(10)
    expect(count('استخراج الجذر')).toBe(10)
    expect(count('تعليل')).toBe(5)
    expect(count('تحليل صرفي')).toBe(5)
    expect(count('تفكير صرفي')).toBe(5)
  })

  it('never auto-grades essay fields', () => {
    const questions = testQuestions.filter((question) => question.number >= 31 && question.number <= 35)
    const answers = answersFor(
      Object.fromEntries(questions.map((question) => [answerKey(question.id, 0), ['أي نص طويل']])),
    )
    const result = gradeTest(testQuestions, answers)
    for (const question of questions) {
      expect(result.statuses[question.id]).toBeNull()
    }
    expect(result.manualIds).toEqual(expect.arrayContaining(['q31', 'q35', 'q41', 'q45']))
  })

  it('grades the mixed analysis questions (38–40) on the root only', () => {
    const question = testQuestions.find((item) => item.id === 'q38')!
    const answers = answersFor({ [answerKey('q38', 0)]: ['ك ر م'] })
    const result = gradeTest(testQuestions, answers)
    expect(result.statuses[question.id]).toBe('correct')
  })
})

describe('morphology lesson 1 — objective grading', () => {
  it('accepts the correct choice and rejects a wrong one', () => {
    const correct = gradeTest(testQuestions, answersFor({ [answerKey('q02', 0)]: ['ك ت ب'] }))
    expect(correct.statuses.q02).toBe('correct')
    const wrong = gradeTest(testQuestions, answersFor({ [answerKey('q02', 0)]: ['م ك ت'] }))
    expect(wrong.statuses.q02).toBe('wrong')
  })

  it('normalizes root spelling: spaces, dashes and diacritics do not matter', () => {
    const variants = ['ع ل م', 'عـ ـل ـم', 'علم', 'عَلْم']
    for (const value of variants) {
      const result = gradeTest(testQuestions, answersFor({ [answerKey('q21', 0)]: [value] }))
      expect(result.statuses.q21, value).toBe('correct')
    }
  })

  it('reports unanswered questions and totals only auto-gradable items', () => {
    const result = gradeTest(testQuestions, {})
    expect(result.autoTotal).toBe(35)
    expect(result.autoUnanswered).toBe(35)
    expect(result.autoCorrect).toBe(0)
    expect(result.manualIds).toHaveLength(13)
  })

  it('a partly answered analysis question is unanswered, not wrong', () => {
    const result = gradeTest(testQuestions, answersFor({ [answerKey('q36', 0)]: ['ك ت ب'] }))
    expect(result.statuses.q36).toBe('unanswered')
  })
})
