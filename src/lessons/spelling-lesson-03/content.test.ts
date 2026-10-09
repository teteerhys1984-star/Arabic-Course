import { describe, expect, it } from 'vitest'
import {
  objectives,
  definitionSection,
  strengthOrder,
  alefSection,
  wawSection,
  wawDammaAfterDammaPlatform,
  nabraSection,
  lineSection,
  specialCases,
  methodSteps,
  commonErrorsList,
  workedExamples,
  activityOneItems,
  activityTwoItems,
  activityThreeItems,
  activityFourItems,
  activityFiveItems,
  activitySixItems,
  testDefinition,
  teacherNotes,
  gradingRubrics,
  summaryPoints,
  nextLessonInfo,
} from './content'

describe('Spelling Lesson 03 — Data and Test Definition Inventory', () => {
  it('supplies all seven approved objectives', () => {
    expect(objectives).toHaveLength(7)
    expect(objectives[0]).toContain('تعريف الهمزة المتوسطة')
  })

  it('provides the definition section with seven examples and the four chairs', () => {
    expect(definitionSection.definition).toContain('وسط الكلمة')
    expect(definitionSection.examples).toHaveLength(7)
    expect(definitionSection.chairsTable).toHaveLength(2)
    expect(definitionSection.nabraNote).toContain('نبرة')
  })

  it('provides the four-level strength order with the chair map and sukoon note', () => {
    expect(strengthOrder.order).toEqual(['الكسرة', 'الضمة', 'الفتحة', 'السكون'])
    expect(strengthOrder.chairMap).toHaveLength(3)
    expect(strengthOrder.applications).toHaveLength(3)
  })

  it('covers the alef seat with its three groups and three analyzed examples', () => {
    expect(alefSection.generalExamples).toHaveLength(7)
    expect(alefSection.openAfterOpen.examples).toHaveLength(4)
    expect(alefSection.sakinAfterOpen.examples).toHaveLength(4)
    expect(alefSection.openAfterSakin.examples).toHaveLength(3)
    expect(alefSection.analyzed).toHaveLength(3)
  })

  it('covers the waw seat including the approved damma-after-damma clause (م-1)', () => {
    expect(wawSection.generalExamples).toHaveLength(7)
    expect(wawSection.dammaBeforeOpenOrSakin.examples).toHaveLength(3)
    expect(wawSection.sakinBeforeDamma.examples).toHaveLength(3)
    expect(wawSection.analyzed).toHaveLength(3)
    expect(wawDammaAfterDammaPlatform.items.map((item) => item.word)).toEqual([
      'رُؤُوس',
      'شُؤُون',
    ])
  })

  it('covers the nabra seat with the approved رئيس example (م-4)', () => {
    expect(nabraSection.generalExamples).toHaveLength(8)
    expect(nabraSection.maksoora.examples).toContain('رَئِيس')
    expect(nabraSection.prevKasra.examples).toHaveLength(4)
    expect(nabraSection.dammaAfterKasra.examples.map(([word]) => word)).toEqual([
      'قارِئُون',
      'مُبتدِئُون',
    ])
    expect(nabraSection.analyzed).toHaveLength(3)
  })

  it('covers the line seat, special cases, method steps, errors, and worked examples', () => {
    expect(lineSection.afterAlef.examples).toHaveLength(3)
    expect(lineSection.afterWaw.examples).toHaveLength(2)
    expect(lineSection.compareTable).toHaveLength(5)
    expect(specialCases.afterYaa.examples).toHaveLength(3)
    expect(specialCases.formChange.examples).toHaveLength(4)
    expect(methodSteps).toHaveLength(7)
    expect(commonErrorsList).toHaveLength(6)
    expect(workedExamples).toHaveLength(5)
  })

  it('supplies all six interactive activities with correct item counts', () => {
    expect(activityOneItems).toHaveLength(15)
    expect(activityTwoItems).toHaveLength(8)
    expect(activityThreeItems).toHaveLength(5)
    expect(activityFourItems).toHaveLength(8)
    expect(activityFiveItems).toHaveLength(6)
    expect(activitySixItems).toHaveLength(8)
  })

  it('declares the 26 official final test questions across 4 pages matching the 30-mark specification', () => {
    expect(testDefinition.id).toBe('spelling-lesson-03-test')
    expect(testDefinition.pages).toHaveLength(4)
    const totalQuestions = testDefinition.pages.reduce((acc, p) => acc + p.questions.length, 0)
    expect(totalQuestions).toBe(26)

    // Page 1: 4 items (basics, 6 marks)
    expect(testDefinition.pages[0].questions).toHaveLength(4)
    // Page 2: 8 items (seat choice, 8 marks)
    expect(testDefinition.pages[1].questions).toHaveLength(8)
    // Page 3: 4 items (explanation essays, 8 marks)
    expect(testDefinition.pages[2].questions).toHaveLength(4)
    // Page 4: 10 items (8 repairs + 2 explanation essays, 8 marks)
    expect(testDefinition.pages[3].questions).toHaveLength(10)

    // Verify all question ids and numbers are unique
    const ids = new Set<string>()
    const numbers = new Set<number>()
    testDefinition.pages.forEach((p) => {
      p.questions.forEach((q) => {
        expect(ids.has(q.id)).toBe(false)
        ids.add(q.id)
        expect(numbers.has(q.number)).toBe(false)
        numbers.add(q.number)
        expect(q.prompt).toBeTruthy()
        expect(q.solution).toBeTruthy()
        expect(q.teacherAnswer).toBeTruthy()
        expect(q.explanation).toBeTruthy()
      })
    })
  })

  it('applies the approved audit corrections in data (no removed forms, corrected keys)', () => {
    const serialized = JSON.stringify(testDefinition)
    // خ-5/خ-6: the majhool item is a real seat correction with the conditional instruction.
    expect(serialized).toContain('سُؤِلَ')
    expect(serialized).toContain('الكلمة صحيحة')
    expect(testDefinition.pages[3].description).toContain('وإن كانت الكلمة صحيحة فاكتب')
    // Page-3 key covers the special cases explicitly.
    expect(testDefinition.pages[2].questions[0].teacherAnswer).toContain('قراءة')
    expect(testDefinition.pages[2].questions[0].teacherAnswer).toContain('مروءة')
  })

  it('includes teacher notes, grading rubrics, summary, and next lesson metadata', () => {
    expect(teacherNotes.length).toBeGreaterThanOrEqual(6)
    expect(gradingRubrics).toHaveLength(4)
    expect(summaryPoints).toHaveLength(5)
    expect(nextLessonInfo.title).toContain('الدرس الرابع')
    expect(nextLessonInfo.title).toContain('المتطرفة')
  })
})
