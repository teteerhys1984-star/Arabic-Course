import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Quiz } from './Quiz'

const questions = [{
  id: 'q1',
  prompt: 'اختر الإجابة',
  options: [{ id: 'a', label: 'أ' }, { id: 'b', label: 'ب' }],
  correctOptionId: 'b',
  explanation: 'لأن ب هي الإجابة الصحيحة.',
}]

describe('Quiz', () => {
  it('checks the page without requiring all answers, reports the score, allows recheck and reset', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<Quiz questions={questions} onComplete={onComplete} />)

    // No feedback before checking.
    expect(screen.queryByText('إجابة غير صحيحة')).not.toBeInTheDocument()
    const check = screen.getByRole('button', { name: 'تحقّق من الإجابات' })
    expect(check).toBeEnabled() // unanswered questions do not block page-level checking

    await user.click(screen.getByLabelText('أ')) // wrong
    await user.click(check)
    expect(screen.getByText('إجابة غير صحيحة')).toBeInTheDocument()
    expect(screen.getByText(/0 \/ 1/)).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledWith(0, 1)

    // Answers stay editable after checking; editing invalidates the stored
    // result, and rechecking replaces it (never double-counted).
    expect(screen.getByLabelText('أ')).toBeEnabled()
    await user.click(screen.getByLabelText('ب')) // corrected → page result dropped
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(screen.getByText('إجابة صحيحة')).toBeInTheDocument()
    expect(screen.getByText(/1 \/ 1/)).toBeInTheDocument()
    expect(onComplete).toHaveBeenLastCalledWith(1, 1)

    // Restart clears answers and results.
    await user.click(screen.getByRole('button', { name: 'إعادة الاختبار' }))
    expect(screen.queryByText('إجابة صحيحة')).not.toBeInTheDocument()
    expect(screen.getByLabelText('أ')).not.toBeChecked()
  })

  it('reports unanswered questions as «لم تُجب» instead of blocking the check', async () => {
    const user = userEvent.setup()
    render(<Quiz questions={questions} />)
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(screen.getByText('لم تُجب')).toBeInTheDocument()
    expect(screen.getByText(/0 \/ 1/)).toBeInTheDocument()
  })
})
