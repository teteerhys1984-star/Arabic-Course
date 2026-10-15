import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from '../../app/App'
import { COURSE_TEACHER_PASSWORD } from '../../shared/teacher/teacherPassword'
import * as C from './content'

type User = ReturnType<typeof userEvent.setup>
const activeStep = () => document.querySelector('.lesson-step') as HTMLElement
const sidebar = () => within(screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' }))
const openStep = (title: string) => sidebar().getByRole('button', { name: (name) => String(name).includes(title) })

function openLesson() {
  window.location.hash = '#/lesson/spelling-lesson-06'
  return render(<App />)
}

async function answerExamPage(user: User, pageIndex: number) {
  const page = C.testDefinition.pages[pageIndex]
  await user.click(openStep(page.title))
  for (const question of page.questions) {
    const field = question.fields[0]
    if (field.kind !== 'choice') throw new Error('The independent spelling test must use keyed choices.')
    const questionView = screen.getByTestId(`spell6-question-${question.id}`)
    await user.click(within(questionView).getByRole('radio', { name: field.answer }))
  }
}

beforeEach(() => {
  window.location.hash = '#/'
})

describe('spelling lesson 6 — registration and lesson flow', () => {
  it('appears immediately after spelling lesson 5 and opens as an RTL sequential lesson', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/sections/spelling'
    render(<App />)
    const links = within(screen.getByRole('list', { name: 'دروس القسم' })).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '#/lesson/spelling-lesson-01', '#/lesson/spelling-lesson-02', '#/lesson/spelling-lesson-03',
      '#/lesson/spelling-lesson-04', '#/lesson/spelling-lesson-05', '#/lesson/spelling-lesson-06', '#/lesson/spelling-lesson-07', '#/lesson/spelling-lesson-08', '#/lesson/spelling-lesson-09', '#/lesson/spelling-lesson-10',
    ])
    await user.click(links[5])
    expect(await screen.findByRole('heading', { name: 'رحلة إلى كرسي الهمزة!', level: 2 })).toBeInTheDocument()
    expect(window.location.hash).toBe('#/lesson/spelling-lesson-06')
    expect(document.querySelector('.lesson-page')).toHaveAttribute('dir', 'rtl')
    expect(document.querySelectorAll('.lesson-step')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'السابق' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'التالي' })).toBeEnabled()
  })

  it('keeps warmup and activity answers across step navigation; reset clears only its own activity', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('التمهيد: أين تقع الهمزة؟'))
    const middle = screen.getByTestId('spell6-position-position-middle')
    const answer = within(middle).getByRole('radio', { name: 'متوسطة' })
    answer.focus()
    await user.keyboard(' ')
    expect(answer).toBeChecked()
    const checkPosition = within(middle).getByRole('button', { name: 'تحقّق من الموضع' })
    checkPosition.focus()
    await user.keyboard('{Enter}')
    expect(within(middle).getByTestId('spell6-feedback-position-middle')).toHaveTextContent('الهمزة بين السين واللام')

    await user.click(openStep('السرّ الأساسي: ترتيب الحركات'))
    const movementCard = screen.getByTestId('spell6-activity-motion-kasra')
    const wrong = within(movementCard).getByRole('radio', { name: 'الفتحة' })
    await user.click(wrong)
    await user.click(within(movementCard).getByRole('button', { name: 'تحقّق من هذه المقارنة' }))
    expect(within(movementCard).getByTestId('spell6-feedback-motion-kasra')).toHaveTextContent('الإجابة الصحيحة: الكسرة')
    expect(within(movementCard).getByTestId('spell6-feedback-motion-kasra')).toHaveTextContent('الفتحة أضعف من الكسرة')

    await user.click(openStep('التمهيد: أين تقع الهمزة؟'))
    expect(within(screen.getByTestId('spell6-position-position-middle')).getByRole('radio', { name: 'متوسطة' })).toBeChecked()
    await user.click(screen.getByRole('button', { name: 'إعادة نشاط الموضع فقط' }))
    expect(within(screen.getByTestId('spell6-position-position-middle')).getByRole('radio', { name: 'متوسطة' })).not.toBeChecked()

    await user.click(openStep('السرّ الأساسي: ترتيب الحركات'))
    const returnedCard = screen.getByTestId('spell6-activity-motion-kasra')
    expect(within(returnedCard).getByRole('radio', { name: 'الفتحة' })).toBeChecked()
    expect(within(returnedCard).getByTestId('spell6-feedback-motion-kasra')).toHaveTextContent('الإجابة الصحيحة: الكسرة')
    expect(activeStep()).toHaveAttribute('id', 'spell6-strength')
  })
})

describe('spelling lesson 6 — independent test gates and shared grading', () => {
  it('keeps page feedback, scores, and solutions hidden until explicit final submission', async () => {
    const user = userEvent.setup()
    openLesson()
    const firstPage = C.testDefinition.pages[0]
    await user.click(openStep(firstPage.title))
    const firstQuestion = firstPage.questions[0]
    if (firstQuestion.fields[0].kind !== 'choice') throw new Error('Expected a keyed choice question.')
    const questionView = screen.getByTestId(`spell6-question-${firstQuestion.id}`)
    await user.click(within(questionView).getByRole('radio', { name: firstQuestion.fields[0].answer }))
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(screen.getByTestId(`test-page-saved-${firstPage.id}`)).toHaveTextContent('لا تُكشف صحة الإجابات')
    expect(screen.queryByTestId(`test-feedback-${firstQuestion.id}`)).not.toBeInTheDocument()
    expect(screen.queryByTestId(`test-page-summary-${firstPage.id}`)).not.toBeInTheDocument()
    expect(screen.queryByTestId('spell6-final-score')).not.toBeInTheDocument()
    expect(document.body.innerHTML).not.toContain(firstQuestion.explanation)

    await user.click(openStep('حلول الاختبار المستقل'))
    expect(screen.getByTestId('spell6-solutions-locked')).toBeInTheDocument()
    expect(screen.queryByTestId('spell6-solutions')).not.toBeInTheDocument()

    await user.click(openStep('تسليم الاختبار والنتيجة'))
    expect(screen.queryByTestId('spell6-final-score')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'سلّم الاختبار واكشف النتيجة' }))
    expect(screen.getByTestId('spell6-final-score')).toHaveTextContent('١ صحيحة من ٢٠')
    expect(screen.getByTestId('spell6-final-score')).toHaveTextContent('١٩ لم تُجب')

    await user.click(openStep('حلول الاختبار المستقل'))
    expect(screen.getByTestId('spell6-solutions')).toBeInTheDocument()
    expect(screen.getByTestId(`solution-${firstQuestion.id}`)).toHaveTextContent(firstQuestion.fields[0].answer)
    expect(screen.getByTestId(`solution-${firstQuestion.id}`)).toHaveTextContent('التفسير:')
  })

  it('keeps the source-final solution area locked until the student requests a reveal', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('حلول الاختبار الختامي للمادة'))
    expect(screen.getByTestId('spell6-source-solutions-locked')).toBeInTheDocument()
    expect(screen.queryByTestId('spell6-source-final-solutions')).not.toBeInTheDocument()

    await user.click(openStep('الاختبار الختامي الوارد في المادة'))
    const essays = screen.getAllByRole('textbox', { name: /اكتب تعليلك/ })
    await user.type(essays[0], 'الهمزة ساكنة بعد ياء مفتوحة.')
    expect(document.body.innerHTML).not.toContain(C.sourceFinalDefinition.pages[0].questions[0].explanation)
    await user.click(screen.getByRole('button', { name: 'اكشف الإجابات النموذجية بعد المحاولة' }))

    await user.click(openStep('حلول الاختبار الختامي للمادة'))
    expect(screen.getByTestId('spell6-source-final-solutions')).toBeInTheDocument()
    expect(screen.getByTestId('solution-spell6-source-final-01')).toHaveTextContent('الياء السابقة لها مباشرة مفتوحة')
  })

  it('can submit all four pages and receives a complete 20-item result', async () => {
    const user = userEvent.setup()
    openLesson()
    for (let pageIndex = 0; pageIndex < C.testDefinition.pages.length; pageIndex += 1) {
      await answerExamPage(user, pageIndex)
    }
    await user.click(openStep('تسليم الاختبار والنتيجة'))
    await user.click(screen.getByRole('button', { name: 'سلّم الاختبار واكشف النتيجة' }))
    expect(screen.getByTestId('spell6-final-score')).toHaveTextContent('٢٠ صحيحة من ٢٠')
    expect(screen.getByTestId('spell6-final-score')).toHaveTextContent('٠ لم تُجب')
    await user.click(openStep('حلول الاختبار المستقل'))
    for (const question of C.testDefinition.pages.flatMap((page) => page.questions)) {
      expect(screen.getByTestId(`solution-${question.id}`)).toBeInTheDocument()
    }
  }, 20_000)
})

describe('spelling lesson 6 — protected teacher area', () => {
  it('does not render lesson keys until the shared teacher password is accepted', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('منطقة خاصة بالمعلم'))
    expect(screen.queryByTestId('spell6-teacher-content')).not.toBeInTheDocument()
    expect(screen.getByText(/ليست مصادقة آمنة/)).toBeInTheDocument()
    await user.type(screen.getByLabelText('كلمة المرور'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByRole('alert')).toHaveTextContent('كلمة المرور غير صحيحة')
    expect(screen.queryByTestId('spell6-teacher-content')).not.toBeInTheDocument()

    await user.clear(screen.getByLabelText('كلمة المرور'))
    await user.type(screen.getByLabelText('كلمة المرور'), COURSE_TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByTestId('spell6-teacher-content')).toBeInTheDocument()
    expect(screen.getByTestId('spell6-source-map')).toBeInTheDocument()
    expect(screen.getByTestId('spell6-teacher-source-solutions')).toBeInTheDocument()
    expect(screen.getByTestId('spell6-teacher-exam-solutions')).toBeInTheDocument()
    expect(screen.getByTestId('spell6-teacher-remediation')).toBeInTheDocument()
  })
})
