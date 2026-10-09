import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { TestRunner } from './components/TestRunner'
import type { TestDefinition } from './types'

const test: TestDefinition = {
  id: 'runner-test',
  title: 'اختبار الدرس',
  description: 'اختبار من صفحتين — можно… can check each page separately.',
  pages: [
    {
      id: 'p1',
      title: 'الصفحة الأولى',
      questions: [
        {
          id: 'q1',
          number: 1,
          prompt: 'السؤال الأول',
          fields: [{ kind: 'choice', options: ['أ', 'ب'], answer: 'ب' }],
          solution: 'ب',
        },
      ],
    },
    {
      id: 'p2',
      title: 'الصفحة الثانية',
      questions: [
        {
          id: 'q2',
          number: 2,
          prompt: 'السؤال الثاني',
          fields: [{ kind: 'text', accept: ['كتب'] }],
          solution: 'كتب',
          explanation: 'لأن الجذر فَعَلَ.',
        },
      ],
    },
  ],
}

describe('TestRunner — multi-page tests', () => {
  it('lets the student check the current page without completing the remaining pages', async () => {
    const user = userEvent.setup()
    render(<TestRunner test={test} />)

    // Page 1 of 2 is shown; the final result is not exposed yet.
    expect(screen.getByTestId('test-page-p1')).toBeInTheDocument()
    expect(screen.queryByTestId('test-page-p2')).not.toBeInTheDocument()
    expect(screen.queryByTestId('test-final-result')).not.toBeInTheDocument()

    await user.click(screen.getByLabelText('ب'))
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(screen.getByTestId('test-page-summary-p1')).toBeInTheDocument()

    // Navigate to page 2 — the answer to page 1 is preserved.
    await user.click(screen.getByRole('button', { name: /الصفحة بعدها/ }))
    expect(screen.getByTestId('test-page-p2')).toBeInTheDocument()
    expect((screen.getByLabelText(/السؤال الثاني/) as HTMLInputElement).value).toBe('')

    // Go back: the preserved answer is still selected.
    await user.click(screen.getByRole('button', { name: /الصفحة قبلها/ }))
    expect(screen.getByLabelText('ب')).toBeChecked()
  })

  it('combines the latest valid page results into the final result only when all pages are checked', async () => {
    const user = userEvent.setup()
    render(<TestRunner test={test} />)

    await user.click(screen.getByLabelText('ب'))
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(screen.queryByTestId('test-final-result')).not.toBeInTheDocument()
    expect(screen.getByText(/تم التحقق من/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /الصفحة بعدها/ }))
    await user.type(screen.getByLabelText(/السؤال الثاني/), 'كتب')
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))

    const final = screen.getByTestId('test-final-result')
    expect(within(final).getByText(/2 \/ 2/)).toBeInTheDocument()
    expect(within(final).getByText(/إجابات صحيحة:/)).toBeInTheDocument()
  })

  it('rechecking a page after edits replaces its result in the final aggregation', async () => {
    const user = userEvent.setup()
    render(<TestRunner test={test} />)

    // Page 1: answer wrongly, check, then fix and recheck.
    await user.click(screen.getByLabelText('أ'))
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    await user.click(screen.getByLabelText('ب')) // edit → page result invalidated
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' })) // recheck

    // Page 2: answer and check.
    await user.click(screen.getByRole('button', { name: /الصفحة بعدها/ }))
    await user.type(screen.getByLabelText(/السؤال الثاني/), 'ف ت ح') // wrong (accept is «كتب»)
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))

    const final = screen.getByTestId('test-final-result')
    expect(within(final).getByText(/1 \/ 2/)).toBeInTheDocument() // latest results only
  })

  it('offers a restart that clears answers and page results', async () => {
    const user = userEvent.setup()
    render(<TestRunner test={test} />)
    await user.click(screen.getByLabelText('ب'))
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    await user.click(screen.getByRole('button', { name: /الصفحة بعدها/ }))
    await user.type(screen.getByLabelText(/السؤال الثاني/), 'كتب')
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))

    await user.click(screen.getByRole('button', { name: 'إعادة الاختبار' }))
    expect(screen.queryByTestId('test-final-result')).not.toBeInTheDocument()
    // The runner stays on the current page; its answers are cleared.
    expect((screen.getByLabelText(/السؤال الثاني/) as HTMLInputElement).value).toBe('')
    // And page 1's answer is gone too.
    await user.click(screen.getByRole('button', { name: /الصفحة قبلها/ }))
    expect(screen.getByLabelText('ب')).not.toBeChecked()
  })
})
