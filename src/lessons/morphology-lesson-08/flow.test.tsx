import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from '../../app/App'
import { COURSE_TEACHER_PASSWORD } from '../../shared/teacher/teacherPassword'
import sourceMarkdown from '../../../docs/source/morphology-lesson-08.md?raw'
import * as C from './content'
import { EXAM_ANSWERS, EXPECTED_CONJUGATIONS } from './test-fixtures'

const S = C.sourceContent
const questions = C.testDefinition.pages.flatMap((page) => page.questions)
const openStep = (name: string) => within(screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' })).getByRole('button', { name: new RegExp(name) })
function openLesson() {
  window.location.hash = '#/lesson/morphology-lesson-08'
  return render(<App />)
}
function activeStep(): HTMLElement { return document.querySelector('.lesson-step')! }
function noExamDisclosure() {
  expect(document.querySelectorAll('[data-testid^="test-feedback-"], [data-testid^="test-page-summary-"], [data-testid^="solution-morph8-q"], [data-answer], [data-correct], [data-solution], .test-question__correct, .test-question__status')).toHaveLength(0)
  expect(screen.queryByTestId('morph8-final-result')).not.toBeInTheDocument()
  for (const question of questions) {
    expect(document.body.innerHTML).not.toContain(question.explanation)
    expect(document.body.innerHTML).not.toContain(question.rule)
  }
}

async function answerPage(user: ReturnType<typeof userEvent.setup>, pageIndex: number) {
  const page = C.testDefinition.pages[pageIndex]
  await user.click(openStep(page.title))
  for (const question of page.questions) {
    const fieldset = screen.getByTestId(`morph8-question-${question.id}`)
    for (const [fieldIndex, field] of question.fields.entries()) {
      const values = EXAM_ANSWERS[`${question.id}:${fieldIndex}`]
      if (field.kind === 'choice') await user.click(within(fieldset).getByRole('radio', { name: values[0] }))
      else if (field.kind === 'multi') for (const value of values) await user.click(within(fieldset).getByRole('checkbox', { name: value }))
      else if (field.kind === 'select') await user.selectOptions(within(fieldset).getByRole('combobox', { name: `${question.prompt} — ${field.label}` }), values[0])
    }
  }
}

describe('morphology 08 — routes, source rendering and shared navigation', () => {
  it('opens from the eighth card after 7, keeps RTL/breadcrumbs, and returns to الصرف on finish', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/sections/morphology'
    render(<App />)
    const links = within(screen.getByRole('list', { name: 'دروس القسم' })).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual(Array.from({ length: 14 }, (_, i) => `#/lesson/morphology-lesson-${String(i + 1).padStart(2, '0')}`))
    await user.click(screen.getByRole('link', { name: S.header.title }))
    expect(await screen.findByRole('heading', { name: S.header.firstTitle, level: 2 })).toBeInTheDocument()
    expect(document.querySelector('.lesson-page')).toHaveAttribute('dir', 'rtl')
    expect(document.title).toContain('الدرس الثامن: تصريف الأفعال والإسناد إلى الضمائر')
    expect(within(screen.getByRole('navigation', { name: 'مسار التنقل' })).getByRole('link', { name: 'الصرف' })).toHaveAttribute('href', '#/sections/morphology')
    expect(document.querySelectorAll('.lesson-step')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'السابق' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'التالي' }))
    expect(activeStep()).toHaveAttribute('id', 'morph8-conjugation')
    expect(within(activeStep()).getByRole('heading', { level: 2 })).toHaveFocus()
    expect(document.querySelector('.lesson-flow__progress')).toHaveTextContent('الخطوة 2 من 27')
    await user.click(screen.getByRole('button', { name: 'السابق' }))
    expect(activeStep()).toHaveAttribute('id', 'morph8-intro')
    await user.click(openStep('منطقة خاصة بالمعلم'))
    await user.click(screen.getByRole('button', { name: 'إتمام الدرس' }))
    expect(await screen.findByRole('heading', { name: 'الصرف', level: 1 })).toBeInTheDocument()
    expect(window.location.hash).toBe('#/sections/morphology')
  })

  it('uses the shared mobile outline and restores focus without introducing new routes', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(screen.getByRole('button', { name: 'عرض فهرس خطوات الدرس' }))
    const drawer = screen.getByRole('dialog', { name: 'محتويات الدرس' })
    await user.click(within(drawer).getByRole('button', { name: /مختبر الأمر/ }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(activeStep()).toHaveAttribute('id', 'morph8-lab-imperative')
    expect(within(activeStep()).getByRole('heading', { level: 2 })).toHaveFocus()
    expect(window.location.hash).toBe('#/lesson/morphology-lesson-08')
  })

  it('renders EVERY source line/cell in the mounted teaching steps, not just in an unused data object', async () => {
    const user = userEvent.setup()
    openLesson()
    const chunks: string[] = []
    for (let i = 0; i < 20; i++) {
      expect(document.querySelectorAll('.lesson-step')).toHaveLength(1)
      chunks.push(activeStep().textContent ?? '')
      noExamDisclosure()
      if (i < 19) await user.click(screen.getByRole('button', { name: 'التالي' }))
    }
    expect(activeStep()).toHaveAttribute('id', 'morph8-next-lesson')
    const text = chunks.join('\n').replace(/\s+/g, ' ')
    const lines = sourceMarkdown.split('\n').filter(Boolean).map((line) => line.replace(/^(?:- |\d+\. )/, ''))
    for (const line of lines) {
      if (line === S.trainings.rawControls) {
        expect(text).toContain(C.trainingControls.reveal)
        expect(text).toContain(C.trainingControls.reset)
      } else expect(text, `Missing rendered source content: ${line}`).toContain(line.replace(/\s+/g, ' '))
    }
    expect(within(activeStep()).queryByRole('link')).not.toBeInTheDocument()
    expect(activeStep()).toHaveTextContent('لا درس تاسع مسجّل ولا اختبار وحدة')
  })

  it('renders the three complete conjugation tables with scoped headers and intact verb words', async () => {
    const user = userEvent.setup()
    openLesson()
    for (const [tense, heading] of [['past', S.past.heading], ['present', S.present.heading], ['imperative', S.imperative.heading]] as const) {
      await user.click(openStep(heading))
      const table = screen.getByTestId(`morph8-table-student-${tense}`)
      const expected = EXPECTED_CONJUGATIONS.filter((row) => tense !== 'imperative' || row[4])
      expect(within(table).getAllByRole('row')).toHaveLength(expected.length + 1)
      expect(table.querySelectorAll('th[scope="col"]')).toHaveLength(3)
      expect(table.querySelectorAll('th[scope="row"]')).toHaveLength(expected.length)
      expect(table.querySelectorAll('.morph8-verb')).toHaveLength(expected.length)
      expect(table.closest('[role="region"]')).toHaveAttribute('tabindex', '0')
      expected.forEach((row, index) => expect(table.querySelectorAll('.morph8-verb')[index]).toHaveTextContent(row[tense === 'past' ? 2 : tense === 'present' ? 3 : 4]!))
    }
  })

  it('opens the separately registered morphology lesson 12 by its deep link', () => {
    window.location.hash = '#/lesson/morphology-lesson-12'
    render(<App />)
    expect(screen.getByRole('heading', { name: 'اسم المفعول: كيف نعرف مَن وقع عليه الفعل؟', level: 3 })).toBeInTheDocument()
    expect(document.querySelector('.lesson-page')).toHaveAttribute('dir', 'rtl')
    expect(document.querySelector('.lesson-step')).toBeInTheDocument()
  })
})

describe('morphology 08 — six functioning keyboard-accessible activities', () => {
  it('explores all 12 pronouns and both uses of هما, preserving selection across steps', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('مختبر الضمائر'))
    const picker = screen.getByTestId('morph8-lab-pronouns')
    for (const pronoun of C.pronouns) {
      await user.click(within(picker).getByRole('button', { name: pronoun.label }))
      const row = C.conjugationFor(pronoun.id === 'huma' ? 'huma-m' : pronoun.id)
      const result = screen.getByTestId('morph8-pronoun-result')
      expect(result).toHaveTextContent(row.past)
      expect(result).toHaveTextContent(row.present)
      if (row.imperative) expect(result).toHaveTextContent(row.imperative)
      else expect(result).toHaveTextContent('الأمر هنا للمخاطب فقط')
    }
    await user.click(within(picker).getByRole('button', { name: 'هما' }))
    const feminine = within(picker).getByRole('button', { name: 'هما (مؤنث)' })
    feminine.focus()
    await user.keyboard('{Enter}')
    expect(feminine).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('morph8-pronoun-result')).toHaveTextContent('كَتَبَتَا')
    expect(screen.getByTestId('morph8-pronoun-result')).toHaveTextContent('تَكْتُبَانِ')
    await user.click(openStep('أولًا:'))
    await user.click(openStep('مختبر الضمائر'))
    expect(screen.getByTestId('morph8-pronoun-result')).toHaveTextContent('كَتَبَتَا')
  })

  it.each(C.practiceLabs)('checks and resets $title without leaking any final-test key', async (lab) => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep(lab.title))
    const activity = screen.getByTestId(`morph8-lab-${lab.id}`)
    expect(within(activity).getAllByRole('combobox')).toHaveLength(lab.items.length)
    for (const [index, item] of lab.items.entries()) {
      const card = screen.getByTestId(`morph8-practice-${item.id}`)
      const check = within(card).getByRole('button', { name: 'تحقق من الإجابة' })
      expect(check).toBeDisabled()
      expect(within(card).queryByRole('status')).not.toBeInTheDocument()
      const option = index === 0 ? item.options.find((value) => value !== item.answer)! : item.answer
      await user.selectOptions(within(card).getByRole('combobox'), option)
      expect(within(card).queryByRole('status')).not.toBeInTheDocument()
      check.focus()
      await user.keyboard('{Enter}')
      expect(within(card).getByRole('status')).toHaveTextContent(index === 0 ? 'تحتاج الإجابة إلى مراجعة' : 'إجابة صحيحة')
      expect(within(card).getByRole('status')).toHaveTextContent(item.explanation)
      // Editing removes feedback until a new explicit check.
      await user.selectOptions(within(card).getByRole('combobox'), '')
      expect(within(card).queryByRole('status')).not.toBeInTheDocument()
    }
    await user.click(within(activity).getByRole('button', { name: 'إعادة النشاط' }))
    for (const select of within(activity).getAllByRole('combobox')) expect(select).toHaveValue('')
    noExamDisclosure()
  })

  it('builds all five imperatives from keyboard-operable endings, and clears answers on retry', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('مختبر الأمر'))
    const activity = screen.getByTestId('morph8-lab-imperative')
    const expectedEndings = ['بْ', 'بِي', 'بَا', 'بُوا', 'بْنَ']
    for (const [index, row] of C.imperativeRows.entries()) {
      await user.click(within(activity).getByRole('button', { name: row.label }))
      const check = within(activity).getByRole('button', { name: 'تحقق من التكوين' })
      expect(check).toBeDisabled()
      await user.click(within(activity).getByRole('radio', { name: expectedEndings[index] }))
      expect(activity.querySelector('.morph8-build-preview')).toHaveTextContent(row.imperative!)
      expect(within(activity).queryByRole('status')).not.toBeInTheDocument()
      await user.click(check)
      expect(within(activity).getByRole('status')).toHaveTextContent('تكوين صحيح')
      expect(within(activity).getByRole('status')).toHaveTextContent(row.imperative!)
    }
    await user.click(within(activity).getByRole('radio', { name: 'بِي' }))
    await user.click(within(activity).getByRole('button', { name: 'تحقق من التكوين' }))
    expect(within(activity).getByRole('status')).toHaveTextContent('راجع نهاية الأمر')
    await user.click(within(activity).getByRole('button', { name: 'إعادة النشاط' }))
    expect(within(activity).queryByRole('status')).not.toBeInTheDocument()
    for (const radio of within(activity).getAllByRole('radio')) expect(radio).not.toBeChecked()
  })

  it('preserves the eight source questions/options, separates both buttons, and resets both trainings together', async () => {
    const user = userEvent.setup()
    openLesson()
    for (const group of S.trainings.groups) {
      await user.click(openStep(group.heading))
      const activity = screen.getByTestId(`morph8-training-${group.id}`)
      expect(within(activity).getAllByRole('group')).toHaveLength(group.items.length)
      for (const item of group.items) {
        const card = screen.getByTestId(`morph8-practice-${item.id}`)
        expect(card).toHaveTextContent(item.prompt)
        expect(within(card).getAllByRole('radio').map((radio) => radio.getAttribute('value'))).toEqual(item.options)
        expect(within(card).queryByRole('status')).not.toBeInTheDocument()
      }
    }
    await user.click(openStep(S.trainings.groups[0].heading))
    await user.click(within(screen.getByTestId('morph8-practice-training-1')).getByRole('radio', { name: 'كَتَبَ' }))
    await user.click(openStep(S.trainings.groups[1].heading))
    await user.click(within(screen.getByTestId('morph8-practice-training-7')).getByRole('radio', { name: 'اُكْتُبِي' }))
    await user.click(screen.getByRole('button', { name: C.trainingControls.reveal }))
    expect(within(screen.getByTestId('morph8-training-two')).getAllByRole('status')).toHaveLength(3)
    await user.click(openStep(S.trainings.groups[0].heading))
    expect(within(screen.getByTestId('morph8-training-one')).getAllByRole('status')).toHaveLength(5)
    expect(within(screen.getByTestId('morph8-practice-training-1')).getByRole('radio', { name: 'كَتَبَ' })).toBeChecked()
    expect(within(screen.getByTestId('morph8-practice-training-1')).getByRole('status')).toHaveTextContent('تحتاج الإجابة إلى مراجعة')
    await user.click(screen.getByRole('button', { name: C.trainingControls.reset }))
    for (const group of S.trainings.groups) {
      await user.click(openStep(group.heading))
      const activity = screen.getByTestId(`morph8-training-${group.id}`)
      expect(within(activity).queryByRole('status')).not.toBeInTheDocument()
      for (const radio of within(activity).getAllByRole('radio')) expect(radio).not.toBeChecked()
    }
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('morph8-solutions-locked')).toBeInTheDocument()
  })
})

describe('morphology 08 — final submission is the only student disclosure boundary', () => {
  it('checks/rechecks ALL pages silently, persists every field, submits 20/20, relocks on edit, and resets completely', async () => {
    const user = userEvent.setup()
    openLesson()
    for (let index = 0; index < 4; index++) {
      await answerPage(user, index)
      noExamDisclosure()
      await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
      expect(screen.getByTestId(`test-page-saved-${C.testDefinition.pages[index].id}`)).toBeInTheDocument()
      noExamDisclosure()
      await user.click(screen.getByRole('button', { name: 'أعِد التحقّق من الإجابات' }))
      noExamDisclosure()
    }
    // Every field type survives unmount/remount, but no checked page discloses keys.
    for (const page of C.testDefinition.pages) {
      await user.click(openStep(page.title))
      for (const question of page.questions) {
        const card = screen.getByTestId(`morph8-question-${question.id}`)
        question.fields.forEach((field, index) => {
          const values = EXAM_ANSWERS[`${question.id}:${index}`]
          if (field.kind === 'select') expect(within(card).getByRole('combobox', { name: `${question.prompt} — ${field.label}` })).toHaveValue(values[0])
          else if (field.kind === 'choice') expect(within(card).getByRole('radio', { name: values[0] })).toBeChecked()
          else if (field.kind === 'multi') for (const value of values) expect(within(card).getByRole('checkbox', { name: value })).toBeChecked()
        })
      }
      noExamDisclosure()
    }
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('morph8-solutions-locked')).toHaveTextContent('التحقق من الصفحات لا يكشف الحلول')
    noExamDisclosure()
    await user.click(openStep('تسليم الاختبار والنتيجة'))
    noExamDisclosure()
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار وإظهار النتيجة' }))
    expect(screen.getByTestId('morph8-final-result')).toHaveTextContent('٢٠ / ٢٠')
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getAllByTestId(/^solution-morph8-q/)).toHaveLength(20)
    for (const question of questions) expect(screen.getByTestId(`solution-${question.id}`)).toHaveTextContent(question.explanation!)
    await user.click(openStep(C.testDefinition.pages[0].title))
    expect(screen.getAllByTestId(/^test-feedback-/)).toHaveLength(5)
    await user.click(within(screen.getByTestId('morph8-question-morph8-q05')).getByRole('radio', { name: 'لَعِبْتَ' }))
    noExamDisclosure()
    // Rechecking an edited submitted page must NOT revive the previous submission.
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    noExamDisclosure()
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('morph8-solutions-locked')).toBeInTheDocument()
    await user.click(openStep('تسليم الاختبار والنتيجة'))
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار وإظهار النتيجة' }))
    expect(screen.getByTestId('morph8-final-result')).toHaveTextContent('١٩ / ٢٠')
    await user.click(screen.getByRole('button', { name: 'إعادة الاختبار' }))
    noExamDisclosure()
    for (const page of C.testDefinition.pages) {
      await user.click(openStep(page.title))
      for (const control of within(screen.getByTestId(`test-page-${page.id}`)).queryAllByRole('radio')) expect(control).not.toBeChecked()
      for (const control of within(screen.getByTestId(`test-page-${page.id}`)).queryAllByRole('checkbox')) expect(control).not.toBeChecked()
      for (const control of within(screen.getByTestId(`test-page-${page.id}`)).queryAllByRole('combobox')) expect(control).toHaveValue('')
      await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
      noExamDisclosure()
    }
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('morph8-solutions-locked')).toBeInTheDocument()
  }, 20_000)

  it('submits an incomplete attempt by the shared rules and distinguishes wrong from unanswered', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep(C.testDefinition.pages[0].title))
    await user.click(within(screen.getByTestId('morph8-question-morph8-q05')).getByRole('radio', { name: 'لَعِبْتُ' }))
    await user.click(within(screen.getByTestId('morph8-question-morph8-q01')).getByRole('checkbox', { name: 'أنا' }))
    await user.click(openStep('تسليم الاختبار والنتيجة'))
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار وإظهار النتيجة' }))
    expect(screen.getByTestId('morph8-final-result')).toHaveTextContent('١ / ٢٠')
    expect(screen.getByTestId('morph8-final-result')).toHaveTextContent('غير صحيحة: ١ · لم تُجب: ١٨')
    await user.click(openStep(C.testDefinition.pages[0].title))
    expect(screen.getByTestId('test-feedback-morph8-q01')).toHaveTextContent('إجابة غير صحيحة')
    expect(screen.getByTestId('test-feedback-morph8-q02')).toHaveTextContent('لم تُجب')
    expect(screen.getByTestId('test-feedback-morph8-q05')).toHaveTextContent('إجابة صحيحة')
  })
})

describe('morphology 08 — existing teacher gate and complete collapsible material', () => {
  it('gates the tables, eight worked solutions, twenty exam keys and source links, then relocks', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('منطقة خاصة بالمعلم'))
    expect(screen.queryByTestId('morph8-teacher-material')).not.toBeInTheDocument()
    noExamDisclosure()
    await user.type(screen.getByLabelText('كلمة المرور'), 'incorrect')
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByRole('alert')).toHaveTextContent('كلمة المرور غير صحيحة')
    expect(screen.queryByTestId('morph8-teacher-material')).not.toBeInTheDocument()
    await user.clear(screen.getByLabelText('كلمة المرور'))
    await user.type(screen.getByLabelText('كلمة المرور'), COURSE_TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    const material = screen.getByTestId('morph8-teacher-material')
    const sections = material.querySelectorAll('details')
    expect(sections).toHaveLength(8)
    for (const section of sections) {
      expect(section).not.toHaveAttribute('open')
      const summary = section.querySelector('summary')!
      await user.click(summary)
      expect(section).toHaveAttribute('open')
    }
    for (const [tense, count] of [['past', 13], ['present', 13], ['imperative', 5]] as const) {
      expect(within(screen.getByTestId(`morph8-table-teacher-${tense}`)).getAllByRole('row')).toHaveLength(count + 1)
    }
    expect(screen.getAllByTestId(/^morph8-teacher-training-/)).toHaveLength(8)
    for (const item of S.trainings.groups.flatMap((group) => [...group.items])) {
      const solution = screen.getByTestId(`morph8-teacher-${item.id}`)
      for (const line of [...C.trainingSolutions[item.number].steps, ...C.trainingSolutions[item.number].distractors]) expect(solution).toHaveTextContent(line)
    }
    expect(screen.getAllByTestId(/^solution-morph8-q/)).toHaveLength(20)
    for (const question of questions) expect(screen.getByTestId(`solution-${question.id}`)).toHaveTextContent(question.explanation!)
    expect(material).toHaveTextContent(C.clarifications.subjects)
    expect(within(material).getByRole('link', { name: /docs\/source\/morphology-lesson-08\.md/ })).toHaveAttribute('download', 'morphology-lesson-08.md')
    expect(within(material).getByRole('link', { name: /docs\/morphology-lesson-08-audit\.md/ })).toHaveAttribute('download', 'morphology-lesson-08-audit.md')
    await user.click(screen.getByRole('button', { name: 'إغلاق المساحة' }))
    expect(screen.queryByTestId('morph8-teacher-material')).not.toBeInTheDocument()
    noExamDisclosure()
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('morph8-solutions-locked')).toBeInTheDocument()
  })
})
