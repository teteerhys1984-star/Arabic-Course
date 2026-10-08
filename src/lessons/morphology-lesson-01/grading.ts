import type { MorphTestQuestion, TestField } from './content'

/**
 * منطق التصحيح الخالص لاختبار الدرس الأول من قسم الصرف.
 *
 * القواعد:
 *  - الاختيار من متعدد وصح/خطأ يُقارنان بالقيمة الكاملة.
 *  - استخراج الجذر والوزن (حقول text) يُقارنان بتطبيع خفيف: تُحذف الحركات والمسافات
 *    والشرطات والتطويل، وتُوحّد الألف، لأن الجذر يُكتب بالحروف لا بالحركات.
 *  - حقول التعليل والتفكير (essay) لا تُصحَّح آليًا أبدًا، وتُعدّ «تُراجع يدويًا».
 *  - الدرجة الآلية تُحسب فقط على الأسئلة التي تحتوي على حقل آلي؛ وفي السؤال المختلط
 *    (٣٨–٤٠) يُصحَّح الجذر آليًا والتفسير يبقى للمراجعة اليدوية.
 *  - لا يُعدّ السؤال مجابًا آليًا إلا إذا أُجيب عن كل حقوله الآلية.
 */

export type AnswerValue = string[]
export type AnswerMap = Record<string, AnswerValue>
export type AutoStatus = 'correct' | 'wrong' | 'unanswered'

const invisibleMarks = /[\u200e\u200f\u061c\u202a-\u202e\u2066-\u2069]/g

export function answerKey(questionId: string, fieldIndex: number): string {
  return `${questionId}:${fieldIndex}`
}

/** يزيل علامات الاتجاه غير المرئية ويجمع المسافات فقط؛ الحركات تبقى كما هي. */
export function normalizeAnswer(value: string | undefined): string {
  return (value ?? '').replace(invisibleMarks, '').replace(/\s+/g, ' ').trim()
}

/** مفتاح مرن للجذور والأوزان: بلا حركات ولا تطويل ولا فواصل، والألف موحّدة. */
export function looseKey(value: string | undefined): string {
  return normalizeAnswer(value)
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[.،؛:؟!«»"'()\-ـ\s]/g, '')
}

export function isFieldAnswered(_field: TestField, value: AnswerValue | undefined): boolean {
  if (!value) return false
  return normalizeAnswer(value[0]) !== ''
}

export function isFieldCorrect(field: TestField, value: AnswerValue | undefined): boolean {
  if (!value || !isFieldAnswered(field, value)) return false
  if (field.kind === 'choice') return normalizeAnswer(value[0]) === normalizeAnswer(field.answer)
  if (field.kind === 'text') return field.accept.some((accepted) => looseKey(value[0]) === looseKey(accepted))
  return false
}

/** الحقول القابلة للتصحيح الآلي فقط. */
export function autoFields(question: MorphTestQuestion): { field: TestField; index: number }[] {
  return question.fields
    .map((field, index) => ({ field, index }))
    .filter(({ field }) => field.kind !== 'essay')
}

/** الأسئلة التي تحتوي على جزء يحتاج مراجعة يدوية. */
export function hasManualPart(question: MorphTestQuestion): boolean {
  return question.fields.some((field) => field.kind === 'essay')
}

export function autoStatus(question: MorphTestQuestion, answers: AnswerMap): AutoStatus | null {
  const parts = autoFields(question)
  if (parts.length === 0) return null
  const answered = parts.every(({ field, index }) => isFieldAnswered(field, answers[answerKey(question.id, index)]))
  if (!answered) return 'unanswered'
  const correct = parts.every(({ field, index }) => isFieldCorrect(field, answers[answerKey(question.id, index)]))
  return correct ? 'correct' : 'wrong'
}

export interface TestResult {
  /** عدد الأسئلة القابلة للتصحيح الآلي (الموضوعية + الجذور + الجزء الآلي من التحليل). */
  autoTotal: number
  autoCorrect: number
  autoWrong: number
  autoUnanswered: number
  /** الأسئلة التي تحتوي على جزء يُراجع يدويًا: 31–35، 38–40 (التفسير)، 41–45. */
  manualIds: string[]
  statuses: Record<string, AutoStatus | null>
  byType: Record<string, { total: number; correct: number }>
}

export function gradeTest(questions: MorphTestQuestion[], answers: AnswerMap): TestResult {
  const statuses: Record<string, AutoStatus | null> = {}
  const byType: TestResult['byType'] = {}
  let autoTotal = 0
  let autoCorrect = 0
  let autoWrong = 0
  let autoUnanswered = 0
  const manualIds: string[] = []

  for (const question of questions) {
    const status = autoStatus(question, answers)
    statuses[question.id] = status
    if (hasManualPart(question)) manualIds.push(question.id)
    if (status === null) continue

    autoTotal += 1
    byType[question.type] ??= { total: 0, correct: 0 }
    byType[question.type].total += 1
    if (status === 'correct') {
      autoCorrect += 1
      byType[question.type].correct += 1
    } else if (status === 'wrong') {
      autoWrong += 1
    } else {
      autoUnanswered += 1
    }
  }

  return { autoTotal, autoCorrect, autoWrong, autoUnanswered, manualIds, statuses, byType }
}

/** يعرض الإجابة التي اختارها الطالب بصيغة مقروءة، أو null إذا لم يجب. */
export function readableAnswer(field: TestField, value: AnswerValue | undefined): string | null {
  if (!value || !isFieldAnswered(field, value)) return null
  return normalizeAnswer(value[0])
}

/** عدد الأسئلة التي أُجيب عن كل حقولها (الآلية واليدوية). */
export function answeredCount(questions: MorphTestQuestion[], answers: AnswerMap): number {
  return questions.filter((question) =>
    question.fields.every((field, index) => isFieldAnswered(field, answers[answerKey(question.id, index)])),
  ).length
}
