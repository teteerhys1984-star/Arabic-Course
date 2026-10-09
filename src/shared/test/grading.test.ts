import { describe, expect, it } from 'vitest'
import {
  answerKey,
  answeredCount,
  autoFields,
  combinePageResults,
  gradePage,
  gradeQuestions,
  hasManualPart,
  isFieldCorrect,
  looseKey,
  normalizeAnswer,
  questionStatus,
  questionSolution,
  readableAnswer,
  sameSet,
} from './grading'
import type { AnswerMap, TestDefinition, TestQuestion } from './types'

const choiceQ: TestQuestion = {
  id: 'q1',
  number: 1,
  prompt: 'اختر الإجابة الصحيحة',
  fields: [{ kind: 'choice', options: ['أ', 'ب', 'ج'], answer: 'ب' }],
}

const selectQ: TestQuestion = {
  id: 'q2',
  number: 2,
  prompt: 'اختر الكلمة',
  fields: [{ kind: 'select', label: 'الكلمة', options: ['الجوَّ', 'الجو'], answer: 'الجوَّ' }],
}

const multiQ: TestQuestion = {
  id: 'q3',
  number: 3,
  prompt: 'اختر كل ما ينطبق',
  fields: [{ kind: 'multi', label: 'الخيارات', options: ['أ', 'ب', 'ج'], answers: ['أ', 'ج'] }],
}

const textQ: TestQuestion = {
  id: 'q4',
  number: 4,
  prompt: 'اكتب الجذر',
  fields: [{ kind: 'text', accept: ['ك ت ب', 'كتب'] }],
}

const essayQ: TestQuestion = {
  id: 'q5',
  number: 5,
  prompt: 'علّل إجابتك',
  fields: [{ kind: 'essay', label: 'التعليل', placeholder: 'اكتب...' }],
}

const mixedQ: TestQuestion = {
  id: 'q6',
  number: 6,
  prompt: 'استخرج الجذر وعلّل',
  fields: [
    { kind: 'text', label: 'الجذر', accept: ['ف ت ح'] },
    { kind: 'essay', label: 'التعليل' },
  ],
}

const pageOne = { id: 'p1', title: 'الصفحة الأولى', questions: [choiceQ, selectQ] }
const pageTwo = { id: 'p2', title: 'الصفحة الثانية', questions: [multiQ, textQ, essayQ, mixedQ] }
const test: TestDefinition = { id: 't', title: 'اختبار', pages: [pageOne, pageTwo] }

describe('normalizeAnswer / looseKey', () => {
  it('strips invisible marks and collapses whitespace but keeps harakat', () => {
    expect(normalizeAnswer('  الدرس   الأول  ')).toBe('الدرس الأول')
    expect(normalizeAnswer('الجوَّ')).toBe('الجوَّ')
  })

  it('looseKey removes harakat, tatweel, punctuation and unifies alef', () => {
    expect(looseKey('كتبَ')).toBe(looseKey('كتب'))
    expect(looseKey('أكتب')).toBe(looseKey('اكتب'))
    expect(looseKey('ك ت ب')).toBe(looseKey('كتب'))
  })
})

describe('field grading', () => {
  it('grades choice/select fields strictly by default (harakat significant)', () => {
    expect(isFieldCorrect(selectQ.fields[0], ['الجوَّ'])).toBe(true)
    expect(isFieldCorrect(selectQ.fields[0], ['الجو'])).toBe(false)
    expect(isFieldCorrect(selectQ.fields[0], ['الجوَّ'], 'loose')).toBe(true)
    expect(isFieldCorrect(selectQ.fields[0], ['الجو'], 'loose')).toBe(true)
  })

  it('grades multi fields as sets, order-insensitive', () => {
    expect(isFieldCorrect(multiQ.fields[0], ['ج', 'أ'])).toBe(true)
    expect(isFieldCorrect(multiQ.fields[0], ['أ'])).toBe(false)
    expect(isFieldCorrect(multiQ.fields[0], ['أ', 'ب', 'ج'])).toBe(false)
  })

  it('grades text fields with the flexible key (harakat and spacing ignored)', () => {
    expect(isFieldCorrect(textQ.fields[0], ['كتب'])).toBe(true)
    expect(isFieldCorrect(textQ.fields[0], ['ك ت ب'])).toBe(true)
    expect(isFieldCorrect(textQ.fields[0], ['ف ت ح'])).toBe(false)
  })

  it('never auto-grades essay fields', () => {
    expect(isFieldCorrect(essayQ.fields[0], ['أي نص'])).toBe(false)
    expect(autoFields(essayQ)).toHaveLength(0)
    expect(hasManualPart(essayQ)).toBe(true)
    expect(hasManualPart(mixedQ)).toBe(true)
    expect(hasManualPart(choiceQ)).toBe(false)
  })

  it('sameSet respects the matching mode', () => {
    expect(sameSet(['الجوَّ'], ['الجو'], 'strict')).toBe(false)
    expect(sameSet(['الجوَّ'], ['الجو'], 'loose')).toBe(true)
  })
})

describe('questionStatus — the four statuses', () => {
  const answers: AnswerMap = {
    [answerKey('q1', 0)]: ['ب'],
    [answerKey('q2', 0)]: ['الجو'],
    [answerKey('q3', 0)]: ['أ', 'ج'],
    [answerKey('q5', 0)]: ['نص تعليل'],
  }

  it('distinguishes correct, wrong, unanswered and manual', () => {
    expect(questionStatus(choiceQ, answers)).toBe('correct')
    expect(questionStatus(selectQ, answers)).toBe('wrong') // «الجو» ≠ «الجوَّ» in strict mode
    expect(questionStatus(textQ, answers)).toBe('unanswered')
    expect(questionStatus(essayQ, answers)).toBe('manual') // answered essay → manual review
  })

  it('reports an unanswered essay-only question as unanswered', () => {
    expect(questionStatus(essayQ, {})).toBe('unanswered')
  })

  it('grades mixed questions on their auto fields and flags them manual', () => {
    expect(questionStatus(mixedQ, { [answerKey('q6', 0)]: ['ف ت ح'], [answerKey('q6', 1)]: ['نص'] })).toBe('correct')
    expect(hasManualPart(mixedQ)).toBe(true)
    expect(questionStatus(mixedQ, { [answerKey('q6', 0)]: ['ف ت ح'] })).toBe('correct') // essay not required for auto status
    expect(questionStatus(mixedQ, {})).toBe('unanswered')
  })
})

describe('page-level grading', () => {
  it('grades exactly one page', () => {
    const result = gradePage(pageOne, { [answerKey('q1', 0)]: ['ب'], [answerKey('q2', 0)]: ['الجوَّ'] })
    expect(result.pageId).toBe('p1')
    expect(result.total).toBe(2)
    expect(result.correct).toBe(2)
    expect(result.statuses).toEqual({ q1: 'correct', q2: 'correct' })
  })

  it('counts unanswered and manual separately', () => {
    const result = gradePage(pageTwo, { [answerKey('q5', 0)]: ['نص'] })
    expect(result.total).toBe(4)
    expect(result.unanswered).toBe(3) // multi + text + mixed (auto part unanswered)
    expect(result.manual).toBe(1) // the answered essay awaits manual review
    expect(result.statuses.q5).toBe('manual')
    // manualIds still lists every question that carries a manual part.
    expect(result.manualIds.sort()).toEqual(['q5', 'q6'])
  })

  it('answeredCount requires every field (auto and manual) to be answered', () => {
    expect(answeredCount(pageTwo.questions, { [answerKey('q5', 0)]: ['نص'] })).toBe(1)
    expect(
      answeredCount(pageTwo.questions, {
        [answerKey('q3', 0)]: ['أ', 'ج'],
        [answerKey('q4', 0)]: ['كتب'],
        [answerKey('q5', 0)]: ['نص'],
        [answerKey('q6', 0)]: ['ف ت ح'],
        [answerKey('q6', 1)]: ['نص'],
      }),
    ).toBe(4)
  })
})

describe('combinePageResults — latest valid results, never double-counted', () => {
  it('combines the latest result of every page', () => {
    const p1 = gradePage(pageOne, { [answerKey('q1', 0)]: ['ب'], [answerKey('q2', 0)]: ['الجوَّ'] })
    const p2 = gradePage(pageTwo, { [answerKey('q3', 0)]: ['أ', 'ج'] })
    const result = combinePageResults(test, { p1, p2 })
    expect(result.complete).toBe(true)
    expect(result.pagesChecked).toBe(2)
    expect(result.total).toBe(6)
    expect(result.correct).toBe(3) // q1, q2, q3
    expect(result.unanswered).toBe(3) // q4, q5 (essay, unanswered), q6
    expect(result.manual).toBe(0) // no manual part is answered in this scenario
  })

  it('replacing a page result (recheck after edit) does not double-count', () => {
    const stale = gradePage(pageOne, { [answerKey('q1', 0)]: ['أ'] }) // q1 wrong, q2 unanswered
    const latest = gradePage(pageOne, { [answerKey('q1', 0)]: ['ب'] }) // q1 corrected, q2 unanswered
    // Only `latest` is stored under the page id — `stale` is gone.
    const result = combinePageResults(test, { p1: latest, p2: gradePage(pageTwo, {}) })
    expect(result.total).toBe(6) // 2 + 4 questions, counted once each
    expect(result.correct).toBe(1) // q1 in its LATEST state
    expect(result.wrong).toBe(0)
    expect(result.unanswered).toBe(5) // q2 + q3 + q4 + q5 + q6
    expect(stale.correct).toBe(0) // the stale result exists only if explicitly kept
  })

  it('is incomplete while any page lacks a valid check', () => {
    const result = combinePageResults(test, { p1: gradePage(pageOne, {}) })
    expect(result.complete).toBe(false)
    expect(result.pagesChecked).toBe(1)
    expect(result.pagesTotal).toBe(2)
  })

  it('aggregates the per-group breakdown across pages', () => {
    const grouped: TestQuestion = { ...choiceQ, id: 'qg', level: 'أساسي' }
    const t: TestDefinition = {
      id: 'tg',
      title: 't',
      pages: [
        { id: 'a', title: 'a', questions: [grouped] },
        { id: 'b', title: 'b', questions: [{ ...choiceQ, id: 'qh', level: 'متقدم' }] },
      ],
    }
    const result = combinePageResults(t, {
      a: gradePage(t.pages[0], { [answerKey('qg', 0)]: ['ب'] }),
      b: gradePage(t.pages[1], { [answerKey('qh', 0)]: ['أ'] }),
    })
    expect(result.byGroup['أساسي']).toEqual({ total: 1, correct: 1 })
    expect(result.byGroup['متقدم']).toEqual({ total: 1, correct: 0 })
  })
})

describe('display helpers', () => {
  it('readableAnswer renders the student answer or null', () => {
    expect(readableAnswer(multiQ.fields[0], ['أ', 'ج'])).toBe('أ ، ج')
    expect(readableAnswer(multiQ.fields[0], [])).toBeNull()
    expect(readableAnswer(textQ.fields[0], ['كتب'])).toBe('كتب')
  })

  it('questionSolution prefers the explicit solution, else joins field answers', () => {
    expect(questionSolution({ ...choiceQ, solution: 'ب — لأن...' })).toBe('ب — لأن...')
    expect(questionSolution(mixedQ)).toBe('ف ت ح')
  })

  it('gradeQuestions exposes statuses for every question', () => {
    const result = gradeQuestions(pageTwo.questions, { [answerKey('q3', 0)]: ['أ', 'ج'] })
    expect(Object.keys(result.statuses).sort()).toEqual(['q3', 'q4', 'q5', 'q6'])
    expect(result.manualIds.sort()).toEqual(['q5', 'q6'])
  })
})
