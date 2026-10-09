import { describe, expect, it } from 'vitest'
import { getLesson } from '../registry'
import { getSectionLessons } from '../../sections/sectionRegistry'
import { classify, corrections, distinguish, objectives, testDefinition, teacherNotes } from './content'

describe('spelling lesson source inventory and approved keys', () => {
 it('is registered once in section three and preserves the source inventory', () => {
  expect(getLesson('spelling-lesson-01')?.sectionId).toBe('spelling')
  expect(getSectionLessons('spelling').map(x=>x.id)).toEqual(['spelling-lesson-01'])
  expect(objectives).toHaveLength(10)
  expect(classify).toHaveLength(10)
  expect(distinguish).toHaveLength(5)
  expect(corrections).toHaveLength(5)
  expect(teacherNotes).toHaveLength(7)
  expect(testDefinition.pages.map(p=>p.questions.length)).toEqual([8,7,5,5,5])
  expect(testDefinition.pages.flatMap(p=>p.questions).map(q=>q.number)).toEqual(Array.from({length:30},(_,i)=>i+1))
 })
 it('keeps unambiguous objective keys and manual review for open responses', () => {
  const questions=testDefinition.pages.flatMap(p=>p.questions)
  expect(questions.slice(0,8).map(q=>q.fields[0])).toMatchObject(['ب','ج','ج','ب','ج','ب','ب','ب'].map(letter=>({kind:'choice',answer:expect.stringMatching(new RegExp(`^${letter}\\.`))})))
  expect(questions.slice(8,15).map(q=>(q.fields[0] as {answer:string}).answer)).toEqual(['صح','خطأ','صح','خطأ','خطأ','صح','خطأ'])
  expect(questions.slice(15).every(q=>q.fields[0].kind==='essay' && q.teacherAnswer && q.explanation)).toBe(true)
  expect(questions[22].teacherAnswer).toBe('كتبوا الرسالة.')
  expect(questions[24].explanation).toContain('لم يكتبوا')
 })
})
