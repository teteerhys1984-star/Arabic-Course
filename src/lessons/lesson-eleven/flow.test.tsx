import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from '../../app/App'
import { COURSE_TEACHER_PASSWORD } from '../../shared/teacher/teacherPassword'
import { LessonEleven } from '../LessonEleven'
import {
  practiceQuestions, finalQuizQuestions, homeworkMarks, homeworkBlanks, homeworkParsing,
  testDefinition, workedParsing, inflectionExamples, nominalExamples, agentExamples,
  indicativeExamples, objectExamples, subjunctiveExamples, kanaExample,
  prepositionExamples, additionExamples, jussiveExamples, caseComparisons,
  soundEndingPairs, jussiveTransformations,
} from './content'

function jump(title: string) {
  return within(screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' })).getByRole(
    'button', { name: (value) => value.includes(title) },
  )
}

beforeEach(() => { window.location.hash = '#/' })

describe('lesson 11 — RTL sequential flow, complete source, independent test and separate solutions', () => {
  it('opens after lesson 10 in the basics index, renders teaching steps and returns to the section', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/sections/basics-grammar'
    render(<App />)
    const links = within(screen.getByRole('list', { name: 'دروس القسم' })).getAllByRole('link')
    expect(links).toHaveLength(11)
    expect(links.slice(0, 10).map((link) => link.getAttribute('href'))).toEqual(
      Array.from({ length: 10 }, (_, index) => `#/lesson/lesson-${index + 1}`),
    )
    expect(links[10]).toHaveAttribute('href', '#/lesson/lesson-11')
    await user.click(links[10])
    expect(window.location.hash).toBe('#/lesson/lesson-11')
    expect(document.querySelector('.eleven-lesson')).toHaveAttribute('dir', 'rtl')
    expect(screen.getByText('كيف نعرف حركة آخر الكلمة؟')).toBeInTheDocument()
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 1 من 24')
    expect(within(screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' })).getAllByRole('button')).toHaveLength(24)
    expect(document.querySelectorAll('.lesson-step')).toHaveLength(1)

    await user.click(jump('١. ما الإعراب؟'))
    expect(within(screen.getByRole('list', { name: 'حالات الطالب الثلاث' })).getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByText(/لم تتبدل هوية الكلمة/)).toBeInTheDocument()
    await user.click(jump('٢. ما علامات الإعراب الأصلية؟'))
    expect(screen.getByRole('table', { name: /علامات الإعراب الأصلية الأربع/ })).toBeInTheDocument()
    expect(screen.getByText(/ينتهي بفتحة بناء/)).toBeInTheDocument()
    await user.click(jump('٣. الضمة: المبتدأ والخبر'))
    expect(screen.getByRole('table', { name: /الطالبُ مجتهدٌ/ })).toBeInTheDocument()
    await user.click(jump('٤. الفتحة: المضارع المنصوب وخبر كان'))
    expect(screen.getByText(/«أنْ» الساكنة النون حرف مصدري ونصب/)).toBeInTheDocument()
    expect(screen.getByText(/خبر كان منصوب/)).toBeInTheDocument()
    await user.click(jump('٥. الكسرة: المضاف إليه'))
    expect(screen.getByRole('list', { name: 'أمثلة المضاف إليه' })).toBeInTheDocument()
    await user.click(jump('٦. السكون: لم ولا الناهية'))
    expect(screen.getByText(/«لا» هنا تطلب ترك الإهمال/)).toBeInTheDocument()
    await user.click(jump('٨. كيف تعرب الكلمة خطوة بخطوة؟'))
    const parsing = screen.getByRole('table', { name: /قرأَ الطالبُ القصةَ في المكتبةِ/ })
    expect(within(parsing).getAllByRole('row')).toHaveLength(6)
    for (const row of workedParsing) expect(within(parsing).getByRole('rowheader', { name: row.word })).toBeInTheDocument()
    expect(screen.getByText(/قرأَ.*انتهى بفتحة ظاهرة/)).toBeInTheDocument()

    await user.click(jump('خلاصة الدرس'))
    expect(screen.getByText(/في الدرس الثاني عشر من قسم الأساسيات والنحو/)).toBeInTheDocument()
    expect(document.querySelector('.lesson-step a[href*="lesson-12"]')).toBeNull()
    await user.click(jump('منطقة المعلم'))
    await user.click(screen.getByRole('button', { name: 'إتمام الدرس' }))
    expect(window.location.hash).toBe('#/sections/basics-grammar')
    expect(within(screen.getByRole('list', { name: 'دروس القسم' })).getAllByRole('link')).toHaveLength(11)
  })

  it('actually renders every reviewed sentence and both jussive comparisons in the relevant teaching step', async () => {
    const user = userEvent.setup()
    render(<LessonEleven />)
    const groups = [
      ['١. ما الإعراب؟', inflectionExamples],
      ['٣. الضمة: المبتدأ والخبر', nominalExamples],
      ['٣. الضمة: الفاعل والمضارع المرفوع', [...agentExamples, ...indicativeExamples]],
      ['٤. الفتحة: المفعول به', objectExamples],
      ['٤. الفتحة: المضارع المنصوب وخبر كان', [...subjunctiveExamples, kanaExample]],
      ['٥. الكسرة: الاسم بعد حرف الجر', prepositionExamples],
      ['٥. الكسرة: المضاف إليه', additionExamples],
      ['٦. السكون: لم ولا الناهية', jussiveExamples],
      ['٧. لنقارن بين الحالات الأربع', caseComparisons],
    ] as const
    for (const [step, items] of groups) {
      await user.click(jump(step))
      const active = document.querySelector('.lesson-step')!
      for (const item of items) expect(active.textContent).toContain(item.sentence)
    }
    await user.click(jump('٦. السكون: ما صحيح الآخر؟'))
    const soundStep = document.querySelector('.lesson-step')!
    for (const pair of soundEndingPairs) {
      expect(soundStep.textContent).toContain(pair.before)
      expect(soundStep.textContent).toContain(pair.after)
    }
    await user.click(jump('٦. السكون: لم ولا الناهية'))
    const jussiveStep = document.querySelector('.lesson-step')!
    for (const pair of jussiveTransformations) {
      expect(jussiveStep.textContent).toContain(pair.before)
      expect(jussiveStep.textContent).toContain(pair.after)
    }
  })

  it('keeps the eight practice answers and ten final-quiz answers separate, hidden until checking, then explains each', async () => {
    const user = userEvent.setup()
    render(<LessonEleven />)
    await user.click(jump('٩. تدريب تفاعلي'))
    expect(screen.getAllByRole('radiogroup')).toHaveLength(8)
    expect(screen.queryByTestId(`test-feedback-${practiceQuestions[0].id}`)).not.toBeInTheDocument()
    for (const item of practiceQuestions) {
      const question = screen.getByTestId(`eleven-practice-${item.id}`)
      expect(within(question).getAllByRole('radio')).toHaveLength(item.options.length)
      await user.click(within(question).getByRole('radio', { name: item.answer }))
    }
    expect(screen.queryByText(practiceQuestions[0].explanation)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    for (const item of practiceQuestions) {
      expect(screen.getByTestId(`test-feedback-${item.id}`)).toHaveTextContent(item.explanation)
    }
    expect(screen.getByTestId('test-page-summary-lesson-11-practice-page')).toHaveTextContent('8 صحيحة')

    await user.click(jump('١٠. الاختبار الختامي'))
    expect(screen.getAllByRole('radiogroup')).toHaveLength(10)
    expect(screen.queryByText(finalQuizQuestions[0].explanation)).not.toBeInTheDocument()
    for (const item of finalQuizQuestions) {
      const question = screen.getByTestId(`eleven-quiz-${item.id}`)
      expect(within(question).getAllByRole('radio')).toHaveLength(item.options.length)
      await user.click(within(question).getByRole('radio', { name: item.answer }))
    }
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(screen.getByTestId('test-page-summary-lesson-11-quiz-page')).toHaveTextContent('10 صحيحة')
    for (const item of finalQuizQuestions) expect(screen.getByTestId(`test-feedback-${item.id}`)).toHaveTextContent(item.explanation)

    await user.click(jump('٩. تدريب تفاعلي'))
    expect(within(screen.getByTestId(`eleven-practice-${practiceQuestions[0].id}`)).getByRole('radio', { name: practiceQuestions[0].answer })).toBeChecked()
    expect(screen.getByTestId('test-page-summary-lesson-11-practice-page')).toBeInTheDocument()
    await user.click(jump('منطقة حلول الاختبار المستقل'))
    expect(screen.queryByTestId(`solution-${testDefinition.pages[0].questions[0].id}`)).not.toBeInTheDocument()
  })

  it('shows all homework tasks with bold targets and reveals full solutions only on request', async () => {
    const user = userEvent.setup()
    render(<LessonEleven />)
    await user.click(jump('١١. الواجب المنزلي'))
    expect(screen.queryByTestId('eleven-homework-answers')).not.toBeInTheDocument()
    const exercise = document.querySelector('.eleven-homework')!
    expect(exercise.querySelectorAll('.eleven-homework__item .eleven-focus')).toHaveLength(5)
    for (const item of homeworkMarks) expect(exercise.textContent).toContain(item.sentence)
    expect(screen.getByText(/كتبَ الطالبُ الدرسَ في الدفترِ/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'إظهار الحلول النموذجية' }))
    const answers = screen.getByTestId('eleven-homework-answers')
    expect(within(answers).getByRole('heading', { name: /السؤال الأول/ })).toBeInTheDocument()
    expect(within(answers).getByRole('heading', { name: /السؤال الثاني/ })).toBeInTheDocument()
    expect(within(answers).getByRole('heading', { name: /السؤال الثالث/ })).toBeInTheDocument()
    expect(within(answers).getAllByRole('listitem')).toHaveLength(homeworkMarks.length + homeworkBlanks.length)
    expect(within(answers).getAllByRole('row')).toHaveLength(homeworkParsing.length + 1)
    expect(answers).toHaveTextContent('كتبَ: فعل ماضٍ مبني على الفتح')
    expect(answers).toHaveTextContent('الدفترِ: اسم مجرور بـ«في»')
    await user.click(screen.getByRole('button', { name: 'إخفاء الحلول النموذجية' }))
    expect(screen.queryByTestId('eleven-homework-answers')).not.toBeInTheDocument()
  })

  it('keeps independent-test scores, answers and solutions secret through page checks; rechecks edits without double count', async () => {
    const user = userEvent.setup()
    render(<LessonEleven />)
    await user.click(jump('تسليم الاختبار المستقل والنتيجة'))
    expect(screen.getByRole('button', { name: 'تسليم الاختبار' })).toBeDisabled()
    expect(screen.queryByTestId('eleven-result')).not.toBeInTheDocument()
    await user.click(jump('منطقة حلول الاختبار المستقل'))
    expect(screen.queryByTestId(`solution-${testDefinition.pages[0].questions[0].id}`)).not.toBeInTheDocument()

    for (const page of testDefinition.pages) {
      await user.click(jump(`الاختبار المستقل: ${page.title}`))
      expect(screen.queryByTestId(`test-feedback-${page.questions[0].id}`)).not.toBeInTheDocument()
      for (const question of page.questions) {
        const field = question.fields[0]
        if (field.kind !== 'choice') throw new Error('Expected a choice')
        await user.click(within(screen.getByTestId(`eleven-question-${question.id}`)).getByRole('radio', { name: field.answer }))
      }
      await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
      expect(screen.getByTestId(`test-page-saved-${page.id}`)).toBeInTheDocument()
      expect(screen.queryByTestId(`test-page-summary-${page.id}`)).not.toBeInTheDocument()
      expect(screen.queryByText(page.questions[0].explanation!)).not.toBeInTheDocument()
    }
    await user.click(jump('منطقة حلول الاختبار المستقل'))
    expect(screen.queryByTestId(`solution-${testDefinition.pages[0].questions[0].id}`)).not.toBeInTheDocument()
    await user.click(jump('تسليم الاختبار المستقل والنتيجة'))
    expect(screen.getByRole('button', { name: 'تسليم الاختبار' })).toBeEnabled()
    expect(screen.queryByTestId('eleven-result')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار' }))
    expect(screen.getByTestId('eleven-result')).toHaveTextContent(/20\s*\/\s*20/)
    await user.click(jump('منطقة حلول الاختبار المستقل'))
    for (const question of testDefinition.pages.flatMap((page) => page.questions)) {
      expect(screen.getByTestId(`solution-${question.id}`)).toHaveTextContent(question.explanation!)
    }

    const first = testDefinition.pages[0].questions[0]
    const firstField = first.fields[0]
    if (firstField.kind !== 'choice') throw new Error('Expected a choice')
    await user.click(jump(`الاختبار المستقل: ${testDefinition.pages[0].title}`))
    expect(within(screen.getByTestId(`eleven-question-${first.id}`)).getByRole('radio', { name: firstField.answer })).toBeChecked()
    await user.click(within(screen.getByTestId(`eleven-question-${first.id}`)).getByRole('radio', { name: firstField.options.find((option) => option !== firstField.answer)! }))
    await user.click(jump('منطقة حلول الاختبار المستقل'))
    expect(screen.queryByTestId(`solution-${first.id}`)).not.toBeInTheDocument()
    await user.click(jump(`الاختبار المستقل: ${testDefinition.pages[0].title}`))
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    await user.click(jump('تسليم الاختبار المستقل والنتيجة'))
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار' }))
    expect(screen.getByTestId('eleven-result')).toHaveTextContent(/19\s*\/\s*20/)
    await user.click(screen.getByRole('button', { name: 'إعادة ضبط الاختبار' }))
    expect(screen.queryByTestId('eleven-result')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'تسليم الاختبار' })).toBeDisabled()
    await user.click(jump('منطقة حلول الاختبار المستقل'))
    expect(screen.queryByTestId(`solution-${first.id}`)).not.toBeInTheDocument()
  })

  it('uses the existing protected TeacherSpace for all examples, 8 + 10 source keys, three homework parts and full parsing', async () => {
    const user = userEvent.setup()
    render(<LessonEleven />)
    await user.click(jump('منطقة المعلم'))
    expect(screen.queryByTestId('eleven-teacher-guide')).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('كلمة المرور'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByText('كلمة المرور غير صحيحة.')).toBeInTheDocument()
    await user.clear(screen.getByLabelText('كلمة المرور'))
    await user.type(screen.getByLabelText('كلمة المرور'), COURSE_TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    const teacher = screen.getByTestId('eleven-teacher-guide')
    expect(within(teacher).getByRole('heading', { name: 'شرح نحوي لأمثلة الدرس مع أسباب العلامة' })).toBeInTheDocument()
    expect(within(teacher).getByRole('heading', { name: 'حل التدريب التفاعلي (٨ أسئلة)' })).toBeInTheDocument()
    expect(within(teacher).getByRole('heading', { name: 'حل الاختبار الختامي التعليمي (١٠ أسئلة)' })).toBeInTheDocument()
    expect(within(teacher).getByRole('heading', { name: 'حل الواجب المنزلي بجميع أجزائه' })).toBeInTheDocument()
    for (const item of [...practiceQuestions, ...finalQuizQuestions]) expect(teacher).toHaveTextContent(item.explanation)
    for (const row of homeworkParsing) expect(teacher).toHaveTextContent(row.analysis)
    expect(teacher).toHaveTextContent('رأيتُ: فعل ماضٍ مبني على السكون')
    expect(teacher).toHaveTextContent('قرأَ: فعل ماضٍ مبني على الفتح')
    expect(within(teacher).getByTestId('eleven-homework-answers')).toBeInTheDocument()
    expect(screen.queryByTestId('eleven-solutions')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'إغلاق المساحة' }))
    expect(screen.queryByTestId('eleven-teacher-guide')).not.toBeInTheDocument()
  })
})
