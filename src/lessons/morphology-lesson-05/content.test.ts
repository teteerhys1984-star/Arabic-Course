/**
 * اختبارات طبقة محتوى الدرس الخامس من قسم الصرف (أوزان الفعل الثلاثي المزيد).
 *
 * تغطي:
 *  - بنية اختبار المنصة: ٢٠ سؤالًا في ٤ صفحات، جميعها اختيار من متعدد تُصحَّح آليًا؛
 *  - الأوزان التسعة وتقسيمها بحسب عدد الزيادات واتساق الجداول؛
 *  - التصحيحات الصرفية الموثقة (م-1، م-2، م-5) وغياب الصيغ الخاطئة؛
 *  - حصر المقارنة المباشرة الموثوقة في «كَتَبَ — كاتَبَ»؛
 *  - أعداد التدريبات والمختبرات وبنية العناصر دون خلايا فارغة؛
 *  - بقاء نص المصدر حرفيًا كما هو، وتطبيق التصحيحات في طبقة المحتوى وحدها.
 */
import sourceMarkdown from '../../../docs/source/morphology-lesson-05.md?raw'
import { describe, expect, it } from 'vitest'
import {
  EXTRA_COUNT_OF,
  NINE_WEIGHTS,
  TRAINING_THREE_OPTIONS,
  WEIGHTS_BY_COUNT,
  analysisSteps,
  comparisons,
  divisionSection,
  labClassify,
  labDecompose,
  labDistinguish,
  labMatch,
  labOrder,
  nineWeightsTable,
  objectives,
  oneLetterWeights,
  sourceSections,
  testDefinition,
  threeLetterWeight,
  trainingOne,
  trainingThree,
  trainingTwo,
  twoLetterWeights,
  type WeightSection,
} from './content'

const allWeightSections: WeightSection[] = [...oneLetterWeights, ...twoLetterWeights, threeLetterWeight]

describe('morphology lesson 05 — test definition', () => {
  it('declares exactly 20 questions in 4 pages (5 per page) with unique ids q01–q20', () => {
    expect(testDefinition.pages).toHaveLength(4)
    const questions = testDefinition.pages.flatMap((page) => page.questions)
    expect(questions).toHaveLength(20)
    expect(testDefinition.pages.map((page) => page.questions.length)).toEqual([5, 5, 5, 5])
    expect(questions.map((question) => question.id)).toEqual(
      Array.from({ length: 20 }, (_, i) => `q${String(i + 1).padStart(2, '0')}`),
    )
    expect(new Set(questions.map((question) => question.prompt)).size).toBe(20)
  })

  it('auto-grades every question as a single multiple-choice field with a model answer', () => {
    for (const question of testDefinition.pages.flatMap((page) => page.questions)) {
      expect(question.fields).toHaveLength(1)
      const field = question.fields[0]
      expect(field.kind).toBe('choice')
      if (field.kind === 'choice') {
        expect(field.options.length).toBeGreaterThanOrEqual(2)
        expect(field.options).toContain(field.answer)
        expect(new Set(field.options).size).toBe(field.options.length)
      }
      expect(question.solution).toBeTruthy()
      expect(question.explanation).toBeTruthy()
      expect(question.answerSource).toBe('platform')
    }
  })

  it('uses strict matching so harakat stay significant in auto-graded choices', () => {
    expect(testDefinition.matching).toBe('strict')
  })
})

describe('morphology lesson 05 — the nine weights and their division', () => {
  it('lists nine unique weights classified by extra-letter count (3 + 5 + 1)', () => {
    expect(NINE_WEIGHTS).toHaveLength(9)
    expect(new Set(NINE_WEIGHTS).size).toBe(9)
    expect(WEIGHTS_BY_COUNT['حرف واحد']).toEqual(['أَفْعَلَ', 'فَعَّلَ', 'فاعَلَ'])
    expect(WEIGHTS_BY_COUNT['حرفان']).toEqual(['انْفَعَلَ', 'افْتَعَلَ', 'افْعَلَّ', 'تَفَعَّلَ', 'تَفاعَلَ'])
    expect(WEIGHTS_BY_COUNT['ثلاثة أحرف']).toEqual(['اسْتَفْعَلَ'])
    for (const weight of NINE_WEIGHTS) {
      expect(WEIGHTS_BY_COUNT[EXTRA_COUNT_OF[weight]]).toContain(weight)
    }
  })

  it('keeps the division table at 3 rows with no empty cells', () => {
    expect(divisionSection.table).toHaveLength(3)
    for (const row of divisionSection.table) {
      expect(row.number).toBeGreaterThan(0)
      expect(row.extraLabel.trim()).not.toBe('')
      expect(row.title.trim()).not.toBe('')
      expect(row.weights.trim()).not.toBe('')
      expect(row.examples.trim()).not.toBe('')
    }
  })

  it('builds nine weight cards (3 one-letter + 5 two-letter + 1 three-letter) with non-empty rows', () => {
    expect(oneLetterWeights.map((section) => section.weight)).toEqual(['أَفْعَلَ', 'فَعَّلَ', 'فاعَلَ'])
    expect(twoLetterWeights.map((section) => section.weight)).toEqual([
      'انْفَعَلَ',
      'افْتَعَلَ',
      'افْعَلَّ',
      'تَفَعَّلَ',
      'تَفاعَلَ',
    ])
    expect(threeLetterWeight.weight).toBe('اسْتَفْعَلَ')
    for (const section of allWeightSections) {
      expect(section.rows.length).toBeGreaterThan(0)
      expect(section.tableCaption.trim()).not.toBe('')
      expect(section.meaningPoints.length).toBeGreaterThan(0)
      for (const row of section.rows) {
        expect(row.mazeed.trim()).not.toBe('')
        expect(['pair', 'pattern-example']).toContain(row.kind)
        if (row.kind === 'pair') expect(row.simple.trim()).not.toBe('')
      }
    }
    expect(nineWeightsTable).toHaveLength(9)
    expect(nineWeightsTable.map((row) => row.weight)).toEqual([...NINE_WEIGHTS])
  })

  it('shows the audited forms (م-1، م-2، م-5) and never the erroneous ones', () => {
    // م-1: «سَلِمَ» (مضبوطًا) هو المجرّد المقابل لـ«أَسْلَمَ».
    const afalaRows = oneLetterWeights[0].rows
    expect(afalaRows.some((row) => row.kind === 'pair' && row.simple === 'سَلِمَ' && row.mazeed === 'أَسْلَمَ')).toBe(true)
    // م-5: «قَرُبَ» هو الأصل المقابل لـ«اقْتَرَبَ».
    const iftaalaRows = twoLetterWeights[1].rows
    expect(
      iftaalaRows.some((row) => row.kind === 'pair' && row.simple === 'قَرُبَ' && row.mazeed === 'اقْتَرَبَ'),
    ).toBe(true)
    // م-2: «نَظَّفَ» مثال على وزن فَعَّلَ فقط، ولا يُنسب إلى مجرد «نَظَفَ».
    const fazzalaRows = oneLetterWeights[1].rows
    expect(
      fazzalaRows.some((row) => row.kind === 'pattern-example' && row.mazeed === 'نَظَّفَ'),
    ).toBe(true)
    expect(fazzalaRows.some((row) => row.simple.includes('نَظَفَ'))).toBe(false)
    // الصيغ الخاطئة القديمة لا تظهر كبيانات في جداول الأمثلة (أزواج أو أمثلة).
    const allRows = allWeightSections.flatMap((section) => section.rows)
    for (const wrong of ['سْلَمَ', 'قَرَبَ', 'نَظَفَ']) {
      expect(allRows.some((row) => row.simple === wrong || row.mazeed === wrong)).toBe(false)
    }
    // «حَمِرَ» و«نَقِشَ» مجرد أمثلة على الوزن لا مقارنات مباشرة (م-6 وسياق التدقيق).
    for (const section of allWeightSections) {
      for (const row of section.rows) {
        if (row.mazeed === 'احْمَرَّ' || row.mazeed === 'ناقَشَ') {
          expect(row.kind).toBe('pattern-example')
        }
      }
    }
  })
})

describe('morphology lesson 05 — comparisons, steps, activities', () => {
  it('keeps exactly 4 valid comparisons and «كَتَبَ — كاتَبَ» as the verified direct pair of فاعَلَ', () => {
    expect(comparisons).toHaveLength(4)
    // م-3: المقارنة المباشرة الموثوقة الوحيدة لوزن فاعَلَ هي «كَتَبَ — كاتَبَ»، وبقية الأمثلة على الوزن فقط.
    const faaalaRows = oneLetterWeights[2].rows
    expect(faaalaRows.filter((row) => row.kind === 'pair')).toEqual([
      expect.objectContaining({ simple: 'كَتَبَ', mazeed: 'كاتَبَ' }),
    ])
    expect(faaalaRows.filter((row) => row.kind === 'pattern-example').length).toBeGreaterThan(0)
    expect(comparisons[0].leftLabel).toBe('أَفْعَلَ')
    expect(comparisons[0].rightLabel).toBe('فَعَّلَ')
  })

  it('keeps the five analysis steps in order with no empty fields', () => {
    expect(analysisSteps.map((step) => step.n)).toEqual([1, 2, 3, 4, 5])
    for (const step of analysisSteps) {
      expect(step.title.trim()).not.toBe('')
      expect(step.detail.trim()).not.toBe('')
    }
  })

  it('offers varied activities with hidden solutions and full item sets', () => {
    expect(labDecompose.items).toHaveLength(6)
    expect(labMatch.items).toHaveLength(8)
    expect(labDistinguish.items).toHaveLength(4)
    expect(labOrder.items).toHaveLength(5)
    expect(labOrder.solution).toHaveLength(5)
    expect(labClassify.items).toHaveLength(8)
    expect(trainingOne.items).toHaveLength(8)
    expect(trainingTwo.items).toHaveLength(5)
    expect(trainingThree.items).toHaveLength(6)
    expect(TRAINING_THREE_OPTIONS).toHaveLength(5)
    // حلول التدريب الثاني محفوظة لمنطقة المعلم ولا تُعرض إلا بطلب الطالب.
    for (const item of trainingTwo.items) {
      expect(item.solution.trim()).not.toBe('')
    }
  })

  it('states the lesson overview (11 source sections) and platform objectives', () => {
    expect(sourceSections).toHaveLength(11)
    expect(objectives.length).toBeGreaterThanOrEqual(6)
  })
})

describe('morphology lesson 05 — source fidelity', () => {
  const source = sourceMarkdown

  it('keeps the source document untouched (its original wording still present)', () => {
    // صيغ المصدر القديمة «سْلَمَ» و«قَرَبَ» لا تزال حرفيًا في ملف المصدر نفسه.
    expect(source).toContain('سْلَمَ')
    expect(source).toContain('قَرَبَ')
    expect(source).toContain('أهلًا بك! 🌷')
    expect(source).toContain('اليوم سنجمع هذه المعلومات في درس واحد مهم، وهو أوزان الفعل الثلاثي المزيد.')
  })

  it('applies the audited corrections in the content layer only', () => {
    expect(source).toContain('سْلَمَ') // الخطأ باقٍ في المصدر كما هو
    const allRows = allWeightSections.flatMap((section) => section.rows)
    expect(allRows.some((row) => row.simple === 'سَلِمَ' && row.mazeed === 'أَسْلَمَ')).toBe(true) // ومُصحَّح في المحتوى
    expect(allRows.some((row) => row.simple === 'سْلَمَ')).toBe(false)
  })
})
