import { describe, expect, it } from 'vitest'
import { answerKey, gradePage, type AnswerMap } from '../../shared/test'
import { testDefinition } from './content'
import { TEST_TOTALS, attemptStatus, choiceStatus, earnedMarks, gradeLesson11 } from './grading'
import { EXAM_ANSWERS } from './test-fixtures'

const allCorrect: AnswerMap = Object.fromEntries(Object.entries(EXAM_ANSWERS))
const pageIds = testDefinition.pages.map((page) => page.id)

describe('morphology 11 — تصحيح الاختبار المستقل عبر المحرك المشترك', () => {
  it('يعطي ٢٠/٢٠ للإجابات الصحيحة، و٠ مع ٢٠ «لم تُجب» للورقة الفارغة', () => {
    const full = gradeLesson11(allCorrect)
    expect(full).toMatchObject({ total: 20, correct: 20, wrong: 0, unanswered: 0, manual: 0, complete: true, pagesChecked: 4 })
    expect(earnedMarks(full)).toBe(TEST_TOTALS.total)
    const empty = gradeLesson11({})
    expect(empty).toMatchObject({ correct: 0, unanswered: 20, complete: true })
  })

  it('يصحّح على مستوى الصفحة ولا يحتسب صفحات لم يُتحقق منها', () => {
    const partial = gradeLesson11(allCorrect, [pageIds[0]])
    expect(partial).toMatchObject({ correct: 5, pagesChecked: 1, complete: false })
    const page = gradePage(testDefinition.pages[3], allCorrect, testDefinition.matching)
    expect(page).toMatchObject({ total: 5, correct: 5 })
  })

  it('يتطلب حقلي السؤالين ١٤ و١٧ معًا، ويشترط كل اختيارات السؤال ٥ دون زيادة', () => {
    const halfQ14 = { ...allCorrect, [answerKey('morph11-q14', 1)]: ['مُرْسَل'] }
    expect(gradeLesson11(halfQ14).correct).toBe(19)
    const partialMulti = { ...allCorrect, [answerKey('morph11-q05', 0)]: ['راكِب'] }
    expect(gradeLesson11(partialMulti).correct).toBe(19)
    const extraMulti = { ...allCorrect, [answerKey('morph11-q05', 0)]: ['راكِب', 'مُشارِك', 'رُكوب'] }
    expect(gradeLesson11(extraMulti).correct).toBe(19)
  })

  it('يميّز بالحركة في المطابقة الصارمة: مُسْتَقْبَل ليست مُسْتَقْبِل', () => {
    const wrong = { ...allCorrect, [answerKey('morph11-q13', 0)]: ['مُسْتَقْبَل'] }
    const result = gradeLesson11(wrong)
    expect(result).toMatchObject({ correct: 19, wrong: 1 })
  })

  it('آخر تحقق للصفحة يحل محل السابق ولا يتكرر الاحتساب', () => {
    const first = gradeLesson11({ ...allCorrect, [answerKey('morph11-q01', 0)]: ['زِراعة'] })
    expect(first.correct).toBe(19)
    const again = gradeLesson11(allCorrect)
    expect(again.correct).toBe(20)
    expect(gradeLesson11(allCorrect, [...pageIds, ...pageIds]).correct).toBe(20)
  })
})

describe('morphology 11 — تصحيح أنشطة الدرس', () => {
  it('يطابق خيارات التدريب وصح/خطأ مطابقة تامة', () => {
    expect(choiceStatus('مُكرِم', undefined)).toBe('unanswered')
    expect(choiceStatus('مُكرِم', 'مُكرِم')).toBe('correct')
    expect(choiceStatus('مُكرِم', 'مُكرَم')).toBe('wrong')
    expect(choiceStatus('صح', 'خطأ')).toBe('wrong')
  })

  it.each([
    ['', 'كاتِب', 'empty'],
    ['   ', 'كاتِب', 'empty'],
    ['كاتب', 'كاتِب', 'unvoweled'],
    ['كاتِب', 'كاتِب', 'correct'],
    ['كاتِبٌ', 'كاتِب', 'correct'],
    ['حافظ', 'كاتِب', 'wrong'],
    ['مُحْسَن', 'مُحْسِن', 'marks'],
    ['محسِن', 'مُحْسِن', 'correct'],
    ['مُكرَم', 'مُكْرِم', 'marks'],
    ['مُكرِم', 'مُكْرِم', 'correct'],
    ['خارج', 'مُسْتَخْرِج', 'wrong'],
    ['مُسْتَخْرِج', 'مُسْتَخْرِج', 'correct'],
    ['بائع', 'بائِع', 'unvoweled'],
    ['مُجْتَمَع', 'مُجْتَمِع', 'marks'],
  ] as const)('يحكم على المحاولة «%s» مقابل «%s» بـ %s', (value, answer, expected) => {
    expect(attemptStatus(value, answer)).toBe(expected)
  })
})
