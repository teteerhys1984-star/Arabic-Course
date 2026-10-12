import { describe, expect, it } from 'vitest'
import { combinePageResults, gradePage, isFieldCorrect, questionStatus, type AnswerMap } from '../../shared/test'
import {
  analysisLab,
  kindsLab,
  masdarLab,
  positionLab,
  positionOptions,
  sourceContent,
  testDefinition,
  trainingSolutions,
  weightLab,
} from './content'
import { earnedMarks, gradeLesson9, practiceStatus, TEST_TOTALS } from './grading'
import { EXAM_ANSWERS, EXPECTED_TRAINING_KEYS } from './test-fixtures'

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

describe('morphology 09 — التصحيح عبر المحرك المشترك', () => {
  it('يستخدم ٢٠ سؤالًا في ٤ صفحات و٢٠ درجة، بلا درجات مراجعة يدوية أو اختبار وحدة', () => {
    expect(TEST_TOTALS).toEqual({ questions: 20, pages: 4, marksPerQuestion: 1, total: 20, manualMax: 0 })
    expect(testDefinition.pages.map((page) => page.questions.length)).toEqual([5, 5, 5, 5])
    expect(testDefinition.pages.every((page) => page.title.trim().length > 0)).toBe(true)
  })

  it('يمنح ٢٠/٢٠ للمفتاح المدقَّق مستقلًا، بما فيه حقول الاختيار المتعدد والمطابقة', () => {
    const result = gradeLesson9(EXAM_ANSWERS)
    expect(result).toMatchObject({ correct: 20, total: 20, wrong: 0, unanswered: 0, manual: 0, complete: true, pagesChecked: 4 })
    expect(earnedMarks(result)).toBe(20)
  })

  it('يصحّح كل مشتت على حدة بدل افتراض خطأ الخيار الأول وحده', () => {
    for (const question of questions) {
      question.fields.forEach((field, index) => {
        const expected = EXAM_ANSWERS[`${question.id}:${index}`]
        if (field.kind === 'choice' || field.kind === 'select') {
          for (const option of field.options) {
            expect(isFieldCorrect(field, [option], 'strict'), `${question.id}: ${option}`).toBe(option === expected[0])
          }
        } else if (field.kind === 'multi') {
          expect(isFieldCorrect(field, expected, 'strict')).toBe(true)
          expect(isFieldCorrect(field, [...expected].reverse(), 'strict')).toBe(true)
          expect(isFieldCorrect(field, expected.slice(1), 'strict')).toBe(false)
          const extra = field.options.find((option) => !expected.includes(option))!
          expect(isFieldCorrect(field, [...expected, extra], 'strict')).toBe(false)
        }
      })
    }
  })

  it('يفرّق بين الخطأ والفراغ والمطابقة الجزئية؛ لا درجات جزئية ولا مضاعفة', () => {
    expect(gradeLesson9(allWrong())).toMatchObject({ correct: 0, wrong: 20, unanswered: 0, manual: 0 })
    expect(gradeLesson9({})).toMatchObject({ correct: 0, wrong: 0, unanswered: 20, manual: 0 })
    const match = questions[8]
    expect(questionStatus(match, { 'morph9-q09:0': ['تَفاعُل'] }, 'strict')).toBe('unanswered')
    expect(questionStatus(match, { 'morph9-q09:0': ['تَفاعُل'], 'morph9-q09:1': ['تَفاعُل'] }, 'strict')).toBe('wrong')
    expect(questionStatus(match, EXAM_ANSWERS, 'strict')).toBe('correct')
  })

  it('يحافظ على الحركات الدالة في الأوزان والمصادر', () => {
    const field = questions[5].fields[0]
    expect(isFieldCorrect(field, ['تَفْعيل'], 'strict')).toBe(true)
    for (const value of ['تَفْعال', 'تفعيل', 'تَفْعِيل', 'فِعالة']) expect(isFieldCorrect(field, [value], 'strict')).toBe(false)
    // الضوابط الاتجاهية غير المرئية والمسافة الخارجية وحدهما بلا أثر.
    expect(isFieldCorrect(field, [' \u2067تَفْعيل\u2069 '], 'strict')).toBe(true)
  })

  it('يبقي الصفحات غير المحقَّقة خارج النتيجة ويستبدل النتيجة عند إعادة التحقق', () => {
    expect(gradeLesson9(EXAM_ANSWERS, [])).toMatchObject({ total: 0, correct: 0, complete: false, pagesChecked: 0 })
    expect(gradeLesson9(EXAM_ANSWERS, [testDefinition.pages[0].id])).toMatchObject({
      total: 5,
      correct: 5,
      complete: false,
      pagesChecked: 1,
    })
    const results = Object.fromEntries(testDefinition.pages.map((page) => [page.id, gradePage(page, EXAM_ANSWERS, 'strict')]))
    results[testDefinition.pages[0].id] = gradePage(testDefinition.pages[0], allWrong(), 'strict')
    expect(combinePageResults(testDefinition, results)).toMatchObject({ total: 20, correct: 15, wrong: 5, complete: true })
    results[testDefinition.pages[0].id] = gradePage(testDefinition.pages[0], EXAM_ANSWERS, 'strict')
    expect(combinePageResults(testDefinition, results)).toMatchObject({ total: 20, correct: 20, wrong: 0 })
  })

  it('يوافق تجميع المحرك المشترك لآخر نتائج الصفحات الصالحة', () => {
    const mixed = { ...EXAM_ANSWERS, 'morph9-q06:0': ['فِعالة'], 'morph9-q13:0': [''] }
    const results = Object.fromEntries(testDefinition.pages.map((page) => [page.id, gradePage(page, mixed, testDefinition.matching)]))
    expect(gradeLesson9(mixed)).toEqual(combinePageResults(testDefinition, results))
    expect(gradeLesson9(mixed)).toMatchObject({ correct: 18, wrong: 1, unanswered: 1 })
  })
})

describe('morphology 09 — تدريبات المصدر ومختبراته منفصلة والحركات فيها دالة', () => {
  it('يصحّح التدريبات الاثني عشر ويرفض كل مشتت دون تغيير ترتيب الخيارات', () => {
    for (const item of sourceContent.trainings.groups.flatMap((group) => [...group.items])) {
      const solution = trainingSolutions[item.number]
      expect(solution.answer).toBe(EXPECTED_TRAINING_KEYS[item.number - 1])
      expect(practiceStatus(solution, undefined)).toBe('unanswered')
      for (const option of item.options) expect(practiceStatus(solution, option)).toBe(option === solution.answer ? 'correct' : 'wrong')
    }
    // التمييز بين الأوزان المتقاربة يبقى حاسمًا.
    expect(practiceStatus({ answer: 'إِفْعال' }, 'اسْتِفْعال')).toBe('wrong')
    expect(practiceStatus({ answer: 'تَفَعُّل' }, 'تَفْعيل')).toBe('wrong')
  })

  it('يتحقق من كل مفاتيح المختبرات ومن الفراغ', () => {
    for (const lab of [kindsLab, masdarLab, weightLab]) {
      for (const item of lab.items) {
        expect(practiceStatus(item, item.answer)).toBe('correct')
        expect(practiceStatus(item, ' ')).toBe('unanswered')
        for (const option of item.options) if (option !== item.answer) expect(practiceStatus(item, option)).toBe('wrong')
      }
    }
    // مختبر الجملة: النوع من قائمة الأنواع، والموقع من قائمة المواقع.
    for (const item of positionLab.items) {
      expect(positionOptions.kinds).toContain(item.kind)
      expect(positionOptions.positions).toContain(item.position)
    }
    // المختبر المتدرّج: أربع مراحل لكل فعل، وإجابة كل مرحلة ضمن خياراتها.
    for (const analysis of analysisLab.cases) {
      expect(analysis.stages.map((stage) => stage.answer)).toHaveLength(4)
      for (const stage of analysis.stages) expect(stage.options).toContain(stage.answer)
      expect(new Set(analysis.stages.map((stage) => stage.answer)).size).toBe(4)
    }
  })
})
