/**
 * Pure, shared grading engine for every lesson test on the platform.
 *
 * Rules (see docs/lesson-test-standards.md):
 *  - Checking is PAGE-LEVEL: `gradePage` grades exactly one page's questions.
 *  - Four statuses: 'correct' | 'wrong' | 'unanswered' | 'manual'. Essay fields
 *    are never auto-graded; essay-only questions report 'manual' once answered.
 *  - Page results are keyed by page id and REPLACED on recheck — combining them
 *    (`combinePageResults`) can never double-count.
 *  - 'strict' matching keeps harakat significant for choice/select/multi fields;
 *    'loose' matching ignores harakat/tatweel. Free-text fields always use the
 *    flexible key (harakat, tatweel, punctuation and spacing ignored, alef unified).
 */
import type {
  AnswerMap,
  AnswerValue,
  PageResult,
  QuestionStatus,
  TestDefinition,
  TestField,
  TestPage,
  TestQuestion,
  TestResult,
} from './types'

const invisibleMarks = /[\u200e\u200f\u061c\u202a-\u202e\u2066-\u2069]/g
const harakat = /[\u064B-\u065F\u0670\u0640]/g

export type MatchingMode = 'strict' | 'loose'

export function answerKey(questionId: string, fieldIndex: number): string {
  return `${questionId}:${fieldIndex}`
}

/** Removes invisible direction marks and collapses whitespace; harakat stay. */
export function normalizeAnswer(value: string | undefined): string {
  return (value ?? '').replace(invisibleMarks, '').replace(/\s+/g, ' ').trim()
}

/** Flexible key for free-typed words: no harakat, tatweel, punctuation or spacing; alef unified. */
export function looseKey(value: string | undefined): string {
  return normalizeAnswer(value)
    .replace(harakat, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[.،؛:؟!«»"'()\-ـ\s]/g, '')
}

/** 'loose' comparison key: harakat/tatweel/invisible marks removed, spacing removed, alef kept. */
function looseCompareKey(value: string | undefined): string {
  return normalizeAnswer(value).replace(harakat, '').replace(/\s+/g, '')
}

function compareKey(value: string | undefined, matching: MatchingMode): string {
  return matching === 'loose' ? looseCompareKey(value) : normalizeAnswer(value)
}

export function sameSet(left: string[], right: string[], matching: MatchingMode = 'strict'): boolean {
  const a = [...new Set(left.map((item) => compareKey(item, matching)).filter((item) => item !== ''))].sort()
  const b = [...new Set(right.map((item) => compareKey(item, matching)))].sort()
  return a.length === b.length && a.every((item, index) => item === b[index])
}

export function isFieldAnswered(field: TestField, value: AnswerValue | undefined): boolean {
  if (!value) return false
  if (field.kind === 'multi') return value.some((item) => normalizeAnswer(item) !== '')
  return normalizeAnswer(value[0]) !== ''
}

export function isFieldCorrect(field: TestField, value: AnswerValue | undefined, matching: MatchingMode = 'strict'): boolean {
  if (!value || !isFieldAnswered(field, value)) return false
  if (field.kind === 'choice' || field.kind === 'select') {
    return compareKey(value[0], matching) === compareKey(field.answer, matching)
  }
  if (field.kind === 'multi') return sameSet(value, field.answers, matching)
  if (field.kind === 'text') {
    if (matching === 'loose') {
      const key = looseCompareKey(value[0])
      return field.accept.some((accepted) => looseCompareKey(accepted) === key)
    }
    const key = looseKey(value[0])
    return field.accept.some((accepted) => looseKey(accepted) === key)
  }
  return false // essay fields are never auto-graded
}

/** Fields that can be graded automatically (everything except essay). */
export function autoFields(question: TestQuestion): { field: TestField; index: number }[] {
  return question.fields
    .map((field, index) => ({ field, index }))
    .filter(({ field }) => field.kind !== 'essay')
}

/** Whether the question contains a part that must be reviewed manually. */
export function hasManualPart(question: TestQuestion): boolean {
  return question.fields.some((field) => field.kind === 'essay')
}

export function questionStatus(
  question: TestQuestion,
  answers: AnswerMap,
  matching: MatchingMode = 'strict',
): QuestionStatus {
  const parts = autoFields(question)
  if (parts.length === 0) {
    // Essay-only question: answered → pending manual review, otherwise unanswered.
    const answered = question.fields.some((field, index) => isFieldAnswered(field, answers[answerKey(question.id, index)]))
    return answered ? 'manual' : 'unanswered'
  }
  const answered = parts.every(({ field, index }) => isFieldAnswered(field, answers[answerKey(question.id, index)]))
  if (!answered) return 'unanswered'
  const correct = parts.every(({ field, index }) => isFieldCorrect(field, answers[answerKey(question.id, index)], matching))
  return correct ? 'correct' : 'wrong'
}

/** Counts only questions whose every field (auto AND manual) is answered. */
export function answeredCount(questions: TestQuestion[], answers: AnswerMap): number {
  return questions.filter((question) =>
    question.fields.every((field, index) => isFieldAnswered(field, answers[answerKey(question.id, index)])),
  ).length
}

/** The correct answer of one field, in display form. */
export function fieldCorrectAnswer(field: TestField): string {
  if (field.kind === 'choice' || field.kind === 'select') return field.answer
  if (field.kind === 'multi') return field.answers.join('، ')
  if (field.kind === 'text') return field.accept[0]
  return ''
}

/** Concise model answer of a question: explicit solution, else the per-field answers. */
export function questionSolution(question: TestQuestion): string {
  if (question.solution?.trim()) return question.solution
  const parts = question.fields.filter((field) => field.kind !== 'essay').map(fieldCorrectAnswer).filter(Boolean)
  return parts.join(' — ')
}

/** The student's answer to one field in readable form, or null when unanswered. */
export function readableAnswer(field: TestField, value: AnswerValue | undefined): string | null {
  if (!value || !isFieldAnswered(field, value)) return null
  if (field.kind === 'multi') return value.filter((item) => normalizeAnswer(item) !== '').join(' ، ')
  return normalizeAnswer(value[0])
}

/** The student's whole answer to a question in readable form (fields joined). */
export function readableQuestionAnswer(question: TestQuestion, answers: AnswerMap): string | null {
  const parts: string[] = []
  question.fields.forEach((field, index) => {
    const value = readableAnswer(field, answers[answerKey(question.id, index)])
    if (value !== null) parts.push(field.label ? `${field.label}: ${value}` : value)
  })
  return parts.length > 0 ? parts.join(' — ') : null
}

function emptyGroups(): Record<string, { total: number; correct: number }> {
  return {}
}

function groupKey(question: TestQuestion): string {
  return question.level ?? question.type ?? 'الكل'
}

/** Grades a set of questions (usually one page) against the current answers. */
export function gradeQuestions(
  questions: TestQuestion[],
  answers: AnswerMap,
  matching: MatchingMode = 'strict',
): Omit<PageResult, 'pageId'> {
  const statuses: Record<string, QuestionStatus> = {}
  const byGroup = emptyGroups()
  const manualIds: string[] = []
  let correct = 0
  let wrong = 0
  let unanswered = 0
  let manual = 0

  for (const question of questions) {
    const status = questionStatus(question, answers, matching)
    statuses[question.id] = status
    if (hasManualPart(question)) {
      manualIds.push(question.id)
      // Only an ANSWERED manual part awaits review; unanswered ones are counted
      // as unanswered so the two counts never overlap confusingly.
      if (status !== 'unanswered') manual += 1
    }
    const group = groupKey(question)
    byGroup[group] ??= { total: 0, correct: 0 }
    byGroup[group].total += 1
    if (status === 'correct') {
      correct += 1
      byGroup[group].correct += 1
    } else if (status === 'wrong') {
      wrong += 1
    } else if (status === 'manual') {
      // Essay-only, answered: counted separately, never as correct/wrong.
    } else {
      unanswered += 1
    }
  }

  return { total: questions.length, correct, wrong, unanswered, manual, statuses, manualIds, byGroup }
}

/** Grades exactly ONE page — the unit of page-level checking. */
export function gradePage(page: TestPage, answers: AnswerMap, matching: MatchingMode = 'strict'): PageResult {
  return { pageId: page.id, ...gradeQuestions(page.questions, answers, matching) }
}

/**
 * Combines the LATEST valid result of every page into the final test result.
 * Page results are keyed by page id, so a recheck replaces (never adds to) the
 * previous result — aggregation cannot double-count. Pages without a valid
 * check contribute nothing and keep `complete` false.
 */
export function combinePageResults(
  test: TestDefinition,
  pageResults: Record<string, PageResult>,
): TestResult {
  const byGroup = emptyGroups()
  let total = 0
  let correct = 0
  let wrong = 0
  let unanswered = 0
  let manual = 0
  let pagesChecked = 0

  for (const page of test.pages) {
    const result = pageResults[page.id]
    if (!result) continue
    pagesChecked += 1
    total += result.total
    correct += result.correct
    wrong += result.wrong
    unanswered += result.unanswered
    manual += result.manual
    for (const [group, stats] of Object.entries(result.byGroup)) {
      byGroup[group] ??= { total: 0, correct: 0 }
      byGroup[group].total += stats.total
      byGroup[group].correct += stats.correct
    }
  }

  return {
    total,
    correct,
    wrong,
    unanswered,
    manual,
    pagesChecked,
    pagesTotal: test.pages.length,
    complete: pagesChecked === test.pages.length && test.pages.length > 0,
    byGroup,
  }
}

/** Builds the structured solution entries for the shared Solutions Area. */
export function buildSolutionEntries(
  test: TestDefinition,
  answers: AnswerMap,
  pageResults: Record<string, PageResult>,
  options: { teacher?: boolean } = {},
): { page: TestPage; entries: import('./types').SolutionEntry[] }[] {
  return test.pages.map((page) => {
    const result = pageResults[page.id]
    const revealed = options.teacher === true || Boolean(result)
    const entries = page.questions.map((question) => ({
      question,
      status: result?.statuses[question.id],
      studentAnswer: readableQuestionAnswer(question, answers) ?? undefined,
      revealed,
    }))
    return { page, entries }
  })
}
