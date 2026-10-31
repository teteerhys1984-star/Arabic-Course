import { describe, expect, it } from 'vitest'
import { getLesson, lessonRegistry } from '../registry'
import { isFieldCorrect } from '../../shared/test/grading'
import { analyses, commonMistakes, conditions, derivativeComparison, homework, indirectForms, lessonTitle, practices, situations, testDefinition, trainingTest, verbExamples } from './content'

describe('morphology lesson 14 — audited content and structure', () => {
  it('registers once in morphology immediately after lesson 13 without reusing another section slot', () => {
    const morph = lessonRegistry.filter((lesson) => lesson.sectionId === 'morphology')
    expect(morph.map((lesson) => lesson.id)).toEqual(Array.from({ length: 14 }, (_, i) => `morphology-lesson-${String(i + 1).padStart(2, '0')}`))
    expect(morph[12].id).toBe('morphology-lesson-13')
    expect(morph[13]).toMatchObject({ id: 'morphology-lesson-14', number: '١٤', sectionId: 'morphology', title: lessonTitle, available: true })
    expect(lessonRegistry.filter((lesson) => lesson.id === 'morphology-lesson-14')).toHaveLength(1)
    expect(getLesson('morphology-lesson-14')?.sectionId).toBe('morphology')
    expect(lessonRegistry.some((lesson) => lesson.id === 'basics-lesson-14')).toBe(true)
    expect(lessonRegistry.some((lesson) => lesson.id === 'spelling-lesson-14')).toBe(false)
  })

  it('covers 7 conditions, examples, 4 situations, 3 analyses, and all homework activities', () => {
    expect(conditions).toHaveLength(7)
    for (const condition of conditions) expect(condition.explanation.length).toBeGreaterThan(40)
    expect(conditions[0].title).toContain('مجرّد')
    expect(conditions[0].explanation).toContain('لا أن يكون جذرُه ثلاثيًّا فحسب')
    expect(conditions[0].example).toContain('أفادَ (ثلاثي مزيد)')
    expect(conditions[0].example).toContain('تعاونَ (ثلاثي مزيد)')
    expect(conditions[6].example).toContain('أكحل/كحلاء')
    expect(conditions[6].title).toContain('أفعل ومؤنثه فعلاء')
    expect(conditions[6].explanation).toContain('المانع ليس مجرد دلالة الفعل')
    expect(verbExamples.map((item) => item.verb)).toContain('سَرُعَ')
    expect(indirectForms.map((item) => item.verb)).toEqual(['احمرَّ', 'ازدهرَ', 'استخرجَ', 'تعاونَ', 'أفادَ'])
    expect(indirectForms.find((item) => item.verb === 'تعاونَ')?.note).toContain('ثلاثي مزيد')
    expect(indirectForms.find((item) => item.verb === 'أفادَ')?.note).toContain('ثلاثي مزيد بالهمزة')
    expect(situations).toHaveLength(4)
    expect(situations[1].examples.join(' ')).toContain('الأفضلان')
    expect(situations[1].examples.join(' ')).toContain('الفضليات')
    expect(derivativeComparison.map((item) => item.type)).toEqual(['اسم الفاعل', 'اسم المفعول', 'صيغة المبالغة', 'اسم التفضيل'])
    expect(analyses).toHaveLength(3)
    expect(analyses[1].grammar).toContain('تمييز منصوب')
    expect(analyses[1].morphology).toContain('ليست فائدة جزءًا')
    expect(homework).toHaveLength(5)
    expect(testDefinition.pages.map((page) => page.questions.length)).toEqual([5, 4, 4, 3, 4])
    expect(testDefinition.pages.map((page) => page.questions.reduce((sum, q) => sum + (q.points ?? 1), 0))).toEqual([5, 4, 4, 3, 4])
    expect(testDefinition.pages.flatMap((page) => page.questions)).toHaveLength(20)
    expect(testDefinition.pages.flatMap((page) => page.questions).reduce((sum, q) => sum + (q.points ?? 1), 0)).toBe(20)
    expect(testDefinition.pages[4].questions[2].prompt).toContain('ما وزن «أسرع»')
    expect(testDefinition.pages[4].questions[3].fields[0].kind).toBe('essay')
    expect(testDefinition.pages.flatMap((page) => page.questions).filter((q) => q.fields.some((field) => field.kind === 'essay')).reduce((sum, q) => sum + (q.points ?? 1), 0)).toBe(4)
  })

  it('contains 4 distinct five-question practices and identifies valid source examples', () => {
    expect(practices).toHaveLength(4)
    expect(practices.map((exercise) => exercise.questions.length)).toEqual([5, 5, 5, 5])
    expect(trainingTest.pages).toHaveLength(4)
    expect(trainingTest.pages.every((page) => page.questions.length === 5)).toBe(true)
    expect(practices[3].questions[3].accepted).toContain('صحيحة')
    expect(practices[3].questions[4].accepted).toContain('صحيحة')
  })

  it('does not accept أل-conjoined «الأفضل» as bare for feminine plural and tests the exact pattern condition', () => {
    const preferenceCase = practices[3].questions[2]
    expect(preferenceCase.accepted).toContain('الطالبات هن أفضل في المسابقة')
    expect(preferenceCase.accepted).toContain('الطالبات هن الفضليات في المسابقة')
    expect(preferenceCase.accepted).not.toContain('الطالبات هن الأفضل في المسابقة')
    const preferenceField = trainingTest.pages[3].questions[2].fields[0]
    expect(preferenceField.kind).toBe('text')
    if (preferenceField.kind !== 'text') throw new Error('expected a text-answer practice field')
    expect(isFieldCorrect(preferenceField, ['الطالبات هن الأفضل في المسابقة'], 'loose')).toBe(false)
    expect(isFieldCorrect(preferenceField, ['الطالبات هن أفضل في المسابقة'], 'loose')).toBe(true)
    expect(isFieldCorrect(preferenceField, ['الطالبات هن الفضليات في المسابقة'], 'loose')).toBe(true)
    expect(trainingTest.pages[3].questions[2].teacherAnswer).toContain('الفضليات')
    expect(trainingTest.pages[3].questions[2].teacherAnswer).not.toContain('هنّ الأفضل في المسابقة')
    expect(preferenceCase.explanation).toContain('«الأفضل» فيه أل')

    const mistake = commonMistakes.find((item) => item.error.includes('الطالبات هنّ الأفضل'))
    expect(mistake?.fix).toContain('دون أل: الطالبات هنّ أفضل')
    expect(mistake?.fix).toContain('مع أل والمطابقة: الطالبات هنّ الفضليات')
    expect(mistake?.why).toContain('لا يصنّف مجردًا')

    const colorPractice = practices[2].questions[4]
    expect(colorPractice.accepted).toContain('أشدّ احمرارًا')
    expect(colorPractice.accepted).not.toContain('أحمر')
    expect(colorPractice.explanation).toContain('أفعل ومؤنثه فعلاء')
  })
})
