import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { answerKey, gradePage } from '../../shared/test'
import { lessonRegistry } from '../registry'
import {
  sections,
  practice,
  quiz,
  nounExamples,
  alExamples,
  triVerbs,
  khumasiVerbs,
  sudasiVerbs,
  rubaiVerbs,
  mudariVerbs,
  summaryTableRows,
  commonErrors,
  testDefinition,
  examQuestions,
} from './content'

const expectedExamAnswers = [
  'همزة وصل',
  'همزة قطع',
  'همزة وصل',
  'همزة قطع',
  'همزة وصل',
  'اجلسْ',
  'أكرمَ',
  'استنتاج',
  'ما اسمُ',
  'إلى',
  'استمعَ الطلابُ إلى النصيحة.',
  'أقبلَ أحمدُ على قراءةِ الكتابِ باهتمام.',
  'اثنان',
  'فعل أمر من الفعل الرباعي أحسنَ',
  'استعدَّ الفريقُ للمباراةِ استعدادًا تامًّا.',
  '«اكتبْ» أمر ثلاثي بهمزة وصل، و«أكتبُ» مضارع للمتكلم بهمزة قطع.',
  '«استخرجَ» ماضٍ سداسي همزته وصل، و«أخرجَ» ماضٍ رباعي همزته قطع.',
  'لأن «أسماء» جمع تكسير، والجموع تتبع الأصل العام في الأسماء وهو القطع.',
  'إذا وقعت مفردة نعتًا بين عَلَمين مباشرين ثانيهما أب للأول ولم تقع في أول السطر.',
  'تسقط همزة «استيقظ» في النطق لأنها وصل، وتثبت همزة «أحمد» في النطق لأنها قطع.',
]

describe('spelling lesson 10 — content, source coverage, and independent test key', () => {
  it('registers all eleven spelling lessons in order and creates no twelfth lesson or unit test', () => {
    const spellingLessons = lessonRegistry.filter((l) => l.sectionId === 'spelling')
    expect(spellingLessons.map((l) => l.id)).toEqual([
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
    ])
    expect(lessonRegistry.some((l) => l.id === 'spelling-lesson-14' || l.id.includes('unit'))).toBe(false)
  })

  it('preserves source fidelity, covers inventory and leaves previous lessons byte-identical', () => {
    const inventory = JSON.parse(readFileSync('docs/spelling-lesson-10-source-inventory.json', 'utf8'))
    const hash = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex')

    expect(hash('docs/source/spelling-lesson-10.md')).toBe(inventory.sourceSha256)
    for (const [path, sha] of Object.entries(inventory.previousContentSha256)) {
      expect(hash(path)).toBe(sha)
    }

    const content = readFileSync('src/lessons/spelling-lesson-10/content.ts', 'utf8')
    for (const item of inventory.coverage) {
      for (const term of item.terms) {
        expect(content).toContain(term)
      }
    }
  })

  it('retains foundational explanation, tables, all 8 practice and 10 quiz activities', () => {
    expect(sections).toHaveLength(13)
    expect(nounExamples).toHaveLength(7)
    expect(alExamples).toHaveLength(5)
    expect(triVerbs).toHaveLength(5)
    expect(khumasiVerbs).toHaveLength(4)
    expect(sudasiVerbs).toHaveLength(4)
    expect(rubaiVerbs).toHaveLength(4)
    expect(mudariVerbs).toHaveLength(4)
    expect(summaryTableRows).toHaveLength(8)
    expect(commonErrors).toHaveLength(4)

    expect(practice).toHaveLength(8)
    expect(quiz).toHaveLength(10)

    expect(practice.map((q) => q.answer)).toEqual([
      'همزة وصل',
      'اجتمع الطلاب',
      'إيمان',
      'اكتب',
      'أكرم',
      'قطع',
      'المدرسة',
      'استغفار',
    ])

    expect(quiz.map((q) => q.answer)).toEqual([
      'وصل',
      'قطع',
      'وصل',
      'قطع',
      'وصل',
      'قطع',
      'وصل',
      'قطع',
      'استعمل',
      'أحمد',
    ])

    for (const q of [...practice, ...quiz]) {
      expect(q.options.filter((o) => o === q.answer)).toHaveLength(1)
      expect(new Set(q.options).size).toBe(q.options.length)
      expect(q.explanation.length).toBeGreaterThan(40)
    }
  })

  it('has exactly 20 unique independent exam questions on four pages of five, with reviewed key', () => {
    expect(testDefinition.id).toBe('spelling-lesson-10-independent')
    expect(testDefinition.pages.map((p) => p.questions.length)).toEqual([5, 5, 5, 5])
    expect(examQuestions).toHaveLength(20)
    expect(new Set(examQuestions.map((q) => q.id)).size).toBe(20)
    expect(new Set(examQuestions.map((q) => q.prompt)).size).toBe(20)

    const inLessonPrompts = new Set([...practice, ...quiz].map((q) => q.prompt))
    for (const [i, q] of examQuestions.entries()) {
      expect(inLessonPrompts.has(q.prompt)).toBe(false)
      const f = q.fields[0]
      if (f.kind !== 'choice') throw new Error('Expected choice field')
      expect(f.answer).toBe(expectedExamAnswers[i])
      expect(q.solution).toBe(f.answer)
      expect(new Set(f.options).size).toBe(3)
      expect(f.options.filter((o) => o === f.answer)).toHaveLength(1)
      expect(q.explanation!.length).toBeGreaterThan(80)
      expect(q.rule).toBeTruthy()
      expect(q.example).toBeTruthy()
    }

    for (const page of testDefinition.pages) {
      const answers = Object.fromEntries(
        page.questions.map((q) => [answerKey(q.id, 0), [expectedExamAnswers[q.number - 1]]]),
      )
      expect(gradePage(page, answers).correct).toBe(5)
    }

    expect(new Set(examQuestions.map((q) => q.level))).toEqual(
      new Set([
        'تحديد نوع الهمزة',
        'اختيار الرسم الصحيح',
        'تصحيح الخطأ الإملائي',
        'الفهم الصرفي والمقارنة',
      ]),
    )
  })
})
