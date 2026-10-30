import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { lessonRegistry } from '../registry'
import { getSectionLessons } from '../../sections/sectionRegistry'
import { buildSolutionEntries, combinePageResults, gradePage, type AnswerMap, type TestQuestion } from '../../shared/test'
import {
  marks, teachingSections, challengeQuestions, challengeTest, examQuestions,
  examParsing, testDefinition, homework, summary, coverage, methodSteps, commonErrors,
  reviewExamples, dualRaised, dualAccusative, dualGenitive, masculineRaised, masculineAccusative,
  masculineGenitive, feminineRaised, feminineAccusative, feminineGenitive, kasraDistinguish, workedExample,
} from './content'

describe('lesson 13 — registration and audited source', () => {
  it('registers once after lesson 12 in basics only; retains every previous registry entry verbatim', () => {
    expect(lessonRegistry.filter((l) => l.id === 'lesson-13')).toEqual([
      expect.objectContaining({ number: '١٣', sectionId: 'basics-grammar', available: true, title: 'علامات الإعراب الفرعية' }),
    ])
    expect(getSectionLessons('basics-grammar').map((l) => l.id)).toEqual([...Array.from({ length: 13 }, (_, i) => `lesson-${i + 1}`), 'basics-lesson-14'])
    // No unit test, and no lesson outside this task's scope (lesson 14 / a further spelling lesson).
    expect(lessonRegistry.some((l) => l.id === 'lesson-14' || /unit.*test/.test(l.id))).toBe(false)
    expect(lessonRegistry.some((l) => l.id === 'spelling-lesson-14')).toBe(false)
    expect(getSectionLessons('morphology').filter((l) => l.id === 'morphology-lesson-13')).toHaveLength(1)
    const current = readFileSync('src/lessons/registry.ts', 'utf8')
    const inventory = JSON.parse(readFileSync('docs/lesson-12-source-inventory.json', 'utf8')) as {
      registrySha256: string
      previousRuntimeSha256: Record<string, string>
    }
    const hash = (text: string) => createHash('sha256').update(text).digest('hex')
    const previousEntry = current.match(/ {2}\{\n {4}id: 'lesson-12',[\s\S]*?\n {2}\},\n/)
    const added = current.match(/ {2}\{\n {4}id: 'lesson-13',[\s\S]*?\n {2}\},\n/)
    const morphologyEntry = current.match(/ {2}\{\n {4}id: 'morphology-lesson-13',[\s\S]*?\n {2}\},\n/)
    const spellingEntry = current.match(/ {2}\{\n {4}id: 'spelling-lesson-13',[\s\S]*?\n {2}\},\n/)
    const nextLessonEntry = current.match(/ {2}\{\n {4}id: 'basics-lesson-14',[\s\S]*?\n {2}\},\n/)
    expect(previousEntry).not.toBeNull()
    expect(added).not.toBeNull()
    expect(morphologyEntry).not.toBeNull()
    expect(spellingEntry).not.toBeNull()
    expect(nextLessonEntry).not.toBeNull()
    // Preserve the frozen basics registry baseline while excluding this lesson, the
    // independently registered morphology and spelling lesson 13s added alongside it,
    // and the later independent basics lesson 14 registration.
    const baseline = current.replace(previousEntry![0], '').replace(added![0], '').replace(morphologyEntry![0], '').replace(spellingEntry![0], '').replace(nextLessonEntry![0], '')
    expect(hash(baseline)).toBe(inventory.registrySha256)
    expect(Object.keys(inventory.previousRuntimeSha256).length).toBeGreaterThan(100)
    for (const [path, digest] of Object.entries(inventory.previousRuntimeSha256)) {
      expect(hash(readFileSync(path, 'utf8')), path).toBe(digest)
    }
  })

  it('keeps the verbatim source file and applies only the five documented corrections', () => {
    const source = readFileSync('docs/source/lesson-13-subordinate-inflection-marks.md', 'utf8')
    expect(source).toContain('علامات الإعراب الفرعية')
    expect(source).toContain('المثنّى: ألفٌ في الرفع، وياءٌ في النصب والجر.')
    expect(source).toContain('العلامة الكاملة: 20 درجة')
    expect(createHash('sha256').update(source).digest('hex')).toBe('4efd5b872272e4ebdc7432e21cf1c3338379ab47bc1a087b89f7e9516af35bc4')

    const displayed = readFileSync('src/lessons/lesson-thirteen/content.ts', 'utf8')
    // ت-1: the ambiguous «كرّمتِ المديرةُ» forms never reach the displayed content.
    expect(displayed).not.toContain('كرّمتِ المديرةُ')
    expect(displayed).toContain('كرَّمَ المديرُ المجتهداتِ.')
    expect(displayed).toContain('كرَّمَ المديرُ الطالباتِ.')
    // ت-2: connected preposition spelling, never the spaced «بـ » notation.
    expect(displayed).not.toContain('بـ المعلّمَيْنِ')
    expect(displayed).not.toContain('بـ الطالبَيْنِ')
    expect(displayed).toContain('مررتُ بالمعلّمَيْنِ.')
    expect(displayed).toContain('مررتُ بالطالبَيْنِ.')
    // ت-3: «وصلتِ المعلّمتانِ» retained, with the ta' disambiguation.
    expect(displayed).toContain('وصلتِ المعلّمتانِ.')
    expect(displayed).toContain('وليست تاء مخاطبة.')
    // ت-4: «مع» is an added adverb and the word after it is مضاف إليه — never «حرف جر».
    expect(displayed).toContain('معَ: ظرف منصوب وعلامة نصبه الفتحة الظاهرة على آخره، وهو مضاف؛ «مع» هنا ليست حرف جر.')
    expect(displayed).not.toMatch(/مع:\s*حرف جر/)
  })

  it('maps all twenty audited axes to implemented steps', () => {
    const component = readFileSync('src/lessons/LessonThirteen.tsx', 'utf8')
    const stepIds = [...teachingSections.map((s) => s.id), ...Array.from(component.matchAll(/id: '([^']+)'/g), (m) => m[1]), 'exam-1']
    expect(coverage).toHaveLength(20)
    for (const [, id] of coverage) expect(stepIds).toContain(id)
    expect(component).toContain('<TeacherSpace>')
    expect(component).toContain('mode="teacher"')
    expect(component).toContain('revealFeedback={false}')
    expect(component).toContain('صحّح إجاباتي')
    expect(component).not.toMatch(/<img|https?:\/\//)
    expect(component).toContain('role="img"')
  })
})

describe('lesson 13 — teaching content fidelity', () => {
  it('keeps the complete sign matrix, memory phrases and the four-step method', () => {
    expect(marks.map((m) => m.signs)).toEqual([
      ['الألف', 'الياء', 'الياء'],
      ['الواو', 'الياء', 'الياء'],
      ['الضمة', 'الكسرة نيابةً عن الفتحة', 'الكسرة'],
    ])
    for (const row of marks) expect(row.memory.length).toBeGreaterThan(10)
    expect(methodSteps).toHaveLength(4)
    expect(methodSteps[0]).toContain('موقعها')
    expect(methodSteps[1]).toContain('نوعها')
    expect(commonErrors.map((e) => e.wrong)).toEqual(['حضرَ الطالبَيْنِ.', 'كرّمتُ المعلّمونَ.', 'الطالباتِ في «كرّمتُ الطالباتِ» اسم مجرور.'])
    expect(summary.join(' ')).toContain('الكسرة قد تكون علامة نصب')
  })

  it('parses every displayed example completely: role, state, mark and reason', () => {
    const all = [...reviewExamples, ...dualRaised, ...dualAccusative, ...dualGenitive, ...masculineRaised,
      ...masculineAccusative, ...masculineGenitive, ...feminineRaised, ...feminineAccusative, ...feminineGenitive,
      ...kasraDistinguish, workedExample]
    expect(all.length).toBeGreaterThanOrEqual(18)
    for (const example of all) {
      expect(example.parsing.length).toBeGreaterThanOrEqual(2)
      const joined = example.parsing.join(' ')
      expect(joined).toMatch(/علامة/)
      expect(joined).toMatch(/(لأنه|وهو مضاف|لا محل له|الظاهرة على آخره)/)
    }
    // The target word of every example is itself parsed in full.
    for (const example of all.filter((e) => e.focus)) {
      expect(example.parsing.some((line) => line.startsWith(`${example.focus}:`))).toBe(true)
    }
  })

  it('exposes the five model homework sentences with complete parsing', () => {
    expect(homework.map((h) => h.focus)).toEqual(['المعلّمانِ', 'المجتهدينَ', 'المعلّماتِ'])
    for (const row of homework) {
      expect(row.model).toContain('المدرسة')
      expect(row.parsing.join(' ')).toContain('علامة')
      expect(row.parsing.some((line) => line.startsWith(`${row.focus}:`))).toBe(true)
    }
  })
})

describe('lesson 13 — challenge oracle (8 questions, «صحّح إجاباتي»)', () => {
  const oracle = ['الألف', 'الياء', 'الياء', 'الواو', 'الياء', 'الكسرة نيابةً عن الفتحة', 'الكسرة', 'حضرَ الطالبانِ']

  it('keeps the eight source questions with unique options and teaching explanations', () => {
    expect(challengeQuestions.map((q) => q.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(new Set(challengeQuestions.map((q) => q.id)).size).toBe(8)
    challengeQuestions.forEach((q, i) => {
      const field = q.fields[0]
      if (field.kind !== 'choice') throw new Error('choice expected')
      expect(field.answer).toBe(oracle[i])
      expect(field.options).toContain(field.answer)
      expect(new Set(field.options).size).toBe(field.options.length)
      expect(q.explanation!.length).toBeGreaterThan(40)
    })
  })

  it('grades only the checked answer as correct on its page', () => {
    expect(challengeTest.pages[0].id).toBe('thirteen-challenge-page')
    challengeQuestions.forEach((q, i) => {
      const field = q.fields[0]
      if (field.kind !== 'choice') throw new Error('choice expected')
      expect(gradePage({ id: 'single', title: 'single', questions: [q] }, { [`${q.id}:0`]: [field.answer] }, 'strict').correct).toBe(1)
      for (const option of field.options) {
        const result = gradePage({ id: 'single', title: 'single', questions: [q] }, { [`${q.id}:0`]: [option] }, 'strict')
        expect(result.correct).toBe(option === oracle[i] ? 1 : 0)
      }
    })
  })
})

describe('lesson 13 — independent exam: 20 questions, 20 points (5/5/6/4)', () => {
  it('keeps source order, sections and per-question keys', () => {
    expect(examQuestions.map((q) => q.number)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
    expect(testDefinition.pages.map((p) => p.questions.length)).toEqual([5, 5, 6, 4])
    expect(new Set(examQuestions.map((q) => q.id)).size).toBe(20)
    expect(testDefinition.description).toContain('٢٠ درجة')
    expect(testDefinition.description).toContain('٥ درجات')
    expect(testDefinition.description).toContain('٦ درجات')
    expect(testDefinition.description).toContain('٤ درجات')
    for (const question of examQuestions) {
      expect(question.fields.length).toBeGreaterThan(0)
      expect(question.solution!.length).toBeGreaterThan(0)
      expect(question.explanation!.length).toBeGreaterThan(40)
      expect(question.teacherAnswer!.length).toBeGreaterThan(question.explanation!.length - 1)
      expect(['source', 'platform']).toContain(question.answerSource)
    }
    // Source keys preserved verbatim on every question.
    const mcqKeys = examQuestions.slice(0, 5).map((q) => q.sourceAnswer)
    expect(mcqKeys).toEqual(['ب — الألف.', 'ج — الياء.', 'أ — الكسرة نيابةً عن الفتحة.', 'ب — الياء.', 'ج — نجحَ المجتهدونَ.'])
    const fillKeys = examQuestions.slice(5, 10).map((q) => q.sourceAnswer)
    expect(fillKeys).toEqual(['الألف.', 'الياء.', 'الواو.', 'الياء.', 'الكسرة.'])
    const correctionKeys = examQuestions.slice(16, 20).map((q) => q.sourceAnswer)
    expect(correctionKeys).toEqual(['حضرَ الطالبانِ.', 'رأيتُ المعلّمينَ.', 'كرّمتُ الطالباتِ.', 'سلّمتُ على الطالبَيْنِ.'])
  })

  it('uses flexible text answers for fill-in and correction — never naive single-string matching', () => {
    for (const question of examQuestions.slice(5, 10)) {
      const field = question.fields[0]
      if (field.kind !== 'text') throw new Error('text expected')
      expect(field.accept.length).toBeGreaterThanOrEqual(3)
    }
    for (const question of examQuestions.slice(16, 20)) {
      const field = question.fields[0]
      if (field.kind !== 'text') throw new Error('text expected')
      // Accepts both the full corrected sentence and the corrected word alone.
      expect(field.accept.length).toBeGreaterThanOrEqual(2)
      expect(field.accept.some((a) => a.length > 6)).toBe(true)
      expect(field.accept.some((a) => a.length <= 12)).toBe(true)
    }
  })

  it('treats parsing 11–16 as manual-review essays with the four required elements', () => {
    for (const item of examParsing) {
      const question = examQuestions[item.number - 1]
      const field = question.fields[0]
      expect(field.kind).toBe('essay')
      expect(question.revealEssaySolution).toBe(true)
      const teacher = question.teacherAnswer!
      for (const element of ['الوظيفة', 'الحالة الإعرابية', 'العلامة', 'السبب']) expect(teacher).toContain(element)
      if ([11, 13, 16].includes(item.number)) expect(teacher).toContain('مثنّى')
      if ([12, 15].includes(item.number)) expect(teacher).toContain('جمع مذكر سالم')
      if (item.number === 14) expect(teacher).toContain('جمع مؤنث سالم')
      expect(item.parsing.join(' ')).toContain('علامة')
    }
  })

  it('grades a full correct attempt as 14 auto points + 6 manual, with accepted spelling variants', () => {
    const answers: AnswerMap = {}
    for (const question of examQuestions) {
      const field = question.fields[0]
      if (field.kind === 'choice') answers[`${question.id}:0`] = [field.answer]
      else if (field.kind === 'text') answers[`${question.id}:0`] = [field.accept[0]]
      else answers[`${question.id}:0`] = ['إعراب مكتوب يراجعه المعلم']
    }
    const results = Object.fromEntries(testDefinition.pages.map((p) => [p.id, gradePage(p, answers, 'strict')]))
    const combined = combinePageResults(testDefinition, results)
    expect(combined.correct).toBe(14)
    expect(combined.manual).toBe(6)
    expect(combined.wrong).toBe(0)
    expect(combined.total).toBe(20)

    // Orthographic variants count as correct (harakat/alef/prefix flexibility).
    const variantAnswers: AnswerMap = { ...answers }
    variantAnswers[`${examQuestions[5].id}:0`] = ['الف'] // «الألف» without ال
    variantAnswers[`${examQuestions[9].id}:0`] = ['بالكسرة'] // «الكسرة» with preposition
    variantAnswers[`${examQuestions[16].id}:0`] = ['حضر الطالبان.'] // unvowelled + punctuation
    variantAnswers[`${examQuestions[17].id}:0`] = ['المعلّمينَ'] // corrected word alone
    const variantResults = Object.fromEntries(testDefinition.pages.map((p) => [p.id, gradePage(p, variantAnswers, 'strict')]))
    expect(combinePageResults(testDefinition, variantResults).correct).toBe(14)

    // A wrong mark stays wrong even with flexible matching.
    const wrong: AnswerMap = { ...answers, [`${examQuestions[16].id}:0`]: ['حضرَ الطالبَيْنِ'] }
    const wrongResults = Object.fromEntries(testDefinition.pages.map((p) => [p.id, gradePage(p, wrong, 'strict')]))
    expect(combinePageResults(testDefinition, wrongResults).wrong).toBe(1)

    // Unanswered essays are «لم تُجب», answered ones are manual — never auto-correct.
    const emptyResults = Object.fromEntries(testDefinition.pages.map((p) => [p.id, gradePage(p, {}, 'strict')]))
    const empty = combinePageResults(testDefinition, emptyResults)
    expect(empty.unanswered).toBe(20)
    expect(empty.correct).toBe(0)

    expect(buildSolutionEntries(testDefinition, {}, {}).flatMap((g) => g.entries).every((e) => !e.revealed)).toBe(true)
  })

  it('exposes every model answer — including question-by-question teacher phrasing — to the teacher area', () => {
    const questions: TestQuestion[] = examQuestions
    for (const question of questions) {
      expect(question.teacherAnswer).toBeTruthy()
      expect(question.teacherAnswer).not.toContain('حسب الكتاب')
    }
    expect(questions[13].teacherAnswer).toContain('ت-1') // correction documented on Q14
    expect(questions[15].teacherAnswer).toContain('ت-2') // correction documented on Q16
  })
})
