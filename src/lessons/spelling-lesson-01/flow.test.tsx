import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from '../../app/App'

function openStep(name: string) {
 return within(screen.getByRole('complementary', {name:'فهرس الدرس الجانبي'})).getByRole('button',{name:new RegExp(name)})
}
describe('spelling lesson interactive flow', () => {
 it('links the section, keeps activity feedback gated and preserves test answers across steps', async () => {
  const user=userEvent.setup()
  window.location.hash='#/sections/spelling'
  const view=render(<App />)
  expect(screen.getByRole('link',{name:'مدخل إلى الإملاء العربي — الحروف والحركات والصوت والكتابة'})).toHaveAttribute('href','#/lesson/spelling-lesson-01')
  view.unmount()
  window.location.hash='#/lesson/spelling-lesson-01'
  render(<App />)
  await user.click(openStep('النشاط الأول'))
  expect(screen.queryByText(/صحيح: حرف مد/)).not.toBeInTheDocument()
  await user.click(screen.getByRole('button',{name:'تحقّق من النشاط'}))
  expect(screen.getAllByText(/راجع الإجابة/).length).toBeGreaterThan(0)
  await user.click(openStep('اختبار نهاية الدرس'))
  expect(screen.getByTestId('test-page-spelling-choice')).toBeInTheDocument()
  expect(screen.queryByText('الإجابة الصحيحة')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button',{name:'تحقّق من الإجابات'}))
  expect(screen.getByTestId('test-page-summary-spelling-choice')).toBeInTheDocument()
  await user.click(openStep('حلول الاختبار'))
  expect(screen.getAllByText(/تحقّق من هذه الصفحة أولًا/).length).toBeGreaterThan(0)
  await user.click(openStep('منطقة خاصة بالمعلم'))
  expect(screen.getByLabelText('كلمة المرور')).toBeInTheDocument()
  await user.type(screen.getByLabelText('كلمة المرور'),'somer173')
  await user.click(screen.getByRole('button',{name:'دخول'}))
  expect(screen.getByText('ثانيًا: ملاحظات تصحيحية متقدمة')).toBeInTheDocument()
 })
})
