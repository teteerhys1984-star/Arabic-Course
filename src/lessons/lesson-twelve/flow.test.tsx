import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from '../../app/App'
import { COURSE_TEACHER_PASSWORD } from '../../shared/teacher/teacherPassword'
import { LessonTwelve } from '../LessonTwelve'
import { challengeQuestions, challengeTest, testDefinition, homework, workedExamples } from './content'

function jump(title: string) {
  return within(screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' })).getByRole('button', { name: (name) => name.includes(title) })
}
beforeEach(() => { window.location.hash = '#/' })

describe('lesson 12 — sequential accessible UI and latest valid attempt', () => {
  it('opens from the correct section after lesson 11 and finishes back at the section', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/sections/basics-grammar'
    render(<App />)
    const links = within(screen.getByRole('list', { name: 'دروس القسم' })).getAllByRole('link')
    expect(links).toHaveLength(13)
    expect(links.map((l) => l.getAttribute('href'))).toEqual(Array.from({ length: 13 }, (_, i) => `#/lesson/lesson-${i + 1}`))
    await user.click(links[11])
    expect(document.querySelector('.twelve-lesson')).toHaveAttribute('dir', 'rtl')
    expect(screen.getAllByRole('img')).toHaveLength(3)
    for (const image of screen.getAllByRole('img')) expect(image).toHaveAccessibleName()
    expect(document.querySelectorAll('.lesson-step')).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: 'التالي' }))
    expect(screen.getByRole('heading', { level: 2, name: 'المفرد والمثنّى والجمع' })).toHaveFocus()
    await user.click(jump('المقارنة الشاملة'))
    expect(screen.getByRole('table', { name: /مقارنة علامات إعراب/ })).toBeInTheDocument()
    await user.click(jump('تمهيد للدرس الثالث عشر'))
    expect(screen.queryByRole('link', { name: /الدرس الثالث عشر/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /إتمام الدرس/ }))
    expect(window.location.hash).toBe('#/sections/basics-grammar')
    expect(screen.getByRole('list', { name: 'دروس القسم' })).toBeInTheDocument()
  })

  it('hides challenge keys until checking, explains every question, invalidates edits and resets without double-counting', async () => {
    const user = userEvent.setup()
    render(<LessonTwelve />)
    await user.click(jump('تحدّي القواعد'))
    expect(screen.queryByTestId(`test-feedback-${challengeQuestions[0].id}`)).not.toBeInTheDocument()
    for (const q of challengeQuestions) {
      const field = q.fields[0]
      if (field.kind !== 'choice') throw new Error('choice expected')
      await user.click(within(screen.getByTestId(`test-question-${q.id}`)).getByRole('radio', { name: field.answer }))
      expect(screen.queryByText(q.explanation!)).not.toBeInTheDocument()
    }
    expect(screen.getByTestId('twelve-challenge-progress')).toHaveTextContent('أجبت عن: 8 / 8')
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(screen.getByTestId('twelve-challenge-progress')).toHaveTextContent('نتيجتك: 8 / 8')
    for (const q of challengeQuestions) expect(screen.getByTestId(`test-feedback-${q.id}`)).toHaveTextContent(q.explanation!)
    await user.click(screen.getByRole('button', { name: 'أعِد التحقّق من الإجابات' }))
    expect(screen.getByTestId('twelve-challenge-progress')).toHaveTextContent('8 / 8')
    const first = challengeQuestions[0]
    await user.click(within(screen.getByTestId(`test-question-${first.id}`)).getByRole('radio', { name: 'مهندسونَ' }))
    expect(screen.queryByTestId(`test-feedback-${first.id}`)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(screen.getByTestId('twelve-challenge-progress')).toHaveTextContent('7 / 8')
    await user.click(jump('المقارنة الشاملة'))
    await user.click(jump('تحدّي القواعد'))
    expect(screen.getByTestId('twelve-challenge-progress')).toHaveTextContent('7 / 8')
    await user.click(screen.getByRole('button', { name: 'إعادة محاولة التحدّي' }))
    expect(screen.getByTestId('twelve-challenge-progress')).toHaveTextContent('0 / 8')
    expect(screen.getAllByRole('radio').every((r) => !(r as HTMLInputElement).checked)).toBe(true)
    expect(screen.queryByTestId(`test-page-summary-${challengeTest.pages[0].id}`)).not.toBeInTheDocument()
  })

  it('saves four independent pages without feedback; submission plus explicit disclosure unlocks full solutions including manual parsing', async () => {
    const user = userEvent.setup()
    render(<LessonTwelve />)
    await user.click(jump('منطقة حلول الاختبار المستقل'))
    expect(screen.getByRole('button', { name: 'كشف نموذج الإجابة' })).toBeDisabled()
    expect(screen.queryByTestId('solution-twelve-exam-11')).not.toBeInTheDocument()
    for (const page of testDefinition.pages) {
      await user.click(jump(page.title))
      for (const q of page.questions) {
        const group = within(screen.getByTestId(`test-question-${q.id}`))
        const field = q.fields[0]
        if (field.kind === 'choice') await user.click(group.getByRole('radio', { name: field.answer }))
        else if (field.kind === 'essay') await user.type(group.getByRole('textbox'), 'تحليل مكتوب يراجعه المعلم')
        expect(screen.queryByTestId(`test-feedback-${q.id}`)).not.toBeInTheDocument()
      }
      await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
      expect(screen.getByTestId(`test-page-saved-${page.id}`)).toBeInTheDocument()
      expect(screen.queryByTestId(`test-page-summary-${page.id}`)).not.toBeInTheDocument()
      expect(screen.queryByText(page.questions[0].explanation!)).not.toBeInTheDocument()
    }
    await user.click(jump('منطقة حلول الاختبار المستقل'))
    expect(screen.getByRole('button', { name: 'كشف نموذج الإجابة' })).toBeDisabled()
    await user.click(jump('تسليم الاختبار والنتيجة'))
    expect(screen.queryByTestId('twelve-result')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار' }))
    expect(screen.getByTestId('twelve-result')).toHaveTextContent('13 / 13')
    expect(screen.getByTestId('twelve-result')).toHaveTextContent('3 من 3')
    await user.click(jump('منطقة حلول الاختبار المستقل'))
    expect(screen.queryByTestId('solution-twelve-exam-11')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'كشف نموذج الإجابة' }))
    for (const q of testDefinition.pages.flatMap((p) => p.questions)) {
      const solution = screen.getByTestId(`solution-${q.id}`)
      expect(solution).toHaveTextContent(q.explanation!)
      for (const line of q.parsing ?? []) expect(solution).toHaveTextContent(line)
    }
    await user.click(jump(testDefinition.pages[0].title))
    await user.click(within(screen.getByTestId('test-question-twelve-exam-1')).getByRole('radio', { name: 'جمع تكسير' }))
    await user.click(jump('منطقة حلول الاختبار المستقل'))
    expect(screen.queryByTestId('solution-twelve-exam-1')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'كشف نموذج الإجابة' })).toBeDisabled()
    await user.click(jump(testDefinition.pages[0].title))
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    await user.click(jump('تسليم الاختبار والنتيجة'))
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار' }))
    expect(screen.getByTestId('twelve-result')).toHaveTextContent('12 / 13')
    await user.click(screen.getByRole('button', { name: 'إعادة ضبط الاختبار' }))
    expect(screen.queryByTestId('twelve-result')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'تسليم الاختبار' })).toBeDisabled()
  }, 20000)

  it('keeps homework solutions on request and the complete teacher guide behind the shared gate', async () => {
    const user = userEvent.setup()
    render(<LessonTwelve />)
    await user.click(jump('الواجب المنزلي'))
    expect(screen.queryByTestId('twelve-homework-answers')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'عرض الحلول النموذجية' }))
    for (const row of homework) expect(screen.getByTestId('twelve-homework-answers')).toHaveTextContent(row.reason)
    await user.click(screen.getByRole('button', { name: 'إخفاء الحلول النموذجية' }))
    expect(screen.queryByTestId('twelve-homework-answers')).not.toBeInTheDocument()
    await user.click(jump('منطقة المعلم'))
    expect(screen.queryByTestId('twelve-teacher-guide')).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('كلمة المرور'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByRole('alert')).toHaveTextContent('كلمة المرور غير صحيحة.')
    await user.clear(screen.getByLabelText('كلمة المرور'))
    await user.type(screen.getByLabelText('كلمة المرور'), COURSE_TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    const guide = screen.getByTestId('twelve-teacher-guide')
    for (const q of [...challengeQuestions, ...testDefinition.pages.flatMap((p) => p.questions)]) expect(guide).toHaveTextContent(q.explanation!)
    for (const example of workedExamples) for (const line of example.parsing) expect(guide).toHaveTextContent(line)
    expect(within(guide).getByTestId('twelve-homework-answers')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'إغلاق المساحة' }))
    expect(screen.queryByTestId('twelve-teacher-guide')).not.toBeInTheDocument()
  })
})
