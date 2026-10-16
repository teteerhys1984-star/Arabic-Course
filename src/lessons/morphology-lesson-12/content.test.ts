/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { lessonRegistry } from '../registry'
import * as C from './content'

const challengeQuestions = C.challengeTest.pages.flatMap((page) => page.questions)
const finalPages = C.testDefinition.pages
const finalQuestions = finalPages.flatMap((page) => page.questions)
const styles = readFileSync('src/styles/morphology-lesson-12.css', 'utf8')
const lessonSource = readFileSync('src/lessons/LessonMorphologyTwelve.tsx', 'utf8')
const bidiControls = /[\u202A-\u202E\u2066-\u2069]/

function marksBeforeLast(word: string) {
  const clusters: Array<{ letter: string; marks: string }> = []
  for (const char of word) {
    if (/[\u064B-\u0652\u0670]/.test(char)) {
      if (clusters.length) clusters[clusters.length - 1].marks += char
    } else clusters.push({ letter: char, marks: '' })
  }
  return clusters.at(-2)?.marks ?? ''
}

describe('morphology lesson 12 — content and tashkeel audit', () => {
  it('declares the complete lesson title and learning scope', () => {
    expect(C.lessonTitle).toBe('اسم المفعول: كيف نعرف مَن وقع عليه الفعل؟')
    expect(C.objectives).toHaveLength(6)
    expect(C.objectives.join(' ')).toContain('اسم الفاعل والمصدر')
    expect(C.nextLessonNote).toContain('لا تُنشأ هنا صفحة أو أسئلة للدرس الثالث عشر')
  })

  it('preserves all ten supplied triliteral examples with a stable root and correctly formed participles', () => {
    expect(C.triliteralExamples.map(({ verb, passive }) => [verb, passive])).toEqual([
      ['كَتَبَ', 'مَكْتُوب'],
      ['فَتَحَ', 'مَفْتُوح'],
      ['حَفِظَ', 'مَحْفُوظ'],
      ['رَسَمَ', 'مَرْسُوم'],
      ['سَمِعَ', 'مَسْمُوع'],
      ['حَمَلَ', 'مَحْمُول'],
      ['صَنَعَ', 'مَصْنُوع'],
      ['نَصَرَ', 'مَنْصُور'],
      ['شَرَحَ', 'مَشْرُوح'],
      ['غَسَلَ', 'مَغْسُول'],
    ])
    expect(C.triliteralExamples).toHaveLength(10)
    expect(C.triliteralExamples.every((item) => item.root.split(' ـ ').length === 3)).toBe(true)
    expect(C.triliteralExamples.every((item) => item.active.length > 2)).toBe(true)
  })

  it('uses the correct five non-triliteral chains and distinguishes the vowel before the last radical', () => {
    expect(C.nonTriliteralExamples.map(({ verb, present, active, passive }) => [verb, present, active, passive])).toEqual([
      ['أَكْرَمَ', 'يُكْرِمُ', 'مُكْرِم', 'مُكْرَم'],
      ['عَلَّمَ', 'يُعَلِّمُ', 'مُعَلِّم', 'مُعَلَّم'],
      ['أَحْسَنَ', 'يُحْسِنُ', 'مُحْسِن', 'مُحْسَن'],
      ['أَنْجَزَ', 'يُنْجِزُ', 'مُنْجِز', 'مُنْجَز'],
      ['اِسْتَخْرَجَ', 'يَسْتَخْرِجُ', 'مُسْتَخْرِج', 'مُسْتَخْرَج'],
    ])
    for (const item of C.nonTriliteralExamples) {
      expect(marksBeforeLast(item.active), item.active).toContain('ِ')
      expect(marksBeforeLast(item.passive), item.passive).toContain('َ')
    }
    expect(C.nonTriliteralExamples.find((item) => item.id === 'ahsana')?.note).toContain('المُحْسَنُ إليه')
    expect(C.nonTriliteralExamples.find((item) => item.id === 'ahsana')?.sentence).toContain('المحتاجُ مُحْسَنٌ إليه')
    expect(C.nonTriliteralExamples.find((item) => item.id === 'allama')?.note).toContain('بحسب السياق')
  })

  it('keeps the four weak-verb forms distinct and avoids a single automatic rule', () => {
    expect(C.weakExamples.map(({ verb, passive }) => [verb, passive])).toEqual([
      ['قالَ', 'مَقُول'],
      ['باعَ', 'مَبِيع'],
      ['دَعا', 'مَدْعُوّ'],
      ['رَمى', 'مَرْمِيّ'],
    ])
    expect(C.weakExamples).toHaveLength(4)
    expect(C.weakExamples.every((item) => item.note.length > 35 && item.sentence.length > 10)).toBe(true)
    expect(C.weakExamples[2].sentence).toContain('مَدْعُوٌّ إلى الحفل')
    expect(C.weakExamples[3].sentence).toContain('مَرْمِيٌّ على جانب الطريق')
    expect(JSON.stringify(C.weakExamples)).not.toContain('مَرْمِيٌّ إليه')
  })

  it('covers the supplied sentences with semantically appropriate analyses', () => {
    const sentences = C.sentenceAnalyses.map((item) => item.sentence)
    expect(sentences).toContain('كَسَرَ الولدُ الزجاجَ.')
    expect(sentences).toContain('الولدُ كاسِرٌ الزجاجَ الآن.')
    expect(sentences).toContain('الزجاجُ مَكْسُورٌ.')
    expect(sentences).toContain('البابُ مَفْتُوحٌ.')
    expect(sentences).toContain('هذا مشروعٌ مُنْجَزٌ.')
    expect(sentences).toContain('قرأتُ كتابًا مَكْتُوبًا بخطٍّ جميلٍ.')
    expect(C.sentenceAnalyses.find((item) => item.id === 'active')?.focus).toContain('مفعولٌ به')
    expect(C.sentenceAnalyses.find((item) => item.id === 'book')?.focus).toContain('نعتٌ منصوبٌ')
  })
})

describe('morphology lesson 12 — challenge definition and keys', () => {
  it('contains exactly eight interactive questions, each with one correct choice and a distractor explanation', () => {
    expect(C.challengeTest.pages).toHaveLength(1)
    expect(challengeQuestions).toHaveLength(8)
    expect(challengeQuestions.map((question) => question.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    for (const question of challengeQuestions) {
      expect(question.fields).toHaveLength(1)
      const field = question.fields[0]
      expect(field.kind).toBe('choice')
      if (field.kind !== 'choice') throw new Error('Challenge fields must be choices')
      expect(new Set(field.options).size).toBe(field.options.length)
      expect(field.options).toHaveLength(3)
      expect(field.options.filter((option) => option === field.answer)).toHaveLength(1)
      expect(question.solution).toBe(field.answer)
      expect(question.explanation!.length).toBeGreaterThan(80)
      for (const distractor of field.options.filter((option) => option !== field.answer)) {
        expect(question.explanation, `${question.id}: missing distractor explanation for ${distractor}`).toContain(distractor)
      }
    }
    expect(challengeQuestions.map((question) => question.id)).toEqual([
      'sarf12-c01', 'sarf12-c02', 'sarf12-c03', 'sarf12-c04', 'sarf12-c05', 'sarf12-c06', 'sarf12-c07', 'sarf12-c08',
    ])
    expect(challengeQuestions.map((question) => question.solution)).toEqual([
      'مَكْتُوب', 'مَفْتُوح', 'كاسِر', 'مُكْرَم', 'مُسْتَخْرَج', 'سَماع', 'اسم مفعول', 'مَفْعُول',
    ])
  })
})

describe('morphology lesson 12 — final independent test and answer model', () => {
  it('contains exactly fifteen questions distributed 5 + 4 + 3 + 3 across four named sections', () => {
    expect(finalPages.map((page) => page.questions.length)).toEqual([5, 4, 3, 3])
    expect(finalPages.map((page) => page.title)).toEqual([
      'القسم الأول: صياغة اسم المفعول',
      'القسم الثاني: تحديد نوع الكلمة',
      'القسم الثالث: استخراج اسم المفعول من الجملة',
      'القسم الرابع: تصحيح الخطأ',
    ])
    expect(finalQuestions).toHaveLength(15)
    expect(finalQuestions.map((question) => question.number)).toEqual(Array.from({ length: 15 }, (_, index) => index + 1))
    expect(new Set(finalQuestions.map((question) => question.id)).size).toBe(15)
    expect(finalQuestions.map((question) => question.solution)).toEqual([
      'مَشْرُوح', 'مَغْسُول', 'مَقُول', 'مُحْسَن', 'مُنْجَز',
      'اسم فاعل', 'اسم مفعول', 'مصدر', 'اسم مفعول',
      'مَكْتُوبًا', 'مَفْتُوحٌ', 'مُسْتَخْرَجٌ',
      'الصواب مَفْتُوح؛ وفاتِح اسم فاعل.',
      'الصواب مُكْرَم بفتح الراء؛ أمّا مُكْرِم فاسم فاعل.',
      'كِتابة مصدر، واسم المفعول مَكْتُوب.',
    ])
  })

  it('is fully auto-graded and every answer is a unique option with a worked explanation', () => {
    expect(C.testDefinition.matching).toBe('strict')
    for (const question of finalQuestions) {
      expect(question.fields).toHaveLength(1)
      const field = question.fields[0]
      expect(field.kind).toBe('choice')
      if (field.kind !== 'choice') throw new Error('Final test fields must be choices; no manual items are expected')
      expect(new Set(field.options).size).toBe(field.options.length)
      expect(field.options.filter((option) => option === field.answer)).toHaveLength(1)
      expect(question.solution).toBe(field.answer)
      expect(question.answerSource).toBe('platform')
      expect(question.rule!.length).toBeGreaterThan(25)
      expect(question.explanation!.length).toBeGreaterThan(80)
    }
    expect(C.testDefinition.description).toContain('لا توجد أسئلة إنشائية')
    expect(finalQuestions.some((question) => question.fields.some((field) => field.kind === 'essay'))).toBe(false)
  })
})

describe('morphology lesson 12 — homework, teacher content, RTL and responsive styles', () => {
  it('has the five assigned homework verbs with complete active/passive keys and explanations', () => {
    expect(C.homeworkRows.map((row) => row.verb)).toEqual(['كَسَرَ', 'غَسَلَ', 'صَنَعَ', 'أَكْرَمَ', 'اِسْتَخْرَجَ'])
    for (const row of C.homeworkRows) {
      expect(row.active.length).toBeGreaterThan(2)
      expect(row.passive.length).toBeGreaterThan(2)
      expect(row.explanation.length).toBeGreaterThan(55)
    }
    expect(C.teacherNotes.length).toBeGreaterThanOrEqual(7)
  })

  it('keeps answer keys out of the student component and puts challenge/exam solutions behind TeacherSpace', () => {
    expect(lessonSource).toContain('<TeacherSpace>')
    expect(lessonSource).toContain('<SolutionsArea test={challengeTest} mode="teacher"')
    expect(lessonSource).toContain('<SolutionsArea test={testDefinition} mode="teacher"')
    expect(lessonSource).toContain('revealFeedback={submitted && showSolutions}')
    expect(lessonSource).toContain('disabled={!submitted}')
    expect(lessonSource).not.toContain('COURSE_TEACHER_PASSWORD =')
  })

  it('uses semantic RTL-safe tables, visible focus, non-colour labels, and mobile card layout', () => {
    expect(lessonSource).toContain('dir="rtl"')
    expect(lessonSource).toContain('dir="ltr"')
    expect(lessonSource).toContain('scope="col"')
    expect(lessonSource).toContain('scope="row"')
    expect(lessonSource).toContain('data-label={columns[index]}')
    expect(styles).toContain(':focus-visible')
    expect(styles).toContain('@media (max-width: 560px)')
    expect(styles).toContain('@media (max-width: 380px)')
    expect(styles).toContain('min-block-size: 44px')
    expect(styles).toContain('grid-template-columns: minmax(5.2rem, 33%) minmax(0, 1fr)')
    expect(styles).toContain('white-space: nowrap')
    expect(styles).toContain('line-height: 2.3')
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)')
    expect(styles).not.toMatch(/direction:\s*(ltr|rtl)|text-align:\s*(left|right)/)
  })

  it('has no literal Unicode bidi control characters in authored content, prompts, or choices', () => {
    for (const text of [JSON.stringify(C), lessonSource]) expect(text).not.toMatch(bidiControls)
  })

  it('registers the lesson without colliding with the unrelated basics lesson 12', () => {
    const morphology = lessonRegistry.filter((lesson) => lesson.id === 'morphology-lesson-12')
    const basics = lessonRegistry.filter((lesson) => lesson.id === 'lesson-12')
    expect(morphology).toHaveLength(1)
    expect(basics).toHaveLength(1)
    expect(morphology[0].sectionId).toBe('morphology')
    expect(basics[0].sectionId).toBe('basics-grammar')
    expect(morphology[0].id).not.toBe(basics[0].id)
  })
})
