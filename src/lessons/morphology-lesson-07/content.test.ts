/**
 * اختبارات طبقة محتوى الدرس السابع من قسم الصرف (الفعل الصحيح والفعل المعتل).
 *
 * تغطي:
 *  - وفاء المصدر: بقاء نص docs/source/morphology-lesson-07.md حرفيًا في طبقة المحتوى؛
 *  - بنية اختبار المنصة: ٢٠ سؤالًا جديدًا في ٤ صفحات، كلها اختيار من متعدد تُصحَّح آليًا؛
 *  - أن أسئلة الاختبار ليست نسخًا من تدريبات المصدر (غ-8)؛
 *  - اتساق التحليل الصرفي: القسم (صحيح/معتلّ)، والنوع، والحروف الأصلية، وأصل الحرف المنقلب؛
 *  - اتساق الأنشطة السبعة والتدريبات الأصلية (١–١١ بخياراتها) مع البيانات المُدقَّقة؛
 *  - مواد منطقة المعلّم وإحالاتها، وحدود النطاق (لا درس ثامن ولا اختبار وحدة).
 */
import sourceMarkdown from '../../../docs/source/morphology-lesson-07.md?raw'
import { describe, expect, it } from 'vitest'
import {
  MUALL_TYPES,
  SAHIH_TYPES,
  TRAINING_ONE_OPTIONS,
  TRAINING_TWO_OPTIONS,
  TRAINING_TWO_TAWA_OPTIONS,
  TRAINING_TWO_WAQA_OPTIONS,
  WEAK_LETTERS,
  alifOriginSection,
  ajwafSection,
  arabicDigits,
  careVerbs,
  comparisonSection,
  factOf,
  farqSahihSalimSection,
  howToTellSection,
  labAlif,
  labCorrectTypes,
  labLetters,
  labMistakes,
  labPairs,
  labPosition,
  labRoots,
  layyefSection,
  lessonHeader,
  mithaalSection,
  mudaafSection,
  muallKindsIntro,
  muallSection,
  muallTable,
  mistakesSection,
  naaqisSection,
  nextLessonSection,
  objectives,
  reviewSection,
  sahihKindsSection,
  sahihSection,
  sahihTable,
  saalimSection,
  mahmoozSection,
  sourceSections,
  summarySection,
  teacherAnalysisNote,
  teacherAuditNotes,
  teacherContentMap,
  teacherKeyHeader,
  teacherLabKeys,
  teacherMistakes,
  teacherRuleExplanations,
  teacherVerbTableNote,
  testDefinition,
  trainingsIntro,
  trainingControls,
  trainingOne,
  trainingTwo,
  verbFacts,
  whyRootsSection,
} from './content'

const questions = testDefinition.pages.flatMap((page) => page.questions)

describe('morphology lesson 07 — source fidelity (docs/source/morphology-lesson-07.md)', () => {
  it('keeps the source headings, intro and definitions verbatim', () => {
    const verbatim = [
      lessonHeader.section,
      lessonHeader.title,
      lessonHeader.intro,
      reviewSection.heading,
      reviewSection.lead,
      reviewSection.lettersLine,
      reviewSection.examplesTitle,
      reviewSection.cautionTitle,
      reviewSection.caution,
      reviewSection.cautionExample,
      whyRootsSection.lead,
      whyRootsSection.example,
      sahihSection.heading,
      sahihSection.definition,
      sahihSection.detail,
      sahihSection.examplesTitle,
      sahihTable.note,
      sahihTable.conclusion,
      sahihKindsSection.heading,
      sahihKindsSection.lead,
      saalimSection.title,
      saalimSection.definition,
      saalimSection.examples,
      mahmoozSection.title,
      mahmoozSection.definition,
      mahmoozSection.examples,
      mahmoozSection.hamzaNote,
      mudaafSection.title,
      mudaafSection.definition,
      mudaafSection.examples,
      mudaafSection.kinds,
      farqSahihSalimSection.heading,
      farqSahihSalimSection.conclusion,
      muallSection.heading,
      muallSection.definition,
      muallSection.detail,
      muallSection.examplesTitle,
      alifOriginSection.text,
      alifOriginSection.conclusion,
      muallKindsIntro.heading,
      muallKindsIntro.lead,
      mithaalSection.definition,
      mithaalSection.examples,
      mithaalSection.demo,
      ajwafSection.definition,
      ajwafSection.examples,
      ajwafSection.demo,
      naaqisSection.definition,
      naaqisSection.examples,
      naaqisSection.demo,
      layyefSection.definition,
      layyefSection.lead,
      howToTellSection.heading,
      howToTellSection.lead,
      comparisonSection.heading,
      mistakesSection.heading,
      trainingsIntro.heading,
      trainingsIntro.lead,
      trainingOne.heading,
      trainingOne.instruction,
      trainingTwo.heading,
      summarySection.heading,
      summarySection.lead,
      summarySection.goldenRule,
      nextLessonSection.sourceLine,
    ]
    for (const line of verbatim) {
      expect(sourceMarkdown, `missing from the source: ${line}`).toContain(line)
    }
    // توضيح الأنواع أ/ب/ج كما ورد حرفيًا.
    for (const item of farqSahihSalimSection.items) {
      expect(sourceMarkdown).toContain(item.label)
      expect(sourceMarkdown).toContain(item.text)
    }
  })

  it('keeps every source bullet, table cell and example verbatim', () => {
    // نقاط «أولًا» الأربع
    for (const example of reviewSection.examples) {
      expect(sourceMarkdown, `missing example line: ${example.text}`).toContain(example.text)
    }
    // نقاط «خامسًا» و«كيف أفرّق»
    for (const bullet of howToTellSection.bullets) {
      expect(sourceMarkdown, `missing bullet: ${bullet}`).toContain(bullet)
    }
    expect(sourceMarkdown).toContain('لفيف مقرون: حرفا العلّة متجاوران، مثل طَوَى.')
    expect(sourceMarkdown).toContain('لفيف مفروق: يفصل بين حرفَي العلّة حرف صحيح، مثل وَقَى.')
    // الجدول الأول: كل خلاياه
    for (const column of sahihTable.columns) expect(sourceMarkdown).toContain(column)
    for (const row of sahihTable.rows) {
      expect(sourceMarkdown).toContain(row.word)
      expect(sourceMarkdown).toContain(row.roots)
      expect(sourceMarkdown).toContain(row.reason)
    }
    // الجدول الثاني
    for (const column of muallTable.columns) expect(sourceMarkdown).toContain(column)
    for (const row of muallTable.rows) {
      expect(sourceMarkdown).toContain(row.word)
      expect(sourceMarkdown).toContain(row.weak)
      expect(sourceMarkdown).toContain(row.position)
    }
    // جدول المقارنة
    for (const column of comparisonSection.columns) expect(sourceMarkdown).toContain(column)
    for (const row of comparisonSection.rows) {
      expect(sourceMarkdown).toContain(row.aspect)
      expect(sourceMarkdown).toContain(row.sahih)
      expect(sourceMarkdown).toContain(row.muall)
    }
    // جدول الخلاصة
    for (const column of summarySection.recap.columns) expect(sourceMarkdown).toContain(column)
    for (const row of summarySection.recap.rows) {
      expect(sourceMarkdown).toContain(row.type)
      expect(sourceMarkdown).toContain(row.example)
    }
    // الأخطاء الشائعة الأربعة بأسئلتها وأجوبتها
    for (const item of mistakesSection.items) {
      expect(sourceMarkdown).toContain(item.question)
      expect(sourceMarkdown).toContain(item.answer)
    }
    // صيغتي المضارع في التنبيه
    expect(sourceMarkdown).toContain('يَقُولُ')
    expect(sourceMarkdown).toContain('يَبِيعُ')
  })

  it('lists the nine source sections in order and seven platform objectives', () => {
    expect(sourceSections).toHaveLength(9)
    let cursor = -1
    for (const section of sourceSections) {
      const index = sourceMarkdown.indexOf(section)
      expect(index, `missing section heading: ${section}`).toBeGreaterThan(cursor)
      cursor = index
    }
    expect(objectives).toHaveLength(7)
  })

  it('keeps the source trainings whole: 6 items (١–٦) and 5 items numbered ٧–١١', () => {
    expect(trainingOne.items.map((item) => item.number)).toEqual([1, 2, 3, 4, 5, 6])
    expect(trainingTwo.items.map((item) => item.number)).toEqual([7, 8, 9, 10, 11])
    const expectedVerbs1 = ['كَتَبَ', 'وَعَدَ', 'قَالَ', 'سَأَلَ', 'رَمَى', 'مَدَّ']
    expect(trainingOne.items.map((item) => item.verb)).toEqual(expectedVerbs1)
    const expectedVerbs2 = ['وَقَفَ', 'نَامَ', 'دَعَا', 'طَوَى', 'وَقَى']
    expect(trainingTwo.items.map((item) => item.verb)).toEqual(expectedVerbs2)
    for (const item of trainingOne.items) {
      expect(sourceMarkdown).toContain(item.verb)
      expect([...TRAINING_ONE_OPTIONS]).toEqual(['صحيح', 'معتلّ'])
    }
    // خيارات كل بند من التدريب الثاني كما وردت (م7-8)
    expect([...trainingTwo.items[0].options]).toEqual([...TRAINING_TWO_OPTIONS])
    expect([...trainingTwo.items[1].options]).toEqual([...TRAINING_TWO_OPTIONS])
    expect([...trainingTwo.items[2].options]).toEqual([...TRAINING_TWO_OPTIONS])
    expect([...trainingTwo.items[3].options]).toEqual([...TRAINING_TWO_TAWA_OPTIONS])
    expect([...trainingTwo.items[4].options]).toEqual([...TRAINING_TWO_WAQA_OPTIONS])
    for (const option of [...TRAINING_TWO_OPTIONS, ...TRAINING_TWO_TAWA_OPTIONS, ...TRAINING_TWO_WAQA_OPTIONS]) {
      expect(sourceMarkdown).toContain(option)
    }
    // الزران كما ورد عنواناهما، والمدموج في المصدر
    expect(sourceMarkdown).toContain(trainingControls.revealLabel)
    expect(sourceMarkdown).toContain(trainingControls.retryLabel)
    expect(sourceMarkdown).toContain('إظهار الإجابات والتصحيحإعادة التدريبات')
    // إجابات التدريبين (تُشتق من مواضع المصدر)
    expect(trainingOne.items.map((item) => item.answer)).toEqual([
      'صحيح',
      'معتلّ',
      'معتلّ',
      'صحيح',
      'معتلّ',
      'صحيح',
    ])
    expect(trainingTwo.items.map((item) => item.answer)).toEqual([
      'مثال',
      'أجوف',
      'ناقص',
      'لفيف مقرون',
      'لفيف مفروق',
    ])
  })
})

describe('morphology lesson 07 — test definition', () => {
  it('declares exactly 20 questions in 4 pages (5 per page) with unique ids q01–q20', () => {
    expect(testDefinition.pages).toHaveLength(4)
    expect(testDefinition.pages.map((page) => page.questions.length)).toEqual([5, 5, 5, 5])
    expect(questions).toHaveLength(20)
    expect(questions.map((q) => q.id)).toEqual([
      'q01', 'q02', 'q03', 'q04', 'q05',
      'q06', 'q07', 'q08', 'q09', 'q10',
      'q11', 'q12', 'q13', 'q14', 'q15',
      'q16', 'q17', 'q18', 'q19', 'q20',
    ])
    expect(questions.map((q) => q.number)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
    expect(testDefinition.matching).toBe('strict')
  })

  it('auto-grades every question as a single multiple-choice field with a model answer', () => {
    for (const q of questions) {
      expect(q.fields).toHaveLength(1)
      const field = q.fields[0]
      expect(field.kind).toBe('choice')
      if (field.kind !== 'choice') continue
      expect(field.options.length).toBeGreaterThanOrEqual(2)
      expect(field.options).toContain(field.answer)
      expect(field.options.filter((option) => option === field.answer)).toHaveLength(1)
      expect((q.solution ?? '').trim().length).toBeGreaterThan(0)
      expect(q.explanation?.trim().length ?? 0).toBeGreaterThan(0)
      expect(q.teacherAnswer?.trim().length ?? 0).toBeGreaterThan(0)
      expect(q.answerSource).toBe('platform')
    }
  })

  it('is deterministic: fixed page order, fixed question order, fixed option order', () => {
    expect(testDefinition.pages.map((page) => page.id)).toEqual([
      'morph7-concepts',
      'morph7-sahih',
      'morph7-muall',
      'morph7-analysis',
    ])
    // الصفحة الأولى مفاهيم، والثانية أنواع الصحيح، والثالثة أنواع المعتل، والرابعة تحليل.
    expect(questions[0].prompt).toContain('المعيار')
    expect(questions[5].prompt).toContain('سالم')
    expect(questions[10].prompt).toContain('مثال')
    expect(questions[15].prompt).toContain('وَعَدَ')
  })

  it('covers the lesson objectives across classification, roots, weak-letter position, and analysis', () => {
    const all = questions.map((q) => q.prompt + ' ' + q.fields.map((f) => ('options' in f ? f.options.join(' ') : '')).join(' ')).join(' ')
    // التصنيف الصحيح/المعتلّ وأنواعه
    for (const word of ['كَتَبَ', 'مَدَّ', 'سَأَلَ', 'وَعَدَ', 'قَالَ', 'رَمَى', 'طَوَى', 'وَقَى']) {
      expect(all, `test must exercise ${word}`).toContain(word)
    }
    // الأصول والهمزة والإدغام والموضع
    expect(all).toContain('ك ر م')
    expect(all).toContain('م د د')
    expect(all).toContain('يَقُولُ')
    expect(all).toContain('يَبِيعُ')
    expect(all).toContain('لفيف مفروق')
  })

  it('is written for this lesson: no question prompt copies a source training line (غ-8)', () => {
    for (const q of questions) {
      expect(sourceMarkdown, `question ${q.id} copies the source`).not.toContain(q.prompt)
    }
    // لا يُعاد استخدام نص خيارات التدريبات كأزواج (بند/خيار) في الأسئلة
    const trainingPairs = [
      ...trainingOne.items.map((item) => `${item.number}. ${item.verb}`),
      ...trainingTwo.items.map((item) => `${item.number}. ${item.verb}`),
    ]
    for (const pair of trainingPairs) {
      expect(sourceMarkdown).toContain(pair)
    }
  })
})

describe('morphology lesson 07 — morphological analysis of the source verbs', () => {
  it('classifies every source example with roots and a written reason', () => {
    expect(verbFacts.length).toBe(23)
    for (const fact of verbFacts) {
      expect(['صحيح', 'معتلّ']).toContain(fact.kind)
      expect(fact.roots.trim().length).toBeGreaterThan(0)
      expect(fact.reason.trim().length).toBeGreaterThan(0)
      expect(sourceMarkdown, `verb missing from the source: ${fact.word}`).toContain(fact.word)
    }
  })

  it('keeps the correct verbs in three subtypes and the weak verbs in four (اللفيف بقسميه)', () => {
    const sahih = verbFacts.filter((v) => v.kind === 'صحيح')
    const muall = verbFacts.filter((v) => v.kind === 'معتلّ')
    expect(sahih.map((v) => v.type).every((type) => (SAHIH_TYPES as readonly string[]).includes(type))).toBe(true)
    expect(muall.map((v) => v.type).every((type) => (MUALL_TYPES as readonly string[]).includes(type))).toBe(true)
    expect(sahih.filter((v) => v.type === 'سالم').map((v) => v.word)).toEqual([
      'كَتَبَ', 'جَلَسَ', 'فَتَحَ', 'فَهِمَ', 'دَحْرَجَ', 'أَكْرَمَ',
    ])
    expect(sahih.filter((v) => v.type === 'مهموز').map((v) => v.word)).toEqual(['أَخَذَ', 'سَأَلَ', 'قَرَأَ'])
    expect(sahih.filter((v) => v.type === 'مضعّف').map((v) => v.word)).toEqual(['مَدَّ', 'شَدَّ', 'زَلْزَلَ'])
    expect(muall.filter((v) => v.type === 'مثال').map((v) => v.word)).toEqual(['وَعَدَ', 'وَجَدَ', 'وَقَفَ'])
    expect(muall.filter((v) => v.type === 'أجوف').map((v) => v.word)).toEqual(['قَالَ', 'بَاعَ', 'نَامَ'])
    expect(muall.filter((v) => v.type === 'ناقص').map((v) => v.word)).toEqual(['دَعَا', 'رَمَى', 'سَعَى'])
    expect(muall.filter((v) => v.type === 'لفيف مقرون').map((v) => v.word)).toEqual(['طَوَى'])
    expect(muall.filter((v) => v.type === 'لفيف مفروق').map((v) => v.word)).toEqual(['وَقَى'])
  })

  it('derives the weak-letter origins from the مضارع, never from the written shape (ت-4)', () => {
    expect(factOf('قَالَ').weakOrigin).toContain('الواو')
    expect(factOf('بَاعَ').weakOrigin).toContain('الياء')
    expect(factOf('رَمَى').weakOrigin).toContain('الياء')
    expect(factOf('دَعَا').weakOrigin).toContain('الواو')
    expect(alifOriginSection.pairs.map((pair) => pair.word)).toEqual(['قَالَ', 'بَاعَ', 'رَمَى', 'دَعَا'])
    expect(alifOriginSection.pairs.map((pair) => pair.origin)).toEqual(['الواو', 'الياء', 'الياء', 'الواو'])
  })

  it('handles the five care verbs exactly as the lesson requires (ت-11)', () => {
    expect(factOf('أَكْرَمَ')).toMatchObject({ kind: 'صحيح', roots: 'ك ر م' })
    expect(factOf('أَكْرَمَ').reason).toContain('أَفْعَلَ')
    expect(factOf('وَعَدَ')).toMatchObject({ kind: 'معتلّ', type: 'مثال' })
    expect(factOf('مَدَّ')).toMatchObject({ kind: 'صحيح', type: 'مضعّف' })
    expect(factOf('رَمَى')).toMatchObject({ kind: 'معتلّ', type: 'ناقص' })
    expect(factOf('دَحْرَجَ')).toMatchObject({ kind: 'صحيح' })
    expect(careVerbs.items.map((item) => item.word)).toEqual([
      'أَكْرَمَ', 'وَعَدَ', 'مَدَّ', 'رَمَى', 'دَحْرَجَ',
    ])
  })

  it('treats مَدَّ and شَدَّ as إدغام of root letters, and keeps the hamza outside WEAK_LETTERS (ت-5، ت-7)', () => {
    expect(factOf('مَدَّ').roots).toBe('م د د')
    expect(factOf('شَدَّ').roots).toBe('ش د د')
    expect(factOf('مَدَّ').reason).toContain('إدغام')
    expect([...WEAK_LETTERS]).toEqual(['الألف', 'الواو', 'الياء'])
    expect(factOf('سَأَلَ').reason).toContain('أصلي')
  })

  it('throws on an unknown analysis id instead of returning undefined', () => {
    expect(() => factOf('unknown')).toThrow(/Unknown verb fact/)
  })
})

describe('morphology lesson 07 — the seven interactive activities agree with the audited data', () => {
  it('activity 1 places the weak letter of the four review words', () => {
    expect(labLetters.items.map((item) => item.answer)).toEqual(['في الأول', 'في الوسط', 'في الوسط', 'في الآخر'])
    expect(labLetters.items.map((item) => item.word)).toEqual(['وَعَدَ', 'قَالَ', 'بَاعَ', 'رَمَى'])
  })

  it('activity 2 picks the root letters first, then judges by the roots', () => {
    expect(labRoots.items.map((item) => item.roots)).toEqual(['ك ر م', 'و ع د', 'م د د', 'د ح ر ج'])
    expect(labRoots.items.map((item) => item.kind)).toEqual(['صحيح', 'معتلّ', 'صحيح', 'صحيح'])
    for (const item of labRoots.items) expect(item.rootOptions).toContain(item.roots)
  })

  it('activity 3 classifies the five correct verbs into the three source subtypes', () => {
    expect(labCorrectTypes.items.map((item) => item.answer)).toEqual(['سالم', 'مهموز', 'مضعّف', 'مضعّف', 'مهموز'])
    for (const item of labCorrectTypes.items) {
      expect(factOf(item.word).type).toBe(item.answer)
    }
  })

  it('activity 4 reads the origin from the مضارع for four verbs', () => {
    expect(labAlif.items.map((item) => item.answer)).toEqual(['الواو', 'الياء', 'الياء', 'الواو'])
    expect(labAlif.items.map((item) => item.mudari)).toEqual(['يَقُولُ', 'يَبِيعُ', 'يَرْمِي', 'يَدْعُو'])
  })

  it('activity 5 locates the weak letter to pick the type', () => {
    expect(labPosition.items.map((item) => item.answer)).toEqual([
      'مثال', 'أجوف', 'ناقص', 'لفيف مقرون', 'لفيف مفروق',
    ])
    for (const item of labPosition.items) {
      expect(factOf(item.word).type).toBe(item.answer)
    }
  })

  it('activity 6 compares similar-looking pairs with a written reason', () => {
    expect(labPairs.items).toHaveLength(3)
    expect(labPairs.items[0].pairs.map((pair) => pair.answer)).toEqual(['مثال', 'لفيف مفروق'])
    expect(labPairs.items[1].pairs.map((pair) => pair.answer)).toEqual(['أجوف', 'أجوف'])
    expect(labPairs.items[2].pairs.map((pair) => pair.answer)).toEqual(['صحيح مضعّف', 'معتلّ ناقص'])
    for (const item of labPairs.items) {
      expect(item.whyOptions).toContain(item.whyAnswer)
      for (const pair of item.pairs) expect(item.options).toContain(pair.answer)
    }
  })

  it('activity 7 judges the four common-mistake claims with a written correction', () => {
    expect(labMistakes.items.map((item) => item.verdict)).toEqual(['خطأ', 'خطأ', 'خطأ', 'صحيح'])
    for (const item of labMistakes.items) {
      expect(labMistakes.options).toContain(item.verdict)
      expect(item.correction.trim().length).toBeGreaterThan(0)
    }
    // أسئلة الأخطاء الشائعة كلها من نص المصدر نفسه.
    for (const mistake of mistakesSection.items) {
      expect(sourceMarkdown).toContain(mistake.question)
    }
  })
})

describe('morphology lesson 07 — teacher material', () => {
  it('references the saved source file and the audit report', () => {
    expect(teacherKeyHeader).toContain('docs/source/morphology-lesson-07.md')
    expect(teacherKeyHeader).toContain('docs/morphology-lesson-07-audit.md')
  })

  it('carries keys for the seven activities, ten rules, seven mistakes and five audit notes', () => {
    expect(teacherLabKeys).toHaveLength(7)
    expect(teacherRuleExplanations).toHaveLength(10)
    expect(teacherMistakes).toHaveLength(7)
    expect(teacherAuditNotes).toHaveLength(5)
    expect(teacherContentMap).toHaveLength(9)
    expect(teacherVerbTableNote.length).toBeGreaterThan(0)
    expect(teacherAnalysisNote.length).toBeGreaterThan(0)
  })

  it('gives every training item an explanation and every verb a teacher reason', () => {
    for (const item of [...trainingOne.items, ...trainingTwo.items]) {
      expect(item.explanation.trim().length).toBeGreaterThan(0)
    }
    for (const item of trainingTwo.items) {
      expect(item.teacherKey).toContain(item.verb)
      expect(item.teacherKey).toContain(item.answer)
    }
  })

  it('records the scope limits: no lesson 8 and no unit test', () => {
    expect(nextLessonSection.scopeNote).toContain('لم يُبنَ الدرس الثامن')
    expect(teacherAuditNotes.join(' ')).toContain('اختبار الوحدة لم يُنشأ')
  })
})

describe('morphology lesson 07 — display helpers', () => {
  it('keeps the closing recap card consistent with the audited analyses', () => {
    for (const row of summarySection.recap.rows) {
      const fact = factOf(row.example)
      expect(fact.type).toBe(row.type)
      expect(row.kind).toBe(fact.kind === 'صحيح' ? 'الصحيح' : 'المعتلّ')
    }
  })

  it('renders Arabic-Indic digits for display only', () => {
    expect(arabicDigits(7)).toBe('٧')
    expect(arabicDigits('q12')).toBe('q١٢')
  })
})
