import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { lessonRegistry } from '../registry'
import { getSectionLessons } from '../../sections/sectionRegistry'
import { buildSolutionEntries, combinePageResults, gradePage, type AnswerMap } from '../../shared/test'
import { marks, coverage, teachingSections, challengeQuestions, challengeTest, examQuestions, testDefinition, homework, workedExamples, dualExamples, masculineExamples, feminineExamples, examParsing } from './content'

const challengeOracle = ['مهندسانِ', 'ـَيْنِ', 'معلّمونَ', 'ينَ', 'ممرضاتٌ', 'الكسرة نيابةً عن الفتحة', 'رجال', 'الألف']
const examOracle = ['مثنّى', 'جمع مذكر سالم', 'جمع مؤنث سالم', 'جمع تكسير', 'مثنّى', 'الألف', 'الياء', 'الياء', 'الضمة', 'الكسرة نيابةً عن الفتحة', null, null, null, 'رأيتُ الطالبَيْنِ.', 'نجحَ المجتهدونَ.', 'كرّمتُ المتفوّقاتِ.']

describe('lesson 12 — audited source, registration and scope', () => {
  it('registers once after lesson 11 in basics only; retains every previous registry entry verbatim', () => {
    expect(lessonRegistry.filter((l) => l.id === 'lesson-12')).toEqual([expect.objectContaining({ number: '١٢', sectionId: 'basics-grammar', available: true })])
    expect(getSectionLessons('basics-grammar').map((l) => l.id)).toEqual(Array.from({ length: 12 }, (_, i) => `lesson-${i + 1}`))
    expect(lessonRegistry.some((l) => l.id === 'lesson-13' || /unit.*test/.test(l.id))).toBe(false)
    const current = readFileSync('src/lessons/registry.ts', 'utf8')
    const inventory = JSON.parse(readFileSync('docs/lesson-12-source-inventory.json', 'utf8')) as { registrySha256: string; previousRuntimeSha256: Record<string, string> }
    const hash = (text: string) => createHash('sha256').update(text).digest('hex')
    const added = current.match(/ {2}\{\n {4}id: 'lesson-12',[\s\S]*?\n {2}\},\n/)
    expect(added).not.toBeNull()
    expect(hash(current.replace(added![0], ''))).toBe(inventory.registrySha256)
    // Frozen base digests also work in CI's depth-one checkout without Git history.
    expect(Object.keys(inventory.previousRuntimeSha256).length).toBeGreaterThan(100)
    for (const [path, digest] of Object.entries(inventory.previousRuntimeSha256)) {
      expect(hash(readFileSync(path, 'utf8')), path).toBe(digest)
    }
  })

  it('maps all twenty axes to implemented steps, with five fully parsed applications', () => {
    const component = readFileSync('src/lessons/LessonTwelve.tsx', 'utf8')
    const stepIds = [...teachingSections.map((s) => s.id), ...Array.from(component.matchAll(/id: '([^']+)'/g), (m) => m[1]), 'exam-1']
    expect(coverage).toHaveLength(20)
    for (const [, id] of coverage) expect(stepIds).toContain(id)
    expect(workedExamples).toHaveLength(5)
    expect(dualExamples).toHaveLength(4)
    expect(masculineExamples).toHaveLength(3)
    expect(feminineExamples).toHaveLength(3)
    for (const example of [...workedExamples, ...dualExamples, ...masculineExamples, ...feminineExamples, ...examParsing]) {
      expect(example.parsing.length).toBeGreaterThanOrEqual(2)
      expect(example.parsing.join(' ')).toMatch(/علامة/)
      expect(example.parsing.join(' ')).toMatch(/لأنه/)
    }
    expect(component).toContain('<TeacherSpace>')
    expect(component).toContain('<Homework answers />')
    expect(component).not.toMatch(/<img|https?:\/\//)
    expect(component).toContain('role="img"')
  })

  it('keeps the complete correct sign matrix, nuanced conditions and audited parsing', () => {
    expect(marks.map((m) => m.signs)).toEqual([['الألف', 'الياء', 'الياء'], ['الواو', 'الياء', 'الياء'], ['الضمة', 'الكسرة نيابةً عن الفتحة', 'الكسرة']])
    const text = teachingSections.flatMap((s) => s.paragraphs).join(' ')
    for (const term of ['طالبا الصفِّ', 'طالبَيْ الصفِّ', 'وفق شروطه', 'أحمر/حمراء', 'الألف والتاء المزيدتين', 'بيوت', 'رجال', 'الممرضاتُ', 'الممرضاتِ']) expect(text).toContain(term)
    expect(masculineExamples[2].parsing.join(' ')).toContain('مضاف إليه مجرور وعلامة جرّه الياء')
    expect(masculineExamples[2].parsing.join(' ')).toContain('ليست حرف جر')
    expect(workedExamples[2].sentence).toBe('كرَّمَتِ المدرسةُ المتفوّقاتِ.')
    expect(workedExamples[4].sentence).toBe('نَجَحَتِ الطالباتُ.')
    expect(workedExamples[3].parsing[0]).toContain('في محل رفع فاعل')
    expect(workedExamples[2].parsing[0]).toContain('التقاء الساكنين')
  })

  it('retains four homework rows with valid chosen sound plurals and explanations', () => {
    expect(homework.map((h) => [h.singular, h.dual, h.plural])).toEqual([
      ['طالب', 'طالبانِ', 'طالبونَ'], ['معلّم', 'معلّمانِ', 'معلّمونَ'], ['طالبة', 'طالبتانِ', 'طالباتٌ'], ['مهندسة', 'مهندستانِ', 'مهندساتٌ'],
    ])
    for (const row of homework) expect(row.reason.length).toBeGreaterThan(55)
  })
})

describe('lesson 12 — independent answer oracle and actual grading', () => {
  it('retains eight challenge questions and sixteen exam questions in 5/5/3/3 sections', () => {
    expect(challengeQuestions).toHaveLength(8)
    expect(examQuestions.map((q) => q.number)).toEqual(Array.from({ length: 16 }, (_, i) => i + 1))
    expect(testDefinition.pages.map((p) => p.questions.length)).toEqual([5, 5, 3, 3])
    const all = [...challengeQuestions, ...examQuestions]
    expect(new Set(all.map((q) => q.id)).size).toBe(24)
    for (const question of all) {
      expect(question.fields).toHaveLength(1)
      expect(question.explanation!.length).toBeGreaterThan(40)
      expect(question.solution).toBeTruthy()
    }
  })

  it.each([
    ['challenge', challengeTest, challengeOracle],
    ['exam', testDefinition, examOracle],
  ] as const)('%s keys grade the independently specified correct and incorrect answers', (_label, test, oracle) => {
    const questions = test.pages.flatMap((p) => p.questions)
    const answers: AnswerMap = {}
    questions.forEach((q, i) => {
      const field = q.fields[0]
      if (oracle[i] === null) {
        expect(field.kind).toBe('essay')
        expect(q.parsing!.length).toBeGreaterThanOrEqual(2)
        answers[`${q.id}:0`] = ['إجابة إنشائية تتطلب مراجعة المعلم']
      } else {
        if (field.kind !== 'choice') throw new Error('Expected a choice')
        expect(field.answer).toBe(oracle[i])
        expect(new Set(field.options).size).toBe(field.options.length)
        expect(field.options.filter((v) => v === oracle[i])).toHaveLength(1)
        answers[`${q.id}:0`] = [oracle[i]!]
        for (const option of field.options) {
          const page = { id: 'single', title: 'single', questions: [q] }
          expect(gradePage(page, { [`${q.id}:0`]: [option] }, 'strict').correct).toBe(option === oracle[i] ? 1 : 0)
        }
      }
    })
    const results = Object.fromEntries(test.pages.map((p) => [p.id, gradePage(p, answers, 'strict')]))
    const result = combinePageResults(test, results)
    expect(result.correct).toBe(oracle.filter(Boolean).length)
    expect(result.manual).toBe(oracle.filter((a) => a === null).length)
    expect(result.wrong).toBe(0)
    expect(result.total).toBe(questions.length)
    // Replacing a checked page, rather than accumulating attempts.
    const first = test.pages[0]
    results[first.id] = gradePage(first, {}, 'strict')
    expect(combinePageResults(test, results).correct).toBe(result.correct - first.questions.length)
    expect(combinePageResults(test, results).total).toBe(result.total)
    expect(buildSolutionEntries(test, {}, {}).flatMap((g) => g.entries).every((e) => !e.revealed)).toBe(true)
  })
})
