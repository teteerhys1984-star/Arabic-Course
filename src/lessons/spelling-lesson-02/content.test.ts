import { describe, expect, it } from 'vitest'
import {
  objectives,
  concepts,
  qatRules,
  waslRules,
  waslPositions,
  qatPositions,
  comparisonTableRows,
  workedExamples,
  activityOneItems,
  activityTwoItems,
  activityThreeItems,
  activityFourItems,
  activityFiveItems,
  activitySixWords,
  testDefinition,
  teacherNotes,
  gradingRubrics,
  enrichmentContent,
  nextLessonInfo,
} from './content'

describe('Spelling Lesson 02 — Data and Test Definition Inventory', () => {
  it('supplies all six approved objectives', () => {
    expect(objectives).toHaveLength(6)
    expect(objectives[0]).toContain('التمييز بين همزة الوصل وهمزة القطع')
  })

  it('provides foundational concept definitions for hamza, alef, and drawing', () => {
    expect(concepts.hamza).toBeDefined()
    expect(concepts.alef).toBeDefined()
    expect(concepts.drawing).toBeDefined()
  })

  it('provides qat rules and wasl rules with phonetic examples', () => {
    expect(qatRules.forms).toHaveLength(3)
    expect(waslRules.spellingCaution).toHaveLength(5)
    expect(waslRules.phoneticComparison).toHaveLength(5)
  })

  it('covers all positions of hamzat wasl (letters, nouns, triliteral, khumasi, sudasi)', () => {
    expect(waslPositions.letters.solar).toHaveLength(3)
    expect(waslPositions.letters.lunar).toHaveLength(4)
    expect(waslPositions.nouns.famousSeven).toHaveLength(7)
    expect(waslPositions.verbs.triliteralOrder.examples).toHaveLength(7)
    expect(waslPositions.verbs.khumasi.table).toHaveLength(4)
    expect(waslPositions.verbs.khumasi.platformNote).toContain('تعلَّم')
    expect(waslPositions.verbs.sudasi.table).toHaveLength(5)
  })

  it('covers all positions of hamzat qat (nouns, rubai, mudari, letters)', () => {
    expect(qatPositions.nouns.examples).toHaveLength(8)
    expect(qatPositions.rubai.table).toHaveLength(5)
    expect(qatPositions.mudari.examples).toHaveLength(6)
    expect(qatPositions.letters.examples).toHaveLength(10)
  })

  it('supplies the comprehensive 9-row comparison table', () => {
    expect(comparisonTableRows).toHaveLength(9)
  })

  it('supplies five worked examples with full analysis', () => {
    expect(workedExamples).toHaveLength(5)
  })

  it('supplies all six interactive activities with correct item counts', () => {
    expect(activityOneItems).toHaveLength(20)
    expect(activityTwoItems).toHaveLength(10)
    expect(activityThreeItems).toHaveLength(8)
    expect(activityFourItems).toHaveLength(8)
    expect(activityFiveItems).toHaveLength(8)
    expect(activitySixWords).toHaveLength(8)
  })

  it('declares the 25 official final test questions across 4 pages matching the 30-mark specification', () => {
    expect(testDefinition.id).toBe('spelling-lesson-02-test')
    expect(testDefinition.pages).toHaveLength(4)
    const totalQuestions = testDefinition.pages.reduce((acc, p) => acc + p.questions.length, 0)
    expect(totalQuestions).toBe(25)

    // Page 1: 10 items (classify)
    expect(testDefinition.pages[0].questions).toHaveLength(10)
    // Page 2: 5 items (repair)
    expect(testDefinition.pages[1].questions).toHaveLength(5)
    // Page 3: 5 items (choice)
    expect(testDefinition.pages[2].questions).toHaveLength(5)
    // Page 4: 5 items (analysis/essay)
    expect(testDefinition.pages[3].questions).toHaveLength(5)

    // Verify all question ids are unique
    const ids = new Set<string>()
    testDefinition.pages.forEach((p) => {
      p.questions.forEach((q) => {
        expect(ids.has(q.id)).toBe(false)
        ids.add(q.id)
        expect(q.prompt).toBeTruthy()
        expect(q.solution).toBeTruthy()
        expect(q.teacherAnswer).toBeTruthy()
        expect(q.explanation).toBeTruthy()
      })
    })
  })

  it('includes teacher notes, grading rubrics, enrichment, and next lesson metadata', () => {
    expect(teacherNotes.length).toBeGreaterThanOrEqual(6)
    expect(gradingRubrics).toHaveLength(4)
    expect(enrichmentContent.contrasts).toHaveLength(7)
    expect(nextLessonInfo.title).toContain('الدرس الثالث')
  })
})
