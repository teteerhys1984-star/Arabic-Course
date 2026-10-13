/// <reference types="node" />
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import sourceMarkdown from '../../../docs/source/morphology-lesson-10.md?raw'
import lessonSource from '../LessonMorphologyTen.tsx?raw'
import * as C from './content'
import {
  EXAM_ANSWERS, EXPECTED_ANALYSIS_KEYS, EXPECTED_CHALLENGE_KEYS, EXPECTED_CLASSIFY_KEYS,
  EXPECTED_COMPARISON_KEYS, EXPECTED_COMPREHENSIVE, EXPECTED_MASDAR_KEYS,
  EXPECTED_ORIGINAL_KEYS, EXPECTED_QUADRILITERAL, EXPECTED_QUINTUPLE_SUMMARY,
  EXPECTED_REVIEW, EXPECTED_ROOT_KEYS, EXPECTED_SEXTUPLE, EXPECTED_TRAINING_KEYS,
  EXPECTED_TRILITERAL, EXPECTED_WEIGHT_KEYS,
} from './test-fixtures'

const lessonStyles = readFileSync('src/styles/morphology-lesson-10.css', 'utf8')
const S = C.sourceContent
const questions = C.testDefinition.pages.flatMap((page) => page.questions)
const trainingItems = S.trainings.groups.flatMap((group) => [...group.items])
const strings = (value: unknown): string[] =>
  typeof value === 'string' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : []

const body = sourceMarkdown.slice(sourceMarkdown.indexOf('-->') + 3)
const sourceCells = body.split('\n').flatMap((line) => {
  const trimmed = line.trim()
  if (!trimmed) return []
  if (/^\|[-:\s|]+\|$/.test(trimmed)) return []
  if (trimmed.startsWith('|')) return trimmed.split('|').map((cell) => cell.trim()).filter(Boolean)
  return [trimmed.replace(/^(?:- |\d+\. )/, '')]
})

describe('morphology 10 — النسخة المحفوظة من المصدر ثابتة وممثَّلة كاملة', () => {
  it('يثبّت الملف الخام ببصمته وسطر الزرين المدمج وعبارة تصحيح الاختبار', () => {
    expect(createHash('sha256').update(sourceMarkdown).digest('hex')).toBe(
      'dcdc8ddc5eb6f637af63e0bd54e3940b3f22af21baa60972c2e0705d6a0e9d98',
    )
    expect(sourceMarkdown).toContain('إظهار الإجابات والتصحيحإعادة التدريبات')
    expect(sourceMarkdown).toContain('\nتصحيح الاختبار\n')
    expect(body.trim().startsWith(S.header.firstTitle)).toBe(true)
    expect(sourceMarkdown.trimEnd().endsWith(S.summary.next)).toBe(true)
  })

  it('يمثّل كل سطر/خلية جوهرية في بيانات العرض دون تجريد الحركات', () => {
    const represented = strings(S).join('\n')
    expect(sourceCells).toHaveLength(413)
    for (const cell of sourceCells) expect(represented, `Unrepresented source cell: ${cell}`).toContain(cell)
  })

  it('يحفظ عناوين الأقسام الاثني عشر بترتيب المصدر وقائمة الدروس العشرة', () => {
    expect(C.sourceSections).toHaveLength(12)
    expect(C.sourceSections.map((h) => h.split(':')[0].split('—')[0].trim())).toEqual([
      'أولًا', 'ثانيًا', 'ثالثًا', 'رابعًا', 'خامسًا', 'سادسًا',
      'سابعًا', 'ثامنًا', 'تاسعًا', 'عاشرًا', 'الحادي عشر', 'الثاني عشر',
    ])
    const offsets = C.sourceSections.map((heading) => sourceMarkdown.indexOf(heading))
    expect(offsets.every((o) => o > 0)).toBe(true)
    expect(offsets).toEqual([...offsets].sort((a, b) => a - b))
    expect(S.summary.lessonsList).toHaveLength(10)
    expect(S.summary.lessonsList[9]).toBe('أنواع المصادر وأوزانها.')
    expect(S.summary.rules).toHaveLength(4)
  })

  it('يحفظ جداول المصدر كلها بصفوفها وخلاياها وفي ترتيبها', () => {
    expect(S.review.rows).toHaveLength(4)
    S.review.rows.forEach((row, i) => expect([row.verb, row.masdar, row.meaning]).toEqual([...EXPECTED_REVIEW[i]]))
    expect(S.triliteral.rows).toHaveLength(9)
    S.triliteral.rows.forEach((row, i) => expect([row.weight, row.masdar, row.verb]).toEqual([...EXPECTED_TRILITERAL[i]]))
    S.quadrilateral.rows.forEach((row, i) => expect([row.verb, row.masdar, row.masdarWeight]).toEqual([...EXPECTED_QUADRILITERAL[i]]))
    expect(S.quintuple.groups.map((g) => g.rows.length)).toEqual([2, 2, 2, 2])
    S.quintuple.summaryRows.forEach((row, i) => expect([row.verbWeight, row.masdarWeight, row.example]).toEqual([...EXPECTED_QUINTUPLE_SUMMARY[i]]))
    S.sextuple.rows.forEach((row, i) => expect([row.verb, row.masdar, row.masdarWeight]).toEqual([...EXPECTED_SEXTUPLE[i]]))
    expect(S.comprehensive.rows).toHaveLength(10)
    S.comprehensive.rows.forEach((row, i) => expect([row.kind, row.verb, row.masdar, row.masdarWeight]).toEqual([...EXPECTED_COMPREHENSIVE[i]]))
    expect(S.triliteral.rows.filter((r) => r.weight === 'فِعالة').map((r) => r.masdar)).toEqual(['كِتابة', 'زِراعة'])
    expect(S.comprehensive.columns).toEqual(['نوع الفعل', 'الفعل', 'المصدر', 'وزن المصدر'])
    expect(S.comprehensive.sourceColumnNote).toBe('وزن الفعل')
  })

  it('يحفظ التدريبات الأحد عشر والاختبار الأصلي الستة بنصوصها وخياراتها وترقيمها', () => {
    expect(S.trainings.groups.map((g) => g.items.length)).toEqual([4, 4, 3])
    expect(trainingItems.map((item) => item.number)).toEqual(Array.from({ length: 11 }, (_, i) => i + 1))
    for (const item of trainingItems) {
      expect(item.options).toHaveLength(3)
      expect(C.trainingSolutions[item.number].answer).toBe(EXPECTED_TRAINING_KEYS[item.number - 1])
      expect([...item.options]).toContain(C.trainingSolutions[item.number].answer)
      expect(C.trainingSolutions[item.number].steps.length).toBeGreaterThanOrEqual(3)
      expect(C.trainingSolutions[item.number].distractors).toHaveLength(2)
    }
    expect(C.trainingControls.reveal + C.trainingControls.reset).toBe(S.trainings.rawControls)
    expect(S.originalFinal.items.map((item) => item.number)).toEqual([1, 2, 3, 4, 5, 6])
    for (const item of S.originalFinal.items) {
      expect(item.options).toHaveLength(3)
      expect(C.originalFinalSolutions[item.number].answer).toBe(EXPECTED_ORIGINAL_KEYS[item.number - 1])
      expect([...item.options]).toContain(C.originalFinalSolutions[item.number].answer)
    }
    expect(C.originalFinalControls.check).toBe(S.originalFinal.rawControl)
  })
})

describe('morphology 10 — التدقيق الصرفي وتوضيحات المنصة', () => {
  it('يفصل الجذر عن الصيغة وعن الزوائد في الأمثلة المحورية', () => {
    expect(C.clarifications.rootsVsForm).toContain('خ، ر، ج')
    expect(C.clarifications.rootsVsForm).toContain('ك، س، ر')
    const istakhraja = C.morphologyAnalyses.find((r) => r.verb === 'اسْتَخْرَجَ')!
    expect(istakhraja).toMatchObject({ root: 'خ، ر، ج', extra: 'الألف والسين والتاء', verbWeight: 'اسْتَفْعَلَ', masdarWeight: 'اسْتِفْعال' })
    const tadahraja = C.morphologyAnalyses.find((r) => r.verb === 'تَدَحْرَجَ')!
    expect(tadahraja.masdarWeight).toBe('تَفَعْلُل')
    expect(tadahraja.masdarWeight).not.toBe('فَعْلَلَة')
  })

  it('لا يعمّم وزنًا واحدًا على الثلاثي ولا اسْتِفْعال على كل سداسي، ويقيّد ضَرْبة', () => {
    expect(S.triliteral.rule).toContain('سماعي')
    expect(new Set(S.triliteral.rows.map((r) => r.weight)).size).toBe(8)
    expect(C.clarifications.marra).toContain('ضَرْب')
    expect(C.clarifications.sextupleLimit).toContain('اسْتَفْعَلَ فقط')
    expect(S.sextuple.answer).toContain('لا.')
    expect(C.clarifications.comprehensiveHeader).toContain('ت-١')
  })

  it('يحلّل صرفيًا الأمثلة الأساسية كلها ويعرب الجمل التطبيقية', () => {
    expect(C.morphologyAnalyses.length).toBeGreaterThanOrEqual(28)
    for (const group of S.quintuple.groups) for (const row of group.rows) {
      const analysis = C.morphologyAnalyses.find((r) => r.verb === row.verb)
      expect(analysis, `No analysis for ${row.verb}`).toBeDefined()
      expect(analysis!.masdarWeight).toBe(row.masdarWeight)
    }
    for (const row of S.sextuple.rows) expect(C.morphologyAnalyses.find((r) => r.verb === row.verb)?.masdar).toBe(row.masdar)
    expect(C.parsings.length).toBe(6)
    for (const entry of C.parsings) {
      expect(entry.lines.length).toBeGreaterThanOrEqual(3)
      expect(entry.lines.join(' ')).toMatch(/مرفوع|منصوب/)
    }
    expect(C.parsings[0].lines.join(' ')).toContain('مفعول مطلق')
  })

  it('لا يفصل حرفًا عن حركته عند الإبراز', () => {
    const words = [
      ...S.review.rows.flatMap((r) => [r.verb, r.masdar]),
      ...S.triliteral.rows.flatMap((r) => [r.weight, r.masdar, r.verb]),
      ...S.comprehensive.rows.flatMap((r) => [r.verb, r.masdar, r.masdarWeight]),
    ]
    for (const word of words) {
      expect(word, `Word must stay joined: ${word}`).not.toMatch(/^\p{M}|\s/u)
      expect(word.trim()).toBe(word)
    }
    expect(C.arrowPair('تَدَحْرَجَ ← تَدَحْرُج')).toEqual({ verb: 'تَدَحْرَجَ', masdar: 'تَدَحْرُج' })
    expect(lessonStyles).toContain('white-space: nowrap')
    expect(lessonStyles).toContain('unicode-bidi: isolate')
    expect(lessonStyles).toContain('@media (prefers-reduced-motion: reduce)')
    expect(lessonStyles).not.toMatch(/direction:\s*(left|right)|text-align:\s*(left|right)/)
    expect(C.arabicDigits(10)).toBe('١٠')
    expect(C.arabicDigits(20)).toBe('٢٠')
  })
})

describe('morphology 10 — أنشطة المنصة واختبارها المستقل ودليل معلّمها', () => {
  it('يملك سبعة أنشطة بمفاتيح مدقَّقة (٤ اختيارية + مقارنة + متدرّج + تحدٍّ)', () => {
    expect(C.classifyLab.items.map((i) => i.answer)).toEqual([...EXPECTED_CLASSIFY_KEYS])
    expect(C.rootsLab.items.map((i) => i.answer)).toEqual([...EXPECTED_ROOT_KEYS])
    expect(C.masdarLab.items.map((i) => i.answer)).toEqual([...EXPECTED_MASDAR_KEYS])
    expect(C.weightLab.items.map((i) => i.answer)).toEqual([...EXPECTED_WEIGHT_KEYS])
    expect(C.comparisonLab.items.map((i) => [i.verbWeight, i.masdarWeight])).toEqual(EXPECTED_COMPARISON_KEYS.map((p) => [...p]))
    expect(C.analysisLab.cases.map((c) => [c.masdar, ...c.stages.map((s) => s.answer)])).toEqual(EXPECTED_ANALYSIS_KEYS.map((r) => [...r]))
    expect(C.challengeLab.cases.map((c) => c.stages.map((s) => s.answer))).toEqual(EXPECTED_CHALLENGE_KEYS.map((r) => [...r]))
    expect(C.practiceLabs).toHaveLength(4)
    for (const lab of C.practiceLabs) for (const item of lab.items) {
      expect(item.options.filter((o) => o === item.answer)).toHaveLength(1)
      expect(item.explanation.length).toBeGreaterThan(35)
    }
    for (const c of C.analysisLab.cases) {
      expect(c.stages).toHaveLength(5)
      expect(c.stages.map((s) => s.label)).toEqual([
        'المرحلة ١: تحديد المصدر', 'المرحلة ٢: استحضار الفعل', 'المرحلة ٣: وزن الفعل',
        'المرحلة ٤: وزن المصدر', 'المرحلة ٥: الجذر والزوائد',
      ])
    }
    for (const c of C.challengeLab.cases) expect(c.stages).toHaveLength(3)
  })

  it('يملك اختبارًا مستقلًا من ٢٠ سؤالًا في أربع صفحات جديدة غير منسوخة', () => {
    expect(C.testDefinition.id).toBe('morphology-lesson-10-test')
    expect(C.testDefinition.matching).toBe('strict')
    expect(C.testDefinition.pages.map((p) => p.questions.length)).toEqual([5, 5, 5, 5])
    expect(questions.map((q) => q.number)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
    expect(new Set(questions.map((q) => q.id)).size).toBe(20)
    expect(questions.filter((q) => q.level === 'مصادر الثلاثي والرباعي')).toHaveLength(5)
    expect(questions.filter((q) => q.level === 'مصادر الخماسي والسداسي')).toHaveLength(5)
    expect(questions.filter((q) => q.level === 'الأصل والزائد والأوزان')).toHaveLength(5)
    expect(questions.filter((q) => q.level === 'التحليل والتطبيق')).toHaveLength(5)
    for (const question of questions) {
      expect(question.answerSource).toBe('platform')
      expect(question.sourceAnswer).toBeUndefined()
      expect(question.rule!.length).toBeGreaterThan(20)
      expect(question.explanation!.length).toBeGreaterThan(80)
      expect(trainingItems.map((i) => i.prompt)).not.toContain(question.prompt)
      expect(S.originalFinal.items.map((i) => i.prompt)).not.toContain(question.prompt)
      expect(sourceMarkdown).not.toContain(question.prompt)
      question.fields.forEach((field, fieldIndex) => {
        const expected = EXAM_ANSWERS[`${question.id}:${fieldIndex}`]
        expect(expected, `Missing fixture for ${question.id}:${fieldIndex}`).toBeDefined()
        if (field.kind === 'multi') expect(field.answers).toEqual(expected)
        else if (field.kind === 'choice' || field.kind === 'select') expect(field.answer).toBe(expected[0])
        else throw new Error('Unexpected field kind')
      })
    }
  })

  it('لا ينشر مفاتيح الاختبار المستقل في بيانات التدريس أو الأنشطة', () => {
    const studentTeaching = JSON.stringify([S, C.objectives, C.clarifications, C.practiceLabs, C.comparisonLab, C.analysisLab, C.challengeLab, C.trainingSolutions, C.originalFinalSolutions])
    for (const question of questions) {
      expect(studentTeaching).not.toContain(question.id)
      expect(studentTeaching).not.toContain(question.prompt)
      expect(studentTeaching).not.toContain(question.explanation)
    }
    for (const reserved of ['صَبْر', 'رُجوع', 'هَدْهَدَة', 'تَبَعْثُر', 'انْغِلاق', 'افْتِخار', 'تَدَرُّج', 'تَسابُق', 'اسْتِرْشاد', 'اسْتَنْجَدَ', 'انْدَفَعَ', 'تَبادُل', 'تَنْظيم', 'احْتِرام', 'اِسْتِصْلاح']) {
      expect(studentTeaching, `Reserved exam word leaked: ${reserved}`).not.toContain(reserved)
    }
    expect(lessonSource).not.toMatch(/data-(?:answer|correct|solution)=/)
  })

  it('يغطّي دليل المعلّم الأقسام الاثني عشر والمصادر، ويبقي الحادي عشر نصيًا', () => {
    expect(C.teacherTopics.map((t) => t.heading)).toEqual(C.sourceSections)
    expect(C.teacherTopics).toHaveLength(12)
    expect(C.teacherReferences.source).toBe('docs/source/morphology-lesson-10.md')
    expect(C.teacherReferences.audit).toBe('docs/morphology-lesson-10-audit.md')
    expect(C.teacherReferences.note).toContain('لا تدّعي المنصة')
    expect(lessonSource).toContain('<TeacherSpace>')
    expect(lessonSource).toContain('mode="teacher"')
    expect(lessonSource).not.toContain('password=')
    expect(lessonSource).not.toContain('morphology-lesson-11')
    expect(lessonSource).toContain('لا يُنشئ هذا الدرس درسًا حادي عشر ولا اختبار وحدة')
  })
})
