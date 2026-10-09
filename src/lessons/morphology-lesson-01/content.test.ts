import { describe, expect, it } from 'vitest'
import { activityWords, originalLab, sourceAnswers, testQuestions } from './content'

/**
 * اختبارات تثبيت لمراجعة المصدر (PR #23). تتحقق من النصوص المعتمدة من المصدر،
 * ومن التوضيحات التي تعدها المنصة حتى لا تُعاد صياغتها بما يخالف الصرف العربي.
 */
describe('morphology lesson 1 — source-faithful content', () => {
  it('keeps the source teacher sentence for every true/false question 11–20', () => {
    expect(sourceAnswers[11]).toBe('خطأ. الجذر مجموعة من الحروف الأصلية، وليس كلمة بالضرورة.')
    expect(sourceAnswers[13]).toBe('خطأ. الهمزة قد تكون أصلية، مثل همزة «سأل».')
    expect(sourceAnswers[15]).toBe('خطأ. الجذر ق و ل، والواو لم تظهر في «قال» بصورتها الأصلية بسبب الإعلال.')
    expect(sourceAnswers[20]).toBe('خطأ. لكل علم موضوعه ومنهجه، وإن كان بينهما تداخل.')
  })

  it('does not show a platform sentence as the source answer for true/false items', () => {
    for (let n = 11; n <= 20; n++) {
      const question = testQuestions.find((q) => q.number === n)
      expect(question?.teacherAnswer).toBe(question?.explanation)
    }
  })

  it('explains question 39 without treating the doubled lam as a fourth root letter', () => {
    const q39 = testQuestions.find((q) => q.number === 39)
    expect(q39?.teacherAnswer).toContain('لا يحتوي الجذر لامين')
    expect(q39?.teacherAnswer).toContain('ليس حرفًا أصليًا رابعًا')
    expect(q39?.teacherAnswer).toContain('لا أن الجذر فيه حرفان من هذا النوع')
  })

  it('treats تعليم as unshadded in its own spelling, with the masdar pattern explained', () => {
    const ta3lim = activityWords.find((w) => w.word === 'تعليم')
    expect(ta3lim?.doubled).toBe(false)
    expect(ta3lim?.explanation).toContain('لا توجد شدة في الصورة المكتوبة')
    expect(ta3lim?.explanation).toContain('تَفْعيل')
  })

  it('records the second alif of the pattern for استغفار and انطلاق', () => {
    expect(activityWords.find((w) => w.word === 'استغفار')?.extra).toEqual(['ا', 'س', 'ت', 'ا'])
    expect(activityWords.find((w) => w.word === 'انطلاق')?.extra).toEqual(['ا', 'ن', 'ا'])
  })

  it('qualifies every «زائد» claim in the analysis data by its pattern or structure', () => {
    const claims = [
      ...activityWords.map((w) => w.explanation),
      ...originalLab.map((item) => item.explanation),
    ].filter((text) => text.includes('زائد'))
    expect(claims.length).toBeGreaterThan(0)
    for (const text of claims) {
      expect(/صيغة|بنية|وزن/.test(text), `unqualified «زائد» claim: ${text}`).toBe(true)
    }
  })

  it('keeps the questions 41–45 as manual expressive answers, never auto-graded', () => {
    for (let n = 31; n <= 35; n++) {
      const q = testQuestions.find((item) => item.number === n)
      expect(q?.fields.every((f) => f.kind === 'essay')).toBe(true)
    }
    for (let n = 41; n <= 45; n++) {
      const q = testQuestions.find((item) => item.number === n)
      expect(q?.fields.every((f) => f.kind === 'essay')).toBe(true)
    }
  })
})
