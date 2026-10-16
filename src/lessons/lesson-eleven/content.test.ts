import { describe, expect, it } from 'vitest'
import { lessonRegistry } from '../registry'
import { getSectionLessons } from '../../sections/sectionRegistry'
import { buildSolutionEntries, combinePageResults, gradePage } from '../../shared/test'
import {
  objectives, inflectionExamples, originalMarks, nominalExamples, agentExamples, indicativeExamples,
  objectExamples, subjunctiveExamples, kanaExample, prepositions, prepositionExamples, additionExamples,
  soundEndingPairs, jussiveTransformations, jussiveExamples, caseComparisons, parsingSteps,
  workedSentence, workedParsing, homeworkMarks, homeworkBlanks, homeworkSentence, homeworkParsing,
  practiceQuestions, finalQuizQuestions, practiceTest, finalQuizTest, independentQuestions, testDefinition,
} from './content'

const sourcePracticeOptions = [
  ['الضمة', 'الفتحة', 'الكسرة', 'السكون'],
  ['الضمة', 'الفتحة', 'الكسرة', 'السكون'],
  ['الضمة', 'الفتحة', 'الكسرة', 'السكون'],
  ['الضمة', 'الفتحة', 'الكسرة', 'السكون'],
  ['نجحَ', 'المجتهدُ'],
  ['يكتبُ', 'لن يكتبَ', 'لم يكتبْ'],
  ['الضمة', 'الفتحة', 'الكسرة', 'السكون'],
  ['يلعبُ الطفلُ', 'لن يلعبَ الطفلُ', 'لم يلعبْ الطفلُ'],
]
const sourceQuizOptions = [
  ['الفتحة', 'الضمة', 'الكسرة', 'السكون'],
  ['الضمة', 'الكسرة', 'الفتحة', 'السكون'],
  ['الكسرة', 'السكون', 'الضمة', 'الفتحة'],
  ['الفتحة', 'الضمة', 'السكون', 'الكسرة'],
  ['مبتدأ مرفوع', 'مفعول به منصوب', 'اسم مجرور'],
  ['فاعل مرفوع', 'مفعول به منصوب', 'اسم مجرور'],
  ['الضمة', 'الفتحة', 'الكسرة'],
  ['الفتحة', 'السكون', 'الضمة'],
  ['يقرأُ', 'لم يقرأْ', 'لن يقرأَ'],
  ['فعل ماضٍ منصوب', 'فعل ماضٍ مبني على الفتح', 'فعل مضارع مجزوم'],
]

function canonical(text: string) {
  return text.normalize('NFC').replace(/[\u064b-\u065f\u0670\s؟«».,:]/g, '')
}

describe('lesson 11 — registration and audited source coverage', () => {
  it('registers after exactly the original ten basics lessons, without touching the other sections', () => {
    const basics = getSectionLessons('basics-grammar')
    expect(basics.map((entry) => entry.id)).toEqual(Array.from({ length: 12 }, (_, index) => `lesson-${index + 1}`))
    expect(basics.slice(0, 10).map((entry) => entry.number)).toEqual(['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠'])
    expect(basics[9]).toMatchObject({ id: 'lesson-10', title: 'إنَّ وأخواتها', available: true })
    expect(basics[10]).toMatchObject({ sectionId: 'basics-grammar', number: '١١', eyebrow: 'علامات الإعراب الأصلية', available: true })
    expect(getSectionLessons('spelling')).toHaveLength(11)
    expect(getSectionLessons('morphology')).toHaveLength(12)
    expect(getSectionLessons('rhetoric')).toHaveLength(0)
    expect(getSectionLessons('reading-expression')).toHaveLength(0)
    expect(lessonRegistry).toHaveLength(35)
    expect(new Set(lessonRegistry.map((entry) => entry.id)).size).toBe(35)
    expect(lessonRegistry.some((entry) => ['lesson-13', 'morphology-lesson-13', 'spelling-lesson-12'].includes(entry.id) || /unit/i.test(entry.id))).toBe(false)
  })

  it('retains the five objectives, four original signs and each worked example group', () => {
    expect(objectives).toHaveLength(5)
    expect(originalMarks.map((mark) => `${mark.state}:${mark.sign}:${mark.glyph}`)).toEqual([
      'الرفع:الضمة:بُ', 'النصب:الفتحة:بَ', 'الجر:الكسرة:بِ', 'الجزم:السكون:بْ',
    ])
    expect(inflectionExamples.map((item) => item.sentence)).toEqual(['حضرَ الطالبُ.', 'رأيتُ الطالبَ.', 'سلّمتُ على الطالبِ.'])
    expect(nominalExamples).toHaveLength(3)
    expect(nominalExamples[1].parsing).toHaveLength(2)
    expect(agentExamples).toHaveLength(3)
    expect(agentExamples[2].reason).toContain('التقاء الساكنين')
    expect(indicativeExamples).toHaveLength(3)
    expect(objectExamples).toHaveLength(3)
    expect(subjunctiveExamples.map((item) => item.sentence)).toEqual([
      'لن أهملَ واجبي.', 'أحبُّ أنْ أقرأَ.', 'أدرسُ كي أنجحَ.',
    ])
    expect(subjunctiveExamples[1].reason).toContain('حرف مصدري ونصب')
    expect(kanaExample.analysis).toContain('خبر كان منصوب')
    expect(prepositions).toEqual(['من', 'إلى', 'عن', 'على', 'في', 'الباء', 'اللام', 'الكاف'])
    expect(prepositionExamples).toHaveLength(5)
    expect(additionExamples).toHaveLength(3)
    expect(soundEndingPairs).toHaveLength(4)
    expect(jussiveTransformations.map((row) => row.after)).toEqual(['لم يكتبْ', 'لم يلعبْ', 'لا تهملْ', 'لا تعبثْ'])
    expect(jussiveExamples).toHaveLength(4)
    expect(jussiveExamples[2].reason).toContain('ناهية')
    expect(caseComparisons).toHaveLength(4)
    expect(parsingSteps).toHaveLength(5)
  })

  it('parses all five words in the worked example and all three parts of the homework', () => {
    expect(workedSentence).toBe('قرأَ الطالبُ القصةَ في المكتبةِ.')
    expect(workedParsing.map((row) => row.word)).toEqual(['قرأَ', 'الطالبُ', 'القصةَ', 'في', 'المكتبةِ'])
    expect(workedParsing[0].analysis).toContain('مبني على الفتح')
    expect(workedParsing[1].analysis).toContain('الضمة الظاهرة')
    expect(workedParsing[2].analysis).toContain('الفتحة الظاهرة')
    expect(workedParsing[4].analysis).toContain('الكسرة الظاهرة')
    expect(homeworkMarks.map((item) => item.target)).toEqual(['الطالبُ', 'القصةَ', 'الحديقةِ', 'يهملْ', 'يشرحُ'])
    for (const item of homeworkMarks) {
      expect(item.sentence).toContain(item.target)
      expect(item.answer).toMatch(/وعلامة/)
      expect(item.answer).toMatch(/الظاهرة|الظاهر/)
    }
    expect(homeworkBlanks.map((item) => item.answer)).toEqual(['الضمة', 'الفتحة', 'الكسرة', 'السكون'])
    expect(homeworkSentence).toBe('كتبَ الطالبُ الدرسَ في الدفترِ.')
    expect(homeworkParsing.map((row) => row.word)).toEqual(['كتبَ', 'الطالبُ', 'الدرسَ', 'في', 'الدفترِ'])
    expect(homeworkParsing[0].analysis).toContain('ماضٍ مبني على الفتح')
    expect(homeworkParsing[1].analysis).toContain('الضمة الظاهرة')
    expect(homeworkParsing[2].analysis).toContain('الفتحة الظاهرة')
    expect(homeworkParsing[3].analysis).toContain('حرف جر')
    expect(homeworkParsing[4].analysis).toContain('الكسرة الظاهرة')
  })

  it('keeps all eight source practice items, their options, single answers and meaningful reasons', () => {
    expect(practiceQuestions).toHaveLength(8)
    expect(practiceQuestions.map((item) => item.options)).toEqual(sourcePracticeOptions)
    expect(practiceQuestions.map((item) => item.answer)).toEqual([
      'الضمة', 'الفتحة', 'الكسرة', 'السكون', 'المجتهدُ', 'لن يكتبَ', 'الكسرة', 'لم يلعبْ الطفلُ',
    ])
    expect(practiceTest.pages[0].questions).toHaveLength(8)
    for (const item of practiceQuestions) {
      expect(item.options.filter((option) => option === item.answer)).toHaveLength(1)
      expect(item.explanation.length).toBeGreaterThan(65)
      expect(item.objective.length).toBeGreaterThan(8)
    }
    expect(new Set(practiceQuestions.map((item) => item.objective)).size).toBe(8)
  })

  it('keeps all ten source final quiz items independently, with their original options and a single correct answer', () => {
    expect(finalQuizQuestions).toHaveLength(10)
    expect(finalQuizQuestions.map((item) => item.options)).toEqual(sourceQuizOptions)
    expect(finalQuizQuestions.map((item) => item.answer)).toEqual([
      'الضمة', 'الفتحة', 'الكسرة', 'السكون', 'مبتدأ مرفوع', 'مفعول به منصوب', 'الكسرة',
      'السكون', 'لن يقرأَ', 'فعل ماضٍ مبني على الفتح',
    ])
    expect(finalQuizTest.pages[0].questions).toHaveLength(10)
    expect(practiceTest.id).not.toBe(finalQuizTest.id)
    for (const item of finalQuizQuestions) {
      expect(item.options.filter((option) => option === item.answer)).toHaveLength(1)
      expect(item.explanation.length).toBeGreaterThan(65)
    }
  })

  it('provides exactly 20 NEW questions in four five-question pages, with explanations and separate solution entries', () => {
    expect(testDefinition.pages.map((page) => page.questions.length)).toEqual([5, 5, 5, 5])
    expect(independentQuestions).toHaveLength(20)
    expect(testDefinition.pages.flatMap((page) => page.questions)).toEqual(independentQuestions)
    expect(independentQuestions.map((q) => q.number)).toEqual(Array.from({ length: 20 }, (_, index) => index + 1))
    expect(new Set(independentQuestions.map((q) => q.id)).size).toBe(20)
    const sourcePrompts = new Set([...practiceQuestions, ...finalQuizQuestions].map((item) => canonical(item.prompt)))
    expect(new Set(independentQuestions.map((item) => canonical(item.prompt))).size).toBe(20)
    for (const item of independentQuestions) {
      expect(sourcePrompts.has(canonical(item.prompt))).toBe(false)
      expect(item.fields).toHaveLength(1)
      const field = item.fields[0]
      expect(field.kind).toBe('choice')
      if (field.kind !== 'choice') continue
      expect(field.options.filter((option) => option === field.answer)).toHaveLength(1)
      expect(item.explanation!.length).toBeGreaterThan(70)
      expect(item.rule!.length).toBeGreaterThan(12)
      expect(item.solution).toBe(field.answer)
      expect(item.answerSource).toBe('platform')
    }
    expect(testDefinition.pages[0].title).toContain('الحالة والعلامة')
    expect(testDefinition.pages[1].title).toContain('موقع الكلمة')
    expect(testDefinition.pages[2].title).toContain('عامل الفعل')
    expect(testDefinition.pages[3].title).toContain('البناء والتحليل')
    expect(buildSolutionEntries(testDefinition, {}, {}).every((page) => page.entries.every((entry) => !entry.revealed))).toBe(true)
  })

  it('combines latest valid page checks without double-counting and never reveals an unchecked page', () => {
    const allCorrect = Object.fromEntries(independentQuestions.map((item) => {
      const field = item.fields[0]
      if (field.kind !== 'choice') throw Error('Expected a choice')
      return [`${item.id}:0`, [field.answer]]
    }))
    const first = gradePage(testDefinition.pages[0], allCorrect, testDefinition.matching)
    const partial = combinePageResults(testDefinition, { [first.pageId]: first })
    expect(partial.pagesChecked).toBe(1)
    expect(partial.complete).toBe(false)
    const gated = buildSolutionEntries(testDefinition, allCorrect, { [first.pageId]: first })
    expect(gated[0].entries.every((entry) => entry.revealed)).toBe(true)
    expect(gated.slice(1).every((page) => page.entries.every((entry) => !entry.revealed))).toBe(true)

    const results = Object.fromEntries(testDefinition.pages.map((page) => [page.id, gradePage(page, allCorrect)]))
    expect(combinePageResults(testDefinition, results)).toMatchObject({ total: 20, correct: 20, complete: true })
    const firstField = independentQuestions[0].fields[0]
    if (firstField.kind !== 'choice') throw Error('Expected a choice')
    const wrong = { ...allCorrect, [`${independentQuestions[0].id}:0`]: [firstField.options.find((option) => option !== firstField.answer)!] }
    const latestFirst = gradePage(testDefinition.pages[0], wrong)
    expect(combinePageResults(testDefinition, { ...results, [latestFirst.pageId]: latestFirst })).toMatchObject({ total: 20, correct: 19, wrong: 1, complete: true })
  })
})
