import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from '../../app/App'
import { COURSE_TEACHER_PASSWORD } from '../../shared/teacher/teacherPassword'
import { LessonSpellingEight } from '../LessonSpellingEight'
import { educationalQuizQuestions, interactivePracticeQuestions, testDefinition } from './content'

function jumpToStep(titleSubstring: string): HTMLElement {
  const outline = screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' })
  return within(outline).getByRole('button', { name: (name) => name.includes(titleSubstring) })
}

beforeEach(() => {
  window.location.hash = '#/'
})

describe('spelling lesson 08 — interactive flow, independent test, solutions, and teacher space', () => {
  it('opens from the spelling section after lesson 7, renders RTL steps, and opens registered lesson 9 route', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/sections/spelling'
    const { unmount } = render(<App />)

    const links = within(screen.getByRole('list', { name: 'دروس القسم' })).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '#/lesson/spelling-lesson-01',
      '#/lesson/spelling-lesson-02',
      '#/lesson/spelling-lesson-03',
      '#/lesson/spelling-lesson-04',
      '#/lesson/spelling-lesson-05',
      '#/lesson/spelling-lesson-06',
      '#/lesson/spelling-lesson-07',
      '#/lesson/spelling-lesson-08',
      '#/lesson/spelling-lesson-09',
      '#/lesson/spelling-lesson-10',
      '#/lesson/spelling-lesson-11',
      '#/lesson/spelling-lesson-12',
      '#/lesson/spelling-lesson-13',
    ])

    await user.click(links[7])
    expect(window.location.hash).toBe('#/lesson/spelling-lesson-08')
    expect(document.querySelector('.spell8-lesson')).toHaveAttribute('dir', 'rtl')
    expect(
      screen.getByRole('heading', { name: /أولًا: أهداف الدرس والمدخل/, level: 2 }),
    ).toBeInTheDocument()

    // Check next lesson preview has no broken link
    await user.click(jumpToStep('خلاصة الدرس والدرس التالي'))
    const preview = screen.getByTestId('spell8-next-lesson-preview')
    expect(preview).toHaveTextContent('الألف الفارقة بعد واو الجماعة')
    expect(within(preview).queryAllByRole('link')).toHaveLength(0)
    unmount()

    window.location.hash = '#/lesson/spelling-lesson-09'
    render(<App />)
    expect(document.querySelector('.spell9-lesson')).toHaveAttribute('dir', 'rtl')
  })

  it('runs the 8-question interactive practice, hides answers until checked, shows completed word, and preserves state across steps', async () => {
    const user = userEvent.setup()
    render(<LessonSpellingEight />)

    await user.click(jumpToStep('تدريب تفاعلي'))
    const firstQ = interactivePracticeQuestions[0]
    const card = screen.getByTestId(`spell8-practice-${firstQ.id}`)

    // Answer is not revealed before clicking check
    expect(screen.queryByTestId(`spell8-practice-feedback-${firstQ.id}`)).not.toBeInTheDocument()

    const radio = within(card).getByRole('radio', { name: 'ة' })
    radio.focus()
    await user.keyboard(' ')
    expect(radio).toBeChecked()
    expect(screen.queryByTestId(`spell8-practice-feedback-${firstQ.id}`)).not.toBeInTheDocument()

    await user.click(within(card).getByRole('button', { name: 'تحقّق من الإجابة' }))
    const feedback = screen.getByTestId(`spell8-practice-feedback-${firstQ.id}`)
    expect(feedback).toHaveTextContent('إجابة صحيحة')
    expect(feedback).toHaveTextContent('المدرسة')

    // Navigate forward and back to verify state persistence
    await user.click(screen.getByRole('button', { name: 'التالي' }))
    await user.click(screen.getByRole('button', { name: 'السابق' }))
    expect(
      within(screen.getByTestId(`spell8-practice-${firstQ.id}`)).getByRole('radio', { name: 'ة' }),
    ).toBeChecked()
    expect(screen.getByTestId(`spell8-practice-feedback-${firstQ.id}`)).toHaveTextContent('المدرسة')
  })

  it('runs the 10-question educational quiz and the 3-part homework with flexible creation check and self-review models', async () => {
    const user = userEvent.setup()
    render(<LessonSpellingEight />)

    await user.click(jumpToStep('اختبار ختامي'))
    const q9 = educationalQuizQuestions[8]
    const card9 = screen.getByTestId(`spell8-eduquiz-${q9.id}`)
    await user.click(within(card9).getByRole('radio', { name: 'شرحتْ' }))
    expect(screen.queryByTestId(`spell8-eduquiz-feedback-${q9.id}`)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'تصحيح الاختبار وإظهار الحلول' }))
    expect(screen.getByTestId(`spell8-eduquiz-feedback-${q9.id}`)).toHaveTextContent('شرحتْ')
    expect(screen.getByTestId('spell8-eduquiz-summary')).toBeInTheDocument()

    // Homework step
    await user.click(jumpToStep('الواجب المنزلي'))
    expect(screen.queryByTestId('spell8-hw-models')).not.toBeInTheDocument()

    // Section 3: multiple valid learner-created sentences accepted
    const sec3 = screen.getByTestId('spell8-hw-section-3')
    const textareas = within(sec3).getAllByRole('textbox')
    await user.type(textareas[0], 'زرعتُ شجرةً مثمرةً.')
    await user.type(textareas[1], 'سمعتُ صوتَ البلبلِ.')
    await user.click(within(sec3).getByRole('button', { name: 'تحقّق من جملتي الإنشاء' }))
    expect(screen.getByTestId('spell8-hw-creation-feedback')).toHaveTextContent('أحسنت')

    // Self-review model answers toggle
    await user.click(screen.getByRole('button', { name: 'إظهار الإجابات النموذجية' }))
    expect(screen.getByTestId('spell8-hw-models')).toHaveTextContent('ذهبتِ البنتُ إلى المدرسةِ.')
  })

  it('preserves all 20 independent test answers across pages, gates score and solutions until submit, invalidates on edit, and separates Teacher Space', async () => {
    const user = userEvent.setup()
    render(<LessonSpellingEight />)

    for (let i = 0; i < testDefinition.pages.length; i++) {
      const page = testDefinition.pages[i]
      await user.click(jumpToStep(`اختبار: صفحة ${i + 1}`))
      for (const q of page.questions) {
        const field = q.fields[0]
        if (field.kind !== 'choice') throw new Error('Expected choice')
        const qBox = screen.getByTestId(`spell8-question-${q.id}`)
        await user.click(within(qBox).getByRole('radio', { name: field.answer }))
      }
      await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
      // No premature score or feedback before final submit
      expect(screen.queryByTestId(`test-page-summary-${page.id}`)).not.toBeInTheDocument()
      expect(screen.queryByTestId(`test-feedback-${page.questions[0].id}`)).not.toBeInTheDocument()
    }

    // Solutions still locked before submit
    await user.click(jumpToStep('حلول الاختبارات'))
    expect(screen.getByTestId('spell8-solutions-locked')).toBeInTheDocument()

    // Verify answers survived navigation back to Page 1
    await user.click(jumpToStep('اختبار: صفحة 1'))
    const firstQ = testDefinition.pages[0].questions[0]
    const firstField = firstQ.fields[0]
    if (firstField.kind !== 'choice') throw new Error('Expected choice')
    expect(
      within(screen.getByTestId(`spell8-question-${firstQ.id}`)).getByRole('radio', {
        name: firstField.answer,
      }),
    ).toBeChecked()

    // Submit the test
    await user.click(jumpToStep('تسليم الاختبار'))
    expect(screen.queryByTestId('spell8-result')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار' }))
    expect(screen.getByTestId('spell8-result')).toHaveTextContent('النتيجة: 20 من 20')

    // Solutions now unlocked in the independent Solutions Area
    await user.click(jumpToStep('حلول الاختبارات'))
    expect(screen.queryByTestId('spell8-solutions-locked')).not.toBeInTheDocument()
    expect(screen.getByText(firstQ.explanation!)).toBeInTheDocument()

    // Editing an answer after submit invalidates the previous result and relocks solutions
    await user.click(jumpToStep('اختبار: صفحة 1'))
    await user.click(
      within(screen.getByTestId(`spell8-question-${firstQ.id}`)).getByRole('radio', {
        name: firstField.options[1],
      }),
    )
    await user.click(jumpToStep('حلول الاختبارات'))
    expect(screen.getByTestId('spell8-solutions-locked')).toBeInTheDocument()

    // Re-submitting calculates latest valid answers without double-counting (19 of 20)
    await user.click(jumpToStep('تسليم الاختبار'))
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار' }))
    expect(screen.getByTestId('spell8-result')).toHaveTextContent('النتيجة: 19 من 20')

    // Teacher Space is password-protected and independent from Solutions Area
    await user.click(jumpToStep('منطقة المعلم'))
    expect(screen.queryByTestId('spell8-teacher-content')).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('كلمة المرور'), COURSE_TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByTestId('spell8-teacher-content')).toBeInTheDocument()
    expect(
      screen.getByText(/دليل المعلم — الدرس الثامن: التاء المربوطة والتاء المفتوحة والهاء/),
    ).toBeInTheDocument()
  })
})
