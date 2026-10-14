import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { answerKey, gradePage } from '../../shared/test'
import { lessonRegistry } from '../registry'
import { sections, practice, quiz, homework, comparison, commonErrors, testDefinition, examQuestions } from './content'

const expectedExamAnswers = ['ركضوا','ينمو','يسافرون','أنصتوا','دوّنوه','تكرموا','ينسوا','ترفعوا','يفوزوا','يرجو','حذف النون','واو الجماعة متبوعة بالنون','الهاء جاءت بعد واو الجماعة','لن تنجحوا دون تدريب','ضمير متصل في محل رفع فاعل','المصلح يسمو بأخلاقه.','أنتم تحافظون / لا تهملوا','الرجل يدعوا جاره إلى الخير.','احفظوا','جزم بحذف النون، ولا ألف قبل الهاء']
describe('spelling 09 content and reviewed answer key', () => {
  it('registers all nine in order and creates no tenth lesson or unit test', () => {
    expect(lessonRegistry.filter(l => l.sectionId === 'spelling').map(l => l.id)).toEqual(Array.from({length:9}, (_,i) => `spelling-lesson-0${i+1}`))
    expect(lessonRegistry.some(l => l.id === 'spelling-lesson-10' || l.id.includes('unit'))).toBe(false)
  })
  it('preserves source, covers inventory and leaves earlier teaching files byte-identical', () => {
    const inventory = JSON.parse(readFileSync('docs/spelling-lesson-09-source-inventory.json','utf8'))
    const hash = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex')
    expect(hash('docs/source/spelling-lesson-09.md')).toBe(inventory.sourceSha256)
    for (const [path, sha] of Object.entries(inventory.previousContentSha256)) expect(hash(path)).toBe(sha)
    const content = readFileSync('src/lessons/spelling-lesson-09/content.ts','utf8')
    for (const item of inventory.coverage) for (const term of item.terms) expect(content).toContain(term)
    const audit = readFileSync('docs/spelling-lesson-09-audit.md','utf8')
    for (let i=1;i<=9;i++) expect(audit).toContain(`ت-${'١٢٣٤٥٦٧٨٩'[i-1]}`)
  })
  it('retains foundational explanation, examples, all 8/10 activities and 6+4 homework models', () => {
    expect(sections).toHaveLength(12)
    expect(sections.every(s => s.paragraphs.join(' ').length>200)).toBe(true)
    expect(practice).toHaveLength(8); expect(quiz).toHaveLength(10); expect(homework).toHaveLength(10)
    expect(homework.filter(q=>q.section.startsWith('أكمل'))).toHaveLength(6)
    expect(comparison).toHaveLength(8); expect(commonErrors).toHaveLength(4)
    expect(practice.map(q=>q.answer)).toEqual(['نجحوا','يشرحون','يتأخروا','يدعو','اكتبوا','يهملوا','كتبوا','كتبوه'])
    expect(quiz.map(q=>q.answer)).toEqual(['ذهبوا','يقصروا','يقرؤون','يتأخروا','يدعو','استمعوا','المعلمون يشرحون الدرس.','كتبوه','لم يهملوا واجباتهم.','حافظوا'])
    for (const q of [...practice,...quiz]) {
      expect(q.options.filter(o => o===q.answer)).toHaveLength(1)
      expect(new Set(q.options).size).toBe(q.options.length)
      expect(q.explanation.length).toBeGreaterThan(60)
    }
    expect(homework.every(q => q.answer && q.explanation.length>40)).toBe(true)
  })
  it('has exactly 20 unique contextual items on four pages of five, with the reviewed independent key', () => {
    expect(testDefinition.id).toBe('spelling-lesson-09-independent')
    expect(testDefinition.pages.map(p=>p.questions.length)).toEqual([5,5,5,5])
    expect(examQuestions).toHaveLength(20)
    expect(new Set(examQuestions.map(q=>q.id)).size).toBe(20)
    expect(new Set(examQuestions.map(q=>q.prompt)).size).toBe(20)
    const inLesson = new Set([...practice,...quiz].map(q=>q.prompt))
    for (const [i,q] of examQuestions.entries()) {
      expect(inLesson.has(q.prompt)).toBe(false)
      const f = q.fields[0]; if (f.kind !== 'choice') throw Error('Expected choice')
      expect(f.answer).toBe(expectedExamAnswers[i]); expect(q.solution).toBe(f.answer)
      expect(new Set(f.options).size).toBe(3)
      expect(f.options.filter(o => o===f.answer)).toHaveLength(1)
      expect(q.explanation!.length).toBeGreaterThan(100)
      expect(q.rule).toBeTruthy(); expect(q.example).toBeTruthy()
    }
    for (const page of testDefinition.pages) {
      const answers = Object.fromEntries(page.questions.map(q => [answerKey(q.id,0), [expectedExamAnswers[q.number-1]]]))
      expect(gradePage(page,answers).correct).toBe(5)
    }
    expect(new Set(examQuestions.map(q=>q.level))).toEqual(new Set(['ماضٍ','أصلية','رفع','أمر','ضمير','نصب','جزم','تصحيح','مقارنة','تحليل']))
  })
})
