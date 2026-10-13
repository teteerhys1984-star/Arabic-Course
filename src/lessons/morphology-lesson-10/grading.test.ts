import { describe, expect, it } from 'vitest'
import { combinePageResults, gradePage, isFieldCorrect, questionStatus, type AnswerMap } from '../../shared/test'
import { analysisLab, challengeLab, classifyLab, comparisonLab, masdarLab, originalFinalSolutions, rootsLab, sourceContent, testDefinition, trainingSolutions, weightLab } from './content'
import { earnedMarks, gradeLesson10, practiceStatus, TEST_TOTALS } from './grading'
import { EXAM_ANSWERS, EXPECTED_ORIGINAL_KEYS, EXPECTED_TRAINING_KEYS } from './test-fixtures'

const questions = testDefinition.pages.flatMap((page) => page.questions)
function allWrong(): AnswerMap {
  return Object.fromEntries(
    questions.flatMap((question) =>
      question.fields.map((field, index) => {
        if (field.kind !== 'choice' && field.kind !== 'select' && field.kind !== 'multi') throw new Error('Unexpected field')
        const expected = EXAM_ANSWERS[`${question.id}:${index}`]
        return [`${question.id}:${index}`, [field.options.find((option) => !expected.includes(option))!]]
      }),
    ),
  )
}

describe('morphology 10 — التصحيح عبر المحرك المشترك', () => {
  it('يستخدم ٢٠ سؤالًا في ٤ صفحات و٢٠ درجة بلا مراجعة يدوية', () => {
    expect(TEST_TOTALS).toEqual({ questions: 20, pages: 4, marksPerQuestion: 1, total: 20, manualMax: 0 })
    expect(testDefinition.pages.map((p) => p.questions.length)).toEqual([5, 5, 5, 5])
  })
  it('يمنح ٢٠/٢٠ للمفتاح المدقَّق مستقلًا', () => {
    const result = gradeLesson10(EXAM_ANSWERS)
    expect(result).toMatchObject({ correct: 20, total: 20, wrong: 0, unanswered: 0, manual: 0, complete: true, pagesChecked: 4 })
    expect(earnedMarks(result)).toBe(20)
  })
  it('يصحّح كل مشتت على حدة', () => {
    for (const question of questions) {
      question.fields.forEach((field, index) => {
        const expected = EXAM_ANSWERS[`${question.id}:${index}`]
        if (field.kind === 'choice' || field.kind === 'select') {
          for (const option of field.options) expect(isFieldCorrect(field, [option], 'strict'), `${question.id}: ${option}`).toBe(option === expected[0])
        } else if (field.kind === 'multi') {
          expect(isFieldCorrect(field, expected, 'strict')).toBe(true)
          expect(isFieldCorrect(field, expected.slice(1), 'strict')).toBe(false)
          const extra = field.options.find((o) => !expected.includes(o))!
          expect(isFieldCorrect(field, [...expected, extra], 'strict')).toBe(false)
        }
      })
    }
  })
  it('يفرّق بين الخطأ والفراغ والجزئي، ويحافظ على الحركات', () => {
    expect(gradeLesson10(allWrong())).toMatchObject({ correct: 0, wrong: 20, unanswered: 0 })
    expect(gradeLesson10({})).toMatchObject({ correct: 0, wrong: 0, unanswered: 20 })
    const dual = questions[12]
    expect(questionStatus(dual, { 'morph10-q13:0': ['تَفاعَلَ'] }, 'strict')).toBe('unanswered')
    expect(questionStatus(dual, EXAM_ANSWERS, 'strict')).toBe('correct')
    const field = questions[13].fields[0]
    expect(isFieldCorrect(field, ['تَفْعيل'], 'strict')).toBe(true)
    for (const v of ['تَفَعُّل', 'تفعيل', 'فِعالة']) expect(isFieldCorrect(field, [v], 'strict')).toBe(false)
  })
  it('يبقي الصفحات غير المحقَّقة خارج النتيجة ويستبدل عند إعادة التحقق', () => {
    expect(gradeLesson10(EXAM_ANSWERS, [])).toMatchObject({ total: 0, complete: false, pagesChecked: 0 })
    expect(gradeLesson10(EXAM_ANSWERS, [testDefinition.pages[0].id])).toMatchObject({ total: 5, correct: 5, complete: false, pagesChecked: 1 })
    const results = Object.fromEntries(testDefinition.pages.map((p) => [p.id, gradePage(p, EXAM_ANSWERS, 'strict')]))
    results[testDefinition.pages[0].id] = gradePage(testDefinition.pages[0], allWrong(), 'strict')
    expect(combinePageResults(testDefinition, results)).toMatchObject({ total: 20, correct: 15, wrong: 5, complete: true })
  })
})

describe('morphology 10 — التدريبات والاختبار الأصلي والأنشطة منفصلة عن الاختبار', () => {
  it('يصحّح التدريبات الأحد عشر والاختبار الأصلي الستة ويرفض مشتتاتها', () => {
    for (const item of sourceContent.trainings.groups.flatMap((g) => [...g.items])) {
      const solution = trainingSolutions[item.number]
      expect(solution.answer).toBe(EXPECTED_TRAINING_KEYS[item.number - 1])
      expect(practiceStatus(solution, undefined)).toBe('unanswered')
      for (const option of item.options) expect(practiceStatus(solution, option)).toBe(option === solution.answer ? 'correct' : 'wrong')
    }
    for (const item of sourceContent.originalFinal.items) {
      const solution = originalFinalSolutions[item.number]
      expect(solution.answer).toBe(EXPECTED_ORIGINAL_KEYS[item.number - 1])
      for (const option of item.options) expect(practiceStatus(solution, option)).toBe(option === solution.answer ? 'correct' : 'wrong')
    }
    expect(practiceStatus({ answer: 'تَفَعُّل' }, 'تَفْعيل')).toBe('wrong')
    expect(practiceStatus({ answer: 'اسْتِفْعال' }, 'افْتِعال')).toBe('wrong')
  })
  it('يتحقق من مفاتيح الأنشطة السبعة', () => {
    for (const lab of [classifyLab, rootsLab, masdarLab, weightLab]) {
      for (const item of lab.items) {
        expect(practiceStatus(item, item.answer)).toBe('correct')
        for (const option of item.options) if (option !== item.answer) expect(practiceStatus(item, option)).toBe('wrong')
      }
    }
    for (const item of comparisonLab.items) {
      expect(item.verbWeight).not.toBe(item.masdarWeight)
    }
    for (const c of [...analysisLab.cases, ...challengeLab.cases]) {
      for (const stage of c.stages) expect(stage.options).toContain(stage.answer)
    }
  })
})
