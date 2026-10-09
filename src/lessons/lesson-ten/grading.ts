/**
 * منطق التصحيح للدرس العاشر — غلاف رقيق over المحرك المشترك.
 *
 * The platform's grading engine is shared (src/shared/test/grading.ts); this
 * module keeps the lesson's tested API stable and delegates to the shared
 * implementation with the lesson's own rules:
 *  - harakat-sensitive comparison for select/multi fields («الجوَّ» ≠ «الجوُّ»);
 *  - a flexible key for typed words (harakat/tatweel/punctuation ignored, alef unified);
 *  - a question counts as answered only when every field is answered;
 *  - the result breaks down per level (أساسي / متوسط / متقدم / تفكير).
 */
import {
  answerKey,
  answeredCount,
  gradeQuestions,
  isFieldCorrect,
  looseKey,
  normalizeAnswer,
  questionStatus,
  readableAnswer,
  sameSet,
} from '../../shared/test'
import type { QuizLevel, TestQuestion } from './content'

export type AnswerValue = string[]
export type AnswerMap = Record<string, AnswerValue>
export type QuestionStatus = 'correct' | 'wrong' | 'unanswered'

// The shared pure helpers keep their names and semantics for this lesson.
export {
  answerKey,
  answeredCount,
  isFieldCorrect,
  looseKey,
  normalizeAnswer,
  questionStatus,
  readableAnswer,
  sameSet,
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
  // 'strict' matching: harakat are significant for select/multi fields.
  const graded = gradeQuestions(questions, answers, 'strict')
  const byLevel: TestResult['byLevel'] = {
    أساسي: { total: 0, correct: 0 },
    متوسط: { total: 0, correct: 0 },
    متقدم: { total: 0, correct: 0 },
    تفكير: { total: 0, correct: 0 },
  }
  for (const question of questions) {
    byLevel[question.level].total += 1
    if (graded.statuses[question.id] === 'correct') byLevel[question.level].correct += 1
  }
  return {
    total: graded.total,
    correct: graded.correct,
    wrong: graded.wrong,
    unanswered: graded.unanswered,
    // This lesson's questions have no essay fields, so 'manual' never occurs here.
    statuses: graded.statuses as Record<string, QuestionStatus>,
    byLevel,
  }
}
