import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from '../../app/App'

function openStep(name: string) {
  return within(screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' })).getByRole(
    'button',
    { name: new RegExp(name) },
  )
}

describe('Spelling Lesson 02 — Interactive Flow & Navigation', () => {
  it('links the lesson from spelling section and preserves test answers across navigation', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/sections/spelling'
    const view = render(<App />)

    expect(screen.getByRole('link', { name: 'همزة الوصل وهمزة القطع' })).toHaveAttribute(
      'href',
      '#/lesson/spelling-lesson-02',
    )
    view.unmount()

    window.location.hash = '#/lesson/spelling-lesson-02'
    render(<App />)

    // Activity Step
    await user.click(openStep('التدريبات التطبيقية'))
    expect(screen.getByText('النشاط الأول: صنّف الكلمات إلى همزة وصل أو همزة قطع')).toBeInTheDocument()

    // Test Step
    await user.click(openStep('اختبار نهاية الدرس'))
    expect(screen.getByTestId('test-page-spelling-02-classify')).toBeInTheDocument()

    // Check page action
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(screen.getByTestId('test-page-summary-spelling-02-classify')).toBeInTheDocument()

    // Solutions Step
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByText('القسم الأول: التصنيف (١٠ درجات — درجة لكل بند)')).toBeInTheDocument()

    // Teacher Space
    await user.click(openStep('منطقة خاصة بالمعلم'))
    expect(screen.getByLabelText('كلمة المرور')).toBeInTheDocument()
    await user.type(screen.getByLabelText('كلمة المرور'), 'somer173')
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByText('ثالثاً: ملاحظات المعلم والتوجيهات التصحيحية')).toBeInTheDocument()
  })
})
