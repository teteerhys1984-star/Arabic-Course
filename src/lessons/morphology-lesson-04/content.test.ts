/**
 * اختبارات طبقة المحتوى للدرس الرابع من قسم الصرف (أوزان الفعل الثلاثي المجرّد).
 *
 * تتحقق من:
 *  - الأقسام التسعة للمصدر بترتيبها، والتمهيد، والتمهيد للدرس الخامس؛
 *  - حسم التناقضات العلمية:
 *      * «جَلَسَ — يَجْلِسُ» في الباب الثاني لا الأول؛
 *      * عدم وضع «رَكِبَ — يَرْكَبُ» و«لَبِسَ — يَلْبَسُ» في أمثلة الباب الثاني؛
 *      * «فَهِمَ — يَفْهَمُ» في الباب الرابع لا الثاني؛
 *      * توضيح «وَرِثَ — يَرِثُ» في الباب الخامس دون خلط بين الوزن الأصلي وحذف الواو؛
 *  - مطابقة كل فعل ووزنه وحركة عين الماضي والمضارع ورقم الباب في جميع الجداول والمختبرات والتدريبات؛
 *  - اكتمال التدريب الأول (٦ أسئلة بخياراتها) والتدريب الثاني (٦ أسئلة بخيارات الوزن والباب)؛
 *  - بنية الاختبار: ٤ صفحات × ٥ أسئلة = ٢٠ سؤالًا.
 */
import { describe, expect, it } from 'vitest'
import * as C from './content'
import { testDefinition } from './content'

const CANONICAL_DOORS: Record<
  C.DoorName,
  { pastVowel: 'الفتحة' | 'الكسرة' | 'الضمة'; presentVowel: 'الضمة' | 'الكسرة' | 'الفتحة'; weight: C.SixWeight }
> = {
  الأول: { pastVowel: 'الفتحة', presentVowel: 'الضمة', weight: 'فَعَلَ — يَفْعُلُ' },
  الثاني: { pastVowel: 'الفتحة', presentVowel: 'الكسرة', weight: 'فَعَلَ — يَفْعِلُ' },
  الثالث: { pastVowel: 'الفتحة', presentVowel: 'الفتحة', weight: 'فَعَلَ — يَفْعَلُ' },
  الرابع: { pastVowel: 'الكسرة', presentVowel: 'الفتحة', weight: 'فَعِلَ — يَفْعَلُ' },
  الخامس: { pastVowel: 'الكسرة', presentVowel: 'الكسرة', weight: 'فَعِلَ — يَفْعِلُ' },
  السادس: { pastVowel: 'الضمة', presentVowel: 'الضمة', weight: 'فَعُلَ — يَفْعُلُ' },
}

describe('morphology lesson 04 — source fidelity', () => {
  it('carries the nine source sections in order', () => {
    expect(C.sourceSections).toHaveLength(9)
    expect([...C.sourceSections]).toEqual([
      'أولًا: ما المقصود بالوزن الصرفي؟',
      'ثانيًا: ما أوزان الفعل الثلاثي المجرّد؟',
      'ثالثًا: شرح الأبواب الستة بالتفصيل',
      'رابعًا: كيف تحفظ الأبواب الستة بسهولة؟',
      'خامسًا: كيف أستخرج وزن الفعل بنفسي؟',
      'سادسًا: هل يمكنني معرفة المضارع من الماضي وحده؟',
      'سابعًا: تدريبات على الدرس',
      'ثامنًا: خلاصة الدرس',
      'تاسعًا: ما الدرس القادم؟',
    ])
  })

  it('links to Lesson 3 in the introduction and points to Lesson 5 «أوزان الفعل الثلاثي المزيد» at the end', () => {
    expect(C.lessonHeader.prerequisiteLink).toContain('الفرق بين الفعل المجرّد والفعل المزيد')
    expect([...C.lessonHeader.previousExamples]).toEqual(['كَتَبَ', 'فَهِمَ', 'كَرُمَ'])
    expect(C.nextLessonSection.title).toBe('أوزان الفعل الثلاثي المزيد.')
    expect([...C.nextLessonSection.examples]).toEqual([
      'عَلِمَ ← عَلَّمَ.',
      'كَتَبَ ← كاتَبَ.',
      'خَرَجَ ← أَخْرَجَ.',
      'غَفَرَ ← اسْتَغْفَرَ.',
    ])
  })

  it('reconstructs the reference table of the six doors and the summary table without empty cells', () => {
    expect(C.overviewSection.referenceTable).toHaveLength(6)
    expect(C.summarySection.table).toHaveLength(6)
    expect(C.memorizeSection.table).toHaveLength(6)

    for (const row of C.overviewSection.referenceTable) {
      const canonical = CANONICAL_DOORS[row.doorOrder]
      expect(row.fullWeight).toBe(canonical.weight)
      expect(row.pastAynVowel).toBe(canonical.pastVowel)
      expect(row.presentAynVowel).toBe(canonical.presentVowel)
      expect(row.example.trim().length).toBeGreaterThan(0)
    }

    for (const row of C.summarySection.table) {
      const canonical = CANONICAL_DOORS[row.doorOrder]
      expect(row.weight).toBe(canonical.weight)
      expect(row.pastVowel).toBe(canonical.pastVowel)
      expect(row.presentVowel).toBe(canonical.presentVowel)
    }
  })

  it('preserves all six questions and options of Training 1', () => {
    expect(C.trainingOne.items).toHaveLength(6)
    expect(C.trainingOne.items.map((item) => item.verbPair)).toEqual([
      'نَصَرَ — يَنْصُرُ',
      'ضَرَبَ — يَضْرِبُ',
      'فَتَحَ — يَفْتَحُ',
      'عَلِمَ — يَعْلَمُ',
      'حَسِبَ — يَحْسِبُ',
      'كَرُمَ — يَكْرُمُ',
    ])
    expect(C.trainingOne.items.map((item) => item.answer)).toEqual([
      'فَعَلَ — يَفْعُلُ',
      'فَعَلَ — يَفْعِلُ',
      'فَعَلَ — يَفْعَلُ',
      'فَعِلَ — يَفْعَلُ',
      'فَعِلَ — يَفْعِلُ',
      'فَعُلَ — يَفْعُلُ',
    ])
    for (const item of C.trainingOne.items) {
      expect(item.options).toHaveLength(3)
      expect(item.options).toContain(item.answer)
      const canonical = CANONICAL_DOORS[item.doorOrder]
      expect(item.answer).toBe(canonical.weight)
      expect(item.pastVowel).toBe(canonical.pastVowel)
      expect(item.presentVowel).toBe(canonical.presentVowel)
    }
  })

  it('preserves all six questions and options of Training 2', () => {
    expect(C.trainingTwo.items).toHaveLength(6)
    expect(C.trainingTwo.items.map((item) => item.verbPair)).toEqual([
      'شَكَرَ — يَشْكُرُ',
      'جَلَسَ — يَجْلِسُ',
      'مَنَعَ — يَمْنَعُ',
      'فَرِحَ — يَفْرَحُ',
      'وَرِثَ — يَرِثُ',
      'حَسُنَ — يَحْسُنُ',
    ])
    expect(C.trainingTwo.items.map((item) => [item.weightAnswer, item.doorAnswer])).toEqual([
      ['فَعَلَ — يَفْعُلُ', 'الأول'],
      ['فَعَلَ — يَفْعِلُ', 'الثاني'],
      ['فَعَلَ — يَفْعَلُ', 'الثالث'],
      ['فَعِلَ — يَفْعَلُ', 'الرابع'],
      ['فَعِلَ — يَفْعِلُ', 'الخامس'],
      ['فَعُلَ — يَفْعُلُ', 'السادس'],
    ])
    for (const item of C.trainingTwo.items) {
      expect(item.weightOptions).toHaveLength(6)
      expect(item.doorOptions).toHaveLength(6)
      const canonical = CANONICAL_DOORS[item.doorAnswer]
      expect(item.weightAnswer).toBe(canonical.weight)
      expect(item.pastVowel).toBe(canonical.pastVowel)
      expect(item.presentVowel).toBe(canonical.presentVowel)
    }
  })
})

describe('morphology lesson 04 — scientific audit & contradiction resolution', () => {
  it('places جَلَسَ — يَجْلِسُ in Door 2, never in Door 1 examples table', () => {
    expect(C.doorOne.examples.some((row) => row.past === 'جَلَسَ')).toBe(false)
    expect(C.doorOne.cautionNotice).toContain('جَلَسَ — يَجْلِسُ')
    expect(C.doorOne.cautionNotice).toContain('الباب الثاني')

    const jalasaInDoorTwo = C.doorTwo.examples.find((row) => row.past === 'جَلَسَ')
    expect(jalasaInDoorTwo).toBeDefined()
    expect(jalasaInDoorTwo?.present).toBe('يَجْلِسُ')
    expect(jalasaInDoorTwo?.doorOrder).toBe('الثاني')
    expect(jalasaInDoorTwo?.weight).toBe('فَعَلَ — يَفْعِلُ')
  })

  it('excludes رَكِبَ — يَرْكَبُ, لَبِسَ — يَلْبَسُ, and فَهِمَ — يَفْهَمُ from Door 2 examples table', () => {
    const doorTwoPasts = C.doorTwo.examples.map((row) => row.past)
    expect(doorTwoPasts).toEqual(['ضَرَبَ', 'جَلَسَ', 'حَمَلَ'])
    expect(doorTwoPasts).not.toContain('رَكِبَ')
    expect(doorTwoPasts).not.toContain('لَبِسَ')
    expect(doorTwoPasts).not.toContain('فَهِمَ')
  })

  it('places فَهِمَ — يَفْهَمُ in Door 4 with الكسرة in past and الفتحة in present', () => {
    const fahima = C.doorFour.examples.find((row) => row.past === 'فَهِمَ')
    expect(fahima).toBeDefined()
    expect(fahima?.present).toBe('يَفْهَمُ')
    expect(fahima?.pastVowel).toBe('الكسرة')
    expect(fahima?.presentVowel).toBe('الفتحة')
    expect(fahima?.weight).toBe('فَعِلَ — يَفْعَلُ')
    expect(fahima?.doorOrder).toBe('الرابع')
  })

  it('explains وَرِثَ — يَرِثُ and وَثِقَ — يَثِقُ in Door 5 accurately (door weight فَعِلَ — يَفْعِلُ, underlying يَوْرِثُ/يَوْثِقُ, surface imperfect weight يَعِلُ)', () => {
    const waritha = C.doorFive.examples.find((row) => row.past === 'وَرِثَ')
    expect(waritha).toBeDefined()
    expect(waritha?.aynLetter).toBe('الراء')
    expect(waritha?.pastVowel).toBe('الكسرة')
    expect(waritha?.presentVowel).toBe('الكسرة')
    expect(waritha?.weight).toBe('فَعِلَ — يَفْعِلُ')
    expect(waritha?.doorOrder).toBe('الخامس')
    expect(waritha?.meaning).toContain('يَعِلُ')

    const wathiqa = C.doorFive.examples.find((row) => row.past === 'وَثِقَ')
    expect(wathiqa).toBeDefined()
    expect(wathiqa?.aynLetter).toBe('الثاء')
    expect(wathiqa?.pastVowel).toBe('الكسرة')
    expect(wathiqa?.presentVowel).toBe('الكسرة')
    expect(wathiqa?.weight).toBe('فَعِلَ — يَفْعِلُ')
    expect(wathiqa?.doorOrder).toBe('الخامس')
    expect(wathiqa?.meaning).toContain('يَعِلُ')

    expect(C.doorFive.weakVerbClarification).toContain('يَوْرِثُ')
    expect(C.doorFive.weakVerbClarification).toContain('يَوْثِقُ')
    expect(C.doorFive.weakVerbClarification).toContain('ساكنةً بين ياء المضارعة المفتوحة والكسرة اللازمة')
    expect(C.doorFive.weakVerbClarification).toContain('يَعِلُ')
    expect(C.doorFive.weakVerbClarification).toContain('الباب الخامس')
    expect(C.trainingTwo.items[4].explanation).toContain('يَعِلُ')
    expect(C.teacherAuditNotes[3]).toContain('يَعِلُ')
  })

  it('keeps every verb across all six doors and interactive labs consistent with its canonical door', () => {
    const allDoorRows = [
      ...C.doorOne.examples,
      ...C.doorTwo.examples,
      ...C.doorThree.examples,
      ...C.doorFour.examples,
      ...C.doorFive.examples,
      ...C.doorSix.examples,
      ...C.aynLab,
      ...C.doorsClassifyLab,
      ...C.extractLab,
    ]
    for (const row of allDoorRows) {
      const canonical = CANONICAL_DOORS[row.doorOrder]
      expect(row.weight, `${row.past} weight`).toBe(canonical.weight)
      expect(row.pastVowel, `${row.past} pastVowel`).toBe(canonical.pastVowel)
      expect(row.presentVowel, `${row.past} presentVowel`).toBe(canonical.presentVowel)
    }
  })
})

describe('morphology lesson 04 — test structure', () => {
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
      expect(question.solution?.trim().length).toBeGreaterThan(0)
      expect(question.explanation?.trim().length).toBeGreaterThan(0)
    }
  })
})
