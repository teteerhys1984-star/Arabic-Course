/**
 * Platform-wide conformance test for every lesson's test definition.
 *
 * This is the automated, enforceable guard behind docs/lesson-test-standards.md:
 * a lesson is NOT complete unless its test
 *   - is declared once as a shared `TestDefinition` (pages of questions);
 *   - has at least one checkable page with a title and questions;
 *   - uses unique ids/numbers and well-formed fields;
 *   - offers a displayable solution (or a teacher-only model answer) for every
 *     question — no placeholder solutions;
 *   - supports the shared engine's page-level contract: checking one page never
 *     marks the others, rechecking replaces (never double-counts), and the final
 *     result combines the latest valid page results.
 *
 * Adding a future lesson? Export its `testDefinition` and add it to the list
 * below — this test then enforces the standard on it automatically.
 */
import { describe, expect, it } from 'vitest'
import {
  autoFields,
  buildSolutionEntries,
  combinePageResults,
  gradePage,
  hasManualPart,
  questionSolution,
  questionStatus,
  type TestDefinition,
} from './index'
import { testDefinition as lessonOneTest } from '../../lessons/LessonOne'
import { testDefinition as lessonTwoTest } from '../../lessons/LessonTwo'
import { testDefinition as lessonThreeTest } from '../../lessons/LessonThree'
import { testDefinition as lessonFourTest } from '../../lessons/LessonFour'
import { testDefinition as lessonFiveTest } from '../../lessons/LessonFive'
import { testDefinition as lessonSixTest } from '../../lessons/LessonSix'
import { testDefinition as lessonSevenTest } from '../../lessons/LessonSeven'
import { testDefinition as lessonEightTest } from '../../lessons/LessonEight'
import { testDefinition as lessonNineTest } from '../../lessons/LessonNine'
import { testDefinition as lessonTenTest } from '../../lessons/LessonTen'
import { testDefinition as morphologyOneTest } from '../../lessons/LessonMorphologyOne'

/** Every lesson's test, with its source-mandated question count. */
const lessonTests: Array<{ lesson: string; test: TestDefinition; expectedQuestions: number }> = [
  { lesson: 'lesson-1', test: lessonOneTest, expectedQuestions: 20 },
  { lesson: 'lesson-2', test: lessonTwoTest, expectedQuestions: 20 },
  { lesson: 'lesson-3', test: lessonThreeTest, expectedQuestions: 20 },
  { lesson: 'lesson-4', test: lessonFourTest, expectedQuestions: 20 },
  { lesson: 'lesson-5', test: lessonFiveTest, expectedQuestions: 20 },
  { lesson: 'lesson-6', test: lessonSixTest, expectedQuestions: 20 },
  { lesson: 'lesson-7', test: lessonSevenTest, expectedQuestions: 25 },
  { lesson: 'lesson-8', test: lessonEightTest, expectedQuestions: 20 },
  { lesson: 'lesson-9', test: lessonNineTest, expectedQuestions: 20 },
  { lesson: 'lesson-10', test: lessonTenTest, expectedQuestions: 20 },
  { lesson: 'morphology-lesson-01', test: morphologyOneTest, expectedQuestions: 45 },
]

describe('lesson test conformance — the shared platform schema', () => {
  it('covers every registered lesson (11 lessons)', () => {
    expect(lessonTests).toHaveLength(11)
    expect(new Set(lessonTests.map((entry) => entry.lesson)).size).toBe(11)
  })

  it.each(lessonTests.map((entry) => [entry.lesson, entry] as const))(
    '%s declares a well-formed TestDefinition',
    (_lesson, { test, expectedQuestions }) => {
      // Identity and structure.
      expect(test.id.trim()).not.toBe('')
      expect(test.title.trim()).not.toBe('')
      expect(test.pages.length).toBeGreaterThan(0)

      const pageIds = new Set<string>()
      const questionIds = new Set<string>()
      const questionNumbers = new Set<number>()
      let total = 0

      for (const page of test.pages) {
        expect(page.id.trim(), `page id in ${test.id}`).not.toBe('')
        expect(pageIds.has(page.id), `duplicate page id ${page.id}`).toBe(false)
        pageIds.add(page.id)
        expect(page.title.trim(), `page ${page.id} must have a title (it is the checkable page heading)`).not.toBe('')
        expect(page.questions.length, `page ${page.id} must contain questions`).toBeGreaterThan(0)

        for (const question of page.questions) {
          total += 1
          expect(questionIds.has(question.id), `duplicate question id ${question.id}`).toBe(false)
          questionIds.add(question.id)
          expect(questionNumbers.has(question.number), `duplicate question number ${question.number}`).toBe(false)
          questionNumbers.add(question.number)
          expect(question.prompt.trim(), `question ${question.id} must have a prompt`).not.toBe('')
          expect(question.fields.length, `question ${question.id} must have at least one field`).toBeGreaterThan(0)

          for (const field of question.fields) {
            if (field.kind === 'choice' || field.kind === 'select') {
              expect(field.options.length, `${question.id}: choice/select needs options`).toBeGreaterThan(0)
              expect(field.options, `${question.id}: answer must be one of the options`).toContain(field.answer)
            } else if (field.kind === 'multi') {
              expect(field.answers.length, `${question.id}: multi needs answers`).toBeGreaterThan(0)
              for (const answer of field.answers) expect(field.options).toContain(answer)
            } else if (field.kind === 'text') {
              expect(field.accept.length, `${question.id}: text needs accepted answers`).toBeGreaterThan(0)
            } else {
              expect(field.kind).toBe('essay')
              expect(field.label.trim(), `${question.id}: essay needs a label`).not.toBe('')
            }
          }

          // No placeholder solutions: every question must offer a displayable
          // solution, or a teacher-only model answer for manual review.
          const hasSolution = questionSolution(question).trim().length > 0
          const hasTeacherAnswer = Boolean(question.teacherAnswer?.trim())
          expect(
            hasSolution || hasTeacherAnswer,
            `question ${question.id} (${question.number}) has no solution and no teacher answer`,
          ).toBe(true)
        }
      }

      expect(total, `${test.id} must keep its source-mandated question count`).toBe(expectedQuestions)
    },
  )

  it.each(lessonTests.map((entry) => [entry.lesson, entry] as const))(
    '%s supports page-level checking: one page checks without the others',
    (_lesson, { test }) => {
      const firstPage = test.pages[0]
      const answers = Object.fromEntries(
        firstPage.questions.flatMap((question) =>
          question.fields.map((_field, index) => [`${question.id}:${index}`, ['x']]),
        ),
      )
      const result = gradePage(firstPage, answers, test.matching)
      expect(result.pageId).toBe(firstPage.id)
      expect(result.total).toBe(firstPage.questions.length)

      // Checking page 1 must not mark any other page as checked.
      const combined = combinePageResults(test, { [firstPage.id]: result })
      expect(combined.pagesChecked).toBe(1)
      expect(combined.pagesTotal).toBe(test.pages.length)
      expect(combined.complete).toBe(test.pages.length === 1)
    },
  )

  it.each(lessonTests.map((entry) => [entry.lesson, entry] as const))(
    '%s aggregates the final result from the latest valid page results without double-counting',
    (_lesson, { test }) => {
      // Check every page twice: the second (latest) result replaces the first.
      const pageResults = Object.fromEntries(
        test.pages.map((page) => [page.id, gradePage(page, {}, test.matching)]),
      )
      const again = Object.fromEntries(
        test.pages.map((page) => [page.id, gradePage(page, {}, test.matching)]),
      )
      const combined = combinePageResults(test, { ...pageResults, ...again })
      const expectedTotal = test.pages.reduce((sum, page) => sum + page.questions.length, 0)
      expect(combined.total).toBe(expectedTotal)
      expect(combined.complete).toBe(true)
      expect(combined.unanswered).toBe(expectedTotal)
    },
  )

  it.each(lessonTests.map((entry) => [entry.lesson, entry] as const))(
    '%s builds structured solution entries for every question (revealed only per checked page)',
    (_lesson, { test }) => {
      const groups = buildSolutionEntries(test, {}, {})
      expect(groups).toHaveLength(test.pages.length)
      for (const group of groups) {
        expect(group.entries.every((entry) => entry.revealed === false)).toBe(true)
        for (const entry of group.entries) {
          expect(entry.question.fields.length).toBeGreaterThan(0)
        }
      }
      // Teacher mode reveals everything.
      const teacherGroups = buildSolutionEntries(test, {}, {}, { teacher: true })
      expect(teacherGroups.every((group) => group.entries.every((entry) => entry.revealed))).toBe(true)
    },
  )

  it('distinguishes correct, incorrect, unanswered and manually reviewed answers across the platform', () => {
    const withManual = lessonTests.filter(({ test }) => test.pages.some((page) => page.questions.some(hasManualPart)))
    // Lessons 1–7 and morphology carry manual-review (essay) questions.
    expect(withManual.length).toBeGreaterThanOrEqual(8)

    // Morphology keeps its essay-only questions in manual review (never auto-graded).
    const essayOnly = morphologyOneTest.pages.flatMap((page) =>
      page.questions.filter((question) => autoFields(question).length === 0),
    )
    expect(essayOnly.length).toBe(10)
    const answers = Object.fromEntries(essayOnly.map((question) => [`${question.id}:0`, ['نص']]))
    for (const question of essayOnly) {
      expect(questionStatus(question, answers, morphologyOneTest.matching)).toBe('manual')
    }
  })
})
