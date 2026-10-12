/** غلاف رقيق للدرس التاسع. كل تصحيح الاختبار يبقى في المحرك المشترك. */
import { combinePageResults, gradePage, normalizeAnswer } from '../../shared/test'
import type { AnswerMap, PageResult, TestResult } from '../../shared/test'
import { testDefinition } from './content'

export const TEST_TOTALS = { questions: 20, pages: 4, marksPerQuestion: 1, total: 20, manualMax: 0 } as const

/** تُستعمل في التدريبات الأصلية والمختبرات فقط؛ الحركات تبقى ذات دلالة. */
export function practiceStatus(
  item: { answer: string },
  value: string | undefined,
): 'correct' | 'wrong' | 'unanswered' {
  const normalized = normalizeAnswer(value)
  if (!normalized) return 'unanswered'
  return normalized === normalizeAnswer(item.answer) ? 'correct' : 'wrong'
}

/** محوّل نقيّ لاختبارات الانحدار؛ لا قواعد تصحيح بديلة. */
export function gradeLesson9(
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
