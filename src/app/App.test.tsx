import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { App } from './App'

function goToLesson(id = 'lesson-1') {
  window.location.hash = `#/lesson/${id}`
}

beforeEach(() => {
  window.location.hash = ''
})

afterEach(() => {
  window.location.hash = ''
})

describe('Course index (homepage / lesson hub)', () => {
  it('shows a lesson index with lesson titles, not full lesson content', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'دورة أساسيات اللغة العربية' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'الاسم والفعل والحرف', level: 3 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ابدأ الدرس/ })).toBeInTheDocument()
    expect(screen.getByText('المهندس سومر شاهين: 0930215022')).toBeInTheDocument()

    // The index must not embed the full lesson content.
    expect(screen.queryByTestId('official-test')).not.toBeInTheDocument()
    expect(screen.queryByText('لعبة المحقق اللغوي')).not.toBeInTheDocument()
  })
})

describe('Lesson 1 as a sequential, one-step-at-a-time flow', () => {
  it('starts on step 1 of 19 and shows only the current step content', () => {
    goToLesson()
    render(<App />)

    expect(screen.getByRole('heading', { name: 'مقدمة / ابدأ رحلتك', level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 1 من 19')

    // Later-step content must not be present until the student navigates there.
    expect(screen.queryByTestId('official-test')).not.toBeInTheDocument()
    expect(screen.queryByText('لعبة المحقق اللغوي')).not.toBeInTheDocument()

    // Previous is disabled on the first step.
    expect(screen.getByRole('button', { name: /السابق/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /التالي/ })).toBeEnabled()
  })

  it('moves forward and backward through steps with السابق / التالي and tracks progress', async () => {
    goToLesson()
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 1 من 19')

    await user.click(screen.getByRole('button', { name: /التالي/ }))
    expect(screen.getByRole('heading', { name: 'الهدف من الدرس', level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 2 من 19')
    expect(screen.getByRole('button', { name: /السابق/ })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: /السابق/ }))
    expect(screen.getByRole('heading', { name: 'مقدمة / ابدأ رحلتك', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /السابق/ })).toBeDisabled()
  })

  it('has no scroll-anchor section navigation and no continuous long document', () => {
    goToLesson()
    render(<App />)

    expect(screen.queryByRole('navigation', { name: 'أقسام الدرس' })).not.toBeInTheDocument()
    expect(document.querySelector('.section-nav')).toBeNull()
    // Only one step's heading is rendered at a time.
    expect(screen.queryByRole('heading', { name: 'اختبار نهاية الدرس' })).not.toBeInTheDocument()
  })

  it('shows the plain-text instructor credit without contact presentation', () => {
    goToLesson()
    render(<App />)

    expect(screen.getAllByText('المهندس سومر شاهين: 0930215022')).toHaveLength(1)
    expect(screen.queryByText('تواصل عبر واتساب')).not.toBeInTheDocument()
    expect(
      screen.queryByText('للاستفسار أو متابعة الدرس، تواصل عبر الرقم التالي.'),
    ).not.toBeInTheDocument()
    expect(document.querySelector('.whatsapp-card')).toBeNull()
    expect(document.querySelector('a[href*="0930215022"], button[data-contact]')).toBeNull()
  })

  it('supports source-based interactive activities on their own steps', async () => {
    goToLesson()
    const user = userEvent.setup()
    render(<App />)

    // Step 6: noun signs.
    for (let step = 0; step < 5; step += 1) {
      await user.click(screen.getByRole('button', { name: /التالي/ }))
    }
    expect(screen.getByRole('heading', { name: 'علامات الاسم', level: 2 })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /دخول \(الـ\) التعريف/ }))
    expect(screen.getByText('كتاب ← الكتاب.')).toBeInTheDocument()

    // Step 9: الفعل المضارع (أحرف المضارعة activity).
    await user.click(screen.getByRole('button', { name: /التالي/ }))
    await user.click(screen.getByRole('button', { name: /التالي/ }))
    await user.click(screen.getByRole('button', { name: /التالي/ }))
    expect(screen.getByRole('heading', { name: 'الفعل المضارع', level: 2 })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^أ$/ }))
    expect(document.querySelector('.ayn-result')).toHaveTextContent('أكتب')
  })

  it('exposes exactly 20 official questions once the student reaches the test step', async () => {
    goToLesson()
    const user = userEvent.setup()
    render(<App />)

    for (let step = 0; step < 16; step += 1) {
      await user.click(screen.getByRole('button', { name: /التالي/ }))
    }
    expect(screen.getByRole('heading', { name: 'اختبار نهاية الدرس', level: 2 })).toBeInTheDocument()
    const officialTest = screen.getByTestId('official-test')
    expect(officialTest.querySelectorAll('.official-question')).toHaveLength(20)
    expect(within(officialTest).getByText(/أجب عن الأسئلة العشرين كلها/)).toBeInTheDocument()
  })

  it('does not reveal correctness on selection, only after CHECK, and preserves answers when navigating away and back', async () => {
    goToLesson()
    const user = userEvent.setup()
    render(<App />)

    for (let step = 0; step < 16; step += 1) {
      await user.click(screen.getByRole('button', { name: /التالي/ }))
    }
    const officialTest = screen.getByTestId('official-test')
    const firstQuestion = officialTest.querySelector('.official-question')
    expect(firstQuestion).not.toBeNull()

    // Selecting an option must not reveal correctness by itself.
    const options = within(firstQuestion as HTMLElement).getAllByRole('radio')
    await user.click(options[1])
    expect(within(firstQuestion as HTMLElement).queryByText('إجابة صحيحة.')).not.toBeInTheDocument()
    expect(options[1]).toBeChecked()

    // Navigate away (Previous) and back (Next): the selection must be preserved.
    await user.click(screen.getByRole('button', { name: /السابق/ }))
    expect(screen.getByRole('heading', { name: 'المراجعة: ملخص الدرس للحفظ', level: 2 })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /التالي/ }))
    const testAgain = screen.getByTestId('official-test')
    const firstQuestionAgain = testAgain.querySelector('.official-question')
    const optionsAgain = within(firstQuestionAgain as HTMLElement).getAllByRole('radio')
    expect(optionsAgain[1]).toBeChecked()
  })

  it('keeps complete teacher material behind the teacher gate on its own step', async () => {
    goToLesson()
    const user = userEvent.setup()
    render(<App />)

    for (let step = 0; step < 17; step += 1) {
      await user.click(screen.getByRole('button', { name: /التالي/ }))
    }
    expect(screen.getByRole('heading', { name: 'منطقة المعلم', level: 2 })).toBeInTheDocument()
    expect(screen.queryByText('الإجابات النموذجية')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^دخول$/ }))
    expect(screen.getByText('كلمة المرور غير صحيحة.')).toBeInTheDocument()

    await user.type(screen.getByLabelText('كلمة المرور'), 'معلم')
    await user.click(screen.getByRole('button', { name: 'دخول' }))

    expect(screen.getByText('الإجابات النموذجية')).toBeInTheDocument()
    expect(screen.getByText('تصحيح السؤال 8')).toBeInTheDocument()
    expect(screen.getByText('تصحيح السؤال 10')).toBeInTheDocument()
    expect(screen.getByText('الأخطاء المتوقعة عند الطالب')).toBeInTheDocument()
    expect(screen.getByText('معيار إتقان الدرس')).toBeInTheDocument()
  })

  it('shows إتمام الدرس on the final step', async () => {
    goToLesson()
    const user = userEvent.setup()
    render(<App />)

    for (let step = 0; step < 18; step += 1) {
      await user.click(screen.getByRole('button', { name: /التالي|إتمام الدرس/ }))
    }
    expect(screen.getByRole('heading', { name: 'الخلاصة', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'إتمام الدرس' })).toBeInTheDocument()
  })
})
