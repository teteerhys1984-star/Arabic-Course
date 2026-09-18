import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('Arabic Course Lesson 1', () => {
  it('renders the authoritative lesson, contact links, and exactly 20 official questions', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'أقسام الكلام' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'الاسم والفعل والحرف' })).toBeInTheDocument()
    expect(screen.getByText('ذهبَ الطالبُ إلى المدرسةِ.')).toBeInTheDocument()
    expect(screen.getByText('في المدرسةِ...')).toBeInTheDocument()
    expect(screen.getAllByText('أنيت')).toHaveLength(2)
    expect(screen.getByLabelText('أحرف المضارعة: أ ن ي ت')).toBeInTheDocument()
    expect(screen.getAllByText('0930215022')).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: 'فتح واتساب على الرقم 0930215022' })).toHaveLength(2)

    const officialTest = screen.getByTestId('official-test')
    expect(officialTest.querySelectorAll('.official-question')).toHaveLength(20)
    expect(within(officialTest).getByText(/أجب عن الأسئلة العشرين كلها/)).toBeInTheDocument()
  })

  it('supports source-based interactive activities', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /^دخول$/ }))
    expect(screen.getByText('كلمة المرور غير صحيحة.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /دخول \(الـ\) التعريف/ }))
    expect(screen.getByText('كتاب ← الكتاب.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^أ$/ }))
    expect(document.querySelector('.ayn-result')).toHaveTextContent('أكتب')

    await user.click(screen.getAllByRole('button', { name: /^حرف$/ })[0])
    expect(screen.getByText('الصحيح: اسم')).toBeInTheDocument()
  })

  it('keeps complete teacher material behind the teacher gate', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.queryByText('الإجابات النموذجية')).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('كلمة المرور'), 'معلم')
    await user.click(screen.getByRole('button', { name: 'دخول' }))

    expect(screen.getByText('الإجابات النموذجية')).toBeInTheDocument()
    expect(screen.getByText('تصحيح السؤال 8')).toBeInTheDocument()
    expect(screen.getByText('تصحيح السؤال 10')).toBeInTheDocument()
    expect(screen.getByText('الأخطاء المتوقعة عند الطالب')).toBeInTheDocument()
    expect(screen.getByText('معيار إتقان الدرس')).toBeInTheDocument()
  })
})
