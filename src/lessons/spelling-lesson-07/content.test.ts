import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { testDefinition, practice, challenges, finalQuestions } from './content'
import { gradePage, answerKey } from '../../shared/test'
import { lessonRegistry } from '../registry'

describe('spelling 07 content and registration', () => {
  it('has exactly 20 distinct questions with valid keys and scientific explanations', () => {
    const questions = testDefinition.pages.flatMap(page => page.questions)
    expect(questions).toHaveLength(20)
    expect(new Set(questions.map(q => q.id)).size).toBe(20)
    expect(new Set(questions.map(q => q.prompt)).size).toBe(20)
    expect(testDefinition.pages).toHaveLength(4)
    for (const page of testDefinition.pages) {
      const answers: Record<string, string[]> = {}
      for (const q of page.questions) {
        const field = q.fields[0]
        if (field.kind !== 'choice') throw Error('Expected keyed choice')
        expect(field.options.filter(option => option === field.answer)).toHaveLength(1)
        expect(new Set(field.options).size).toBe(field.options.length)
        expect(q.solution).toBe(field.answer)
        expect(q.explanation!.length).toBeGreaterThan(60)
        answers[answerKey(q.id, 0)] = [field.answer]
      }
      expect(gradePage(page, answers).correct).toBe(5)
    }
  })
  it('preserves source, source exercise counts, and complete corrected word', () => {
    expect(practice).toHaveLength(7)
    expect(challenges).toHaveLength(3)
    expect(finalQuestions).toHaveLength(7)
    expect(practice[6].answer).toBe('مُؤَثِّرة')
    const source = readFileSync('docs/source/spelling-lesson-07.md', 'utf8')
    expect(source).toContain('مَرُوءَة')
    expect(source).toContain('مؤ\n\nئو\n\nؤ')
    const hash = createHash('sha256').update(source).digest('hex')
    expect(readFileSync('docs/spelling-lesson-07-audit.md', 'utf8')).toContain(hash)
  })
  it('keeps lessons 1–6 in order, adds 7 before 8, 9 and 10 and no unit assessment', () => {
    expect(lessonRegistry.filter(l => l.sectionId === 'spelling').map(l => l.id)).toEqual([...Array.from({length: 9}, (_, i) => `spelling-lesson-0${i + 1}`), 'spelling-lesson-10', 'spelling-lesson-11', 'spelling-lesson-12', 'spelling-lesson-13'])
    expect(testDefinition.id).toBe('spelling-lesson-07-independent')
    expect(readFileSync('src/lessons/LessonSpellingSeven.tsx', 'utf8')).not.toContain('unit-test')
  })
})
