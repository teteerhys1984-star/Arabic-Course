/**
 * اختبار التدفق التفاعلي للدرس الثاني من قسم الصرف (الميزان الصرفي).
 *
 * يغطي الضوابط المعتمدة: خطوات قصيرة وأنشطة حقيقية، تحقق على مستوى الصفحة،
 * بقاء الإجابات والنتائج مع تنقّل الخطوات، حلول مقفولة حتى التحقق، نتيجة
 * الاختبار بدرجاتها الثلاثين، ومنطقة معلم مستقلة محمية بكلمة المرور.
 */
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from '../../app/App'
import { COURSE_TEACHER_PASSWORD } from '../../shared/teacher/teacherPassword'

function openStep(name: string) {
  return within(screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' })).getByRole('button', {
    name: new RegExp(name),
  })
}

describe('Morphology Lesson 02 — Interactive Flow & Navigation', () => {
  it('links the lesson from the الصرف section and keeps activities, checks and solutions gated per page', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/sections/morphology'
    const section = render(<App />)

    // البطاقتان معًا في قسم الصرف، وكل واحدة تصل إلى درسها.
    expect(screen.getByRole('link', { name: 'الميزان الصرفي: وزن الكلمات' })).toHaveAttribute(
      'href',
      '#/lesson/morphology-lesson-02',
    )
    section.unmount()

    window.location.hash = '#/lesson/morphology-lesson-02'
    render(<App />)

    // الخطوة الأولى: عنوان الدرس وشرطه السابق.
    expect(
      screen.getByRole('heading', { name: 'الدرس الثاني: الميزان الصرفي', level: 2 }),
    ).toBeInTheDocument()
    expect(screen.getByText(/الدرس السابق/)).toBeInTheDocument()

    // نشاط تدريبي حقيقي: اختيار الوزن ثم التحقق (لا نتيجة قبل التحقق).
    await user.click(openStep('التدريب الأول'))
    const firstWord = screen.getByTestId('weight-t1-01')
    expect(firstWord).toBeInTheDocument()
    expect(within(firstWord).queryByRole('status')).not.toBeInTheDocument()
    await user.click(within(firstWord).getByRole('radio', { name: 'فَعَلَ' }))
    await user.click(within(firstWord).getByRole('button', { name: 'تحقق من الإجابة' }))
    expect(within(firstWord).getByRole('status')).toHaveTextContent('وزن صحيح')
    expect(within(firstWord).getByRole('status')).toHaveTextContent('مفتاح المعلم')

    // صفحة اختبار واحدة تُتحقَّق وحدها (التحقق على مستوى الصفحة).
    await user.click(openStep('القسم الثاني: الوزن الصرفي'))
    expect(screen.getByTestId('test-page-morph2-weights')).toBeInTheDocument()
    await user.selectOptions(
      screen.getByLabelText(/زِن الكلمة الآتية: كَتَبَ/),
      'فَعَلَ',
    )
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(screen.getByTestId('test-page-summary-morph2-weights')).toBeInTheDocument()

    // الحلول: تُكشف للصفحة المتحقَّق منها فقط، وتبقى مقفولة لما بعدها.
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('morphology2-solutions')).toBeInTheDocument()
    expect(screen.getByTestId('solutions-page-morph2-weights')).toHaveTextContent('الإجابة الصحيحة')
    expect(screen.getByTestId('solutions-page-morph2-analysis')).toHaveTextContent('تحقّق من هذه الصفحة أولًا')

    // النتيجة النهائية لا تظهر قبل التحقق من كل الصفحات.
    await user.click(openStep('تسليم الاختبار والنتيجة'))
    expect(screen.getByTestId('morph2-submit')).toHaveTextContent('تحقّق من كل صفحة أولًا')
    expect(screen.getByTestId('morph2-submit')).not.toHaveTextContent('الدرجة الآلية')

    // الإجابات والنتائج تبقى محفوظة مع تنقّل الخطوات.
    await user.click(openStep('خلاصة الدرس'))
    await user.click(openStep('القسم الثاني: الوزن الصرفي'))
    expect(screen.getByTestId('test-page-summary-morph2-weights')).toBeInTheDocument()
    expect(screen.getByLabelText(/زِن الكلمة الآتية: كَتَبَ/)).toHaveValue('فَعَلَ')
  })

  it('reports the 30-mark result after every page is checked, and gates the Teacher Area', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/lesson/morphology-lesson-02'
    render(<App />)

    // درجة واحدة صحيحة في القسم الثاني، وبقية الصفحات بلا إجابات.
    await user.click(openStep('القسم الثاني: الوزن الصرفي'))
    await user.selectOptions(screen.getByLabelText(/زِن الكلمة الآتية: فَهِمَ/), 'فَعِلَ')
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))

    for (const page of ['القسم الأول: التعريف والفهم', 'القسم الثالث: التحليل', 'القسم الرابع: اكتشاف الخطأ']) {
      await user.click(openStep(page))
      await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    }

    await user.click(openStep('تسليم الاختبار والنتيجة'))
    const submit = screen.getByTestId('morph2-submit')
    expect(submit).toHaveTextContent('الدرجة الآلية')
    // ٢٦ درجة آلية + ٤ تُراجع يدويًا = ٣٠ درجة معتمدة.
    expect(submit).toHaveTextContent('٢٦')
    expect(submit).toHaveTextContent('المجموع المعتمد')
    expect(submit).toHaveTextContent('٣٠')
    expect(submit).toHaveTextContent('تُراجع يدويًا')
    // قاعدة «أول خمس كلمات من ثمانٍ» ظاهرة للطالب.
    expect(submit).toHaveTextContent('لا يزيد الدرجة ولا ينقصها')
    // الدرجة الآلية هنا درجة واحدة (فَهِمَ: فَعِلَ) من ٢٦.
    expect(submit).toHaveTextContent('١')

    // منطقة المعلم: مستقلة ومحمية بكلمة المرور.
    await user.click(openStep('منطقة خاصة بالمعلم'))
    expect(screen.getByLabelText('كلمة المرور')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /مفتاح التدريب الأول/ })).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('كلمة المرور'), COURSE_TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    for (const heading of [
      'أ. الإجابات النموذجية التفصيلية للاختبار (٢٦ سؤالًا)',
      'ب. مفتاح التدريب الأول (١٥ كلمة) — نص المصدر',
      'ج. مفتاح التدريب الثاني (١٠ كلمات) — نص المصدر',
      'د. مفتاح التدريب الثالث (٥ أسئلة) — نص المصدر',
      'هـ. مفتاح التدريب الرابع (٦ عبارات) — نص المصدر',
      'و. مفتاح التدريب الخامس (٨ جمل) — نص المصدر',
      'ز. مفتاح الاختبار النهائي — نص المصدر',
      'ح. توزيع الدرجات وقاعدة الاحتساب — من إعداد المنصة',
      'ط. ملاحظات تصحيحية للمعلم — من إعداد المنصة',
      'ي. بطاقة المراجعة — من إعداد المنصة',
      'ك. التصحيحات المعتمدة والتوضيحات التعليمية (سجل التدقيق)',
    ]) {
      expect(screen.getByRole('heading', { name: heading, level: 3 })).toBeInTheDocument()
    }
    // مفاتيح التحليل الثماني كلها موجودة، ومنسوبة إلى المنصة لا إلى المصدر.
    expect(screen.getByText(/مفاتيح الكلمات الثماني المفصّلة الآتية من إعداد المنصة/)).toBeInTheDocument()
    expect(screen.getByText(/قالَ: الجذر ق و ل/)).toBeInTheDocument()
    expect(screen.getByText(/مَفْعول: الجذر ف ع ل/)).toBeInTheDocument()
  })
})
