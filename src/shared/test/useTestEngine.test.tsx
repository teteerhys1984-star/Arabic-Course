import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useTestEngine } from './useTestEngine'
import { answerKey } from './grading'
import type { TestDefinition } from './types'

const test: TestDefinition = {
  id: 'engine-test',
  title: 'اختبار المحرك',
  pages: [
    {
      id: 'p1',
      title: 'الصفحة الأولى',
      questions: [
        { id: 'q1', number: 1, prompt: 'سؤال 1', fields: [{ kind: 'choice', options: ['أ', 'ب'], answer: 'ب' }] },
        { id: 'q2', number: 2, prompt: 'سؤال 2', fields: [{ kind: 'choice', options: ['أ', 'ب'], answer: 'أ' }] },
      ],
    },
    {
      id: 'p2',
      title: 'الصفحة الثانية',
      questions: [
        { id: 'q3', number: 3, prompt: 'سؤال 3', fields: [{ kind: 'text', accept: ['كتب'] }] },
        { id: 'q4', number: 4, prompt: 'سؤال 4', fields: [{ kind: 'essay', label: 'علّل' }] },
      ],
    },
  ],
}

describe('useTestEngine', () => {
  it('checks a single page without touching the other pages', () => {
    const { result } = renderHook(() => useTestEngine(test))
    act(() => result.current.setAnswer('q1', 0, ['ب']))
    act(() => result.current.checkPage('p1'))

    expect(result.current.isPageChecked('p1')).toBe(true)
    expect(result.current.isPageChecked('p2')).toBe(false)
    expect(result.current.pageResults.p1.correct).toBe(1)
    expect(result.current.pageResults.p1.unanswered).toBe(1)
    expect(result.current.allPagesChecked).toBe(false)
  })

  it('keeps answers when navigating (state lives in the lesson component)', () => {
    const { result, rerender } = renderHook(() => useTestEngine(test))
    act(() => result.current.setAnswer('q1', 0, ['ب']))
    // Simulate LessonFlow unmounting/remounting step content: the hook itself is
    // NOT remounted, so answers persist — a plain rerender must not lose them.
    rerender()
    expect(result.current.answers[answerKey('q1', 0)]).toEqual(['ب'])
  })

  it('invalidates the page result when an answer is edited, and rechecking replaces it', () => {
    const { result } = renderHook(() => useTestEngine(test))
    act(() => result.current.setAnswer('q1', 0, ['أ'])) // wrong
    act(() => result.current.checkPage('p1'))
    expect(result.current.pageResults.p1.wrong).toBe(1)

    // Edit after checking → the stored page result is no longer valid.
    act(() => result.current.setAnswer('q1', 0, ['ب']))
    expect(result.current.isPageChecked('p1')).toBe(false)

    // Recheck → a fresh result replaces the old one; the final result counts once.
    act(() => result.current.checkPage('p1'))
    expect(result.current.pageResults.p1.correct).toBe(1)
    expect(result.current.finalResult.total).toBe(2)
    expect(result.current.finalResult.correct).toBe(1)
  })

  it('combines the latest valid results of all pages into the final result', () => {
    const { result } = renderHook(() => useTestEngine(test))
    act(() => result.current.setAnswer('q1', 0, ['ب']))
    act(() => result.current.setAnswer('q2', 0, ['أ']))
    act(() => result.current.setAnswer('q3', 0, ['كتب']))
    act(() => result.current.setAnswer('q4', 0, ['نص']))
    act(() => result.current.checkPage('p1'))
    act(() => result.current.checkPage('p2'))

    const final = result.current.finalResult
    expect(final.complete).toBe(true)
    expect(final.pagesChecked).toBe(2)
    expect(final.total).toBe(4)
    expect(final.correct).toBe(3)
    expect(final.manual).toBe(1) // q4 is essay-only and answered
    expect(result.current.allPagesChecked).toBe(true)
  })

  it('resetTest clears answers and page results', () => {
    const { result } = renderHook(() => useTestEngine(test))
    act(() => result.current.setAnswer('q1', 0, ['ب']))
    act(() => result.current.checkPage('p1'))
    act(() => result.current.resetTest())
    expect(result.current.answers).toEqual({})
    expect(result.current.pageResults).toEqual({})
    expect(result.current.finalResult.complete).toBe(false)
  })

  it('uncheckPage drops only that page result', () => {
    const { result } = renderHook(() => useTestEngine(test))
    act(() => result.current.checkPage('p1'))
    act(() => result.current.checkPage('p2'))
    act(() => result.current.uncheckPage('p1'))
    expect(result.current.isPageChecked('p1')).toBe(false)
    expect(result.current.isPageChecked('p2')).toBe(true)
    expect(result.current.finalResult.complete).toBe(false)
    expect(result.current.finalResult.pagesChecked).toBe(1)
  })
})
