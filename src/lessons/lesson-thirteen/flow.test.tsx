import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from '../../app/App'
import { COURSE_TEACHER_PASSWORD } from '../../shared/teacher/teacherPassword'
import { LessonThirteen } from '../LessonThirteen'
import { challengeQuestions, testDefinition, homework, examQuestions } from './content'

function jump(title: string) {
  return within(screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' })).getByRole('button', { name: (name) => name.includes(title) })
}

beforeEach(() => { window.location.hash = '#/' })

describe('lesson 13 — sequential accessible UI, working «صحّح إجاباتي», gated independent test', () => {
  it('opens after lesson 12 in the basics index, renders RTL flow and finishes back at the section', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/sections/basics-grammar'
    render(<App />)
    const links = within(screen.getByRole('list', { name: 'دروس القسم' })).getAllByRole('link')
    expect(links).toHaveLength(13)
    expect(links.map((l) => l.getAttribute('href'))).toEqual(Array.from({ length: 13 }, (_, i) => `#/lesson/lesson-${i + 1}`))
    await user.click(links[12])
    expect(window.location.hash).toBe('#/lesson/lesson-13')
    expect(document.querySelector('.thirteen-lesson')).toHaveAttribute('dir', 'rtl')
    expect(screen.getByRole('heading', { name: 'علامات الإعراب الفرعية' })).toBeInTheDocument()
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0)
    for (const image of screen.getAllByRole('img')) expect(image).toHaveAccessibleName()
    expect(document.querySelectorAll('.lesson-step')).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'التالي' }))
    expect(screen.getByRole('table', { name: /علامات الإعراب الأصلية في اسم واحد/ })).toBeInTheDocument()
    await user.click(jump('المقارنة الشاملة'))
    expect(screen.getByRole('table', { name: /مقارنة علامات الإعراب الفرعية/ })).toBeInTheDocument()
    await user.click(jump('طريقة التفكير عند الإعراب'))
    expect(screen.getByText('حدّد موقعها: هل هي فاعل، أم مفعول به، أم اسم مجرور؟')).toBeInTheDocument()
    await user.click(jump('الدرس التالي'))
    // The next-lesson teaser is text-only: no route exists for a lesson that was never created.
    expect(screen.queryByRole('link', { name: /الأسماء الخمسة/ })).not.toBeInTheDocument()
    expect(document.querySelector('.lesson-step a[href*="lesson-14"]')).toBeNull()
    await user.click(screen.getByRole('button', { name: /إتمام الدرس/ }))
    expect(window.location.hash).toBe('#/sections/basics-grammar')
    expect(screen.getByRole('list', { name: 'دروس القسم' })).toBeInTheDocument()
  })

  it('hides challenge keys until «صحّح إجاباتي» works, explains every question, supports edit and reset', async () => {
    const user = userEvent.setup()
    render(<LessonThirteen />)
    await user.click(jump('اختبر فهمك'))
    expect(screen.queryByTestId(`test-feedback-${challengeQuestions[0].id}`)).not.toBeInTheDocument()
    for (const q of challengeQuestions) {
      const field = q.fields[0]
      if (field.kind !== 'choice') throw new Error('choice expected')
      await user.click(within(screen.getByTestId(`test-question-${q.id}`)).getByRole('radio', { name: field.answer }))
      expect(screen.queryByText(q.explanation!)).not.toBeInTheDocument()
    }
    expect(screen.getByTestId('thirteen-challenge-progress')).toHaveTextContent('أجبت عن: 8 / 8')
    // The source button «صحّح إجاباتي» performs the real page check through the shared engine.
    await user.click(screen.getByRole('button', { name: 'صحّح إجاباتي' }))
    expect(screen.getByTestId('thirteen-challenge-progress')).toHaveTextContent('نتيجتك: 8 / 8')
    for (const q of challengeQuestions) expect(screen.getByTestId(`test-feedback-${q.id}`)).toHaveTextContent(q.explanation!)
    // Edit one answer: feedback is revoked until the next correction run.
    const first = challengeQuestions[0]
    await user.click(within(screen.getByTestId(`test-question-${first.id}`)).getByRole('radio', { name: 'الضمة' }))
    expect(screen.queryByTestId(`test-feedback-${first.id}`)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'صحّح إجاباتي' }))
    expect(screen.getByTestId('thirteen-challenge-progress')).toHaveTextContent('7 / 8')
    expect(screen.getByTestId(`test-feedback-${first.id}`)).toHaveTextContent(first.explanation!)
    await user.click(screen.getByRole('button', { name: 'إعادة محاولة التدريب' }))
    expect(screen.getByTestId('thirteen-challenge-progress')).toHaveTextContent('0 / 8')
    expect(screen.getAllByRole('radio').every((r) => !(r as HTMLInputElement).checked)).toBe(true)
    expect(screen.queryByTestId(`test-feedback-${first.id}`)).not.toBeInTheDocument()
  })

  it('saves four exam pages without feedback; submission plus disclosure unlocks the 20-point solutions', async () => {
    const user = userEvent.setup()
    render(<LessonThirteen />)
    await user.click(jump('منطقة حلول الاختبار المستقل'))
    expect(screen.getByRole('button', { name: 'كشف نموذج الإجابة' })).toBeDisabled()
    expect(screen.queryByTestId('solution-thirteen-exam-11')).not.toBeInTheDocument()
    for (const page of testDefinition.pages) {
      await user.click(jump(page.title))
      for (const q of page.questions) {
        const group = within(screen.getByTestId(`test-question-${q.id}`))
        const field = q.fields[0]
        if (field.kind === 'choice') await user.click(group.getByRole('radio', { name: field.answer }))
        else if (field.kind === 'text') await user.type(group.getByRole('textbox'), field.accept[0])
        else await user.type(group.getByRole('textbox'), 'الوظيفة والحالة والعلامة والسبب')
        expect(screen.queryByTestId(`test-feedback-${q.id}`)).not.toBeInTheDocument()
      }
      await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
      expect(screen.getByTestId(`test-page-saved-${page.id}`)).toBeInTheDocument()
      expect(screen.queryByTestId(`test-page-summary-${page.id}`)).not.toBeInTheDocument()
    }
    await user.click(jump('منطقة حلول الاختبار المستقل'))
    expect(screen.getByRole('button', { name: 'كشف نموذج الإجابة' })).toBeDisabled()
    await user.click(jump('تسليم الاختبار والنتيجة'))
    expect(screen.queryByTestId('thirteen-result')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار' }))
    const result = screen.getByTestId('thirteen-result')
    expect(result).toHaveTextContent('14 / 14')
    expect(result).toHaveTextContent('6 / 6')
    expect(result).toHaveTextContent('٢٠ (٥ + ٥ + ٦ + ٤')
    await user.click(jump('منطقة حلول الاختبار المستقل'))
    expect(screen.queryByTestId('solution-thirteen-exam-11')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'كشف نموذج الإجابة' }))
    for (const q of examQuestions) {
      const solution = screen.getByTestId(`solution-${q.id}`)
      expect(solution).toHaveTextContent(q.explanation!)
      for (const line of q.parsing ?? []) expect(solution).toHaveTextContent(line)
      expect(solution).toHaveTextContent(q.solution!.slice(0, 20))
    }
    // Editing after submission revokes disclosure until the next valid submission.
    await user.click(jump(testDefinition.pages[0].title))
    await user.click(within(screen.getByTestId('test-question-thirteen-exam-1')).getByRole('radio', { name: 'الضمة' }))
    await user.click(jump('منطقة حلول الاختبار المستقل'))
    expect(screen.queryByTestId('solution-thirteen-exam-1')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'كشف نموذج الإجابة' })).toBeDisabled()
    await user.click(jump(testDefinition.pages[0].title))
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    await user.click(jump('تسليم الاختبار والنتيجة'))
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار' }))
    expect(screen.getByTestId('thirteen-result')).toHaveTextContent('13 / 14')
    await user.click(screen.getByRole('button', { name: 'إعادة ضبط الاختبار' }))
    expect(screen.queryByTestId('thirteen-result')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'تسليم الاختبار' })).toBeDisabled()
  }, 20000)

  it('keeps homework solutions on request and the complete teacher guide behind the shared gate', async () => {
    const user = userEvent.setup()
    render(<LessonThirteen />)
    await user.click(jump('الواجب المنزلي'))
    expect(screen.queryByTestId('thirteen-homework-answers')).not.toBeInTheDocument()
    expect(screen.getByRole('table', { name: /اكتب ثلاث جمل عن المدرسة/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'عرض الحلول النموذجية' }))
    for (const row of homework) {
      expect(screen.getByTestId('thirteen-homework-answers')).toHaveTextContent(row.model)
      for (const line of row.parsing) expect(screen.getByTestId('thirteen-homework-answers')).toHaveTextContent(line)
    }
    await user.click(screen.getByRole('button', { name: 'إخفاء الحلول النموذجية' }))
    expect(screen.queryByTestId('thirteen-homework-answers')).not.toBeInTheDocument()

    await user.click(jump('قسم خاص بالمعلّم'))
    expect(screen.queryByTestId('thirteen-teacher-guide')).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('كلمة المرور'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByRole('alert')).toHaveTextContent('كلمة المرور غير صحيحة.')
    await user.clear(screen.getByLabelText('كلمة المرور'))
    await user.type(screen.getByLabelText('كلمة المرور'), COURSE_TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    const guide = screen.getByTestId('thirteen-teacher-guide')
    for (const q of [...challengeQuestions, ...examQuestions]) expect(guide).toHaveTextContent(q.explanation!)
    for (const q of examQuestions) expect(guide).toHaveTextContent(q.teacherAnswer!.slice(0, 24))
    expect(within(guide).getByTestId('thirteen-homework-answers')).toBeInTheDocument()
    expect(guide).toHaveTextContent('ت-1')
    await user.click(screen.getByRole('button', { name: 'إغلاق المساحة' }))
    expect(screen.queryByTestId('thirteen-teacher-guide')).not.toBeInTheDocument()
  })
})
