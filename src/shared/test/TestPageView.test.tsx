import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { TestPageView } from './components/TestPageView'
import { useTestEngine } from './useTestEngine'
import type { TestDefinition, TestPage } from './types'

const page: TestPage = {
  id: 'page-1',
  title: 'الصفحة الأولى: اختر الإجابة',
  questions: [
    {
      id: 'q1',
      number: 1,
      prompt: 'الكلمة التي تدل على إنسان هي:',
      fields: [{ kind: 'choice', options: ['يكتب', 'معلم', 'في'], answer: 'معلم' }],
      explanation: 'المعلم اسم يدل على إنسان.',
    },
    {
      id: 'q2',
      number: 2,
      prompt: 'علّل إجابتك:',
      fields: [{ kind: 'essay', label: 'التعليل' }],
    },
  ],
}

const test: TestDefinition = { id: 'lesson-x', title: 'اختبار نهاية الدرس', pages: [page] }

function Harness() {
  const engine = useTestEngine(test)
  return <TestPageView page={page} engine={engine} />
}

describe('TestPageView — page-level checking', () => {
  it('renders the «تحقّق من الإجابات» action at the end of the page', () => {
    render(<Harness />)
    expect(screen.getByRole('button', { name: 'تحقّق من الإجابات' })).toBeInTheDocument()
  })

  it('does not require all questions to be answered before checking', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const check = screen.getByRole('button', { name: 'تحقّق من الإجابات' })
    expect(check).toBeEnabled() // q2 (essay) is empty — checking must still be possible
    await user.click(check)
    expect(screen.getByTestId('test-page-summary-page-1')).toBeInTheDocument()
  })

  it('distinguishes correct, wrong, unanswered and manual answers after checking', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByLabelText('معلم')) // correct
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))

    const summary = screen.getByTestId('test-page-summary-page-1')
    expect(summary).toHaveTextContent('1 صحيحة')
    expect(summary).toHaveTextContent('0 غير صحيحة')
    expect(summary).toHaveTextContent('1 لم تُجب')
    expect(screen.getByText('إجابة صحيحة')).toBeInTheDocument()
    expect(screen.getByText('لم تُجب')).toBeInTheDocument() // q2 essay, unanswered
  })

  it('flags essay answers for manual review instead of grading them', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByLabelText('يكتب')) // wrong
    await user.type(screen.getByLabelText(/التعليل/), 'لأن المعلم اسم') // essay answer
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))

    expect(screen.getByText('إجابة غير صحيحة')).toBeInTheDocument()
    expect(screen.getByText('الإجابة الصحيحة:')).toBeInTheDocument()
    expect(screen.getAllByText('يُراجع يدويًا').length).toBeGreaterThan(0)
    expect(screen.getByText('تم تسجيل إجابتك للمراجعة مع المعلم.')).toBeInTheDocument()
  })

  it('allows editing and rechecking without double-counting', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByLabelText('يكتب')) // wrong
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(screen.getByTestId('test-page-summary-page-1')).toHaveTextContent('0 صحيحة')

    // Edit the answer → the stale page result is dropped, feedback hidden.
    await user.click(screen.getByLabelText('معلم'))
    expect(screen.queryByTestId('test-page-summary-page-1')).not.toBeInTheDocument()

    // Recheck → fresh result, counted once.
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(screen.getByTestId('test-page-summary-page-1')).toHaveTextContent('1 صحيحة')
    expect(screen.getByText('إجابة صحيحة')).toBeInTheDocument()
  })

  it('never disables the inputs after checking (recheck after edits is possible)', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByLabelText('معلم'))
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(screen.getByLabelText('يكتب')).toBeEnabled()
    expect(screen.getByLabelText('معلم')).toBeEnabled()
  })
})
