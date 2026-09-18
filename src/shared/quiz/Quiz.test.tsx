import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Quiz } from './Quiz'

const questions = [{
  id: 'q1',
  prompt: 'اختر الإجابة',
  options: [{ id: 'a', label: 'أ' }, { id: 'b', label: 'ب' }],
  correctOptionId: 'b',
  explanation: 'لأن ب هي الإجابة الصحيحة.',
}]

describe('Quiz', () => {
  it('waits for explicit checking, locks answers, reports score, and resets', async () => {
    const user = userEvent.setup()
    render(<Quiz questions={questions} />)

    expect(screen.queryByText('إجابة غير صحيحة')).not.toBeInTheDocument()
    const check = screen.getByRole('button', { name: 'تحقق من الإجابات' })
    expect(check).toBeDisabled()

    await user.click(screen.getByLabelText('أ'))
    expect(screen.queryByText('إجابة غير صحيحة')).not.toBeInTheDocument()
    expect(check).toBeEnabled()

    await user.click(check)
    expect(screen.getByText('إجابة غير صحيحة')).toBeInTheDocument()
    expect(screen.getByText(/0 \/ 1/)).toBeInTheDocument()
    expect(screen.getByLabelText('ب')).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'أعد المحاولة' }))
    expect(screen.queryByText('إجابة غير صحيحة')).not.toBeInTheDocument()
    expect(screen.getByLabelText('أ')).not.toBeChecked()
  })
})
