import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from '../../app/App'
import { LessonSpellingEleven } from '../LessonSpellingEleven'
import { COURSE_TEACHER_PASSWORD } from '../../shared/teacher/teacherPassword'
import {
  sections,
  practice,
  quizQuestions,
  testDefinition,
  examQuestions,
  markLabItems,
  nunChallengeItems,
  alifDecisionItems,
} from './content'

function jump(title: string) {
  return within(screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' })).getByRole(
    'button',
    { name: (name) => name.includes(title) },
  )
}

beforeEach(() => {
  window.location.hash = '#/'
})

describe('spelling lesson 11 — registration, flow, labs, tests and gated areas', () => {
  it('opens from the spelling section, has 27 steps in nine groups, and no broken twelfth route', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/sections/spelling'
    const { unmount } = render(<App />)

    const links = within(screen.getByRole('list', { name: 'دروس القسم' })).getAllByRole('link')
    expect(links).toHaveLength(12)
    expect(links[10]).toHaveAttribute('href', '#/lesson/spelling-lesson-11')
    await user.click(links[10])
    expect(window.location.hash).toBe('#/lesson/spelling-lesson-11')

    expect(document.querySelector('.tanween-lab-lesson')).toHaveAttribute('dir', 'rtl')

    const outline = screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' })
    expect(within(outline).getAllByRole('button')).toHaveLength(27)
    expect(outline.querySelectorAll('.lesson-outline__group')).toHaveLength(9)

    await user.click(jump('أهداف الدرس'))
    expect(screen.getByText(sections[0].paragraphs[0])).toBeInTheDocument()
    expect(screen.getByTestId('spell11-mark-palette')).toBeInTheDocument()

    await user.click(jump('ما التنوين؟'))
    expect(screen.getAllByText(/نسمع في آخرها صوتًا يشبه/).length).toBeGreaterThan(0)

    await user.click(jump('جدول حالات الألف'))
    expect(screen.getAllByRole('table').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/قصة ← قصةً/).length).toBeGreaterThan(0)

    await user.click(jump('خلاصة الدرس'))
    expect(document.querySelector('.lesson-step')!.querySelector('a[href*="spelling-lesson-13"]')).toBeNull()

    unmount()
    window.location.hash = '#/lesson/spelling-lesson-13'
    render(<App />)
    expect(screen.getByRole('heading', { name: 'الدرس غير متاح' })).toBeInTheDocument()
  })

  it('runs the three labs with explanatory feedback, not just right or wrong', async () => {
    const user = userEvent.setup()
    render(<LessonSpellingEleven />)

    // مختبر اختيار العلامة: الخطأ يُشرح سببه، والصواب يُبيّن القاعدة.
    await user.click(jump('مختبر العلامة'))
    const firstRow = screen.getByTestId(`spell11-marklab-${markLabItems[0].id}`)
    expect(
      within(firstRow).queryByTestId(`spell11-marklab-feedback-${markLabItems[0].id}`),
    ).not.toBeInTheDocument()
    await user.click(within(firstRow).getByRole('button', { name: /فتحتان/ }))
    const wrongFeedback = within(firstRow).getByTestId(`spell11-marklab-feedback-${markLabItems[0].id}`)
    expect(wrongFeedback).toHaveTextContent('راجع اختيارك')
    expect(wrongFeedback).toHaveTextContent('تنوين الضم')
    expect(wrongFeedback).toHaveTextContent(markLabItems[0].reason)
    await user.click(within(firstRow).getByRole('button', { name: /ضمتان/ }))
    expect(within(firstRow).getByTestId(`spell11-marklab-feedback-${markLabItems[0].id}`)).toHaveTextContent(
      'إجابة صحيحة',
    )
    expect(within(firstRow).getByTestId(`spell11-marklab-word-${markLabItems[0].id}`)).toHaveTextContent(
      markLabItems[0].applied,
    )

    // تحدي النون الأصلية والتنوين.
    await user.click(jump('تحدي النون'))
    const nunCard = screen.getByTestId(`spell11-nun-${nunChallengeItems[1].id}`)
    await user.click(within(nunCard).getByRole('button', { name: 'فيها تنوين' }))
    const nunWrong = within(nunCard).getByTestId(`spell11-nun-feedback-${nunChallengeItems[1].id}`)
    expect(nunWrong).toHaveTextContent('راجع اختيارك')
    expect(nunWrong).toHaveTextContent(nunChallengeItems[1].reason)
    await user.click(within(nunCard).getByRole('button', { name: 'فيها نون أصلية فقط' }))
    expect(within(nunCard).getByTestId(`spell11-nun-feedback-${nunChallengeItems[1].id}`)).toHaveTextContent(
      'إجابة صحيحة',
    )

    // قرار ألف التنوين: يُفحص الرسم النهائي وسببه.
    await user.click(jump('قرار الألف'))
    const decisionRow = screen.getByTestId(`spell11-alif-${alifDecisionItems[0].id}`)
    await user.click(within(decisionRow).getByRole('button', { name: 'لا نضيف ألفًا' }))
    const decisionFeedback = within(decisionRow).getByTestId(`spell11-alif-feedback-${alifDecisionItems[0].id}`)
    expect(decisionFeedback).toHaveTextContent('راجع اختيارك')
    expect(decisionFeedback).toHaveTextContent(alifDecisionItems[0].final)
    await user.click(within(decisionRow).getByRole('button', { name: 'نضيف ألفًا' }))
    expect(within(decisionRow).getByTestId(`spell11-alif-feedback-${alifDecisionItems[0].id}`)).toHaveTextContent(
      'إجابة صحيحة',
    )
  })

  it('checks the practice page on demand and never reveals the result before checking', async () => {
    const user = userEvent.setup()
    render(<LessonSpellingEleven />)

    await user.click(jump('تدريب تفاعلي'))
    expect(screen.queryByText(practice[0].explanation)).not.toBeInTheDocument()
    expect(screen.queryByText(/نتيجة هذه الصفحة/)).not.toBeInTheDocument()
    expect(screen.queryByTestId('spell11-practice-rules')).not.toBeInTheDocument()

    for (const item of practice) {
      await user.click(
        within(screen.getByTestId(`spell11-practice-${item.id}`)).getByRole('radio', { name: item.answer }),
      )
    }
    // لم يُطلب التحقق بعد: لا نتيجة ولا تفسير.
    expect(screen.queryByText(/نتيجة هذه الصفحة/)).not.toBeInTheDocument()
    expect(screen.queryByText(practice[0].explanation)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(screen.getByTestId(`test-page-summary-spell11-practice-page`)).toHaveTextContent('8 صحيحة')
    for (const item of practice) {
      const feedback = screen.getByTestId(`test-feedback-${item.id}`)
      expect(feedback).toHaveTextContent(item.explanation)
      expect(feedback).toHaveTextContent(`الإجابة الصحيحة: ${item.answer}`)
    }

    // القواعد المرتبطة لا تظهر إلا بعد التحقق من صفحة التدريب.
    const rules = screen.getByTestId('spell11-practice-rules')
    for (const item of practice) {
      expect(rules).toHaveTextContent(item.rule)
      expect(rules).toHaveTextContent(item.example)
    }
  })

  it('answers the ten-question final quiz with written, selected and essay fields and reveals models after checking', async () => {
    const user = userEvent.setup()
    render(<LessonSpellingEleven />)

    await user.click(jump('الاختبار الختامي'))

    // الإكمال الكتابي + اختيار العلامة.
    const completion: [string, string, string][] = [
      [quizQuestions[0].id, 'قلمٌ', 'ضمتان ـٌ'],
      [quizQuestions[1].id, 'كتابًا', 'فتحتان ـً'],
      [quizQuestions[2].id, 'بقلمٍ', 'كسرتان ـٍ'],
      [quizQuestions[3].id, 'شجرًا', 'فتحتان ـً'],
    ]
    for (const [id, word, mark] of completion) {
      const card = screen.getByTestId(`spell11-quiz-${id}`)
      await user.type(within(card).getByRole('textbox'), word)
      await user.selectOptions(within(card).getByRole('combobox'), mark)
    }
    // تصحيح الخطأ.
    const corrections: [string, string][] = [
      [quizQuestions[4].id, 'مدرسةً'],
      [quizQuestions[5].id, 'سماءً'],
      [quizQuestions[6].id, 'كتابٌ'],
    ]
    for (const [id, word] of corrections) {
      await user.type(within(screen.getByTestId(`spell11-quiz-${id}`)).getByRole('textbox'), word)
    }
    // التعليل.
    for (const question of quizQuestions.slice(7)) {
      await user.type(
        within(screen.getByTestId(`spell11-quiz-${question.id}`)).getByRole('textbox'),
        'تعليل الطالب',
      )
    }

    expect(screen.queryByText(/الإجابة الصحيحة:/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))

    const summary = screen.getByTestId('test-page-summary-spell11-final-quiz')
    expect(summary).toHaveTextContent('7 صحيحة')
    expect(summary).toHaveTextContent('3 للمراجعة مع المعلم')
    // الحلول النموذجية تظهر بعد التحقق فقط، ومنها حلول أسئلة التعليل.
    expect(within(screen.getByTestId(`spell11-quiz-${quizQuestions[7].id}`)).getByText(/الإجابة الصحيحة:/)).toBeInTheDocument()
    expect(screen.getByTestId(`test-feedback-${quizQuestions[8].id}`)).toHaveTextContent('بستان')
  })

  it('checks the four independent pages, hides correctness until submission, then reveals and resets', async () => {
    const user = userEvent.setup()
    render(<LessonSpellingEleven />)

    await user.click(jump('تسليم الاختبار'))
    expect(screen.getByRole('button', { name: 'تسليم الاختبار' })).toBeDisabled()

    for (const [index, page] of testDefinition.pages.entries()) {
      await user.click(jump(`اختبار الصفحة ${index + 1}`))
      for (const question of page.questions) {
        const field = question.fields[0]
        if (field.kind !== 'choice') throw new Error('كل أسئلة الاختبار المستقل اختيارية')
        await user.click(
          within(screen.getByTestId(`spell11-question-${question.id}`)).getByRole('radio', {
            name: field.answer,
          }),
        )
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
    expect(screen.queryByTestId('spell11-result')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار' }))
    expect(screen.getByTestId('spell11-result')).toHaveTextContent('20 من 20')

    await user.click(jump('حلول الاختبارات'))
    for (const question of examQuestions) {
      expect(screen.getByText(question.explanation!)).toBeInTheDocument()
    }

    // تعديل إجابة يُبطل النتيجة ويعيد قفل الحلول.
    await user.click(jump('اختبار الصفحة 1'))
    const firstField = firstQuestion.fields[0]
    if (firstField.kind !== 'choice') throw new Error('حقل غير متوقع')
    const card = screen.getByTestId(`spell11-question-${firstQuestion.id}`)
    await user.click(
      within(card).getByRole('radio', { name: firstField.options.find((option) => option !== firstField.answer)! }),
    )
    await user.click(jump('حلول الاختبارات'))
    expect(screen.queryByText(firstQuestion.explanation!)).not.toBeInTheDocument()

    await user.click(jump('اختبار الصفحة 1'))
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    await user.click(jump('تسليم الاختبار'))
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار' }))
    expect(screen.getByTestId('spell11-result')).toHaveTextContent('19 من 20')

    await user.click(screen.getByRole('button', { name: 'إعادة ضبط الاختبار' }))
    expect(screen.queryByTestId('spell11-result')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'تسليم الاختبار' })).toBeDisabled()
  })

  it('gates the teacher space, and offers the full practice, quiz and twenty independent keys', async () => {
    const user = userEvent.setup()
    render(<LessonSpellingEleven />)

    await user.click(jump('منطقة المعلم'))
    expect(screen.queryByTestId('spell11-teacher')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('كلمة المرور'), COURSE_TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول' }))

    const teacher = screen.getByTestId('spell11-teacher')
    for (const item of practice) {
      expect(within(teacher).getByText(item.explanation)).toBeInTheDocument()
    }
    for (const question of quizQuestions) {
      expect(within(teacher).getByText(question.explanation!)).toBeInTheDocument()
    }
    const keys = within(teacher).getByTestId('spell11-teacher-keys')
    for (const question of examQuestions) {
      expect(within(keys).getByText(question.solution!)).toBeInTheDocument()
    }
    expect(within(teacher).getByText(/الحالات الإملائية الخاصة بألف تنوين الفتح/)).toBeInTheDocument()
    expect(within(teacher).getAllByText(/كتابة نون مستقلة/).length).toBeGreaterThan(0)
  })
})
