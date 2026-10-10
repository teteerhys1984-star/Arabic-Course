/**
 * اختبارات طبقة المحتوى للدرس الثالث من قسم الصرف (الفعل المجرّد والمزيد).
 *
 * تتحقق من:
 *  - الأقسام العشرة للمصدر بترتيبها، وعناوينها الترقيمية؛
 *  - التدريبات الثلاثة كاملة بعدد بنودها ومحتواها؛
 *  - عدم وجود أي صف جدول فارغ (م-1: الجداول أُعيد بناؤها من عناوينها وبياناتها)؛
 *  - الدقة العلمية: العدّ الصرفي للتضعيف، وعدم عرض «انْخَرَجَ» مثالًا رئيسًا؛
 *  - استعادة صياغة تعليمة التدريب الثاني كما وردت في المصدر؛
 *  - بنية الاختبار: ٤ صفحات × ٥ أسئلة = ٢٠ سؤالًا، بدرجة واحدة لكل سؤال، ومن إعداد المنصة.
 */
import { describe, expect, it } from 'vitest'
import * as C from './content'
import { testDefinition } from './content'

const haraka = /[\u064B-\u065F\u0670]/

describe('morphology lesson 03 — source fidelity', () => {
  it('carries the ten source sections in order, with their ordinals', () => {
    expect(C.sourceSections).toHaveLength(10)
    expect([...C.sourceSections]).toEqual([
      'أولًا: ماذا ندرس في علم الصرف؟',
      'ثانيًا: ما المقصود بالفعل المجرّد؟',
      'ثالثًا: ما المقصود بالفعل المزيد؟',
      'رابعًا: كيف نميّز الفعل المجرّد من الفعل المزيد؟',
      'خامسًا: أنواع الفعل المزيد بحسب عدد الحروف الزائدة',
      'سادسًا: ما علاقة هذا الدرس بالميزان الصرفي؟',
      'سابعًا: هل زيادة الحروف تغيّر المعنى دائمًا؟',
      'ثامنًا: خلاصة الدرس',
      'تاسعًا: تدريبات تطبيقية',
      'عاشرًا: ماذا يأتي بعد هذا الدرس؟',
    ])
  })

  it('points the closing section to lesson 4 «أوزان الفعل الثلاثي المجرّد»', () => {
    expect(C.nextLesson.title).toBe('أوزان الفعل الثلاثي المجرّد')
    expect(C.nextLesson.heading).toBe('عاشرًا: ماذا يأتي بعد هذا الدرس؟')
  })

  it('keeps all eight words of exercise 1 with their type and letter counts', () => {
    expect(C.trainingOne.items.map((item) => item.word)).toEqual([
      'كَتَبَ',
      'أَخْرَجَ',
      'دَحْرَجَ',
      'عَلَّمَ',
      'اسْتَغْفَرَ',
      'تَعَلَّمَ',
      'وَسْوَسَ',
      'أَكْرَمَ',
    ])
    const rows = C.trainingOne.items.map((item) => [item.type, item.originals, item.extras])
    expect(rows).toEqual([
      ['ثلاثي مجرّد', 3, 0],
      ['ثلاثي مزيد', 3, 1],
      ['رباعي مجرّد', 4, 0],
      ['ثلاثي مزيد', 3, 1],
      ['ثلاثي مزيد', 3, 3],
      ['ثلاثي مزيد', 3, 2],
      ['رباعي مجرّد', 4, 0],
      ['ثلاثي مزيد', 3, 1],
    ])
    for (const item of C.trainingOne.items) {
      expect(item.solution.length).toBeGreaterThan(0)
      expect(item.word).toMatch(haraka)
    }
  })

  it('keeps the five words of exercise 2 and states the root of أَسْلَمَ plainly', () => {
    expect(C.trainingTwo.items.map((item) => item.word)).toEqual([
      'أَسْلَمَ',
      'انْكَسَرَ',
      'اسْتَخْرَجَ',
      'كاتَبَ',
      'تَجَمَّعَ',
    ])
    const aslama = C.trainingTwo.items[0]
    expect(aslama.solution).toContain('س، ل، م')
    expect(aslama.solution).not.toContain('سَلِمَ')
  })

  it('restores the source wording of the exercise 2 instruction', () => {
    expect(C.trainingTwo.instruction).toBe('في كل فعل من الأفعال التالية، حدّد الحروف الأصلية والحروف الزائدة:')
  })

  it('keeps all four questions of exercise 3, each with exactly one correct option', () => {
    expect(C.trainingThree.items).toHaveLength(4)
    for (const item of C.trainingThree.items) {
      expect(item.options).toContain(item.answer)
      expect(new Set(item.options).size).toBe(item.options.length)
      expect(item.options.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('never ships an empty table row or cell', () => {
    const tables: Array<Array<Record<string, unknown>>> = [
      C.mujarradDefinition.table as unknown as Array<Record<string, unknown>>,
      C.mazeedExamples.rows as unknown as Array<Record<string, unknown>>,
      C.typesOne.rows as unknown as Array<Record<string, unknown>>,
      C.typesTwo.rows as unknown as Array<Record<string, unknown>>,
      C.typesThree.rows as unknown as Array<Record<string, unknown>>,
      C.mizanIntro.table as unknown as Array<Record<string, unknown>>,
    ]
    for (const rows of tables) {
      expect(rows.length).toBeGreaterThan(0)
      for (const row of rows) {
        for (const value of Object.values(row)) {
          if (typeof value === 'string') expect(value.trim().length).toBeGreaterThan(0)
        }
      }
    }
  })
})

describe('morphology lesson 03 — scientific accuracy', () => {
  it('counts shadda as two morphological letters (عَلَّمَ = 4, تَعَلَّمَ = 5)', () => {
    const byWord = (word: string) => C.shaddaLab.find((item) => item.word === word)
    expect(byWord('عَلَّمَ')?.letterCount).toBe(4)
    expect(byWord('عَلِمَ')?.letterCount).toBe(3)
    expect(byWord('تَكَسَّرَ')?.letterCount).toBe(5)
    expect(byWord('كَسَرَ')?.letterCount).toBe(3)
    // الحروف الصرفية = الأصلية + الزائدة (والشدّة حرفان): عَلَّمَ ٣ + ١ = ٤، تَعَلَّمَ ٣ + ٢ = ٥.
    const morphological = (word: string) => {
      const item = C.trainingOne.items.find((entry) => entry.word === word)
      return item ? item.originals + item.extras : undefined
    }
    expect(morphological('عَلَّمَ')).toBe(4)
    expect(morphological('تَعَلَّمَ')).toBe(5)
  })

  it('does not present انْخَرَجَ as a main example, only as a flagged caution row', () => {
    for (const row of C.typesTwo.rows) {
      if (row.mazeed.includes('انْخَرَجَ')) expect(row.caution).toBe(true)
    }
    const mainExamples = [
      ...C.typesTwo.clearExamples.map((pair) => pair.mazeed),
      ...C.typesThree.rows.map((row) => row.mazeed),
      ...C.mazeedExamples.rows.map((row) => row.mazeed),
    ]
    expect(mainExamples.some((word) => word.includes('انْخَرَجَ'))).toBe(false)
    for (const word of ['انْكَسَرَ', 'انْطَلَقَ', 'اجْتَمَعَ']) {
      expect(mainExamples.some((example) => example.includes(word))).toBe(true)
    }
  })
})

describe('morphology lesson 03 — test structure', () => {
  it('has 4 pages of 5 platform-authored questions, 20 in total, one mark each', () => {
    expect(testDefinition.pages).toHaveLength(4)
    for (const page of testDefinition.pages) {
      expect(page.questions).toHaveLength(5)
    }
    const questions = testDefinition.pages.flatMap((page) => page.questions)
    expect(questions).toHaveLength(20)
    expect(new Set(questions.map((question) => question.id)).size).toBe(20)
    expect(testDefinition.matching).toBe('strict')
    for (const question of questions) {
      expect(question.answerSource).toBe('platform')
      expect(question.fields.length).toBeGreaterThan(0)
    }
  })
})

describe('morphology lesson 03 — labelling of platform additions', () => {
  it('marks teacher keys as platform-authored, since the source has no answer key', () => {
    expect(C.teacherKeyHeader).toContain('من إعداد المنصة')
    expect(C.teacherKeyHeader).toContain('لم يتضمن مفتاح إجابات')
  })
})
