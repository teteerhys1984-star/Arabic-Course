import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from '../../app/App'
import { LessonSpellingTwelve } from '../LessonSpellingTwelve'
import { COURSE_TEACHER_PASSWORD } from '../../shared/teacher/teacherPassword'
import {
  sections,
  objectives,
  practice,
  examQuestions,
  testDefinition,
  preservedWords,
  ibnRows,
  maRows,
  lamOnAlRows,
  groupAlifVerbs,
  tanweenExceptionRows,
  commonErrors,
  homeworkWords,
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

describe('spelling lesson 12 — registration, flow, practice, tests and gated areas', () => {
  it('opens from the spelling section, has 22 steps in nine groups, and no broken thirteenth route', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/sections/spelling'
    const { unmount } = render(<App />)

    const links = within(screen.getByRole('list', { name: 'دروس القسم' })).getAllByRole('link')
    expect(links).toHaveLength(12)
    expect(links[11]).toHaveAttribute('href', '#/lesson/spelling-lesson-12')
    await user.click(links[11])
    expect(window.location.hash).toBe('#/lesson/spelling-lesson-12')

    expect(document.querySelector('.omit-add-lesson')).toHaveAttribute('dir', 'rtl')

    const outline = screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' })
    expect(within(outline).getAllByRole('button')).toHaveLength(22)
    expect(outline.querySelectorAll('.lesson-outline__group')).toHaveLength(9)

    await user.click(jump('أهداف الدرس'))
    expect(screen.getByText(objectives[0])).toBeInTheDocument()
    expect(screen.getByText(sections[1].paragraphs[2])).toBeInTheDocument()

    await user.click(jump('كلمات محفوظة الرسم'))
    expect(screen.getAllByText(/هذا طالبٌ مجتهدٌ/).length).toBeGreaterThan(0)

    await user.click(jump('حذف ألف «ابن»'))
    expect(screen.getAllByTestId('spell12-ibn-deleted')).toHaveLength(3)
    expect(screen.getAllByTestId('spell12-ibn-proven')).toHaveLength(2)
    for (const row of ibnRows) {
      expect(screen.getByText(row.text)).toBeInTheDocument()
    }

    await user.click(jump('الخلاصة'))
    expect(document.querySelector('.lesson-step')!.querySelector('a[href*="spelling-lesson-13"]')).toBeNull()

    unmount()
    window.location.hash = '#/lesson/spelling-lesson-13'
    render(<App />)
    expect(screen.getByRole('heading', { name: 'الدرس غير متاح' })).toBeInTheDocument()
  })

  it('renders every source table and comparison with correct and wrong forms marked', async () => {
    const user = userEvent.setup()
    render(<LessonSpellingTwelve />)

    await user.click(jump('كلمات محفوظة الرسم'))
    const table = screen.getByRole('table')
    expect(within(table).getAllByRole('row')).toHaveLength(preservedWords.length + 1)
    for (const row of preservedWords) {
      expect(within(table).getByText(row.word)).toBeInTheDocument()
      expect(within(table).getByText(row.wrong)).toBeInTheDocument()
      expect(within(table).getByText(row.sentence)).toBeInTheDocument()
    }

    await user.click(jump('حذف ألف «ابن»'))
    expect(screen.getAllByTestId('spell12-ibn-deleted')).toHaveLength(3)
    expect(screen.getAllByTestId('spell12-ibn-proven')).toHaveLength(2)
    for (const row of ibnRows) {
      expect(screen.getByText(row.text)).toBeInTheDocument()
    }

    await user.click(jump('«ما» الاستفهامية'))
    for (const row of maRows) {
      expect(screen.getByText(row.before)).toBeInTheDocument()
      expect(screen.getByText(row.after)).toBeInTheDocument()
      expect(screen.getByText(row.example)).toBeInTheDocument()
    }

    await user.click(jump('دخول اللام على «أل»'))
    // وسم القاعدة يظهر مع المثالين الصحيحين فقط (ضمن خطوة الدرس لا الشريط الجانبي).
    const lamStep = document.querySelector<HTMLElement>('.lesson-step')!
    expect(within(lamStep).getAllByText('دخول اللام على «أل»')).toHaveLength(2)
    expect(within(lamStep).getByText('ليس مثالًا على دخول اللام على «أل»')).toBeInTheDocument()
    expect(screen.getByText(lamOnAlRows[2].joined)).toBeInTheDocument()

    await user.click(jump('الألف الفارقة'))
    for (const row of groupAlifVerbs) {
      // «كتبوا» تظهر في الجدول وفي بطاقة المقارنة معًا.
      expect(screen.getAllByText(row.verb).length).toBeGreaterThan(0)
      expect(screen.getByText(row.sentence)).toBeInTheDocument()
    }

    await user.click(jump('ألف تنوين النصب'))
    expect(screen.getByText(/قرأ الطالبُ كتابًا مفيدًا/)).toBeInTheDocument()
    for (const row of tanweenExceptionRows) {
      expect(screen.getByText(row.correct)).toBeInTheDocument()
      expect(screen.getByText(row.reason)).toBeInTheDocument()
    }

    await user.click(jump('الأخطاء الشائعة'))
    for (const row of commonErrors) {
      expect(screen.getByText(row.wrong)).toBeInTheDocument()
      expect(screen.getByText(row.correct)).toBeInTheDocument()
      expect(screen.getByText(row.rule)).toBeInTheDocument()
    }
  })

  it('checks the eight-question practice on demand and never reveals the result before checking', async () => {
    const user = userEvent.setup()
    render(<LessonSpellingTwelve />)

    await user.click(jump('تدريب تفاعلي'))
    expect(screen.queryByText(practice[0].explanation)).not.toBeInTheDocument()
    expect(screen.queryByText(/نتيجة هذه الصفحة/)).not.toBeInTheDocument()
    expect(screen.queryByTestId('spell12-practice-rules')).not.toBeInTheDocument()

    for (const item of practice) {
      await user.click(
        within(screen.getByTestId(`spell12-practice-${item.id}`)).getByRole('radio', { name: item.answer }),
      )
    }
    // لم يُطلب التحقق بعد: لا نتيجة ولا تفسير.
    expect(screen.queryByText(/نتيجة هذه الصفحة/)).not.toBeInTheDocument()
    expect(screen.queryByText(practice[0].explanation)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(screen.getByTestId('test-page-summary-spell12-practice-page')).toHaveTextContent('8 صحيحة')
    for (const item of practice) {
      const feedback = screen.getByTestId(`test-feedback-${item.id}`)
      expect(feedback).toHaveTextContent(item.explanation)
      expect(feedback).toHaveTextContent(`الإجابة الصحيحة: ${item.answer}`)
    }

    // القواعد المرتبطة لا تظهر إلا بعد التحقق من صفحة التدريب.
    const rules = screen.getByTestId('spell12-practice-rules')
    for (const item of practice) {
      expect(rules).toHaveTextContent(item.rule)
      expect(rules).toHaveTextContent(item.example)
    }
  })

  it('lets the student edit a practice answer and recheck without double-counting', async () => {
    const user = userEvent.setup()
    render(<LessonSpellingTwelve />)

    await user.click(jump('تدريب تفاعلي'))
    for (const item of practice) {
      await user.click(
        within(screen.getByTestId(`spell12-practice-${item.id}`)).getByRole('radio', { name: item.answer }),
      )
    }
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(screen.getByTestId('test-page-summary-spell12-practice-page')).toHaveTextContent('8 صحيحة')

    // تعديل إجابة واحدة إلى خيار خاطئ يُبطل نتيجة الصفحة المحفوظة،
    // فيعود زر التحقّق إلى صورته الأولى ولا تتضاعف الدرجة.
    const first = practice[0]
    const wrongOption = first.options.find((option) => option !== first.answer)!
    await user.click(
      within(screen.getByTestId(`spell12-practice-${first.id}`)).getByRole('radio', { name: wrongOption }),
    )
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(screen.getByTestId('test-page-summary-spell12-practice-page')).toHaveTextContent('7 صحيحة')
    expect(screen.getByTestId('test-page-summary-spell12-practice-page')).toHaveTextContent('1 غير صحيحة')
  })

  it('checks the four independent pages, hides correctness until submission, then reveals and resets', async () => {
    const user = userEvent.setup()
    render(<LessonSpellingTwelve />)

    await user.click(jump('تسليم الاختبار'))
    expect(screen.getByRole('button', { name: 'تسليم الاختبار' })).toBeDisabled()

    for (const [index, page] of testDefinition.pages.entries()) {
      await user.click(jump(`اختبار الصفحة ${index + 1}`))
      for (const question of page.questions) {
        const field = question.fields[0]
        if (field.kind === 'text') {
          await user.type(within(screen.getByTestId(`spell12-question-${question.id}`)).getByRole('textbox'), field.accept[0])
        } else if (field.kind === 'choice') {
          await user.click(
            within(screen.getByTestId(`spell12-question-${question.id}`)).getByRole('radio', { name: field.answer }),
          )
        } else {
          throw new Error('حقل غير متوقع في صفحة الاختبار')
        }
      }
      await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
      // قبل التسليم: يُحفظ تقييم الصفحة ولا يُكشف.
      expect(screen.queryByTestId(`test-page-summary-${page.id}`)).not.toBeInTheDocument()
      expect(screen.getByTestId(`test-page-saved-${page.id}`)).toHaveTextContent('لا تُكشف')
      expect(screen.queryByTestId(`test-feedback-${page.questions[0].id}`)).not.toBeInTheDocument()
    }

    const firstQuestion = testDefinition.pages[0].questions[0]
    await user.click(jump('حلول الاختبارات'))
    expect(screen.queryByText(firstQuestion.explanation!)).not.toBeInTheDocument()

    await user.click(jump('تسليم الاختبار'))
    expect(screen.queryByTestId('spell12-result')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار' }))
    expect(screen.getByTestId('spell12-result')).toHaveTextContent('15 من 15')

    await user.click(jump('حلول الاختبارات'))
    for (const question of examQuestions) {
      expect(screen.getByText(question.explanation!)).toBeInTheDocument()
    }

    // تعديل إجابة يُبطل نتيجة صفحتها ويعيد قفل الحلول.
    await user.click(jump('اختبار الصفحة 1'))
    const firstField = firstQuestion.fields[0]
    if (firstField.kind !== 'text') throw new Error('حقل غير متوقع')
    const card = screen.getByTestId(`spell12-question-${firstQuestion.id}`)
    await user.clear(within(card).getByRole('textbox'))
    await user.type(within(card).getByRole('textbox'), 'هاذا طالب مجتهد')
    await user.click(jump('حلول الاختبارات'))
    expect(screen.queryByText(firstQuestion.explanation!)).not.toBeInTheDocument()

    await user.click(jump('اختبار الصفحة 1'))
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    await user.click(jump('تسليم الاختبار'))
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار' }))
    expect(screen.getByTestId('spell12-result')).toHaveTextContent('14 من 15')

    await user.click(screen.getByRole('button', { name: 'إعادة ضبط الاختبار' }))
    expect(screen.queryByTestId('spell12-result')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'تسليم الاختبار' })).toBeDisabled()
  })

  it('gates the teacher space and offers the full practice, exam, and homework keys', async () => {
    const user = userEvent.setup()
    render(<LessonSpellingTwelve />)

    await user.click(jump('منطقة المعلم'))
    expect(screen.queryByTestId('spell12-teacher')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('كلمة المرور'), COURSE_TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول' }))

    const teacher = screen.getByTestId('spell12-teacher')
    for (const item of practice) {
      expect(within(teacher).getByText(item.explanation)).toBeInTheDocument()
    }
    const keys = within(teacher).getByTestId('spell12-teacher-keys')
    for (const question of examQuestions) {
      expect(within(keys).getByText(question.solution!)).toBeInTheDocument()
    }
    // نموذج إجابة الواجب: الكلمات الست وشروط الفقرة.
    for (const word of homeworkWords) {
      // الكلمة تظهر في نموذج الواجب وفي مفاتيح الأسئلة والشرح معًا.
      expect(within(teacher).getAllByText(word, { exact: false }).length).toBeGreaterThan(0)
    }
    expect(within(teacher).getByText(/نموذج فقرة الخمسة أسطر/)).toBeInTheDocument()
    expect(within(teacher).getAllByText(/كلمتان تُحذف منهما الألف/).length).toBeGreaterThan(0)
    // التدقيقات العلمية موثّقة للمعلم.
    expect(within(teacher).getByText(/تدقيق ت-١/)).toBeInTheDocument()
    expect(
      within(teacher).getByText(/«لمعلّم الصف» اتصال لام الجر بكلمة أخرى لا تبدأ بـ«أل»/),
    ).toBeInTheDocument()
  })
})
