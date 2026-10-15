/** غلاف رقيق للدرس الحادي عشر. تصحيح الاختبار المستقل كله في المحرك المشترك. */
import { combinePageResults, gradePage, looseKey, normalizeAnswer } from '../../shared/test'
import type { AnswerMap, PageResult, TestResult } from '../../shared/test'
import { testDefinition } from './content'

export const TEST_TOTALS = { questions: 20, pages: 4, marksPerQuestion: 1, total: 20, manualMax: 0 } as const

export type ChoiceStatus = 'correct' | 'wrong' | 'unanswered'

/** تصحيح أسئلة الاختيار في التدريب والقسم الثالث من الختامي: مطابقة تامة لنص الخيار. */
export function choiceStatus(answer: string, value: string | undefined): ChoiceStatus {
  const normalized = normalizeAnswer(value)
  if (!normalized) return 'unanswered'
  return normalized === normalizeAnswer(answer) ? 'correct' : 'wrong'
}

/**
 * حالة محاولة مكتوبة (القسم الثاني من الختامي والواجب):
 *  - 'empty'      لا محاولة؛
 *  - 'wrong'      الحروف مختلفة؛
 *  - 'marks'      الحروف صحيحة لكن حركة مكتوبة تخالف الضبط (مثل مُحْسَن بدل مُحْسِن)؛
 *  - 'unvoweled'  الحروف صحيحة بلا ضبط؛
 *  - 'correct'    الحروف صحيحة وكل حركة مكتوبة توافق الضبط.
 * الحركة على الحرف الأخير لا تُقارن لأنها حركة إعراب (كاتبٌ، كاتبًا).
 */
export type AttemptStatus = 'empty' | 'wrong' | 'marks' | 'unvoweled' | 'correct'

const harakat = /[\u064B-\u0652\u0670]/
interface Cluster { base: string; marks: string }
function clusters(value: string): Cluster[] {
  const cleaned = normalizeAnswer(value)
    .replace(/[أإآ]/g, 'ا')
    .replace(/[.،؛:؟!«»"'()\-ـ\s]/g, '')
  const out: Cluster[] = []
  for (const char of cleaned) {
    if (harakat.test(char)) {
      if (out.length) out[out.length - 1].marks += char
    } else out.push({ base: char, marks: '' })
  }
  return out
}
export function attemptStatus(value: string | undefined, answer: string): AttemptStatus {
  if (!looseKey(value)) return 'empty'
  if (looseKey(value) !== looseKey(answer)) return 'wrong'
  const student = clusters(value ?? '')
  const model = clusters(answer)
  let anyMark = false
  for (let index = 0; index < student.length - 1; index += 1) {
    const typed = student[index].marks
    if (!typed) continue
    anyMark = true
    const expected = model[index]?.marks ?? ''
    // كل حركة كتبها الطالب يجب أن تكون من ضبط الكلمة؛ ويُقبل ضبط جزئي.
    if (![...typed].every((mark) => expected.includes(mark))) return 'marks'
  }
  return anyMark ? 'correct' : 'unvoweled'
}

export function gradeLesson11(
  answers: AnswerMap,
  checkedPageIds: readonly string[] = testDefinition.pages.map((page) => page.id),
): TestResult {
  const results: Record<string, PageResult> = {}
  for (const page of testDefinition.pages) {
    if (checkedPageIds.includes(page.id)) results[page.id] = gradePage(page, answers, testDefinition.matching)
  }
  return combinePageResults(testDefinition, results)
}

export function earnedMarks(result: TestResult): number {
  return result.correct * TEST_TOTALS.marksPerQuestion
}
