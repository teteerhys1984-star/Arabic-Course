import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from '../../app/App'
import { LessonSpellingThirteen } from '../LessonSpellingThirteen'
import { COURSE_TEACHER_PASSWORD } from '../../shared/teacher/teacherPassword'
import {
  sections,
  objectives,
  practice,
  examQuestions,
  testDefinition,
  maRules,
  memoryTable,
  maContrast,
  inshallahAnalysis,
  commonStructures,
  commonErrors,
  summaryRules,
  homeworkCorrection,
  homeworkParagraphModel,
} from './content'

/** الفهرس الجانبي يعرض shortTitle، فتُستخدم عناوين الاختصار للقفز. */
function jump(title: string) {
  return within(screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' })).getByRole(
    'button',
    { name: (name) => name.includes(title) },
  )
}

beforeEach(() => {
  window.location.hash = '#/'
})

describe('spelling lesson 13 — registration, flow, practice, tests and gated areas', () => {
  it('opens from the spelling section, has 22 steps in nine groups, and no broken fourteenth route', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/sections/spelling'
    const { unmount } = render(<App />)

    const links = within(screen.getByRole('list', { name: 'دروس القسم' })).getAllByRole('link')
    expect(links).toHaveLength(13)
    expect(links[12]).toHaveAttribute('href', '#/lesson/spelling-lesson-13')
    await user.click(links[12])
    expect(window.location.hash).toBe('#/lesson/spelling-lesson-13')

    expect(document.querySelector('.wasl-fasl-lesson')).toHaveAttribute('dir', 'rtl')

    const outline = screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' })
    expect(within(outline).getAllByRole('button')).toHaveLength(22)
    expect(outline.querySelectorAll('.lesson-outline__group')).toHaveLength(9)

    await user.click(jump('أهداف الدرس'))
    expect(screen.getByText(objectives[0])).toBeInTheDocument()
    expect(screen.getByText(sections[1].paragraphs[2])).toBeInTheDocument()

    await user.click(jump('الوصل والفصل'))
    for (const form of ['عمَّ', 'ممَّ', 'بِمَ', 'كلّما', 'إن شاء الله', 'لا سيّما', 'كلّ ما']) {
      expect(screen.getAllByText(form).length).toBeGreaterThan(0)
    }
    expect(screen.getByText(/من \+ مَن/)).toBeInTheDocument()

    await user.click(jump('الخلاصة'))
    expect(document.querySelector('.lesson-step')!.querySelector('a[href*="spelling-lesson-14"]')).toBeNull()

    unmount()
    window.location.hash = '#/lesson/spelling-lesson-14'
    render(<App />)
    expect(screen.getByRole('heading', { name: 'الدرس غير متاح' })).toBeInTheDocument()
  })

  it('renders every source table and comparison with correct and wrong forms marked', async () => {
    const user = userEvent.setup()
    render(<LessonSpellingThirteen />)

    await user.click(jump('«ما» الاستفهامية'))
    const rules = screen.getByTestId('spell13-ma-rules')
    for (const rule of maRules) {
      expect(within(rules).getByText(rule.form)).toBeInTheDocument()
      expect(within(rules).getByText(rule.mainExample)).toBeInTheDocument()
    }
    const memory = screen.getByRole('table')
    expect(within(memory).getAllByRole('row')).toHaveLength(memoryTable.length + 1)
    for (const row of memoryTable) {
      expect(within(memory).getByText(row.origin)).toBeInTheDocument()
      expect(within(memory).getByText(row.form)).toBeInTheDocument()
      expect(within(memory).getByText(row.example)).toBeInTheDocument()
    }

    await user.click(jump('استفهام أم موصول؟'))
    const contrast = screen.getByTestId('spell13-ma-contrast')
    for (const pair of maContrast) {
      expect(within(contrast).getByText(pair.interrogative)).toBeInTheDocument()
      expect(within(contrast).getByText(pair.relative)).toBeInTheDocument()
    }
    expect(screen.getAllByText(/هل الجملة سؤال عن شيء؟/).length).toBeGreaterThan(0)

    await user.click(jump('إن شاء الله'))
    const analysis = screen.getByTestId('spell13-inshallah-analysis')
    for (const item of inshallahAnalysis) {
      expect(within(analysis).getByText(item.word)).toBeInTheDocument()
      expect(within(analysis).getByText(item.role)).toBeInTheDocument()
    }
    expect(screen.getByText('موضوع إنشاء.')).toBeInTheDocument()

    await user.click(jump('التراكيب الشائعة'))
    const structures = screen.getByRole('table')
    expect(within(structures).getAllByRole('row')).toHaveLength(commonStructures.length + 1)
    for (const row of commonStructures) {
      expect(within(structures).getByText(row.form)).toBeInTheDocument()
      expect(within(structures).getByText(row.example)).toBeInTheDocument()
    }

    await user.click(jump('الأخطاء الشائعة'))
    const errors = screen.getByRole('table')
    for (const row of commonErrors) {
      expect(within(errors).getByText(row.wrong)).toBeInTheDocument()
      expect(within(errors).getByText(row.correct)).toBeInTheDocument()
      expect(within(errors).getByText(row.reason)).toBeInTheDocument()
    }

    await user.click(jump('الخلاصة'))
    const summary = screen.getByTestId('spell13-summary')
    for (const rule of summaryRules) {
      expect(within(summary).getByText(rule.title)).toBeInTheDocument()
      expect(within(summary).getByText(rule.detail)).toBeInTheDocument()
    }

    await user.click(jump('الواجب المنزلي'))
    for (const sentence of homeworkCorrection) {
      expect(screen.getByText(sentence)).toBeInTheDocument()
    }
  })

  it('checks the five-question practice on demand and never reveals the result before checking', async () => {
    const user = userEvent.setup()
    render(<LessonSpellingThirteen />)

    await user.click(jump('تدريب تفاعلي'))
    expect(screen.queryByText(/نتيجة هذه الصفحة/)).not.toBeInTheDocument()
    expect(screen.queryByTestId('spell13-practice-rules')).not.toBeInTheDocument()

    for (const item of practice) {
      await user.click(
        within(screen.getByTestId(`spell13-practice-${item.id}`)).getByRole('radio', { name: item.answer }),
      )
    }
    // لم يُطلب التحقق بعد: لا نتيجة ولا تفسير.
    expect(screen.queryByText(/نتيجة هذه الصفحة/)).not.toBeInTheDocument()
    expect(screen.queryByText(practice[0].explanation)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(screen.getByTestId('test-page-summary-spell13-practice-page')).toHaveTextContent('5 صحيحة')
    for (const item of practice) {
      const feedback = screen.getByTestId(`test-feedback-${item.id}`)
      expect(feedback).toHaveTextContent(item.explanation)
      expect(feedback).toHaveTextContent(`الإجابة الصحيحة: ${item.answer}`)
    }

    // القواعد المرتبطة لا تظهر إلا بعد التحقق من صفحة التدريب.
    const rules = screen.getByTestId('spell13-practice-rules')
    for (const item of practice) {
      expect(rules).toHaveTextContent(item.rule)
      expect(rules).toHaveTextContent(item.example)
    }
  })

  it('lets the student edit a practice answer and recheck without double-counting', async () => {
    const user = userEvent.setup()
    render(<LessonSpellingThirteen />)

    await user.click(jump('تدريب تفاعلي'))
    for (const item of practice) {
      await user.click(
        within(screen.getByTestId(`spell13-practice-${item.id}`)).getByRole('radio', { name: item.answer }),
      )
    }
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(screen.getByTestId('test-page-summary-spell13-practice-page')).toHaveTextContent('5 صحيحة')

    // تعديل إجابة واحدة إلى خيار خاطئ يُبطل نتيجة الصفحة المحفوظة،
    // فيعود زر التحقّق إلى صورته الأولى ولا تتضاعف الدرجة.
    const first = practice[0]
    const wrongOption = first.options.find((option) => option !== first.answer)!
    await user.click(
      within(screen.getByTestId(`spell13-practice-${first.id}`)).getByRole('radio', { name: wrongOption }),
    )
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(screen.getByTestId('test-page-summary-spell13-practice-page')).toHaveTextContent('4 صحيحة')
    expect(screen.getByTestId('test-page-summary-spell13-practice-page')).toHaveTextContent('1 غير صحيحة')
  })

  it('checks the four independent pages, hides correctness until submission, then reveals and resets', async () => {
    const user = userEvent.setup()
    render(<LessonSpellingThirteen />)

    await user.click(jump('تسليم الاختبار'))
    expect(screen.getByRole('button', { name: 'تسليم الاختبار' })).toBeDisabled()

    for (const [index, page] of testDefinition.pages.entries()) {
      await user.click(jump(`اختبار الصفحة ${index + 1}`))
      for (const question of page.questions) {
        const card = screen.getByTestId(`spell13-question-${question.id}`)
        question.fields.forEach((field) => {
          if (field.kind !== 'choice' && field.kind !== 'text' && field.kind !== 'essay') {
            throw new Error('حقل غير متوقع في صفحة الاختبار')
          }
        })
        for (const [fieldIndex, field] of question.fields.entries()) {
          if (field.kind === 'choice') {
            await user.click(within(card).getByRole('radio', { name: field.answer }))
          } else if (field.kind === 'text') {
            const boxes = within(card).getAllByRole('textbox')
            await user.type(boxes[fieldIndex], field.accept[0])
          } else if (field.kind === 'essay') {
            const boxes = within(card).getAllByRole('textbox')
            await user.type(boxes[fieldIndex], 'جملة إنشائية يراجعها المعلم')
          }
        }
      }
      await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
      // قبل التسليم: يُحفظ تقييم الصفحة ولا يُكشف.
      expect(screen.queryByTestId(`test-page-summary-${page.id}`)).not.toBeInTheDocument()
      expect(screen.getByTestId(`test-page-saved-${page.id}`)).toHaveTextContent('لا تُكشف')
      expect(screen.queryByTestId(`test-feedback-${page.questions[0].id}`)).not.toBeInTheDocument()
    }

    const firstQuestion = testDefinition.pages[0].questions[0]
    await user.click(jump('حلول الاختبار'))
    expect(screen.queryByText(firstQuestion.explanation!)).not.toBeInTheDocument()

    await user.click(jump('تسليم الاختبار'))
    expect(screen.queryByTestId('spell13-result')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار' }))
    // ١٥ آلية صحيحة + ٥ إنشائية للمراجعة = ٢٠ درجة.
    expect(screen.getByTestId('spell13-result')).toHaveTextContent('15 من ١٥')
    expect(screen.getByTestId('spell13-result')).toHaveTextContent('5 من ٥')
    expect(screen.getByTestId('spell13-result')).toHaveTextContent('٢٠ درجة')

    await user.click(jump('حلول الاختبار'))
    for (const question of examQuestions) {
      expect(screen.getByText(question.explanation!)).toBeInTheDocument()
    }

    // تعديل إجابة يُبطل نتيجة صفحتها ويعيد قفل الحلول.
    await user.click(jump('اختبار الصفحة 1'))
    const firstField = firstQuestion.fields[0]
    if (firstField.kind !== 'choice') throw new Error('حقل غير متوقع')
    const wrongOption = firstField.options.find((option) => option !== firstField.answer)!
    const card = screen.getByTestId(`spell13-question-${firstQuestion.id}`)
    await user.click(within(card).getByRole('radio', { name: wrongOption }))
    await user.click(jump('حلول الاختبار'))
    expect(screen.queryByText(firstQuestion.explanation!)).not.toBeInTheDocument()

    await user.click(jump('اختبار الصفحة 1'))
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    await user.click(jump('تسليم الاختبار'))
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار' }))
    expect(screen.getByTestId('spell13-result')).toHaveTextContent('14 من ١٥')

    await user.click(screen.getByRole('button', { name: 'إعادة ضبط الاختبار' }))
    expect(screen.queryByTestId('spell13-result')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'تسليم الاختبار' })).toBeDisabled()
  })

  it('gates the teacher space and offers the full practice, exam, and homework keys', async () => {
    const user = userEvent.setup()
    render(<LessonSpellingThirteen />)

    await user.click(jump('منطقة المعلم'))
    expect(screen.queryByTestId('spell13-teacher')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('كلمة المرور'), COURSE_TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول' }))

    const teacher = screen.getByTestId('spell13-teacher')
    for (const item of practice) {
      expect(within(teacher).getByText(item.explanation)).toBeInTheDocument()
    }
    const keys = within(teacher).getByTestId('spell13-teacher-keys')
    for (const question of examQuestions) {
      expect(within(keys).getAllByText(question.solution!).length).toBeGreaterThan(0)
    }
    // نموذج إجابة الواجب: الجمل الخمس المصحّحة وفقرة الستة أسطر.
    expect(within(teacher).getAllByText('سأشارك في الرحلة إن شاء الله.').length).toBeGreaterThan(0)
    expect(within(teacher).getAllByText('كلّما اجتهدتَ، نجحتَ.').length).toBeGreaterThan(0)
    for (const line of homeworkParagraphModel) {
      expect(within(teacher).getAllByText(line).length).toBeGreaterThan(0)
    }
    // التدقيقات العلمية موثّقة للمعلم.
    expect(within(teacher).getAllByText(/تدقيق ت-١/).length).toBeGreaterThan(0)
    expect(within(teacher).getAllByText(/ممَّنْ/).length).toBeGreaterThan(0)
    expect(within(teacher).getAllByText(/بماذا/).length).toBeGreaterThan(0)
  })
})
