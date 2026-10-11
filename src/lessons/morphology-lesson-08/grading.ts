/** Thin lesson adapter. All exam grading remains in the shared engine. */
import { combinePageResults, gradePage, normalizeAnswer } from '../../shared/test'
import type { AnswerMap, PageResult, TestResult } from '../../shared/test'
import { testDefinition, type PracticeItem } from './content'

export const TEST_TOTALS = { questions: 20, pages: 4, marksPerQuestion: 1, total: 20, manualMax: 0 } as const

/** Used by the educational activities only; harakat must remain significant. */
export function practiceStatus(item: Pick<PracticeItem, 'answer'>, value: string | undefined): 'correct' | 'wrong' | 'unanswered' {
  const normalized = normalizeAnswer(value)
  if (!normalized) return 'unanswered'
  return normalized === normalizeAnswer(item.answer) ? 'correct' : 'wrong'
}

/** Pure adapter for lesson regression tests; no alternative grading rules. */
export function gradeLesson8(
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
