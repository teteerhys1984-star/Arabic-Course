/**
 * اختبارات طبقة المصدر للدرس الثاني من قسم الصرف (الميزان الصرفي).
 *
 * تتحقق من:
 *  - نقل أهداف الدرس الثمانية وأقسامه الاثني عشر كما وردت في
 *    docs/source/morphology-lesson-02.md؛
 *  - إعادة تركيب الجداول الثلاثة (م-1) بلا صفوف مكررة؛
 *  - التدريبات الخمسة بعدد بنودها ومفاتيحها (١٥/١٠/٥/٦/٨)؛
 *  - بنية الاختبار: ٤ صفحات، ٢٦ سؤالًا، ٣٠ درجة (٢٦ آلية + ٤ يدوية)؛
 *  - تطبيق التصحيحات المعتمدة (خ-1 … خ-4) وغياب النص الخاطئ؛
 *  - توحيد ضبط الأوزان (ض-1، ض-2) في المتن والتدريبات والاختبار والمفاتيح؛
 *  - وسم إضافات المنصة وسمًا صريحًا لا يُنسب إلى المصدر.
 */
import { describe, expect, it } from 'vitest'
import * as C from './content'
import { testDefinition } from './content'

/** كل نصوص الطبقة في سلسلة واحدة، لفحص absence/presence النصية. */
const dump = JSON.stringify(
  Object.entries(C)
    .filter(([, value]) => typeof value !== 'function')
    .map(([, value]) => value),
)

/**
 * نصوص الطالب وحدها (بلا سجلَّي التدقيق والتوضيحات): فالتصحيحات المعتمدة تذكر النص
 * الخاطئ صراحةً لتوثيق سبب استبداله، ولذلك يُفحص غيابه عن مادة الطالب لا عن السجل.
 */
const studentDump = JSON.stringify(
  Object.entries(C)
    .filter(([, value]) => typeof value !== 'function')
    .filter(([name]) => !['platformClarifications', 'inlineClarifications'].includes(name))
    .map(([, value]) => value),
)

const haraka = /[\u064B-\u065F\u0670]/

describe('morphology lesson 02 — source fidelity', () => {
  it('carries the eight lesson objectives verbatim', () => {
    expect(C.objectives).toHaveLength(8)
    expect([...C.objectives]).toEqual([
      'تعريف الميزان الصرفي وشرح فائدته.',
      'فهم سبب اتخاذ «فَعَلَ» نموذجًا لوزن الكلمات.',
      'وزن الكلمات الثلاثية والرباعية والخماسية.',
      'التمييز بين الحروف الأصلية والحروف الزائدة.',
      'معرفة مواضع الزيادة في الأفعال والأسماء.',
      'وزن الكلمات التي تحتوي على تضعيف أو همزة أو حروف علة.',
      'تحليل العلاقة بين وزن الكلمة ومعناها الصرفي.',
      'اكتشاف الأخطاء الشائعة في وزن الكلمات.',
    ])
  })

  it('keeps the twelve source sections and their headings', () => {
    const headings = [
      C.sarfDefinition.heading,
      C.mizanDefinition.heading,
      C.originalLetters.heading,
      C.extraLetters.heading,
      C.increaseLetters.heading,
      C.triliteral.heading,
      C.quadriliteral.heading,
      C.increasedWords.heading,
      C.nouns.heading,
      C.doubling.heading,
      C.hamzaAndWeak.heading,
      C.testIntro.heading,
    ]
    expect(headings).toHaveLength(12)
    for (const heading of headings) expect(dump).toContain(heading)
    expect(C.trainingOne.title).toBe('التدريب الأول: زن الكلمات الآتية')
    expect(C.trainingFive.title).toBe('التدريب الخامس: حلّل الكلمات في سياقها')
    expect(C.nextLesson.title).toBe('الدرس الثالث في قسم الصرف: الفعل المجرّد والمزيد')
  })

  it('rebuilds the three flattened source tables without the duplicated row (م-1)', () => {
    // جدول الثلاثي المجرد: ستة صفوف (حُذف الصف المكرر «كَتَبَ | فَعَلَ»).
    expect(C.triliteral.table).toHaveLength(6)
    const triliteralKeys = C.triliteral.table.map((row) => `${row.word}|${row.weight}`)
    expect(new Set(triliteralKeys).size).toBe(6)
    expect(triliteralKeys).toContain('فَهِمَ|فَعِلَ')

    // جدول الأسماء الثلاثية: خمسة صفوف.
    expect(C.nouns.table).toHaveLength(5)
    expect(C.nouns.table.map((row) => row.weight)).toEqual(['فَعَل', 'فَعَل', 'فِعَال', 'فِعْل', 'فَعْل'])

    // جدول الأسماء المزيدة: خمسة صفوف بأصولها.
    expect(C.nouns.moreTable).toHaveLength(5)
    expect(C.nouns.moreTable.map((row) => row.root)).toEqual(['ك ت ب', 'ك ت ب', 'د ر س', 'ع ل م', 'خ ر ج'])
  })

  it('keeps the five trainings with their source item counts and keys', () => {
    expect(C.trainingOne.items).toHaveLength(15)
    expect(C.trainingTwo.items).toHaveLength(10)
    expect(C.trainingThree.items).toHaveLength(5)
    expect(C.trainingFour.items).toHaveLength(6)
    expect(C.trainingFive.items).toHaveLength(8)

    for (const item of C.trainingOne.items) expect(item.teacherKey.trim().length).toBeGreaterThan(0)
    for (const item of C.trainingTwo.items) expect(item.teacherKey.trim().length).toBeGreaterThan(0)
    for (const item of C.trainingFour.items) expect(item.teacherKey.trim().length).toBeGreaterThan(0)
    for (const item of C.trainingFive.items) expect(item.teacherKey.trim().length).toBeGreaterThan(0)

    // مفاتيح التدريب الثالث كما وردت: ب، ب، ج، ب، ب.
    expect(C.trainingThree.items.map((item) => item.teacherKey)).toEqual(['ب.', 'ب.', 'ج.', 'ب.', 'ب.'])
    expect(C.trainingThree.items.map((item) => item.answer)).toEqual([
      'فاعِل',
      'مَفْعول',
      'فَعْلَلَ',
      'غ ف ر',
      'تَفَعَّلَ',
    ])

    // كل كلمة في التدريب الأول لها خيارات وزن، ووزنها بينها.
    for (const item of C.trainingOne.items) {
      expect(item.options.length).toBeGreaterThanOrEqual(3)
      expect([...item.options]).toContain(item.weight)
      expect(item.rows.length).toBeGreaterThan(0)
    }
  })
})

describe('morphology lesson 02 — approved corrections (خ-1 … خ-4)', () => {
  it('خ-1: keys فَهِمَ as فَعِلَ in the final test, never as فَعَلَ', () => {
    const question = testDefinition.pages[1].questions[1]
    expect(question.prompt).toContain('فَهِمَ')
    const field = question.fields[0]
    expect(field.kind === 'select' && field.answer).toBe('فَعِلَ')
    expect(C.teacherKeys.testPartTwo[1]).toBe('فَهِمَ: فَعِلَ.')
    expect(C.trainingOne.items[1].weight).toBe('فَعِلَ')
    expect(C.trainingOne.items[1].teacherKey).toBe('فَهِمَ: فَعِلَ.')
    expect(C.triliteral.table.map((row) => `${row.word}|${row.weight}`)).toContain('فَهِمَ|فَعِلَ')
    // لا يبقى المفتاح الخاطئ في أي مفتاح أو تدريب أو وزن معتمد.
    for (const line of C.teacherKeys.testPartTwo) expect(line).not.toBe('فهم: فعل.')
    // والتصحيح نفسه موثّق للطالب (في تفسير السؤال) وللمعلم (في سجل التدقيق).
    expect(question.rule).toContain('خ-1')
    expect(C.platformClarifications.some((note) => note.startsWith('خ-1') && note.includes('فهم: فعل'))).toBe(true)
  })

  it('خ-2: teaches that the تاء of كَتَبَ is an original letter (عين الكلمة)', () => {
    expect(C.extraLetters.contrastExamples[0]).toContain('حرف أصلي')
    expect(C.extraLetters.contrastExamples[0]).toContain('عين الكلمة')
    expect(studentDump).not.toContain('غير موجودة أصلًا')
  })

  it('خ-3: counts four extras in استغفار / استخراج (the second alef included)', () => {
    const istighfaar = C.increaseLetters.examples.find((line) => line.startsWith('اسْتِغْفار'))
    expect(istighfaar).toBeDefined()
    expect(istighfaar).toContain('الألف الثانية')
    expect(istighfaar).toContain('ألف المصدر')

    const extraction = C.trainingTwo.items.find((item) => item.word === 'اسْتِخْراج')
    expect(extraction).toBeDefined()
    expect(extraction?.extras).toHaveLength(4)
    expect(extraction?.extras).toEqual(['ا (الأولى)', 'س', 'ت', 'ا (الثانية)'])

    const testItem = testDefinition.pages[2].questions[0]
    const extras = testItem.fields[2]
    expect(extras.kind === 'multi' && extras.answers).toHaveLength(4)

    // الفعل نفسه يبقى بثلاث زوائد (لا تُخلط الصيغتان).
    const verb = C.trainingTwo.items.find((item) => item.word === 'اسْتَعْمَلَ')
    expect(verb?.extras).toHaveLength(3)
  })

  it('خ-4: replaces the unattested كَتِبَ with the verified حَسَبَ/حَسِبَ/حَسُبَ triple', () => {
    expect(studentDump).not.toContain('كَتِبَ')
    expect(C.platformClarifications.some((note) => note.startsWith('خ-4') && note.includes('كَتِبَ'))).toBe(true)
    expect(C.vowelTriple.items.map((row) => `${row.word}:${row.weight}`)).toEqual([
      'حَسَبَ:فَعَلَ',
      'حَسِبَ:فَعِلَ',
      'حَسُبَ:فَعُلَ',
    ])
    // المقابلة بين المعلوم والمجهول تبقى كما وردت في المصدر.
    expect(C.triliteral.compareLines).toEqual(['كَتَبَ: فَعَلَ.', 'كُتِبَ: فُعِلَ.'])
    expect(C.vowelTriple.source).toContain('المعجم الوسيط')
  })
})

describe('morphology lesson 02 — platform additions and unified voweling', () => {
  it('supplies the missing weights of the weak words (ف-3) and of مَسْؤول / مَفْعول (ف-4)', () => {
    const weak = Object.fromEntries(C.weakWeights.map((row) => [row.word, row]))
    expect(weak['قالَ']).toMatchObject({ root: 'ق و ل', weight: 'فَعَلَ', origin: 'واو' })
    expect(weak['باعَ']).toMatchObject({ root: 'ب ي ع', weight: 'فَعَلَ', origin: 'ياء' })
    expect(weak['رَمى']).toMatchObject({ root: 'ر م ي', weight: 'فَعَلَ', origin: 'ياء' })

    const mas2ool = testDefinition.pages[2].questions.find((question) => question.prompt.includes('مَسْؤول'))
    expect(mas2ool?.answerSource).toBe('platform')
    expect(mas2ool?.solution).toContain('س أ ل')
    const maf3ool = testDefinition.pages[2].questions.find((question) => question.prompt.includes('مَفْعول'))
    expect(maf3ool?.answerSource).toBe('platform')
    expect(maf3ool?.solution).toContain('ف ع ل')
  })

  it('labels every platform clarification explicitly (never attributed to the source)', () => {
    expect(C.platformClarifications.length).toBeGreaterThanOrEqual(20)
    for (const note of C.platformClarifications) {
      expect(note.length).toBeGreaterThan(20)
      // كل بند إمّا موثّق برقم تدقيق (خ/غ/ف/ض/ش/م) وإمّا منسوب صراحةً إلى المنصة.
      expect(/^[خغفضشم]-\d/.test(note) || /المنصة/.test(note), note).toBe(true)
    }
    // لا تُنسب إضافة إلى الكتاب أو إلى نص الدرس.
    expect(dump).not.toContain('من الكتاب')
    expect(C.inlineClarifications.marksPolicy).toContain('من إعداد المنصة')
    expect(C.inlineClarifications.marksPolicy).toContain('لا تُنسب إلى نص الدرس')
    expect(C.marksPolicy.notes.some((note) => note.includes('من إعداد المنصة'))).toBe(true)
  })

  it('vowels every weight used in the body, the trainings and the test (ض-1، ض-2)', () => {
    const canonical = new Set([
      'فَعَلَ',
      'فَعِلَ',
      'فَعُلَ',
      'فُعِلَ',
      'فاعِل',
      'فاعَلَ',
      'مَفْعول',
      'مِفْعَال',
      'مَفْعَلَة',
      'مِفْعَل',
      'أَفْعَلَ',
      'أَفْعَل',
      'أَفْعُل',
      'فَعَّلَ',
      'تَفَعَّلَ',
      'تَفَعُّل',
      'تَفاعَلَ',
      'تَفْعِيل',
      'افْتَعَلَ',
      'فَعْلَلَ',
      'فَعْلَلَة',
      'تَفَعْلَلَ',
      'اسْتَفْعَلَ',
      'اسْتِفْعَال',
      'انْفَعَلَ',
      'انْفِعال',
      'فِعَال',
      'فِعْل',
      'فَعَل',
      'فَعْل',
      'فِعْلال',
    ])

    // لا يجوز أن يظهر الوزن الواحد بضبطين مختلفين (ض-1).
    expect(studentDump).not.toContain('مَفْعُول')
    expect(studentDump).not.toContain('تَفَاعَلَ')
    expect(studentDump).not.toContain('فَاعَلَ')

    // أوزان التدريب الأول كلها مضبوطة ومن القائمة الموحّدة.
    for (const item of C.trainingOne.items) {
      expect(canonical.has(item.weight), item.weight).toBe(true)
      for (const option of item.options) expect(canonical.has(option), option).toBe(true)
    }

    // أوزان الاختبار (القسم الثاني) كلها مضبوطة؛ فلا يجوز وزن بلا حركات.
    for (const question of testDefinition.pages[1].questions) {
      const field = question.fields[0]
      expect(field.kind).toBe('select')
      if (field.kind !== 'select') continue
      expect(haraka.test(field.answer), field.answer).toBe(true)
      for (const option of field.options) expect(haraka.test(option), option).toBe(true)
      expect(canonical.has(field.answer), field.answer).toBe(true)
    }

    // أوزان تحليل القسم الثالث مضبوطة كذلك.
    for (const question of testDefinition.pages[2].questions) {
      const weightField = question.fields.find((field) => field.label?.startsWith('الوزن'))
      expect(weightField?.kind).toBe('select')
      if (weightField?.kind !== 'select') continue
      expect(haraka.test(weightField.answer)).toBe(true)
    }

    // جذور الحقول النصية حروف بلا حركات (لا يُطلب ضبطها).
    for (const question of testDefinition.pages[2].questions) {
      const rootField = question.fields.find((field) => field.label?.startsWith('الجذر'))
      expect(rootField?.kind).toBe('text')
    }
  })
})

describe('morphology lesson 02 — the final test (٣٠ درجة)', () => {
  it('declares four pages, 26 questions numbered 1–26, and unique ids', () => {
    expect(testDefinition.id).toBe('morphology-lesson-02-test')
    expect(testDefinition.matching).toBe('strict')
    expect(testDefinition.pages).toHaveLength(4)
    expect(testDefinition.pages.map((page) => page.id)).toEqual([
      'morph2-definitions',
      'morph2-weights',
      'morph2-analysis',
      'morph2-errors',
    ])

    const questions = testDefinition.pages.flatMap((page) => page.questions)
    expect(questions).toHaveLength(26)
    expect(questions.map((question) => question.number)).toEqual(
      Array.from({ length: 26 }, (_, index) => index + 1),
    )
    expect(new Set(questions.map((question) => question.id)).size).toBe(26)
    expect(questions.map((question) => question.id)).toEqual(C.testQuestions.map((question) => question.id))

    // كل صفحة تحمل درجاتها في عنوانها (م-2).
    expect(testDefinition.pages[0].title).toContain('٥ درجات')
    expect(testDefinition.pages[1].title).toContain('١٠ درجات')
    expect(testDefinition.pages[2].title).toContain('١٠ درجات')
    expect(testDefinition.pages[3].title).toContain('٥ درجات')
  })

  it('gives every question a displayable key (source or platform-labelled)', () => {
    const questions = testDefinition.pages.flatMap((page) => page.questions)
    for (const question of questions) {
      const solved =
        Boolean(question.solution?.trim()) ||
        Boolean(question.teacherAnswer?.trim()) ||
        question.fields.some((field) => field.kind !== 'essay')
      expect(solved, `question ${question.id}`).toBe(true)
      expect(['source', 'platform']).toContain(question.answerSource)
    }
    // السؤالان المقاليان لهما جواب المعلّم وجواب المصدر.
    for (const id of ['q01', 'q02']) {
      const question = questions.find((item) => item.id === id)
      expect(question?.teacherAnswer?.trim().length).toBeGreaterThan(10)
      expect(question?.sourceAnswer?.trim().length).toBeGreaterThan(10)
      expect(question?.revealEssaySolution).toBeUndefined()
    }
  })

  it('keeps the source’s general key for القسم الثالث and adds per-word platform keys', () => {
    expect(C.testPartThreeKeySource).toContain('تُقبل الإجابات التي تذكر الجذر الصحيح')
    expect(C.analysisKeys).toHaveLength(8)
    for (const key of C.analysisKeys) expect(key.length).toBeGreaterThan(15)
  })

  it('states the marks policy: 5 + 10 + 10 + 5 = 30, with 26 automatic and 4 manual', () => {
    expect(C.marksPolicy.pages.map((page) => page.marks)).toEqual([5, 10, 10, 5])
    expect(C.marksPolicy.pages.reduce((sum, page) => sum + page.marks, 0)).toBe(30)
    expect(C.marksPolicy.pages.reduce((sum, page) => sum + page.auto, 0)).toBe(26)
    expect(C.marksPolicy.pages.reduce((sum, page) => sum + page.manual, 0)).toBe(4)
    expect(C.marksPolicy.total).toBe(30)
    expect(C.marksPolicy.notes.some((note) => note.includes('أول خمس كلمات'))).toBe(true)
    expect(testDefinition.pages[2].description).toContain('أول خمس كلمات')
    expect(C.teacherKeys.testPartOne).toHaveLength(3)
    expect(C.teacherKeys.testPartTwo).toHaveLength(10)
    expect(C.teacherKeys.testPartFour).toHaveLength(5)
  })
})

describe('morphology lesson 02 — verbatim source lines in the content layer', () => {
  it('يحفظ عنوانَي القسمين: الأهداف والتدريبات', () => {
    expect(C.objectivesHeading).toBe('أولًا: أهداف الدرس')
    expect(C.trainingsHeading).toBe('القسم الحادي عشر: تدريبات تطبيقية')
  })

  it('يحفظ عناوين أقسام الاختبار وتعليماتها كما وردت', () => {
    expect(C.testSections.map((section) => section.heading)).toEqual([
      'القسم الأول: التعريف والفهم — 5 درجات',
      'القسم الثاني: الوزن الصرفي — 10 درجات',
      'القسم الثالث: التحليل — 10 درجات',
      'القسم الرابع: اكتشاف الخطأ — 5 درجات',
    ])
    expect(C.testSections.map((section) => section.instruction)).toEqual([
      '',
      'زن الكلمات الآتية:',
      'حلّل خمس كلمات من الكلمات الآتية، وحدّد أصلها ووزنها وحروف الزيادة فيها:',
      'صحّح العبارات الآتية، واذكر السبب:',
    ])
    for (const section of C.testSections) {
      const page = C.testDefinition.pages.find((candidate) => candidate.id === section.id)
      expect(page, section.heading).toBeDefined()
      expect(page?.title ?? '').toContain(section.heading.split(' — ')[0])
      if (section.instruction) {
        expect(page?.description ?? '').toContain(section.instruction.slice(0, -1))
      }
    }
  })

  it('يحفظ القاعدة الذهبية والتنبيه المهم بسطرَيهما الكاملَين', () => {
    expect(C.goldenRule.startsWith('قاعدة ذهبية: ')).toBe(true)
    expect(C.goldenRule).toContain('لا تزن الكلمة بمجرد عدّ حروفها')
    expect(C.extraLetters.warning.startsWith('تنبيه مهم: ')).toBe(true)
    expect(C.extraLetters.warning).toContain('بل نحلّل بنية الكلمة نفسها')
  })

  it('يحفظ سطر حروف الزيادة كما ورد (هـ ← ه)', () => {
    expect(C.increaseLetters.lettersLine).toBe('س، أ، ل، ت، م، و، ن، ي، ه، ا.')
    expect(C.increaseLetters.lettersLine).not.toContain('هـ')
  })

  it('يحفظ أسطر الأمثلة بصيغة «كلمة: وزن/حروف»', () => {
    expect(C.benefitTwo.meanings).toEqual([
      'عَلِمَ: عرف.',
      'عَلَّمَ: جعل غيره يعلم.',
      'أَعْلَمَ: أخبر غيره أو جعله على علم بشيء.',
    ])
    expect(C.benefitThree.compareLines[2]).toContain('إذا استُعمل بهذا المعنى في سياق مناسب')
    expect(C.originalLetters.examples).toEqual([
      'كَتَبَ: ك، ت، ب.',
      'دَرَسَ: د، ر، س.',
      'فَهِمَ: ف، ه، م.',
      'دَحْرَجَ: د، ح، ر، ج.',
    ])
    expect(C.quadriliteral.moreLines).toEqual(['زَلْزَلَ: فَعْلَلَ.', 'وَسْوَسَ: فَعْلَلَ.', 'بَعْثَرَ: فَعْلَلَ.'])
  })
})

describe('morphology lesson 02 — post-review fixes (E1, E2, توحيد التسمية وقبول الإجابة)', () => {
  /** عدد الرسوم المكتوبة لكل كلمة (بلا اعتبار للشدة). */
  const writtenGlyphs: Record<string, string[]> = {
    كَتَبَ: ['ك', 'ت', 'ب'],
    أَكْرَمَ: ['أ', 'ك', 'ر', 'م'],
    عَلَّمَ: ['ع', 'ل', 'م'],
    تَعَلَّمَ: ['ت', 'ع', 'ل', 'م'],
    'انْطَلَقَ': ['ا', 'ن', 'ط', 'ل', 'ق'],
    'اسْتَغْفَرَ': ['ا', 'س', 'ت', 'غ', 'ف', 'ر'],
    دَحْرَجَ: ['د', 'ح', 'ر', 'ج'],
    تَدَحْرَجَ: ['ت', 'د', 'ح', 'ر', 'ج'],
  }
  /** الكلمات التي يُحسب فيها الحرف المشدّد حرفين في العدّ الصرفي. */
  const doubled = new Set(['عَلَّمَ', 'تَعَلَّمَ'])

  it('E1: يحسب الحرف المشدّد حرفين في كل صفوف جدول العدّ الصرفي', () => {
    expect(C.letterCounts.map((row) => [row.word, row.letters, row.roots])).toEqual([
      ['كَتَبَ', 3, 3],
      ['أَكْرَمَ', 4, 3],
      ['عَلَّمَ', 4, 3],
      ['تَعَلَّمَ', 5, 3],
      ['انْطَلَقَ', 5, 3],
      ['اسْتَغْفَرَ', 6, 3],
      ['دَحْرَجَ', 4, 4],
      ['تَدَحْرَجَ', 5, 4],
    ])

    for (const row of C.letterCounts) {
      const glyphs = writtenGlyphs[row.word]
      expect(glyphs, `عدد الرسوم المكتوبة لـ${row.word}`).toBeDefined()
      // العدّ الصرفي = عدد الرسوم + حرف واحد عن كل تضعيف.
      expect(row.letters, `العدّ الصرفي لـ${row.word}`).toBe(glyphs.length + (doubled.has(row.word) ? 1 : 0))
      expect(row.roots, `أصول ${row.word}`).toBeLessThanOrEqual(row.letters)
      expect(row.roots, `أصول ${row.word}`).toBeGreaterThanOrEqual(3)
    }

    // التاء الزائدة وحدها هي الفرق بين عَلَّمَ وتَعَلَّمَ بعد احتساب التضعيف في كليهما.
    const rowOf = (word: string) => C.letterCounts.find((row) => row.word === word)
    expect(rowOf('تَعَلَّمَ')?.letters).toBe((rowOf('عَلَّمَ')?.letters ?? 0) + 1)
  })

  it('E1: يوضح اصطلاح العدّ بجوار الجدول ويفصله عن الرسم المكتوب', () => {
    expect(C.letterCountsConvention).toContain('يُحسب الحرف المشدّد حرفين')
    expect(C.letterCountsConvention).toContain('ع، ل، ل، م')
    expect(C.letterCountsConvention).toContain('ت، ع، ل، ل، م')
    // حتى لا يظن الطالب أن الشدة حرف مستقل في الكتابة.
    expect(C.letterCountsConvention).toContain('وليست حرفًا مستقلًّا يُكتب')
    expect(C.letterCountsConvention).toContain('صرفي لا إملائي')
  })

  it('E2: لا يصف واو «وَعَدَ» بالسكون، ويُبقي الحكم الصرفي الصحيح', () => {
    const wa3ada = C.weakLab.find((item) => item.word === 'وَعَدَ')
    expect(wa3ada).toBeDefined()
    expect(wa3ada?.note).not.toContain('ساكنة')
    expect(wa3ada?.note).toContain('فاء الكلمة')
    expect(wa3ada?.note).toContain('أصلية')
    expect(wa3ada?.note).toContain('لم يقع فيها إعلال')
    expect(wa3ada?.answer).toBe('لا إعلال')
    // الحكم نفسه في متن الدرس بلا وصف خاطئ.
    expect(JSON.stringify(C.weakLab) + JSON.stringify(C.weakWeights)).not.toContain('ساكنة الحركة')
  })

  it('يبقي توضيح اصطلاح العدّ متّسقًا مع الجدول ومثالَي التضعيف (المشدّد حرفان)', () => {
    /** تعداد الحروف في العدّ الصرفي، مشتقٌّ من الكلمة نفسها: الشدة تكرار للحرف الذي قبلها. */
    const countedLetters = (word: string) => {
      const chars = [...word]
      const out: string[] = []
      chars.forEach((char) => {
        // الشدة → تكرار آخر حرف مدفوع (ترتيب الحركة والشدة في النص قد يختلف).
        if (char === '\u0651') return void (out.length > 0 && out.push(out[out.length - 1]))
        if (/[\u064B-\u065F\u0670\u0640]/.test(char)) return // بقية الحركات والتطويل لا تُعدّ
        out.push(char)
      })
      return out
    }
    const numberWord: Record<number, string> = { 3: 'ثلاثة', 4: 'أربعة', 5: 'خمسة', 6: 'ستة' }
    const doubledWords = ['عَلَّمَ', 'تَعَلَّمَ'] as const

    for (const word of doubledWords) {
      const letters = countedLetters(word)
      const row = C.letterCounts.find((item) => item.word === word)
      // الجدول نفسه: العدد الصرفي = طول التعداد (أي المشدّد حرفان).
      expect(row?.letters, `${word} في الجدول`).toBe(letters.length)
      expect(letters.length, `${word}: تعداد المشتقّ`).toBe([...word.replace(/[\u064B-\u065F\u0670]/g, '')].length + 1)
      // والتوضيح الملاصق للجدول يذكر العدد والتعداد نفسيهما، فلا ينفصل أحدهما عن الآخر.
      const note = C.letterCountsConvention.slice(C.letterCountsConvention.indexOf(`«${word}»`))
      expect(note.slice(0, 80), `توضيح ${word}`).toContain(numberWord[letters.length])
      expect(note.slice(0, 80), `تعداد ${word} في التوضيح`).toContain(letters.join('، '))
    }
    expect(countedLetters('عَلَّمَ').join('، ')).toBe('ع، ل، ل، م')
    expect(countedLetters('تَعَلَّمَ').join('، ')).toBe('ت، ع، ل، ل، م')

    // بقية الصفوف بلا تضعيف: العدد الصرفي = عدد الرسوم، ولا شدة في الكلمة.
    for (const row of C.letterCounts) {
      if ((doubledWords as readonly string[]).includes(row.word)) continue
      expect([...row.word].includes('\u0651'), `${row.word} بلا شدة`).toBe(false)
      expect(row.letters, `${row.word} بلا تضعيف`).toBe(countedLetters(row.word).length)
    }
  })

  it('يوحّد تسمية حقل الزوائد في أسئلة التحليل الثمانية، ويبيّن درجة حقل الأصل', () => {
    const analysis = C.testDefinition.pages.find((page) => page.id === 'morph2-analysis')
    expect(analysis).toBeDefined()
    for (const question of analysis?.questions ?? []) {
      const extras = question.fields.find((field) => (field.label ?? '').startsWith('الحروف الزائدة'))
      expect(extras?.label, `q${question.number}`).toBe('الحروف الزائدة (نصف درجة)')
    }
    const weakWords = (analysis?.questions ?? []).filter((question) => /قالَ|باعَ/.test(question.prompt))
    expect(weakWords).toHaveLength(2)
    for (const question of weakWords) {
      const origin = question.fields.find((field) => (field.label ?? '').startsWith('الألف الظاهرة'))
      expect(origin?.label).toBe('الألف الظاهرة أصلها (شرط نيل درجة الوزن)')
      // أربعة حقول: جذر (٠٫٥) + وزن (١) + زوائد (٠٫٥) + أصل الألف (شرط).
      expect(question.fields).toHaveLength(4)
    }
  })

  it('يقبل اسم عبارة «سألتمونيها» بصيغها، ولا يقبل تعداد حروفها بدل اسمها', () => {
    const question = C.testQuestions.find((item) => item.number === 3)
    const field = question?.fields[0]
    expect(field?.kind).toBe('text')
    if (field?.kind !== 'text') throw new Error('expected a text field')
    // مفتاح المصدر يبقى أولًا؛ فهو ما يُعرض جوابًا نموذجيًّا.
    expect(field.accept[0]).toBe('سألتمونيها')
    expect(field.accept).toEqual(['سألتمونيها', 'عبارة سألتمونيها', 'حروف سألتمونيها'])
    // تعداد الحروف ليس جوابًا عن «ما العبارة المشهورة؟».
    expect(field.accept).not.toContain('س، أ، ل، ت، م، و، ن، ي، ه، ا')
    expect(field.accept.every((item) => item.includes('سألتمونيها'))).toBe(true)
  })
})
