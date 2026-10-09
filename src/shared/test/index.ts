/**
 * Shared test architecture — the single import point for lesson tests.
 *
 *   import { TestRunner, SolutionsArea, useTestEngine } from '../shared/test'
 *   import type { TestDefinition, TestPage, TestQuestion } from '../shared/test'
 *
 * Every lesson declares its test as a `TestDefinition` and renders it through
 * `TestRunner` (or `TestPageView` per step). See docs/lesson-test-standards.md.
 */
export type {
  AnswerMap,
  AnswerValue,
  PageResult,
  QuestionStatus,
  SolutionEntry,
  TestDefinition,
  TestField,
  TestPage,
  TestQuestion,
  TestResult,
} from './types'
export {
  answerKey,
  answeredCount,
  autoFields,
  buildSolutionEntries,
  combinePageResults,
  fieldCorrectAnswer,
  gradePage,
  gradeQuestions,
  hasManualPart,
  isFieldAnswered,
  isFieldCorrect,
  looseKey,
  normalizeAnswer,
  questionSolution,
  questionStatus,
  readableAnswer,
  readableQuestionAnswer,
  sameSet,
} from './grading'
export { useTestEngine, type TestEngine } from './useTestEngine'
export { TestPageView, PromptText } from './components/TestPageView'
export { TestRunner } from './components/TestRunner'
export { SolutionsArea } from './components/SolutionsArea'
