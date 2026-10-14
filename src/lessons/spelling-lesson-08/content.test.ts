import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { answerKey, gradePage } from '../../shared/test'
import { lessonRegistry } from '../registry'
import {
  commonErrors,
  educationalQuizQuestions,
  examQuestions,
  goldenComparison,
  haSection,
  homeworkData,
  interactivePracticeQuestions,
  lessonObjectives,
  lessonSummary,
  nextLessonPreview,
  openingCards,
  practicalMethod,
  sourceCorrections,
  taMaftuhaSection,
  taMarbutaSection,
  teacherGuide,
  testDefinition,
} from './content'

describe('spelling lesson 08 — content, source audit, and registration', () => {
  it('preserves the raw source file verbatim with its recorded SHA-256 in the audit report', () => {
    const source = readFileSync('docs/source/spelling-lesson-08.md', 'utf8')
    const audit = readFileSync('docs/spelling-lesson-08-audit.md', 'utf8')
    const hash = createHash('sha256').update(source, 'utf8').digest('hex')

    expect(hash).toBe('334b391edb05c4cd378226bebada454079d69472f893e9d3315376e6b1d430ec')
    expect(audit).toContain(hash)
    expect(source).toContain('التاء المربوطة والتاء المفتوحة والهاء في آخر الكلمة')
    expect(source).toContain('كيف أميّز بين (ة) و(ت) و(ه)؟')
    expect(source).toContain('الألف الفارقة بعد واو الجماعة')
    expect(sourceCorrections).toHaveLength(7)
    for (const corr of sourceCorrections) {
      expect(audit).toContain(corr.id)
    }
  })

  it('registers spelling-lesson-08 after spelling-lesson-07, keeps lessons 1–7 intact, and adds no lesson 9 or unit test', () => {
    const spellingLessons = lessonRegistry.filter((lesson) => lesson.sectionId === 'spelling')
    expect(spellingLessons.map((lesson) => lesson.id)).toEqual([
      'spelling-lesson-01',
      'spelling-lesson-02',
      'spelling-lesson-03',
      'spelling-lesson-04',
      'spelling-lesson-05',
      'spelling-lesson-06',
      'spelling-lesson-07',
      'spelling-lesson-08',
    ])
    expect(spellingLessons[7]).toMatchObject({
      id: 'spelling-lesson-08',
      sectionId: 'spelling',
      number: '٨',
      available: true,
      title: 'التاء المربوطة والتاء المفتوحة والهاء في آخر الكلمة — كيف أميّز بين (ة) و(ت) و(ه)؟',
    })
    expect(lessonRegistry.some((lesson) => lesson.id === 'spelling-lesson-09')).toBe(false)
    expect(lessonRegistry.some((lesson) => lesson.id.includes('unit'))).toBe(false)
  })

  it('retains all required teaching sections, examples, comparisons, practice, educational quiz, homework, summary, and next lesson preview', () => {
    expect(lessonObjectives).toHaveLength(5)
    expect(openingCards.map((c) => c.letter)).toEqual(['ة', 'ت', 'ه'])
    expect(taMarbutaSection.examples.map((e) => e.word)).toEqual([
      'مدرسة',
      'شجرة',
      'معلمة',
      'جميلة',
      'رحلة',
      'فاكهة',
    ])
    expect(taMaftuhaSection.examples.map((e) => e.word)).toEqual([
      'بيت',
      'بنت',
      'أخت',
      'صوت',
      'كتبتْ',
      'نبات',
    ])
    expect(taMaftuhaSection.positions).toHaveLength(3)
    expect(haSection.examples.map((e) => e.word)).toEqual([
      'وجه',
      'مياه',
      'فقيه',
      'كتابه',
      'قلمه',
      'بيته',
    ])
    expect(goldenComparison.map((c) => c.letter)).toEqual(['ة', 'ت', 'ه'])
    expect(practicalMethod.steps).toHaveLength(4)
    expect(practicalMethod.comparisons).toHaveLength(4)
    expect(commonErrors).toHaveLength(4)
    expect(interactivePracticeQuestions).toHaveLength(8)
    expect(educationalQuizQuestions).toHaveLength(10)
    expect(homeworkData.sectionOne.items).toHaveLength(10)
    expect(homeworkData.sectionTwo.items).toHaveLength(4)
    expect(lessonSummary.cards).toHaveLength(3)
    expect(nextLessonPreview.topicTitle).toBe('الألف الفارقة بعد واو الجماعة')
    expect(nextLessonPreview.examples).toEqual(['كتبوا', 'لم يهملوا', 'اكتبوا'])
    expect(teacherGuide.expectedMistakesAndRemediation.length).toBeGreaterThanOrEqual(5)
  })

  it('defines an independent test of exactly 20 unique questions across 4 pages, distinct from in-lesson questions', () => {
    const questions = testDefinition.pages.flatMap((page) => page.questions)
    expect(testDefinition.id).toBe('spelling-lesson-08-independent')
    expect(testDefinition.pages).toHaveLength(4)
    expect(testDefinition.pages.map((p) => p.questions.length)).toEqual([5, 5, 5, 5])
    expect(questions).toHaveLength(20)
    expect(examQuestions).toHaveLength(20)
    expect(new Set(questions.map((q) => q.id)).size).toBe(20)
    expect(new Set(questions.map((q) => q.prompt)).size).toBe(20)
    expect(questions.map((q) => q.number)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))

    // Ensure none of the 20 independent prompts copy the 8 practice or 10 educational quiz prompts
    const inLessonPrompts = new Set([
      ...interactivePracticeQuestions.map((q) => q.sourcePrompt),
      ...interactivePracticeQuestions.map((q) => q.clarifiedSentence),
      ...educationalQuizQuestions.map((q) => q.prompt),
      ...homeworkData.sectionTwo.items.map((item) => item.wrongSentence),
    ])
    for (const q of questions) {
      expect(inLessonPrompts.has(q.prompt)).toBe(false)
    }

    for (const page of testDefinition.pages) {
      const pageAnswers: Record<string, string[]> = {}
      for (const q of page.questions) {
        const field = q.fields[0]
        if (field.kind !== 'choice') throw new Error('Expected choice field')
        expect(field.options).toHaveLength(3)
        expect(new Set(field.options).size).toBe(3)
        expect(field.options).toContain(field.answer)
        expect(q.solution).toBe(field.answer)
        expect(q.rule && q.rule.length).toBeGreaterThan(30)
        expect(q.explanation && q.explanation.length).toBeGreaterThan(60)
        pageAnswers[answerKey(q.id, 0)] = [field.answer]
      }
      expect(gradePage(page, pageAnswers).correct).toBe(5)
    }
  })
})
