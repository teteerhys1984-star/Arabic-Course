/**
 * اختبارات طبقة محتوى الدرس السادس من قسم الصرف (الفعل الرباعي المجرّد والمزيد).
 *
 * تغطي:
 *  - وفاء المصدر: بقاء نص docs/source/morphology-lesson-06.md حرفيًا في طبقة المحتوى؛
 *  - بنية اختبار المنصة: ٢٠ سؤالًا جديدًا في ٤ صفحات، كلها اختيار من متعدد تُصحَّح آليًا؛
 *  - أن أسئلة الاختبار ليست نسخًا من تدريبات المصدر (غ-8)؛
 *  - حصر الأفعال المساندة الموثّقة (غ-2) في الاختبار ومنطقة المعلّم دون متن الشرح والأنشطة؛
 *  - اتساق التحليل الصرفي: الوزن، والأصول، والحرف الزائد، ومقابلة الحروف بالميزان؛
 *  - اتساق المختبرات والأنشطة الستة مع البيانات المُدقَّقة، وحتمية نشاط الترتيب؛
 *  - استكمال التشكيل في العرض فقط (ض-1…ض-5) مع بقاء صيغة المصدر كما وردت.
 */
import sourceMarkdown from '../../../docs/source/morphology-lesson-06.md?raw'
import { describe, expect, it } from 'vitest'
import {
  DISTRACTOR_WEIGHT,
  WEIGHTS_IN_SCOPE,
  analysisOf,
  analysisStepsSection,
  appliedExample,
  arabicDigits,
  comparisonSection,
  goldenRule,
  labBuild,
  labCompare,
  labCount,
  labDiagnose,
  labOrder,
  labRepeat,
  labScale,
  lessonHeader,
  meaningSection,
  morePairsSection,
  mujarradExamples,
  mujarradSection,
  mujarradSentences,
  mazeedSection,
  nextLessonSection,
  objectives,
  otherWeightsSection,
  repeatWarning,
  reviewSection,
  sourceSections,
  summarySection,
  supportingVerbs,
  tafalalaSection,
  teacherAuditNotes,
  teacherKeyHeader,
  teacherLabKeys,
  teacherMistakes,
  teacherWeightNotes,
  testDefinition,
  trainingsIntro,
  trainingControls,
  trainingOne,
  trainingTwo,
  verbAnalyses,
  weightFalalaSection,
} from './content'

const questions = testDefinition.pages.flatMap((page) => page.questions)
/** علامات التشكيل والتطويل — تُزال لمقارنة صيغتَي الجملة (المصدر والعرض). */
const diacritics = /[\u064B-\u065F\u0670\u0640]/g
const bare = (value: string) => value.replace(diacritics, '')

const mujarrad = verbAnalyses.filter((verb) => verb.kind === 'رباعي مجرّد')
const mazeed = verbAnalyses.filter((verb) => verb.kind === 'رباعي مزيد')

describe('morphology lesson 06 — source fidelity (docs/source/morphology-lesson-06.md)', () => {
  it('keeps the source headings, intro and definitions verbatim', () => {
    const verbatim = [
      lessonHeader.section,
      lessonHeader.title,
      lessonHeader.intro,
      reviewSection.heading,
      reviewSection.lead,
      reviewSection.caution,
      mujarradSection.heading,
      mujarradSection.definition,
      mujarradSection.examplesTitle,
      mujarradSection.sentenceLead,
      ...meaningSection.columns.map((column) => column.text),
      weightFalalaSection.heading,
      weightFalalaSection.lead,
      weightFalalaSection.mappingLead,
      weightFalalaSection.tableLead,
      weightFalalaSection.howToHeading,
      weightFalalaSection.conclusion,
      repeatWarning.text,
      mazeedSection.heading,
      mazeedSection.definition,
      mazeedSection.pairLead,
      mazeedSection.pair,
      mazeedSection.sentenceLead,
      meaningSection.text,
      tafalalaSection.heading,
      tafalalaSection.scope,
      tafalalaSection.order,
      tafalalaSection.formation,
      morePairsSection.lead,
      morePairsSection.sentencesLead,
      otherWeightsSection.question,
      otherWeightsSection.answer,
      comparisonSection.heading,
      goldenRule.title,
      goldenRule.rule,
      goldenRule.caution,
      analysisStepsSection.heading,
      analysisStepsSection.lead,
      appliedExample.lead,
      trainingsIntro.heading,
      trainingsIntro.lead,
      trainingOne.heading,
      trainingOne.instruction,
      trainingTwo.heading,
      summarySection.heading,
      summarySection.lead,
      summarySection.closing,
      nextLessonSection.sourceLine,
    ]
    expect(verbatim.length).toBeGreaterThanOrEqual(40)
    for (const line of verbatim) {
      expect(sourceMarkdown, `missing from the source: ${line}`).toContain(line)
    }
  })

  it('keeps every source bullet, table cell and example verbatim', () => {
    const lines = [
      ...reviewSection.kinds.map((kind) => `${kind.label}: ${kind.text}`),
      ...mujarradExamples.flatMap((example) => [example.verb, example.label]),
      ...weightFalalaSection.table.flatMap((row) => [row.verb, row.weight]),
      ...weightFalalaSection.tableColumns,
      ...weightFalalaSection.howTo,
      ...mazeedSection.analysis,
      ...tafalalaSection.flow.map((cell) => cell.text),
      ...morePairsSection.tableColumns,
      ...morePairsSection.table.flatMap((row) => [row.simple, row.mazeed, row.weight]),
      ...comparisonSection.columns,
      ...comparisonSection.rows.flatMap((row) => [row.aspect, row.simple, row.mazeed]),
      ...analysisStepsSection.steps.map((step) => `${step.n}. ${step.text}`),
      ...appliedExample.lines,
      ...summarySection.points,
    ]
    for (const line of lines) {
      expect(sourceMarkdown, `missing from the source: ${line}`).toContain(String(line))
    }
  })

  it('lists the eight source sections in order and six platform objectives', () => {
    expect(sourceSections).toHaveLength(8)
    sourceSections.forEach((section) => expect(sourceMarkdown).toContain(section))
    expect(objectives).toHaveLength(6)
  })

  it('keeps the source trainings whole: 4 items (١–٤) and 3 items numbered ٥–٧', () => {
    expect(trainingOne.items).toHaveLength(4)
    expect(trainingOne.items.map((item) => item.number)).toEqual([1, 2, 3, 4])
    expect(trainingTwo.items).toHaveLength(3)
    expect(trainingTwo.items.map((item) => item.number)).toEqual([5, 6, 7])
    for (const item of [...trainingOne.items, ...trainingTwo.items]) {
      expect(sourceMarkdown).toContain(item.verb)
    }
    // م6-2: عنوانا الزرَّين كما وردا في المصدر، وم6-4: ترقيم التدريب الثاني.
    expect(sourceMarkdown).toContain(trainingControls.revealLabel)
    expect(sourceMarkdown).toContain(trainingControls.retryLabel)
    expect(sourceMarkdown).toContain('إظهار الإجابات والتصحيحإعادة التدريبات')
  })
})

describe('morphology lesson 06 — harakat completion (ض-1…ض-5) in the display layer only', () => {
  const allSentences = [...mujarradSentences, ...mazeedSection.sentences, ...morePairsSection.sentences]

  it('keeps the source sentence form byte-identical in every example', () => {
    expect(allSentences).toHaveLength(9)
    for (const pair of allSentences) {
      expect(sourceMarkdown, `source form missing: ${pair.sourceSentence}`).toContain(pair.sourceSentence)
    }
  })

  it('completes the harakat in exactly five displayed sentences, changing nothing else', () => {
    const completed = allSentences.filter((pair) => pair.sentence !== pair.sourceSentence)
    expect(completed).toHaveLength(5)
    for (const pair of completed) {
      // الفرق تشكيل فقط: بإزالة علامات التشكيل تتطابق الصيغتان حرفًا بحرف.
      expect(bare(pair.sentence)).toBe(bare(pair.sourceSentence))
    }
  })
})

describe('morphology lesson 06 — test definition', () => {
  it('declares exactly 20 questions in 4 pages (5 per page) with unique ids q01–q20', () => {
    expect(testDefinition.pages).toHaveLength(4)
    expect(questions).toHaveLength(20)
    expect(testDefinition.pages.map((page) => page.questions.length)).toEqual([5, 5, 5, 5])
    expect(questions.map((question) => question.id)).toEqual(
      Array.from({ length: 20 }, (_, index) => `q${String(index + 1).padStart(2, '0')}`),
    )
    expect(questions.map((question) => question.number)).toEqual(Array.from({ length: 20 }, (_, index) => index + 1))
    expect(new Set(questions.map((question) => question.prompt)).size).toBe(20)
  })

  it('auto-grades every question as a single multiple-choice field with a model answer', () => {
    expect(testDefinition.matching).toBe('strict')
    for (const question of questions) {
      expect(question.fields).toHaveLength(1)
      expect(question.type).toBe('اختيار من متعدد')
      expect(question.answerSource).toBe('platform')
      const field = question.fields[0]
      expect(field.kind).toBe('choice')
      if (field.kind === 'choice') {
        expect(field.options.length).toBeGreaterThanOrEqual(3)
        expect(new Set(field.options).size).toBe(field.options.length)
        expect(field.options).toContain(field.answer)
      }
      expect(question.solution?.trim()).not.toBe('')
      expect(question.explanation?.trim()).not.toBe('')
      expect(question.teacherAnswer?.trim()).not.toBe('')
    }
  })

  it('is deterministic: fixed page order, fixed question order, fixed option order', () => {
    expect(testDefinition.pages.map((page) => page.id)).toEqual([
      'morph6-concepts',
      'morph6-letters',
      'morph6-weights',
      'morph6-analysis',
    ])
    expect(questions[0].prompt).toBe('أيّ تعريف يصف الفعل الرباعي المجرّد وصفًا دقيقًا؟')
    const firstOptions = questions[0].fields[0]
    expect(firstOptions.kind === 'choice' ? firstOptions.options : []).toEqual([
      'فعل تتكوّن جميع حروفه من أربعة أحرف أصلية، ولا يوجد فيه حرف زائد على أصوله',
      'كل فعل كُتب بأربعة أحرف مهما كانت أصوله',
      'فعل ثلاثة من حروفه أصلية وحرفه الرابع زائد',
    ])
    const weightOptions = questions[10].fields[0]
    expect(weightOptions.kind === 'choice' ? weightOptions.options : []).toEqual(['فَعْلَلَ', 'فَعَّلَ', 'تَفَعْلَلَ'])
    expect(questions[19].prompt).toBe('ما الخطوة الأولى في تمييز نوع الفعل بحسب خطوات الدرس؟')
  })

  it('asks only about the two weights in scope, with فَعَّلَ as the documented distractor', () => {
    expect(WEIGHTS_IN_SCOPE).toEqual(['فَعْلَلَ', 'تَفَعْلَلَ'])
    expect(DISTRACTOR_WEIGHT).toBe('فَعَّلَ')
    const weightsInAnswers = questions
      .map((question) => question.fields[0])
      .filter((field) => field.kind === 'choice' && (WEIGHTS_IN_SCOPE as readonly string[]).includes(field.answer))
      .map((field) => (field.kind === 'choice' ? field.answer : ''))
    expect(new Set(weightsInAnswers)).toEqual(new Set(['فَعْلَلَ', 'تَفَعْلَلَ']))
  })

  it('is written for this lesson: no question copies a source training line (غ-8)', () => {
    for (const question of questions) {
      // نصّ السؤال وشرحه وتعليل المعلّم من إعداد المنصة، فلا تُوجد في ملف المصدر.
      expect(sourceMarkdown, `question ${question.id} copies the source`).not.toContain(question.prompt)
      expect(sourceMarkdown, `explanation of ${question.id} copies the source`).not.toContain(question.explanation ?? '')
      expect(sourceMarkdown, `teacher answer of ${question.id} copies the source`).not.toContain(
        question.teacherAnswer ?? '',
      )
    }
    // بنود تدريبات المصدر تبقى كما هي في الدرس، ولا تتحوّل إلى أسئلة اختبار بنصّها.
    const trainingVerbs = [...trainingOne.items, ...trainingTwo.items].map((item) => item.verb)
    expect(new Set(trainingVerbs)).toEqual(new Set(['دَحْرَجَ', 'تَدَحْرَجَ', 'زَلْزَلَ', 'تَبَعْثَرَ', 'تَزَلْزَلَ']))
  })
})

describe('morphology lesson 06 — supporting verbs stay inside the test and the teacher area (غ-2)', () => {
  const prose = JSON.stringify([
    lessonHeader,
    sourceSections,
    objectives,
    reviewSection,
    mujarradSection,
    mujarradExamples,
    mujarradSentences,
    weightFalalaSection,
    repeatWarning,
    mazeedSection,
    meaningSection,
    tafalalaSection,
    morePairsSection,
    otherWeightsSection,
    comparisonSection,
    goldenRule,
    analysisStepsSection,
    appliedExample,
    summarySection,
    nextLessonSection,
    trainingsIntro,
    trainingOne,
    trainingTwo,
    trainingControls,
    labCount,
    labScale,
    labRepeat,
    labBuild,
    labCompare,
    labOrder,
    labDiagnose,
  ])
  const testText = JSON.stringify(questions)
  const teacherText = JSON.stringify([supportingVerbs, teacherLabKeys, teacherWeightNotes, teacherAuditNotes])

  it('lists exactly four documented supporting verbs', () => {
    expect(supportingVerbs).toHaveLength(4)
    expect(supportingVerbs.map((verb) => verb.word)).toEqual(['طَمْأَنَ', 'زَعْزَعَ', 'زَحْزَحَ', 'تَزَحْزَحَ'])
    for (const verb of supportingVerbs) {
      expect(verb.root.split(' ')).toHaveLength(4)
      expect(WEIGHTS_IN_SCOPE).toContain(verb.weight)
      expect(verb.note.trim()).not.toBe('')
    }
  })

  it('never uses them in the lesson prose or the student activities', () => {
    for (const verb of supportingVerbs) {
      expect(prose, `${verb.word} leaked into the lesson prose`).not.toContain(verb.word)
      expect(sourceMarkdown, `${verb.word} is not part of the source`).not.toContain(verb.word)
    }
  })

  it('uses them in the test questions and documents them for the teacher', () => {
    for (const verb of ['طَمْأَنَ', 'زَعْزَعَ', 'تَزَحْزَحَ', 'زَحْزَحَ']) {
      expect(testText + teacherText, `${verb} is not used anywhere`).toContain(verb)
    }
    expect(questions[9]).toMatchObject({ id: 'q10', prompt: expect.stringContaining('زَعْزَعَ') })
    expect(questions[16]).toMatchObject({ id: 'q17', solution: 'طَمْأَنَ' })
    expect(questions[17]).toMatchObject({ id: 'q18', prompt: expect.stringContaining('تَزَحْزَحَ') })
    expect(questions[17].explanation).toContain('زَحْزَحَ')
  })
})

describe('morphology lesson 06 — morphological analysis of the seven source verbs', () => {
  it('keeps four quadriliteral-simple verbs with four root letters and no extra letter', () => {
    expect(mujarrad).toHaveLength(4)
    expect(mujarrad.map((verb) => verb.word)).toEqual(['دَحْرَجَ', 'زَلْزَلَ', 'وَسْوَسَ', 'بَعْثَرَ'])
    for (const verb of mujarrad) {
      expect(verb.rootCount).toBe(4)
      expect(verb.visibleCount).toBe(4)
      expect(verb.extraLetter).toBe('لا يوجد')
      expect(verb.weight).toBe('فَعْلَلَ')
      expect(verb.root.split(' ')).toHaveLength(4)
      // المقابلة: ف، ع، ل، ل (لام ثانية للحرف الأصلي الرابع).
      expect(verb.rows).toHaveLength(4)
      expect(verb.rows.map((row) => row.pattern)).toEqual(['ف', 'ع', 'ل', 'ل'])
      expect(verb.rows.every((row) => row.extra !== true)).toBe(true)
      expect(verb.rows[3].note).toBe('اللام الثانية')
      expect(verb.teacherNote.trim()).not.toBe('')
    }
  })

  it('keeps three quadriliteral-augmented verbs: five visible letters, four roots, the تاء extra', () => {
    expect(mazeed).toHaveLength(3)
    expect(mazeed.map((verb) => verb.word)).toEqual(['تَدَحْرَجَ', 'تَزَلْزَلَ', 'تَبَعْثَرَ'])
    for (const verb of mazeed) {
      expect(verb.visibleCount).toBe(5)
      expect(verb.rootCount).toBe(4)
      expect(verb.extraLetter).toBe('التاء')
      expect(verb.weight).toBe('تَفَعْلَلَ')
      expect(verb.rows).toHaveLength(5)
      expect(verb.rows[0]).toMatchObject({ letter: 'ت', pattern: '—', extra: true })
      expect(verb.rows.slice(1).map((row) => row.pattern)).toEqual(['ف', 'ع', 'ل', 'ل'])
    }
  })

  it('shares one root between each augmented verb and its simple counterpart (ت-2، ت-6)', () => {
    expect(analysisOf('tadahraja').root).toBe(analysisOf('dahraja').root)
    expect(analysisOf('tazalzala').root).toBe(analysisOf('zalzala').root)
    expect(analysisOf('tabaathara').root).toBe(analysisOf('baathara').root)
    // التاء زيادة على الأصول، فلا تدخل في الجذر الرباعي.
    for (const verb of mazeed) expect(verb.root).not.toContain('ت')
  })

  it('treats the repeated letters of زَلْزَلَ and وَسْوَسَ as root letters, not extra ones (ت-1)', () => {
    for (const id of ['zalzala', 'waswasa']) {
      const verb = analysisOf(id)
      expect(verb.rootCount).toBe(4)
      expect(verb.extraLetter).toBe('لا يوجد')
      expect(verb.weight).toBe('فَعْلَلَ')
      expect(verb.rows.every((row) => row.extra !== true)).toBe(true)
    }
    expect(repeatWarning.text).toContain('لا يعني أنه حرف زائد')
    expect(repeatWarning.clarification).toContain('المضعَّف الرباعي')
  })

  it('throws on an unknown analysis id instead of returning undefined', () => {
    expect(() => analysisOf('no-such-verb')).toThrow(/Unknown verb analysis/)
  })
})

describe('morphology lesson 06 — the six interactive activities agree with the audited data', () => {
  it('activity 1 counts root letters for the six review words only', () => {
    expect(labCount.items).toHaveLength(6)
    expect(labCount.items.map((item) => item.number)).toEqual([1, 2, 3, 4, 5, 6])
    for (const item of labCount.items) {
      expect(labCount.options).toContain(item.answer)
      expect(item.letters.split('، ')).toHaveLength(item.answer.startsWith('ثلاثي') ? 3 : 4)
      expect(sourceMarkdown).toContain(item.word)
      expect(item.reason.trim()).not.toBe('')
    }
    expect(labCount.items.filter((item) => item.answer.startsWith('ثلاثي'))).toHaveLength(3)
    expect(labCount.items.filter((item) => item.answer.startsWith('رباعي'))).toHaveLength(3)
  })

  it('activity 2 maps every root letter of the four simple verbs to ف ع ل ل', () => {
    expect(labScale.items).toHaveLength(4)
    for (const item of labScale.items) {
      const verb = analysisOf(item.verb)
      expect(item.letters).toEqual(verb.root.split(' '))
      expect(item.answers).toEqual(['ف', 'ع', 'ل', 'ل'])
      expect(item.weight).toBe('فَعْلَلَ')
      for (const answer of item.answers) expect(labScale.mizanOptions).toContain(answer)
    }
    expect(labScale.positions).toHaveLength(4)
  })

  it('activity 3 judges the repeated letter as a root letter with four roots on فَعْلَلَ', () => {
    expect(labRepeat.items).toHaveLength(2)
    for (const item of labRepeat.items) {
      const verb = analysisOf(item.verb)
      expect(item.judgementOptions).toContain(item.judgement)
      expect(item.countOptions).toContain(item.count)
      expect(item.count).toBe(arabicDigits(verb.rootCount))
      expect(item.weight).toBe(verb.weight)
      expect(item.judgement.startsWith('أصلي')).toBe(true)
    }
  })

  it('activity 4 builds تَفَعْلَلَ by adding the تاء to the beginning of the simple verb', () => {
    expect(labBuild.items).toHaveLength(3)
    for (const item of labBuild.items) {
      expect(item.positionOptions).toContain(item.position)
      expect(item.position).toBe('في بداية الفعل')
      expect(item.formOptions).toContain(item.form)
      expect(item.form).toBe(item.mazeed)
      expect(item.weight).toBe('تَفَعْلَلَ')
      expect(item.extraLetter).toBe('التاء')
      const analysis = analysisOf(item.mazeed)
      expect(analysis.root).toBe(analysisOf(item.simple).root)
      expect(analysis.weight).toBe(item.weight)
    }
    // الأزواج الثلاثة هي نفسها أزواج جدول «أمثلة أخرى» في المصدر.
    expect(labBuild.items.map((item) => `${item.simple}←${item.mazeed}`)).toEqual(
      morePairsSection.table.map((row) => `${row.simple}←${row.mazeed}`),
    )
  })

  it('activity 5 compares the simple and the augmented verb on the four source aspects', () => {
    expect(labCompare.items).toHaveLength(2)
    expect(labCompare.items.map((item) => item.verb)).toEqual(['دَحْرَجَ', 'تَدَحْرَجَ'])
    for (const item of labCompare.items) {
      const verb = analysisOf(item.verb)
      expect(item.visibleOptions).toContain(item.visible)
      expect(item.rootOptions).toContain(item.root)
      expect(item.extraOptions).toContain(item.extra)
      expect(item.visible).toBe(arabicDigits(verb.visibleCount))
      expect(item.root).toBe(arabicDigits(verb.rootCount))
      expect(item.extra).toBe(verb.extraLetter)
      expect(item.weight).toBe(verb.weight)
      const allowedWeights: readonly string[] = [...WEIGHTS_IN_SCOPE, DISTRACTOR_WEIGHT]
      expect(allowedWeights).toContain(item.weight)
    }
    expect(comparisonSection.rows).toHaveLength(4)
    expect(comparisonSection.rows.map((row) => row.aspect)).toEqual([
      'الحروف الأصلية',
      'الحروف الزائدة',
      'المثال',
      'الوزن',
    ])
  })

  it('activities 6 order the five source steps deterministically and diagnose تَزَلْزَلَ', () => {
    expect(labOrder.answers).toHaveLength(5)
    expect([...labOrder.options].sort()).toEqual([...labOrder.answers].sort())
    expect(analysisStepsSection.steps).toHaveLength(5)
    labOrder.answers.forEach((answer, index) => {
      const step = analysisStepsSection.steps[index]
      expect(answer).toBe(step.text.replace(/\.$/, ''))
    })
    expect(labOrder.solution).toHaveLength(5)
    expect(appliedExample.verb).toBe('تَزَلْزَلَ')
    expect(appliedExample.lines).toHaveLength(5)

    const verb = analysisOf('tazalzala')
    expect(labDiagnose.verb).toBe(verb.word)
    expect(labDiagnose.fields.map((field) => field.key)).toEqual(['visible', 'root', 'extra', 'kind', 'weight'])
    for (const field of labDiagnose.fields) expect(field.options).toContain(field.answer)
    const byKey = Object.fromEntries(labDiagnose.fields.map((field) => [field.key, field.answer]))
    expect(byKey.root).toBe(verb.rootLetters)
    expect(byKey.extra).toBe(verb.extraLetter)
    expect(byKey.kind).toBe(verb.kind)
    expect(byKey.weight).toBe(verb.weight)
    expect(byKey.visible).toBe('ت، ز، ل، ز، ل')
    expect(byKey.visible.split('، ')).toHaveLength(verb.visibleCount)
  })
})

describe('morphology lesson 06 — teacher material', () => {
  it('references the saved source file and the audit report', () => {
    expect(teacherKeyHeader).toContain('docs/source/morphology-lesson-06.md')
    expect(teacherKeyHeader).toContain('docs/morphology-lesson-06-audit.md')
    expect(teacherAuditNotes.join('\n')).toContain('docs/morphology-lesson-06-audit.md')
  })

  it('carries keys for the seven activities, three weight notes, six expected mistakes and seven audit notes', () => {
    expect(teacherLabKeys).toHaveLength(7)
    expect(teacherWeightNotes).toHaveLength(3)
    expect(teacherMistakes).toHaveLength(6)
    expect(teacherAuditNotes).toHaveLength(7)
    for (const note of [...teacherLabKeys, ...teacherWeightNotes, ...teacherMistakes, ...teacherAuditNotes]) {
      expect(note.trim().length).toBeGreaterThan(20)
    }
  })

  it('gives every training item a written weight key and every verb a teacher note', () => {
    for (const item of trainingTwo.items) expect(item.teacherKey).toContain(item.answer)
    for (const item of trainingOne.items) expect(item.explanation.trim()).not.toBe('')
    for (const verb of verbAnalyses) expect(verb.teacherNote.trim()).not.toBe('')
  })

  it('records the scope limits: no lesson 7, no unit test, no extra weights in the prose', () => {
    expect(nextLessonSection.scopeNote).toContain('لم يُبنَ الدرس السابع')
    expect(nextLessonSection.title).toBe('الفعل الصحيح والفعل المعتل')
    expect(sourceMarkdown).toContain(nextLessonSection.sourceLine)
    expect(otherWeightsSection.answer).toContain('سنكتفي الآن بإتقان الوزن تَفَعْلَلَ')
    expect(tafalalaSection.clarification).toContain('لا يعني أنه الوزن الوحيد الممكن')
  })
})

describe('morphology lesson 06 — display helpers', () => {
  it('keeps the closing recap card consistent with the audited analyses', () => {
    const recap = summarySection.recap
    expect(recap.rows).toHaveLength(2)
    for (const row of recap.rows) {
      const analysis = analysisOf(row.example)
      expect(analysis.kind).toBe(row.kind)
      expect(analysis.weight).toBe(row.weight)
      expect(analysis.rootCount).toBe(4)
      expect(row.roots).toBe('أربعة')
      expect(row.extra === 'لا توجد' ? 'لا يوجد' : row.extra).toBe(analysis.extraLetter)
      expect(recap.columns).toHaveLength(5)
    }
  })

  it('renders Arabic-Indic digits for display only', () => {
    expect(arabicDigits(20)).toBe('٢٠')
    expect(arabicDigits(4)).toBe('٤')
    expect(arabicDigits('15')).toBe('١٥')
  })
})
