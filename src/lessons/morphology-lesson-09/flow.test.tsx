import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from '../../app/App'
import { COURSE_TEACHER_PASSWORD } from '../../shared/teacher/teacherPassword'
import sourceMarkdown from '../../../docs/source/morphology-lesson-09.md?raw'
import * as C from './content'
import { EXAM_ANSWERS, EXPECTED_AUGMENTED, EXPECTED_BASICS, EXPECTED_TRAINING_KEYS, EXPECTED_TRILITERAL } from './test-fixtures'

const S = C.sourceContent
const questions = C.testDefinition.pages.flatMap((page) => page.questions)
const TEACHING_STEPS = 29

const openStep = (name: string) =>
  within(screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' })).getByRole('button', { name: new RegExp(name) })
function openLesson() {
  window.location.hash = '#/lesson/morphology-lesson-09'
  return render(<App />)
}
function activeStep(): HTMLElement {
  return document.querySelector('.lesson-step')!
}
function noExamDisclosure() {
  expect(
    document.querySelectorAll(
      '[data-testid^="test-feedback-"], [data-testid^="test-page-summary-"], [data-testid^="solution-morph9-q"], [data-answer], [data-correct], [data-solution], .test-question__correct, .test-question__status',
    ),
  ).toHaveLength(0)
  expect(screen.queryByTestId('morph9-final-result')).not.toBeInTheDocument()
  for (const question of questions) {
    expect(document.body.innerHTML).not.toContain(question.explanation)
    expect(document.body.innerHTML).not.toContain(question.rule)
  }
}

async function answerPage(user: ReturnType<typeof userEvent.setup>, pageIndex: number) {
  const page = C.testDefinition.pages[pageIndex]
  await user.click(openStep(page.title))
  for (const question of page.questions) {
    const fieldset = screen.getByTestId(`morph9-question-${question.id}`)
    for (const [fieldIndex, field] of question.fields.entries()) {
      const values = EXAM_ANSWERS[`${question.id}:${fieldIndex}`]
      if (field.kind === 'choice') await user.click(within(fieldset).getByRole('radio', { name: values[0] }))
      else if (field.kind === 'multi') for (const value of values) await user.click(within(fieldset).getByRole('checkbox', { name: value }))
      else if (field.kind === 'select') await user.selectOptions(within(fieldset).getByRole('combobox', { name: `${question.prompt} — ${field.label}` }), values[0])
    }
  }
}

describe('morphology 09 — المسار والتسجيل وعرض المصدر', () => {
  it('يُفتح من البطاقة التاسعة بعد الثامنة، ويحفظ RTL والمسار، ويعود إلى الصرف', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/sections/morphology'
    render(<App />)
    const links = within(screen.getByRole('list', { name: 'دروس القسم' })).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      Array.from({ length: 13 }, (_, index) => `#/lesson/morphology-lesson-${String(index + 1).padStart(2, '0')}`),
    )
    await user.click(screen.getByRole('link', { name: C.lessonTitle }))
    expect(await screen.findByRole('heading', { name: S.header.firstTitle, level: 2 })).toBeInTheDocument()
    expect(document.querySelector('.lesson-page')).toHaveAttribute('dir', 'rtl')
    expect(document.title).toContain('الدرس التاسع: المصدر — تعريفه وأوزانه الأساسية')
    expect(within(screen.getByRole('navigation', { name: 'مسار التنقل' })).getByRole('link', { name: 'الصرف' })).toHaveAttribute('href', '#/sections/morphology')
    expect(document.querySelectorAll('.lesson-step')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'السابق' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'التالي' }))
    expect(activeStep()).toHaveAttribute('id', 'morph9-opening')
    expect(within(activeStep()).getByRole('heading', { level: 2 })).toHaveFocus()
    expect(document.querySelector('.lesson-flow__progress')).toHaveTextContent('الخطوة 2 من 36')
    await user.click(screen.getByRole('button', { name: 'السابق' }))
    expect(activeStep()).toHaveAttribute('id', 'morph9-intro')
    await user.click(openStep('منطقة خاصة بالمعلم'))
    await user.click(screen.getByRole('button', { name: 'إتمام الدرس' }))
    expect(await screen.findByRole('heading', { name: 'الصرف', level: 1 })).toBeInTheDocument()
    expect(window.location.hash).toBe('#/sections/morphology')
  })

  it('يستعمل فهرس الهاتف المشترك ويعيد التركيز دون مسار جديد', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(screen.getByRole('button', { name: 'عرض فهرس خطوات الدرس' }))
    const drawer = screen.getByRole('dialog', { name: 'محتويات الدرس' })
    await user.click(within(drawer).getByRole('button', { name: /مختبر التحليل المتدرّج/ }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(activeStep()).toHaveAttribute('id', 'morph9-lab-analysis')
    expect(within(activeStep()).getByRole('heading', { level: 2 })).toHaveFocus()
    expect(window.location.hash).toBe('#/lesson/morphology-lesson-09')
  })

  it('يعرض كل سطر/خلية من المصدر داخل خطوات التدريس المركّبة، لا في كائن بيانات مهمل', async () => {
    const user = userEvent.setup()
    openLesson()
    const chunks: string[] = []
    for (let index = 0; index < TEACHING_STEPS; index++) {
      expect(document.querySelectorAll('.lesson-step')).toHaveLength(1)
      chunks.push(activeStep().textContent ?? '')
      noExamDisclosure()
      if (index < TEACHING_STEPS - 1) await user.click(screen.getByRole('button', { name: 'التالي' }))
    }
    expect(activeStep()).toHaveAttribute('id', 'morph9-next-lesson')
    const text = chunks.join('\n').replace(/\s+/g, ' ')
    const body = sourceMarkdown.slice(sourceMarkdown.indexOf('-->') + 3)
    const cells = body.split('\n').flatMap((line) => {
      const trimmed = line.trim()
      if (!trimmed) return []
      if (/^\|[-\s|]+\|$/.test(trimmed)) return []
      if (trimmed.startsWith('|')) return trimmed.split('|').map((cell) => cell.trim()).filter(Boolean)
      return [trimmed.replace(/^(?:- |\d+\. )/, '')]
    })
    expect(cells).toHaveLength(374)
    for (const cell of cells) {
      if (cell === S.trainings.rawControls) {
        expect(text).toContain(C.trainingControls.reveal)
        expect(text).toContain(C.trainingControls.reset)
      } else expect(text, `Missing rendered source content: ${cell}`).toContain(cell.replace(/\s+/g, ' '))
    }
    expect(within(activeStep()).queryByRole('link')).not.toBeInTheDocument()
    expect(activeStep()).toHaveTextContent('لا درس عاشر مسجّل ولا اختبار وحدة')
  })

  it('يعرض الجداول الأربعة بعناوين محدّدة النطاق وكلمات غير مكسورة', async () => {
    const user = userEvent.setup()
    openLesson()
    const tables = [
      ['أمثلة أساسية', 'morph9-table-basics', 8, 3, EXPECTED_BASICS],
      ['جدول المقارنة', 'morph9-table-kinds', 4, 3, null],
      ['إليك مجموعة من الأوزان', 'morph9-table-triliteral', 10, 3, EXPECTED_TRILITERAL],
      ['سابعًا:', 'morph9-table-augmented', 8, 4, EXPECTED_AUGMENTED],
    ] as const
    for (const [step, testId, rows, columns] of tables) {
      await user.click(openStep(step))
      const table = screen.getByTestId(testId)
      expect(within(table).getAllByRole('row')).toHaveLength(rows + 1)
      expect(table.querySelectorAll('th[scope="col"]')).toHaveLength(columns)
      expect(table.querySelectorAll('th[scope="row"]')).toHaveLength(rows)
      expect(table.closest('[role="region"]')).toHaveAttribute('tabindex', '0')
      for (const word of table.querySelectorAll('.morph9-word')) {
        expect(word.textContent!.trim().length).toBeGreaterThan(1)
        expect(word).toHaveAttribute('dir', 'rtl')
      }
    }
    const augmented = screen.getByTestId('morph9-table-augmented')
    EXPECTED_AUGMENTED.forEach((row, index) => {
      const cells = augmented.querySelectorAll('tbody tr')[index].querySelectorAll('th, td')
      expect(cells[0]).toHaveTextContent(row[0])
      expect(cells[1]).toHaveTextContent(row[1])
      expect(cells[2]).toHaveTextContent(row[2])
      expect(cells[3]).toHaveTextContent(row[3])
    })
  })

  it('opens the separately registered morphology lesson 12 by its direct route', () => {
    window.location.hash = '#/lesson/morphology-lesson-12'
    render(<App />)
    expect(screen.getByRole('heading', { name: 'اسم المفعول: كيف نعرف مَن وقع عليه الفعل؟', level: 3 })).toBeInTheDocument()
    expect(document.querySelector('.lesson-page')).toHaveAttribute('dir', 'rtl')
    expect(document.querySelector('.lesson-step')).toBeInTheDocument()
  })
})

describe('morphology 09 — خمسة مختبرات عاملة بلوحة المفاتيح', () => {
  it.each(C.practiceLabs)('يصحّح $title ويعيد ضبطه دون تسريب أي مفتاح اختبار', async (lab) => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep(lab.title))
    const activity = screen.getByTestId(`morph9-lab-${lab.id}`)
    expect(within(activity).getAllByRole('group')).toHaveLength(lab.items.length)
    for (const [index, item] of lab.items.entries()) {
      const card = screen.getByTestId(`morph9-practice-${item.id}`)
      const check = within(card).getByRole('button', { name: 'تحقق من الإجابة' })
      expect(check).toBeDisabled()
      expect(within(card).queryByRole('status')).not.toBeInTheDocument()
      const option = index === 0 ? item.options.find((value) => value !== item.answer)! : item.answer
      await user.click(within(card).getByRole('radio', { name: option }))
      expect(within(card).queryByRole('status')).not.toBeInTheDocument()
      check.focus()
      await user.keyboard('{Enter}')
      expect(within(card).getByRole('status')).toHaveTextContent(index === 0 ? 'تحتاج الإجابة إلى مراجعة' : 'إجابة صحيحة')
      expect(within(card).getByRole('status')).toHaveTextContent(item.explanation)
      // تغيير الاختيار يخفي التغذية الراجعة حتى تحقق جديد.
      const next = item.options.find((value) => value !== option)!
      await user.click(within(card).getByRole('radio', { name: next }))
      expect(within(card).queryByRole('status')).not.toBeInTheDocument()
    }
    await user.click(within(activity).getByRole('button', { name: 'إعادة النشاط' }))
    for (const radio of within(activity).getAllByRole('radio')) expect(radio).not.toBeChecked()
    noExamDisclosure()
  })

  it('يفتح مراحل مختبر التحليل تدريجيًا ويشرح الخطأ قبل المتابعة', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('مختبر التحليل المتدرّج'))
    const activity = screen.getByTestId('morph9-lab-analysis')
    const stages = within(activity).getAllByTestId(/^morph9-stage-/)
    expect(stages).toHaveLength(4)
    expect(stages[1]).toHaveTextContent('أكمل المرحلة السابقة لتظهر هذه المرحلة')
    // خطأ في المرحلة الأولى: تفسير، ولا فتح للمرحلة التالية.
    await user.selectOptions(within(stages[0]).getByRole('combobox'), 'ثلاثي مزيد بالتضعيف')
    await user.click(within(stages[0]).getByRole('button', { name: 'تحقق من هذه المرحلة' }))
    expect(within(stages[0]).getByRole('status')).toHaveTextContent('تحتاج هذه المرحلة إلى مراجعة')
    expect(within(stages[0]).getByRole('status')).toHaveTextContent('ثلاثي مزيد بحرف')
    expect(within(activity).getAllByTestId(/^morph9-stage-/)[1]).toHaveTextContent('أكمل المرحلة السابقة')
    // الإصابة تفتح المرحلة التالية.
    await user.selectOptions(within(stages[0]).getByRole('combobox'), 'ثلاثي مزيد بحرف')
    await user.click(within(stages[0]).getByRole('button', { name: 'تحقق من هذه المرحلة' }))
    expect(within(stages[0]).getByRole('status')).toHaveTextContent('مرحلة صحيحة')
    const second = within(activity).getAllByTestId(/^morph9-stage-/)[1]
    expect(within(second).getByRole('combobox')).toBeInTheDocument()
    // إكمال المراحل الأربع يعرض نتيجة التحليل والجملة.
    for (const [index, answer] of ['أَفْعَلَ', 'إِحْسان', 'إِفْعال'].entries()) {
      const stage = within(activity).getAllByTestId(/^morph9-stage-/)[index + 1]
      await user.selectOptions(within(stage).getByRole('combobox'), answer)
      await user.click(within(stage).getByRole('button', { name: 'تحقق من هذه المرحلة' }))
    }
    expect(screen.getByTestId('morph9-analysis-result')).toHaveTextContent('أَحْسَنَ')
    expect(screen.getByTestId('morph9-analysis-result')).toHaveTextContent('إِحْسان')
    expect(screen.getByTestId('morph9-analysis-result')).toHaveTextContent('الإِحْسانُ خُلُقٌ كريمٌ.')
    // فعل ثانٍ بحالة مستقلة، ثم إعادة التحليل تصفّر المراحل.
    await user.click(within(activity).getByRole('button', { name: 'صَرَّفَ' }))
    expect(screen.queryByTestId('morph9-analysis-result')).not.toBeInTheDocument()
    expect(within(activity).getAllByTestId(/^morph9-stage-/)[1]).toHaveTextContent('أكمل المرحلة السابقة')
    await user.click(within(activity).getByRole('button', { name: 'إعادة التحليل' }))
    // بعد التصفير تبقى المرحلة الأولى فقط مفتوحة، والباقي مقفل.
    expect(activity.querySelectorAll('select')).toHaveLength(1)
    for (const stage of within(activity).getAllByTestId(/^morph9-stage-/)) {
      const select = stage.querySelector('select')
      if (select) expect(select).toHaveValue('')
      else expect(stage).toHaveTextContent('أكمل المرحلة السابقة لتظهر هذه المرحلة')
    }
    noExamDisclosure()
  })

  it('يميّز النوع الصرفي والموقع الإعرابي في مختبر الجملة ويطلب الحقلين معًا', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('مختبر الجملة'))
    const activity = screen.getByTestId('morph9-lab-positions')
    const items = C.positionLab.items
    expect(within(activity).getAllByRole('group')).toHaveLength(items.length)
    for (const item of items) {
      const card = screen.getByTestId(`morph9-practice-${item.id}`)
      const check = within(card).getByRole('button', { name: 'تحقق من التحليل' })
      expect(check).toBeDisabled()
      await user.selectOptions(within(card).getByRole('combobox', { name: `${item.sentence} — النوع الصرفي` }), item.kind)
      expect(check).toBeDisabled()
      await user.selectOptions(within(card).getByRole('combobox', { name: `${item.sentence} — الموقع الإعرابي` }), item.position)
      await user.click(check)
      expect(within(card).getByRole('status')).toHaveTextContent('تحليل صحيح')
      expect(within(card).getByRole('status')).toHaveTextContent(item.explanation)
    }
    // إجابة نصف صحيحة لا تُقبل.
    const first = screen.getByTestId(`morph9-practice-${items[0].id}`)
    await user.selectOptions(within(first).getByRole('combobox', { name: `${items[0].sentence} — النوع الصرفي` }), 'اسم فاعل')
    await user.click(within(first).getByRole('button', { name: 'تحقق من التحليل' }))
    expect(within(first).getByRole('status')).toHaveTextContent('راجع التحليل')
    await user.click(within(activity).getByRole('button', { name: 'إعادة النشاط' }))
    for (const select of within(activity).getAllByRole('combobox')) expect(select).toHaveValue('')
  })
})

describe('morphology 09 — التدريبات الأصلية الاثنا عشر وزرّاها', () => {
  it('يحفظ البنود الاثني عشر وخياراتها، ويفصل الزرين، ويعيد ضبط الثلاثة معًا', async () => {
    const user = userEvent.setup()
    openLesson()
    for (const group of S.trainings.groups) {
      await user.click(openStep(group.heading))
      const activity = screen.getByTestId(`morph9-training-${group.id}`)
      expect(within(activity).getAllByRole('group')).toHaveLength(group.items.length)
      for (const item of group.items) {
        const card = screen.getByTestId(`morph9-practice-${item.id}`)
        expect(card).toHaveTextContent(item.prompt)
        expect(within(card).getAllByRole('radio').map((radio) => radio.getAttribute('value'))).toEqual(item.options)
        expect(within(card).queryByRole('status')).not.toBeInTheDocument()
      }
      expect(activity).toHaveTextContent('لا تدخل في درجة اختبار نهاية الدرس')
    }
    // اختيار في التدريب الأول وآخر في الثالث، ثم كشف مشترك.
    await user.click(openStep(S.trainings.groups[0].heading))
    await user.click(within(screen.getByTestId('morph9-practice-training-1')).getByRole('radio', { name: 'فعل' }))
    await user.click(openStep(S.trainings.groups[2].heading))
    await user.click(within(screen.getByTestId('morph9-practice-training-9')).getByRole('radio', { name: 'إِفْعال' }))
    await user.click(screen.getByRole('button', { name: C.trainingControls.reveal }))
    expect(within(screen.getByTestId('morph9-training-three')).getAllByRole('status')).toHaveLength(4)
    await user.click(openStep(S.trainings.groups[0].heading))
    expect(within(screen.getByTestId('morph9-training-one')).getAllByRole('status')).toHaveLength(4)
    expect(within(screen.getByTestId('morph9-practice-training-1')).getByRole('radio', { name: 'فعل' })).toBeChecked()
    expect(within(screen.getByTestId('morph9-practice-training-1')).getByRole('status')).toHaveTextContent('تحتاج الإجابة إلى مراجعة')
    expect(within(screen.getByTestId('morph9-practice-training-2')).getByRole('status')).toHaveTextContent('لم تختر إجابة بعد')
    expect(within(screen.getByTestId('morph9-practice-training-1')).getByRole('status')).toHaveTextContent('اسم فاعل')
    await user.click(openStep(S.trainings.groups[1].heading))
    expect(within(screen.getByTestId('morph9-training-two')).getAllByRole('status')).toHaveLength(4)
    // إعادة التدريبات تمسح الاختيارات والحالات في التدريبات الثلاثة.
    await user.click(screen.getByRole('button', { name: C.trainingControls.reset }))
    for (const group of S.trainings.groups) {
      await user.click(openStep(group.heading))
      const activity = screen.getByTestId(`morph9-training-${group.id}`)
      expect(within(activity).queryByRole('status')).not.toBeInTheDocument()
      for (const radio of within(activity).getAllByRole('radio')) expect(radio).not.toBeChecked()
    }
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('morph9-solutions-locked')).toBeInTheDocument()
  })

  it('يعرض لكل بند حلًّا منصوبًا من المنصة بخطواته ومشتتاته', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep(S.trainings.groups[0].heading))
    await user.click(screen.getByRole('button', { name: C.trainingControls.reveal }))
    for (const item of S.trainings.groups[0].items) {
      const card = screen.getByTestId(`morph9-practice-${item.id}`)
      const solution = C.trainingSolutions[item.number]
      expect(card).toHaveTextContent(solution.answer)
      for (const line of [...solution.steps, ...solution.distractors]) expect(card).toHaveTextContent(line)
      expect(card).toHaveTextContent('حلول أعدّتها المنصة')
    }
    expect(EXPECTED_TRAINING_KEYS).toHaveLength(12)
  })
})

describe('morphology 09 — التسليم النهائي هو حدّ الكشف الوحيد', () => {
  it('يتحقق من الصفحات صامتًا، ويحفظ كل حقل، ويسلّم ٢٠/٢٠، ويعيد القفل عند التعديل، ويصفّر', async () => {
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
    for (const page of C.testDefinition.pages) {
      await user.click(openStep(page.title))
      for (const question of page.questions) {
        const card = screen.getByTestId(`morph9-question-${question.id}`)
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
    expect(screen.getByTestId('morph9-solutions-locked')).toHaveTextContent('التحقق من الصفحات لا يكشف الحلول')
    noExamDisclosure()
    await user.click(openStep('تسليم الاختبار والنتيجة'))
    noExamDisclosure()
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار وإظهار النتيجة' }))
    expect(screen.getByTestId('morph9-final-result')).toHaveTextContent('٢٠ / ٢٠')
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getAllByTestId(/^solution-morph9-q/)).toHaveLength(20)
    for (const question of questions) expect(screen.getByTestId(`solution-${question.id}`)).toHaveTextContent(question.explanation!)
    await user.click(openStep(C.testDefinition.pages[1].title))
    expect(screen.getAllByTestId(/^test-feedback-/)).toHaveLength(5)
    await user.click(within(screen.getByTestId('morph9-question-morph9-q06')).getByRole('radio', { name: 'فِعالة' }))
    noExamDisclosure()
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    noExamDisclosure()
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('morph9-solutions-locked')).toBeInTheDocument()
    await user.click(openStep('تسليم الاختبار والنتيجة'))
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار وإظهار النتيجة' }))
    expect(screen.getByTestId('morph9-final-result')).toHaveTextContent('١٩ / ٢٠')
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
    expect(screen.getByTestId('morph9-solutions-locked')).toBeInTheDocument()
  }, 30_000)

  it('يسلّم محاولة ناقصة بقواعد المحرك المشترك ويفرّق بين الخطأ والفراغ', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep(C.testDefinition.pages[0].title))
    await user.click(within(screen.getByTestId('morph9-question-morph9-q01')).getByRole('radio', { name: 'السِّباحة' }))
    await user.click(within(screen.getByTestId('morph9-question-morph9-q02')).getByRole('radio', { name: 'مصدر' }))
    // سؤال المطابقة يبقى ناقصًا: حقل واحد من حقلين.
    await user.selectOptions(
      within(screen.getByTestId('morph9-question-morph9-q04')).getByRole('combobox', { name: `${questions[3].prompt} — مُنْتَظِرٌ في «المُنْتَظِرونَ واقِفونَ»` }),
      'اسم فاعل',
    )
    await user.click(openStep('تسليم الاختبار والنتيجة'))
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار وإظهار النتيجة' }))
    expect(screen.getByTestId('morph9-final-result')).toHaveTextContent('١ / ٢٠')
    expect(screen.getByTestId('morph9-final-result')).toHaveTextContent('غير صحيحة: ١ · لم تُجب: ١٨')
    await user.click(openStep(C.testDefinition.pages[0].title))
    expect(screen.getByTestId('test-feedback-morph9-q01')).toHaveTextContent('إجابة صحيحة')
    expect(screen.getByTestId('test-feedback-morph9-q02')).toHaveTextContent('إجابة غير صحيحة')
    expect(screen.getByTestId('test-feedback-morph9-q03')).toHaveTextContent('لم تُجب')
    expect(screen.getByTestId('test-feedback-morph9-q04')).toHaveTextContent('لم تُجب')
  })
})

describe('morphology 09 — بوابة المعلم القائمة ومادة كاملة قابلة للتصفح', () => {
  it('يبوّب الجداول والحلول الاثني عشر والإعراب ومفاتيح الاختبار، ثم يعيد الإقفال', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('منطقة خاصة بالمعلم'))
    expect(screen.queryByTestId('morph9-teacher-material')).not.toBeInTheDocument()
    noExamDisclosure()
    await user.type(screen.getByLabelText('كلمة المرور'), 'incorrect')
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByRole('alert')).toHaveTextContent('كلمة المرور غير صحيحة')
    expect(screen.queryByTestId('morph9-teacher-material')).not.toBeInTheDocument()
    await user.clear(screen.getByLabelText('كلمة المرور'))
    await user.type(screen.getByLabelText('كلمة المرور'), COURSE_TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    const material = screen.getByTestId('morph9-teacher-material')
    const sections = material.querySelectorAll('details')
    expect(sections).toHaveLength(8)
    for (const section of sections) {
      expect(section).not.toHaveAttribute('open')
      await user.click(section.querySelector('summary')!)
      expect(section).toHaveAttribute('open')
    }
    // الجداول الأربعة + جدول التحليل الصرفي.
    expect(within(screen.getByTestId('morph9-table-teacher-basics')).getAllByRole('row')).toHaveLength(9)
    expect(within(screen.getByTestId('morph9-table-teacher-kinds')).getAllByRole('row')).toHaveLength(5)
    expect(within(screen.getByTestId('morph9-table-teacher-triliteral')).getAllByRole('row')).toHaveLength(11)
    expect(within(screen.getByTestId('morph9-table-teacher-augmented')).getAllByRole('row')).toHaveLength(9)
    expect(within(screen.getByTestId('morph9-table-teacher-analysis')).getAllByRole('row').length).toBeGreaterThanOrEqual(19)
    // حلول التدريبات الاثني عشر بخطواتها ومشتتاتها.
    expect(screen.getAllByTestId(/^morph9-teacher-training-/)).toHaveLength(12)
    for (const item of S.trainings.groups.flatMap((group) => [...group.items])) {
      const solution = screen.getByTestId(`morph9-teacher-${item.id}`)
      expect(solution).toHaveTextContent(C.trainingSolutions[item.number].answer)
      for (const line of [...C.trainingSolutions[item.number].steps, ...C.trainingSolutions[item.number].distractors]) {
        expect(solution).toHaveTextContent(line)
      }
    }
    // التحليل النحوي الكامل.
    for (const entry of C.parsings) expect(material).toHaveTextContent(entry.sentence)
    expect(material).toHaveTextContent('مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره')
    expect(material).toHaveTextContent('مفعول مطلق منصوب وعلامة نصبه الياء لأنه مثنى')
    // مفاتيح الاختبار العشرين ورابطا التنزيل.
    expect(screen.getAllByTestId(/^solution-morph9-q/)).toHaveLength(20)
    for (const question of questions) expect(screen.getByTestId(`solution-${question.id}`)).toHaveTextContent(question.explanation!)
    expect(material).toHaveTextContent(C.clarifications.samai)
    expect(within(material).getByRole('link', { name: /docs\/source\/morphology-lesson-09\.md/ })).toHaveAttribute('download', 'morphology-lesson-09.md')
    expect(within(material).getByRole('link', { name: /docs\/morphology-lesson-09-audit\.md/ })).toHaveAttribute('download', 'morphology-lesson-09-audit.md')
    await user.click(screen.getByRole('button', { name: 'إغلاق المساحة' }))
    expect(screen.queryByTestId('morph9-teacher-material')).not.toBeInTheDocument()
    noExamDisclosure()
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('morph9-solutions-locked')).toBeInTheDocument()
  }, 30_000)
})
