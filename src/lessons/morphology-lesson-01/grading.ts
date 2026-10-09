/**
 * منطق التصحيح لاختبار الدرس الأول من قسم الصرف — غلاف رقيق over المحرك المشترك.
 *
 * The platform's grading engine is shared (src/shared/test/grading.ts); this
 * module keeps the lesson's tested API stable and delegates to the shared
 * implementation with the lesson's own rules:
 *  - choice and root/weight (text) fields are graded automatically;
 *  - essay fields (التعليل والتفكير) are never auto-graded — they are «تُراجع
 *    يدويًا», and essay-only questions report `null` (no automatic status);
 *  - a mixed question (e.g. 38–40) is graded on its automatic part only;
 *  - a question counts as answered only when every field is answered.
 */
import {
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
} from '../../shared/test'
import type { MorphTestQuestion } from './content'

export type AnswerValue = string[]
export type AnswerMap = Record<string, AnswerValue>
export type AutoStatus = 'correct' | 'wrong' | 'unanswered'

// The shared pure helpers keep their names and semantics for this lesson.
export {
  answerKey,
  answeredCount,
  autoFields,
  hasManualPart,
  isFieldAnswered,
  isFieldCorrect,
  looseKey,
  normalizeAnswer,
  readableAnswer,
}

/** The automatic status of a question, or null when it is essay-only (manual review). */
export function autoStatus(question: MorphTestQuestion, answers: AnswerMap): AutoStatus | null {
  if (autoFields(question).length === 0) return null
  // A question with automatic fields never reports 'manual' — only essay-only
  // questions do, and those returned null above.
  return questionStatus(question, answers, 'strict') as AutoStatus
}

export interface TestResult {
  /** Number of automatically gradable questions (objective + roots + the automatic part of analysis). */
  autoTotal: number
  autoCorrect: number
  autoWrong: number
  autoUnanswered: number
  /** Questions that contain a part reviewed manually: 31–35, 38–40 (the explanation), 41–45. */
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
