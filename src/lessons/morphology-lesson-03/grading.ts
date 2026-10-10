/**
 * منطق تصحيح اختبار الدرس الثالث من قسم الصرف — غلاف رقيق فوق المحرك المشترك.
 *
 * هذا اختبار درس (لا اختبار وحدة): ٢٠ سؤالًا في ٤ صفحات، لكل سؤال درجة واحدة،
 * وكلها تُصحَّح آليًا (لا أسئلة مقالية في هذا الدرس). وسياسة عدد الأسئلة
 * مطابقة لبقية دروس المنصة (٢٠ سؤالًا لكل درس)، وقد وُثّقت في تقرير الدرس.
 *
 * كل منطق المقارنة (الحركات، المسافات، الهمزات) في src/shared/test/grading.ts،
 * وهذا الملف لا يضيف قواعد تصحيح جديدة؛ بل يجمع صفحات الاختبار في نتيجة واحدة
 * لتكون مرجعًا لاختبارات الدرس.
 */
import { combinePageResults, gradePage } from '../../shared/test'
import type { AnswerMap, PageResult, TestResult } from '../../shared/test'
import { testDefinition } from './content'

export type { AnswerMap, PageResult, TestResult }

/** ثوابت الاختبار المعتمدة لهذا الدرس. */
export const TEST_TOTALS = {
  /** عدد الأسئلة الكلي. */
  questions: 20,
  /** عدد صفحات الاختبار (كل صفحة تُتحقَّق منها وحدها). */
  pages: 4,
  /** درجة كل سؤال. */
  marksPerQuestion: 1,
  /** المجموع المعتمد. */
  total: 20,
  /** الدرجات التي تُراجع يدويًا (لا يوجد في هذا الدرس). */
  manualMax: 0,
} as const

/**
 * نتيجة الاختبار من إجابات الطالب، للصفحات المتحقَّق منها فقط؛ فالصفحة غير المتحقَّق منها
 * لا تدخل في النتيجة، ولا تكون النتيجة «مكتملة» إلا إذا تحقّق الطالب من كل الصفحات.
 */
export function gradeLesson3(
  answers: AnswerMap,
  checkedPageIds: readonly string[] = testDefinition.pages.map((page) => page.id),
): TestResult {
  const matching = testDefinition.matching ?? 'strict'
  const pageResults: Record<string, PageResult> = {}
  for (const page of testDefinition.pages) {
    if (checkedPageIds.includes(page.id)) pageResults[page.id] = gradePage(page, answers, matching)
  }
  return combinePageResults(testDefinition, pageResults)
}

/** الدرجة المستحقة: عدد الأسئلة الصحيحة × درجة السؤال. */
export function earnedMarks(result: TestResult): number {
  return result.correct * TEST_TOTALS.marksPerQuestion
}
