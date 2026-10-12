/// <reference types="node" />
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import sourceMarkdown from '../../../docs/source/morphology-lesson-09.md?raw'
import lessonSource from '../LessonMorphologyNine.tsx?raw'
import * as C from './content'
import {
  EXPECTED_ANALYSIS_KEYS,
  EXPECTED_AUGMENTED,
  EXPECTED_BASICS,
  EXPECTED_KIND_LAB_KEYS,
  EXPECTED_MASDAR_LAB_KEYS,
  EXPECTED_POSITION_KEYS,
  EXPECTED_TRAINING_KEYS,
  EXPECTED_TRILITERAL,
  EXPECTED_WEIGHT_LAB_KEYS,
  EXAM_ANSWERS,
} from './test-fixtures'

const lessonStyles = readFileSync('src/styles/morphology-lesson-09.css', 'utf8')
const S = C.sourceContent
const questions = C.testDefinition.pages.flatMap((page) => page.questions)
const trainingItems = S.trainings.groups.flatMap((group) => [...group.items])
const strings = (value: unknown): string[] =>
  typeof value === 'string' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : []

/**
 * خلايا المصدر الجوهرية: كل سطر غير فارغ بعد ترويسة الملف، مع تفكيك صفوف الجداول
 * إلى خلاياها وتجاهل أسطر الفواصل. علامات القوائم تمثيلية فقط.
 */
const body = sourceMarkdown.slice(sourceMarkdown.indexOf('-->') + 3)
const sourceCells = body
  .split('\n')
  .flatMap((line) => {
    const trimmed = line.trim()
    if (!trimmed) return []
    if (/^\|[-\s|]+\|$/.test(trimmed)) return []
    if (trimmed.startsWith('|')) return trimmed.split('|').map((cell) => cell.trim()).filter(Boolean)
    return [trimmed.replace(/^(?:- |\d+\. )/, '')]
  })

describe('morphology 09 — النسخة المحفوظة من المصدر ثابتة وممثَّلة كاملة', () => {
  it('يثبّت الملف الخام ببصمته، بما فيه سطر الزرين المدمج', () => {
    expect(createHash('sha256').update(sourceMarkdown).digest('hex')).toBe(
      'b90905ef9746b33258793d5552dc1808a687e6d39df76ca3a4a42d13a03ca76d',
    )
    expect(sourceMarkdown.split('\n')).toHaveLength(527)
    expect(sourceMarkdown).toContain('إظهار الإجابات والتصحيحإعادة التدريبات')
    expect(sourceMarkdown).toContain('| فِعْل | فِهْم | فَهِمَ، والأشيع مصدره فَهْم |')
    expect(sourceMarkdown).toContain('| فِعْلة | جِلْسة | جَلَسَ، بحسب المعنى والاستعمال |')
    expect(body.trim().startsWith(S.header.firstTitle)).toBe(true)
    expect(sourceMarkdown.trimEnd().endsWith(S.nextLesson)).toBe(true)
  })

  it('يمثّل كل سطر/خلية جوهرية في بيانات العرض دون تجريد الحركات أو إعادة صياغة', () => {
    const represented = strings(S).join('\n')
    expect(sourceCells).toHaveLength(374)
    for (const cell of sourceCells) expect(represented, `Unrepresented source cell: ${cell}`).toContain(cell)
  })

  it('يحفظ عناوين الأقسام الاثني عشر بترتيب المصدر', () => {
    expect(C.sourceSections).toHaveLength(12)
    expect(C.sourceSections.map((heading) => heading.split(':')[0].split('—')[0].trim())).toEqual([
      'أولًا',
      'ثانيًا',
      'ثالثًا',
      'رابعًا',
      'خامسًا',
      'سادسًا',
      'سابعًا',
      'ثامنًا',
      'تاسعًا',
      'عاشرًا',
      'الحادي عشر',
      'الثاني عشر',
    ])
    const offsets = C.sourceSections.map((heading) => sourceMarkdown.indexOf(heading))
    expect(offsets.every((offset) => offset > 0)).toBe(true)
    expect(offsets).toEqual([...offsets].sort((a, b) => a - b))
    expect(S.summary.points).toHaveLength(5)
    expect(S.summary.branches.map((branch) => branch.items.length)).toEqual([3, 3])
  })

  it('يحفظ الجداول الأربعة بصفوفها وخلاياها كاملة وفي ترتيبها', () => {
    expect(S.basics.rows).toHaveLength(8)
    S.basics.rows.forEach((row, index) => expect([row.verb, row.masdar, row.event]).toEqual([...EXPECTED_BASICS[index]]))
    expect(S.kinds.rows).toHaveLength(4)
    expect(S.triliteral.rows).toHaveLength(10)
    S.triliteral.rows.forEach((row, index) => expect([row.weight, row.masdar, row.verb]).toEqual([...EXPECTED_TRILITERAL[index]]))
    expect(S.augmented.rows).toHaveLength(8)
    S.augmented.rows.forEach((row, index) =>
      expect([row.verb, row.verbWeight, row.masdar, row.masdarWeight]).toEqual([...EXPECTED_AUGMENTED[index]]),
    )
    // الأوزان المكررة تُحفظ كما وردت، ولا تُدمج لمجرد التشابه في الرسم.
    expect(S.triliteral.rows.filter((row) => row.weight === 'فِعالة').map((row) => row.masdar)).toEqual(['كِتابة', 'زِراعة'])
    expect(S.basics.columns).toEqual(['الفعل', 'المصدر', 'الحدث الذي يدلّ عليه'])
    expect(S.kinds.columns).toEqual(['النوع', 'المثال من الفعل «كَتَبَ»', 'الدلالة'])
    expect(S.triliteral.columns).toEqual(['وزن المصدر', 'مثال المصدر', 'الفعل'])
    expect(S.augmented.columns).toEqual(['الفعل', 'وزن الفعل', 'المصدر', 'وزن المصدر'])
  })

  it('يحفظ التدريبات الاثني عشر بنصوصها وخياراتها وترقيمها', () => {
    expect(S.trainings.groups.map((group) => group.items.length)).toEqual([4, 4, 4])
    expect(trainingItems.map((item) => item.number)).toEqual(Array.from({ length: 12 }, (_, index) => index + 1))
    expect(trainingItems.map((item) => item.prompt)).toEqual([
      'كِتابة', 'يَكْتُبُ', 'مُعَلِّم', 'اسْتِخْراج',
      'مصدر عَلَّمَ هو:', 'مصدر تَعَلَّمَ هو:', 'مصدر اسْتَخْرَجَ هو:', 'مصدر دَحْرَجَ هو:',
      'إِكْرام', 'تَعْليم', 'اسْتِخْراج', 'تَعَلُّم',
    ])
    for (const item of trainingItems) {
      expect(item.options).toHaveLength(3)
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

describe('morphology 09 — التدقيق الصرفي وتوضيحات المنصة', () => {
  it('يفصل وزن الفعل عن وزن المصدر في كل صف من صفوف المزيدة', () => {
    for (const row of S.augmented.rows) {
      expect(row.verbWeight).not.toBe(row.masdarWeight)
      expect(row.verb).not.toBe(row.masdar)
    }
    expect(S.augmented.rows.filter((row) => row.masdarWeight === 'اسْتِفْعال').map((row) => row.verb)).toEqual(['اسْتَخْرَجَ'])
  })

  it('لا يقدّم وزنًا واحدًا قاعدةً مطّردة للثلاثي، ويقيّد المثالين الملتبسَين', () => {
    expect(S.triliteral.rule).toContain('سماعي')
    expect(new Set(S.triliteral.rows.map((row) => row.weight)).size).toBe(9)
    expect(C.clarifications.samai).toContain('لا يجوز تقديم وزن واحد')
    expect(C.clarifications.fahm).toContain('فَهْم')
    expect(C.clarifications.fahm).toContain('عِلْم')
    expect(C.clarifications.marra).toContain('مصدر مرّة')
    expect(C.clarifications.marra).toContain('جُلوس')
    expect(C.clarifications.quadriliteral).toContain('فَعْلَلة')
    // المثال الأصلي يبقى في سياقه ولا يُستبدل.
    expect(S.triliteral.rows[1].masdar).toBe('فِهْم')
    expect(S.triliteral.rows[8].masdar).toBe('جِلْسة')
  })

  it('يفرّق بين التصنيف الصرفي والموقع الإعرابي في أمثلة المصدر الأربعة', () => {
    expect(S.positions.items.map((item) => item.position)).toEqual([
      'موقعه الإعرابي: مبتدأ مرفوع.',
      'موقعه الإعرابي: مفعول به منصوب.',
      'موقعه الإعرابي: اسم مجرور بالباء.',
      'موقعه الإعرابي: مفعول مطلق منصوب.',
    ])
    expect(S.positions.observation).toContain('بقيت مصدرًا')
    expect(C.clarifications.morphoSyntax).toContain('القِراءة')
    expect(C.clarifications.absolute).toContain('قَفَزْتُ قَفْزَتَيْنِ')
  })

  it('يحلّل صرفيًا كل الأمثلة الأساسية ويعرب كل الجمل التي تحتاج إعرابًا', () => {
    expect(C.morphologyAnalyses.length).toBeGreaterThanOrEqual(18)
    for (const row of S.basics.rows) {
      const analysis = C.morphologyAnalyses.find((item) => item.verb === row.verb)
      expect(analysis, `No morphological analysis for ${row.verb}`).toBeDefined()
      expect(analysis!.masdar).toBe(row.masdar)
      expect(analysis!.verbWeight.length).toBeGreaterThan(2)
      expect(analysis!.masdarWeight.length).toBeGreaterThan(2)
    }
    for (const row of S.augmented.rows) {
      const analysis = C.morphologyAnalyses.find((item) => item.verb === row.verb)
      expect(analysis, `No morphological analysis for ${row.verb}`).toBeDefined()
      expect(analysis!.verbWeight).toBe(row.verbWeight)
      expect(analysis!.masdarWeight).toBe(row.masdarWeight)
    }
    expect(C.parsings.length).toBe(20)
    // نقطة النهاية لا تغيّر الجملة؛ تُقارَن بعد تجريدها.
    const withoutDot = (text: string) => text.replace(/[.،]$/u, '').trim()
    for (const sentence of S.positions.items.map((item) => item.sentence)) {
      const entry = C.parsings.find((item) => withoutDot(item.sentence) === withoutDot(sentence))
      expect(entry, `No parsing for ${sentence}`).toBeDefined()
      expect(entry!.lines.length).toBeGreaterThanOrEqual(2)
      expect(entry!.lines.join(' ')).toMatch(/مرفوع|منصوب|مجرور/)
    }
    expect(C.parsings.find((item) => item.sentence === 'قَفَزْتُ قَفْزَتَيْنِ.')!.lines.join(' ')).toContain('مفعول مطلق')
    expect(C.parsings.find((item) => item.sentence === 'أستمتعُ بالقراءةِ.')!.lines.join(' ')).toContain('حرف جر')
  })

  it('يقيّد مثال اسم الفاعل واسم المفعول بدل تمريرهما بلا توضيح', () => {
    expect(S.kinds.items[2].example).toBe('مثال: الطالبُ كاتِبٌ الرسالةَ.')
    expect(S.kinds.items[3].example).toBe('مثال: الرسالةُ مَكْتوبةٌ.')
    expect(C.clarifications.doer).toContain('خبر مرفوع')
    expect(C.clarifications.doer).toContain('مشروط')
    expect(C.clarifications.done).toContain('كُتِبَ')
    expect(C.clarifications.done).toContain('مَفْعول')
  })

  it('لا يفصل حرفًا عن حركته عند إبراز الفعل والمصدر والوزن', () => {
    const words = [
      ...S.basics.rows.flatMap((row) => [row.verb, row.masdar]),
      ...S.triliteral.rows.flatMap((row) => [row.weight, row.masdar]),
      ...S.augmented.rows.flatMap((row) => [row.verb, row.verbWeight, row.masdar, row.masdarWeight]),
      ...S.summary.branches.flatMap((branch) => branch.items),
      ...S.categories.items.flatMap((item) => item.examples),
    ].flatMap((entry) =>
      entry
        .split(/[←،]/u)
        .map((part) => part.replace(/^أمثلة: /u, '').replace(/[.\u060c]$/u, '').trim())
        .filter(Boolean),
    )
    for (const word of words) {
      expect(word, `Word must stay joined: ${word}`).not.toMatch(/^\p{M}|\s/u)
      expect(word.trim()).toBe(word)
    }
    expect(C.arrowPair('كَتَبَ ← كِتابة')).toEqual({ verb: 'كَتَبَ', masdar: 'كِتابة' })
    expect(lessonStyles).toContain('white-space: nowrap')
    expect(lessonStyles).toContain('unicode-bidi: isolate')
    expect(lessonStyles).toContain('@media (prefers-reduced-motion: reduce)')
    expect(lessonStyles).not.toMatch(/direction:\s*(left|right)|text-align:\s*(left|right)/)
    expect(C.arabicDigits(20)).toBe('٢٠')
  })
})

describe('morphology 09 — مختبرات المنصة واختبارها المستقل ودليل معلّمها', () => {
  it('يملك خمسة مختبرات عاملة بمفاتيح مدقَّقة وتغذية راجعة', () => {
    expect(C.kindsLab.items.map((item) => item.answer)).toEqual([...EXPECTED_KIND_LAB_KEYS])
    expect(C.masdarLab.items.map((item) => item.answer)).toEqual([...EXPECTED_MASDAR_LAB_KEYS])
    expect(C.weightLab.items.map((item) => item.answer)).toEqual([...EXPECTED_WEIGHT_LAB_KEYS])
    expect(C.positionLab.items.map((item) => [item.kind, item.position])).toEqual(EXPECTED_POSITION_KEYS.map((pair) => [...pair]))
    expect(C.analysisLab.cases.map((item) => [item.verb, ...item.stages.map((stage) => stage.answer)])).toEqual(
      EXPECTED_ANALYSIS_KEYS.map((row) => [...row]),
    )
    expect(C.practiceLabs).toHaveLength(3)
    for (const lab of C.practiceLabs) {
      for (const item of lab.items) {
        expect(item.options.filter((option) => option === item.answer)).toHaveLength(1)
        expect(item.explanation.length).toBeGreaterThan(35)
      }
    }
    for (const item of C.positionLab.items) expect(item.explanation.length).toBeGreaterThan(35)
    for (const analysis of C.analysisLab.cases) {
      expect(analysis.stages).toHaveLength(4)
      for (const stage of analysis.stages) {
        expect(stage.options).toContain(stage.answer)
        expect(stage.explanation.length).toBeGreaterThan(25)
      }
      expect(analysis.sentence.length).toBeGreaterThan(8)
    }
  })

  it('يعلن ٢٠ سؤالًا جديدًا في ٤ صفحات بمخطط حتمي يصحّحه المحرك المشترك', () => {
    expect(C.testDefinition.id).toBe('morphology-lesson-09-test')
    expect(C.testDefinition.matching).toBe('strict')
    expect(C.testDefinition.pages).toHaveLength(4)
    expect(C.testDefinition.pages.map((page) => page.questions.length)).toEqual([5, 5, 5, 5])
    expect(questions.map((question) => question.number)).toEqual(Array.from({ length: 20 }, (_, index) => index + 1))
    expect(new Set(questions.map((question) => question.id)).size).toBe(20)
    expect(new Set(questions.map((question) => question.level)).size).toBe(5)
    expect(new Set(questions.flatMap((question) => question.fields.map((field) => field.kind)))).toEqual(
      new Set(['choice', 'select', 'multi']),
    )
    expect(questions.flatMap((question) => question.fields)).toHaveLength(23)
    for (const question of questions) {
      expect(question.answerSource).toBe('platform')
      expect(question.sourceAnswer).toBeUndefined()
      expect(question.rule!.length).toBeGreaterThan(20)
      expect(question.explanation!.length).toBeGreaterThan(80)
      expect(question.solution!.length).toBeGreaterThan(0)
      // الأسئلة جديدة: لا تنسخ التدريبات الأصلية ولا نص المصدر.
      expect(trainingItems.map((item) => item.prompt)).not.toContain(question.prompt)
      expect(sourceMarkdown).not.toContain(question.prompt)
      question.fields.forEach((field, fieldIndex) => {
        const expected = EXAM_ANSWERS[`${question.id}:${fieldIndex}`]
        expect(expected, `Missing fixture for ${question.id}:${fieldIndex}`).toBeDefined()
        if (field.kind === 'multi') expect(field.answers).toEqual(expected)
        else if (field.kind === 'choice' || field.kind === 'select') expect(field.answer).toBe(expected[0])
        else throw new Error('Unexpected field kind: الحركات الدالة تقتضي خيارات مغلقة')
      })
    }
    // تغطية موزونة: التعريف والتمييز، الأوزان، الاستخراج، التطبيق والأخطاء.
    expect(questions.filter((question) => question.level === 'التعريف والتمييز')).toHaveLength(5)
    expect(questions.filter((question) => question.level === 'الأوزان الصرفية')).toHaveLength(5)
    expect(questions.filter((question) => question.level === 'الاستخراج والتحليل')).toHaveLength(5)
    expect(questions.filter((question) => question.level === 'التطبيق في الجملة')).toHaveLength(4)
    expect(questions.filter((question) => question.level === 'الأخطاء الشائعة')).toHaveLength(1)
  })

  it('لا ينشر حلول الاختبار في بيانات التدريس أو المختبرات', () => {
    const studentTeaching = JSON.stringify([
      S,
      C.objectives,
      C.clarifications,
      C.kindsLab,
      C.masdarLab,
      C.weightLab,
      C.positionLab,
      C.analysisLab,
      C.trainingSolutions,
    ])
    for (const question of questions) {
      expect(studentTeaching).not.toContain(question.id)
      expect(studentTeaching).not.toContain(question.prompt)
      expect(studentTeaching).not.toContain(question.explanation)
    }
    for (const reserved of ['السِّباحة', 'مَرْسومَةٌ', 'مُنْتَظِر', 'انْتِظارٌ', 'نَصَرَ', 'سَماع', 'تَنْظِيم', 'اِنْطِلاق', 'قِيام', 'تَبادُل', 'مُراسَلة', 'اِسْتِقْبال', 'تَشَجُّع', 'قَلْقَلَة', 'سَجْدَتَيْنِ', 'العَمَلَ']) {
      expect(studentTeaching, `Reserved exam word leaked into teaching data: ${reserved}`).not.toContain(reserved)
    }
    expect(lessonSource).not.toMatch(/data-(?:answer|correct|solution)=/)
  })

  it('يغطّي دليل المعلّم المحاور الاثني عشر والمصادر، ويبقي الدرس العاشر نصيًا', () => {
    expect(C.teacherTopics.map((topic) => topic.heading)).toEqual(C.sourceSections)
    expect(C.teacherTopics).toHaveLength(12)
    expect(C.teacherReferences.source).toBe('docs/source/morphology-lesson-09.md')
    expect(C.teacherReferences.audit).toBe('docs/morphology-lesson-09-audit.md')
    expect(C.teacherReferences.note).toContain('حلول')
    expect(C.teacherReferences.note).toContain('لا تدّعي المنصة')
    expect(lessonSource).toContain('<TeacherSpace>')
    expect(lessonSource).toContain('mode="teacher"')
    expect(lessonSource).not.toContain('password=')
    expect(lessonSource).not.toContain('morphology-lesson-10')
    expect(lessonSource).toContain('لا درس عاشر مسجّل ولا اختبار وحدة')
  })
})
