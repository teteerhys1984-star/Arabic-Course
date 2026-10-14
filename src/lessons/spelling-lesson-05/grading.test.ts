import { describe, expect, it } from 'vitest'
import { gradePage, looseKey } from '../../shared/test'
import type { AnswerMap } from '../../shared/test'
import * as C from './content'
import { TEST_TOTALS, choiceStatus, gradeOriginalFinal, gradeSpelling5, originalFinalScore } from './grading'
import { EXAM_ANSWERS, EXPECTED_LEVELS, ORIGINAL_ANSWERS, PRACTICE_KEYS } from './test-fixtures'

const questions = C.testDefinition.pages.flatMap((page) => page.questions)

describe('spelling 5 — تصحيح الاختبار المستقل بالمحرك المشترك', () => {
  it('يتكون من ٢٠ سؤالًا جديدًا في ٤ صفحات، متوازنة على خمس مهارات', () => {
    expect(questions).toHaveLength(TEST_TOTALS.questions)
    expect(C.testDefinition.pages).toHaveLength(TEST_TOTALS.pages)
    expect(C.testDefinition.pages.map((page) => page.questions.length)).toEqual([5, 5, 5, 5])
    expect(questions.map((q) => q.number)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
    const levels: Record<string, number> = {}
    for (const q of questions) levels[q.level!] = (levels[q.level!] ?? 0) + 1
    expect(levels).toEqual(EXPECTED_LEVELS)
    expect(C.testDefinition.matching).toBe('strict')
  })

  it('يعطي ٢٠/٢٠ للمفتاح المستقل، وصفرًا لإجابات خاطئة، ولا يحتسب غير المجاب', () => {
    expect(gradeSpelling5(EXAM_ANSWERS).correct).toBe(20)
    const wrong: AnswerMap = {}
    for (const q of questions) {
      const field = q.fields[0]
      if (field.kind === 'choice') wrong[`${q.id}:0`] = [field.options.find((o) => o !== field.answer)!]
      if (field.kind === 'multi') wrong[`${q.id}:0`] = [field.options.find((o) => !field.answers.includes(o))!]
    }
    const result = gradeSpelling5(wrong)
    expect(result.correct).toBe(0)
    expect(result.wrong).toBe(20)
    expect(gradeSpelling5({}).unanswered).toBe(20)
  })

  it('يرفض الاختيار المتعدد الناقص أو الزائد', () => {
    const page = C.testDefinition.pages[0]
    const partial = gradePage(page, { ...EXAM_ANSWERS, 'spell5-q05:0': ['حتى', 'مستوى'] }, 'strict')
    expect(partial.statuses['spell5-q05']).toBe('wrong')
    const extra = gradePage(page, { ...EXAM_ANSWERS, 'spell5-q05:0': ['حتى', 'مستوى', 'صُغرى', 'غزا'] }, 'strict')
    expect(extra.statuses['spell5-q05']).toBe('wrong')
  })

  it('كل مفتاح ضمن خياراته، والخيارات غير مكررة، ولكل سؤال تفسير وقاعدة وحل للمعلم', () => {
    for (const q of questions) {
      expect(q.explanation && q.explanation.length).toBeGreaterThan(60)
      expect(q.rule).toBeTruthy()
      expect(q.teacherAnswer).toContain(q.explanation!)
      expect(q.answerSource).toBe('platform')
      for (const field of q.fields) {
        if (field.kind === 'choice') {
          expect(field.options).toContain(field.answer)
          expect(new Set(field.options).size).toBe(field.options.length)
        }
      }
    }
    const ruleTexts = questions.map((q) => q.rule)
    expect(new Set(ruleTexts).size).toBeGreaterThanOrEqual(18)
  })

  it('لا يعيد استعمال نصوص أسئلة الاختبار في الأنشطة أو التدريب', () => {
    const activityText = JSON.stringify([
      C.glyphLab, C.nounOriginLab, C.nounSortLab, C.verbPresentLab, C.particleLab, C.treeWords,
      C.errorLab, C.explainLab, C.cumulativeLab, C.practiceQuestions, C.originalFinalTest,
    ])
    for (const q of questions) expect(activityText).not.toContain(q.prompt)
    const labText = JSON.stringify([C.glyphLab, C.nounOriginLab, C.nounSortLab, C.verbPresentLab, C.errorLab, C.explainLab, C.cumulativeLab, C.practiceQuestions])
    for (const word of ['مَدَيان', 'هَوَيان', 'منتدى', 'زوايا', 'نَهَيْتُ', 'اشترى', 'حلوى', 'يعفو', 'صُغرى', 'مستوى']) {
      expect(labText.includes(word), `test word reused in activities: ${word}`).toBe(false)
    }
  })
})

describe('spelling 5 — الاختبار الختامي الأصلي', () => {
  it('يحفظ أسئلة المادة الثمانية حرفيًا بترتيبها', () => {
    const items = C.originalFinalTest.pages[0].questions
    expect(items.map((q) => q.prompt)).toEqual([...C.sourceContent.finalExam.prompts])
  })

  it('يصحّح المفتاح المستقل كاملًا، ويقبل الكتابة بلا حركات ويرفض ى/ي الخاطئة', () => {
    const result = gradeOriginalFinal(ORIGINAL_ANSWERS)
    expect(originalFinalScore(result)).toEqual({ correct: 8, auto: 8 })
    expect(result.manual).toBe(1)
    expect(gradeOriginalFinal({ ...ORIGINAL_ANSWERS, 'spell5-of3:0': ['سَعَى'] }).correct).toBe(8)
    expect(gradeOriginalFinal({ ...ORIGINAL_ANSWERS, 'spell5-of3:0': ['سعي'] }).correct).toBe(7)
    expect(gradeOriginalFinal({ ...ORIGINAL_ANSWERS, 'spell5-of3:0': ['سعا'] }).correct).toBe(7)
    expect(gradeOriginalFinal({ ...ORIGINAL_ANSWERS, 'spell5-of4:0': ['مستشفي'] }).correct).toBe(7)
    expect(gradeOriginalFinal({ ...ORIGINAL_ANSWERS, 'spell5-of5:0': ['أحيا الناسُ الأرضَ.'] }).correct).toBe(8)
    expect(gradeOriginalFinal({ ...ORIGINAL_ANSWERS, 'spell5-of5:0': ['أحيى'] }).correct).toBe(7)
    expect(gradeOriginalFinal({ ...ORIGINAL_ANSWERS, 'spell5-of7:1': ['ياء'] }).correct).toBe(7)
    expect(looseKey('سعى')).not.toBe(looseKey('سعي'))
  })
})

describe('spelling 5 — التدريب السباعي', () => {
  it('مفاتيحه مطابقة للمفتاح المستقل، ولكل خيار تعليل', () => {
    expect(C.practiceQuestions).toHaveLength(7)
    for (const item of C.practiceQuestions) {
      expect(item.answer).toBe(PRACTICE_KEYS[item.id])
      expect(choiceStatus(item, PRACTICE_KEYS[item.id])).toBe('correct')
      expect(choiceStatus(item, undefined)).toBe('unanswered')
      expect(item.options).toHaveLength(3)
      for (const option of item.options) expect(option.explanation.length).toBeGreaterThan(20)
    }
  })
})
