/**
 * اختبارات منطق تصحيح اختبار الدرس الثاني (٣٠ درجة).
 *
 * تغطي الضابطين الرابع والثالث من اعتماد التنفيذ:
 *  - حساب الدرجات: ٢٦ درجة آلية + ٤ درجات تُراجع يدويًا = ٣٠؛
 *  - قاعدة «أول خمس كلمات من ثمانٍ» في القسم الثالث (م-3)؛
 *  - التجزئة الداخلية لدرجة الكلمة: ٠٫٥ للجذر + ١ للوزن + ٠٫٥ للزوائد؛
 *  - شرط ربط الألف الظاهرة بأصلها في «قالَ» و«باعَ» (مفتاح المصدر)؛
 *  - المقالي لا يدخل في الدرجة الآلية، واختيار التصحيح وحده يحمل درجة القسم الرابع.
 */
import { describe, expect, it } from 'vitest'
import { testDefinition } from './content'
import type { AnswerMap } from '../../shared/test'
import {
  analysisQuestionMarks,
  computeMarks,
  countedAnalysisIds,
  finalTestResult,
  formatMarks,
  gradeAllPages,
  isQuestionAnswered,
  marksPolicyTotals,
  TEST_TOTALS,
} from './grading'

const key = (questionId: string, fieldIndex: number) => `${questionId}:${fieldIndex}`

/** إجابات صحيحة كاملة لكل أسئلة الاختبار (بما فيها المقالي). */
function correctAnswers(): AnswerMap {
  const answers: AnswerMap = {}
  for (const page of testDefinition.pages) {
    for (const question of page.questions) {
      question.fields.forEach((field, index) => {
        if (field.kind === 'essay') answers[key(question.id, index)] = ['إجابة الطالب المقالية']
        else if (field.kind === 'select' || field.kind === 'choice') answers[key(question.id, index)] = [field.answer]
        else if (field.kind === 'multi') answers[key(question.id, index)] = [...field.answers]
        else answers[key(question.id, index)] = [field.accept[0]]
      })
    }
  }
  return answers
}

const analysisPage = testDefinition.pages[2]
const questionByWord = (word: string) => {
  const question = analysisPage.questions.find((item) => item.prompt.includes(word))
  if (!question) throw new Error(`missing analysis question for ${word}`)
  return question
}

describe('morphology lesson 02 — marks policy', () => {
  it('declares 30 marks: 26 automatic and 4 for manual review', () => {
    expect(TEST_TOTALS.total).toBe(30)
    expect(TEST_TOTALS.autoMax).toBe(26)
    expect(TEST_TOTALS.manualMax).toBe(4)
    expect(marksPolicyTotals()).toEqual({ auto: 26, manual: 4, total: 30, declaredTotal: 30 })
  })

  it('awards nothing before any answer', () => {
    const marks = computeMarks({})
    expect(marks.auto).toBe(0)
    expect(marks.manualMax).toBe(4)
    expect(marks.total).toBe(30)
    expect(marks.pages).toHaveLength(4)
    expect(marks.pages.map((page) => page.autoMax)).toEqual([1, 10, 10, 5])
    expect(marks.countedAnalysis).toEqual([])
  })

  it('awards the full 26 automatic marks for a fully correct test', () => {
    const marks = computeMarks(correctAnswers())
    expect(marks.auto).toBe(26)
    expect(marks.pages.map((page) => page.auto)).toEqual([1, 10, 10, 5])
    expect(marks.pages.every((page) => page.auto === page.autoMax)).toBe(true)
  })

  it('never counts the two essay questions in the automatic degree', () => {
    const essaysOnly: AnswerMap = {
      [key('q01', 0)]: ['الميزان الصرفي مقياس لمعرفة بنية الكلمة.'],
      [key('q02', 0)]: ['الأصلية حروف الجذر، والزائدة تُضاف لتكوين صيغة جديدة.'],
    }
    expect(computeMarks(essaysOnly).auto).toBe(0)
    expect(computeMarks(essaysOnly).pages[0].manualMax).toBe(4)
    // الدرجة الآلية للقسم الأول تأتي من سؤال العبارة المشهورة فقط.
    expect(computeMarks({ ...essaysOnly, [key('q03', 0)]: ['سألتمونيها'] }).pages[0].auto).toBe(1)
    expect(computeMarks({ ...essaysOnly, [key('q03', 0)]: ['سألتمونيها'] }).auto).toBe(1)
  })

  it('grades the automatic key of «سألتمونيها» flexibly (harakat and spacing ignored)', () => {
    expect(computeMarks({ [key('q03', 0)]: ['سَأَلْتُمُونِيهَا'] }).auto).toBe(1)
    expect(computeMarks({ [key('q03', 0)]: ['سألتمونيها.'] }).auto).toBe(1)
    expect(computeMarks({ [key('q03', 0)]: ['سألتمونيهاا'] }).auto).toBe(0)
  })
})

describe('morphology lesson 02 — the «first five of eight» rule (م-3)', () => {
  it('counts the first five answered analysis questions only', () => {
    // الإجابة عن الكلمات الثماني كلها: تُحتسب أول خمس فقط.
    const all = correctAnswers()
    const { counted, ignored } = countedAnalysisIds(all)
    expect(counted).toHaveLength(5)
    expect(ignored).toHaveLength(3)
    expect(counted).toEqual(analysisPage.questions.slice(0, 5).map((question) => question.id))
    expect(computeMarks(all).pages[2].auto).toBe(10)
  })

  it('counts fewer than five when the student answered fewer words', () => {
    const answers = correctAnswers()
    for (const question of analysisPage.questions.slice(2)) {
      question.fields.forEach((_field, index) => delete answers[key(question.id, index)])
    }
    const marks = computeMarks(answers)
    expect(marks.countedAnalysis).toHaveLength(2)
    expect(marks.pages[2].auto).toBe(4)
    expect(marks.auto).toBe(1 + 10 + 4 + 5)
  })

  it('counts the first five answered in question order, not the first five correct', () => {
    const answers = correctAnswers()
    // الكلمة الأولى أُجيب عنها خطأً، والكلمتان السابعة والثامنة أُجيبتا صح.
    answers[key(analysisPage.questions[0].id, 1)] = ['انْفِعال']
    const { counted } = countedAnalysisIds(answers)
    expect(counted[0]).toBe(analysisPage.questions[0].id)
    expect(counted).toHaveLength(5)
    const marks = computeMarks(answers)
    // الكلمة الأولى تفقد درجة الوزن (١) فتبقى ١ من ٢، والباقي من الخمس الأولى كامل.
    expect(marks.pages[2].auto).toBeCloseTo(9, 5)
    expect(marks.pages[2].lines.some((line) => line.includes('لا تزيد الدرجة ولا تنقصها'))).toBe(true)
  })

  it('treats a question as answered only when every automatic field is filled', () => {
    const partial: AnswerMap = { [key(questionByWord('مَسْؤول').id, 0)]: ['س أ ل'] }
    expect(isQuestionAnswered(questionByWord('مَسْؤول'), partial)).toBe(false)
    expect(countedAnalysisIds(partial).counted).toEqual([])
  })
})

describe('morphology lesson 02 — the two-mark analysis breakdown', () => {
  const word = questionByWord('انْطَلَقَ')

  it('splits the two marks: 0.5 root + 1 weight + 0.5 extras', () => {
    expect(analysisQuestionMarks(word, {})).toBe(0)
    expect(analysisQuestionMarks(word, { [key(word.id, 0)]: ['ط ل ق'] })).toBe(0.5)
    expect(
      analysisQuestionMarks(word, { [key(word.id, 0)]: ['ط ل ق'], [key(word.id, 1)]: ['انْفَعَلَ'] }),
    ).toBe(1.5)
    expect(
      analysisQuestionMarks(word, {
        [key(word.id, 0)]: ['ط ل ق'],
        [key(word.id, 1)]: ['انْفَعَلَ'],
        [key(word.id, 2)]: ['ا', 'ن'],
      }),
    ).toBe(2)
  })

  it('accepts the root without spaces or harakat, and rejects a wrong extras set', () => {
    expect(analysisQuestionMarks(word, { [key(word.id, 0)]: ['طلق'] })).toBe(0.5)
    expect(analysisQuestionMarks(word, { [key(word.id, 0)]: ['طَلَقَ'] })).toBe(0.5)
    expect(analysisQuestionMarks(word, { [key(word.id, 2)]: ['ا'] })).toBe(0)
    expect(analysisQuestionMarks(word, { [key(word.id, 2)]: ['ا', 'ن', 'ط'] })).toBe(0)
  })

  it('keeps the strict harakat matching of the weights (فَعَلَ ≠ فُعِلَ)', () => {
    const kataba = testDefinition.pages[1].questions[0]
    expect(computeMarks({ [key(kataba.id, 0)]: ['فَعَلَ'] }).pages[1].auto).toBe(1)
    expect(computeMarks({ [key(kataba.id, 0)]: ['فُعِلَ'] }).pages[1].auto).toBe(0)
    expect(computeMarks({ [key(kataba.id, 0)]: ['فعل'] }).pages[1].auto).toBe(0)
  })

  it('requires the four extras of اسْتِخْراج, including the second alef (خ-3)', () => {
    const extraction = questionByWord('اسْتِخْراج')
    const full = ['ا (الأولى)', 'س', 'ت', 'ا (الثانية)']
    expect(analysisQuestionMarks(extraction, { [key(extraction.id, 2)]: full })).toBe(0.5)
    // ثلاث زوائد فقط (كما في حصر المصدر) لا تكفي.
    expect(analysisQuestionMarks(extraction, { [key(extraction.id, 2)]: ['ا (الأولى)', 'س', 'ت'] })).toBe(0)
  })

  it('gates the weight mark of قالَ / باعَ on linking the visible alef to its origin', () => {
    const qaal = questionByWord('قالَ')
    const withoutOrigin: AnswerMap = {
      [key(qaal.id, 0)]: ['ق و ل'],
      [key(qaal.id, 1)]: ['فَعَلَ'],
      [key(qaal.id, 2)]: ['لا توجد حروف زائدة'],
    }
    // لم يُجب عن حقل «الألف الظاهرة أصلها» → السؤال غير مكتمل، فلا يُحتسب أصلًا؛
    // ولو قُدّر منفردًا لحجب الحقل الفارغ درجة الوزن (٠٫٥ للجذر + ٠٫٥ للزوائد).
    expect(isQuestionAnswered(qaal, withoutOrigin)).toBe(false)
    expect(analysisQuestionMarks(qaal, withoutOrigin)).toBe(1)

    expect(
      analysisQuestionMarks(qaal, { ...withoutOrigin, [key(qaal.id, 3)]: ['واو من الجذر ق و ل'] }),
    ).toBe(2)
    expect(
      analysisQuestionMarks(qaal, { ...withoutOrigin, [key(qaal.id, 3)]: ['ياء من الجذر ق ي ل'] }),
    ).toBe(1)

    const baa3a = questionByWord('باعَ')
    expect(
      analysisQuestionMarks(baa3a, {
        [key(baa3a.id, 0)]: ['ب ي ع'],
        [key(baa3a.id, 1)]: ['فَعَلَ'],
        [key(baa3a.id, 2)]: ['لا توجد حروف زائدة'],
        [key(baa3a.id, 3)]: ['ياء من الجذر ب ي ع'],
      }),
    ).toBe(2)
  })
})

describe('morphology lesson 02 — the error-discovery page', () => {
  it('awards one mark per correct correction, with the reason reviewed manually', () => {
    const page = testDefinition.pages[3]
    expect(page.questions).toHaveLength(5)
    const one: AnswerMap = { [key(page.questions[0].id, 0)]: [page.questions[0].fields[0].kind === 'select' ? page.questions[0].fields[0].answer : ''] }
    expect(computeMarks(one).pages[3].auto).toBe(1)

    const answers = correctAnswers()
    expect(computeMarks(answers).pages[3].auto).toBe(5)
    // السبب المقالي لا يضيف درجة آلية.
    for (const question of page.questions) delete answers[key(question.id, 1)]
    expect(computeMarks(answers).pages[3].auto).toBe(5)
    expect(computeMarks(answers).pages[3].manualQuestions).toBe(5)
  })
})

describe('morphology lesson 02 — shared engine integration', () => {
  it('grades all four pages and aggregates 26 questions', () => {
    const results = gradeAllPages(testDefinition, correctAnswers())
    expect(Object.keys(results)).toHaveLength(4)
    const combined = finalTestResult(testDefinition, correctAnswers())
    expect(combined.total).toBe(26)
    expect(combined.complete).toBe(true)
    // السؤالان المقاليان لا يُعدّان صحيحين آليًا.
    expect(combined.correct).toBe(24)
    expect(combined.manual).toBe(7)
  })

  it('formats half marks with Arabic-Indic digits', () => {
    expect(formatMarks(0)).toBe('٠')
    expect(formatMarks(0.5)).toBe('٠٫٥')
    expect(formatMarks(1.5)).toBe('١٫٥')
    expect(formatMarks(26)).toBe('٢٦')
    expect(formatMarks(30)).toBe('٣٠')
  })
})

describe('morphology lesson 02 — renamed analysis fields still map onto the rubric', () => {
  it('يمنح قالَ وباعَ درجتَيهما كاملتين بعد توحيد تسمية حقلي الزوائد والأصل', () => {
    const answers = correctAnswers()
    for (const word of ['قالَ', 'باعَ']) {
      const question = questionByWord(word)
      expect(question.fields.map((field) => field.label)).toEqual([
        'الجذر (نصف درجة)',
        'الوزن (درجة)',
        'الحروف الزائدة (نصف درجة)',
        'الألف الظاهرة أصلها (شرط نيل درجة الوزن)',
      ])
      expect(isQuestionAnswered(question, answers)).toBe(true)
      expect(analysisQuestionMarks(question, answers)).toBe(2)
    }
  })
})
