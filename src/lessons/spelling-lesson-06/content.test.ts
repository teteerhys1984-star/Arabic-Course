import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { getSectionLessons } from '../../sections/sectionRegistry'
import { answerKey, gradePage, type AnswerMap } from '../../shared/test'
import { lessonRegistry } from '../registry'
import {
  creativeHomework,
  examQuestionPlan,
  finalChallenge,
  homeworkLevelOne,
  homeworkLevelTwo,
  seatExamples,
  sourceCorrections,
  sourceFinalDefinition,
  sourceHeadings,
  sourcePracticeQuestions,
  teacherActivityKeys,
  testDefinition,
} from './content'

const sourceSnapshot = readFileSync('docs/source/spelling-lesson-06.md', 'utf8')
const independentQuestions = testDefinition.pages.flatMap((page) => page.questions)

describe('spelling lesson 6 — content, source coverage, and assessment blueprint', () => {
  it('is registered immediately after spelling lesson 5, with no section-order change', () => {
    const spellings = getSectionLessons('spelling')
    expect(spellings.map((lesson) => lesson.id)).toEqual([
      'spelling-lesson-01', 'spelling-lesson-02', 'spelling-lesson-03',
      'spelling-lesson-04', 'spelling-lesson-05', 'spelling-lesson-06', 'spelling-lesson-07', 'spelling-lesson-08', 'spelling-lesson-09', 'spelling-lesson-10', 'spelling-lesson-11',
    ])
    const five = lessonRegistry.findIndex((lesson) => lesson.id === 'spelling-lesson-05')
    expect(lessonRegistry[five + 1]).toMatchObject({
      id: 'spelling-lesson-06', sectionId: 'spelling', number: '٦', available: true,
      title: 'الهمزة المتوسطة — رحلة إلى كرسي الهمزة!',
    })
  })

  it('preserves the full, unedited lesson source with its recorded SHA-256', () => {
    expect(createHash('sha256').update(sourceSnapshot, 'utf8').digest('hex')).toBe(
      '45748bbca21a289d26271357447b8682079ea824c6fef52c46159725a22db393',
    )
    expect(sourceSnapshot).toContain('مَرْأَة')
    expect(sourceSnapshot).toContain('تَأْثير')
    expect(sourceSnapshot).toContain('الدرس التالي')
    expect(sourceHeadings).toHaveLength(13)
  })

  it('has exactly 20 distinct keyed questions in four five-question pages, matching the prewritten blueprint', () => {
    expect(testDefinition.pages).toHaveLength(4)
    expect(testDefinition.pages.map((page) => page.questions.length)).toEqual([5, 5, 5, 5])
    expect(independentQuestions).toHaveLength(20)
    expect(new Set(independentQuestions.map((question) => question.id)).size).toBe(20)
    expect(independentQuestions.map((question) => question.number)).toEqual(Array.from({ length: 20 }, (_, index) => index + 1))
    expect(examQuestionPlan).toHaveLength(20)
    expect(examQuestionPlan.map((item) => item.number)).toEqual(independentQuestions.map((question) => question.number))
    expect([...new Set(examQuestionPlan.map((item) => item.page))]).toEqual(testDefinition.pages.map((page) => page.title))
    expect(new Set(examQuestionPlan.map((item) => item.focus)).size).toBe(20)
    for (const question of independentQuestions) {
      expect(question.fields).toHaveLength(1)
      expect(question.fields[0].kind).toBe('choice')
      if (question.fields[0].kind !== 'choice') throw new Error('All independent items must be keyed choices.')
      expect(question.fields[0].options).toHaveLength(3)
      expect(new Set(question.fields[0].options).size).toBe(3)
      expect(question.fields[0].options).toContain(question.fields[0].answer)
      expect(question.solution).toBeTruthy()
      expect(question.explanation).toBeTruthy()
      expect(question.teacherAnswer).toBeTruthy()
    }
  })

  it('grades each keyed question through the shared grader and does not mix page results', () => {
    for (const page of testDefinition.pages) {
      const answers: AnswerMap = {}
      for (const question of page.questions) {
        const field = question.fields[0]
        if (field.kind !== 'choice') throw new Error('Expected a choice field.')
        answers[answerKey(question.id, 0)] = [field.answer]
      }
      const result = gradePage(page, answers, testDefinition.matching ?? 'strict')
      expect(result).toMatchObject({ total: 5, correct: 5, wrong: 0, unanswered: 0, pageId: page.id })

      const firstQuestion = page.questions[0]
      const field = firstQuestion.fields[0]
      if (field.kind !== 'choice') throw new Error('Expected a choice field.')
      const incorrect = field.options.find((option) => option !== field.answer)
      if (!incorrect) throw new Error('Every question needs a distractor.')
      const changedAnswers = { ...answers, [answerKey(firstQuestion.id, 0)]: [incorrect] }
      const changedResult = gradePage(page, changedAnswers, testDefinition.matching ?? 'strict')
      expect(changedResult).toMatchObject({ total: 5, correct: 4, wrong: 1, unanswered: 0 })
      expect(changedResult.statuses[firstQuestion.id]).toBe('wrong')
    }
  })

  it('retains the original training and all three homework levels with complete teacher keys', () => {
    expect(sourcePracticeQuestions).toHaveLength(7)
    expect(sourcePracticeQuestions.every((question) => question.options.some((option) => option.value === question.answer) && question.options.every((option) => option.explanation))).toBe(true)
    expect(homeworkLevelOne).toHaveLength(8)
    expect(homeworkLevelTwo).toHaveLength(5)
    expect(creativeHomework.markedWords).toHaveLength(5)
    expect(creativeHomework.modelLines).toHaveLength(5)
    expect(creativeHomework.rubric.length).toBeGreaterThanOrEqual(4)
    expect(Object.keys(teacherActivityKeys.sourcePractice)).toHaveLength(7)
    expect(Object.keys(teacherActivityKeys.homeworkLevelOne)).toHaveLength(8)
    expect(Object.keys(teacherActivityKeys.homeworkLevelTwo)).toHaveLength(5)
  })

  it('keeps the seven source-final questions separate from the independent assessment', () => {
    const questions = sourceFinalDefinition.pages.flatMap((page) => page.questions)
    expect(questions).toHaveLength(7)
    expect(new Set(questions.map((question) => question.id)).size).toBe(7)
    expect(new Set([...independentQuestions, ...questions].map((question) => question.id)).size).toBe(27)
    expect(questions.every((question) => question.teacherAnswer && question.solution && question.explanation)).toBe(true)
  })

  it('keeps high-risk examples correctly segmented, classified, and cautiously worded', () => {
    const allExamples = Object.values(seatExamples).flat()
    for (const example of allExamples) {
      expect(example.parts[example.hamzaPart], example.id).toBeTruthy()
      expect(example.parts[example.previousPart], example.id).toBeTruthy()
      expect(example.hamzaPart).toBeGreaterThanOrEqual(0)
      expect(example.hamzaPart).toBeLessThan(example.parts.length)
      expect(example.previousPart).toBeGreaterThanOrEqual(0)
      expect(example.previousPart).toBeLessThan(example.parts.length)
    }
    expect(seatExamples.nabra.find((example) => example.id === 'miah')).toMatchObject({ word: 'مِئَةٌ', chair: 'nabra' })
    expect(seatExamples.nabra.find((example) => example.id === 'miah')?.special).toContain('مِائَة')
    expect(seatExamples.alif.find((example) => example.id === 'taathir')).toMatchObject({ word: 'تَأْثِيرٌ', chair: 'alif', source: true, previousMovement: 'الفتحة' })
    expect(seatExamples.nabra.find((example) => example.id === 'bia')).toMatchObject({ word: 'بِيئَةٌ', chair: 'nabra', previousMovement: 'السكون على ياء ساكنة' })
    expect(seatExamples.nabra.find((example) => example.id === 'nasia')?.word).toBe('نَاشِئَةٌ')
    expect(seatExamples.nabra.find((example) => example.id === 'asila')?.word).toBe('أَسْئِلَةٌ')
    expect(seatExamples.waw.find((example) => example.id === 'ruus')).toMatchObject({ word: 'رُؤُوسٌ', chair: 'waw' })
    expect(finalChallenge.word).toMatchObject({ word: 'مَأْخَذٌ', chair: 'alif', previousMovement: 'الفتحة' })
    expect(sourceCorrections.find((item) => item.id === 'ت-٣')?.reason).toContain('لم يثبت')
    expect(sourceCorrections.find((item) => item.id === 'ت-٣')?.reason).toContain('لا نحكم')
    expect(allExamples.some((example) => example.word.includes('مَرْأَة'))).toBe(false)
  })
})
