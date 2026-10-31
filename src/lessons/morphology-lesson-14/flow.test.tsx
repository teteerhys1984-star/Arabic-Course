import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from '../../app/App'
import { LessonMorphologyFourteen } from '../LessonMorphologyFourteen'
import { practices, testDefinition, trainingTest } from './content'

const outline = () => within(screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' }))
const openStep = (title: string) => outline().getByRole('button', { name: (_, element) => element?.getAttribute('aria-label')?.includes(title) ?? false })
const activeStep = () => document.querySelector('.lesson-step') as HTMLElement
const navigateTo = async (user: ReturnType<typeof userEvent.setup>, title: string) => user.click(openStep(title))

describe('morphology lesson 14 — routing and flow', () => {
  it('opens from the morphology grid and at the direct hash route, in the correct order', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/sections/morphology'
    const view = render(<App />)
    const links = within(screen.getByRole('list', { name: 'دروس القسم' })).getAllByRole('link')
    expect(links).toHaveLength(14)
    expect(links[12]).toHaveAttribute('href', '#/lesson/morphology-lesson-13')
    expect(links[13]).toHaveAttribute('href', '#/lesson/morphology-lesson-14')
    await user.click(links[13])
    expect(await screen.findByRole('heading', { name: 'اسم التفضيل: كيف نقارن بين الأشياء في صفة مشتركة؟', level: 2 })).toBeInTheDocument()
    expect(window.location.hash).toBe('#/lesson/morphology-lesson-14')
    expect(document.querySelector('.m14-lesson')).toHaveAttribute('dir', 'rtl')
    expect(document.querySelectorAll('.lesson-step')).toHaveLength(1)
    expect(outline().getAllByRole('button', { name: /الخطوة/ })).toHaveLength(25)
    expect(screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' }).querySelectorAll('.lesson-outline__group-title')).toHaveLength(12)

    view.unmount()
    window.location.hash = '#/lesson/morphology-lesson-14'
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'اسم التفضيل: كيف نقارن بين الأشياء في صفة مشتركة؟', level: 2 })).toBeInTheDocument()
  })

  it('uses short, grouped LessonFlow steps and presents the next lesson without registering it', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/lesson/morphology-lesson-14'
    render(<App />)
    await navigateTo(user, 'شروط الصياغة المباشرة')
    expect(activeStep()).toHaveTextContent('ثلاثيّ')
    await navigateTo(user, 'حالات اسم التفضيل الأربع')
    expect(activeStep()).toHaveTextContent('الأفضلان')
    await navigateTo(user, 'الدرس القادم: اسم الزمان واسم المكان')
    expect(activeStep()).toHaveTextContent('اسم الزمان واسم المكان')
  })

  it('gives feedback after practice check and supports correction and retry', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/lesson/morphology-lesson-14'
    render(<App />)
    await navigateTo(user, practices[0].title)
    expect(document.body.innerHTML).not.toContain(trainingTest.pages[0].questions[0].explanation)
    const firstQuestion = screen.getByTestId(`m14-practice-1-${trainingTest.pages[0].questions[0].id}`)
    await user.type(within(firstQuestion).getByRole('textbox'), 'أجمل')
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(await screen.findByText(/أجمل يدل على زيادة الصدق/)).toBeInTheDocument()
    await user.clear(within(firstQuestion).getByRole('textbox'))
    await user.type(within(firstQuestion).getByRole('textbox'), 'أحسن')
    expect(document.body.innerHTML).not.toContain(trainingTest.pages[0].questions[0].explanation)
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(await screen.findByText(/إجابة غير صحيحة/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'إعادة محاولة التدريبات' }))
    expect(within(firstQuestion).getByRole('textbox')).toHaveValue('')
  })

  it('keeps exam solutions hidden until all pages are checked, submitted, and explicitly requested', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/lesson/morphology-lesson-14'
    render(<App />)
    for (const [pageIndex, page] of testDefinition.pages.entries()) {
      await navigateTo(user, page.title)
      expect(document.body.innerHTML).not.toContain(page.questions[0].explanation)
      if (pageIndex === 3 || pageIndex === 4) {
        for (const question of page.questions.filter((item) => item.fields.some((field) => field.kind === 'essay'))) {
          const questionElement = screen.getByTestId(`m14-exam-question-${question.id}`)
          await user.type(within(questionElement).getByRole('textbox'), 'إجابة إنشائية للمراجعة')
        }
      }
      await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    }
    expect(document.body.innerHTML).not.toContain(testDefinition.pages[0].questions[0].explanation)
    await navigateTo(user, 'تسليم الاختبار والنتيجة')
    expect(screen.getByRole('button', { name: 'تسليم الاختبار' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار' }))
    expect(await screen.findByTestId('m14-exam-result')).toHaveTextContent('4 درجات معلّقة')
    expect(document.body.innerHTML).not.toContain(testDefinition.pages[0].questions[0].explanation)
    await navigateTo(user, 'عرض الحلول بعد التسليم')
    expect(screen.getByRole('button', { name: 'عرض حلول الاختبار بعد التسليم' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'عرض حلول الاختبار بعد التسليم' }))
    expect(await screen.findByText(/اسم التفضيل من كَبُرَ/)).toBeInTheDocument()

    await navigateTo(user, testDefinition.pages[0].title)
    const choice = testDefinition.pages[0].questions[0].fields[0]
    if (choice.kind !== 'choice') throw new Error('first question must be choice')
    const question = screen.getByTestId(`m14-exam-question-${testDefinition.pages[0].questions[0].id}`)
    await user.click(within(question).getByRole('radio', { name: 'كبير' }))
    expect(screen.queryByTestId('m14-exam-result')).not.toBeInTheDocument()
    expect(document.body.innerHTML).not.toContain(testDefinition.pages[0].questions[0].explanation)
    await navigateTo(user, 'عرض الحلول بعد التسليم')
    expect(screen.getByRole('button', { name: 'عرض حلول الاختبار بعد التسليم' })).toBeDisabled()
  })

  it('keeps the teacher key in TeacherSpace and assigns manual writing for human review', async () => {
    const user = userEvent.setup()
    render(<LessonMorphologyFourteen />)
    await navigateTo(user, 'منطقة المعلم')
    expect(screen.getByText(/هذه بوابة أمامية بسيطة/)).toBeInTheDocument()
    expect(testDefinition.pages[3].questions.every((question) => question.fields.some((field) => field.kind === 'essay'))).toBe(true)
    expect(testDefinition.pages[4].questions[3].fields.some((field) => field.kind === 'essay')).toBe(true)
  })
})
