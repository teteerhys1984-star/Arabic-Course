import { act, renderHook } from '@testing-library/react'
import { expect, it } from 'vitest'
import { useTestEngine } from '../../shared/test'
import { testDefinition } from './content'
import { testDefinition as previousTest } from '../spelling-lesson-06/content'
it('does not mix lesson 7 answers and results with lesson 6 or a fresh entry', () => {
 const seven = renderHook(() => useTestEngine(testDefinition))
 const six = renderHook(() => useTestEngine(previousTest))
 const q = testDefinition.pages[0].questions[0], f=q.fields[0]
 if (f.kind !== 'choice') throw Error('key')
 act(() => seven.result.current.setAnswer(q.id, 0, [f.answer]))
 act(() => seven.result.current.checkPage(testDefinition.pages[0].id))
 expect(seven.result.current.finalResult.correct).toBe(1)
 expect(six.result.current.answers).toEqual({})
 expect(six.result.current.pageResults).toEqual({})
 seven.unmount()
 const fresh = renderHook(() => useTestEngine(testDefinition))
 expect(fresh.result.current.answers).toEqual({})
 expect(fresh.result.current.pageResults).toEqual({})
})
