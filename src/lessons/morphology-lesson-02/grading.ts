/**
 * منطق تصحيح اختبار الدرس الثاني من قسم الصرف — غلاف رقيق فوق المحرك المشترك.
 *
 * المحرك نفسه مشترك (src/shared/test/grading.ts)، وهذا الملف يضيف قواعد الدرس
 * الخاصة بحساب الدرجات الثلاثين:
 *  - القسم الأول (٥): التعريف درجتان + الفرق درجتان (مقالي، يُراجع يدويًا)
 *    + عبارة «سألتمونيها» درجة (آلي).
 *  - القسم الثاني (١٠): درجة لكل كلمة من العشر (آلي، مع مراعاة الحركات).
 *  - القسم الثالث (١٠): درجتان لكل كلمة = ٠٫٥ للجذر + ١ للوزن + ٠٫٥ للزوائد،
 *    وتُحتسب أول خمس كلمات يُجيب عنها الطالب في ترتيب الأسئلة (م-3)، وما
 *    بعدها لا يزيد الدرجة ولا ينقصها. وفي «قالَ» و«باعَ» يُشترط لنيل درجة
 *    الوزن ربطُ الألف الظاهرة بأصلها الصرفي (كما يوجب مفتاح المصدر).
 *  - القسم الرابع (٥): درجة لكل عبارة (آلي باختيار التصحيح)، والسبب المقالي
 *    يُراجع يدويًا ضمن الدرجة نفسها.
 *
 * المجموع: ٢٦ درجة آلي + ٤ درجات تُراجع يدويًا = ٣٠ درجة.
 * كل الأرقام والتوزيعات هنا من إعداد المنصة (م-2، م-3)، ولا تُنسب إلى نص الدرس
 * الذي ذكر المجاميع فقط.
 */
import {
  answerKey,
  answeredCount,
  autoFields,
  combinePageResults,
  gradePage,
  hasManualPart,
  isFieldAnswered,
  isFieldCorrect,
  looseKey,
  normalizeAnswer,
  questionStatus,
  readableAnswer,
  readableQuestionAnswer,
  sameSet,
} from '../../shared/test'
import type { AnswerMap, AnswerValue, PageResult, TestDefinition, TestField, TestQuestion, TestResult } from '../../shared/test'
import { marksPolicy, testDefinition } from './content'

export type { AnswerMap, AnswerValue, PageResult, TestResult }

export {
  answerKey,
  answeredCount,
  autoFields,
  hasManualPart,
  isFieldAnswered,
  isFieldCorrect,
  looseKey,
  normalizeAnswer,
  questionStatus,
  readableAnswer,
  readableQuestionAnswer,
  sameSet,
}

/** ثوابت الدرجات المعتمدة في هذا الاختبار (م-2، م-3 — من إعداد المنصة). */
export const TEST_TOTALS = {
  /** أقصى درجة تُصحَّح آليًا. */
  autoMax: 26,
  /** الدرجات التي تُراجع يدويًا مع المعلم (سؤالا القسم الأول المقاليان). */
  manualMax: 4,
  /** المجموع المعتمد. */
  total: 30,
  /** عدد الكلمات المطلوب تحليلها في القسم الثالث. */
  analysisRequired: 5,
  /** عدد كلمات القسم الثالث المعروضة. */
  analysisTotal: 8,
  /** درجة الكلمة الواحدة في القسم الثالث. */
  analysisPerWord: 2,
} as const

/** درجات مكوّنات السؤال التحليلي. */
const ROOT_MARK = 0.5
const WEIGHT_MARK = 1
const EXTRAS_MARK = 0.5

/** صفحة القسم الثالث في تعريف الاختبار. */
export const ANALYSIS_PAGE_ID = 'morph2-analysis'

function pageById(id: string) {
  return testDefinition.pages.find((page) => page.id === id)
}

/** الحقل الذي يمثّل مكوّنًا من مكوّنات التحليل. */
type AnalysisPart = 'root' | 'weight' | 'extras' | 'origin'

function analysisPart(field: TestField): AnalysisPart | null {
  const label = field.label ?? ''
  if (label.startsWith('الجذر')) return 'root'
  if (label.startsWith('الوزن')) return 'weight'
  if (label.startsWith('الحروف الزائدة')) return 'extras'
  if (label.startsWith('الألف الظاهرة')) return 'origin'
  return null
}

function isAnsweredField(question: TestQuestion, field: TestField, index: number, answers: AnswerMap): boolean {
  return isFieldAnswered(field, answers[answerKey(question.id, index)])
}

function isCorrectField(question: TestQuestion, field: TestField, index: number, answers: AnswerMap): boolean {
  return isFieldCorrect(field, answers[answerKey(question.id, index)], testDefinition.matching ?? 'strict')
}

/**
 * درجة سؤال تحليلي واحد من درجتين (٠٫٥ + ١ + ٠٫٥).
 * حقل «الألف الظاهرة أصلها» لا يحمل درجة مستقلة؛ فهو شرط لنيل درجة الوزن في
 * الكلمتين المعتلتين، تنفيذًا لاشتراط مفتاح المصدر ربط الألف بأصلها الصرفي.
 */
export function analysisQuestionMarks(question: TestQuestion, answers: AnswerMap): number {
  const parts: Partial<Record<AnalysisPart, boolean>> = {}
  question.fields.forEach((field, index) => {
    const part = analysisPart(field)
    if (!part) return
    parts[part] = isCorrectField(question, field, index, answers)
  })

  let marks = 0
  if (parts.root) marks += ROOT_MARK
  if (parts.weight) {
    // في «قالَ» و«باعَ»: درجة الوزن مشروطة بربط الألف الظاهرة بأصلها.
    if (parts.origin === undefined || parts.origin) marks += WEIGHT_MARK
  }
  if (parts.extras) marks += EXTRAS_MARK
  return marks
}

/** هل أجاب الطالب عن كل الحقول الآلية في السؤال؟ (شرط الاحتساب). */
export function isQuestionAnswered(question: TestQuestion, answers: AnswerMap): boolean {
  return autoFields(question).every(({ field, index }) => isAnsweredField(question, field, index, answers))
}

/**
 * أول خمس كلمات يُجيب عنها الطالب في ترتيب أسئلة القسم الثالث؛ وما بعدها لا
 * يُحتسب (لا يزيد الدرجة ولا ينقصها).
 */
export function countedAnalysisIds(answers: AnswerMap): { counted: string[]; ignored: string[] } {
  const page = pageById(ANALYSIS_PAGE_ID)
  if (!page) return { counted: [], ignored: [] }
  const answered = page.questions.filter((question) => isQuestionAnswered(question, answers)).map((question) => question.id)
  return {
    counted: answered.slice(0, TEST_TOTALS.analysisRequired),
    ignored: answered.slice(TEST_TOTALS.analysisRequired),
  }
}

export interface PageMarks {
  pageId: string
  title: string
  /** الدرجة الآلية المستحقة. */
  auto: number
  /** أقصى درجة آلية في هذه الصفحة. */
  autoMax: number
  /** الدرجات التي تُراجع يدويًا في هذه الصفحة. */
  manualMax: number
  /** أسئلة هذه الصفحة التي تنتظر مراجعة المعلم. */
  manualQuestions: number
  /** تفاصيل تُعرض للطالب بعد الإرسال. */
  lines: string[]
  /** معرّفات الأسئلة المحتسبة (القسم الثالث فقط). */
  countedIds?: string[]
}

export interface MarksSummary {
  pages: PageMarks[]
  /** مجموع الدرجات الآلية المستحقة. */
  auto: number
  autoMax: number
  /** الدرجات المعلّقة للمراجعة اليدوية. */
  manualMax: number
  /** المجموع المعتمد للاختبار. */
  total: number
  /** أول خمس كلمات محتسبة في القسم الثالث. */
  countedAnalysis: string[]
  /** كلمات أُجيب عنها بعد الخامسة (لا تُحتسب). */
  ignoredAnalysis: string[]
}

/** درجة القسم الأول: درجة واحدة آلية (عبارة حروف الزيادة) + ٤ درجات مقالية. */
function gradeDefinitionsPage(answers: AnswerMap): PageMarks {
  const page = pageById('morph2-definitions')
  if (!page) throw new Error('missing definitions page')
  let auto = 0
  const lines: string[] = []
  page.questions.forEach((question) => {
    const isEssayOnly = autoFields(question).length === 0
    if (isEssayOnly) {
      lines.push(`السؤال ${arabicDigits(question.number)}: درجتان تُراجعان يدويًا مع المعلم.`)
      return
    }
    const correct = questionStatus(question, answers, testDefinition.matching) === 'correct'
    auto += correct ? 1 : 0
    lines.push(`السؤال ${arabicDigits(question.number)}: ${correct ? 'درجة' : 'صفر'} (تُصحَّح آليًا).`)
  })
  return {
    pageId: page.id,
    title: page.title,
    auto,
    autoMax: 1,
    manualMax: 4,
    manualQuestions: page.questions.filter((question) => hasManualPart(question)).length,
    lines,
  }
}

/** درجة القسم الثاني: درجة لكل كلمة صحيحة. */
function gradeWeightsPage(answers: AnswerMap): PageMarks {
  const page = pageById('morph2-weights')
  if (!page) throw new Error('missing weights page')
  let auto = 0
  page.questions.forEach((question) => {
    if (questionStatus(question, answers, testDefinition.matching) === 'correct') auto += 1
  })
  return {
    pageId: page.id,
    title: page.title,
    auto,
    autoMax: page.questions.length,
    manualMax: 0,
    manualQuestions: 0,
    lines: [`درجة لكل وزن صحيح مع مراعاة الحركات: ${formatMarks(auto)} من ${arabicDigits(page.questions.length)}.`],
  }
}

/** درجة القسم الثالث: أول خمس كلمات مُجابة × درجتان. */
function gradeAnalysisPage(answers: AnswerMap): PageMarks {
  const page = pageById(ANALYSIS_PAGE_ID)
  if (!page) throw new Error('missing analysis page')
  const { counted, ignored } = countedAnalysisIds(answers)
  let auto = 0
  const lines: string[] = []
  const wordOf = (question: TestQuestion) => question.prompt.split(': ').pop() ?? ''
  page.questions.forEach((question) => {
    const position = counted.indexOf(question.id)
    if (position === -1) {
      const answeredElsewhere = ignored.includes(question.id)
      lines.push(
        answeredElsewhere
          ? `«${wordOf(question)}»: أُجيب عنها بعد الخمس الأولى — لا تزيد الدرجة ولا تنقصها.`
          : `«${wordOf(question)}»: لم تُجب عنها — لا تُحتسب.`,
      )
      return
    }
    const marks = analysisQuestionMarks(question, answers)
    auto += marks
    lines.push(`الكلمة المحتسبة ${arabicDigits(position + 1)} «${wordOf(question)}»: ${formatMarks(marks)} من ٢.`)
  })
  lines.push(
    counted.length < TEST_TOTALS.analysisRequired
      ? `احتُسبت ${arabicDigits(counted.length)} من ${arabicDigits(TEST_TOTALS.analysisRequired)} كلمات مطلوبة.`
      : `احتُسبت أول ${arabicDigits(counted.length)} كلمات مُجابة من ${arabicDigits(page.questions.length)} معروضة.`,
  )
  return {
    pageId: page.id,
    title: page.title,
    auto,
    autoMax: TEST_TOTALS.analysisRequired * TEST_TOTALS.analysisPerWord,
    manualMax: 0,
    manualQuestions: 0,
    lines,
    countedIds: counted,
  }
}

/** درجة القسم الرابع: درجة لكل تصحيح صحيح (والسبب يُراجع يدويًا). */
function gradeErrorsPage(answers: AnswerMap): PageMarks {
  const page = pageById('morph2-errors')
  if (!page) throw new Error('missing errors page')
  let auto = 0
  page.questions.forEach((question) => {
    // السؤال يجمع بين اختيار التصحيح (آلي) وكتابة السبب (يدوي)، فنعتمد الجزء الآلي.
    const [field] = question.fields
    if (field && isCorrectField(question, field, 0, answers)) auto += 1
  })
  return {
    pageId: page.id,
    title: page.title,
    auto,
    autoMax: page.questions.length,
    manualMax: 0,
    manualQuestions: page.questions.filter((question) => hasManualPart(question)).length,
    lines: [
      `درجة لكل تصحيح صحيح: ${formatMarks(auto)} من ${arabicDigits(page.questions.length)}، والسبب المقالي يُراجع يدويًا مع المعلم ضمن الدرجة نفسها.`,
    ],
  }
}

/** حساب الدرجات الثلاثين من الإجابات الحالية (دالة نقية، تُختبر مباشرة). */
export function computeMarks(answers: AnswerMap): MarksSummary {
  const pages = [
    gradeDefinitionsPage(answers),
    gradeWeightsPage(answers),
    gradeAnalysisPage(answers),
    gradeErrorsPage(answers),
  ]
  const { counted, ignored } = countedAnalysisIds(answers)
  return {
    pages,
    auto: pages.reduce((sum, page) => sum + page.auto, 0),
    autoMax: TEST_TOTALS.autoMax,
    manualMax: TEST_TOTALS.manualMax,
    total: TEST_TOTALS.total,
    countedAnalysis: counted,
    ignoredAnalysis: ignored,
  }
}

/** نتائج الصفحات كما يخزّنها المحرك المشترك (للاستعمال في الاختبارات). */
export function gradeAllPages(test: TestDefinition, answers: AnswerMap): Record<string, PageResult> {
  const results: Record<string, PageResult> = {}
  for (const page of test.pages) results[page.id] = gradePage(page, answers, test.matching)
  return results
}

/** النتيجة النهائية المجمّعة (عدد الأسئلة، لا الدرجات). */
export function finalTestResult(test: TestDefinition, answers: AnswerMap): TestResult {
  return combinePageResults(test, gradeAllPages(test, answers))
}

/** تحقق من اتساق توزيع الدرجات مع السياسة المعلنة (يُستعمل في الاختبارات). */
export function marksPolicyTotals() {
  const auto = marksPolicy.pages.reduce((sum, page) => sum + page.auto, 0)
  const manual = marksPolicy.pages.reduce((sum, page) => sum + page.manual, 0)
  const total = marksPolicy.pages.reduce((sum, page) => sum + page.marks, 0)
  return { auto, manual, total, declaredTotal: marksPolicy.total }
}

/** تنسيق درجة قد تكون نصفًا (٠٫٥ ← «٠٫٥»). */
export function formatMarks(value: number): string {
  if (Number.isInteger(value)) return arabicDigits(value)
  const [whole, fraction] = value.toFixed(1).split('.')
  return `${arabicDigits(Number(whole))}٫${arabicDigits(Number(fraction))}`
}

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] as const

export function arabicDigits(value: number): string {
  return String(value)
    .split('')
    .map((digit) => (/\d/.test(digit) ? ARABIC_DIGITS[Number(digit)] : digit))
    .join('')
}
