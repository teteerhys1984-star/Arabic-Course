import { describe, expect, it } from 'vitest'
import { combinePageResults, gradePage, isFieldCorrect, questionStatus, type AnswerMap } from '../../shared/test'
import { practiceLabs, sourceContent, testDefinition, trainingSolutions } from './content'
import { earnedMarks, gradeLesson8, practiceStatus, TEST_TOTALS } from './grading'
import { EXAM_ANSWERS, EXPECTED_TRAINING_KEYS } from './test-fixtures'

const questions = testDefinition.pages.flatMap((page) => page.questions)

function allWrong(): AnswerMap {
  return Object.fromEntries(questions.flatMap((question) => question.fields.map((field, index) => {
    if (field.kind !== 'choice' && field.kind !== 'select' && field.kind !== 'multi') throw new Error('Unexpected field')
    const expected = EXAM_ANSWERS[`${question.id}:${index}`]
    return [`${question.id}:${index}`, [field.options.find((option) => !expected.includes(option))!]]
  })))
}

describe('morphology 08 — grading through the shared engine', () => {
  it('uses 20 questions / 4 pages / 20 marks and no manual or unit-test marks', () => {
    expect(TEST_TOTALS).toEqual({ questions: 20, pages: 4, marksPerQuestion: 1, total: 20, manualMax: 0 })
    expect(testDefinition.pages.map((page) => page.questions.length)).toEqual([5, 5, 5, 5])
  })

  it('awards exactly 20/20 for the independently audited key (including all multi-field questions)', () => {
    const result = gradeLesson8(EXAM_ANSWERS)
    expect(result).toMatchObject({ correct: 20, total: 20, wrong: 0, unanswered: 0, manual: 0, complete: true, pagesChecked: 4 })
    expect(earnedMarks(result)).toBe(20)
  })

  it('grades every distractor independently instead of assuming only the first wrong option is wrong', () => {
    for (const question of questions) question.fields.forEach((field, index) => {
      const expected = EXAM_ANSWERS[`${question.id}:${index}`]
      if (field.kind === 'choice' || field.kind === 'select') {
        for (const option of field.options) expect(isFieldCorrect(field, [option], 'strict'), `${question.id}: ${option}`).toBe(option === expected[0])
      } else if (field.kind === 'multi') {
        expect(isFieldCorrect(field, expected, 'strict')).toBe(true)
        expect(isFieldCorrect(field, [...expected].reverse(), 'strict')).toBe(true)
        expect(isFieldCorrect(field, expected.slice(1), 'strict')).toBe(false)
        const extra = field.options.find((option) => !expected.includes(option))!
        expect(isFieldCorrect(field, [...expected, extra], 'strict')).toBe(false)
      }
    })
  })

  it('distinguishes wrong, blank and partly answered matches; no partial or duplicate marks', () => {
    expect(gradeLesson8(allWrong())).toMatchObject({ correct: 0, wrong: 20, unanswered: 0, manual: 0 })
    expect(gradeLesson8({})).toMatchObject({ correct: 0, wrong: 0, unanswered: 20, manual: 0 })
    const match = questions[9]
    expect(questionStatus(match, { 'morph8-q10:0': ['تَلْعَبُونَ'] }, 'strict')).toBe('unanswered')
    expect(questionStatus(match, { 'morph8-q10:0': ['تَلْعَبُونَ'], 'morph8-q10:1': ['تَلْعَبُونَ'] }, 'strict')).toBe('wrong')
    expect(questionStatus(match, EXAM_ANSWERS, 'strict')).toBe('correct')
  })

  it('preserves the meaning-changing vowels in تاء الفاعل', () => {
    const field = questions[4].fields[0]
    expect(isFieldCorrect(field, ['لَعِبْتُ'], 'strict')).toBe(true)
    for (const value of ['لَعِبْتَ', 'لَعِبْتِ', 'لعبت', 'لَعِبَتْ']) expect(isFieldCorrect(field, [value], 'strict')).toBe(false)
    // Only invisible bidi controls and outer whitespace are insignificant.
    expect(isFieldCorrect(field, [' \u2067لَعِبْتُ\u2069 '], 'strict')).toBe(true)
  })

  it('keeps unchecked pages out of results and replaces rechecked results instead of doubling', () => {
    expect(gradeLesson8(EXAM_ANSWERS, [])).toMatchObject({ total: 0, correct: 0, complete: false, pagesChecked: 0 })
    expect(gradeLesson8(EXAM_ANSWERS, [testDefinition.pages[0].id])).toMatchObject({ total: 5, correct: 5, complete: false, pagesChecked: 1 })
    const results = Object.fromEntries(testDefinition.pages.map((page) => [page.id, gradePage(page, EXAM_ANSWERS, 'strict')]))
    results[testDefinition.pages[0].id] = gradePage(testDefinition.pages[0], allWrong(), 'strict')
    expect(combinePageResults(testDefinition, results)).toMatchObject({ total: 20, correct: 15, wrong: 5, complete: true })
    results[testDefinition.pages[0].id] = gradePage(testDefinition.pages[0], EXAM_ANSWERS, 'strict')
    expect(combinePageResults(testDefinition, results)).toMatchObject({ total: 20, correct: 20, wrong: 0 })
  })

  it('has the same outcome via the adapter as the shared latest-valid-page aggregation', () => {
    const mixed = { ...EXAM_ANSWERS, 'morph8-q05:0': ['لَعِبْتِ'], 'morph8-q08:0': [''] }
    const results = Object.fromEntries(testDefinition.pages.map((page) => [page.id, gradePage(page, mixed, testDefinition.matching)]))
    expect(gradeLesson8(mixed)).toEqual(combinePageResults(testDefinition, results))
    expect(gradeLesson8(mixed)).toMatchObject({ correct: 18, wrong: 1, unanswered: 1 })
  })
})

describe('morphology 08 — educational practice is separate, with significant harakat', () => {
  it('grades all eight original answers and rejects every distractor without changing their order', () => {
    for (const item of sourceContent.trainings.groups.flatMap((group) => [...group.items])) {
      const solution = trainingSolutions[item.number]
      expect(solution.answer).toBe(EXPECTED_TRAINING_KEYS[item.number - 1])
      expect(practiceStatus(solution, undefined)).toBe('unanswered')
      for (const option of item.options) expect(practiceStatus(solution, option)).toBe(option === solution.answer ? 'correct' : 'wrong')
    }
    expect(practiceStatus({ answer: 'كَتَبْتُ' }, 'كَتَبْتَ')).toBe('wrong')
    expect(practiceStatus({ answer: 'كَتَبْتِ' }, 'كَتَبَتْ')).toBe('wrong')
  })

  it('validates every lab answer and blank response', () => {
    for (const lab of practiceLabs) for (const item of lab.items) {
      expect(practiceStatus(item, item.answer)).toBe('correct')
      expect(practiceStatus(item, ' ')).toBe('unanswered')
      for (const option of item.options) if (option !== item.answer) expect(practiceStatus(item, option)).toBe('wrong')
    }
  })
})
