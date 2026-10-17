import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { answerKey, gradePage } from '../../shared/test'
import { lessonRegistry } from '../registry'
import {
  objectives,
  sections,
  tanweenMarks,
  sameWordRows,
  tanweenTypeRows,
  sentenceRows,
  sentenceAnalyses,
  alifCases,
  alifCaseTableRows,
  nunCompareRows,
  commonErrors,
  markLabItems,
  nunChallengeItems,
  alifDecisionItems,
  practice,
  quizQuestions,
  examQuestions,
  testDefinition,
  quizDefinition,
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
]

/** مفاتيح الاختبار المستقل العشرين بعد مراجعة كل سؤال على حدة. */
const expectedExamAnswers = [
  'نون ساكنة زائدة تُلفظ في آخر الاسم ولا تُكتب نونًا مستقلة',
  'يُكتب علامة على الحرف الأخير: كتابٌ',
  'على الحرف الأخير',
  'الأسماء',
  'بيت',
  'ضمتان فوق الحرف الأخير',
  'لأن الاسم مجرور بحرف الجر «الباء»',
  'لأن الاسم مفعول به منصوب',
  'لأن الاسم خبر مرفوع',
  'هي أنواع بحسب الحركة والعلامة: تنوين ضم وتنوين فتح وتنوين كسر',
  'شجرةً',
  'هدى',
  'مبدأً',
  'لأن الهمزة المتطرفة مسبوقة بألف، فالألف موجودة في الكلمة',
  'تُضاف ألف غالبًا، وتُترك في حالات خاصة مثل التاء المربوطة والألف والهمزة المتطرفة',
  'إنسان',
  'جزءًا',
  'على النون الأخيرة',
  'لأن التنوين علامة تُرسم على الحرف الأخير ولا يُكتب نونًا مستقلة',
  'ميدانٌ',
]

describe('spelling lesson 11 — content, source coverage, and reviewed keys', () => {
  it('registers the eleventh spelling lesson in order and creates no thirteenth lesson or unit test', () => {
    const spellingLessons = lessonRegistry.filter((lesson) => lesson.sectionId === 'spelling')
    expect(spellingLessons.map((lesson) => lesson.id)).toEqual(spellingLessonIds)
    expect(spellingLessons[10]).toMatchObject({
      id: 'spelling-lesson-11',
      sectionId: 'spelling',
      number: '١١',
      available: true,
      strand: 'الإملاء',
      title: 'التنوين وأنواعه وكيفية كتابته',
    })
    expect(
      lessonRegistry.some((lesson) => lesson.id === 'spelling-lesson-13' || lesson.id.includes('unit')),
    ).toBe(false)
  })

  it('preserves the source and leaves every previous teaching file byte-identical', () => {
    const inventory = JSON.parse(readFileSync('docs/spelling-lesson-11-source-inventory.json', 'utf8'))
    const hash = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex')

    expect(hash('docs/source/spelling-lesson-11.md')).toBe(inventory.sourceSha256)
    expect(Object.keys(inventory.previousContentSha256).length).toBeGreaterThan(30)
    for (const [path, sha] of Object.entries(inventory.previousContentSha256)) {
      expect(hash(path), `previous teaching file changed: ${path}`).toBe(sha)
    }

    const content = readFileSync('src/lessons/spelling-lesson-11/content.ts', 'utf8')
    for (const item of inventory.coverage) {
      for (const term of item.terms) {
        expect(content, `coverage: ${term}`).toContain(term)
      }
    }
  })

  it('retains the five objectives, the three marks, the lesson tables and the five alif cases', () => {
    expect(objectives).toHaveLength(5)
    expect(sections).toHaveLength(11)
    expect(sections.every((section) => section.paragraphs.length > 0)).toBe(true)
    expect(sections.filter((section) => section.paragraphs.join(' ').length > 400).length).toBeGreaterThanOrEqual(8)
    expect(sections.map((section) => section.paragraphs.join(' ').length).reduce((a, b) => a + b, 0)).toBeGreaterThan(6000)

    expect(tanweenMarks.map((mark) => mark.name)).toEqual([
      'تنوين الضم',
      'تنوين الفتح',
      'تنوين الكسر',
    ])
    expect(tanweenMarks.map((mark) => mark.glyph)).toEqual(['ـٌ', 'ـً', 'ـٍ'])
    expect(tanweenMarks[0].examples).toEqual(['طالبٌ', 'قلمٌ', 'منزلٌ'])
    expect(tanweenMarks[1].examples).toEqual(['طالبًا', 'قلمًا', 'كتابًا'])
    expect(tanweenMarks[2].examples).toEqual(['طالبٍ', 'قلمٍ', 'منزلٍ'])

    expect(sameWordRows.map((row) => row.word)).toEqual(['كتابٌ', 'كتابًا', 'كتابٍ'])
    expect(tanweenTypeRows).toHaveLength(3)
    expect(sentenceRows.map((row) => row.word)).toEqual(['طالبٌ', 'طالبًا', 'طالبٍ'])
    expect(sentenceAnalyses).toHaveLength(3)
    expect(sentenceAnalyses.map((analysis) => analysis.sentence)).toEqual([
      'هذا طالبٌ.',
      'رأيتُ طالبًا.',
      'سلّمتُ على طالبٍ.',
    ])

    expect(alifCases).toHaveLength(5)
    expect(alifCases.map((item) => item.examples.map((example) => example.result))).toEqual([
      ['مدرسةً', 'شجرةً', 'قصةً', 'سيارةً'],
      ['عصًا', 'فتًى', 'هدًى'],
      ['سماءً', 'بناءً', 'مساءً'],
      ['مبدأً', 'ملجأً', 'خطأً'],
      ['كتابًا', 'دفترًا', 'بابًا', 'طريقًا'],
    ])
    expect(alifCases.filter((item) => item.decision === 'add').map((item) => item.id)).toEqual([
      'case-sound-letter',
    ])
    expect(alifCaseTableRows).toHaveLength(5)
    expect(alifCaseTableRows.map((row) => row.condition)).toEqual([
      'تاء مربوطة (ة)',
      'ألف أصلية أو ألف مقصورة (ا / ى)',
      'همزة متطرفة قبلها ألف (اء)',
      'همزة متطرفة على ألف (أ)',
      'حرف صحيح عادي (ب، ت، ر، ق...)',
    ])

    expect(nunCompareRows.map((row) => `${row.word}:${row.hasTanween ? 'نعم' : 'لا'}`)).toEqual([
      'كتابٌ:نعم',
      'كتابًا:نعم',
      'كتابٍ:نعم',
      'بستان:لا',
      'ميزان:لا',
      'إنسان:لا',
    ])
    expect(commonErrors).toHaveLength(4)
    expect(commonErrors.map((error) => error.wrong)).toEqual([
      'كتابن',
      'مدرسةًا',
      'سماءًا',
      'الخلط بين التنوين والنون الأصلية',
    ])
  })

  it('keeps the five alif cases tashkeel-correct and never presents a wrong form as correct', () => {
    const fathatan = '\u064B'
    const dammatan = '\u064C'
    const kasratan = '\u064D'

    expect('قلمٌ'.includes(dammatan)).toBe(true)
    expect('كتابًا'.includes(fathatan)).toBe(true)
    expect('قلمٍ'.includes(kasratan)).toBe(true)

    const results = alifCases.flatMap((item) => item.examples.map((example) => example.result))
    for (const result of results) {
      expect(result.includes(fathatan), `${result} must carry the fathatan`).toBe(true)
    }
    expect(results).toContain('شجرةً')
    expect('شجرةً'.includes('ا')).toBe(false)
    expect('سماءً'.endsWith('\u064B')).toBe(true)
    expect('مبدأً'.endsWith('\u064B')).toBe(true)

    // الصيغ الخطأ تُعرض خطأً فقط: في الأخطاء الشائعة وخيارات الأسئلة، لا في إجابة صحيحة.
    const wrongForms = ['مدرسةًا', 'سماءًا', 'كتابن', 'قصةًا', 'شجرةًا', 'مبدأًا']
    const correctAnswers = [
      ...practice.map((item) => item.answer),
      ...quizQuestions.map((question) => question.solution ?? ''),
      ...examQuestions.map((question) => question.solution ?? ''),
    ].join(' | ')
    for (const wrong of wrongForms) {
      expect(correctAnswers.includes(wrong), `${wrong} must never be a correct answer`).toBe(false)
    }
  })

  it('keeps the eight practice questions unambiguous and distinct from the two tests', () => {
    expect(practice).toHaveLength(8)
    for (const item of practice) {
      expect(item.options.filter((option) => option === item.answer)).toHaveLength(1)
      expect(new Set(item.options).size).toBe(item.options.length)
      expect(item.explanation.length).toBeGreaterThan(80)
      expect(item.rule.length).toBeGreaterThan(10)
      expect(item.example.length).toBeGreaterThan(3)
    }
    // ت-٨: خيارات السؤال الثاني بلا تكرار (كانت «مدرسةًا» مرتين في المصدر).
    expect(practice[1].options).toEqual(['مدرسةًا', 'مدرسةً', 'مدرسةٍ'])
    expect(new Set(practice[1].options).size).toBe(3)
    expect(practice.map((item) => item.answer)).toEqual([
      'تنوين ضم',
      'مدرسةً',
      'كتابًا',
      'ميزان',
      'سماءً',
      'كسر',
      'قصةً',
      'التنوين علامة تظهر على آخر الاسم',
    ])

    const practicePrompts = new Set(practice.map((item) => item.prompt))
    for (const question of [...quizQuestions, ...examQuestions]) {
      expect(practicePrompts.has(question.prompt), `repeated prompt: ${question.id}`).toBe(false)
      expect(practicePrompts.has(question.solution ?? '')).toBe(false)
    }
  })

  it('keeps the ten-question final quiz complete, with written and essay answers', () => {
    expect(quizQuestions).toHaveLength(10)
    expect(quizDefinition.pages).toHaveLength(1)
    expect(quizDefinition.pages[0].questions).toHaveLength(10)
    expect(new Set(quizQuestions.map((question) => question.id)).size).toBe(10)
    expect(new Set(quizQuestions.map((question) => question.number)).size).toBe(10)
    expect(quizQuestions.map((question) => question.level)).toEqual([
      ...Array(4).fill('القسم الأول: أكمل بالتنوين المناسب'),
      ...Array(3).fill('القسم الثاني: صحّح الخطأ'),
      ...Array(3).fill('القسم الثالث: علّل'),
    ])

    // أسئلة الإكمال: حقل كتابي للكلمة كاملة + اختيار لعلامة التنوين (المفتاح الكتابي يتجاهل التشكيل).
    for (const question of quizQuestions.slice(0, 4)) {
      expect(question.fields).toHaveLength(2)
      const [text, select] = question.fields
      if (text.kind !== 'text' || select.kind !== 'select') throw new Error('نوع الحقول غير متوقع')
      expect(text.accept.length).toBeGreaterThan(0)
      expect(select.options).toContain(select.answer)
      expect(new Set(select.options).size).toBe(3)
    }
    expect(quizQuestions.slice(0, 4).map((question) => question.fields[1].kind === 'select' && question.fields[1].answer)).toEqual([
      'ضمتان ـٌ',
      'فتحتان ـً',
      'كسرتان ـٍ',
      'فتحتان ـً',
    ])
    expect(quizQuestions[3].fields[0].kind === 'text' && quizQuestions[3].fields[0].accept).toEqual([
      'شجرًا',
      'شجرةً',
    ])

    // أسئلة التصحيح الكتابية بمفردها.
    for (const question of quizQuestions.slice(4, 7)) {
      expect(question.fields).toHaveLength(1)
      expect(question.fields[0].kind).toBe('text')
    }
    expect(quizQuestions[4].fields[0].kind === 'text' && quizQuestions[4].fields[0].accept).toEqual(['مدرسةً'])
    expect(quizQuestions[5].fields[0].kind === 'text' && quizQuestions[5].fields[0].accept).toEqual(['سماءً'])
    expect(quizQuestions[6].fields[0].kind === 'text' && quizQuestions[6].fields[0].accept).toEqual([
      'كتابٌ',
      'كتابًا',
      'كتابٍ',
    ])

    // أسئلة التعليل مقالية تُراجع يدويًا، ويُكشف حلها النموذجي بعد التحقق فقط.
    for (const question of quizQuestions.slice(7)) {
      expect(question.fields[0].kind).toBe('essay')
      expect(question.revealEssaySolution).toBe(true)
      expect(question.teacherAnswer?.length ?? 0).toBeGreaterThan(80)
    }

    // ت-٩: غموض «شجر....» مُعالج بالنص على القراءتين في التفسير.
    expect(quizQuestions[3].explanation).toContain('شجرةً')
    expect(quizQuestions[3].teacherAnswer).toContain('شجرةً')
  })

  it('has exactly 20 unique independent questions on four pages of five with reviewed keys', () => {
    expect(testDefinition.id).toBe('spelling-lesson-11-independent')
    expect(testDefinition.pages.map((page) => page.questions.length)).toEqual([5, 5, 5, 5])
    expect(examQuestions).toHaveLength(20)
    expect(new Set(examQuestions.map((question) => question.id)).size).toBe(20)
    expect(new Set(examQuestions.map((question) => question.prompt)).size).toBe(20)
    expect(examQuestions.map((question) => question.number)).toEqual(
      Array.from({ length: 20 }, (_, index) => index + 1),
    )
    expect(new Set(examQuestions.map((question) => question.level))).toEqual(
      new Set([
        'تعريف التنوين',
        'أنواع التنوين وعلاماته',
        'ألف تنوين الفتح',
        'النون الأصلية وتصحيح الكتابة',
      ]),
    )

    // لا تكرار بين أسئلة الاختبار المستقل وأسئلة التدريب والاختبار الختامي.
    const lessonPrompts = new Set([
      ...practice.map((item) => item.prompt),
      ...quizQuestions.map((question) => question.prompt),
    ])
    const lessonAnswers = new Set([
      ...practice.map((item) => item.answer),
      ...quizQuestions.map((question) => question.solution ?? ''),
    ])
    for (const [index, question] of examQuestions.entries()) {
      expect(lessonPrompts.has(question.prompt), `independent prompt repeated: ${question.id}`).toBe(false)
      expect(lessonAnswers.has(question.solution ?? '')).toBe(false)
      expect(question.fields).toHaveLength(1)
      const field = question.fields[0]
      expect(field.kind).toBe('choice')
      if (field.kind !== 'choice') throw new Error('كل أسئلة الاختبار المستقل اختيارية بمفتاح واحد')
      expect(field.options).toHaveLength(3)
      expect(new Set(field.options).size).toBe(3)
      expect(field.options.filter((option) => option === field.answer)).toHaveLength(1)
      expect(field.answer).toBe(expectedExamAnswers[index])
      expect(question.solution).toBe(field.answer)
      expect(question.explanation!.length).toBeGreaterThan(90)
      expect(question.rule).toBeTruthy()
      expect(question.example).toBeTruthy()
      expect(question.teacherAnswer).toBeTruthy()
      expect(question.answerSource).toBe('platform')
    }
  })

  it('grades every independent page as five correct answers with the reviewed key', () => {
    for (const page of testDefinition.pages) {
      const answers = Object.fromEntries(
        page.questions.map((question) => [
          answerKey(question.id, 0),
          [expectedExamAnswers[question.number - 1]],
        ]),
      )
      const result = gradePage(page, answers)
      expect(result.correct).toBe(5)
      expect(result.wrong).toBe(0)
      expect(result.unanswered).toBe(0)
    }
  })

  it('keeps the interactive labs aligned with their own data', () => {
    expect(markLabItems).toHaveLength(5)
    for (const item of markLabItems) {
      expect(['damm', 'fath', 'kasr']).toContain(item.answer)
      expect(item.applied.length).toBeGreaterThan(1)
      expect(item.reason.length).toBeGreaterThan(40)
    }
    expect(markLabItems.filter((item) => item.answer === 'damm')).toHaveLength(1)
    expect(markLabItems.filter((item) => item.answer === 'fath')).toHaveLength(2)
    expect(markLabItems.filter((item) => item.answer === 'kasr')).toHaveLength(2)

    expect(nunChallengeItems).toHaveLength(6)
    expect(nunChallengeItems.filter((item) => item.answer === 'tanween')).toHaveLength(3)
    expect(nunChallengeItems.filter((item) => item.answer === 'nun')).toHaveLength(3)

    expect(alifDecisionItems).toHaveLength(6)
    expect(alifDecisionItems.filter((item) => item.answer === 'add').map((item) => item.final)).toEqual([
      'كتابًا',
      'بيتًا',
    ])
    for (const item of alifDecisionItems) {
      const addsAlif = item.final !== item.base && item.final.endsWith('ا')
      expect(addsAlif).toBe(item.answer === 'add')
    }
  })

  it('records the audited open points in the lesson content itself', () => {
    const content = readFileSync('src/lessons/spelling-lesson-11/content.ts', 'utf8')
    // قيد الوقف النطقي (ت-١) وعموم قاعدة الأسماء (ت-٢) والتقسيم الثلاثي (ت-٣).
    expect(content).toContain('كتابْ')
    expect(content).toContain('قاعدة عامة')
    expect(content).toContain('تنوين المقابلة')
    expect(content).toContain('الحالات الخمس')
    const audit = readFileSync('docs/spelling-lesson-11-source-audit.md', 'utf8')
    for (const id of ['ت-١', 'ت-٢', 'ت-٣', 'ت-٨', 'ت-٩', 'ت-١٢']) {
      expect(audit).toContain(id)
    }
  })
})
