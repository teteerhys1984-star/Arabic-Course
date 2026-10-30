import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from '../../app/App'
import { COURSE_TEACHER_PASSWORD } from '../../shared/teacher/teacherPassword'
import * as C from './content'

const challengeQuestions = C.challengeTest.pages.flatMap((page) => page.questions)
const examQuestions = C.testDefinition.pages.flatMap((page) => page.questions)
const outline = () => within(screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' }))
const openStep = (title: string) => outline().getByRole('button', { name: (_, element) => element?.getAttribute('aria-label')?.includes(title) ?? false })
const clickCheck = (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole('button', { name: /تحقّق من الإجابات/ }))
const activeStep = () => document.querySelector('.lesson-step') as HTMLElement

function openLesson() {
  window.location.hash = '#/lesson/morphology-lesson-12'
  return render(<App />)
}

function expectExamNotDisclosed() {
  expect(document.querySelectorAll('[data-testid^="test-feedback-sarf12-e"], [data-testid^="solution-sarf12-e"], .test-question__correct')).toHaveLength(0)
  expect(screen.queryByTestId('sarf12-exam-result')).not.toBeInTheDocument()
  expect(screen.queryByTestId('sarf12-exam-final-result')).not.toBeInTheDocument()
  for (const question of examQuestions) {
    expect(document.body.innerHTML).not.toContain(question.explanation)
    expect(document.body.innerHTML).not.toContain(question.rule)
  }
}

async function answerExamPage(user: ReturnType<typeof userEvent.setup>, pageIndex: number) {
  const page = C.testDefinition.pages[pageIndex]
  await user.click(openStep(page.title))
  for (const question of page.questions) {
    const field = question.fields[0]
    if (field.kind !== 'choice') throw new Error('The final assessment is intentionally fully auto-graded')
    const group = screen.getByTestId(`sarf12-exam-question-${question.id}`)
    await user.click(within(group).getByRole('radio', { name: field.answer }))
  }
}

async function checkCurrentPage(user: ReturnType<typeof userEvent.setup>) {
  await clickCheck(user)
}

describe('morphology lesson 12 — registration, routing and lesson-flow navigation', () => {
  it('opens as morphology lesson 12 only, follows morphology 11, and finishes back at the section grid', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/sections/morphology'
    render(<App />)
    const section = within(screen.getByRole('list', { name: 'دروس القسم' }))
    const links = section.getAllByRole('link')
    expect(links).toHaveLength(13)
    expect(links[10]).toHaveAttribute('href', '#/lesson/morphology-lesson-11')
    expect(links[11]).toHaveAttribute('href', '#/lesson/morphology-lesson-12')
    expect(links[12]).toHaveAttribute('href', '#/lesson/morphology-lesson-13')
    expect(screen.getByRole('link', { name: (name) => name.includes(C.lessonTitle) })).toHaveAttribute('href', '#/lesson/morphology-lesson-12')

    await user.click(screen.getByRole('link', { name: (name) => name.includes(C.lessonTitle) }))
    expect(await screen.findByRole('heading', { name: C.lessonTitle, level: 3 })).toBeInTheDocument()
    expect(document.querySelector('.lesson-page')).toHaveAttribute('dir', 'rtl')
    expect(document.title).toContain(C.documentTitle)
    expect(window.location.hash).toBe('#/lesson/morphology-lesson-12')
    expect(within(screen.getByRole('navigation', { name: 'مسار التنقل' })).getByRole('link', { name: 'الصرف' })).toHaveAttribute('href', '#/sections/morphology')
    expect(document.querySelectorAll('.lesson-step')).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'التالي' }))
    expect(activeStep()).toHaveAttribute('id', 'sarf12-definition')
    await user.click(screen.getByRole('button', { name: 'السابق' }))
    expect(activeStep()).toHaveAttribute('id', 'sarf12-intro')

    await user.click(openStep('الانتقال إلى الدرس التالي'))
    expect(activeStep()).toHaveTextContent('الدرس الثالث عشر: صِيَغُ المبالغة')
    await user.click(openStep('منطقة المعلم'))
    await user.click(screen.getByRole('button', { name: 'إتمام الدرس' }))
    expect(await screen.findByRole('heading', { name: 'الصرف', level: 1 })).toBeInTheDocument()
    expect(window.location.hash).toBe('#/sections/morphology')
  })

  it('keeps morphology lesson 12 distinct from the basics-and-grammar lesson 12', () => {
    window.location.hash = '#/sections/basics-grammar'
    render(<App />)
    const basicsLinks = within(screen.getByRole('list', { name: 'دروس القسم' })).getAllByRole('link')
    expect(basicsLinks).toHaveLength(14)
    expect(basicsLinks[11]).toHaveAttribute('href', '#/lesson/lesson-12')
    expect(basicsLinks.some((link) => link.getAttribute('href') === '#/lesson/morphology-lesson-12')).toBe(false)
  })

  it('isolates Arabic content and LTR counters and keeps mobile interactions label-driven', async () => {
    const user = userEvent.setup()
    openLesson()
    expect(document.querySelector('.sarf12-lesson')).toHaveAttribute('dir', 'rtl')
    await user.click(openStep('صياغته من غير الثلاثي'))
    const table = screen.getByTestId('sarf12-nontriliteral-table')
    const words = table.querySelectorAll('.sarf12-word')
    expect(words.length).toBeGreaterThan(10)
    for (const word of words) {
      expect(word.tagName).toBe('BDI')
      expect(word).toHaveAttribute('dir', 'rtl')
      expect(word).toHaveAttribute('lang', 'ar')
    }

    await user.click(openStep('تحدٍّ تفاعلي'))
    const challenge = screen.getByTestId('sarf12-challenge')
    const counter = screen.getByTestId('sarf12-challenge-progress').querySelector('bdi')
    expect(counter).toHaveAttribute('dir', 'ltr')
    expect(challenge.querySelectorAll('[data-question-number]')).toHaveLength(8)
    expect(within(challenge).getAllByRole('radio')).toHaveLength(24)
    expect(within(challenge).getByRole('button', { name: 'تحقّق من الإجابات' })).toBeEnabled()
  })
})

describe('morphology lesson 12 — challenge correction, score, edit and retry', () => {
  it('has eight one-answer questions, reveals every explanation only after checking, and supports a clean retry', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('تحدٍّ تفاعلي'))
    const challenge = screen.getByTestId('sarf12-challenge')
    expect(challengeQuestions).toHaveLength(8)
    expect(challenge.querySelectorAll('[data-question-number]')).toHaveLength(8)
    expect(screen.getByTestId('sarf12-challenge-progress')).toHaveTextContent('0 / 8')

    for (const question of challengeQuestions) {
      const group = screen.getByTestId(`sarf12-challenge-question-${question.id}`)
      const field = question.fields[0]
      if (field.kind !== 'choice') throw new Error('Challenge questions must have one auto-graded choice')
      const wrong = field.options.find((option) => option !== field.answer)!
      expect(within(group).getAllByRole('radio')).toHaveLength(3)
      expect(within(group).queryByTestId(`test-feedback-${question.id}`)).not.toBeInTheDocument()
      await user.click(within(group).getByRole('radio', { name: question.number === 8 ? wrong : field.answer }))
      expect(document.body.innerHTML).not.toContain(question.explanation)
    }

    await checkCurrentPage(user)
    expect(screen.getByTestId('sarf12-challenge-progress')).toHaveTextContent('7 / 8')
    for (const question of challengeQuestions) {
      const feedback = screen.getByTestId(`test-feedback-${question.id}`)
      expect(feedback).toHaveTextContent('التفسير:')
      expect(feedback).toHaveTextContent(question.explanation!)
      expect(feedback).toHaveTextContent(`الإجابة الصحيحة: ${question.solution}`)
    }
    expect(screen.getByTestId('test-page-summary-sarf12-challenge-page')).toHaveTextContent('7 صحيحة')

    const finalQuestion = challengeQuestions[7]
    const finalField = finalQuestion.fields[0]
    if (finalField.kind !== 'choice') throw new Error('Challenge question 8 must be auto-graded')
    const finalGroup = screen.getByTestId(`sarf12-challenge-question-${finalQuestion.id}`)
    await user.click(within(finalGroup).getByRole('radio', { name: finalField.answer }))
    expect(screen.queryByTestId(`test-feedback-${finalQuestion.id}`)).not.toBeInTheDocument()
    expect(screen.queryByTestId('test-page-summary-sarf12-challenge-page')).not.toBeInTheDocument()
    await checkCurrentPage(user)
    expect(screen.getByTestId('sarf12-challenge-progress')).toHaveTextContent('8 / 8')
    expect(screen.getByTestId('test-page-summary-sarf12-challenge-page')).toHaveTextContent('8 صحيحة')

    await user.click(screen.getByRole('button', { name: 'إعادة محاولة التحدّي' }))
    expect(screen.getByTestId('sarf12-challenge-progress')).toHaveTextContent('0 / 8')
    expect(screen.queryByTestId('test-page-summary-sarf12-challenge-page')).not.toBeInTheDocument()
    for (const radio of within(challenge).getAllByRole('radio')) expect(radio).not.toBeChecked()
    for (const question of challengeQuestions) expect(screen.queryByTestId(`test-feedback-${question.id}`)).not.toBeInTheDocument()
  })
})

describe('morphology lesson 12 — independent 15-question final test', () => {
  it('keeps answers and scores hidden until all four pages are checked and the test is submitted', async () => {
    const user = userEvent.setup()
    openLesson()

    for (let pageIndex = 0; pageIndex < C.testDefinition.pages.length; pageIndex += 1) {
      const page = C.testDefinition.pages[pageIndex]
      await answerExamPage(user, pageIndex)
      expectExamNotDisclosed()
      await checkCurrentPage(user)
      expect(screen.getByTestId(`test-page-saved-${page.id}`)).toBeInTheDocument()
      expectExamNotDisclosed()
    }

    await user.click(openStep('حلول الاختبار المستقل'))
    expect(screen.getByRole('button', { name: 'كشف نموذج الإجابة' })).toBeDisabled()
    expect(screen.getByText(/لا تُكشف الحلول النموذجية أو صحة الإجابات/)).toBeInTheDocument()
    expectExamNotDisclosed()

    await user.click(openStep('تسليم الاختبار والنتيجة'))
    const submit = screen.getByRole('button', { name: 'تسليم الاختبار وإظهار النتيجة' })
    expect(submit).toBeEnabled()
    expect(screen.queryByTestId('sarf12-exam-result')).not.toBeInTheDocument()
    await user.click(submit)
    expect(screen.getByTestId('sarf12-exam-result')).toHaveTextContent('١٥ / ١٥')
    expect(screen.getByTestId('sarf12-exam-result')).toHaveTextContent('لا توجد أسئلة للمراجعة اليدوية')

    await user.click(openStep('حلول الاختبار المستقل'))
    await user.click(screen.getByRole('button', { name: 'كشف نموذج الإجابة' }))
    for (const question of examQuestions) {
      const solution = screen.getByTestId(`solution-${question.id}`)
      expect(solution).toHaveTextContent(question.solution!)
      expect(solution).toHaveTextContent(question.explanation!)
    }
    expect(screen.getAllByTestId(/^solution-sarf12-e/)).toHaveLength(15)

    // تعديل إجابة بعد التسليم يخفي النتيجة والحلول حتى إعادة التحقق والتسليم.
    await user.click(openStep(C.testDefinition.pages[0].title))
    const firstQuestion = examQuestions[0]
    const firstField = firstQuestion.fields[0]
    if (firstField.kind !== 'choice') throw new Error('Final test must be auto-graded')
    const group = screen.getByTestId(`sarf12-exam-question-${firstQuestion.id}`)
    const wrong = firstField.options.find((option) => option !== firstField.answer)!
    await user.click(within(group).getByRole('radio', { name: wrong }))
    expectExamNotDisclosed()
    await user.click(openStep('حلول الاختبار المستقل'))
    expect(screen.getByRole('button', { name: 'كشف نموذج الإجابة' })).toBeDisabled()

    await user.click(openStep(C.testDefinition.pages[0].title))
    await checkCurrentPage(user)
    expectExamNotDisclosed()
    await user.click(openStep('تسليم الاختبار والنتيجة'))
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار وإظهار النتيجة' }))
    expect(screen.getByTestId('sarf12-exam-result')).toHaveTextContent('١٤ / ١٥')

    await user.click(screen.getByRole('button', { name: 'إعادة الاختبار' }))
    expect(screen.queryByTestId('sarf12-exam-result')).not.toBeInTheDocument()
    expectExamNotDisclosed()
    await user.click(openStep(C.testDefinition.pages[0].title))
    for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked()
  }, 30_000)
})

describe('morphology lesson 12 — homework and teacher space', () => {
  it('opens the homework key only after all five rows were attempted and includes ten model forms', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('الواجب المنزلي'))
    const homework = screen.getByTestId('sarf12-homework')
    const reveal = within(homework).getByRole('button', { name: 'عرض الحلول بعد المحاولة' })
    expect(screen.getByTestId('sarf12-homework-table').querySelectorAll('tbody tr')).toHaveLength(5)
    expect(reveal).toBeDisabled()
    for (const row of C.homeworkRows) {
      await user.type(screen.getByRole('textbox', { name: `اسم الفاعل من ${row.verb}` }), 'محاولة')
      await user.type(screen.getByRole('textbox', { name: `اسم المفعول من ${row.verb}` }), 'محاولة')
    }
    expect(screen.getByTestId('sarf12-homework-progress')).toHaveTextContent('5 / ٥')
    expect(reveal).toBeEnabled()
    expect(screen.queryByTestId('sarf12-homework-solutions')).not.toBeInTheDocument()
    await user.click(reveal)
    const answers = screen.getByTestId('sarf12-homework-solutions')
    expect(answers.querySelectorAll('tbody tr')).toHaveLength(5)
    for (const row of C.homeworkRows) {
      expect(answers).toHaveTextContent(row.active)
      expect(answers).toHaveTextContent(row.passive)
      expect(answers).toHaveTextContent(row.explanation)
    }
    await user.clear(screen.getByRole('textbox', { name: 'اسم المفعول من كَسَرَ' }))
    expect(screen.queryByTestId('sarf12-homework-solutions')).not.toBeInTheDocument()
  })

  it('keeps all teacher answer keys gated, then exposes eight challenge answers, fifteen test solutions and full analysis', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('منطقة المعلم'))
    expect(screen.queryByTestId('sarf12-teacher-material')).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('كلمة المرور'), 'incorrect')
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByRole('alert')).toHaveTextContent('كلمة المرور غير صحيحة')
    await user.clear(screen.getByLabelText('كلمة المرور'))
    await user.type(screen.getByLabelText('كلمة المرور'), COURSE_TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول' }))

    const material = screen.getByTestId('sarf12-teacher-material')
    const sections = material.querySelectorAll('details')
    expect(sections).toHaveLength(8)
    for (const section of sections) {
      expect(section).not.toHaveAttribute('open')
      await user.click(section.querySelector('summary')!)
      expect(section).toHaveAttribute('open')
    }
    for (const question of challengeQuestions) {
      const model = screen.getByTestId(`solution-${question.id}`)
      expect(model).toHaveTextContent(question.solution!)
      expect(model).toHaveTextContent(question.explanation!)
    }
    for (const question of examQuestions) {
      const model = screen.getByTestId(`solution-${question.id}`)
      expect(model).toHaveTextContent(question.solution!)
      expect(model).toHaveTextContent(question.explanation!)
    }
    expect(screen.getByTestId('sarf12-teacher-triliteral').querySelectorAll('tbody tr')).toHaveLength(10)
    expect(screen.getByTestId('sarf12-teacher-weak').querySelectorAll('tbody tr')).toHaveLength(4)
    expect(screen.getByTestId('sarf12-teacher-homework').querySelectorAll('tbody tr')).toHaveLength(5)
    expect(screen.getByTestId('sarf12-teacher-sentences').querySelectorAll('tbody tr')).toHaveLength(6)
    expect(material).toHaveTextContent('مُكْرِم')
    expect(material).toHaveTextContent('مُكْرَم')
    expect(material).toHaveTextContent('مُعَلِّم')
    expect(material).toHaveTextContent('مُعَلَّم')
    expect(material).toHaveTextContent('مَقُول')
    expect(material).toHaveTextContent('مَبِيع')
    expect(material).toHaveTextContent('مَدْعُوّ')
    expect(material).toHaveTextContent('مَرْمِيّ')
    expect(within(material).getByRole('link', { name: /docs\/lesson-sarf-12-audit\.md/ })).toHaveAttribute('download', 'lesson-sarf-12-audit.md')
    await user.click(screen.getByRole('button', { name: 'إغلاق المساحة' }))
    expect(screen.queryByTestId('sarf12-teacher-material')).not.toBeInTheDocument()
  })
})
