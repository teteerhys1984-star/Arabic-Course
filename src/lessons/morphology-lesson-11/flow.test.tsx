import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from '../../app/App'
import { COURSE_TEACHER_PASSWORD } from '../../shared/teacher/teacherPassword'
import sourceMarkdown from '../../../docs/source/morphology-lesson-11.md?raw'
import * as C from './content'
import {
  EXAM_ANSWERS, EXPECTED_HOMEWORK, EXPECTED_NON_TRILITERAL, EXPECTED_PREFACE, EXPECTED_TRAINING_KEYS,
  EXPECTED_TRILITERAL, EXPECTED_WEAK,
} from './test-fixtures'

const S = C.sourceContent
const questions = C.testDefinition.pages.flatMap((page) => page.questions)
const TEACHING_STEPS = 19
const TOTAL_STEPS = 26

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const openStep = (name: string) =>
  within(screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' })).getByRole('button', { name: new RegExp(escape(name)) })
function openLesson() {
  window.location.hash = '#/lesson/morphology-lesson-11'
  return render(<App />)
}
function activeStep(): HTMLElement {
  return document.querySelector('.lesson-step')!
}
function noExamDisclosure() {
  expect(
    document.querySelectorAll(
      '[data-testid^="test-feedback-"], [data-testid^="test-page-summary-"], [data-testid^="solution-morph11-q"], [data-answer], [data-correct], [data-solution], .test-question__correct, .test-question__status',
    ),
  ).toHaveLength(0)
  expect(screen.queryByTestId('morph11-final-result')).not.toBeInTheDocument()
  for (const question of questions) {
    expect(document.body.innerHTML).not.toContain(question.explanation)
    expect(document.body.innerHTML).not.toContain(question.rule)
  }
}
async function answerPage(user: ReturnType<typeof userEvent.setup>, pageIndex: number) {
  const page = C.testDefinition.pages[pageIndex]
  await user.click(openStep(page.title))
  for (const question of page.questions) {
    const fieldset = screen.getByTestId(`morph11-question-${question.id}`)
    for (const [fieldIndex, field] of question.fields.entries()) {
      const values = EXAM_ANSWERS[`${question.id}:${fieldIndex}`]
      if (field.kind === 'choice') await user.click(within(fieldset).getByRole('radio', { name: values[0] }))
      else if (field.kind === 'multi') for (const value of values) await user.click(within(fieldset).getByRole('checkbox', { name: value }))
      else if (field.kind === 'select') await user.selectOptions(within(fieldset).getByRole('combobox', { name: `${question.prompt} — ${field.label}` }), values[0])
    }
  }
}
/** مفتاح مقارنة النص المصيَّر: بلا مسافات أو ترقيم أو رموز تعبيرية؛ الحركات محفوظة. */
const keyOf = (value: string) => value.replace(/\p{Extended_Pictographic}/gu, '').replace(/[\s.،:؛«»"]/g, '')

describe('morphology 11 — المسار والتسجيل وعرض المصدر', () => {
  it('يُفتح من البطاقة الحادية عشرة بعد العاشرة، ويحفظ RTL والمسار، ويعود إلى الصرف', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/sections/morphology'
    render(<App />)
    const links = within(screen.getByRole('list', { name: 'دروس القسم' })).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      Array.from({ length: 14 }, (_, index) => `#/lesson/morphology-lesson-${String(index + 1).padStart(2, '0')}`),
    )
    await user.click(screen.getByRole('link', { name: C.lessonTitle }))
    expect(await screen.findByRole('heading', { name: S.header.journeyTitle, level: 2 })).toBeInTheDocument()
    expect(document.querySelector('.lesson-page')).toHaveAttribute('dir', 'rtl')
    expect(document.title).toContain('الدرس الحادي عشر: اسم الفاعل')
    expect(within(screen.getByRole('navigation', { name: 'مسار التنقل' })).getByRole('link', { name: 'الصرف' })).toHaveAttribute('href', '#/sections/morphology')
    expect(document.querySelectorAll('.lesson-step')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'السابق' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'التالي' }))
    expect(activeStep()).toHaveAttribute('id', 'morph11-objectives')
    expect(within(activeStep()).getByRole('heading', { level: 2 })).toHaveFocus()
    expect(document.querySelector('.lesson-flow__progress')).toHaveTextContent(`الخطوة 2 من ${TOTAL_STEPS}`)
    await user.click(screen.getByRole('button', { name: 'السابق' }))
    expect(activeStep()).toHaveAttribute('id', 'morph11-intro')
    await user.click(openStep('منطقة خاصة بالمعلم'))
    await user.click(screen.getByRole('button', { name: 'إتمام الدرس' }))
    expect(await screen.findByRole('heading', { name: 'الصرف', level: 1 })).toBeInTheDocument()
    expect(window.location.hash).toBe('#/sections/morphology')
  })

  it('يعرض كل سطر وخلية من المصدر في خطوات التدريس المُصيَّرة، بالنص المصحّح حيث لزم', async () => {
    const user = userEvent.setup()
    openLesson()
    const chunks: string[] = []
    for (let index = 0; index < TEACHING_STEPS; index++) {
      expect(document.querySelectorAll('.lesson-step')).toHaveLength(1)
      chunks.push(activeStep().textContent ?? '')
      noExamDisclosure()
      if (index < TEACHING_STEPS - 1) await user.click(screen.getByRole('button', { name: 'التالي' }))
    }
    expect(activeStep()).toHaveAttribute('id', 'morph11-next')
    const text = keyOf(chunks.join('\n'))
    const body = sourceMarkdown.slice(sourceMarkdown.indexOf('-->') + 3)
    const cells = body.split('\n').flatMap((line) => {
      const trimmed = line.trim()
      if (!trimmed) return []
      if (/^\|[-:\s|]+\|$/.test(trimmed)) return []
      if (trimmed.startsWith('|')) return trimmed.split('|').map((cell) => cell.trim()).filter(Boolean)
      return [trimmed.replace(/^(?:- |\d+\. )/, '')]
    })
    let checked = 0
    for (const cell of cells) {
      const needle = keyOf(cell)
      if (!needle) continue // خانات الواجب الفارغة تصير حقول إدخال
      const correction = C.corrections.find((item) => item.original === cell)
      if (correction) {
        expect(text, `Original wording rendered: ${cell}`).not.toContain(needle)
        expect(text).toContain(keyOf(correction.corrected))
      } else {
        expect(text, `Missing rendered source content: ${cell}`).toContain(needle)
      }
      checked++
    }
    expect(checked).toBeGreaterThan(300)
    // المعاينة نصية: لا رابط إلى درس ثانٍ عشر.
    expect(within(activeStep()).queryByRole('link')).not.toBeInTheDocument()
    expect(document.querySelector('a[href*="morphology-lesson-12"]')).toBeNull()
  })

  it('يعرض الجداول بعناوين محدّدة النطاق وكلمات غير مكسورة ومحتوى صحيح', async () => {
    const user = userEvent.setup()
    openLesson()
    const tables: Array<[string, string, number, number]> = [
      ['تمهيد: لاحظ الفرق بين الكلمات', 'morph11-table-preface', 3, 3],
      ['ما اسم الفاعل؟', 'morph11-table-quick', 3, 3],
      ['خطوات الصياغة بالتفصيل', 'morph11-table-triliteral', 10, 3],
      ['جدول المقارنة', 'morph11-table-non-triliteral', 6, 3],
      ['ماذا يحدث مع بعض الأفعال المعتلّة؟', 'morph11-table-weak', 6, 3],
      ['ماذا يحدث مع بعض الأفعال المعتلّة؟', 'morph11-table-defective-states', 4, 4],
      ['لا تخلط بين اسم الفاعل واسم المفعول والمصدر', 'morph11-table-compare', 6, 3],
    ]
    for (const [stepName, testId, rows, columns] of tables) {
      await user.click(openStep(stepName))
      const table = screen.getByTestId(testId)
      expect(within(table).getAllByRole('row')).toHaveLength(rows + 1)
      expect(table.querySelectorAll('th[scope="col"]')).toHaveLength(columns)
      expect(table.querySelectorAll('th[scope="row"]')).toHaveLength(rows)
      expect(table.closest('[role="region"]')).toHaveAttribute('tabindex', '0')
      for (const word of table.querySelectorAll('.morph11-word')) expect(word).toHaveAttribute('dir', 'rtl')
    }
    const expectRows = (testId: string, rows: readonly (readonly string[])[]) => {
      const table = screen.getByTestId(testId)
      rows.forEach((row, index) => {
        const cells = table.querySelectorAll('tbody tr')[index].querySelectorAll('th, td')
        row.forEach((value, cellIndex) => expect(cells[cellIndex]).toHaveTextContent(value))
      })
    }
    await user.click(openStep('تمهيد: لاحظ الفرق بين الكلمات'))
    expectRows('morph11-table-preface', EXPECTED_PREFACE)
    await user.click(openStep('خطوات الصياغة بالتفصيل'))
    expectRows('morph11-table-triliteral', EXPECTED_TRILITERAL)
    await user.click(openStep('جدول المقارنة'))
    expectRows('morph11-table-non-triliteral', EXPECTED_NON_TRILITERAL)
    await user.click(openStep('ماذا يحدث مع بعض الأفعال المعتلّة؟'))
    expectRows('morph11-table-weak', EXPECTED_WEAK)
    await user.click(openStep('كيف نصوغ اسم الفاعل من الفعل الثلاثي؟'))
    const anatomy = screen.getByTestId('morph11-anatomy')
    expect(within(anatomy).getAllByRole('listitem').map((item) => item.querySelector('strong')!.textContent)).toEqual(['فاء الكلمة', 'ألف الوزن', 'عين الكلمة', 'لام الكلمة'])
  })

  it('يعرض أمثلة غير الثلاثي سلاسلَ: الماضي ← المضارع ← اسم الفاعل، مع تنبيه «مُفيدًا»', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('أمثلة الصياغة من غير الثلاثي'))
    for (const id of ['akrama', 'allama', 'intalaqa', 'ijtamaa', 'istakhraja']) {
      const card = screen.getByTestId(`morph11-example-${id}`)
      const items = within(card).getAllByRole('listitem')
      expect(items).toHaveLength(3)
      expect(items[2].textContent).toMatch(/^اسم الفاعلمُ/)
    }
    await user.click(openStep('كيف أميّز اسم الفاعل في الجملة؟'))
    expect(screen.getByTestId('morph11-analysis-qaraa')).toHaveTextContent('أفادَ ← يُفيدُ ← مُفيد')
    expect(screen.getByTestId('morph11-analysis-maftuh')).toHaveTextContent('اسم مفعول')
  })

  it('يبقي انتقال الدرس التالي نصيًا في محتوى الدرس السابق، ويفتح الدرس ١٢ من تسجيله المستقل', () => {
    window.location.hash = '#/lesson/morphology-lesson-12'
    render(<App />)
    expect(screen.getByRole('heading', { name: 'اسم المفعول: كيف نعرف مَن وقع عليه الفعل؟', level: 3 })).toBeInTheDocument()
    expect(document.querySelector('.lesson-page')).toHaveAttribute('dir', 'rtl')
    expect(within(screen.getByRole('navigation', { name: 'مسار التنقل' })).getByRole('link', { name: 'الصرف' })).toHaveAttribute('href', '#/sections/morphology')
    expect(document.querySelector('.lesson-step')).toBeInTheDocument()
  })
})

describe('morphology 11 — التدريب التفاعلي (٨ أسئلة)', () => {
  it('يعدّ الإجابات مرة واحدة لكل سؤال، ويصحّح بزر «إظهار التصحيح» دون احتساب مكرر', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('تدريب تفاعلي: اختبر فهمك'))
    const area = screen.getByTestId('morph11-training')
    const counter = screen.getByTestId('morph11-training-counter')
    const progress = within(area).getByRole('progressbar', { name: 'تقدّم التدريب' })
    const reveal = within(area).getByRole('button', { name: S.training.control })
    expect(counter).toHaveTextContent('0 / 8')
    expect(progress).toHaveAttribute('aria-valuenow', '0')
    expect(reveal).toBeDisabled()
    for (const item of S.training.items) {
      const card = screen.getByTestId(`morph11-training-${item.number}`)
      expect(within(card).getAllByRole('radio').map((r) => r.getAttribute('value'))).toEqual(item.options)
    }
    const first = screen.getByTestId('morph11-training-1')
    await user.click(within(first).getByRole('radio', { name: 'مدروس' }))
    await user.click(within(first).getByRole('radio', { name: 'دراسة' }))
    await user.click(within(first).getByRole('radio', { name: 'دارس' }))
    expect(counter).toHaveTextContent('1 / 8')
    expect(within(area).queryByRole('status')).not.toBeInTheDocument()
    for (const [index, item] of S.training.items.entries()) {
      await user.click(within(screen.getByTestId(`morph11-training-${item.number}`)).getByRole('radio', { name: EXPECTED_TRAINING_KEYS[index] }))
    }
    expect(counter).toHaveTextContent('8 / 8')
    expect(progress).toHaveAttribute('aria-valuenow', '8')
    await user.click(reveal)
    expect(screen.getByTestId('morph11-training-score')).toHaveTextContent('8 / 8')
    await user.click(reveal)
    expect(screen.getByTestId('morph11-training-score')).toHaveTextContent('8 / 8')
    for (const item of S.training.items) {
      const status = within(screen.getByTestId(`morph11-training-${item.number}`)).getByRole('status')
      expect(status).toHaveTextContent('إجابة صحيحة')
      expect(status).toHaveTextContent(C.trainingKeys[item.id].explanation)
    }
    // تغيير إجابة بعد التصحيح يخفيه، وإعادة التصحيح تعكس الإجابة الجديدة.
    await user.click(within(screen.getByTestId('morph11-training-4')).getByRole('radio', { name: 'خارِج' }))
    expect(screen.queryByTestId('morph11-training-score')).not.toBeInTheDocument()
    expect(counter).toHaveTextContent('8 / 8')
    await user.click(reveal)
    expect(screen.getByTestId('morph11-training-score')).toHaveTextContent('7 / 8')
    expect(within(screen.getByTestId('morph11-training-4')).getByRole('status')).toHaveTextContent('تحتاج الإجابة إلى مراجعة')
    await user.click(within(area).getByRole('button', { name: 'إعادة التدريب' }))
    expect(counter).toHaveTextContent('0 / 8')
    for (const radio of within(area).getAllByRole('radio')) expect(radio).not.toBeChecked()
    expect(within(area).queryByRole('status')).not.toBeInTheDocument()
    noExamDisclosure()
  })
})

describe('morphology 11 — الاختبار الختامي (١٣ سؤالًا) والواجب', () => {
  it('يكشف نموذج الإجابة عند الطلب ويقارن الصياغة بالضبط وصح/خطأ', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('الاختبار الختامي'))
    const area = screen.getByTestId('morph11-final')
    expect(within(area).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(S.final.sections.map((s) => s.heading))
    for (let number = 1; number <= 13; number++) expect(screen.getByTestId(`morph11-final-${number}`)).toBeInTheDocument()
    expect(within(area).queryByText(/نموذج الإجابة:/)).not.toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: 'إجابتك عن السؤال 1' }), 'زارع')
    await user.type(screen.getByRole('textbox', { name: 'اسم الفاعل من كَتَبَ' }), 'كاتب')
    await user.type(screen.getByRole('textbox', { name: 'اسم الفاعل من أَحْسَنَ' }), 'مُحْسَن')
    await user.type(screen.getByRole('textbox', { name: 'اسم الفاعل من اِسْتَخْرَجَ' }), 'مُسْتَخْرِج')
    await user.click(within(screen.getByTestId('morph11-final-10')).getByRole('radio', { name: 'صح' }))
    await user.click(within(screen.getByTestId('morph11-final-11')).getByRole('radio', { name: 'صح' }))
    await user.click(within(area).getByRole('button', { name: S.final.control }))
    for (const section of S.final.sections) {
      for (const item of section.items) expect(screen.getByTestId(`morph11-final-${item.number}`)).toHaveTextContent(C.finalKeys[item.id].answer)
    }
    expect(within(screen.getByTestId('morph11-final-5')).getByRole('status')).toHaveTextContent('الحروف صحيحة')
    expect(within(screen.getByTestId('morph11-final-7')).getByRole('status')).toHaveTextContent('حركة تخالف النموذج')
    expect(within(screen.getByTestId('morph11-final-9')).getByRole('status')).toHaveTextContent('محاولتك مطابقة للنموذج')
    expect(within(screen.getByTestId('morph11-final-10')).getByRole('status')).toHaveTextContent('إجابتك صحيحة')
    expect(within(screen.getByTestId('morph11-final-11')).getByRole('status')).toHaveTextContent('إجابتك تحتاج إلى مراجعة')
    expect(within(screen.getByTestId('morph11-final-1')).getByRole('status')).toHaveTextContent('زارَعَ')
    expect(screen.getByTestId('morph11-final-model-summary')).toHaveTextContent('3 / 9')
    await user.click(within(area).getByRole('button', { name: 'إخفاء نموذج الإجابة' }))
    expect(within(area).queryByRole('status')).not.toBeInTheDocument()
    await user.click(within(area).getByRole('button', { name: 'مسح الإجابات' }))
    expect(screen.getByRole('textbox', { name: 'اسم الفاعل من كَتَبَ' })).toHaveValue('')
    noExamDisclosure()
  })

  it('لا يعرض حل الواجب إلا بعد محاولة كل صف، ثم يقارن الاسم والنوع', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('الواجب المنزلي'))
    const area = screen.getByTestId('morph11-homework')
    const reveal = within(area).getByRole('button', { name: S.homework.control })
    expect(reveal).toBeDisabled()
    expect(screen.getByTestId('morph11-table-homework').querySelectorAll('tbody tr')).toHaveLength(5)
    for (const [, verb, participle, type] of EXPECTED_HOMEWORK.slice(0, 4)) {
      await user.type(screen.getByRole('textbox', { name: `اسم الفاعل من ${verb}` }), verb === 'أَكْرَمَ' ? 'مُكْرَم' : participle)
      await user.selectOptions(screen.getByRole('combobox', { name: `نوع الفعل ${verb}` }), type)
    }
    expect(screen.getByTestId('morph11-homework-attempts')).toHaveTextContent('4 / 5')
    expect(reveal).toBeDisabled()
    expect(screen.queryByTestId('morph11-homework-solution')).not.toBeInTheDocument()
    await user.selectOptions(screen.getByRole('combobox', { name: 'نوع الفعل باعَ' }), 'غير ثلاثي')
    expect(reveal).toBeEnabled()
    await user.click(reveal)
    const solution = screen.getByTestId('morph11-homework-solution')
    for (const [, , participle, type] of EXPECTED_HOMEWORK) {
      expect(solution).toHaveTextContent(participle)
      expect(solution).toHaveTextContent(type)
    }
    expect(solution).toHaveTextContent('7 / 10')
    expect(screen.getByTestId('morph11-hw-akrama')).toHaveTextContent('حركة تخالف النموذج')
    expect(screen.getByTestId('morph11-hw-baa')).toHaveTextContent('يحتاج إلى مراجعة')
    await user.click(within(area).getByRole('button', { name: 'إعادة الواجب' }))
    expect(screen.queryByTestId('morph11-homework-solution')).not.toBeInTheDocument()
    expect(reveal).toBeDisabled()
  })
})

describe('morphology 11 — التسليم النهائي هو حدّ كشف الاختبار المستقل الوحيد', () => {
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
    expect(screen.getByTestId('morph11-solutions-locked')).toBeInTheDocument()
    await user.click(openStep('تسليم الاختبار والنتيجة'))
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار وإظهار النتيجة' }))
    expect(screen.getByTestId('morph11-final-result')).toHaveTextContent('٢٠ / ٢٠')
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getAllByTestId(/^solution-morph11-q/)).toHaveLength(20)
    expect(document.body).toHaveTextContent(questions[19].explanation!)
    await user.click(openStep(C.testDefinition.pages[0].title))
    expect(screen.getAllByTestId(/^test-feedback-/)).toHaveLength(5)
    await user.click(within(screen.getByTestId('morph11-question-morph11-q01')).getByRole('radio', { name: 'زِراعة' }))
    noExamDisclosure()
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('morph11-solutions-locked')).toBeInTheDocument()
    await user.click(openStep('تسليم الاختبار والنتيجة'))
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار وإظهار النتيجة' }))
    expect(screen.getByTestId('morph11-final-result')).toHaveTextContent('١٩ / ٢٠')
    await user.click(screen.getByRole('button', { name: 'إعادة الاختبار' }))
    noExamDisclosure()
    await user.click(openStep(C.testDefinition.pages[0].title))
    for (const radio of within(screen.getByTestId(`test-page-${C.testDefinition.pages[0].id}`)).queryAllByRole('radio')) expect(radio).not.toBeChecked()
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('morph11-solutions-locked')).toBeInTheDocument()
  }, 30_000)
})

describe('morphology 11 — بوابة المعلم القائمة ومادة كاملة', () => {
  it('يبوّب التصحيحات والتحليل والإعراب وحلول ٨ و١٣ و٥، دون حلول الاختبار المستقل، ثم يعيد الإقفال', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('منطقة خاصة بالمعلم'))
    expect(screen.queryByTestId('morph11-teacher-material')).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('كلمة المرور'), 'incorrect')
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByRole('alert')).toHaveTextContent('كلمة المرور غير صحيحة')
    await user.clear(screen.getByLabelText('كلمة المرور'))
    await user.type(screen.getByLabelText('كلمة المرور'), COURSE_TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    const material = screen.getByTestId('morph11-teacher-material')
    const sections = material.querySelectorAll('details')
    expect(sections).toHaveLength(8)
    for (const section of sections) {
      expect(section).not.toHaveAttribute('open')
      await user.click(section.querySelector('summary')!)
      expect(section).toHaveAttribute('open')
    }
    for (const correction of C.corrections) expect(screen.getByTestId(`morph11-teacher-correction-${correction.id}`)).toHaveTextContent(correction.original)
    expect(screen.getByTestId('morph11-table-teacher-analysis').querySelectorAll('tbody tr').length).toBeGreaterThanOrEqual(30)
    for (const item of S.training.items) expect(screen.getByTestId(`morph11-teacher-${item.id}`)).toHaveTextContent(`الإجابة: ${C.trainingKeys[item.id].answer}`)
    for (const section of S.final.sections) for (const item of section.items) expect(screen.getByTestId(`morph11-teacher-${item.id}`)).toHaveTextContent(C.finalKeys[item.id].answer)
    for (const [id, , participle, type] of EXPECTED_HOMEWORK) {
      expect(screen.getByTestId(`morph11-teacher-${id}`)).toHaveTextContent(participle)
      expect(screen.getByTestId(`morph11-teacher-${id}`)).toHaveTextContent(type)
    }
    expect(material).toHaveTextContent('داعٍ: فاعل مرفوع وعلامة رفعه الضمة المقدّرة على الياء المحذوفة')
    expect(material.querySelectorAll('[data-testid^="solution-morph11-q"]')).toHaveLength(0)
    expect(material).toHaveTextContent('حلول الاختبار المستقل (٢٠ سؤالًا) لا تُعرض في هذه المنطقة')
    expect(within(material).getByRole('link', { name: /docs\/source\/morphology-lesson-11\.md/ })).toHaveAttribute('download', 'morphology-lesson-11.md')
    expect(within(material).getByRole('link', { name: /docs\/morphology-lesson-11-source-audit\.md/ })).toHaveAttribute('download', 'morphology-lesson-11-source-audit.md')
    await user.click(screen.getByRole('button', { name: 'إغلاق المساحة' }))
    expect(screen.queryByTestId('morph11-teacher-material')).not.toBeInTheDocument()
  })
})
