import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { TeacherSpace } from './TeacherSpace'

describe('TeacherSpace', () => {
  it('labels its gate as front-end only and unlocks with the configured password', async () => {
    const user = userEvent.setup()
    render(<TeacherSpace password="test"><p>محتوى المعلم</p></TeacherSpace>)

    expect(screen.getByText(/ليست مصادقة آمنة/)).toBeInTheDocument()
    expect(screen.queryByText('محتوى المعلم')).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('كلمة المرور'), 'test')
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByText('محتوى المعلم')).toBeInTheDocument()
  })

  it('defaults every current and future teacher area to the unified somer173 password and still rejects wrong ones', async () => {
    const user = userEvent.setup()
    render(<TeacherSpace><p>محتوى المعلم</p></TeacherSpace>)

    await user.type(screen.getByLabelText('كلمة المرور'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByText('كلمة المرور غير صحيحة.')).toBeInTheDocument()
    expect(screen.queryByText('محتوى المعلم')).not.toBeInTheDocument()

    await user.clear(screen.getByLabelText('كلمة المرور'))
    await user.type(screen.getByLabelText('كلمة المرور'), 'somer173')
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByText('محتوى المعلم')).toBeInTheDocument()
  })
})
