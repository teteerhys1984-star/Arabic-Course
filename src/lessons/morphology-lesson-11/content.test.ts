/// <reference types="node" />
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import sourceMarkdown from '../../../docs/source/morphology-lesson-11.md?raw'
import auditMarkdown from '../../../docs/morphology-lesson-11-source-audit.md?raw'
import lessonSource from '../LessonMorphologyEleven.tsx?raw'
import { looseKey } from '../../shared/test'
import { COURSE_TEACHER_PASSWORD } from '../../shared/teacher/teacherPassword'
import * as C from './content'
import {
  EXAM_ANSWERS, EXPECTED_COMPARE, EXPECTED_FINAL_FORM_KEYS, EXPECTED_FINAL_TF_KEYS, EXPECTED_HOMEWORK,
  EXPECTED_NON_TRILITERAL, EXPECTED_PREFACE, EXPECTED_TRAINING_KEYS, EXPECTED_TRILITERAL, EXPECTED_WEAK,
  OBJECTIVE_COVERAGE,
} from './test-fixtures'

const lessonStyles = readFileSync('src/styles/morphology-lesson-11.css', 'utf8')
const S = C.sourceContent
const questions = C.testDefinition.pages.flatMap((page) => page.questions)
const finalItems = S.final.sections.flatMap((section) => [...section.items])
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
const harakat = /[\u064B-\u0652]/g
/** الحرف قبل الأخير مع حركاته. */
function beforeLast(word: string): { base: string; marks: string } {
  const clusters: { base: string; marks: string }[] = []
  for (const char of word) {
    if (/[\u064B-\u0652]/.test(char)) clusters[clusters.length - 1].marks += char
    else clusters.push({ base: char, marks: '' })
  }
  return clusters[clusters.length - 2]
}

describe('morphology 11 — النسخة المحفوظة من المصدر ثابتة وممثَّلة كاملة', () => {
  it('يثبّت الملف الخام ببصمته وبدايته ونهايته', () => {
    expect(createHash('sha256').update(sourceMarkdown).digest('hex')).toBe(
      '19b44e4c65778a717a6c0c5ca4c2e1b68bc990712fc93c570249b8cba219b95b',
    )
    expect(body.trim().startsWith(S.header.badge)).toBe(true)
    expect(sourceMarkdown.trimEnd().endsWith(S.next.conclusion)).toBe(true)
    expect(sourceMarkdown).not.toMatch(/morphology-lesson-12|كتاب مدرسي رسمي يتضمن/)
  })

  it('يمثّل كل سطر وخلية جوهرية من المصدر في البيانات، إلا ثلاثة أسطر صُحّحت علميًا', () => {
    const data = strings(S)
    const joined = data.join('\n')
    expect(sourceCells.length).toBeGreaterThan(300)
    const blanks = sourceCells.filter((cell) => /^\.+$/.test(cell))
    expect(blanks).toHaveLength(10) // خانات الواجب الفارغة العشر
    for (const cell of sourceCells) {
      if (/^\.+$/.test(cell)) continue
      const correction = C.corrections.find((item) => item.original === cell)
      if (correction) {
        expect(joined, `Original wording must not be rendered: ${cell}`).not.toContain(cell)
        expect(data).toContain(correction.corrected)
      } else {
        expect(joined, `Missing source content: ${cell}`).toContain(cell)
      }
    }
  })

  it('يسجّل التصحيحات الثلاثة بنصها الأصلي الموجود فعلًا في المصدر وبسببها، ويوثقها في التدقيق', () => {
    expect(C.corrections.map((item) => item.id)).toEqual(['ت-١', 'ت-٢', 'ت-٣'])
    for (const item of C.corrections) {
      expect(sourceCells).toContain(item.original)
      expect(item.corrected).not.toBe(item.original)
      expect(item.reason.length).toBeGreaterThan(60)
      expect(auditMarkdown).toContain(item.original)
      expect(auditMarkdown).toContain(item.corrected)
    }
    expect(S.triliteral.definition).toContain('الثلاثي المجرّد')
    expect(S.triliteral.positionsLead).toContain('ثلاثة أحرف أصلية (ف، ع، ل)')
    expect(S.triliteral.positionsLead).toContain('ألف زائدة بعد الفاء')
    expect(S.triliteral.positions).toHaveLength(4)
    expect(S.nonTriliteral.definition).toContain('زادت حروف ماضيه على ثلاثة أحرف')
  })

  it('يحفظ الأقسام والأهداف والأعداد كما وردت', () => {
    expect(S.objectives.items).toHaveLength(6)
    expect(S.preface.sentences).toHaveLength(3)
    expect(S.preface.rows.map((row) => [row.word, row.kind, row.meaning])).toEqual(EXPECTED_PREFACE)
    expect(S.definition.quickRows).toHaveLength(3)
    expect(S.definition.more).toHaveLength(6)
    expect(S.triliteral.rows.map((row) => [row.verb, row.weight, row.participle])).toEqual(EXPECTED_TRILITERAL)
    expect(S.triliteral.timeExamples).toHaveLength(3)
    expect(S.nonTriliteral.verbs).toHaveLength(5)
    expect(S.nonTriliteral.examples).toHaveLength(4)
    expect(S.nonTriliteral.rows.map((row) => [row.past, row.present, row.participle])).toEqual(EXPECTED_NON_TRILITERAL)
    expect(S.weak.rows.map((row) => [row.verb, row.participle, row.example])).toEqual(EXPECTED_WEAK)
    expect(S.identify.steps).toHaveLength(3)
    expect(S.identify.examples).toHaveLength(3)
    expect(S.compare.rows.map((row) => [row.word, row.kind])).toEqual(EXPECTED_COMPARE)
    expect(S.mistakes.items).toHaveLength(4)
    expect(S.training.items).toHaveLength(8)
    expect(S.final.sections.map((section) => section.items.length)).toEqual([4, 5, 4])
    expect(finalItems.map((item) => item.number)).toEqual(Array.from({ length: 13 }, (_, index) => index + 1))
    expect(S.homework.rows.map((row) => row.verb)).toEqual(EXPECTED_HOMEWORK.map((row) => row[1]))
    expect(S.summary.cards).toHaveLength(4)
    expect(S.next.examples).toHaveLength(2)
  })
})

describe('morphology 11 — السلامة الصرفية', () => {
  it('يبقي «غالبًا» في القاعدة والحفظ والخلاصة والسؤال العاشر، ويشرح سببها', () => {
    expect(S.triliteral.ruleLead).toContain('غالبًا')
    expect(S.nonTriliteral.remember[0]).toContain('غالبًا')
    expect(S.summary.cards[1].text).toContain('غالبًا')
    expect(finalItems[9].prompt).toContain('غالبًا')
    expect(C.clarifications.whyOften).toMatch(/كَرُمَ.*حَسُنَ/)
    expect(C.clarifications.whyOften).toContain('الصفة المشبّهة')
  })

  it('يقابل حروف «كاتِب» بمواضع «فاعِل»: فاء وألف زائدة وعين مكسورة ولام', () => {
    expect(C.clarifications.anatomy.map((part) => part.label)).toEqual(['فاء الكلمة', 'ألف الوزن', 'عين الكلمة', 'لام الكلمة'])
    expect(C.clarifications.anatomy.map((part) => part.word).join('')).toBe('كَاتِب')
    expect(C.clarifications.anatomy[2].weight).toBe('عِ')
    expect(C.clarifications.anatomy[2].word).toBe('تِ')
  })

  it('اسم الفاعل من الثلاثي على فاعِل: ألف ثانية وكسر ما قبل الآخر في كل مثال', () => {
    const triliteral = [...S.triliteral.rows.map((row) => row.participle), ...S.definition.quickRows.map((row) => row.participle), 'راسِم', 'فاتِح', 'حافِظ', 'سامِع', 'ناجِح', 'حامِل']
    for (const word of triliteral) {
      expect([...word.replace(harakat, '')][1], word).toBe('ا')
      expect(beforeLast(word).marks, word).toBe('ِ')
    }
    for (const row of C.verbAnalyses.filter((item) => item.how.startsWith('على فاعِل'))) {
      expect([...row.participle.replace(harakat, '')][1], row.verb).toBe('ا')
      expect(beforeLast(row.participle).marks, row.verb).toBe('ِ')
    }
  })

  it('اسم الفاعل من غير الثلاثي = المضارع بميم مضمومة مكان حرف المضارعة وكسر ما قبل الآخر', () => {
    const chains = [
      ...S.nonTriliteral.rows.map((row) => [row.present, row.participle]),
      ...C.clarifications.extraChains.map((row) => [row.present, row.participle]),
      ...C.verbAnalyses.filter((row) => row.how.startsWith('ميم مضمومة')).map((row) => [row.present, row.participle]),
    ]
    expect(chains.length).toBeGreaterThanOrEqual(20)
    for (const [present, participle] of chains) {
      expect(participle.startsWith('مُ'), participle).toBe(true)
      expect(looseKey(participle).slice(1), participle).toBe(looseKey(present).slice(1))
      if (!/ي$/.test(looseKey(participle).slice(0, -1))) expect(beforeLast(participle).marks, participle).toContain('ِ')
    }
    // تَعَلَّمَ: المضارع مفتوح ما قبل الآخر، واسم الفاعل مكسوره.
    expect(beforeLast('يَتَعَلَّمُ'.slice(0, -1)).marks).toContain('َ')
    expect(beforeLast('مُتَعَلِّم').marks).toContain('ِ')
  })

  it('يفرّق بالحركة: مُكْرِم/مُكْرَم ومُعَلِّم/مُعَلَّم، ولا يعدّ كتابة أو مكتوب اسم فاعل', () => {
    expect(S.compare.rows.find((row) => row.word === 'مكتوب')!.kind).toBe('اسم مفعول')
    expect(S.compare.rows.find((row) => row.word === 'كتابة')!.kind).toBe('مصدر')
    expect(S.compare.rows.find((row) => row.word === 'مُعَلِّم')!.kind).toBe('اسم فاعل')
    expect(S.compare.rows.find((row) => row.word === 'مُعَلَّم')!.kind).toContain('اسم مفعول')
    expect(C.clarifications.participleVsObject).toMatch(/مُكْرِم \(بكسر الراء\).*مُكْرَم \(بفتح الراء\)/)
    expect(C.homeworkKeys['hw-akrama'].participle).toBe('مُكْرِم')
    expect(C.finalKeys['final-11'].answer).toBe('خطأ')
    expect(C.finalKeys['final-13'].answer).toBe('خطأ')
    for (const text of strings(C.trainingKeys)) expect(text).not.toMatch(/(كتابة|مكتوب)[»"]? اسم فاعل/)
  })

  it('لا يجعل اسم الفاعل دالًا على الماضي دائمًا، ولا يبالغ في قاعدة المعتلّ', () => {
    expect(S.triliteral.timeLead).toContain('لا يعني بالضرورة')
    expect(S.mistakes.items[3].right).toContain('يحدّد السياق الزمن')
    expect(C.clarifications.defectiveWhy).toContain('ليس قاعدة مطلقة')
    expect(C.clarifications.defectiveStates.map((row) => row.forms[0])).toEqual(['داعٍ', 'داعيًا', 'الداعي', 'داعي الخير'])
    expect(C.clarifications.defectiveStates[0].state).toMatch(/نكرة غير مضافة.*الرفع أو الجر/)
    expect(C.clarifications.hollowWhy).toMatch(/تُقلب همزة: قائِل، بائِع، نائِم/)
    expect(S.weak.advanced).toContain('تفاصيل متقدمة نسبيًا')
  })

  it('ينبّه إلى اسم الفاعل «مُفيدًا» في المثال (أ)، وإلى بقية أسماء الفاعل في أسئلة الختامي 1–3', () => {
    expect(C.clarifications.mufidan).toContain('أفادَ ← يُفيدُ ← مُفيد')
    expect(C.finalKeys['final-1'].explanation).toContain('زارَعَ')
    expect(C.finalKeys['final-2'].explanation).toContain('المعلّمُ')
    expect(C.finalKeys['final-3'].explanation).toMatch(/نافعةٌ.*مستفيدٌ/)
    expect(C.finalKeys['final-4'].explanation).toContain('فاتِح')
  })

  it('يقدّم إعرابًا كاملًا: موقع وحالة وعلامة أو بناء لكل كلمة', () => {
    expect(C.parsings.length).toBeGreaterThanOrEqual(8)
    for (const entry of C.parsings) {
      for (const line of entry.lines) {
        expect(line, line).toMatch(/(مبتدأ|خبر|فاعل|مفعول به|نعت|مضاف إليه|اسم مجرور|حرف جر|فعل ماضٍ|اسم إشارة)/)
        expect(line, line).toMatch(/(مرفوع|منصوب|مجرور|مبني)/)
        expect(line, line).toMatch(/(علامة|في محل|مبني على)/)
      }
    }
    const all = C.parsings.flatMap((entry) => entry.lines).join('\n')
    expect(all).toContain('داعٍ: فاعل مرفوع وعلامة رفعه الضمة المقدّرة على الياء المحذوفة')
    expect(all).toContain('ساعٍ: مضاف إليه مجرور وعلامة جره الكسرة المقدّرة على الياء المحذوفة')
    expect(all).toContain('هذا: اسم إشارة مبني على السكون في محل رفع مبتدأ.')
  })
})

describe('morphology 11 — مفاتيح التدريب والختامي والواجب', () => {
  it('لكل سؤال تدريبي ثلاثة خيارات والمفتاح أحدها، مع شرح', () => {
    expect(S.training.items.map((item) => C.trainingKeys[item.id].answer)).toEqual(EXPECTED_TRAINING_KEYS)
    for (const item of S.training.items) {
      expect(item.options).toHaveLength(3)
      expect(item.options).toContain(C.trainingKeys[item.id].answer)
      expect(C.trainingKeys[item.id].explanation.length).toBeGreaterThan(60)
    }
  })

  it('لكل سؤال من الثلاثة عشر نموذج إجابة وشرح، ومفاتيح الصياغة وصح/خطأ مضبوطة', () => {
    for (const item of finalItems) {
      expect(C.finalKeys[item.id].answer.length).toBeGreaterThan(1)
      expect(C.finalKeys[item.id].explanation.length).toBeGreaterThan(40)
    }
    for (const [id, answer] of Object.entries(EXPECTED_FINAL_FORM_KEYS)) expect(C.finalKeys[id].answer).toBe(answer)
    for (const [id, answer] of Object.entries(EXPECTED_FINAL_TF_KEYS)) expect(C.finalKeys[id].answer).toBe(answer)
  })

  it('يحل الواجب: اسم الفاعل والنوع، وباعَ ثلاثي أجوف', () => {
    for (const [id, , participle, type] of EXPECTED_HOMEWORK) {
      expect(C.homeworkKeys[id]).toMatchObject({ participle, type })
      expect(C.homeworkKeys[id].explanation.length).toBeGreaterThan(30)
    }
    expect(C.homeworkKeys['hw-baa'].explanation).toContain('أجوف')
  })
})

describe('morphology 11 — الاختبار المستقل (٢٠ سؤالًا)', () => {
  it('عشرون سؤالًا في أربع صفحات × خمسة، بمعرّفات ثابتة، ومطابقة صارمة', () => {
    expect(C.testDefinition.matching).toBe('strict')
    expect(C.testDefinition.pages.map((page) => page.questions.length)).toEqual([5, 5, 5, 5])
    expect(questions.map((q) => q.id)).toEqual(Array.from({ length: 20 }, (_, i) => `morph11-q${String(i + 1).padStart(2, '0')}`))
    expect(questions.map((q) => q.number)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
  })

  it('آلي بالكامل (اختيار/قائمة/متعدد) ولكل حقل مفتاح من خياراته، ومطابق للتجهيزات', () => {
    for (const question of questions) {
      expect(question.answerSource).toBe('platform')
      for (const [index, field] of question.fields.entries()) {
        expect(['choice', 'select', 'multi']).toContain(field.kind)
        const expected = EXAM_ANSWERS[`${question.id}:${index}`]
        if (field.kind === 'multi') {
          expect(field.answers).toEqual(expected)
          for (const answer of field.answers) expect(field.options).toContain(answer)
        } else if (field.kind === 'choice' || field.kind === 'select') {
          expect([field.answer]).toEqual(expected)
          expect(field.options).toContain(field.answer)
          expect(new Set(field.options).size).toBe(field.options.length)
        }
      }
    }
    expect(Object.keys(EXAM_ANSWERS)).toHaveLength(questions.reduce((sum, q) => sum + q.fields.length, 0))
  })

  it('لكل سؤال حل مفصّل: إجابة وقاعدة وشرح يبيّن الخطأ الشائع أو سبب استبعاد المشتتات', () => {
    for (const question of questions) {
      expect(question.solution).toBeTruthy()
      expect(question.rule!.length).toBeGreaterThan(20)
      expect(question.explanation!.length).toBeGreaterThan(110)
    }
    expect(questions.filter((q) => q.explanation!.includes('الخطأ الشائع') || q.explanation!.includes('خطأ شائع')).length).toBeGreaterThanOrEqual(6)
  })

  it('لا ينسخ أسئلة التدريب ولا الختامي، ويغطي الأهداف الستة', () => {
    const lessonPrompts = [...S.training.items.map((i) => i.prompt), ...finalItems.map((i) => i.prompt)]
    for (const question of questions) {
      expect(lessonPrompts).not.toContain(question.prompt)
      if (question.sentence) for (const prompt of lessonPrompts) expect(prompt).not.toContain(question.sentence.replace(/\.$/, ''))
    }
    const usedVerbs = ['دَرَسَ', 'أكرمَ', 'استخرجَ', 'لَعِبَ', 'كَتَبَ', 'حَفِظَ', 'أَحْسَنَ', 'اِنْطَلَقَ', 'اِسْتَخْرَجَ']
    for (const question of questions) for (const verb of usedVerbs) expect(question.prompt).not.toContain(`«${verb}»`)
    expect(Object.keys(OBJECTIVE_COVERAGE).map(Number)).toEqual([1, 2, 3, 4, 5, 6])
    const covered = new Set(Object.values(OBJECTIVE_COVERAGE).flat())
    expect([...covered].sort((a, b) => a - b)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
    expect(new Set(questions.map((q) => q.level)).size).toBe(4)
  })
})

describe('morphology 11 — النطاق والأمان والعرض', () => {
  it('لا رابط ولا تسجيل للدرس الثاني عشر، والمعاينة نصية', () => {
    expect(lessonSource).not.toMatch(/morphology-lesson-12|LessonMorphologyTwelve/)
    expect(strings(S.next).join(' ')).not.toMatch(/href|#\/lesson/)
    expect(C.clarifications.nextNote).toContain('غير منشور بعد')
  })

  it('لا تظهر كلمة مرور المعلم في ملفات الدرس أو التوثيق', () => {
    for (const text of [lessonSource, JSON.stringify(C), sourceMarkdown, auditMarkdown]) expect(text).not.toContain(COURSE_TEACHER_PASSWORD)
  })

  it('لا تُعرض حلول الاختبار المستقل في منطقة المعلم، ويُعرض SolutionsArea للطالب بعد التسليم فقط', () => {
    expect(lessonSource.match(/<SolutionsArea/g)).toHaveLength(1)
    expect(lessonSource).not.toContain('mode="teacher"')
    expect(lessonSource).toContain('revealFeedback={submitted}')
  })

  it('يحمي الكلمات المشكولة من القطع والقصّ ويحترم RTL وتقليل الحركة', () => {
    expect(lessonStyles).toMatch(/\.morph11-word, \.morph11-pair, \.morph11-sentence bdi \{[^}]*white-space: nowrap/)
    expect(lessonStyles).toMatch(/\.morph11-word \{[^}]*line-height|font: 700 1\.3rem\/2\.3/)
    expect(lessonStyles).not.toMatch(/text-align:\s*(left|right)|direction:\s*(ltr|rtl)/)
    expect(lessonStyles).toContain('@media (prefers-reduced-motion: reduce)')
    expect(lessonStyles).toContain('@media (max-width: 560px)')
    expect(lessonStyles).toMatch(/\.morph11-table-scroll \{[^}]*overflow-x: auto/)
  })

  it('يوثّق التدقيق المصدر دون نسبة إلى كتاب ويذكر النقاط غير المؤكدة', () => {
    expect(auditMarkdown).toContain('لا يُنسب أي جزء من الدرس أو من تصحيحاته إلى كتاب خارجي')
    expect(auditMarkdown).toContain('نقاط غير مؤكدة')
    expect(auditMarkdown).toContain('أَنْجَزَ ← يُنْجِزُ ← مُنْجِز')
  })
})
