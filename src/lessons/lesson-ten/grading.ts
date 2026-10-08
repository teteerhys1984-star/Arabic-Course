import type { QuizField, QuizLevel, TestQuestion } from './content'

/**
 * منطق التصحيح الخالص للدرس العاشر.
 *
 * القواعد:
 *  - الاختيار من قائمة (select) والاختيار المتعدد (multi) يُقارنان بالحركات كاملة: لا تُقبل
 *    «الجوَّ» مكان «الجوُّ»، لأن الحركة الإعرابية هي موضوع السؤال نفسه.
 *  - الكلمة المكتوبة (text) تُقارن بتطبيع خفيف: تُحذف الحركات والتطويل وعلامات الترقيم،
 *    وتُوحّد الألف، لأن الطالب يكتب كلمة حرف ولا يكتب حركتها بالضرورة.
 *  - لا يُعامل السؤال بأنه مجاب إلا إذا أُجيب عن كل حقوله، وإلا فهو غير مجاب.
 */

export type AnswerValue = string[]
export type AnswerMap = Record<string, AnswerValue>
export type QuestionStatus = 'correct' | 'wrong' | 'unanswered'

const invisibleMarks = /[\u200e\u200f\u061c\u202a-\u202e\u2066-\u2069]/g

export function answerKey(questionId: string, fieldIndex: number): string {
  return `${questionId}:${fieldIndex}`
}

/** يزيل علامات الاتجاه غير المرئية ويجمع المسافات فقط؛ الحركات تبقى كما هي. */
export function normalizeAnswer(value: string | undefined): string {
  return (value ?? '').replace(invisibleMarks, '').replace(/\s+/g, ' ').trim()
}

/** مفتاح مرن للكلمات المكتوبة: بلا حركات ولا تطويل ولا ترقيم، والألف موحّدة. */
export function looseKey(value: string | undefined): string {
  return normalizeAnswer(value)
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[.،؛:؟!«»"'()\-\s]/g, '')
}

export function sameSet(left: string[], right: string[]): boolean {
  const a = [...new Set(left.map(normalizeAnswer).filter((item) => item !== ''))].sort()
  const b = [...new Set(right.map(normalizeAnswer))].sort()
  return a.length === b.length && a.every((item, index) => item === b[index])
}

export function isFieldAnswered(field: QuizField, value: AnswerValue | undefined): boolean {
  if (!value) return false
  if (field.kind === 'multi') return value.some((item) => normalizeAnswer(item) !== '')
  return normalizeAnswer(value[0]) !== ''
}

export function isFieldCorrect(field: QuizField, value: AnswerValue | undefined): boolean {
  if (!value || !isFieldAnswered(field, value)) return false
  if (field.kind === 'select') return normalizeAnswer(value[0]) === normalizeAnswer(field.answer)
  if (field.kind === 'multi') return sameSet(value, field.answers)
  return field.accept.some((accepted) => looseKey(value[0]) === looseKey(accepted))
}

export function questionStatus(question: TestQuestion, answers: AnswerMap): QuestionStatus {
  const values = question.fields.map((_, index) => answers[answerKey(question.id, index)])
  const answered = question.fields.every((field, index) => isFieldAnswered(field, values[index]))
  if (!answered) return 'unanswered'
  const correct = question.fields.every((field, index) => isFieldCorrect(field, values[index]))
  return correct ? 'correct' : 'wrong'
}

export function answeredCount(questions: TestQuestion[], answers: AnswerMap): number {
  return questions.filter((question) => questionStatus(question, answers) !== 'unanswered').length
}

export interface TestResult {
  total: number
  correct: number
  wrong: number
  unanswered: number
  statuses: Record<string, QuestionStatus>
  byLevel: Record<QuizLevel, { total: number; correct: number }>
}

export function gradeTest(questions: TestQuestion[], answers: AnswerMap): TestResult {
  const byLevel: TestResult['byLevel'] = {
    أساسي: { total: 0, correct: 0 },
    متوسط: { total: 0, correct: 0 },
    متقدم: { total: 0, correct: 0 },
    تفكير: { total: 0, correct: 0 },
  }
  const statuses: Record<string, QuestionStatus> = {}
  let correct = 0
  let wrong = 0
  let unanswered = 0

  for (const question of questions) {
    const status = questionStatus(question, answers)
    statuses[question.id] = status
    byLevel[question.level].total += 1
    if (status === 'correct') {
      correct += 1
      byLevel[question.level].correct += 1
    } else if (status === 'wrong') {
      wrong += 1
    } else {
      unanswered += 1
    }
  }

  return { total: questions.length, correct, wrong, unanswered, statuses, byLevel }
}

/** يعرض الإجابة التي اختارها الطالب بصيغة مقروءة، أو يعيد null إذا لم يجب عن الحقل. */
export function readableAnswer(field: QuizField, value: AnswerValue | undefined): string | null {
  if (!value || !isFieldAnswered(field, value)) return null
  if (field.kind === 'multi') return value.filter((item) => normalizeAnswer(item) !== '').join(' ، ')
  return normalizeAnswer(value[0])
}
