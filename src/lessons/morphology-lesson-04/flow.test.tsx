/**
 * اختبار التدفق التفاعلي للدرس الرابع من قسم الصرف (أوزان الفعل الثلاثي المجرّد).
 *
 * يغطي:
 *  - ربط الدرس بقسم الصرف وفتحه من بطاقته؛
 *  - المختبرات التفاعلية لتحديد عين الفعل وتصنيف الأبواب واستخراج الوزن؛
 *  - التدريب الأول (٦ أسئلة) والتدريب الثاني (٦ أسئلة) مع زر «إعادة التدريب»؛
 *  - الاختبار النهائي (٢٠ سؤالًا في ٤ صفحات) مع حجب الصحة والدرجة أثناء الحل، وبوابة الحلول والنتيجة؛
 *  - منطقة المعلم المحمية بكلمة المرور ومحتوياتها الكاملة.
 */
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from '../../app/App'
import { COURSE_TEACHER_PASSWORD } from '../../shared/teacher/teacherPassword'
import { teacherKeyHeader } from './content'

function openStep(name: string) {
  return within(screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' })).getByRole('button', {
    name: new RegExp(name),
  })
}

describe('Morphology Lesson 04 — Interactive Flow & Navigation', () => {
  it('links the lesson from the الصرف section and opens its first step', () => {
    window.location.hash = '#/sections/morphology'
    const section = render(<App />)
    expect(screen.getByRole('link', { name: 'أوزان الفعل الثلاثي المجرّد' })).toHaveAttribute(
      'href',
      '#/lesson/morphology-lesson-04',
    )
    section.unmount()

    window.location.hash = '#/lesson/morphology-lesson-04'
    render(<App />)
    expect(
      screen.getByRole('heading', { name: 'الدرس الرابع: أوزان الفعل الثلاثي المجرّد', level: 2 }),
    ).toBeInTheDocument()
    expect(screen.getByText(/الفرق بين الفعل المجرّد والفعل المزيد/)).toBeInTheDocument()
  })

  it('verifies Ayn identification and vowels in the Ayn Lab only after pressing check', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/lesson/morphology-lesson-04'
    render(<App />)

    await user.click(openStep('مفهوم عين الفعل وتحديدها'))
    const item = screen.getByTestId('ayn-lab-ayn-1')
    expect(within(item).queryByRole('status')).not.toBeInTheDocument()

    await user.selectOptions(within(item).getByLabelText('عين الفعل في كَتَبَ'), 'التاء')
    await user.selectOptions(within(item).getByLabelText('حركة عين الماضي في كَتَبَ'), 'الفتحة')
    await user.selectOptions(within(item).getByLabelText('حركة عين المضارع في يَكْتُبُ'), 'الضمة')
    await user.click(within(item).getByRole('button', { name: 'تحقق من التحليل' }))

    expect(within(item).getByRole('status')).toHaveTextContent('تحليل صحيح ودقيق')
    expect(within(item).getByRole('status')).toHaveTextContent('فَعَلَ — يَفْعُلُ')
  })

  it('renders all 6 items of Training 1 and supports checking and resetting via إعادة التدريب', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/lesson/morphology-lesson-04'
    render(<App />)

    await user.click(openStep('التدريب الأول — حدّد الباب الصرفي'))
    const trainingOne = screen.getByTestId('morph4-training-one')
    for (let i = 1; i <= 6; i += 1) {
      expect(within(trainingOne).getByTestId(`train1-t1-${i}`)).toBeInTheDocument()
    }

    const first = within(trainingOne).getByTestId('train1-t1-1')
    const radio = within(first).getByRole('radio', { name: 'فَعَلَ — يَفْعُلُ' })
    await user.click(radio)
    expect(radio).toBeChecked()
    expect(within(first).queryByRole('status')).not.toBeInTheDocument()

    await user.click(within(first).getByRole('button', { name: 'تحقق من الإجابة' }))
    expect(within(first).getByRole('status')).toHaveTextContent('إجابة صحيحة')

    await user.click(screen.getByTestId('train1-retry'))
    expect(within(first).getByRole('radio', { name: 'فَعَلَ — يَفْعُلُ' })).not.toBeChecked()
    expect(within(first).queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders all 6 items of Training 2 and supports checking and resetting via إعادة التدريب', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/lesson/morphology-lesson-04'
    render(<App />)

    await user.click(openStep('التدريب الثاني — أكمل الجدول'))
    const trainingTwo = screen.getByTestId('morph4-training-two')
    for (let i = 1; i <= 6; i += 1) {
      expect(within(trainingTwo).getByTestId(`train2-t2-${i}`)).toBeInTheDocument()
    }

    const fifth = within(trainingTwo).getByTestId('train2-t2-5')
    await user.selectOptions(within(fifth).getByLabelText('الوزن الصرفي لـ وَرِثَ — يَرِثُ'), 'فَعِلَ — يَفْعِلُ')
    await user.selectOptions(within(fifth).getByLabelText('رقم الباب لـ وَرِثَ — يَرِثُ'), 'الخامس')
    await user.click(within(fifth).getByRole('button', { name: 'تحقق من الإجابة' }))
    expect(within(fifth).getByRole('status')).toHaveTextContent('إجابة صحيحة')

    await user.click(screen.getByTestId('train2-retry'))
    expect(within(fifth).getByLabelText('الوزن الصرفي لـ وَرِثَ — يَرِثُ')).toHaveValue('')
    expect(within(fifth).getByLabelText('رقم الباب لـ وَرِثَ — يَرِثُ')).toHaveValue('')
    expect(within(fifth).queryByRole('status')).not.toBeInTheDocument()
  })

  it('does not reveal answer correctness, page score, or model solutions when checking a page or navigating before final submission, and reveals them only after full test submission', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/lesson/morphology-lesson-04'
    render(<App />)

    await user.click(openStep('القسم الأول: الميزان الصرفي وعين الفعل'))
    expect(screen.getByTestId('test-page-morph4-mizan-ayn')).toBeInTheDocument()

    const q1 = screen.getByTestId('morph4-question-q01')
    await user.click(within(q1).getByRole('radio', { name: 'ف، ع، ل' }))
    expect(within(q1).queryByText('إجابة صحيحة')).not.toBeInTheDocument()

    // Clicking «تحقّق من الإجابات» on a page before final submission saves the page without disclosing correctness or solutions.
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(screen.getByTestId('test-page-saved-morph4-mizan-ayn')).toHaveTextContent(
      'تم حفظ إجابات هذه الصفحة. لا تُكشف صحة الإجابات أو الحلول النموذجية إلا بعد تسليم الاختبار كاملًا.',
    )
    expect(screen.queryByTestId('test-page-summary-morph4-mizan-ayn')).not.toBeInTheDocument()
    expect(within(q1).queryByText('إجابة صحيحة')).not.toBeInTheDocument()
    expect(within(q1).queryByText('الإجابة الصحيحة:')).not.toBeInTheDocument()

    // Navigating to another test page and back preserves the answer without any disclosure.
    await user.click(openStep('القسم الثاني: الأبواب الثلاثة الأولى'))
    expect(screen.getByTestId('test-page-morph4-first-three')).toBeInTheDocument()
    await user.click(openStep('القسم الأول: الميزان الصرفي وعين الفعل'))
    expect(within(screen.getByTestId('morph4-question-q01')).getByRole('radio', { name: 'ف، ع، ل' })).toBeChecked()
    expect(within(screen.getByTestId('morph4-question-q01')).queryByText('إجابة صحيحة')).not.toBeInTheDocument()

    // Visiting «حلول الاختبار» before final submission keeps all pages locked, including the checked page.
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('morphology4-solutions')).toHaveTextContent(
      'لا تُكشف الحلول النموذجية أو صحة الإجابات إلا بعد تسليم الاختبار كاملًا',
    )
    expect(screen.queryByTestId('solution-q01')).not.toBeInTheDocument()
    expect(screen.getByTestId('solutions-page-morph4-mizan-ayn')).toHaveTextContent('تحقّق من هذه الصفحة أولًا')
    expect(screen.getByTestId('solutions-page-morph4-first-three')).toHaveTextContent('تحقّق من هذه الصفحة أولًا')

    // Visiting «تسليم الاختبار والنتيجة» before clicking the submit button does not reveal the score yet.
    await user.click(openStep('تسليم الاختبار والنتيجة'))
    expect(screen.getByTestId('morph4-submit')).not.toHaveTextContent('النتيجة:')

    // Submitting the complete test reveals the final score and unlocks the model solutions.
    await user.click(screen.getByTestId('morph4-submit-btn'))
    expect(screen.getByTestId('morph4-submit')).toHaveTextContent('النتيجة: ١ من ٢٠ إجابة صحيحة')

    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('solution-q01')).toHaveTextContent('الإجابة الصحيحة:')
    expect(screen.getByTestId('solution-q01')).toHaveTextContent('ف، ع، ل')
  })

  it('gates the Teacher Area behind the password and displays all model solutions and audit notes', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/lesson/morphology-lesson-04'
    render(<App />)

    await user.click(openStep('منطقة خاصة بالمعلم'))
    expect(screen.getByLabelText('كلمة المرور')).toBeInTheDocument()
    expect(screen.queryByText(teacherKeyHeader)).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('كلمة المرور'), COURSE_TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByText(teacherKeyHeader)).toBeInTheDocument()
    for (const heading of [
      'أ. الحلول التفصيلية لاختبار الدرس (٢٠ سؤالًا)',
      'ب. حل التدريب الأول: حدّد الباب الصرفي (٦ أسئلة)',
      'ج. حل التدريب الثاني: أكمل الجدول (٦ أسئلة)',
      'د. سجل التدقيق العلمي وحسم التناقضات',
      'هـ. أخطاء متوقعة عند الطلاب وكيفية معالجتها',
    ]) {
      expect(screen.getByRole('heading', { name: heading, level: 3 })).toBeInTheDocument()
    }
  })
})
