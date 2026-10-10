/**
 * اختبار التدفق التفاعلي للدرس الثالث من قسم الصرف (الفعل المجرّد والمزيد).
 *
 * يغطي: ربط الدرس بقسم الصرف، ومختبرات لها تفسير بعد التحقق لا قبله، والتحقق على
 * مستوى الصفحة مع بقاء الحلول والنتيجة مقفولة حتى تُتحقَّق كل الصفحات، ومنطقة معلم
 * مستقلة محمية بكلمة المرور.
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

describe('Morphology Lesson 03 — Interactive Flow & Navigation', () => {
  it('links the lesson from the الصرف section and opens its first step', () => {
    window.location.hash = '#/sections/morphology'
    const section = render(<App />)
    expect(screen.getByRole('link', { name: 'الفعل المجرّد والمزيد' })).toHaveAttribute(
      'href',
      '#/lesson/morphology-lesson-03',
    )
    section.unmount()

    window.location.hash = '#/lesson/morphology-lesson-03'
    render(<App />)
    expect(screen.getByRole('heading', { name: 'الدرس الثالث: الفعل المجرّد والمزيد', level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/الدرس السابق/)).toBeInTheDocument()
  })

  it('gives explanatory feedback only after the check button in the classification lab', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/lesson/morphology-lesson-03'
    render(<App />)

    await user.click(openStep('مختبر: تصنيف الأفعال'))
    const first = screen.getByTestId('classify-cls-1')
    expect(within(first).queryByRole('status')).not.toBeInTheDocument()

    await user.click(within(first).getByRole('radio', { name: 'رباعي مجرّد' }))
    await user.click(within(first).getByRole('button', { name: 'تحقق من الإجابة' }))
    expect(within(first).getByRole('status')).toHaveTextContent('ليس هذا هو التصنيف الصحيح')
    expect(within(first).getByRole('status')).toHaveTextContent('ثلاثي مجرّد')

    await user.click(within(first).getByRole('radio', { name: 'ثلاثي مجرّد' }))
    expect(within(first).queryByRole('status')).not.toBeInTheDocument()
    await user.click(within(first).getByRole('button', { name: 'تحقق من الإجابة' }))
    expect(within(first).getByRole('status')).toHaveTextContent('تصنيف صحيح')
  })

  it('reveals the original/extra analysis and its reason only after checking', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/lesson/morphology-lesson-03'
    render(<App />)

    await user.click(openStep('مختبر: الحروف الأصلية والزائدة'))
    const item = screen.getByTestId('orig-1')
    expect(within(item).queryByRole('status')).not.toBeInTheDocument()
    await user.click(within(item).getByRole('button', { name: 'تحقق من التحليل' }))
    expect(within(item).getByRole('status')).toBeInTheDocument()
    expect(within(item).getByRole('status')).toHaveTextContent('أصل الكلمة')
  })

  it('checks each test page on its own, keeps solutions and result gated, and keeps answers across steps', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/lesson/morphology-lesson-03'
    render(<App />)

    await user.click(openStep('التعريف والتمييز'))
    expect(screen.getByTestId('test-page-morph3-definitions')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))

    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('morphology3-solutions')).toBeInTheDocument()
    expect(screen.getByTestId('solutions-page-morph3-definitions')).toHaveTextContent('الإجابة الصحيحة')
    expect(screen.getByTestId('solutions-page-morph3-letters')).toHaveTextContent('تحقّق من هذه الصفحة أولًا')

    // النتيجة لا تظهر قبل التحقق من كل الصفحات.
    await user.click(openStep('تسليم الاختبار والنتيجة'))
    expect(screen.getByTestId('morph3-submit')).toHaveTextContent('تحقّق من كل صفحة أولًا')
    expect(screen.getByTestId('morph3-submit')).not.toHaveTextContent('النتيجة:')
  })

  it('gates the Teacher Area behind the password and shows the platform-authored keys', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/lesson/morphology-lesson-03'
    render(<App />)

    await user.click(openStep('منطقة خاصة بالمعلم'))
    expect(screen.getByLabelText('كلمة المرور')).toBeInTheDocument()
    expect(screen.queryByText(teacherKeyHeader)).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('كلمة المرور'), COURSE_TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByText(teacherKeyHeader)).toBeInTheDocument()
    for (const heading of [
      'أ. الحلول التفصيلية للاختبار (٢٠ سؤالًا)',
      'ب. حل التدريب الأول (٨ أفعال)',
      'ج. حل التدريب الثاني (٥ كلمات)',
      'د. مفتاح التدريب الثالث (٤ أسئلة)',
      'هـ. أخطاء يتوقعها المعلم',
    ]) {
      expect(screen.getByRole('heading', { name: heading, level: 3 })).toBeInTheDocument()
    }
  })
})
