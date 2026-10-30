import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from '../../app/App'
import { COURSE_TEACHER_PASSWORD } from '../../shared/teacher/teacherPassword'
import { LessonBasicsFourteen } from '../LessonBasicsFourteen'
import { challengeQuestions, testDefinition, homeworkSentences, examQuestions, compositionModels } from './content'

function jump(title: string) {
  return within(screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' }))
    .getByRole('button', { name: (name) => name.includes(title) })
}

beforeEach(() => { window.location.hash = '#/' })

describe('basics lesson 14 — sequential accessible UI, working «صحّح إجاباتي», gated independent test', () => {
  it('opens at the end of the basics index, renders RTL flow, and finishes back at the section', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/sections/basics-grammar'
    render(<App />)
    const links = within(screen.getByRole('list', { name: 'دروس القسم' })).getAllByRole('link')
    expect(links).toHaveLength(14)
    expect(links[13]).toHaveAttribute('href', '#/lesson/basics-lesson-14')
    await user.click(links[13])
    expect(window.location.hash).toBe('#/lesson/basics-lesson-14')
    expect(document.querySelector('.fourteen-lesson')).toHaveAttribute('dir', 'rtl')
    expect(screen.getByRole('heading', { name: 'الأسماء الخمسة' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'التمهيد: هل تُعرب جميع الأسماء بالطريقة نفسها؟', level: 2 })).toBeInTheDocument()
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0)
    for (const image of screen.getAllByRole('img')) expect(image).toHaveAccessibleName()
    expect(document.querySelectorAll('.lesson-step')).toHaveLength(1)

    await user.click(jump('ما الأسماء الخمسة؟'))
    expect(screen.getByRole('table', { name: 'الأسماء الخمسة وأمثلتها في جمل' })).toBeInTheDocument()
    await user.click(jump('علامات إعراب الأسماء الخمسة'))
    expect(screen.getByRole('table', { name: 'علامات إعراب الأسماء الخمسة عند تحقق شروطها' })).toBeInTheDocument()
    await user.click(jump('الشرط الثالث'))
    expect(screen.getAllByText(/منع من ظهورها اشتغال المحل بحركة المناسبة/).length).toBeGreaterThan(0)
    await user.click(jump('مقارنة بين العلامات الأصلية والفرعية'))
    expect(screen.getByRole('table', { name: /مقارنة العلامات الأصلية والفرعية/ })).toBeInTheDocument()
    // The approved next lesson is a real registered route.
    await user.click(jump('الدرس التالي'))
    expect(screen.getByRole('link', { name: /كان وأخواتها/ })).toHaveAttribute('href', '#/lesson/lesson-9')
    await user.click(screen.getByRole('button', { name: /إتمام الدرس/ }))
    expect(window.location.hash).toBe('#/sections/basics-grammar')
    expect(screen.getByRole('list', { name: 'دروس القسم' })).toBeInTheDocument()
  })

  it('hides challenge keys until «صحّح إجاباتي» works, explains every question, supports edit and reset', async () => {
    const user = userEvent.setup()
    render(<LessonBasicsFourteen />)
    await user.click(jump('تدريب تفاعلي'))
    expect(screen.queryByTestId(`test-feedback-${challengeQuestions[0].id}`)).not.toBeInTheDocument()
    for (const question of challengeQuestions) {
      const field = question.fields[0]
      if (field.kind !== 'choice') throw new Error('choice expected')
      await user.click(within(screen.getByTestId(`test-question-${question.id}`)).getByRole('radio', { name: field.answer }))
      expect(screen.queryByText(question.explanation!)).not.toBeInTheDocument()
    }
    expect(screen.getByTestId('fourteen-challenge-progress')).toHaveTextContent('أجبت عن: 8 / 8')
    await user.click(screen.getByRole('button', { name: 'صحّح إجاباتي' }))
    expect(screen.getByTestId('fourteen-challenge-progress')).toHaveTextContent('نتيجتك: 8 / 8')
    for (const question of challengeQuestions) {
      expect(screen.getByTestId(`test-feedback-${question.id}`)).toHaveTextContent(question.explanation!)
    }
    // Editing an answer revokes the feedback until the next correction run.
    const first = challengeQuestions[0]
    await user.click(within(screen.getByTestId(`test-question-${first.id}`)).getByRole('radio', { name: 'أباكَ' }))
    expect(screen.queryByTestId(`test-feedback-${first.id}`)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'صحّح إجاباتي' }))
    expect(screen.getByTestId('fourteen-challenge-progress')).toHaveTextContent('7 / 8')
    await user.click(screen.getByRole('button', { name: 'إعادة محاولة التدريب' }))
    expect(screen.getByTestId('fourteen-challenge-progress')).toHaveTextContent('0 / 8')
    expect(screen.getAllByRole('radio').every((radio) => !(radio as HTMLInputElement).checked)).toBe(true)
    expect(screen.queryByTestId(`test-feedback-${first.id}`)).not.toBeInTheDocument()
  })

  it('saves four exam pages without feedback; submission plus disclosure unlocks the 20-point solutions', async () => {
    const user = userEvent.setup()
    render(<LessonBasicsFourteen />)
    await user.click(jump('منطقة حلول الاختبار المستقل'))
    expect(screen.getByRole('button', { name: 'كشف نموذج الإجابة' })).toBeDisabled()
    expect(screen.queryByTestId('solution-fourteen-exam-10')).not.toBeInTheDocument()
    for (const page of testDefinition.pages) {
      await user.click(jump(page.title))
      for (const question of page.questions) {
        const group = within(screen.getByTestId(`test-question-${question.id}`))
        const field = question.fields[0]
        if (field.kind === 'choice') await user.click(group.getByRole('radio', { name: field.answer }))
        else if (field.kind === 'text' && question.fields.length > 1) {
          const boxes = group.getAllByRole('textbox')
          for (let index = 0; index < boxes.length; index += 1) {
            const nameField = question.fields[index]
            if (nameField.kind === 'text') await user.type(boxes[index], nameField.accept[0])
          }
        } else if (field.kind === 'text') await user.type(group.getByRole('textbox'), field.accept[0])
        else await user.type(group.getByRole('textbox'), 'الوظيفة والحالة والعلامة والسبب')
        expect(screen.queryByTestId(`test-feedback-${question.id}`)).not.toBeInTheDocument()
      }
      await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
      expect(screen.getByTestId(`test-page-saved-${page.id}`)).toBeInTheDocument()
      expect(screen.queryByTestId(`test-page-summary-${page.id}`)).not.toBeInTheDocument()
    }
    await user.click(jump('منطقة حلول الاختبار المستقل'))
    expect(screen.getByRole('button', { name: 'كشف نموذج الإجابة' })).toBeDisabled()
    await user.click(jump('تسليم الاختبار والنتيجة'))
    expect(screen.queryByTestId('fourteen-result')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار' }))
    const result = screen.getByTestId('fourteen-result')
    expect(result).toHaveTextContent('14 / 14')
    expect(result).toHaveTextContent('6 / 6')
    expect(result).toHaveTextContent('٢٠ (٥ + ٤ + ٦ + ٥')
    await user.click(jump('منطقة حلول الاختبار المستقل'))
    expect(screen.queryByTestId('solution-fourteen-exam-10')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'كشف نموذج الإجابة' }))
    for (const question of examQuestions) {
      const solution = screen.getByTestId(`solution-${question.id}`)
      expect(solution).toHaveTextContent(question.explanation!)
      for (const line of question.parsing ?? []) expect(solution).toHaveTextContent(line)
      expect(solution).toHaveTextContent(question.solution!.slice(0, 20))
    }
    // Editing after submission revokes disclosure until the next valid submission.
    await user.click(jump(testDefinition.pages[0].title))
    await user.click(within(screen.getByTestId('test-question-fourteen-exam-1')).getByRole('radio', { name: 'الضمة' }))
    await user.click(jump('منطقة حلول الاختبار المستقل'))
    expect(screen.queryByTestId('solution-fourteen-exam-1')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'كشف نموذج الإجابة' })).toBeDisabled()
    await user.click(jump(testDefinition.pages[0].title))
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    await user.click(jump('تسليم الاختبار والنتيجة'))
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار' }))
    expect(screen.getByTestId('fourteen-result')).toHaveTextContent('13 / 14')
    await user.click(screen.getByRole('button', { name: 'إعادة ضبط الاختبار' }))
    expect(screen.queryByTestId('fourteen-result')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'تسليم الاختبار' })).toBeDisabled()
  }, 25000)

  it('keeps homework solutions on request and the complete teacher guide behind the shared gate', async () => {
    const user = userEvent.setup()
    render(<LessonBasicsFourteen />)
    await user.click(jump('الواجب المنزلي'))
    expect(screen.queryByTestId('fourteen-homework-answers')).not.toBeInTheDocument()
    expect(screen.getByRole('table', { name: /النشاط الأول/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'عرض الحلول النموذجية' }))
    for (const row of homeworkSentences) {
      expect(screen.getByTestId('fourteen-homework-answers')).toHaveTextContent(row.answer)
      expect(screen.getByTestId('fourteen-homework-answers')).toHaveTextContent(row.parsing)
    }
    for (const row of compositionModels) {
      expect(screen.getByTestId('fourteen-homework-answers')).toHaveTextContent(row.model)
    }
    await user.click(screen.getByRole('button', { name: 'إخفاء الحلول النموذجية' }))
    expect(screen.queryByTestId('fourteen-homework-answers')).not.toBeInTheDocument()

    await user.click(jump('قسم خاص بالمعلّم'))
    expect(screen.queryByTestId('fourteen-teacher-guide')).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('كلمة المرور'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByRole('alert')).toHaveTextContent('كلمة المرور غير صحيحة.')
    await user.clear(screen.getByLabelText('كلمة المرور'))
    await user.type(screen.getByLabelText('كلمة المرور'), COURSE_TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    const guide = screen.getByTestId('fourteen-teacher-guide')
    for (const question of [...challengeQuestions, ...examQuestions]) {
      expect(guide).toHaveTextContent(question.explanation!)
    }
    for (const question of examQuestions) expect(guide).toHaveTextContent(question.teacherAnswer!.slice(0, 24))
    expect(within(guide).getByTestId('fourteen-homework-answers')).toBeInTheDocument()
    expect(guide).toHaveTextContent('ت-1')
    expect(guide).toHaveTextContent('معايير التصحيح')
    await user.click(screen.getByRole('button', { name: 'إغلاق المساحة' }))
    expect(screen.queryByTestId('fourteen-teacher-guide')).not.toBeInTheDocument()
  })

  it('never leaks a solution into the student-facing steps before submission', async () => {
    const user = userEvent.setup()
    render(<LessonBasicsFourteen />)
    // Walk every step before the exam: no exam solution and no teacher guide is present.
    for (const title of ['ما الأسماء الخمسة؟', 'الشرط الثالث', 'أخطاء شائعة', 'تدريب تفاعلي']) {
      await user.click(jump(title))
      expect(screen.queryByTestId('fourteen-teacher-guide')).not.toBeInTheDocument()
      expect(document.querySelector('[data-testid^="solution-fourteen-exam"]')).toBeNull()
    }
    for (const page of testDefinition.pages) {
      await user.click(jump(page.title))
      expect(document.querySelector('[data-testid^="solution-fourteen-exam"]')).toBeNull()
      expect(screen.queryByTestId('fourteen-result')).not.toBeInTheDocument()
    }
  })
})
