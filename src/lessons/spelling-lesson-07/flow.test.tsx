import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { LessonSpellingSeven } from '../LessonSpellingSeven'
import { App } from '../../app/App'
import { testDefinition } from './content'
import { COURSE_TEACHER_PASSWORD } from '../../shared/teacher/teacherPassword'
const jump = (title: string) => within(screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' })).getByRole('button', { name: name => name.includes(title) })

describe('spelling 07 real interactions in jsdom', () => {
 it('route opens, retains keyboard choices over repeated back and forward navigation', async () => {
  window.location.hash = '#/lesson/spelling-lesson-07'
  const user = userEvent.setup()
  render(<App />)
  expect(document.querySelector('.spell7-lesson')).toHaveAttribute('dir', 'rtl')
  await user.click(jump('تحدّي المحقّق الإملائي'))
  const radio = screen.getByRole('radio', {name: 'قراءة'})
  radio.focus(); await user.keyboard(' ')
  await user.click(screen.getAllByRole('button', {name: 'تحقّق'})[0])
  expect(within(document.querySelector('.lesson-step') as HTMLElement).getByRole('status')).toHaveTextContent('إجابة صحيحة')
  for (let i = 0; i < 3; i++) {
   await user.click(screen.getByRole('button', {name: 'التالي'}))
   await user.click(screen.getByRole('button', {name: 'السابق'}))
   expect(screen.getByRole('radio', {name: 'قراءة'})).toBeChecked()
   expect(within(document.querySelector('.lesson-step') as HTMLElement).getByRole('status')).toHaveTextContent('إجابة صحيحة')
  }
 })
 it('retains all twenty answers, gates results and solutions, invalidates on edit, and resets', async () => {
  const user = userEvent.setup()
  const view = render(<LessonSpellingSeven />)
  for (const page of testDefinition.pages) {
   await user.click(jump(page.title))
   for (const q of page.questions) {
    const f = q.fields[0]; if (f.kind !== 'choice') throw Error('choice')
    await user.click(within(screen.getByTestId(`spell7-question-${q.id}`)).getByRole('radio', {name: f.answer}))
   }
   await user.click(screen.getByRole('button', {name: 'تحقّق من الإجابات'}))
   expect(screen.queryByTestId(`test-page-summary-${page.id}`)).not.toBeInTheDocument()
   expect(screen.queryByTestId(`test-feedback-${page.questions[0].id}`)).not.toBeInTheDocument()
  }
  await user.click(jump('حلول الاختبار المستقل'))
  expect(screen.getByText(/الحلول مقفلة/)).toBeInTheDocument()
  for (const page of testDefinition.pages) {
   await user.click(jump(page.title))
   for (const q of page.questions) {
    const f = q.fields[0]; if (f.kind !== 'choice') throw Error('choice')
    expect(within(screen.getByTestId(`spell7-question-${q.id}`)).getByRole('radio', {name: f.answer})).toBeChecked()
   }
  }
  await user.click(jump('تسليم الاختبار والنتيجة'))
  expect(screen.queryByTestId('spell7-result')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', {name: 'تسليم الاختبار'}))
  expect(screen.getByTestId('spell7-result')).toHaveTextContent('20 من 20')
  await user.click(jump('حلول الاختبار المستقل'))
  expect(screen.queryByText(/الحلول مقفلة/)).not.toBeInTheDocument()
  expect(screen.getByText(testDefinition.pages[0].questions[0].explanation!)).toBeInTheDocument()
  await user.click(jump(testDefinition.pages[0].title))
  const q = testDefinition.pages[0].questions[0], f=q.fields[0]; if(f.kind!=='choice') throw Error('choice')
  await user.click(within(screen.getByTestId(`spell7-question-${q.id}`)).getByRole('radio', {name:f.options[1]}))
  await user.click(jump('حلول الاختبار المستقل'))
  expect(screen.getByText(/الحلول مقفلة/)).toBeInTheDocument()
  await user.click(jump('تسليم الاختبار والنتيجة'))
  await user.click(screen.getByRole('button', {name:'إعادة الاختبار المستقل'}))
  await user.click(jump(testDefinition.pages[0].title))
  expect(screen.getAllByRole('radio').every(input => !(input as HTMLInputElement).checked)).toBe(true)
  view.unmount()
  render(<LessonSpellingSeven />)
  await user.click(jump('حلول الاختبار المستقل'))
  expect(screen.getByText(/الحلول مقفلة/)).toBeInTheDocument()
 })
 it('requires attempts for seven model answers and preserves writing; protects teacher models', async () => {
  const user = userEvent.setup()
  render(<LessonSpellingSeven />)
  await user.click(jump('الاختبار الختامي التعليمي'))
  const reveal = screen.getByRole('button', {name:/كشف الإجابات النموذجية/})
  expect(reveal).toBeDisabled()
  for(const input of screen.getAllByRole('textbox')) await user.type(input, 'محاولة للتعليل')
  await user.click(jump('ملخص الدرس'))
  await user.click(jump('الاختبار الختامي التعليمي'))
  expect(screen.getAllByRole('textbox')[0]).toHaveValue('محاولة للتعليل')
  await user.click(screen.getByRole('button', {name:/كشف الإجابات النموذجية/}))
  expect(within(document.querySelector('.lesson-step') as HTMLElement).getByRole('status')).toHaveTextContent('بعد ألف مد')
  await user.click(jump('منطقة المعلم'))
  expect(screen.queryByText('نماذج المادة والأنشطة والواجب')).not.toBeInTheDocument()
  await user.type(screen.getByLabelText('كلمة المرور'), 'wrong')
  await user.click(screen.getByRole('button', {name:'دخول'}))
  expect(screen.getByRole('alert')).toBeInTheDocument()
  await user.clear(screen.getByLabelText('كلمة المرور'))
  await user.type(screen.getByLabelText('كلمة المرور'), COURSE_TEACHER_PASSWORD)
  await user.click(screen.getByRole('button', {name:'دخول'}))
  expect(screen.getByText('نماذج المادة والأنشطة والواجب')).toBeInTheDocument()
 })
})
