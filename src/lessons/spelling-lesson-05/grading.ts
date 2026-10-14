/** غلاف رقيق للدرس الخامس. تصحيح الاختبارين كله في المحرك المشترك؛ هنا ثوابت ومساعدات للأنشطة. */
import { combinePageResults, gradePage, normalizeAnswer } from '../../shared/test'
import type { AnswerMap, PageResult, TestDefinition, TestResult } from '../../shared/test'
import { originalFinalTest, testDefinition } from './content'

export const TEST_TOTALS = { questions: 20, pages: 4, marksPerQuestion: 1, total: 20 } as const

/** تصحيح أنشطة الاختيار والتدريب السباعي؛ الحركات ذات دلالة (مطابقة صارمة بعد التطبيع). */
export function choiceStatus(item: { answer: string }, value: string | undefined): 'correct' | 'wrong' | 'unanswered' {
  const normalized = normalizeAnswer(value)
  if (!normalized) return 'unanswered'
  return normalized === normalizeAnswer(item.answer) ? 'correct' : 'wrong'
}

function gradeTest(test: TestDefinition, answers: AnswerMap, checkedPageIds: readonly string[]): TestResult {
  const results: Record<string, PageResult> = {}
  for (const page of test.pages) {
    if (checkedPageIds.includes(page.id)) results[page.id] = gradePage(page, answers, test.matching)
  }
  return combinePageResults(test, results)
}

export function gradeSpelling5(
  answers: AnswerMap,
  checkedPageIds: readonly string[] = testDefinition.pages.map((page) => page.id),
): TestResult {
  return gradeTest(testDefinition, answers, checkedPageIds)
}

export function gradeOriginalFinal(answers: AnswerMap): TestResult {
  return gradeTest(originalFinalTest, answers, originalFinalTest.pages.map((page) => page.id))
}

/** درجة الاختبار الختامي الأصلي: الأسئلة الثمانية كلها آلية التصحيح في جزئها الأول؛ تعليل السؤال الثامن يُراجع يدويًا. */
export function originalFinalScore(result: TestResult): { correct: number; auto: number } {
  return { correct: result.correct, auto: originalFinalTest.pages[0].questions.length }
}
