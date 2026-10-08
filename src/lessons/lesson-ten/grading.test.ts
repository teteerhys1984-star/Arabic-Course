import { describe, expect, it } from 'vitest'
import {
  activityOneRows,
  activityTwoRows,
  challengeRows,
  activityOneSolutions,
  errorCorrectionRows,
  discoveryRow,
  easyExamples,
  letterData,
  particles,
  ruleChoiceRows,
  sourceQuestions,
  subSignData,
  testBlueprint,
  testQuestions,
  workedExamples,
  type ActivityRow,
  type QuizField,
  type TestQuestion,
} from './content'
import {
  answerKey,
  answeredCount,
  gradeTest,
  isFieldCorrect,
  looseKey,
  normalizeAnswer,
  questionStatus,
  readableAnswer,
  sameSet,
  type AnswerMap,
} from './grading'

/** الإجابة الصحيحة لكل حقل كما يراها المصحح، لاستخدامها في اختبار المسار الكامل. */
function correctValue(field: QuizField): string[] {
  if (field.kind === 'select') return [field.answer]
  if (field.kind === 'multi') return field.answers
  return [field.accept[0]]
}

function fillAnswers(questions: TestQuestion[], pick: (field: QuizField) => string[]): AnswerMap {
  const answers: AnswerMap = {}
  for (const question of questions) {
    question.fields.forEach((field, index) => {
      answers[answerKey(question.id, index)] = pick(field)
    })
  }
  return answers
}

function allActivityFields(rows: ActivityRow[]) {
  return rows.flatMap((row) => row.fields)
}

describe('harakat-sensitive comparison', () => {
  it('keeps case endings as part of a choice answer', () => {
    const field: QuizField = { kind: 'select', label: 'الاسم', options: ['الجوَّ', 'الجوُّ', 'الجوِّ'], answer: 'الجوَّ' }
    expect(isFieldCorrect(field, ['الجوَّ'])).toBe(true)
    expect(isFieldCorrect(field, ['الجوُّ'])).toBe(false)
    expect(isFieldCorrect(field, ['الجوِّ'])).toBe(false)
    expect(isFieldCorrect(field, ['الجو'])).toBe(false)
  })

  it('accepts a multi answer in any order but not extra or missing choices', () => {
    const field: QuizField = {
      kind: 'multi',
      label: 'العبارات',
      options: ['أ', 'ب', 'ج'],
      answers: ['أ', 'ب'],
    }
    expect(isFieldCorrect(field, ['ب', 'أ'])).toBe(true)
    expect(isFieldCorrect(field, ['أ'])).toBe(false)
    expect(isFieldCorrect(field, ['أ', 'ب', 'ج'])).toBe(false)
    expect(sameSet(['أ', 'أ', 'ب'], ['ب', 'أ'])).toBe(true)
  })

  it('accepts a typed particle loosely but rejects another particle', () => {
    const field: QuizField = { kind: 'text', label: 'الحرف', placeholder: '', accept: ['لعلَّ'] }
    expect(isFieldCorrect(field, ['لعلَّ'])).toBe(true)
    expect(isFieldCorrect(field, ['لعل'])).toBe(true)
    expect(isFieldCorrect(field, ['إنّ'])).toBe(false)
    expect(looseKey('لَعَلَّ')).toBe(looseKey('لعل'))
  })

  it('normalizes only invisible marks and spacing, never harakat', () => {
    expect(normalizeAnswer('  الجوَّ\u200f ')).toBe('الجوَّ')
    expect(normalizeAnswer('الجوَّ')).not.toBe(normalizeAnswer('الجوُّ'))
  })
})

describe('question status and test totals', () => {
  const sample = testQuestions.find((question) => question.id === 'q14')
  if (!sample) throw new Error('q14 must exist')

  it('marks a question unanswered until every field has an answer', () => {
    const answers: AnswerMap = {
      [answerKey(sample.id, 0)]: ['أدخل «إنَّ» في أول الجملة'],
      [answerKey(sample.id, 1)]: ['اجعل «الجوَّ» اسمًا لإنَّ منصوبًا'],
    }
    expect(questionStatus(sample, answers)).toBe('unanswered')
    expect(answeredCount([sample], answers)).toBe(0)
  })

  it('marks a partly wrong complete answer as wrong', () => {
    const answers: AnswerMap = {
      [answerKey(sample.id, 0)]: ['أدخل «إنَّ» في أول الجملة'],
      [answerKey(sample.id, 1)]: ['أبقِ «معتدلٌ» خبرًا لإنَّ مرفوعًا'],
      [answerKey(sample.id, 2)]: ['أبقِ «معتدلٌ» خبرًا لإنَّ مرفوعًا'],
    }
    expect(questionStatus(sample, answers)).toBe('wrong')
  })

  it('grades a fully correct attempt as 20 of 20 with the blueprint per level', () => {
    const answers = fillAnswers(testQuestions, correctValue)
    const result = gradeTest(testQuestions, answers)
    expect(result.total).toBe(20)
    expect(result.correct).toBe(20)
    expect(result.wrong).toBe(0)
    expect(result.unanswered).toBe(0)
    expect(result.byLevel['أساسي']).toEqual({ total: 6, correct: 6 })
    expect(result.byLevel['متوسط']).toEqual({ total: 7, correct: 7 })
    expect(result.byLevel['متقدم']).toEqual({ total: 4, correct: 4 })
    expect(result.byLevel['تفكير']).toEqual({ total: 3, correct: 3 })
  })

  it('counts wrong answers and blanks separately', () => {
    const first = testQuestions[0]
    const answers: AnswerMap = { [answerKey(first.id, 0)]: ['لكنَّ'] }
    const result = gradeTest(testQuestions, answers)
    expect(result.statuses[first.id]).toBe('wrong')
    expect(result.wrong).toBe(1)
    expect(result.unanswered).toBe(19)
    expect(result.correct).toBe(0)
  })

  it('shows the student answer in readable form', () => {
    const field: QuizField = { kind: 'multi', label: 'x', options: ['أ', 'ب'], answers: ['أ'] }
    expect(readableAnswer(field, undefined)).toBeNull()
    expect(readableAnswer(field, ['ب', 'أ'])).toBe('ب ، أ')
  })
})

describe('platform test content', () => {
  it('has exactly 20 questions with the 6 / 7 / 4 / 3 blueprint', () => {
    expect(testQuestions).toHaveLength(20)
    expect(testBlueprint).toEqual({ basic: 6, medium: 7, advanced: 4, thinking: 3 })
    const count = (level: string) => testQuestions.filter((question) => question.level === level).length
    expect(count('أساسي')).toBe(6)
    expect(count('متوسط')).toBe(7)
    expect(count('متقدم')).toBe(4)
    expect(count('تفكير')).toBe(3)
  })

  it('uses varied question types and is not all multiple choice', () => {
    const types = new Set(testQuestions.map((question) => question.type))
    expect(types.size).toBeGreaterThanOrEqual(10)
    const selectOnly = testQuestions.every((question) => question.fields.every((field) => field.kind === 'select'))
    expect(selectOnly).toBe(false)
  })

  it('keeps every select or multi answer among its own options', () => {
    for (const question of testQuestions) {
      for (const field of question.fields) {
        if (field.kind === 'select') {
          expect(field.options, question.id).toContain(field.answer)
          expect(new Set(field.options).size, `${question.id} duplicate options`).toBe(field.options.length)
        }
        if (field.kind === 'multi') {
          for (const answer of field.answers) expect(field.options, question.id).toContain(answer)
          expect(new Set(field.options).size, `${question.id} duplicate options`).toBe(field.options.length)
        }
      }
    }
  })

  it('does not copy the 27 source questions or the lesson examples', () => {
    const lessonSentences = new Set<string>([
      ...particles.map((item) => item.example),
      ...easyExamples.map((item) => item.sentence),
      ...workedExamples.map((item) => item.sentence),
      ...letterData.flatMap((item) => item.examples.map((example) => example.sentence)),
      ...subSignData.flatMap((item) => item.examples.flatMap((example) => [example.before, example.after])),
      ...sourceQuestions.map((item) => item.prompt),
    ])
    for (const question of testQuestions) {
      if (question.sentence) expect(lessonSentences.has(question.sentence), question.id).toBe(false)
      expect(lessonSentences.has(question.prompt), question.id).toBe(false)
    }
  })

  it('has a solution, rule and explanation for every question', () => {
    for (const question of testQuestions) {
      expect(question.solution.trim(), question.id).not.toBe('')
      expect(question.rule.trim(), question.id).not.toBe('')
      expect(question.explanation.trim(), question.id).not.toBe('')
    }
  })
})

describe('activity and source content', () => {
  it('keeps every activity answer among its options', () => {
    const rows = [...ruleChoiceRows, discoveryRow, ...activityOneRows, ...activityTwoRows, ...challengeRows]
    for (const row of rows) {
      for (const field of row.fields) {
        expect(field.options, row.prompt).toContain(field.answer)
        expect(new Set(field.options).size, `${row.prompt} duplicate options`).toBe(field.options.length)
      }
    }
    expect(allActivityFields(activityOneRows)).toHaveLength(14)
    expect(activityOneRows).toHaveLength(7)
    expect(activityTwoRows).toHaveLength(5)
    expect(challengeRows).toHaveLength(5)
    expect(challengeRows.every((row) => row.fields.length === 6)).toBe(true)
  })

  it('keeps all 27 source questions numbered in order', () => {
    expect(sourceQuestions.map((question) => question.number)).toEqual(Array.from({ length: 27 }, (_, index) => index + 1))
  })

  it('corrects every common error into a different sentence with a real reason', () => {
    for (const row of errorCorrectionRows) {
      const [sentenceField, reasonField] = row.fields
      expect(sentenceField.answer).not.toBe(row.prompt)
      expect(sentenceField.options).toContain(sentenceField.answer)
      expect(reasonField.options).toContain(reasonField.answer)
    }
  })

  it('writes the activity-one model solutions from the rows', () => {
    const rows = activityOneRows
    expect(activityOneSolutions).toHaveLength(rows.length)
    rows.forEach((row, index) => {
      const [nameField, khabarField] = row.fields
      expect(activityOneSolutions[index]).toBe(`إنَّ ${nameField.answer} ${khabarField.answer}.`)
    })
  })

  it('uses four groups of five for the solutions', () => {
    const groups = [
      [1, 5],
      [6, 10],
      [11, 15],
      [16, 20],
    ]
    for (const [from, to] of groups) expect(to - from + 1).toBe(5)
  })
})
