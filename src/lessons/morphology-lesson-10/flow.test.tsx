import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from '../../app/App'
import { COURSE_TEACHER_PASSWORD } from '../../shared/teacher/teacherPassword'
import sourceMarkdown from '../../../docs/source/morphology-lesson-10.md?raw'
import * as C from './content'
import { EXAM_ANSWERS, EXPECTED_COMPREHENSIVE, EXPECTED_TRAINING_KEYS, EXPECTED_TRILITERAL } from './test-fixtures'

const S = C.sourceContent
const questions = C.testDefinition.pages.flatMap((page) => page.questions)
const TEACHING_STEPS = 24
const TOTAL_STEPS = 31

const openStep = (name: string) =>
  within(screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' })).getByRole('button', { name: new RegExp(name) })
function openLesson() {
  window.location.hash = '#/lesson/morphology-lesson-10'
  return render(<App />)
}
function activeStep(): HTMLElement {
  return document.querySelector('.lesson-step')!
}
function noExamDisclosure() {
  expect(
    document.querySelectorAll(
      '[data-testid^="test-feedback-"], [data-testid^="test-page-summary-"], [data-testid^="solution-morph10-q"], [data-answer], [data-correct], [data-solution], .test-question__correct, .test-question__status',
    ),
  ).toHaveLength(0)
  expect(screen.queryByTestId('morph10-final-result')).not.toBeInTheDocument()
  for (const question of questions) {
    expect(document.body.innerHTML).not.toContain(question.explanation)
    expect(document.body.innerHTML).not.toContain(question.rule)
  }
}
async function answerPage(user: ReturnType<typeof userEvent.setup>, pageIndex: number) {
  const page = C.testDefinition.pages[pageIndex]
  await user.click(openStep(page.title))
  for (const question of page.questions) {
    const fieldset = screen.getByTestId(`morph10-question-${question.id}`)
    for (const [fieldIndex, field] of question.fields.entries()) {
      const values = EXAM_ANSWERS[`${question.id}:${fieldIndex}`]
      if (field.kind === 'choice') await user.click(within(fieldset).getByRole('radio', { name: values[0] }))
      else if (field.kind === 'multi') for (const value of values) await user.click(within(fieldset).getByRole('checkbox', { name: value }))
      else if (field.kind === 'select') await user.selectOptions(within(fieldset).getByRole('combobox', { name: `${question.prompt} — ${field.label}` }), values[0])
    }
  }
}

describe('morphology 10 — المسار والتسجيل وعرض المصدر', () => {
  it('يُفتح من البطاقة العاشرة بعد التاسعة، ويحفظ RTL والمسار، ويعود إلى الصرف', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/sections/morphology'
    render(<App />)
    const links = within(screen.getByRole('list', { name: 'دروس القسم' })).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      Array.from({ length: 11 }, (_, index) => `#/lesson/morphology-lesson-${String(index + 1).padStart(2, '0')}`),
    )
    await user.click(screen.getByRole('link', { name: C.lessonTitle }))
    expect(await screen.findByRole('heading', { name: S.header.firstTitle, level: 2 })).toBeInTheDocument()
    expect(document.querySelector('.lesson-page')).toHaveAttribute('dir', 'rtl')
    expect(document.title).toContain('الدرس العاشر: أنواع المصادر وأوزانها')
    expect(within(screen.getByRole('navigation', { name: 'مسار التنقل' })).getByRole('link', { name: 'الصرف' })).toHaveAttribute('href', '#/sections/morphology')
    expect(document.querySelectorAll('.lesson-step')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'السابق' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'التالي' }))
    expect(activeStep()).toHaveAttribute('id', 'morph10-review')
    expect(within(activeStep()).getByRole('heading', { level: 2 })).toHaveFocus()
    expect(document.querySelector('.lesson-flow__progress')).toHaveTextContent(`الخطوة 2 من ${TOTAL_STEPS}`)
    await user.click(screen.getByRole('button', { name: 'السابق' }))
    expect(activeStep()).toHaveAttribute('id', 'morph10-intro')
    await user.click(openStep('منطقة خاصة بالمعلم'))
    await user.click(screen.getByRole('button', { name: 'إتمام الدرس' }))
    expect(await screen.findByRole('heading', { name: 'الصرف', level: 1 })).toBeInTheDocument()
    expect(window.location.hash).toBe('#/sections/morphology')
  })

  it('يعرض كل خلية مصدر جوهرية في خطوات التدريس المُصيَّرة، لا في بيانات مهملة', async () => {
    const user = userEvent.setup()
    openLesson()
    const chunks: string[] = []
    for (let index = 0; index < TEACHING_STEPS; index++) {
      expect(document.querySelectorAll('.lesson-step')).toHaveLength(1)
      chunks.push(activeStep().textContent ?? '')
      noExamDisclosure()
      if (index < TEACHING_STEPS - 1) await user.click(screen.getByRole('button', { name: 'التالي' }))
    }
    expect(activeStep()).toHaveAttribute('id', 'morph10-summary')
    const text = chunks.join('\n').replace(/\s+/g, ' ')
    const normalized = (value: string) => value.replace(/\s+/g, ' ').trim()
    const body = sourceMarkdown.slice(sourceMarkdown.indexOf('-->') + 3)
    const cells = body.split('\n').flatMap((line) => {
      const trimmed = line.trim()
      if (!trimmed) return []
      if (/^\|[-:\s|]+\|$/.test(trimmed)) return []
      if (trimmed.startsWith('|')) return trimmed.split('|').map((cell) => cell.trim()).filter(Boolean)
      return [trimmed.replace(/^(?:- |\d+\. )/, '')]
    })
    expect(cells).toHaveLength(413)
    for (const cell of cells) {
      if (cell === S.trainings.rawControls) {
        expect(text).toContain(C.trainingControls.reveal)
        expect(text).toContain(C.trainingControls.reset)
      } else if (cell === S.originalFinal.rawControl) {
        expect(text).toContain(C.originalFinalControls.check)
      } else if (cell === S.comprehensive.sourceColumnNote) {
        // ت-١: تسمية العمود المصحَّحة «الفعل» تظهر، والتسمية الأصلية محفوظة في المصدر والتدقيق.
        expect(text).toContain('الفعل')
        expect(C.clarifications.comprehensiveHeader).toContain('وزن الفعل')
      } else {
        const needle = normalized(cell).replace(/[.«»]$/u, '')
        expect(text, `Missing rendered source content: ${cell}`).toContain(needle)
      }
    }
    expect(activeStep()).toHaveTextContent('لا يُنشئ هذا الدرس درسًا حادي عشر ولا اختبار وحدة')
    expect(within(activeStep()).queryByRole('link', { name: /الدرس الحادي عشر/ })).not.toBeInTheDocument()
  })

  it('يعرض الجداول المحورية بعناوين محدّدة النطاق وكلمات غير مكسورة', async () => {
    const user = userEvent.setup()
    openLesson()
    const tables: Array<[string, string, number, number]> = [
      ['مراجعة سريعة', 'morph10-table-review', 4, 3],
      ['مصادر الفعل الثلاثي', 'morph10-table-triliteral', 9, 3],
      ['مصادر الفعل الرباعي', 'morph10-table-quadrilateral', 4, 3],
      ['ملخّص مصادر الأفعال الخماسية', 'morph10-table-quintuple-summary', 4, 3],
      ['مصادر الفعل السداسي', 'morph10-table-sextuple', 4, 3],
      ['جدول شامل لأهم الأوزان', 'morph10-table-comprehensive', 10, 4],
    ]
    for (const [stepName, testId, rows, columns] of tables) {
      await user.click(openStep(stepName))
      const table = screen.getByTestId(testId)
      expect(within(table).getAllByRole('row')).toHaveLength(rows + 1)
      expect(table.querySelectorAll('th[scope="col"]')).toHaveLength(columns)
      expect(table.querySelectorAll('th[scope="row"]')).toHaveLength(rows)
      expect(table.closest('[role="region"]')).toHaveAttribute('tabindex', '0')
      for (const word of table.querySelectorAll('.morph10-word')) {
        expect(word.textContent!.trim().length).toBeGreaterThan(1)
        expect(word).toHaveAttribute('dir', 'rtl')
      }
    }
    await user.click(openStep('مصادر الفعل الثلاثي'))
    const tri = screen.getByTestId('morph10-table-triliteral')
    EXPECTED_TRILITERAL.forEach((row, index) => {
      const cells = tri.querySelectorAll('tbody tr')[index].querySelectorAll('th, td')
      expect(cells[0]).toHaveTextContent(row[0]); expect(cells[1]).toHaveTextContent(row[1]); expect(cells[2]).toHaveTextContent(row[2])
    })
    await user.click(openStep('جدول شامل لأهم الأوزان'))
    const comp = screen.getByTestId('morph10-table-comprehensive')
    EXPECTED_COMPREHENSIVE.forEach((row, index) => {
      const cells = comp.querySelectorAll('tbody tr')[index].querySelectorAll('th, td')
      row.forEach((value, cellIndex) => expect(cells[cellIndex]).toHaveTextContent(value))
    })
    await user.click(openStep('مصادر الفعل الخماسي'))
    expect(screen.getByTestId('morph10-table-quintuple-infaala')).toBeInTheDocument()
    expect(screen.getByTestId('morph10-table-quintuple-iftaala')).toBeInTheDocument()
  })

  it('يرفض الرابط المباشر للدرس الثاني عشر واختبار الوحدة', () => {
    window.location.hash = '#/lesson/morphology-lesson-12'
    render(<App />)
    expect(screen.getByRole('heading', { name: 'الدرس غير متاح' })).toBeInTheDocument()
    expect(document.querySelector('.lesson-step')).toBeNull()
  })
})

describe('morphology 10 — سبعة أنشطة عاملة بلوحة المفاتيح', () => {
  it.each(C.practiceLabs)('يصحّح $title ويعيد ضبطه دون تسريب مفتاح الاختبار', async (lab) => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep(lab.title))
    const activity = screen.getByTestId(`morph10-lab-${lab.id}`)
    expect(within(activity).getAllByRole('group')).toHaveLength(lab.items.length)
    for (const [index, item] of lab.items.entries()) {
      const card = screen.getByTestId(`morph10-practice-${item.id}`)
      const check = within(card).getByRole('button', { name: 'تحقق من الإجابة' })
      expect(check).toBeDisabled()
      const option = index === 0 ? item.options.find((v) => v !== item.answer)! : item.answer
      await user.click(within(card).getByRole('radio', { name: option }))
      expect(within(card).queryByRole('status')).not.toBeInTheDocument()
      check.focus()
      await user.keyboard('{Enter}')
      expect(within(card).getByRole('status')).toHaveTextContent(index === 0 ? 'تحتاج الإجابة إلى مراجعة' : 'إجابة صحيحة')
      expect(within(card).getByRole('status')).toHaveTextContent(item.explanation)
      const next = item.options.find((v) => v !== option)!
      await user.click(within(card).getByRole('radio', { name: next }))
      expect(within(card).queryByRole('status')).not.toBeInTheDocument()
    }
    await user.click(within(activity).getByRole('button', { name: 'إعادة النشاط' }))
    for (const radio of within(activity).getAllByRole('radio')) expect(radio).not.toBeChecked()
    noExamDisclosure()
  })

  it('يطلب وزني الفعل والمصدر معًا في مختبر المقارنة ويرفض النصف الصحيح', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep(C.comparisonLab.title))
    const activity = screen.getByTestId('morph10-lab-comparison')
    for (const item of C.comparisonLab.items) {
      const card = screen.getByTestId(`morph10-practice-${item.id}`)
      const check = within(card).getByRole('button', { name: 'تحقق من التحليل' })
      expect(check).toBeDisabled()
      await user.selectOptions(within(card).getByRole('combobox', { name: `${item.verb} — وزن الفعل` }), item.verbWeight)
      expect(check).toBeDisabled()
      await user.selectOptions(within(card).getByRole('combobox', { name: `${item.masdar} — وزن المصدر` }), item.masdarWeight)
      await user.click(check)
      expect(within(card).getByRole('status')).toHaveTextContent('تحليل صحيح')
    }
    const first = C.comparisonLab.items[0]
    const card = screen.getByTestId(`morph10-practice-${first.id}`)
    await user.selectOptions(within(card).getByRole('combobox', { name: `${first.masdar} — وزن المصدر` }), 'تَفاعُل')
    await user.click(within(card).getByRole('button', { name: 'تحقق من التحليل' }))
    expect(within(card).getByRole('status')).toHaveTextContent('راجع التحليل')
    await user.click(within(activity).getByRole('button', { name: 'إعادة النشاط' }))
    for (const select of within(activity).getAllByRole('combobox')) expect(select).toHaveValue('')
  })

  it('يفتح مراحل مختبر التحليل الخمس تدريجيًا ويشرح الخطأ قبل المتابعة', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep(C.analysisLab.title))
    const activity = screen.getByTestId('morph10-lab-analysis')
    const firstCase = C.analysisLab.cases[0]
    let stages = within(activity).getAllByTestId(new RegExp(`^morph10-stage-${firstCase.id}-`))
    expect(stages).toHaveLength(5)
    expect(stages[1]).toHaveTextContent('أكمل المرحلة السابقة لتظهر هذه المرحلة')
    await user.selectOptions(within(stages[0]).getByRole('combobox'), 'اِرْتَفَعَ')
    await user.click(within(stages[0]).getByRole('button', { name: 'تحقق من هذه المرحلة' }))
    expect(within(stages[0]).getByRole('status')).toHaveTextContent('تحتاج هذه المرحلة إلى مراجعة')
    stages = within(activity).getAllByTestId(new RegExp(`^morph10-stage-${firstCase.id}-`))
    expect(stages[1]).toHaveTextContent('أكمل المرحلة السابقة')
    for (const [index, stage] of firstCase.stages.entries()) {
      const current = within(activity).getAllByTestId(new RegExp(`^morph10-stage-${firstCase.id}-`))[index]
      await user.selectOptions(within(current).getByRole('combobox'), stage.answer)
      await user.click(within(current).getByRole('button', { name: 'تحقق من هذه المرحلة' }))
    }
    expect(screen.getByTestId('morph10-lab-analysis-result')).toHaveTextContent(firstCase.masdar)
    await user.click(within(activity).getByRole('button', { name: 'قَلْقَلَة' }))
    expect(screen.queryByTestId('morph10-lab-analysis-result')).not.toBeInTheDocument()
    await user.click(within(activity).getByRole('button', { name: 'إعادة التحليل' }))
    expect(activity.querySelectorAll('select')).toHaveLength(1)
    noExamDisclosure()
  })

  it('ينجز تحدّي المصدر ثم الوزن ثم السبب على ثلاث خطوات', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep(C.challengeLab.title))
    const activity = screen.getByTestId('morph10-lab-challenge')
    const firstCase = C.challengeLab.cases[0]
    for (const [index, stage] of firstCase.stages.entries()) {
      const current = within(activity).getAllByTestId(new RegExp(`^morph10-stage-${firstCase.id}-`))[index]
      await user.selectOptions(within(current).getByRole('combobox'), stage.answer)
      await user.click(within(current).getByRole('button', { name: 'تحقق من هذه المرحلة' }))
      expect(within(current).getByRole('status')).toHaveTextContent(stage.explanation)
    }
    expect(screen.getByTestId('morph10-lab-challenge-result')).toBeInTheDocument()
  })
})

describe('morphology 10 — التدريبات الأحد عشر والاختبار الأصلي الستة', () => {
  it('يحفظ البنود والخيارات، ويفصل زري التدريبات، ويعيد ضبط المجموعات الثلاث', async () => {
    const user = userEvent.setup()
    openLesson()
    for (const group of S.trainings.groups) {
      await user.click(openStep(group.heading))
      const activity = screen.getByTestId(`morph10-training-${group.id}`)
      expect(within(activity).getAllByRole('group')).toHaveLength(group.items.length)
      for (const item of group.items) {
        const card = screen.getByTestId(`morph10-practice-${item.id}`)
        expect(within(card).getAllByRole('radio').map((r) => r.getAttribute('value'))).toEqual(item.options)
        expect(within(card).queryByRole('status')).not.toBeInTheDocument()
      }
    }
    await user.click(openStep(S.trainings.groups[0].heading))
    await user.click(within(screen.getByTestId('morph10-practice-training-1')).getByRole('radio', { name: 'تَدَحْرُج' }))
    await user.click(openStep(S.trainings.groups[2].heading))
    await user.click(within(screen.getByTestId('morph10-practice-training-11')).getByRole('radio', { name: 'تَزَلْزُل' }))
    await user.click(screen.getByRole('button', { name: C.trainingControls.reveal }))
    expect(within(screen.getByTestId('morph10-training-three')).getAllByRole('status')).toHaveLength(3)
    await user.click(openStep(S.trainings.groups[0].heading))
    expect(within(screen.getByTestId('morph10-training-one')).getAllByRole('status')).toHaveLength(4)
    expect(within(screen.getByTestId('morph10-practice-training-1')).getByRole('status')).toHaveTextContent('تَفَعْلُل')
    await user.click(screen.getByRole('button', { name: C.trainingControls.reset }))
    for (const group of S.trainings.groups) {
      await user.click(openStep(group.heading))
      const activity = screen.getByTestId(`morph10-training-${group.id}`)
      expect(within(activity).queryByRole('status')).not.toBeInTheDocument()
      for (const radio of within(activity).getAllByRole('radio')) expect(radio).not.toBeChecked()
    }
    expect(EXPECTED_TRAINING_KEYS).toHaveLength(11)
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('morph10-solutions-locked')).toBeInTheDocument()
  })

  it('يصحّح الاختبار الختامي الأصلي بزره الوارد ويعيد ضبطه', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep(S.originalFinal.heading))
    const area = screen.getByTestId('morph10-original-final')
    for (const item of S.originalFinal.items) {
      const card = screen.getByTestId(`morph10-practice-${item.id}`)
      expect(within(card).getAllByRole('radio').map((r) => r.getAttribute('value'))).toEqual(item.options)
      await user.click(within(card).getByRole('radio', { name: C.originalFinalSolutions[item.number].answer }))
      expect(within(card).queryByRole('status')).not.toBeInTheDocument()
    }
    await user.click(within(area).getByRole('button', { name: C.originalFinalControls.check }))
    expect(screen.getByTestId('morph10-original-result')).toHaveTextContent('٦ / ٦')
    for (const item of S.originalFinal.items) {
      expect(screen.getByTestId(`morph10-practice-${item.id}`)).toHaveTextContent(C.originalFinalSolutions[item.number].answer)
    }
    await user.click(within(area).getByRole('button', { name: C.originalFinalControls.reset }))
    expect(screen.queryByTestId('morph10-original-result')).not.toBeInTheDocument()
    for (const radio of within(area).getAllByRole('radio')) expect(radio).not.toBeChecked()
    noExamDisclosure()
  })
})

describe('morphology 10 — التسليم النهائي هو حدّ كشف الاختبار المستقل الوحيد', () => {
  it('يتحقق صامتًا، يحفظ الحقول، يسلّم ٢٠/٢٠، يقفل عند التعديل، ويصفّر عند الإعادة', async () => {
    const user = userEvent.setup()
    openLesson()
    for (let index = 0; index < 4; index++) {
      await answerPage(user, index)
      noExamDisclosure()
      await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
      expect(screen.getByTestId(`test-page-saved-${C.testDefinition.pages[index].id}`)).toBeInTheDocument()
      noExamDisclosure()
    }
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('morph10-solutions-locked')).toBeInTheDocument()
    await user.click(openStep('تسليم الاختبار والنتيجة'))
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار وإظهار النتيجة' }))
    expect(screen.getByTestId('morph10-final-result')).toHaveTextContent('٢٠ / ٢٠')
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getAllByTestId(/^solution-morph10-q/)).toHaveLength(20)
    await user.click(openStep(C.testDefinition.pages[0].title))
    expect(screen.getAllByTestId(/^test-feedback-/)).toHaveLength(5)
    await user.click(within(screen.getByTestId('morph10-question-morph10-q01')).getByRole('radio', { name: 'تَصْبِير' }))
    noExamDisclosure()
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('morph10-solutions-locked')).toBeInTheDocument()
    await user.click(openStep('تسليم الاختبار والنتيجة'))
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار وإظهار النتيجة' }))
    expect(screen.getByTestId('morph10-final-result')).toHaveTextContent('١٩ / ٢٠')
    await user.click(screen.getByRole('button', { name: 'إعادة الاختبار' }))
    noExamDisclosure()
    await user.click(openStep(C.testDefinition.pages[0].title))
    for (const radio of within(screen.getByTestId(`test-page-${C.testDefinition.pages[0].id}`)).queryAllByRole('radio')) expect(radio).not.toBeChecked()
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('morph10-solutions-locked')).toBeInTheDocument()
  }, 30_000)
})

describe('morphology 10 — بوابة المعلم القائمة ومادة كاملة قابلة للتصفح', () => {
  it('يبوّب الجداول والحلول الأحد عشر والستة والعشرين ومفاتيح الأنشطة، ثم يعيد الإقفال', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('منطقة خاصة بالمعلم'))
    expect(screen.queryByTestId('morph10-teacher-material')).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('كلمة المرور'), 'incorrect')
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByRole('alert')).toHaveTextContent('كلمة المرور غير صحيحة')
    await user.clear(screen.getByLabelText('كلمة المرور'))
    await user.type(screen.getByLabelText('كلمة المرور'), COURSE_TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    const material = screen.getByTestId('morph10-teacher-material')
    const sections = material.querySelectorAll('details')
    expect(sections).toHaveLength(9)
    for (const section of sections) {
      expect(section).not.toHaveAttribute('open')
      await user.click(section.querySelector('summary')!)
      expect(section).toHaveAttribute('open')
    }
    expect(within(screen.getByTestId('morph10-table-teacher-triliteral')).getAllByRole('row')).toHaveLength(10)
    expect(within(screen.getByTestId('morph10-table-teacher-comprehensive')).getAllByRole('row')).toHaveLength(11)
    expect(screen.getByTestId('morph10-table-teacher-analysis').querySelectorAll('tbody tr').length).toBeGreaterThanOrEqual(28)
    for (const item of [...S.trainings.groups.flatMap((g) => [...g.items]), ...S.originalFinal.items]) {
      expect(screen.getByTestId(`morph10-teacher-${item.id}`)).toHaveTextContent('الإجابة:')
    }
    expect(material).toHaveTextContent('الحلول التفصيلية لاختبار الدرس العاشر')
    expect(within(material).getByRole('link', { name: /docs\/source\/morphology-lesson-10\.md/ })).toHaveAttribute('download', 'morphology-lesson-10.md')
    expect(within(material).getByRole('link', { name: /docs\/morphology-lesson-10-audit\.md/ })).toHaveAttribute('download', 'morphology-lesson-10-audit.md')
    expect(material).toHaveTextContent('لم يُنشأ درس حادي عشر ولا اختبار وحدة')
    await user.click(screen.getByRole('button', { name: 'إغلاق المساحة' }))
    expect(screen.queryByTestId('morph10-teacher-material')).not.toBeInTheDocument()
  })
})
