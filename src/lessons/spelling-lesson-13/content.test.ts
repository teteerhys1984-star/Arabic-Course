import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { answerKey, gradePage } from '../../shared/test'
import { lessonRegistry } from '../registry'
import {
  objectives,
  sections,
  waslExamples,
  faslExamples,
  mimmanNote,
  maRules,
  memoryTable,
  maContrast,
  easyRule,
  inshallahAnalysis,
  inshaExamples,
  inshallahCompare,
  quickDrill,
  lasiyyamaExamples,
  kullamaConnected,
  kullamaCompare,
  commonStructures,
  methodSteps,
  commonErrors,
  summaryRules,
  selfCheck,
  homeworkCorrection,
  homeworkCorrectionModel,
  homeworkParagraphTopic,
  homeworkParagraphRequirements,
  homeworkSelfReview,
  homeworkParagraphModel,
  homeworkGradingGuide,
  practice,
  examQuestions,
  testDefinition,
} from './content'

const spellingLessonIds = [
  'spelling-lesson-01',
  'spelling-lesson-02',
  'spelling-lesson-03',
  'spelling-lesson-04',
  'spelling-lesson-05',
  'spelling-lesson-06',
  'spelling-lesson-07',
  'spelling-lesson-08',
  'spelling-lesson-09',
  'spelling-lesson-10',
  'spelling-lesson-11',
  'spelling-lesson-12',
  'spelling-lesson-13',
]

/** مفاتيح الاختبار المستقل العشرون كما في نموذج إجابة المصدر (بعد تكييف ت-٥ الموثّق). */
const expectedExamAnswers = [
  'إن شاء الله',
  'لا سيّما',
  'عمَّ',
  'كلّما اجتهدتَ، تقدّمتَ.',
  'فيمَ تفكّر؟',
  'سأذهب إلى المدرسة إن شاء الله.',
  'أحبّ القراءة، ولا سيّما القصص.',
  'عمَّ تسأل؟',
  'كلّما تدربتَ أكثر، تحسّن أداؤك.',
  'فيمَ تبحث؟',
  'فيمَ',
  'ثلاث (إن شاء الله)',
  'لا، سيّما',
  'التكرار أو الربط بين حدثين متكررين',
  'جميع الأشياء التي',
  'سأكمل واجبي اليوم إن شاء الله.',
  'أحبّ المواد الدراسية، ولا سيّما اللغة العربية.',
  'فيمَ تفكّر؟',
  'كلّما قرأتُ أكثر، تعلّمتُ أكثر.',
  'قرأتُ كلّ ما كتبه المعلّم.',
]

describe('spelling lesson 13 — content, source coverage, and reviewed keys', () => {
  it('registers the thirteenth spelling lesson in order and creates no fourteenth lesson or unit test', () => {
    const spellingLessons = lessonRegistry.filter((lesson) => lesson.sectionId === 'spelling')
    expect(spellingLessons.map((lesson) => lesson.id)).toEqual(spellingLessonIds)
    expect(spellingLessons[12]).toMatchObject({
      id: 'spelling-lesson-13',
      sectionId: 'spelling',
      number: '١٣',
      available: true,
      strand: 'الإملاء',
      title: 'الوصل والفصل في الكتابة',
    })
    expect(lessonRegistry.some((lesson) => lesson.id === 'spelling-lesson-13' && lesson.sectionId !== 'spelling')).toBe(false)
    expect(
      lessonRegistry.some((lesson) => lesson.id === 'spelling-lesson-14' || lesson.id.includes('unit')),
    ).toBe(false)
  })

  it('stays independent from the other section-local lesson 13s', () => {
    expect(lessonRegistry.filter((lesson) => lesson.id === 'lesson-13')).toHaveLength(1)
    expect(lessonRegistry.filter((lesson) => lesson.id === 'morphology-lesson-13')).toHaveLength(1)
    expect(lessonRegistry.filter((lesson) => lesson.id === 'spelling-lesson-13')).toHaveLength(1)
    const titles = new Set(
      ['lesson-13', 'morphology-lesson-13', 'spelling-lesson-13'].map(
        (id) => lessonRegistry.find((lesson) => lesson.id === id)?.title,
      ),
    )
    expect(titles.size).toBe(3)
  })

  it('preserves the source and leaves every previous teaching file byte-identical', () => {
    const inventory = JSON.parse(readFileSync('docs/spelling-lesson-13-source-inventory.json', 'utf8'))
    const hash = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex')

    expect(hash('docs/source/spelling-lesson-13.md')).toBe(inventory.sourceSha256)
    expect(Object.keys(inventory.previousContentSha256).length).toBeGreaterThan(40)
    for (const [path, sha] of Object.entries(inventory.previousContentSha256)) {
      expect(hash(path), `previous teaching file changed: ${path}`).toBe(sha)
    }

    const content = readFileSync('src/lessons/spelling-lesson-13/content.ts', 'utf8')
    for (const item of inventory.coverage) {
      for (const term of item.terms) {
        expect(content, `coverage: ${term}`).toContain(term)
      }
    }
  })

  it('retains the source teaching sections, objectives, and summary', () => {
    expect(sections).toHaveLength(14)
    expect(sections.every((section) => section.paragraphs.length > 0)).toBe(true)
    expect(sections.map((section) => section.paragraphs.join(' ').length).reduce((a, b) => a + b, 0)).toBeGreaterThan(4000)
    expect(objectives).toHaveLength(5)
    // التمهيد بالأمثلة الستة من المصدر.
    expect(sections[0].paragraphs[0]).toContain('ممَّنْ تعلّمتَ؟')
    expect(sections[0].paragraphs[0]).toContain('لا سيّما المجتهدون')
    // القاعدة الذهبية من المصدر.
    expect(sections[0].paragraphs[3]).toContain('يتبعان القواعد الإملائية، وليس النطق وحده')
    // الخلاصة وجملة الختام من المصدر.
    expect(sections[11].paragraphs[0]).toContain('إن شاء الله ثلاث كلمات منفصلة')
    expect(sections[11].paragraphs[1]).toContain('انتهى الدرس الثالث عشر من قسم الإملاء')
    // التحقق الذاتي بفروقه الثلاثة.
    expect(selfCheck.map((item) => item.pair)).toEqual([
      'إن شاء الله / إنشاء الله',
      'كلّما / كلّ ما',
      'عمَّ تبحث؟ / تحدّثتُ عمّا قرأتُه',
    ])
  })

  it('keeps the reviewed wasl/fasl classification with mimman distinguished', () => {
    // ت-١: «كلّما» المتصلة تحت الوصل لا الفصل.
    expect(waslExamples.map((item) => item.form)).toEqual(['عمَّ', 'ممَّ', 'بِمَ', 'كلّما'])
    expect(faslExamples.map((item) => item.form)).toEqual(['إن شاء الله', 'لا سيّما', 'كلّ ما'])
    expect(waslExamples.find((item) => item.form === 'كلّما')?.note).toContain('التكرار')
    // ت-٣: تمييز «ممَّنْ» (من + مَن) عن «ممَّ» (من + ما).
    expect(mimmanNote).toContain('من + مَن')
    expect(mimmanNote).toContain('من + ما')
    expect(mimmanNote).toContain('العاقل')
  })

  it('keeps the five interrogative-ma rules with origins, meanings, and examples', () => {
    expect(maRules.map((rule) => rule.form)).toEqual(['بِمَ', 'لِمَ', 'فيمَ', 'عمَّ', 'ممَّ'])
    expect(maRules[0].mainExample).toBe('بِمَ كتبتَ الواجب؟')
    expect(maRules[1].mainExample).toBe('لِمَ تأخّرتَ عن المدرسة؟')
    expect(maRules[4].mainExample).toBe('ممَّ صُنعت هذه الطاولة؟')
    expect(maRules.every((rule) => rule.moreExamples.length === 3)).toBe(true)
    expect(maRules[2].moreExamples).toContain('فيمَ تختلف الفكرتان؟')
    expect(memoryTable).toHaveLength(5)
    expect(memoryTable[3]).toEqual({ origin: 'عن + ما', form: 'عمَّ', example: 'عمَّ تبحث؟' })
    expect(sections[3].paragraphs[2]).toContain('ولا تعني أن كل «ما» تأتي بعد حرف جر')
  })

  it('keeps the three interrogative/relative contrasts and the easy rule', () => {
    expect(maContrast).toHaveLength(3)
    expect(maContrast[0].interrogative).toBe('عمَّ تبحث؟')
    expect(maContrast[0].relative).toBe('تحدّثتُ عمّا قرأتُه.')
    expect(maContrast[1].relative).toBe('استعنتُ بما تعلّمتُه.')
    expect(maContrast[2].relative).toBe('فكّرتُ فيما حدث.')
    expect(easyRule).toBe('هل الجملة سؤال عن شيء؟')
  })

  it('keeps the inshallah analysis, the lasiyyama examples, and the kullama distinction', () => {
    expect(inshallahAnalysis.map((item) => item.word)).toEqual(['إنْ', 'شاء', 'الله'])
    expect(inshallahAnalysis[0].role).toContain('أداة شرط')
    expect(inshallahAnalysis[2].role).toContain('فاعل')
    expect(inshaExamples).toContain('موضوع إنشاء.')
    expect(inshallahCompare).toMatchObject({ correct: 'إن شاء الله', other: 'إنشاء المشروع' })
    expect(quickDrill).toEqual({ prompt: 'سأنهي واجبي هذا المساء ______.', answer: 'إن شاء الله' })
    expect(lasiyyamaExamples).toHaveLength(3)
    expect(lasiyyamaExamples[0]).toContain('القصص التاريخية')
    expect(kullamaConnected).toHaveLength(3)
    expect(kullamaConnected[2]).toBe('كلّما تدربتَ، تحسّن أداؤك.')
    expect(kullamaCompare.connected).toBe('كلّما قرأتُ، تعلّمتُ شيئًا جديدًا.')
    expect(kullamaCompare.separated).toBe('قرأتُ كلَّ ما وجدتُه في المكتبة.')
  })

  it('keeps the nine common structures, the four method steps, and the six common errors', () => {
    expect(commonStructures.map((row) => row.form)).toEqual([
      'إن شاء الله',
      'لا سيّما',
      'كلّما',
      'كلّ ما',
      'عمَّ',
      'ممَّ',
      'بِمَ',
      'لِمَ',
      'فيمَ',
    ])
    expect(commonStructures[1].example).toBe('أحبّ الرياضيات، ولا سيّما الهندسة.')
    expect(methodSteps.map((step) => step.title)).toEqual([
      'افهم المعنى',
      'حدّد الكلمات',
      'طبّق القاعدة',
      'اقرأ الجملة بعد التصحيح',
    ])
    expect(methodSteps[2].detail).toContain('سأشارك في المسابقة إن شاء الله')
    expect(commonErrors).toHaveLength(6)
    expect(commonErrors[0]).toMatchObject({ correct: 'إن شاء الله' })
    expect(commonErrors[2].wrong).toBe('كلما قرأتُ الكتاب كلّ ما فهمتُ أكثر')
    // ت-٤: «بماذا» صيغة صحيحة لا خطأ؛ والخطأ إثبات الألف في «بما».
    expect(commonErrors[5].correct).toBe('بِمَ استعنت؟')
    expect(commonErrors[5].reason).toContain('بماذا استعنت')
    expect(commonErrors[5].reason).toContain('ليست خطأ')
    expect(summaryRules).toHaveLength(5)
    expect(summaryRules.map((rule) => rule.title)).toEqual([
      'إن شاء الله',
      'لا سيّما',
      'ما الاستفهامية بعد بعض حروف الجر',
      'كلّما',
      'كلّ ما',
    ])
  })

  it('keeps the five-question practice with single keys and full feedback', () => {
    expect(practice.map((item) => item.answer)).toEqual([
      'إن شاء الله',
      'لا سيّما',
      'لِمَ',
      'كلّما اجتهدتَ، نجحتَ.',
      'كلّ ما',
    ])
    expect(practice[0].prompt).toContain('سأزور صديقي غدًا')
    expect(practice[2].options).toContain('لما، في كل استعمال')
    expect(practice[4].options).toContain('كلما ما')
    for (const item of practice) {
      expect(item.options.filter((option) => option === item.answer)).toHaveLength(1)
      expect(new Set(item.options).size).toBe(item.options.length)
      expect(item.explanation.length).toBeGreaterThan(80)
      expect(item.rule.length).toBeGreaterThan(0)
      expect(item.example.length).toBeGreaterThan(0)
    }
  })

  it('declares twenty exam questions in four pages worth twenty marks', () => {
    expect(examQuestions).toHaveLength(20)
    expect(examQuestions.map((question) => question.number)).toEqual(
      Array.from({ length: 20 }, (_, index) => index + 1),
    )
    expect(testDefinition.id).toBe('spelling-lesson-13-independent')
    expect(testDefinition.pages.map((page) => page.questions.length)).toEqual([5, 5, 5, 5])
    const totalMarks = examQuestions.reduce((sum, question) => sum + (question.points ?? 1), 0)
    expect(totalMarks).toBe(20)
    const kinds = testDefinition.pages.map((page) =>
      page.questions.map((question) => question.fields.map((field) => field.kind).join('+')).join(','),
    )
    expect(kinds[0]).toBe('choice,choice,choice,choice,choice')
    expect(kinds[1]).toBe('choice,choice,choice,choice,choice')
    expect(kinds[2]).toBe('text,text,text+text,text,text')
    expect(kinds[3]).toBe('essay,essay,essay,essay,essay')
    const types = examQuestions.map((question) => question.type)
    expect(types.slice(0, 5).every((type) => type === 'اختيار من متعدد')).toBe(true)
    expect(types.slice(5, 10).every((type) => type === 'تصحيح خطأ')).toBe(true)
    expect(types.slice(10, 15).every((type) => type === 'إكمال فراغ')).toBe(true)
    expect(types.slice(15, 20).every((type) => type === 'تطبيق وإنشاء')).toBe(true)
  })

  it('matches every exam key to the reviewed model answer with complete solutions', () => {
    expect(examQuestions.map((question) => question.solution)).toEqual(expectedExamAnswers)
    // القسم الثالث: السؤال ١٣ بحقلين (الكلمتان معًا).
    expect(examQuestions[12].fields).toHaveLength(2)
    // القسم الرابع: إنشائي يُراجع يدويًا، والنموذج يُكشف بعد التسليم.
    for (const question of examQuestions.slice(15, 20)) {
      expect(question.revealEssaySolution).toBe(true)
    }
    for (const question of examQuestions) {
      expect(question.explanation!.length).toBeGreaterThan(60)
      expect(question.rule!.length).toBeGreaterThan(0)
      expect(question.teacherAnswer!.length).toBeGreaterThan(40)
    }
    // مفاتيح الاختيار وحيدة وضمن الخيارات.
    for (const question of examQuestions.slice(0, 10)) {
      const field = question.fields[0]
      expect(field.kind).toBe('choice')
      if (field.kind === 'choice') {
        expect(new Set(field.options).size).toBe(3)
        expect(field.options.filter((option) => option === field.answer)).toHaveLength(1)
        expect(question.solution).toBe(field.answer)
      }
    }
  })

  it('grades the independent test through the shared engine: 15 auto + 5 manual', () => {
    const answers: Record<string, string[]> = {}
    for (const question of examQuestions.slice(0, 10)) {
      const field = question.fields[0]
      if (field.kind !== 'choice') throw new Error('expected a choice field')
      answers[answerKey(question.id, 0)] = [field.answer]
    }
    answers[answerKey('spell13-exam-11', 0)] = ['فيمَ']
    answers[answerKey('spell13-exam-12', 0)] = ['ثلاث']
    answers[answerKey('spell13-exam-13', 0)] = ['لا']
    answers[answerKey('spell13-exam-13', 1)] = ['سيّما']
    answers[answerKey('spell13-exam-14', 0)] = ['التكرار']
    answers[answerKey('spell13-exam-15', 0)] = ['جميع الأشياء التي']
    for (const question of examQuestions.slice(15, 20)) {
      answers[answerKey(question.id, 0)] = ['جملة إنشائية يراجعها المعلم']
    }
    const results = testDefinition.pages.map((page) => gradePage(page, answers, testDefinition.matching))
    expect(results.map((result) => result.correct)).toEqual([5, 5, 5, 0])
    expect(results.map((result) => result.manual)).toEqual([0, 0, 0, 5])
    expect(results.map((result) => result.total)).toEqual([5, 5, 5, 5])
  })

  it('rejects the characteristic wrong forms instead of accepting them', () => {
    // «في ما» بالألف مرفوضة في موضع الاستفهام.
    const page3 = testDefinition.pages[2]
    const wrongMa = {
      [answerKey('spell13-exam-11', 0)]: ['في ما'],
      [answerKey('spell13-exam-12', 0)]: ['ثلاث'],
      [answerKey('spell13-exam-13', 0)]: ['لا'],
      [answerKey('spell13-exam-13', 1)]: ['سيّما'],
      [answerKey('spell13-exam-14', 0)]: ['التكرار'],
      [answerKey('spell13-exam-15', 0)]: ['جميع الأشياء التي'],
    }
    expect(gradePage(page3, wrongMa, testDefinition.matching).statuses['spell13-exam-11']).toBe('wrong')
    // سؤال الكلمتين: ملء حقل واحد لا يكفي.
    const partial = {
      [answerKey('spell13-exam-13', 0)]: ['لا'],
    }
    expect(gradePage(page3, partial, testDefinition.matching).statuses['spell13-exam-13']).toBe('unanswered')
    // الجملة الخاطئة الأصلية مرفوضة في أسئلة التصحيح.
    const page2 = testDefinition.pages[1]
    const asIs = {
      [answerKey('spell13-exam-06', 0)]: ['سأذهب إلى المدرسة إنشاء الله.'],
      [answerKey('spell13-exam-07', 0)]: ['أحبّ القراءة، ولا سيّما القصص.'],
      [answerKey('spell13-exam-08', 0)]: ['عمَّ تسأل؟'],
      [answerKey('spell13-exam-09', 0)]: ['كلّما تدربتَ أكثر، تحسّن أداؤك.'],
      [answerKey('spell13-exam-10', 0)]: ['فيمَ تبحث؟'],
    }
    const graded = gradePage(page2, asIs, testDefinition.matching)
    expect(graded.statuses['spell13-exam-06']).toBe('wrong')
    expect(graded.correct).toBe(4)
  })

  it('keeps the homework correction sentences with models and the paragraph requirements', () => {
    expect(homeworkCorrection).toHaveLength(5)
    expect(homeworkCorrection[0]).toBe('سأشارك في الرحلة إنشاء الله.')
    expect(homeworkCorrectionModel).toHaveLength(5)
    expect(homeworkCorrectionModel[2].corrected).toBe('عمَّ تتحدّث؟')
    expect(homeworkCorrectionModel[3].corrected).toBe('كلّما اجتهدتَ، نجحتَ.')
    expect(homeworkCorrectionModel.every((item) => item.reason.length > 40)).toBe(true)
    expect(homeworkParagraphTopic).toBe('أهمية الاجتهاد في الدراسة')
    expect(homeworkParagraphRequirements).toHaveLength(5)
    expect(homeworkSelfReview.length).toBeGreaterThanOrEqual(5)
    // نموذج الفقرة: ستة أسطر تستوفي المتطلبات الخمسة.
    expect(homeworkParagraphModel).toHaveLength(6)
    const paragraph = homeworkParagraphModel.join(' ')
    for (const term of ['إن شاء الله', 'لا سيّما', 'فيمَ', 'كلّما', 'كلّ ما']) {
      expect(paragraph).toContain(term)
    }
    expect(homeworkGradingGuide.length).toBeGreaterThanOrEqual(3)
  })
})
