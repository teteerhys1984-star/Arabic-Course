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

    // The index must not embed the full lesson content.
    expect(screen.queryByTestId('official-test')).not.toBeInTheDocument()
    expect(screen.queryByText('لعبة المحقق اللغوي')).not.toBeInTheDocument()
  })
})

describe('Lesson 1 as one continuous long page', () => {
  it('renders the authoritative lesson and exactly 20 official questions', () => {
    goToLesson()
    render(<App />)

    expect(screen.getByRole('heading', { name: 'الاسم والفعل والحرف', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('ذهبَ الطالبُ إلى المدرسةِ.')).toBeInTheDocument()
    expect(screen.getByText('في المدرسةِ...')).toBeInTheDocument()
    expect(screen.getAllByText('أنيت')).toHaveLength(2)
    expect(screen.getByLabelText('أحرف المضارعة: أ ن ي ت')).toBeInTheDocument()

    const officialTest = screen.getByTestId('official-test')
    expect(officialTest.querySelectorAll('.official-question')).toHaveLength(20)
    expect(within(officialTest).getByText(/أجب عن الأسئلة العشرين كلها/)).toBeInTheDocument()
  })

  it('exposes a scroll-anchor section navigation (anchors, not tabs)', () => {
    goToLesson()
    render(<App />)

    const sectionNav = screen.getByRole('navigation', { name: 'أقسام الدرس' })
    const links = within(sectionNav).getAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(7)
    // Anchors reference in-page section ids, never separate routes.
    for (const link of links) {
      expect(link.getAttribute('href')).toMatch(/^#[a-z-]+$/)
    }
    // The whole lesson body stays present regardless of the active anchor.
    expect(screen.getByTestId('official-test')).toBeInTheDocument()
    expect(screen.getByText('لعبة المحقق اللغوي')).toBeInTheDocument()
  })

  it('has no WhatsApp/contact presentation anywhere', () => {
    goToLesson()
    render(<App />)

    expect(screen.queryByText('تواصل عبر واتساب')).not.toBeInTheDocument()
    expect(
      screen.queryByText('للاستفسار أو متابعة الدرس، تواصل عبر الرقم التالي.'),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('0930215022')).not.toBeInTheDocument()
    expect(document.querySelector('.whatsapp-card')).toBeNull()
  })

  it('supports source-based interactive activities', async () => {
    goToLesson()
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

  it('keeps complete teacher material behind the teacher gate on the same page', async () => {
    goToLesson()
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
