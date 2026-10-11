/**
 * اختبار التدفق التفاعلي للدرس السادس من قسم الصرف (الفعل الرباعي المجرّد والمزيد).
 *
 * يغطي:
 *  - ربط الدرس بقسم الصرف وفتحه من بطاقته؛
 *  - نص المصدر في مواضعه (التعريفان، الجدولان، القاعدة الذهبية، الخلاصة)؛
 *  - الأنشطة الستة، مع حجب الحلول قبل محاولة الطالب وطلبها؛
 *  - التدريبيَن الأصليَّين (٤ + ٣) مع عمل زرَّي المصدر على التدريبين معًا؛
 *  - الاختبار النهائي (٢٠ سؤالًا في ٤ صفحات) مع حجب الصحة والدرجة والحلول قبل التسليم،
 *    وبوابتَي الحلول والنتيجة قبل التسليم الكامل وبعده، وإعادة القفل عند إعادة الاختبار؛
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

function openLesson() {
  window.location.hash = '#/lesson/morphology-lesson-06'
  return render(<App />)
}

describe('Morphology Lesson 06 — Interactive Flow & Navigation', () => {
  it('links the lesson from the الصرف section and opens its first step', () => {
    window.location.hash = '#/sections/morphology'
    const section = render(<App />)
    expect(screen.getByRole('link', { name: 'الفعل الرباعي المجرّد والمزيد' })).toHaveAttribute(
      'href',
      '#/lesson/morphology-lesson-06',
    )
    section.unmount()

    openLesson()
    expect(
      screen.getByRole('heading', { name: 'الدرس السادس: الفعل الرباعي المجرّد والمزيد', level: 2 }),
    ).toBeInTheDocument()
    expect(screen.getByText(/قسم الصرف · الدرس السادس/)).toBeInTheDocument()
    expect(screen.getByText(/في هذا الدرس سنتعلّم كيف نميّز بين الفعل الرباعي المجرّد/)).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(8)
  })

  it('presents the source review, definition and weight table verbatim', async () => {
    const user = userEvent.setup()
    openLesson()

    await user.click(openStep('مراجعة سريعة'))
    expect(screen.getByTestId('morph6-review')).toHaveTextContent('ثلاثيًّا')
    expect(screen.getByTestId('morph6-review')).toHaveTextContent('رباعيًّا')
    expect(screen.getByText(/نحن نعدّ الحروف الأصلية، وليس كل الحروف الموجودة في الفعل/)).toBeInTheDocument()

    await user.click(openStep('ثانيًا: ما الفعل الرباعي المجرّد'))
    expect(
      screen.getByText(
        'الفعل الرباعي المجرّد هو الفعل الذي تتكوّن جميع حروفه من أربعة أحرف أصلية، ولا يوجد فيه حرف زائد على أصوله.',
      ),
    ).toBeInTheDocument()

    await user.click(openStep('ما وزن الفعل الرباعي المجرّد'))
    const table = screen.getByTestId('morph6-falala-table')
    for (const verb of ['دَحْرَجَ', 'زَلْزَلَ', 'وَسْوَسَ', 'بَعْثَرَ']) {
      expect(within(table).getByText(verb)).toBeInTheDocument()
    }
    expect(within(table).getAllByText('فَعْلَلَ')).toHaveLength(4)
    // مقابلة الحرف بالحرف: د→ف، ح→ع، ر→ل، ج→ل (لام ثانية)، ولا حرف زائد في المجرّد.
    expect(screen.getByText('الحرف الأول: د يقابله ف.')).toBeInTheDocument()
    expect(screen.getByText('الحرف الرابع: ج يقابله ل.')).toBeInTheDocument()
    expect(screen.queryByText('زائد')).not.toBeInTheDocument()
    // ت-5 بشارة المنصة، ولا وزن جديدًا في المتن.
    expect(screen.getByText('توضيح تعليمي من المنصة')).toBeInTheDocument()
    expect(screen.getByText(/فَعْلَلَ هو الوزن الأساسي/)).toBeInTheDocument()
  })

  it('keeps the counting activity hidden until the student answers and checks', async () => {
    const user = userEvent.setup()
    openLesson()

    await user.click(openStep('عدّ الحروف الأصلية قبل الحكم'))
    const grid = screen.getByTestId('morph6-lab-count')
    expect(within(grid).getAllByTestId(/^cnt-/)).toHaveLength(6)

    const item = screen.getByTestId('cnt-4')
    expect(within(item).queryByRole('status')).not.toBeInTheDocument()
    const check = within(item).getByRole('button', { name: 'تحقق من التصنيف' })
    expect(check).toBeDisabled()

    await user.selectOptions(within(item).getByLabelText('تصنيف دَحْرَجَ'), 'رباعي (٤ أحرف أصلية)')
    expect(check).toBeEnabled()
    await user.click(check)
    expect(within(item).getByRole('status')).toHaveTextContent('تصنيف صحيح')

    // إجابة خاطئة: تصحيح بلا كشف مسبق، مع ذكر التصنيف الصحيح والتعليل.
    const wrong = screen.getByTestId('cnt-5')
    await user.selectOptions(within(wrong).getByLabelText('تصنيف زَلْزَلَ'), 'ثلاثي (٣ أحرف أصلية)')
    await user.click(within(wrong).getByRole('button', { name: 'تحقق من التصنيف' }))
    expect(within(wrong).getByRole('status')).toHaveTextContent('تصنيف غير صحيح')
    expect(within(wrong).getByRole('status')).toHaveTextContent('رباعي (٤ أحرف أصلية)')

    await user.click(screen.getByTestId('lab-count-retry'))
    expect(within(item).queryByRole('status')).not.toBeInTheDocument()
    expect(within(wrong).queryByRole('status')).not.toBeInTheDocument()
  })

  it('maps every root letter to a scale letter in the فَعْلَلَ lab, only after the four picks', async () => {
    const user = userEvent.setup()
    openLesson()

    await user.click(openStep('قابِل كل حرف أصلي بحرف الميزان'))
    const item = screen.getByTestId('scl-1')
    expect(within(item).queryByRole('status')).not.toBeInTheDocument()
    const check = within(item).getByRole('button', { name: 'تحقق من المقابلة' })
    expect(check).toBeDisabled()

    await user.selectOptions(within(item).getByLabelText('الحرف الأول: د'), 'ف')
    await user.selectOptions(within(item).getByLabelText('الحرف الثاني: ح'), 'ع')
    await user.selectOptions(within(item).getByLabelText('الحرف الثالث: ر'), 'ل')
    expect(check).toBeDisabled()
    await user.selectOptions(within(item).getByLabelText('الحرف الرابع: ج'), 'ل')
    expect(check).toBeEnabled()

    await user.click(check)
    const feedback = within(item).getByRole('status')
    expect(feedback).toHaveTextContent('مقابلة صحيحة ودقيقة')
    expect(feedback).toHaveTextContent('فَعْلَلَ')
    // جدول المقابلة الكامل يظهر بعد التحقق فقط، وبلا شارة «زائد» في المجرّد.
    expect(within(feedback).getByText('مقابلة «دَحْرَجَ» بالميزان')).toBeInTheDocument()
    expect(within(feedback).queryByText('زائد')).not.toBeInTheDocument()
  })

  it('teaches that a repeated letter is a root letter, then grades the judgement activity', async () => {
    const user = userEvent.setup()
    openLesson()

    await user.click(openStep('تكرار الحرف لا يعني أنه زائد'))
    expect(
      screen.getByText(/تكرار حرف في الفعل لا يعني أنه حرف زائد؛ ففي «زَلْزَلَ» مثلًا، الحروف الأربعة أصلية/),
    ).toBeInTheDocument()
    expect(screen.getByTestId('morph6-repeat')).toHaveTextContent('الأحرف الأصلية: ز، ل، ز، ل')
    expect(screen.getByText(/المضعَّف الرباعي/)).toBeInTheDocument()

    await user.click(openStep('الحرف المكرَّر — أصلي أم زائد'))
    const item = screen.getByTestId('rpt-1')
    const check = within(item).getByRole('button', { name: 'تحقق من الحكم' })
    expect(check).toBeDisabled()
    expect(within(item).queryByRole('status')).not.toBeInTheDocument()

    await user.click(within(item).getByRole('radio', { name: /أصلي — لأن التكرار في الأصل نفسه/ }))
    await user.selectOptions(within(item).getByLabelText('عدد الأحرف الأصلية في زَلْزَلَ'), '٤')
    await user.selectOptions(within(item).getByLabelText('وزن زَلْزَلَ'), 'فَعْلَلَ')
    expect(check).toBeEnabled()
    await user.click(check)
    expect(within(item).getByRole('status')).toHaveTextContent('حكم صحيح ودقيق')
  })

  it('builds تَفَعْلَلَ from the source flow and grades the building lab', async () => {
    const user = userEvent.setup()
    openLesson()

    await user.click(openStep('وزن تَفَعْلَلَ وكيف يُصاغ'))
    const flow = screen.getByTestId('morph6-build-flow')
    expect(within(flow).getAllByRole('generic').length).toBeGreaterThanOrEqual(7)
    expect(flow).toHaveTextContent('الفعل المجرّد')
    expect(flow).toHaveTextContent('نضيف التاء في البداية')
    expect(flow).toHaveTextContent('تَدَحْرَجَ')
    expect(
      screen.getByText('يُصاغ هذا الوزن بإضافة التاء في بداية الفعل الرباعي المجرّد.'),
    ).toBeInTheDocument()
    expect(screen.getByText('توضيح تعليمي من المنصة')).toBeInTheDocument()

    await user.click(openStep('ابنِ وزن تَفَعْلَلَ'))
    const item = screen.getByTestId('bld-1')
    const check = within(item).getByRole('button', { name: 'تحقق من البناء' })
    expect(check).toBeDisabled()

    await user.selectOptions(within(item).getByLabelText('موضع إضافة التاء'), 'في بداية الفعل')
    await user.click(within(item).getByRole('radio', { name: 'تَدَحْرَجَ' }))
    await user.selectOptions(within(item).getByLabelText('وزن الفعل المزيد'), 'تَفَعْلَلَ')
    await user.click(check)
    const feedback = within(item).getByRole('status')
    expect(feedback).toHaveTextContent('بناء صحيح ودقيق')
    expect(feedback).toHaveTextContent('دَحْرَجَ')
    expect(feedback).toHaveTextContent('تَدَحْرَجَ')
    expect(feedback).toHaveTextContent('الحرف الزائد: التاء')
  })

  it('shows the source comparison table and the golden rule, then grades the comparison activity', async () => {
    const user = userEvent.setup()
    openLesson()

    await user.click(openStep('خامسًا: مقارنة بين المجرّد والمزيد'))
    const table = screen.getByTestId('morph6-comparison-table')
    for (const aspect of ['الحروف الأصلية', 'الحروف الزائدة', 'المثال', 'الوزن']) {
      expect(within(table).getByText(aspect)).toBeInTheDocument()
    }
    expect(within(table).getByText('فَعْلَلَ')).toBeInTheDocument()
    expect(within(table).getByText('تَفَعْلَلَ')).toBeInTheDocument()

    await user.click(openStep('القاعدة الذهبية'))
    expect(screen.getByTestId('morph6-golden-rule')).toHaveTextContent(
      'إذا كان الفعل يحتوي على أربعة أحرف أصلية فقط، فهو رباعي مجرّد.',
    )
    expect(screen.getByText(/ولا تحكم على الفعل من عدد حروفه الظاهرة وحده/)).toBeInTheDocument()

    await user.click(openStep('قارِن بين المجرّد والمزيد'))
    const mazeedItem = screen.getByTestId('cmp-2')
    expect(within(mazeedItem).queryByRole('status')).not.toBeInTheDocument()
    await user.selectOptions(within(mazeedItem).getByLabelText('عدد الحروف الظاهرة'), '٥')
    await user.selectOptions(within(mazeedItem).getByLabelText('عدد الأحرف الأصلية'), '٤')
    await user.selectOptions(within(mazeedItem).getByLabelText('الحرف الزائد'), 'التاء')
    await user.selectOptions(within(mazeedItem).getByLabelText('الوزن'), 'تَفَعْلَلَ')
    await user.click(within(mazeedItem).getByRole('button', { name: 'تحقق من المقارنة' }))
    expect(within(mazeedItem).getByRole('status')).toHaveTextContent('مقارنة صحيحة ودقيقة')
  })

  it('keeps the ordering-activity solution hidden until requested through إظهار الحل', async () => {
    const user = userEvent.setup()
    openLesson()

    await user.click(openStep('رتّب خطوات تحديد نوع الفعل'))
    expect(screen.queryByTestId('lab-order-solution')).not.toBeInTheDocument()
    const check = screen.getByRole('button', { name: 'تحقق من الترتيب' })
    expect(check).toBeDisabled()

    await user.selectOptions(screen.getByLabelText('وصف الخطوة ١'), 'اقرأ الفعل مضبوطًا قدر الإمكان')
    await user.selectOptions(screen.getByLabelText('وصف الخطوة ٢'), 'حدّد حروفه الأصلية')
    await user.selectOptions(screen.getByLabelText('وصف الخطوة ٣'), 'تحقّق من وجود حرف زائد')
    await user.selectOptions(
      screen.getByLabelText('وصف الخطوة ٤'),
      'إذا كانت أصوله أربعة أحرف ولا زيادة فيه، فهو رباعي مجرّد',
    )
    await user.selectOptions(
      screen.getByLabelText('وصف الخطوة ٥'),
      'إذا كانت أصوله أربعة أحرف ومعها زيادة، فهو رباعي مزيد',
    )
    expect(check).toBeEnabled()
    await user.click(check)
    expect(screen.getByTestId('lab-order-feedback')).toHaveTextContent('ترتيب صحيح ودقيق')
    expect(screen.queryByTestId('lab-order-solution')).not.toBeInTheDocument()

    await user.click(screen.getByTestId('lab-order-reveal'))
    expect(screen.getByTestId('lab-order-solution')).toHaveTextContent('وزنه: تَفَعْلَلَ')
    await user.click(screen.getByTestId('lab-order-retry'))
    expect(screen.queryByTestId('lab-order-solution')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lab-order-feedback')).not.toBeInTheDocument()
  })

  it('diagnoses تَزَلْزَلَ through the five source fields, only after all of them are answered', async () => {
    const user = userEvent.setup()
    openLesson()

    await user.click(openStep('مثال تطبيقي: تَزَلْزَلَ'))
    expect(screen.getByText('حروفه الظاهرة: ت، ز، ل، ز، ل.')).toBeInTheDocument()
    expect(screen.getByText('وزنه: تَفَعْلَلَ.')).toBeInTheDocument()

    await user.click(openStep('نشاط تشخيصي: حلّل تَزَلْزَلَ'))
    const item = screen.getByTestId('morph6-lab-diagnose')
    const check = screen.getByTestId('diagnose-check')
    expect(check).toBeDisabled()
    expect(within(item).queryByRole('status')).not.toBeInTheDocument()

    await user.selectOptions(within(item).getByLabelText('حروفه الظاهرة'), 'ت، ز، ل، ز، ل')
    await user.selectOptions(within(item).getByLabelText('حروفه الأصلية'), 'ز، ل، ز، ل')
    await user.selectOptions(within(item).getByLabelText('الحرف الزائد'), 'التاء')
    await user.selectOptions(within(item).getByLabelText('نوع الفعل'), 'رباعي مزيد')
    await user.selectOptions(within(item).getByLabelText('وزنه'), 'تَفَعْلَلَ')
    expect(check).toBeEnabled()
    await user.click(check)
    expect(within(item).getByRole('status')).toHaveTextContent('تحليل صحيح ودقيق')

    // تعديل إجابة واحدة يُلغي النتيجة السابقة حتى إعادة التحقق (لا تصحيح بلا محاولة كاملة).
    await user.selectOptions(within(item).getByLabelText('نوع الفعل'), 'رباعي مجرّد')
    expect(within(item).queryByRole('status')).not.toBeInTheDocument()
    await user.click(check)
    expect(within(item).getByRole('status')).toHaveTextContent('راجع تحليلك')
  })

  it('runs both source trainings with per-item checks and source-labelled buttons acting on both', async () => {
    const user = userEvent.setup()
    openLesson()

    await user.click(openStep('التدريب الأول — حدّد نوع الفعل'))
    const trainingOne = screen.getByTestId('morph6-training-one')
    for (const id of ['t1-1', 't1-2', 't1-3', 't1-4']) {
      expect(within(trainingOne).getByTestId(`train1-${id}`)).toBeInTheDocument()
    }
    expect(screen.getByText(/حاول الحل بنفسك قبل الاطلاع على الإجابات/)).toBeInTheDocument()
    expect(screen.queryByTestId('trainings-solution')).not.toBeInTheDocument()

    const first = within(trainingOne).getByTestId('train1-t1-1')
    await user.click(within(first).getByRole('radio', { name: 'رباعي مجرّد' }))
    await user.click(within(first).getByRole('button', { name: 'تحقق من الإجابة' }))
    expect(within(first).getByRole('status')).toHaveTextContent('إجابة صحيحة')

    // الزرّان كما ورد عنواناهما في المصدر (م6-2)، ويعملان على التدريبين معًا.
    await user.click(openStep('التدريب الثاني — اكتب الوزن الصرفي'))
    const trainingTwo = screen.getByTestId('morph6-training-two')
    for (const id of ['t2-5', 't2-6', 't2-7']) {
      expect(within(trainingTwo).getByTestId(`train2-${id}`)).toBeInTheDocument()
    }
    expect(screen.getByText(/اكتب الوزن الصرفي/, { selector: 'h4' })).toBeInTheDocument()
    expect(screen.queryByTestId('trainings-solution')).not.toBeInTheDocument()

    const fifth = within(trainingTwo).getByTestId('train2-t2-5')
    await user.click(within(fifth).getByRole('radio', { name: 'فَعْلَلَ' }))
    await user.click(within(fifth).getByRole('button', { name: 'تحقق من الإجابة' }))
    expect(within(fifth).getByRole('status')).toHaveTextContent('إجابة صحيحة')

    // «إظهار الإجابات والتصحيح» يكشف مفتاح التدريبين معًا.
    await user.click(screen.getByTestId('trainings-reveal'))
    expect(screen.getByTestId('trainings-solution')).toHaveTextContent('الإجابات والتصحيح للتدريب الثاني')
    expect(screen.getByTestId('trainings-solution')).toHaveTextContent('تَفَعْلَلَ')
    await user.click(openStep('التدريب الأول — حدّد نوع الفعل'))
    expect(screen.getByTestId('trainings-solution')).toHaveTextContent('الإجابات والتصحيح للتدريب الأول')
    expect(screen.getByTestId('trainings-solution')).toHaveTextContent('رباعي مجرّد')
    // الإجابات محفوظة بين الخطوتين (الحالة مرفوعة فوق LessonFlow).
    expect(within(screen.getByTestId('train1-t1-1')).getByRole('radio', { name: 'رباعي مجرّد' })).toBeChecked()

    // «إعادة التدريبات» تمسح التدريبين وتُقفل الكشف من جديد.
    await user.click(screen.getByTestId('trainings-retry'))
    expect(screen.queryByTestId('trainings-solution')).not.toBeInTheDocument()
    expect(within(screen.getByTestId('train1-t1-1')).queryByRole('status')).not.toBeInTheDocument()
    expect(
      within(screen.getByTestId('train1-t1-1')).getByRole('radio', { name: 'رباعي مجرّد' }),
    ).not.toBeChecked()
    await user.click(openStep('التدريب الثاني — اكتب الوزن الصرفي'))
    expect(screen.queryByTestId('trainings-solution')).not.toBeInTheDocument()
    expect(within(screen.getByTestId('train2-t2-5')).queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows the source summary points and a text-only lesson-7 teaser (no lesson 7 built)', async () => {
    const user = userEvent.setup()
    openLesson()

    await user.click(openStep('ثامنًا: خلاصة الدرس'))
    expect(screen.getByTestId('morph6-summary')).toHaveTextContent('وزن الرباعي المجرّد: فَعْلَلَ.')
    expect(screen.getByTestId('morph6-summary')).toHaveTextContent('وزن تَدَحْرَجَ: تَفَعْلَلَ.')
    expect(
      screen.getByText('والآن أصبح لديك أساس التمييز بين الفعل الرباعي المجرّد والمزيد.'),
    ).toBeInTheDocument()

    await user.click(openStep('الدرس السابع: الفعل الصحيح'))
    expect(screen.getByText('الفعل الصحيح والفعل المعتل')).toBeInTheDocument()
    expect(screen.getByText(/لم يُبنَ الدرس السابع ولم يُسجَّل بعد/)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /الدرس السابع/ })).not.toBeInTheDocument()
  })

  it('does not reveal answer correctness, page score, or solutions before final submission, and reveals them only after تسليم الاختبار كاملًا', async () => {
    const user = userEvent.setup()
    openLesson()

    await user.click(openStep('القسم الأول: المفاهيم والتمييز'))
    expect(screen.getByTestId('test-page-morph6-concepts')).toBeInTheDocument()

    const q1 = screen.getByTestId('morph6-question-q01')
    const correctOption = 'فعل تتكوّن جميع حروفه من أربعة أحرف أصلية، ولا يوجد فيه حرف زائد على أصوله'
    await user.click(within(q1).getByRole('radio', { name: correctOption }))
    expect(within(q1).queryByText('إجابة صحيحة')).not.toBeInTheDocument()

    // «تحقّق من الإجابات» قبل التسليم يحفظ الصفحة صامتًا دون أي كشف.
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(screen.getByTestId('test-page-saved-morph6-concepts')).toHaveTextContent(
      'تم حفظ إجابات هذه الصفحة. لا تُكشف صحة الإجابات أو الحلول النموذجية إلا بعد تسليم الاختبار كاملًا.',
    )
    expect(screen.queryByTestId('test-page-summary-morph6-concepts')).not.toBeInTheDocument()
    expect(within(q1).queryByText('إجابة صحيحة')).not.toBeInTheDocument()
    expect(within(q1).queryByText('الإجابة الصحيحة:')).not.toBeInTheDocument()

    // التنقل بين الصفحات يحفظ الإجابة دون كشف.
    await user.click(openStep('القسم الثاني: الحروف الأصلية والزائدة'))
    expect(screen.getByTestId('test-page-morph6-letters')).toBeInTheDocument()
    await user.click(openStep('القسم الأول: المفاهيم والتمييز'))
    expect(within(screen.getByTestId('morph6-question-q01')).getByRole('radio', { name: correctOption })).toBeChecked()
    expect(within(screen.getByTestId('morph6-question-q01')).queryByText('إجابة صحيحة')).not.toBeInTheDocument()

    // «حلول الاختبار» مقفلة قبل التسليم، حتى للصفحة المحقَّقة منها.
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('morphology6-solutions')).toHaveTextContent(
      'لا تُكشف الحلول النموذجية أو صحة الإجابات إلا بعد تسليم الاختبار كاملًا',
    )
    expect(screen.queryByTestId('solution-q01')).not.toBeInTheDocument()
    expect(screen.getByTestId('solutions-page-morph6-concepts')).toHaveTextContent('تحقّق من هذه الصفحة أولًا')
    expect(screen.getByTestId('solutions-page-morph6-analysis')).toHaveTextContent('تحقّق من هذه الصفحة أولًا')

    // صفحة التسليم قبل الضغط على الزر لا تُظهر النتيجة.
    await user.click(openStep('تسليم الاختبار والنتيجة'))
    expect(screen.getByTestId('morph6-submit')).not.toHaveTextContent('النتيجة:')

    // التسليم الكامل يكشف النتيجة النهائية ويفتح الحلول.
    await user.click(screen.getByTestId('morph6-submit-btn'))
    expect(screen.getByTestId('morph6-submit')).toHaveTextContent('النتيجة: ١ من ٢٠ إجابة صحيحة')

    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('solution-q01')).toHaveTextContent('الإجابة الصحيحة:')
    expect(screen.getByTestId('solution-q01')).toHaveTextContent(correctOption)

    // إعادة الاختبار تمسح الإجابات وتُقفل النتيجة والحلول من جديد.
    await user.click(openStep('تسليم الاختبار والنتيجة'))
    await user.click(screen.getByRole('button', { name: 'إعادة الاختبار' }))
    expect(screen.getByTestId('morph6-submit')).not.toHaveTextContent('النتيجة:')
    await user.click(openStep('حلول الاختبار'))
    expect(screen.queryByTestId('solution-q01')).not.toBeInTheDocument()
    await user.click(openStep('القسم الأول: المفاهيم والتمييز'))
    expect(within(screen.getByTestId('morph6-question-q01')).getByRole('radio', { name: correctOption })).not.toBeChecked()
  })

  it('keeps the teacher key out of every student step and gates the Teacher Area behind the password', async () => {
    const user = userEvent.setup()
    openLesson()

    for (const stepName of ['ثامنًا: خلاصة الدرس', 'حلول الاختبار', 'التدريب الثاني — اكتب الوزن الصرفي']) {
      await user.click(openStep(stepName))
      expect(screen.queryByText(teacherKeyHeader)).not.toBeInTheDocument()
    }

    await user.click(openStep('منطقة خاصة بالمعلم'))
    expect(screen.getByLabelText('كلمة المرور')).toBeInTheDocument()
    expect(screen.queryByText(teacherKeyHeader)).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('كلمة المرور'), COURSE_TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByText(teacherKeyHeader)).toBeInTheDocument()
    for (const heading of [
      'أ. الحلول التفصيلية لاختبار الدرس (٢٠ سؤالًا)',
      'ب. حل التدريب الأول: حدّد نوع الفعل (٤ أسئلة)',
      'ج. حل التدريب الثاني: اكتب الوزن الصرفي (٣ أسئلة)',
      'د. حلول الأنشطة التفاعلية السبعة',
      'هـ. تحليل الأمثلة السبعة: الوزن والحروف الأصلية والزائدة',
      'و. قواعد الميزان وحدود الضبط في هذا الدرس',
      'ز. أخطاء متوقعة عند الطلاب وكيفية معالجتها',
      'ح. الإحالات: مواضع المصدر وسجل التدقيق',
    ]) {
      expect(screen.getByRole('heading', { name: heading, level: 3 })).toBeInTheDocument()
    }

    // الحلول التفصيلية للأسئلة العشرين، ومفاتيح التدريبات، وتحليل الأمثلة السبعة.
    expect(screen.getAllByTestId(/^solution-q/)).toHaveLength(20)
    expect(screen.getByText('دَحْرَجَ: فَعْلَلَ (رباعي مجرّد؛ الأصول د ح ر ج).')).toBeInTheDocument()
    expect(screen.getByText(/مقابلة «تَدَحْرَجَ» بحروف الميزان/)).toBeInTheDocument()
    expect(screen.getByText(/الأفعال المساندة الموثّقة في الاختبار/)).toBeInTheDocument()
    expect(screen.getAllByText(/طَمْأَنَ/).length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('زائد').length).toBe(3)
    // سجل التدقيق: إحالتا المصدر والتقرير.
    expect(screen.getAllByText(/docs\/source\/morphology-lesson-06\.md/).length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText(/docs\/morphology-lesson-06-audit\.md/).length).toBeGreaterThanOrEqual(2)
  })
})
