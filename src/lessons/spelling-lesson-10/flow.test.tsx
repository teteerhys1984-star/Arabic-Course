import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from '../../app/App'
import { LessonSpellingTen } from '../LessonSpellingTen'
import { COURSE_TEACHER_PASSWORD } from '../../shared/teacher/teacherPassword'
import { practice, quiz, sections, testDefinition } from './content'

function jump(title: string) {
  return within(screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' })).getByRole(
    'button',
    { name: (n) => n.includes(title) },
  )
}

beforeEach(() => {
  window.location.hash = '#/'
})

describe('spelling lesson 10 — interactive flow, tests, solutions, and teacher space', () => {
  it('opens from spelling section, has 22 steps and seven groups, and no broken eleventh route', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/sections/spelling'
    const { unmount } = render(<App />)

    const links = within(screen.getByRole('list', { name: 'دروس القسم' })).getAllByRole('link')
    expect(links).toHaveLength(10)
    await user.click(links[9])
    expect(window.location.hash).toBe('#/lesson/spelling-lesson-10')

    expect(document.querySelector('.spell10-lesson')).toHaveAttribute('dir', 'rtl')

    const outline = screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' })
    expect(within(outline).getAllByRole('button')).toHaveLength(22)
    expect(outline.querySelectorAll('.lesson-outline__group')).toHaveLength(7)

    await user.click(jump('أهداف الدرس'))
    expect(screen.getByText(sections[0].paragraphs[0])).toBeInTheDocument()

    await user.click(jump('اكتشف الفرق'))
    expect(screen.getByText(/استيقظَ أحمدُ مبكرًا/)).toBeInTheDocument()

    await user.click(jump('جدول المراجعة'))
    expect(screen.getByRole('table')).toBeInTheDocument()

    await user.click(jump('خلاصة الدرس'))
    expect(document.querySelector('.lesson-step')!.querySelector('a[href*="spelling-lesson-11"]')).toBeNull()

    unmount()
    window.location.hash = '#/lesson/spelling-lesson-11'
    render(<App />)
    expect(screen.getByRole('heading', { name: 'الدرس غير متاح' })).toBeInTheDocument()
  })

  it('runs keyboard-compatible practice and quiz with explanations only after checking', async () => {
    const user = userEvent.setup()
    render(<LessonSpellingTen />)

    // Practice test
    await user.click(jump('تدريب تفاعلي'))
    expect(screen.queryByText(practice[0].explanation)).not.toBeInTheDocument()
    for (const q of practice) {
      const radio = within(screen.getByTestId(`spell10-practice-${q.id}`)).getByRole('radio', {
        name: q.answer,
      })
      radio.focus()
      await user.keyboard(' ')
    }
    expect(screen.queryByText(practice[0].explanation)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    for (const q of practice) {
      expect(screen.getByTestId(`test-feedback-${q.id}`)).toHaveTextContent(q.explanation)
    }

    // Quiz test
    await user.click(jump('الاختبار الختامي التعليمي'))
    expect(screen.queryByText(quiz[0].explanation)).not.toBeInTheDocument()
    for (const q of quiz) {
      const radio = within(screen.getByTestId(`spell10-quiz-${q.id}`)).getByRole('radio', {
        name: q.answer,
      })
      radio.focus()
      await user.keyboard(' ')
    }
    expect(screen.queryByText(quiz[0].explanation)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    for (const q of quiz) {
      expect(screen.getByTestId(`test-feedback-${q.id}`)).toHaveTextContent(q.explanation)
    }

    // Solutions area remains locked for the independent test
    await user.click(jump('حلول الاختبارات'))
    expect(screen.queryByText(testDefinition.pages[0].questions[0].explanation!)).not.toBeInTheDocument()
  })

  it('checks four independent test pages, submits 20/20, invalidates edited page, recomputes 19/20, and resets', async () => {
    const user = userEvent.setup()
    render(<LessonSpellingTen />)

    await user.click(jump('تسليم الاختبار والنتيجة'))
    expect(screen.getByRole('button', { name: 'تسليم الاختبار' })).toBeDisabled()

    // Answer and check all 4 pages
    for (const [i, page] of testDefinition.pages.entries()) {
      await user.click(jump(`الصفحة ${i + 1}`))
      for (const q of page.questions) {
        const f = q.fields[0]
        if (f.kind !== 'choice') throw new Error('Expected choice')
        await user.click(
          within(screen.getByTestId(`spell10-question-${q.id}`)).getByRole('radio', { name: f.answer }),
        )
      }
      await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
      // Feedback not disclosed before submission
      expect(screen.queryByTestId(`test-page-summary-${page.id}`)).not.toBeInTheDocument()
      expect(screen.queryByTestId(`test-feedback-${page.questions[0].id}`)).not.toBeInTheDocument()
    }

    const first = testDefinition.pages[0].questions[0]
    await user.click(jump('حلول الاختبارات'))
    expect(screen.queryByText(first.explanation!)).not.toBeInTheDocument()

    // Submit test
    await user.click(jump('تسليم الاختبار والنتيجة'))
    expect(screen.queryByTestId('spell10-result')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار' }))
    expect(screen.getByTestId('spell10-result')).toHaveTextContent('20 من 20')

    // Solutions are now revealed
    await user.click(jump('حلول الاختبارات'))
    for (const page of testDefinition.pages) {
      for (const q of page.questions) {
        expect(screen.getByText(q.explanation!)).toBeInTheDocument()
      }
    }

    // Invalidate an answer on page 1
    await user.click(jump('الصفحة 1'))
    const f = first.fields[0]
    if (f.kind !== 'choice') throw new Error('Expected choice')
    const card = screen.getByTestId(`spell10-question-${first.id}`)
    expect(within(card).getByRole('radio', { name: f.answer })).toBeChecked()
    await user.click(
      within(card).getByRole('radio', { name: f.options.find((o) => o !== f.answer)! }),
    )

    // Solutions lock again
    await user.click(jump('حلول الاختبارات'))
    expect(screen.queryByText(first.explanation!)).not.toBeInTheDocument()

    // Recheck page 1 and submit again
    await user.click(jump('الصفحة 1'))
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    await user.click(jump('تسليم الاختبار والنتيجة'))
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار' }))
    expect(screen.getByTestId('spell10-result')).toHaveTextContent('19 من 20')

    // Reset test
    await user.click(screen.getByRole('button', { name: 'إعادة ضبط الاختبار' }))
    expect(screen.queryByTestId('spell10-result')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'تسليم الاختبار' })).toBeDisabled()
  })

  it('gates Teacher Space with somer173, displays guidance and models without repeating exam solutions', async () => {
    const user = userEvent.setup()
    render(<LessonSpellingTen />)

    await user.click(jump('منطقة المعلم'))
    expect(screen.queryByTestId('spell10-teacher')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('كلمة المرور'), COURSE_TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول' }))

    const teacherContent = screen.getByTestId('spell10-teacher')
    expect(teacherContent).toBeInTheDocument()
    expect(within(teacherContent).getByText(/دليل المعلم — همزة الوصل وهمزة القطع/)).toBeInTheDocument()

    for (const q of [...practice, ...quiz]) {
      expect(within(teacherContent).getByText(q.explanation)).toBeInTheDocument()
    }

    // Exam solutions must NOT be repeated inside teacher space
    expect(
      within(teacherContent).queryByText(testDefinition.pages[0].questions[0].explanation!),
    ).not.toBeInTheDocument()
  })
})
