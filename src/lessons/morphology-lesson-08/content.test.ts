/// <reference types="node" />
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import sourceMarkdown from '../../../docs/source/morphology-lesson-08.md?raw'
import lessonSource from '../LessonMorphologyEight.tsx?raw'
const lessonStyles = readFileSync('src/styles/morphology-lesson-08.css', 'utf8')
import * as C from './content'
import { EXPECTED_CONJUGATIONS, EXPECTED_TRAINING_KEYS, EXAM_ANSWERS } from './test-fixtures'

const S = C.sourceContent
const questions = C.testDefinition.pages.flatMap((page) => page.questions)
const trainingItems = S.trainings.groups.flatMap((group) => [...group.items])
const strings = (value: unknown): string[] => typeof value === 'string' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : []

// Keep exact harakat, punctuation and letter forms. Only markdown list markers are representational.
const substantiveLines = sourceMarkdown.split('\n').filter(Boolean).map((line) => line.replace(/^(?:- |\d+\. )/, ''))

describe('morphology 08 — the saved source is immutable and fully represented', () => {
  it('pins the UTF-8 raw file, including the ambiguous sentence and merged controls', () => {
    expect(createHash('sha256').update(sourceMarkdown).digest('hex')).toBe('c6f7e9e834258d2075b036d1c62469ffd2a83532afbc6d8fbb903f9391148dbd')
    expect(sourceMarkdown.split('\n')).toHaveLength(503)
    expect(sourceMarkdown).toContain('- كَتَبَتْ: التاء هنا تدلّ على الغائبة، أي هي.')
    expect(sourceMarkdown).toContain('إظهار الإجابات والتصحيحإعادة التدريبات')
    expect(sourceMarkdown.startsWith(S.header.firstTitle)).toBe(true)
    expect(sourceMarkdown.trimEnd().endsWith(S.nextLesson)).toBe(true)
  })

  it('covers every nonempty source line/cell without normalizing away vowels or rewriting prose', () => {
    const represented = strings(S).join('\n')
    expect(substantiveLines).toHaveLength(264)
    for (const line of substantiveLines) expect(represented, `Unrepresented source line: ${line}`).toContain(line)
  })

  it('keeps all nine section headings in source order', () => {
    expect(C.sourceSections).toEqual([
      'أولًا: ما معنى تصريف الأفعال؟',
      'ثانيًا: ما معنى الإسناد إلى الضمائر؟',
      'ثالثًا: مراجعة الضمائر',
      'رابعًا: تصريف الفعل الماضي مع الضمائر',
      'خامسًا: تصريف الفعل المضارع مع الضمائر',
      'سادسًا: إسناد فعل الأمر إلى الضمائر',
      'سابعًا: ما الفرق بين الضمير المتصل والضمير المنفصل في الفعل؟',
      'ثامنًا: تدريبات تفاعلية',
      'تاسعًا: خلاصة الدرس للحفظ',
    ])
    const offsets = C.sourceSections.map((heading) => sourceMarkdown.indexOf(heading))
    expect(offsets).toEqual([...offsets].sort((a, b) => a - b))
    expect(S.summary.points).toHaveLength(6)
  })

  it('preserves exactly the seven tables and all source examples in their original row order', () => {
    expect(S.pronouns.groups.map((group) => group.rows.length)).toEqual([2, 5, 5])
    for (const group of S.pronouns.groups) {
      const cells = [group.title, ...group.columns, ...group.rows.flatMap((row) => [row.label, row.meaning])]
      expect(sourceMarkdown).toContain(cells.join('\n\n'))
    }
    for (const tense of ['past', 'present', 'imperative'] as const) {
      const section = S[tense]
      const rows = tense === 'imperative' ? C.imperativeRows : C.conjugations
      const cells = [section.tableTitle, ...section.columns, ...rows.flatMap((row) => [row.label, row[tense], row[`${tense}Example`]])]
      expect(sourceMarkdown).toContain(cells.join('\n\n'))
    }
    expect(S.types.rows).toHaveLength(6)
    expect(sourceMarkdown).toContain([...S.types.columns, ...S.types.rows.flatMap((row) => [row.example, row.pronoun, row.kind])].join('\n\n'))
    expect(S.conjugation.examples).toHaveLength(5)
    expect(S.assignment.examples).toHaveLength(4)
    expect(S.past.notes).toHaveLength(6)
    expect(S.present.notes).toHaveLength(7)
    expect(S.imperative.examples).toEqual(['اُكْتُبْ.', 'اِجْلِسْ.', 'اِفْتَحْ.'])
  })

  it('preserves training prompts, numbering and every option in the source order', () => {
    expect(S.trainings.groups.map((group) => group.items.length)).toEqual([5, 3])
    expect(trainingItems.map((item) => item.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(trainingItems.map((item) => item.prompt)).toEqual([
      'أنا ___ الدرسَ أمس.', 'هي ___ القصةَ أمس.', 'نحن ___ الدرسَ الآن.', 'أنتِ ___ الواجبَ الآن.',
      'أنتم ___ الدرسَ أمس.', 'أنتَ: ___ الدرسَ.', 'أنتِ: ___ الدرسَ.', 'أنتم: ___ الدرسَ.',
    ])
    for (const item of trainingItems) {
      expect(sourceMarkdown).toContain([`${item.number}. ${item.prompt}`, ...item.options].join('\n\n'))
      const solution = C.trainingSolutions[item.number]
      expect(solution.answer).toBe(EXPECTED_TRAINING_KEYS[item.number - 1])
      expect([...item.options]).toContain(solution.answer)
      expect(solution.steps).toHaveLength(3)
      expect(solution.distractors).toHaveLength(2)
    }
    expect(C.trainingControls.reveal + C.trainingControls.reset).toBe(S.trainings.rawControls)
  })
})

describe('morphology 08 — independently audited conjugations and scientific distinctions', () => {
  it('lists 12 distinct personal pronouns grouped 2/5/5, but has 13 conjugation rows', () => {
    expect(C.pronouns.map((pronoun) => pronoun.label)).toEqual(['أنا', 'نحن', 'أنتَ', 'أنتِ', 'أنتما', 'أنتم', 'أنتنَّ', 'هو', 'هي', 'هما', 'هم', 'هنَّ'])
    expect(new Set(C.pronouns.map((pronoun) => pronoun.id)).size).toBe(12)
    expect(C.pronouns.filter((pronoun) => pronoun.person === 'addressee')).toHaveLength(5)
    expect(C.conjugations).toHaveLength(13)
    expect(new Set(C.conjugations.map((row) => row.pronounId)).size).toBe(12)
    expect(C.conjugations.filter((row) => row.pronounId === 'huma').map((row) => row.label)).toEqual(['هما (مذكر)', 'هما (مؤنث)'])
  })

  it.each(EXPECTED_CONJUGATIONS)('pins every form of %s, with its original harakat', (id, label, past, present, imperative) => {
    expect(C.conjugationFor(id)).toMatchObject({ id, label, past, present })
    expect(C.conjugationFor(id).imperative).toBe(imperative)
  })

  it('assigns direct commands to the five addressees only', () => {
    expect(C.imperativeRows.map((row) => row.label)).toEqual(['أنتَ', 'أنتِ', 'أنتما', 'أنتم', 'أنتنَّ'])
    expect(C.imperativeRows.map((row) => row.imperative)).toEqual(['اُكْتُبْ', 'اُكْتُبِي', 'اُكْتُبَا', 'اُكْتُبُوا', 'اُكْتُبْنَ'])
    for (const ending of C.imperativeEndings) {
      expect(C.imperativeRows.map((row) => row.imperative)).toContain(`اُكْتُ${ending}`)
      expect(ending).not.toMatch(/^\p{M}/u)
    }
  })

  it('models both ambiguous present forms without inventing extra pronouns', () => {
    expect(new Set(C.conjugations.map((row) => row.present)).size).toBe(11)
    expect(C.conjugations.filter((row) => row.present === 'تَكْتُبُ').map((row) => row.label)).toEqual(['أنتَ', 'هي'])
    expect(C.conjugations.filter((row) => row.present === 'تَكْتُبَانِ').map((row) => row.label)).toEqual(['أنتما', 'هما (مؤنث)'])
  })

  it('documents the taa distinction without silently replacing the source claim', () => {
    expect(S.assignment.examples[2]).toBe('كَتَبَتْ: التاء هنا تدلّ على الغائبة، أي هي.')
    expect(C.clarifications.taa).toContain('وليست فاعلًا')
    expect(C.clarifications.subjects).toContain('كَتَبَتْ الدرسَ')
    expect(C.clarifications.subjects).toContain('كَتَبَتْ فاطمةُ الدرسَ')
    expect(C.clarifications.subjects).toContain('ضمير مستتر تقديره «هي»')
    expect(C.clarifications.noon).toContain('الفعل معها مبني على السكون')
    expect(C.clarifications.waw).toContain('ليست ضميرًا')
    expect(S.types.rows.map((row) => row.pronoun)).not.toContain('تاء التأنيث')
  })

  it('never detaches harakat, introduces spaces, or changes a word when highlighting', () => {
    for (const row of C.conjugations) for (const tense of ['past', 'present', 'imperative'] as const) {
      const word = row[tense]
      if (!word) continue
      const parts = Object.values(C.verbParts(word, tense))
      expect(parts.join('')).toBe(word)
      for (const part of parts) expect(part).not.toMatch(/^\p{M}|\s/u)
    }
    expect(C.verbParts('تَكْتُبِينَ', 'present')).toEqual({ beginning: 'تَ', middle: 'كْتُ', ending: 'بِينَ' })
    expect(lessonStyles).toContain('white-space: nowrap')
    expect(lessonStyles).toContain('.morph8-verb > span { display: inline; padding: 0; margin: 0; }')
    expect(lessonStyles).toContain('@media (prefers-reduced-motion: reduce)')
    expect(() => C.conjugationFor('unknown')).toThrow('Unknown conjugation')
  })
})

describe('morphology 08 — platform-authored practice, test and teacher material', () => {
  it('has working audited lab keys, not decorative interactions', () => {
    expect(C.practiceLabs.map((lab) => lab.items.length)).toEqual([4, 5, 7, 4])
    expect(C.pastLab.items.map((item) => item.answer)).toEqual(['كَتَبْتُ', 'كَتَبْتَ', 'كَتَبْتِ', 'كَتَبْنَ'])
    expect(C.presentLab.items.map((item) => item.answer)).toEqual(['المخاطبة المفردة', 'جماعة المخاطبين', 'جماعة الغائبين', 'أنتَ', 'هي'])
    expect(C.typeLab.items.map((item) => item.answer)).toEqual(['منفصل', 'متصل', 'منفصل', 'متصل', 'منفصل', 'متصل', 'حرف تأنيث، لا ضمير'])
    expect(C.progressiveLab.items.map((item) => item.answer)).toEqual(['المتكلم', 'كَتَبَتَا', 'تَكْتُبْنَ', 'فاطمةُ'])
    for (const lab of C.practiceLabs) for (const item of lab.items) {
      expect(item.options.filter((option) => option === item.answer)).toHaveLength(1)
      expect(item.explanation.length).toBeGreaterThan(35)
    }
  })

  it('declares 20 independent questions in 4 pages, all graded by the shared schema', () => {
    expect(C.testDefinition.matching).toBe('strict')
    expect(C.testDefinition.pages.map((page) => page.questions.length)).toEqual([5, 5, 5, 5])
    expect(questions.map((question) => question.number)).toEqual(Array.from({ length: 20 }, (_, index) => index + 1))
    expect(new Set(questions.map((question) => question.id)).size).toBe(20)
    expect(new Set(questions.flatMap((question) => question.fields.map((field) => field.kind)))).toEqual(new Set(['choice', 'select', 'multi']))
    expect(questions.flatMap((question) => question.fields)).toHaveLength(24)
    for (const question of questions) {
      expect(question.answerSource).toBe('platform')
      expect(question.sourceAnswer).toBeUndefined()
      expect(question.rule!.length).toBeGreaterThan(25)
      expect(question.explanation!.length).toBeGreaterThan(80)
      expect(question.solution!.length).toBeGreaterThan(0)
      expect(trainingItems.map((item) => item.prompt)).not.toContain(question.prompt)
      expect(sourceMarkdown).not.toContain(question.prompt)
      question.fields.forEach((field, fieldIndex) => {
        const expected = EXAM_ANSWERS[`${question.id}:${fieldIndex}`]
        expect(expected).toBeDefined()
        if (field.kind === 'multi') expect(field.answers).toEqual(expected)
        else if (field.kind === 'choice' || field.kind === 'select') expect(field.answer).toBe(expected[0])
        else throw new Error('Unexpected field kind: harakat-sensitive conjugations must use closed choices')
      })
    }
  })

  it('never publishes final-test question solutions in educational lab data', () => {
    const studentTeaching = JSON.stringify([S, C.objectives, C.clarifications, C.practiceLabs, C.trainingSolutions])
    for (const question of questions) {
      expect(studentTeaching).not.toContain(question.id)
      expect(studentTeaching).not.toContain(question.prompt)
      expect(studentTeaching).not.toContain(question.explanation)
    }
    for (const reservedForm of ['لَعِبْتُ', 'لَعِبْتُنَّ', 'جَلَسَتَا', 'تَلْعَبِينَ', 'اِجْلِسَا', 'اِفْتَحْنَ', 'جَلَسْنَا']) {
      expect(studentTeaching).not.toContain(reservedForm)
    }
    expect(lessonSource).not.toMatch(/data-(?:answer|correct|solution)=/)
  })

  it('has all nine teacher topics, source/audit references, and no lesson 9 or unit test', () => {
    expect(C.teacherTopics.map((topic) => topic.heading)).toEqual(C.sourceSections)
    expect(C.teacherReferences.source).toBe('docs/source/morphology-lesson-08.md')
    expect(C.teacherReferences.audit).toBe('docs/morphology-lesson-08-audit.md')
    expect(C.teacherReferences.note).toContain('لا بايتات رسالة المحادثة الأصلية')
    expect(lessonSource).toContain('<TeacherSpace>')
    expect(lessonSource).not.toContain('password=')
    expect(lessonSource).not.toContain('morphology-lesson-09')
    expect(C.testDefinition.id).toBe('morphology-lesson-08-test')
    expect(C.arabicDigits(20)).toBe('٢٠')
  })
})
