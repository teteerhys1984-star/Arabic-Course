import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { answerKey, gradePage } from '../../shared/test'
import { lessonRegistry } from '../registry'
import {
  objectives,
  sections,
  preservedWords,
  ibnRows,
  maRows,
  lamOnAlRows,
  groupAlifVerbs,
  wawCompareRows,
  tanweenRows,
  tanweenExceptionRows,
  tanweenSentences,
  amruSentences,
  discoverySteps,
  commonErrors,
  homeworkWords,
  homeworkConditions,
  homeworkModel,
  homeworkParagraphModel,
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

/** توزيع أسئلة الاختبار المستقل: ٥ تصحيح + ٤ اختيار + ٣ إكمال + ٣ تطبيق. */
const expectedExamAnswers = [
  'هذا طالبٌ مجتهدٌ.',
  'لكنَّ الجوُّ جميلٌ.',
  'الطلاب كتبوا الواجب.',
  'قرأتُ قصةً ممتعةً.',
  'رأيتُ سماءً صافيةً.',
  'هذا الطالبُ مجتهدٌ.',
  'عمَّ',
  'خرجوا',
  'كتابًا',
  'بن',
  'للمدرسة',
  'استفهامية',
  'عمرو',
  'الأولى استفهامية فحُذفت ألفها، والثانية ليست استفهامية فلا تُحذف ألفها بهذه القاعدة',
  'لأن واو «كتبوا» واو جماعة تُثبت بعدها الألف الفارقة، أما واو «يدعو» فأصلية في الفعل',
]

describe('spelling lesson 12 — content, source coverage, and reviewed keys', () => {
  it('registers the twelfth spelling lesson in order and creates no thirteenth lesson or unit test', () => {
    const spellingLessons = lessonRegistry.filter((lesson) => lesson.sectionId === 'spelling')
    expect(spellingLessons.map((lesson) => lesson.id)).toEqual(spellingLessonIds)
    expect(spellingLessons[11]).toMatchObject({
      id: 'spelling-lesson-12',
      sectionId: 'spelling',
      number: '١٢',
      available: true,
      strand: 'الإملاء',
      title: 'علامات الحذف والزيادة في الكلمات',
    })
    expect(
      lessonRegistry.some((lesson) => lesson.id === 'spelling-lesson-14' || lesson.id.includes('unit')),
    ).toBe(false)
  })

  it('preserves the source and leaves every previous teaching file byte-identical', () => {
    const inventory = JSON.parse(readFileSync('docs/spelling-lesson-12-source-inventory.json', 'utf8'))
    const hash = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex')

    expect(hash('docs/source/spelling-lesson-12.md')).toBe(inventory.sourceSha256)
    expect(Object.keys(inventory.previousContentSha256).length).toBeGreaterThan(30)
    for (const [path, sha] of Object.entries(inventory.previousContentSha256)) {
      expect(hash(path), `previous teaching file changed: ${path}`).toBe(sha)
    }

    const content = readFileSync('src/lessons/spelling-lesson-12/content.ts', 'utf8')
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
    expect(objectives.length).toBeGreaterThanOrEqual(7)
    // التمهيد بالكلمات الأربع من المصدر.
    expect(sections[0].paragraphs[0]).toContain('هذا · لكن · كتبوا · كتابًا')
    // القاعدة الذهبية من المصدر.
    expect(sections[2].paragraphs[2]).toContain('لا نحذف حرفًا أو نضيفه من تلقاء أنفسنا')
    // خلاصة المصدر وجملة ختامه.
    expect(sections[12].paragraphs[2]).toContain('مدرسةً، فتىً، سماءً')
    expect(sections[12].paragraphs[3]).toContain('تمّ الدرس الثاني عشر من قسم الإملاء')
  })

  it('keeps the five preserved words with their wrong forms and sentences', () => {
    expect(preservedWords.map((row) => row.word)).toEqual(['هذا', 'هذه', 'ذلك', 'لكن', 'الرحمن'])
    expect(preservedWords.map((row) => row.wrong)).toEqual(['هاذا', 'هاذه', 'ذالك', 'لاكن', 'الرحمان'])
    expect(preservedWords[0].sentence).toBe('هذا طالبٌ مجتهدٌ.')
    expect(preservedWords[4].sentence).toBe('بسم الله الرحمن الرحيم.')
  })

  it('keeps the ibn deletion positions and the proven positions compared, without over-generalizing', () => {
    expect(ibnRows.filter((row) => row.kind === 'deleted')).toHaveLength(3)
    expect(ibnRows.filter((row) => row.kind === 'proven')).toHaveLength(2)
    expect(ibnRows.map((row) => row.text)).toEqual([
      'خالد بن الوليد',
      'عمر بن الخطاب',
      'علي بن أبي طالب',
      'ابنُ خلدون مؤرخٌ مشهورٌ',
      'هذا ابنُ عمي',
    ])
    const deletedNotes = ibnRows.filter((row) => row.kind === 'deleted').map((row) => row.note)
    expect(deletedNotes.every((note) => note.includes('أبٌ للأول'))).toBe(true)
    // قيد المصدر: لا حذف في كل موضع.
    expect(readFileSync('src/lessons/spelling-lesson-12/content.ts', 'utf8')).toContain(
      'لا نحذف ألف «ابن» في كل موضع',
    )
  })

  it('keeps the six interrogative-ma after-preposition rows and the non-interrogative distinction', () => {
    expect(maRows).toHaveLength(6)
    expect(maRows.map((row) => row.after)).toEqual(['عمَّ', 'ممَّ', 'فيمَ', 'بِمَ', 'لِمَ', 'إلامَ'])
    expect(maRows.map((row) => row.example)).toEqual([
      'عمَّ تسأل؟',
      'ممَّ تخاف؟',
      'فيمَ تفكّر؟',
      'بِمَ كتبتَ؟',
      'لِمَ تأخرتَ؟',
      'إلامَ تنظر؟',
    ])
    // التمييز بين الاستفهامية وغيرها كما في المصدر.
    const content = readFileSync('src/lessons/spelling-lesson-12/content.ts', 'utf8')
    expect(content).toContain('بما تعلمتَ، أفدتَ غيرك')
    expect(content).toContain('ليست استفهامية')
  })

  it('keeps the lam-on-al examples and labels معلم الصف as a non-example explicitly', () => {
    expect(lamOnAlRows.filter((row) => row.isAlExample)).toHaveLength(2)
    expect(lamOnAlRows.filter((row) => row.isAlExample).map((row) => row.joined)).toEqual(['للمدرسة', 'للبيت'])
    const notAl = lamOnAlRows.find((row) => !row.isAlExample)
    expect(notAl?.joined).toBe('لمعلّم الصف')
    expect(notAl?.note).toContain('ليست مثالًا على دخول اللام على «أل»')
    // لا تُعرض «لمعلّم الصف» أبدًا كمثال على القاعدة.
    const examples = lamOnAlRows.filter((row) => row.isAlExample)
    expect(examples.every((row) => !row.joined.includes('معلم'))).toBe(true)
  })

  it('keeps the five group-alif verbs, the waw comparison, and the quick distinction method', () => {
    expect(groupAlifVerbs.map((row) => row.verb)).toEqual(['كتبوا', 'لعبوا', 'لم يهملوا', 'لن يتأخروا', 'اكتبوا'])
    expect(wawCompareRows.map((row) => row.word)).toEqual(['كتبوا', 'يدعو', 'المعلمون'])
    const content = readFileSync('src/lessons/spelling-lesson-12/content.ts', 'utf8')
    expect(content).toContain('هل الواو في فعل وتدل على مجموعة أشخاص قاموا بالفعل؟')
    expect(content).toContain('نجحوا')
    expect(content).toContain('خرجوا')
  })

  it('keeps tanween-nusb examples with the three famous exceptions and their sentences', () => {
    expect(tanweenRows).toHaveLength(5)
    expect(tanweenRows.map((row) => row.result)).toEqual(['كتابًا', 'قلمًا', 'درسًا', 'بابًا', 'طريقًا'])
    expect(tanweenExceptionRows.map((row) => row.correct)).toEqual(['مدرسةً', 'فتىً', 'سماءً'])
    expect(tanweenSentences).toEqual(['زرتُ مدرسةً جديدةً.', 'رأيتُ فتىً يساعدُ رجلًا.', 'شاهدتُ سماءً صافيةً.'])
    const content = readFileSync('src/lessons/spelling-lesson-12/content.ts', 'utf8')
    // تأهيل القاعدة: «غالبًا» و«من أهمها» — لا تعميم مضلّل.
    expect(content).toContain('نكتب ألفًا في آخرها غالبًا')
    expect(content).toContain('من أهمها')
  })

  it('keeps the amru sentences with the نصب form and the no-confusion note', () => {
    expect(amruSentences.map((item) => item.text)).toEqual([
      'حضر عمرو إلى المدرسة.',
      'تحدّثتُ مع عمرو.',
      'عمرُ طالبٌ مجتهدٌ.',
    ])
    const content = readFileSync('src/lessons/spelling-lesson-12/content.ts', 'utf8')
    expect(content).toContain('عند النصب مع تنوين الفتح تُكتب عادةً عمرًا، لا «عمروًا»')
    expect(content).toContain('لا تخلط بين هذه الواو وبين واو الجماعة')
  })

  it('keeps the three-step discovery method and the six common errors', () => {
    expect(discoverySteps.map((step) => step.title)).toEqual([
      'اقرأ الكلمة في سياقها',
      'حدّد القاعدة',
      'اكتب الكلمة ثم راجعها',
    ])
    expect(commonErrors.map((row) => row.wrong)).toEqual(['هاذا', 'لاكن', 'الطلاب كتبو', 'قرأتُ كتاباً مفيداً', 'مدرسةاً', 'سماءاً'])
    expect(commonErrors.map((row) => row.correct)).toEqual(['هذا', 'لكن', 'الطلاب كتبوا', 'قرأتُ كتابًا مفيدًا', 'مدرسةً', 'سماءً'])
  })

  it('keeps the homework words, conditions, model answers, and paragraph model', () => {
    expect(homeworkWords).toEqual(['هذا', 'لكن', 'كتبوا', 'كتابًا', 'مدرسةً', 'عمرو'])
    expect(homeworkConditions).toHaveLength(4)
    expect(homeworkConditions[3]).toBe('كلمة «ابن» في جملة مناسبة.')
    expect(homeworkModel.map((item) => item.word)).toEqual(homeworkWords)
    expect(homeworkModel.every((item) => item.sentence.length > 0 && item.reason.length > 40)).toBe(true)
    expect(homeworkParagraphModel.paragraph).toHaveLength(5)
  })

  it('keeps the eight practice questions with unambiguous keys and full feedback', () => {
    expect(practice).toHaveLength(8)
    expect(practice.map((item) => item.answer)).toEqual([
      'هذا',
      'كتبوا',
      'لكن',
      'قرأتُ قصةً',
      'فيمَ',
      'نجحوا',
      'سماءً',
      'ذلك',
    ])
    for (const item of practice) {
      expect(item.options.filter((option) => option === item.answer)).toHaveLength(1)
      expect(new Set(item.options).size).toBe(item.options.length)
      expect(item.explanation.length).toBeGreaterThan(80)
      expect(item.rule.length).toBeGreaterThan(10)
      expect(item.example.length).toBeGreaterThan(3)
    }
  })

  it('declares the independent test as fifteen questions in four pages (5 + 4 + 3 + 3) with the source-mandated distribution', () => {
    expect(testDefinition.id).toBe('spelling-lesson-12-independent')
    expect(testDefinition.pages).toHaveLength(4)
    expect(testDefinition.pages.map((page) => page.questions.length)).toEqual([5, 4, 3, 3])
    expect(examQuestions).toHaveLength(15)

    // توزيع الأنواع: ٥ تصحيح أخطاء (كتيّب) + ٤ اختيار + ٣ إكمال (كتيّب) + ٣ تطبيق (اختيار).
    expect(examQuestions.slice(0, 5).every((q) => q.fields[0].kind === 'text')).toBe(true)
    expect(examQuestions.slice(0, 5).every((q) => q.type === 'تصحيح خطأ')).toBe(true)
    expect(examQuestions.slice(5, 9).every((q) => q.fields[0].kind === 'choice')).toBe(true)
    expect(examQuestions.slice(5, 9).every((q) => q.type === 'اختيار من متعدد')).toBe(true)
    expect(examQuestions.slice(9, 12).every((q) => q.fields[0].kind === 'text')).toBe(true)
    expect(examQuestions.slice(9, 12).every((q) => q.type === 'إكمال فراغ')).toBe(true)
    expect(examQuestions.slice(12, 15).every((q) => q.fields[0].kind === 'choice')).toBe(true)
    expect(examQuestions.slice(12, 15).every((q) => q.type === 'تطبيق وفهم السياق')).toBe(true)
  })

  it('keeps the fifteen independent questions unique, complete, and covering every lesson topic', () => {
    expect(new Set(examQuestions.map((q) => q.id)).size).toBe(15)
    expect(new Set(examQuestions.map((q) => q.prompt)).size).toBe(15)
    expect(examQuestions.map((q) => q.number)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1))

    for (const question of examQuestions) {
      const field = question.fields[0]
      if (field.kind === 'choice') {
        expect(new Set(field.options).size).toBe(3)
        expect(field.options.filter((option) => option === field.answer)).toHaveLength(1)
        expect(field.answer).toBe(question.solution)
      } else if (field.kind === 'text') {
        expect(field.accept.length).toBeGreaterThan(0)
      } else {
        throw new Error('نوع حقل غير متوقع في أسئلة الاختبار')
      }
      expect(question.solution!.length).toBeGreaterThan(0)
      expect(question.explanation!.length).toBeGreaterThan(90)
      expect(question.rule!.length).toBeGreaterThan(10)
      expect(question.example!.length).toBeGreaterThan(3)
      expect(question.teacherAnswer?.length ?? 0).toBeGreaterThan(40)
    }

    // تغطية المحاور السبعة كلها.
    const allText = examQuestions.map((q) => `${q.prompt} ${q.explanation} ${q.rule} ${q.example}`).join(' ')
    for (const term of [
      '«هذا» محفوظة الرسم',
      'ألف «ابن»',
      'ما» الاستفهامية',
      'دخول لام الجر على «أل»',
      'الألف الفارقة',
      'ألف تنوين النصب',
      'التاء المربوطة',
      'الهمزة التي قبلها ألف',
      'عمرو',
    ]) {
      expect(allText, `coverage: ${term}`).toContain(term)
    }
  })

  it('grades the independent test correctly through the shared engine and never mixes keys', () => {
    const answers = Object.fromEntries(
      examQuestions.map((question) => {
        const field = question.fields[0]
        if (field.kind !== 'choice' && field.kind !== 'text') {
          throw new Error('نوع حقل غير متوقع في أسئلة الاختبار')
        }
        return [
          answerKey(question.id, 0),
          [field.kind === 'choice' ? field.answer : (field.accept[0] ?? '')],
        ]
      }),
    )
    for (const page of testDefinition.pages) {
      const result = gradePage(page, answers, testDefinition.matching ?? 'strict')
      expect(result.correct).toBe(page.questions.length)
      expect(result.total).toBe(page.questions.length)
    }

    // مفتاح خاطئ واحد يُخطئ سؤاله فقط ولا يؤثر على الصفحة الأخرى.
    const wrong = { ...answers, [answerKey('spell12-exam-07', 0)]: ['عماَ'] }
    const pageTwo = gradePage(testDefinition.pages[1], wrong, testDefinition.matching ?? 'strict')
    expect(pageTwo.correct).toBe(3)
    expect(pageTwo.wrong).toBe(1)
  })

  it('never repeats the eight practice prompts or answers in the independent test', () => {
    const practicePrompts = new Set(practice.map((item) => item.prompt))
    const practiceAnswers = new Set(practice.map((item) => item.answer))
    for (const question of examQuestions) {
      expect(practicePrompts.has(question.prompt)).toBe(false)
      if (question.fields[0].kind === 'choice') {
        expect(practiceAnswers.has(question.fields[0].answer)).toBe(false)
      }
    }
    // وأيضًا لا تُنسخ جمل التدريب في جمل الاختبار.
    const examSentences = examQuestions.map((q) => q.sentence ?? '').join(' ')
    for (const item of practice) {
      expect(examSentences.includes(item.answer) ? !practicePrompts.has(item.prompt) : true).toBe(true)
    }
  })

  it('keeps the reviewed answer keys exactly as in the source model answer', () => {
    for (const [index, question] of examQuestions.entries()) {
      const field = question.fields[0]
      if (field.kind === 'text') {
        expect(field.accept[0]).toBe(expectedExamAnswers[index])
      } else if (field.kind === 'choice') {
        expect(field.answer).toBe(expectedExamAnswers[index])
      } else {
        throw new Error('نوع حقل غير متوقع في أسئلة الاختبار')
      }
    }
  })
})
