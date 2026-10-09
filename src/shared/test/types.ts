/**
 * Shared test architecture — the platform-wide contract for every lesson test.
 *
 *   LessonFlow step → TestRunner (or TestPageView) → «تحقّق من الإجابات» per page
 *                                                    ↓
 *                                        useTestEngine (answers + page results)
 *                                                    ↓
 *                              grading.ts (pure: page-level + final aggregation)
 *
 * A lesson declares its test ONCE as a `TestDefinition` (pages of questions) and
 * renders it through the shared components. The shared engine owns:
 *   - answer persistence (answers live in the lesson component, so they survive
 *     step navigation inside LessonFlow);
 *   - PAGE-LEVEL checking: every test page ends with «تحقّق من الإجابات», which
 *     grades ONLY that page — the student never has to finish the remaining pages
 *     (or the remaining questions of the page) first;
 *   - the four answer statuses: correct / wrong / unanswered / manual (essay
 *     questions are never auto-graded; they are flagged for manual review);
 *   - rechecking after edits: editing an answer invalidates its page result, and
 *     rechecking REPLACES the stored page result (results are keyed by page id,
 *     so nothing is ever double-counted);
 *   - final aggregation: the final result combines the latest valid result of
 *     every page (`combinePageResults`).
 *
 * Solutions are rendered by the shared `SolutionsArea` in the standard structure
 * (title, question number + reference, correct answer, explanation, optional
 * example, manual-review status, source-vs-platform distinction) and are only
 * revealed for pages the student has actually checked — checking a page never
 * exposes the solutions of unchecked pages.
 */

/** A single answerable field inside a question. */
export type TestField =
  | { kind: 'choice'; label?: string; options: string[]; answer: string }
  | { kind: 'select'; label: string; options: string[]; answer: string }
  | { kind: 'multi'; label: string; options: string[]; answers: string[] }
  | { kind: 'text'; label?: string; placeholder?: string; accept: string[] }
  | { kind: 'essay'; label: string; placeholder?: string }

/**
 * The four distinguishable answer states.
 *  - 'correct'     — every auto-gradable field is correct.
 *  - 'wrong'       — answered, but at least one auto-gradable field is wrong.
 *  - 'unanswered'  — the auto-gradable fields are not (fully) answered.
 *  - 'manual'      — the question is essay-only and has an answer pending review.
 * A question that mixes auto fields with an essay part keeps its auto status and
 * is additionally flagged `manual` (see `hasManualPart`).
 */
export type QuestionStatus = 'correct' | 'wrong' | 'unanswered' | 'manual'

export interface TestQuestion {
  /** Stable id; answer keys are `${question.id}:${fieldIndex}`. */
  id: string
  /** Official question number shown to the student. */
  number: number
  /** The question text (concise reference in the solutions area). */
  prompt: string
  /** Optional supporting sentence shown under the prompt. */
  sentence?: string
  /** Optional question type label, e.g. «اختيار من متعدد». */
  type?: string
  /** Optional grouping label (level/section) used for the result breakdown. */
  level?: string
  fields: TestField[]
  /** Concise model answer shown to the student after the page is checked. */
  solution?: string
  /** Teaching explanation (why the answer is correct). Never shortened away. */
  explanation?: string
  /** Optional short rule the answer demonstrates. */
  rule?: string
  /** Optional additional example — only when it adds teaching value. */
  example?: string
  /** Optional full-parsing lines. */
  parsing?: string[]
  /** The literal answer as provided by the lesson source (source fidelity). */
  sourceAnswer?: string
  /** Whether the model answer is source-provided or platform-generated. */
  answerSource?: 'source' | 'platform'
  /** Detailed model answer for the Teacher Space (never shown to students). */
  teacherAnswer?: string
  /**
   * When true, the model answer of an essay (manual-review) question is shown to
   * the student after the page is checked. When false (default), essay answers
   * stay in the Teacher Space until the teacher reviews them.
   */
  revealEssaySolution?: boolean
}

/** One checkable test page: a titled group of questions. */
export interface TestPage {
  id: string
  title: string
  description?: string
  questions: TestQuestion[]
}

export interface TestDefinition {
  /** Stable test id, e.g. «lesson-1-final-test». */
  id: string
  /** Assessment title shown in headers and the solutions area. */
  title: string
  description?: string
  /**
   * Harakat handling for auto-graded fields:
   *  - 'strict' (default) — harakat are significant («الجوَّ» ≠ «الجو»);
   *  - 'loose' — harakat and tatweel are ignored for every auto field.
   * Free-text fields always use the flexible key (harakat/tatweel/punctuation
   * ignored, alef unified), because students type words, not vowel marks.
   */
  matching?: 'strict' | 'loose'
  pages: TestPage[]
}

export type AnswerValue = string[]
/** Answer storage: `${questionId}:${fieldIndex}` → value (one entry per multi item). */
export type AnswerMap = Record<string, AnswerValue>

/** The graded outcome of ONE test page (the latest valid check of that page). */
export interface PageResult {
  pageId: string
  total: number
  correct: number
  wrong: number
  unanswered: number
  /** Questions that are (partly) essay and await manual review. */
  manual: number
  statuses: Record<string, QuestionStatus>
  manualIds: string[]
  /** Breakdown keyed by `question.level ?? question.type ?? 'الكل'`. */
  byGroup: Record<string, { total: number; correct: number }>
}

/** The aggregated final result: the latest valid result of every page combined. */
export interface TestResult {
  total: number
  correct: number
  wrong: number
  unanswered: number
  manual: number
  pagesChecked: number
  pagesTotal: number
  /** True only when every page has a valid (latest) check. */
  complete: boolean
  byGroup: Record<string, { total: number; correct: number }>
}

/** One structured entry of the shared Solutions Area. */
export interface SolutionEntry {
  question: TestQuestion
  /** Latest known status, when the page was checked. */
  status?: QuestionStatus
  /** The student's answer in readable form, when answered. */
  studentAnswer?: string
  /** False while the page is still unchecked (no premature exposure). */
  revealed: boolean
}
