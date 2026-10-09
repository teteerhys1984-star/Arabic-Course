import { useMemo, useState } from 'react'
import {
  answerKey,
  combinePageResults,
  gradePage,
} from './grading'
import type { AnswerMap, AnswerValue, PageResult, TestDefinition, TestResult } from './types'

/**
 * The shared test engine: one instance per lesson test.
 *
 * The hook is called in the LESSON component (not inside a step), so answers and
 * page results survive LessonFlow's step navigation — responses are preserved
 * when the student moves between steps.
 *
 * Behaviour contract (docs/lesson-test-standards.md):
 *  - `checkPage(pageId)` grades ONLY that page against the current answers and
 *    stores the result under the page id (rechecking REPLACES the old result).
 *  - Editing an answer on a checked page invalidates that page's result, so the
 *    final result only ever combines the latest VALID page results.
 *  - `finalResult` aggregates the latest valid result of every page.
 */
export function useTestEngine(test: TestDefinition) {
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [pageResults, setPageResults] = useState<Record<string, PageResult>>({})

  /** question id → page id, used to invalidate a page result when its answers change. */
  const pageOfQuestion = useMemo(() => {
    const map = new Map<string, string>()
    for (const page of test.pages) {
      for (const question of page.questions) map.set(question.id, page.id)
    }
    return map
  }, [test])

  function setAnswer(questionId: string, fieldIndex: number, value: AnswerValue) {
    setAnswers((current) => {
      const next = { ...current, [answerKey(questionId, fieldIndex)]: value }
      const pageId = pageOfQuestion.get(questionId)
      if (pageId && pageId in pageResults) {
        // The stored page result no longer matches the answers: drop it so the
        // final result only combines latest valid results. Rechecking is free.
        setPageResults((results) => {
          if (!(pageId in results)) return results
          const updated = { ...results }
          delete updated[pageId]
          return updated
        })
      }
      return next
    })
  }

  function checkPage(pageId: string) {
    const page = test.pages.find((item) => item.id === pageId)
    if (!page) return
    // Replaces any previous result for this page — never double-counts.
    setPageResults((current) => ({ ...current, [pageId]: gradePage(page, answers, test.matching) }))
  }

  function uncheckPage(pageId: string) {
    setPageResults((current) => {
      if (!(pageId in current)) return current
      const next = { ...current }
      delete next[pageId]
      return next
    })
  }

  function resetTest() {
    setAnswers({})
    setPageResults({})
  }

  function isPageChecked(pageId: string): boolean {
    return pageId in pageResults
  }

  const finalResult: TestResult = useMemo(() => combinePageResults(test, pageResults), [test, pageResults])
  const checkedPageIds = useMemo(() => Object.keys(pageResults), [pageResults])
  const allPagesChecked = test.pages.length > 0 && test.pages.every((page) => page.id in pageResults)

  return {
    test,
    answers,
    pageResults,
    setAnswer,
    checkPage,
    uncheckPage,
    resetTest,
    isPageChecked,
    finalResult,
    checkedPageIds,
    allPagesChecked,
  }
}

export type TestEngine = ReturnType<typeof useTestEngine>
