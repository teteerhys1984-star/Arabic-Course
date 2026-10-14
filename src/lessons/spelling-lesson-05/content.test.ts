/// <reference types="node" />
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import sourceMarkdown from '../../../docs/source/spelling-lesson-05.md?raw'
import lessonSource from '../LessonSpellingFive.tsx?raw'
import * as C from './content'
import {
  CUMULATIVE_KEYS, ERROR_KEYS, EXPLAIN_KEYS, GLYPH_KEYS, NOUN_ORIGIN_KEYS, NOUN_SORT_KEYS,
  PARTICLE_KEYS, TREE_KEYS, VERB_KEYS,
} from './test-fixtures'

const S = C.sourceContent
const styles = readFileSync('src/styles/spelling-lesson-05.css', 'utf8')
const strings = (value: unknown): string[] =>
  typeof value === 'string' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : []

const body = sourceMarkdown.slice(sourceMarkdown.indexOf('-->') + 3)
const sourceCells = body.split('\n').flatMap((line) => {
  const trimmed = line.trim()
  if (!trimmed) return []
  if (/^\|[-:\s|]+\|$/.test(trimmed)) return []
  if (trimmed.startsWith('|')) return trimmed.split('|').map((cell) => cell.trim()).filter(Boolean)
  return [trimmed.replace(/^#+\s*/, '').replace(/^(?:- |\d+\. )/, '')]
})

describe('spelling 5 — النسخة المحفوظة من المصدر', () => {
  it('يثبّت الملف الخام ببصمته وبدايته ونهايته', () => {
    expect(createHash('sha256').update(sourceMarkdown).digest('hex')).toBe(
      'feb9768725ff859c4dc7e4618030c64b77d63e081379488fa65823f2afe8aca1',
    )
    expect(body.trim().startsWith(`# ${S.header.title}`)).toBe(true)
    expect(sourceMarkdown.trimEnd().endsWith(S.homework.next)).toBe(true)
  })

  it('يمثّل كل سطر/خلية من المصدر حرفيًا في بيانات العرض', () => {
    const represented = [...strings(S), ...strings(C.practiceQuestions)].join('\n')
    expect(sourceCells).toHaveLength(282)
    for (const cell of sourceCells) expect(represented, `Unrepresented source cell: ${cell}`).toContain(cell)
  })

  it('يحفظ أسئلة التدريب السبعة وخياراتها بترتيب المصدر', () => {
    for (const item of C.practiceQuestions) {
      const index = body.indexOf(item.prompt)
      expect(index).toBeGreaterThan(-1)
      const block = body.slice(index, index + 200)
      const optionLines = block.split('\n').slice(1, 4).map((line) => line.trim().replace(/^- /, ''))
      expect(item.options.map((o) => o.value)).toEqual(optionLines)
    }
  })
})

describe('spelling 5 — التصحيحات والتوضيحات', () => {
  it('يوثّق تسعة تصحيحات مرقّمة، وكل أصل مقتبس موجود في المصدر أو مأخوذ من بيانات المصدر', () => {
    expect(C.corrections.map((c) => c.id)).toEqual(['ت-١', 'ت-٢', 'ت-٣', 'ت-٤', 'ت-٥', 'ت-٦', 'ت-٧', 'ت-٨', 'ت-٩'])
    for (const id of ['ت-١', 'ت-٢', 'ت-٨', 'ت-٩']) {
      const entry = C.corrections.find((c) => c.id === id)!
      expect(body).toContain(entry.original)
    }
    for (const c of C.corrections) {
      expect(c.corrected.length).toBeGreaterThan(40)
      expect(c.reason.length).toBeGreaterThan(30)
    }
  })

  it('يعرض كل تصحيح في الدرس (لا في التقرير وحده)', () => {
    for (const id of ['ت-١', 'ت-٢', 'ت-٣', 'ت-٤', 'ت-٥', 'ت-٦', 'ت-٨', 'ت-٩']) expect(lessonSource).toContain(`<CorrectionNote id="${id}" />`)
    // ت-٧ يُعرض عبر توضيحات أسئلة التدريب.
    expect(C.practiceQuestions.filter((q) => q.clarification?.includes('ت-٧'))).toHaveLength(2)
  })

  it('لا يدّعي أن «يسعى» تكشف الأصل، ويقدّم دليلًا بديلًا', () => {
    expect(C.verbTableEvidence.saa.evidence).toBe('indirect')
    expect(C.verbTableEvidence.saa.proof).toContain('سَعَيْتُ')
    const saaLab = C.verbPresentLab.find((c) => c.id === 'saa')!
    expect(saaLab.stages.find((s) => s.id === 'reveal')!.answer).toBe('لا يكشف')
  })

  it('يعلّم «رُبا» و«ذُرا» بأنها تحتاج إلى معجم ولا يستعملهما في الأنشطة أو الاختبار', () => {
    expect(C.nounTableReasons.ruba.evidence).toBe('dictionary')
    expect(C.nounTableReasons.thura.evidence).toBe('dictionary')
    const assessed = JSON.stringify([C.nounOriginLab, C.nounSortLab, C.explainLab, C.cumulativeLab, C.testDefinition])
    for (const word of ['رُبا', 'ذُرا', 'ربا', 'ذرا']) expect(assessed).not.toContain(word)
  })

  it('يعدّ الأحرف عدًّا صحيحًا في بطاقات الحروف', () => {
    const expected: Record<string, number> = { مصطفى: 5, مستشفى: 6, ذكرى: 4, كبرى: 4, دنيا: 4, عليا: 4, هدايا: 5, قضايا: 5, أعطى: 4, اهتدى: 5, استدعى: 6, ارتضى: 5, انقضى: 5, أحيا: 4, أعيا: 4, استحيا: 6 }
    for (const row of [...C.nounMultiWords, ...C.verbMultiRows]) {
      expect(row.letters.join('')).toBe(row.word)
      expect(row.letters).toHaveLength(expected[row.word])
      expect(row.before).toBe(row.letters[row.letters.length - 2])
      expect(row.shape === 'qaima').toBe(row.before === 'ي')
    }
  })

  it('الإعراب كامل بالعلامة وسبب التقدير', () => {
    expect(C.clarifications.parsing).toEqual([
      'وقفَ: فعل ماضٍ مبني على الفتحة الظاهرة على آخره.',
      'الفتى: فاعل مرفوع وعلامة رفعه الضمة المقدّرة على الألف، منع من ظهورها التعذّر.',
      'أمامَ: ظرف مكان منصوب وعلامة نصبه الفتحة الظاهرة على آخره، وهو مضاف.',
      'المعلّمِ: مضاف إليه مجرور وعلامة جره الكسرة الظاهرة على آخره.',
    ])
  })
})

describe('spelling 5 — مفاتيح الأنشطة مطابقة للمفاتيح المستقلة', () => {
  it('مختبر الأشكال والتراكمي والتفسير والأخطاء', () => {
    for (const item of C.glyphLab) expect(item.answer).toBe(GLYPH_KEYS[item.id])
    for (const item of C.cumulativeLab) expect(item.answer).toBe(CUMULATIVE_KEYS[item.id])
    for (const item of C.explainLab) expect(item.spellAnswer).toBe(EXPLAIN_KEYS[item.id])
    for (const item of C.errorLab.filter((e) => !e.fromSource)) expect(item.answer).toBe(ERROR_KEYS[item.id])
    for (const item of [...C.glyphLab, ...C.cumulativeLab]) {
      expect(item.options.map((o) => o.value)).toContain(item.answer)
      for (const o of item.options) expect(o.explanation.length).toBeGreaterThan(8)
    }
  })

  it('المختبرات المتدرجة والفرز والشجرة', () => {
    for (const c of C.nounOriginLab) expect(c.stages.map((s) => s.answer)).toEqual(NOUN_ORIGIN_KEYS[c.id])
    for (const c of C.verbPresentLab) expect(c.stages.map((s) => s.answer)).toEqual(VERB_KEYS[c.id])
    for (const c of [...C.nounOriginLab, ...C.verbPresentLab]) for (const s of c.stages) expect(s.options.map((o) => o.value)).toContain(s.answer)
    for (const item of C.nounSortLab) expect(item.shape).toBe(NOUN_SORT_KEYS[item.id])
    for (const item of C.particleLab) expect(item.shape).toBe(PARTICLE_KEYS[item.id])
    for (const word of C.treeWords) expect(word.result).toBe(TREE_KEYS[word.id])
  })
})

describe('spelling 5 — الهوية البصرية والاتجاه', () => {
  it('أنماط محصورة في الدرس، بلا اتجاه صريح ولا محاذاة يسار/يمين، ومع تقليل الحركة', () => {
    expect(styles).not.toMatch(/direction\s*:/)
    expect(styles).not.toMatch(/text-align:\s*(left|right)/)
    expect(styles).not.toMatch(/(?:margin|padding)-(?:left|right)|\b(?:left|right)\s*:/)
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)')
    for (const selector of styles.replace(/\/\*[\s\S]*?\*\//g, '').match(/^[^@\s}][^{]*\{/gm) ?? []) {
      expect(selector.trim().startsWith('.spell5-'), selector).toBe(true)
    }
    for (const bp of ['900px', '700px', '480px']) expect(styles).toContain(`(max-width: ${bp})`)
  })

  it('لا يحتوي الدرس بيانات تواصل ولا تمريرًا آليًا', () => {
    expect(lessonSource).not.toMatch(/scrollIntoView|IntersectionObserver|mailto:|wa\.me|tel:/)
  })
})
