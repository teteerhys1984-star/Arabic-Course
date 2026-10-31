import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { lessonRegistry } from '../registry'
import { getSectionLessons } from '../../sections/sectionRegistry'
import { buildSolutionEntries, combinePageResults, gradePage, type AnswerMap, type TestQuestion } from '../../shared/test'
import {
  title, objectives, coverage, fiveNouns, signTable, conditionList, commonErrors, methodSteps,
  comparisonMarks, challengeQuestions, challengeTest, examQuestions, examParsing, testDefinition,
  homeworkSentences, homeworkParsing, compositionModels, homeworkCriteria, mindMap, summary,
  masteryChallenge, nextLesson, originalParadigm, fiveNounsParadigm, abExamples, akhExamples,
  hamExamples, fuExamples, famExamples, dhuExamples, singularCondition, possessiveCondition,
  notPossessiveCondition, yaaCondition, dhuCondition, fuCondition, workedExamples,
  type Example,
} from './content'

const allExamples: Example[] = [
  ...originalParadigm, ...fiveNounsParadigm, ...abExamples, ...akhExamples, ...hamExamples,
  ...fuExamples, ...famExamples, ...dhuExamples, ...singularCondition, ...possessiveCondition,
  ...notPossessiveCondition, ...yaaCondition, ...dhuCondition, ...fuCondition, ...workedExamples,
  ...masteryChallenge,
]

describe('basics lesson 14 — registration and audited source', () => {
  it('registers once at the end of the basics sequence, independent of every other lesson 14', () => {
    expect(lessonRegistry.filter((lesson) => lesson.id === 'basics-lesson-14')).toEqual([
      expect.objectContaining({
        number: '١٤',
        sectionId: 'basics-grammar',
        available: true,
        title: 'الأسماء الخمسة: كيف نُعرب الأسماء بالواو والألف والياء؟',
      }),
    ])
    const basics = getSectionLessons('basics-grammar').map((lesson) => lesson.id)
    expect(basics).toEqual([...Array.from({ length: 13 }, (_, index) => `lesson-${index + 1}`), 'basics-lesson-14'])
    expect(basics[basics.length - 1]).toBe('basics-lesson-14')
    expect(new Set(lessonRegistry.map((lesson) => lesson.id)).size).toBe(lessonRegistry.length)
    // The spelling and morphology lesson 14 slots stay unused, and no unit assessment appears.
    expect(lessonRegistry.some((lesson) => lesson.id === 'spelling-lesson-14')).toBe(false)
    expect(lessonRegistry.filter((lesson) => lesson.id === 'morphology-lesson-14')).toEqual([expect.objectContaining({ sectionId: 'morphology', number: '١٤' })])
    expect(lessonRegistry.some((lesson) => /unit.*test/.test(lesson.id))).toBe(false)
    // The pre-existing lesson 8 keeps its own id, title and position: nothing was replaced.
    expect(lessonRegistry.filter((lesson) => lesson.id === 'lesson-8')).toEqual([
      expect.objectContaining({ number: '٨', title: 'الأسماء الخمسة', sectionId: 'basics-grammar' }),
    ])
  })

  it('leaves every earlier registry entry byte-identical to the frozen inventory baseline', () => {
    const current = readFileSync('src/lessons/registry.ts', 'utf8')
    const inventory = JSON.parse(readFileSync('docs/lesson-12-source-inventory.json', 'utf8')) as {
      registrySha256: string
      previousRuntimeSha256: Record<string, string>
    }
    const hash = (text: string) => createHash('sha256').update(text).digest('hex')
    const stripped = current
      .replace(/ {2}\{\n {4}id: 'lesson-12',[\s\S]*?\n {2}\},\n/, '')
      .replace(/ {2}\{\n {4}id: 'lesson-13',[\s\S]*?\n {2}\},\n/, '')
      .replace(/ {2}\{\n {4}id: 'morphology-lesson-13',[\s\S]*?\n {2}\},\n/, '')
      .replace(/ {2}\{\n {4}id: 'morphology-lesson-14',[\s\S]*?\n {2}\},\n/, '')
      .replace(/ {2}\{\n {4}id: 'spelling-lesson-13',[\s\S]*?\n {2}\},\n/, '')
      .replace(/ {2}\{\n {4}id: 'basics-lesson-14',[\s\S]*?\n {2}\},\n/, '')
    expect(hash(stripped)).toBe(inventory.registrySha256)
    expect(Object.keys(inventory.previousRuntimeSha256).length).toBeGreaterThan(100)
    for (const [path, digest] of Object.entries(inventory.previousRuntimeSha256)) {
      expect(hash(readFileSync(path, 'utf8')), path).toBe(digest)
    }
  })

  it('keeps the verbatim source and applies only the six documented corrections', () => {
    const source = readFileSync('docs/source/lesson-14-five-nouns.md', 'utf8')
    expect(source).toContain('الدرس الرابع عشر: الأسماء الخمسة')
    expect(source).toContain('الأسماء الخمسة هي: أب، أخ، حم، فو، ذو.')
    expect(source).toContain('العلامة الكاملة: 20 درجة')
    expect(source).toContain('والدرس التالي في التسلسل المعتمد هو **كان وأخواتها**.')
    expect(createHash('sha256').update(source).digest('hex')).toBe('998ac41976a7aa3fa0338a70b0987be439532c1a54dda98552a701962f1b3d02')

    const displayed = readFileSync('src/lessons/basics-lesson-14/content.ts', 'utf8')
    // ت-1: the vague yaa-al-mutakallim wording never reaches the display.
    expect(displayed).not.toContain('تُقدّر العلامات الإعرابية بحسب القاعدة المناسبة')
    expect(displayed).toContain('الضمة المقدرة على ما قبل ياء المتكلم')
    expect(displayed).toContain('منع من ظهورها اشتغال المحل بحركة المناسبة')
    // ت-2: the source key «فا» is documented, but the parsed word is «فاكَ».
    expect(displayed).toContain('ونسب المصدر الإعراب إلى «فا»')
    expect(displayed).toContain("fiveAccused('فاكَ', 'مفعول به')")
    // ت-3: «الاسم المفرد غالبًا» is never a comparison row.
    expect(comparisonMarks.some((row) => row.type.includes('غالبًا'))).toBe(false)
    expect(displayed).toContain('عبارة «الاسم المفرد غالبًا» خطأ في التعميم')
    // ت-5: «مع» is an adverb, never a preposition.
    expect(displayed).toContain('«مع» هنا ليست حرف جر')
    expect(displayed).not.toMatch(/مع:\s*حرف جر/)
    // ت-6: the ambiguous correction exercise keeps its intended meaning.
    expect(displayed).toContain('هذا أبٌ كريمٌ')
    expect(readFileSync('docs/basics-lesson-14-audit.md', 'utf8')).toContain('ت-6')
  })

  it('maps all twenty audited axes to implemented steps, and keeps the source structure', () => {
    const component = readFileSync('src/lessons/LessonBasicsFourteen.tsx', 'utf8')
    const stepIds = new Set([...Array.from(component.matchAll(/id: '([^']+)'/g), (match) => match[1]), 'exam-1'])
    expect(coverage).toHaveLength(20)
    for (const [, id] of coverage) expect(stepIds.has(id)).toBe(true)
    expect(objectives).toHaveLength(7)
    expect(fiveNouns.map((row) => row.name)).toEqual(['أب', 'أخ', 'حم', 'فو', 'ذو'])
    expect(signTable.map((row) => [row.state, row.sign])).toEqual([['الرفع', 'الواو'], ['النصب', 'الألف'], ['الجر', 'الياء']])
    expect(conditionList.map((condition) => condition.title)).toEqual([
      'أن تكون مفردة',
      'أن تكون مضافة',
      'ألّا تُضاف إلى ياء المتكلم',
      'أن تكون «ذو» بمعنى صاحب',
      'أن تكون «فو» خالية من الميم',
    ])
    expect(commonErrors).toHaveLength(5)
    expect(methodSteps).toHaveLength(4)
    expect(comparisonMarks.map((row) => [row.raf, row.nasb, row.jarr])).toEqual([
      ['الضمة', 'الفتحة', 'الكسرة'],
      ['الألف', 'الياء', 'الياء'],
      ['الواو', 'الياء', 'الياء'],
      ['الضمة', 'الكسرة', 'الكسرة'],
      ['الواو', 'الألف', 'الياء'],
    ])
    expect(mindMap.names).toEqual(['أب', 'أخ', 'حم', 'فو', 'ذو'])
    expect(mindMap.conditions).toHaveLength(5)
    expect(summary.join(' ')).toContain('تُجرّ الأسماء الخمسة بالياء')
    expect(masteryChallenge).toHaveLength(5)
    expect(nextLesson.title).toBe('كان وأخواتها')
    expect(nextLesson.route).toBe('#/lesson/lesson-9')
    // The next lesson is a real registered route, not a dead link.
    expect(lessonRegistry.some((lesson) => lesson.id === 'lesson-9' && lesson.title === 'كان وأخواتها')).toBe(true)
    expect(component).toContain('nextLesson.route')
    expect(component).not.toMatch(/<img|https?:\/\//)
    expect(component).toContain('role="img"')
    expect(title).toBe('الأسماء الخمسة')
  })
})

describe('basics lesson 14 — teaching content fidelity', () => {
  it('parses every displayed example completely: role, state, mark and reason', () => {
    expect(allExamples.length).toBeGreaterThanOrEqual(40)
    for (const example of allExamples) {
      expect(example.parsing.length).toBeGreaterThanOrEqual(2)
      const joined = example.parsing.join(' ')
      expect(joined).toMatch(/علامة/)
      expect(joined).toMatch(/(لأنه|وهو مضاف|لا محل له|الظاهرة على آخره|منع من ظهورها|في محل رفع|في محل نصب|اسم إشارة)/)
      if (example.focus) {
        expect(example.parsing.some((line) => line.startsWith(`${example.focus}:`)), example.sentence).toBe(true)
      }
    }
  })

  it('keeps the yaa-al-mutakallim rule precise and never claims a visible letter marker', () => {
    for (const example of yaaCondition) {
      const joined = example.parsing.join(' ')
      expect(joined).toContain('المقدرة على ما قبل ياء المتكلم')
      expect(joined).toContain('منع من ظهورها اشتغال المحل بحركة المناسبة')
      expect(joined).toContain('ياء المتكلم ضمير متصل')
      expect(joined).not.toContain('مرفوع بالواو')
      expect(joined).not.toContain('منصوب بالألف')
    }
    // A pronoun other than yaa keeps the visible letters.
    expect(possessiveCondition.map((example) => example.focus)).toEqual(['أبو', 'أخو', 'أبونا'])
    expect(possessiveCondition[2].parsing.join(' ')).toContain('الواو')
  })

  it('keeps the five names, the letter signs and the fu/fam distinction', () => {
    expect(abExamples.map((example) => example.focus)).toEqual(['أبوكَ', 'أباكَ', 'أبيكَ'])
    expect(akhExamples.map((example) => example.focus)).toEqual(['أخوكَ', 'أخاكَ', 'أخيكَ'])
    expect(hamExamples.map((example) => example.focus)).toEqual(['حموكَ', 'حماكَ', 'حميكَ'])
    expect(fuExamples.map((example) => example.focus)).toEqual(['فوكَ', 'فاكَ', 'فيكَ'])
    expect(dhuExamples.map((example) => example.focus)).toEqual(['ذو', 'ذا', 'ذي'])
    expect(fuExamples[0].parsing.join(' ')).toContain('الواو')
    expect(fuExamples[1].parsing.join(' ')).toContain('الألف')
    expect(fuExamples[2].parsing.join(' ')).toContain('الياء')
    // «فم» with its meem stays outside the five-noun rule.
    expect(famExamples.map((example) => example.focus)).toEqual(['فمٌ', 'فمًا', 'فمٍ'])
    for (const example of famExamples) expect(example.parsing.join(' ')).not.toContain('الأسماء الخمسة')
    expect(fuCondition[1].parsing.join(' ')).toContain('لأن الميم باقية')
  })

  it('exposes the three homework activities with model answers and correction criteria', () => {
    expect(homeworkSentences).toHaveLength(5)
    expect(homeworkSentences.map((row) => row.answer)).toEqual(['أبوكَ', 'أخاكَ', 'أبيكَ', 'ذو', 'ذي'])
    expect(homeworkParsing).toHaveLength(5)
    for (const row of homeworkParsing) {
      expect(row.parsing.join(' ')).toContain('علامة')
      expect(row.parsing.some((line) => line.startsWith(`${row.target}:`))).toBe(true)
    }
    expect(compositionModels).toHaveLength(5)
    expect(compositionModels.map((row) => row.name)).toEqual(['أب', 'أخ', 'حم', 'فو', 'ذو'])
    for (const state of ['مرفوع', 'منصوب', 'مجرور']) {
      expect(compositionModels.some((row) => row.state === state)).toBe(true)
    }
    expect(homeworkCriteria).toHaveLength(4)
    expect(homeworkCriteria.join(' ')).toContain('خمس جمل')
  })
})

describe('basics lesson 14 — challenge oracle (8 questions, «صحّح إجاباتي»)', () => {
  const oracle = ['أبوكَ', 'أخاكَ', 'أبيكَ', 'جاء أبوكَ.', 'ذو', 'اسم مجرور بالياء؛ لأنه من الأسماء الخمسة.', 'الألف.', 'كتاب.']

  it('keeps the eight source questions with unique options and teaching explanations', () => {
    expect(challengeQuestions.map((question) => question.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(new Set(challengeQuestions.map((question) => question.id)).size).toBe(8)
    challengeQuestions.forEach((question, index) => {
      const field = question.fields[0]
      if (field.kind !== 'choice') throw new Error('choice expected')
      expect(field.answer).toBe(oracle[index])
      expect(field.options).toContain(field.answer)
      expect(new Set(field.options).size).toBe(field.options.length)
      expect(question.explanation!.length).toBeGreaterThan(40)
      expect(question.answerSource).toBe('platform')
    })
    expect(challengeTest.pages).toHaveLength(1)
    expect(challengeTest.pages[0].questions).toHaveLength(8)
  })

  it('grades only the chosen answer as correct on the practice page', () => {
    challengeQuestions.forEach((question, index) => {
      const field = question.fields[0]
      if (field.kind !== 'choice') throw new Error('choice expected')
      expect(gradePage({ id: 'single', title: 'single', questions: [question] }, { [`${question.id}:0`]: [field.answer] }, 'strict').correct).toBe(1)
      for (const option of field.options) {
        const result = gradePage({ id: 'single', title: 'single', questions: [question] }, { [`${question.id}:0`]: [option] }, 'strict')
        expect(result.correct).toBe(option === oracle[index] ? 1 : 0)
      }
    })
  })
})

describe('basics lesson 14 — independent exam: 20 questions, 20 points (5/4/6/5)', () => {
  it('keeps source order, sections and per-question keys', () => {
    expect(examQuestions.map((question) => question.number)).toEqual(Array.from({ length: 20 }, (_, index) => index + 1))
    expect(testDefinition.pages.map((page) => page.questions.length)).toEqual([5, 4, 6, 5])
    expect(new Set(examQuestions.map((question) => question.id)).size).toBe(20)
    expect(testDefinition.description).toContain('٢٠ درجة')
    for (const piece of ['٥ درجات', '٤ درجات', '٦ درجات']) expect(testDefinition.description).toContain(piece)
    for (const question of examQuestions) {
      expect(question.fields.length).toBeGreaterThan(0)
      expect(question.solution!.length).toBeGreaterThan(0)
      expect(question.explanation!.length).toBeGreaterThan(40)
      expect(question.teacherAnswer!.length).toBeGreaterThan(question.explanation!.length - 1)
      expect(question.answerSource).toBe('source')
    }
    expect(examQuestions.slice(0, 5).map((question) => question.sourceAnswer)).toEqual([
      'ب — الواو.', 'أ — الألف.', 'ج — الياء.', 'ب — جاء أبوكَ.', 'ب — مفعول به منصوب.',
    ])
    expect(examQuestions.slice(5, 9).map((question) => question.sourceAnswer)).toEqual([
      'أب، أخ، حم، فو، ذو.', 'الواو.', 'الألف.', 'الياء.',
    ])
    expect(examQuestions.slice(15, 20).map((question) => question.sourceAnswer)).toEqual([
      'جاء أبوكَ.', 'رأيتُ أباكَ.', 'مررتُ بأخيكَ.', 'أنتَ ذو علمٍ.', 'هذا أبٌ كريمٌ.',
    ])
  })

  it('asks for the five names in five fields and uses flexible text answers elsewhere', () => {
    const names = examQuestions[5]
    expect(names.fields).toHaveLength(5)
    expect(names.fields.map((field) => (field.kind === 'text' ? field.accept[0] : ''))).toEqual(['أب', 'أخ', 'حم', 'فو', 'ذو'])
    for (const question of examQuestions.slice(6, 9)) {
      const field = question.fields[0]
      if (field.kind !== 'text') throw new Error('text expected')
      expect(field.accept.length).toBeGreaterThanOrEqual(3)
    }
    for (const question of examQuestions.slice(15, 20)) {
      const field = question.fields[0]
      if (field.kind !== 'text') throw new Error('text expected')
      expect(field.accept.length).toBeGreaterThanOrEqual(2)
      expect(field.accept.some((value) => value.length > 6)).toBe(true)
    }
  })

  it('treats parsing 10–15 as manual-review essays with the four required elements', () => {
    for (const item of examParsing) {
      const question = examQuestions[item.number - 1]
      const field = question.fields[0]
      expect(field.kind).toBe('essay')
      expect(question.revealEssaySolution).toBe(true)
      for (const element of ['الوظيفة', 'الحالة الإعرابية', 'العلامة', 'السبب']) {
        expect(question.teacherAnswer).toContain(element)
      }
      expect(item.parsing.join(' ')).toContain('علامة')
    }
    expect(examParsing.map((item) => item.target)).toEqual(['أخوكَ', 'أباكَ', 'أخيكَ', 'ذو', 'ذي', 'فاكَ'])
    // The «مع» analysis is the platform's documented one: ظرف مضاف, not a preposition.
    expect(examParsing[2].teacherAnswer).toContain('اسم مجرور')
    expect(readFileSync('src/lessons/basics-lesson-14/content.ts', 'utf8')).toContain('مضاف إليه مجرور وعلامة جرّه الياء؛ لأنه من الأسماء الخمسة')
  })

  it('grades a full correct attempt as 14 auto points + 6 manual, with accepted variants', () => {
    const answers: AnswerMap = {}
    for (const question of examQuestions) {
      question.fields.forEach((field, index) => {
        if (field.kind === 'choice') answers[`${question.id}:${index}`] = [field.answer]
        else if (field.kind === 'text') answers[`${question.id}:${index}`] = [field.accept[0]]
        else answers[`${question.id}:${index}`] = ['إعراب مكتوب يراجعه المعلم']
      })
    }
    const results = Object.fromEntries(testDefinition.pages.map((page) => [page.id, gradePage(page, answers, 'strict')]))
    const combined = combinePageResults(testDefinition, results)
    expect(combined.correct).toBe(14)
    expect(combined.manual).toBe(6)
    expect(combined.wrong).toBe(0)
    expect(combined.total).toBe(20)

    const variant: AnswerMap = { ...answers }
    variant[`${examQuestions[7].id}:0`] = ['بالألف'] // «الألف» with the preposition
    variant[`${examQuestions[15].id}:0`] = ['جاء أبوك'] // unvowelled, no final stop
    variant[`${examQuestions[16].id}:0`] = ['أباكَ'] // the corrected word alone
    const variantResults = Object.fromEntries(testDefinition.pages.map((page) => [page.id, gradePage(page, variant, 'strict')]))
    expect(combinePageResults(testDefinition, variantResults).correct).toBe(14)

    const wrong: AnswerMap = { ...answers, [`${examQuestions[15].id}:0`]: ['جاء أباكَ'] }
    const wrongResults = Object.fromEntries(testDefinition.pages.map((page) => [page.id, gradePage(page, wrong, 'strict')]))
    expect(combinePageResults(testDefinition, wrongResults).wrong).toBe(1)

    const emptyResults = Object.fromEntries(testDefinition.pages.map((page) => [page.id, gradePage(page, {}, 'strict')]))
    const empty = combinePageResults(testDefinition, emptyResults)
    expect(empty.unanswered).toBe(20)
    expect(empty.correct).toBe(0)
    expect(buildSolutionEntries(testDefinition, {}, {}).flatMap((group) => group.entries).every((entry) => !entry.revealed)).toBe(true)
  })

  it('exposes every model answer — including per-question teacher phrasing — to the teacher area', () => {
    const questions: TestQuestion[] = examQuestions
    for (const question of questions) {
      expect(question.teacherAnswer).toBeTruthy()
      expect(question.teacherAnswer).not.toContain('حسب الكتاب')
    }
    // إعراب 15 documents the source's «فا» label without losing «فاكَ».
    expect(questions[14].teacherAnswer).toContain('فاكَ')
    expect(questions[14].teacherAnswer).toContain('فا')
  })
})
