/**
 * اختبار التدفق التفاعلي للدرس السابع من قسم الصرف (الفعل الصحيح والفعل المعتل).
 *
 * يغطي:
 *  - ربط الدرس بقسم الصرف بعد الدرس السادس وفتحه من بطاقته؛
 *  - نص المصدر في مواضعه (التعريفان، الجدولان، القاعدة الأساسية، الخلاصة)؛
 *  - الأنشطة السبعة، مع حجب الحلول قبل محاولة الطالب وإمكانية إعادة كل نشاط؛
 *  - التدريبيَن الأصليَّين (٦ + ٥ بترقيم ١–١١) مع عمل زرَّي المصدر على التدريبين معًا؛
 *  - الاختبار النهائي (٢٠ سؤالًا في ٤ صفحات) مع حجب الصحة والدرجة والحلول قبل التسليم،
 *    وكشفها بعد تسليم الاختبار كاملًا، وإعادة القفل عند إعادة الاختبار؛
 *  - منطقة المعلم المحمية بكلمة المرور وأقسامها القابلة للإغلاق.
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
  window.location.hash = '#/lesson/morphology-lesson-07'
  return render(<App />)
}

describe('Morphology Lesson 07 — Interactive Flow & Navigation', () => {
  it('links the lesson from the الصرف section after lesson 6 and opens its first step', () => {
    window.location.hash = '#/sections/morphology'
    const section = render(<App />)
    expect(screen.getByRole('link', { name: 'الفعل الصحيح والفعل المعتل' })).toHaveAttribute(
      'href',
      '#/lesson/morphology-lesson-07',
    )
    // ترتيب التسجيل الحالي: الصرف ١–٩، والسابع بعد السادس مباشرة؛ لا عاشر.
    const links = within(screen.getByRole('list', { name: 'دروس القسم' })).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '#/lesson/morphology-lesson-01',
      '#/lesson/morphology-lesson-02',
      '#/lesson/morphology-lesson-03',
      '#/lesson/morphology-lesson-04',
      '#/lesson/morphology-lesson-05',
      '#/lesson/morphology-lesson-06',
      '#/lesson/morphology-lesson-07',
      '#/lesson/morphology-lesson-08',
      '#/lesson/morphology-lesson-09',
    ])
    section.unmount()

    openLesson()
    expect(
      screen.getByRole('heading', { name: 'الدرس السابع: الفعل الصحيح والفعل المعتل', level: 2 }),
    ).toBeInTheDocument()
    expect(screen.getByText(/قسم الصرف · الدرس السابع/)).toBeInTheDocument()
    expect(screen.getByText(/في هذا الدرس سنتعلّم كيف نميّز بين الفعل الصحيح والفعل المعتل/)).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(8)
  })

  it('presents the source review, definitions and tables verbatim', async () => {
    const user = userEvent.setup()
    openLesson()

    await user.click(openStep('أولًا: مراجعة حروف العلّة'))
    expect(screen.getByText('الألف، والواو، والياء: ا، و، ي.')).toBeInTheDocument()
    expect(screen.getByText('رَمَى: يحتوي على الألف المقصورة في آخره، وأصلها ياء في هذا الفعل.')).toBeInTheDocument()

    await user.click(openStep('ثانيًا: ما الفعل الصحيح'))
    expect(
      screen.getByText('الفعل الصحيح هو الفعل الذي تخلو حروفه الأصلية من حروف العلّة.'),
    ).toBeInTheDocument()

    await user.click(openStep('أمثلة على الفعل الصحيح'))
    const table = screen.getByTestId('morph7-sahih-table')
    for (const verb of ['كَتَبَ', 'جَلَسَ', 'فَتَحَ', 'فَهِمَ', 'دَحْرَجَ']) {
      expect(within(table).getByText(verb)).toBeInTheDocument()
    }
    expect(within(table).getAllByText('لا يوجد حرف علّة أصلي')).toHaveLength(5)
    expect(screen.getByText(/الصحيح والمعتلّ تقسيمٌ بحسب حروف الفعل الأصلية/)).toBeInTheDocument()

    await user.click(openStep('رابعًا: ما الفعل المعتلّ'))
    const muallTable = screen.getByTestId('morph7-muall-table')
    for (const verb of ['وَعَدَ', 'قَالَ', 'بَاعَ', 'دَعَا', 'رَمَى']) {
      expect(within(muallTable).getByText(verb)).toBeInTheDocument()
    }
    expect(within(muallTable).getAllByText('الألف المنقلبة عن واو').length).toBeGreaterThanOrEqual(1)
    expect(within(muallTable).getAllByText('الألف المقصورة المنقلبة عن ياء').length).toBeGreaterThanOrEqual(1)

    await user.click(openStep('أصل ألف'))
    expect(screen.getByTestId('morph7-alif-origin')).toHaveTextContent('أصلها واو؛ لأن مضارعه «يَقُولُ»')
  })

  it('keeps the letters-position activity hidden until the student answers and checks, and retry resets it', async () => {
    const user = userEvent.setup()
    openLesson()

    await user.click(openStep('أين يظهر حرف العلّة'))
    const grid = screen.getByTestId('morph7-lab-letters')
    expect(within(grid).getAllByTestId(/^pos-/)).toHaveLength(4)

    const item = screen.getByTestId('pos-1')
    expect(within(item).queryByRole('status')).not.toBeInTheDocument()
    const check = within(item).getByRole('button', { name: 'تحقق من الاختيار' })
    expect(check).toBeDisabled()

    await user.selectOptions(within(item).getByLabelText('موضع حرف العلّة في وَعَدَ'), 'في الأول')
    expect(check).toBeEnabled()
    await user.click(check)
    expect(within(item).getByRole('status')).toHaveTextContent('اختيار صحيح')

    // إجابة خاطئة: تصحيح بلا كشف مسبق، مع ذكر الاختيار الصحيح والتعليل.
    const wrong = screen.getByTestId('pos-2')
    await user.selectOptions(within(wrong).getByLabelText('موضع حرف العلّة في قَالَ'), 'في الأول')
    await user.click(within(wrong).getByRole('button', { name: 'تحقق من الاختيار' }))
    expect(within(wrong).getByRole('status')).toHaveTextContent('اختيار غير صحيح')
    expect(within(wrong).getByRole('status')).toHaveTextContent('في الوسط')

    await user.click(screen.getByTestId('lab-retry'))
    expect(within(item).queryByRole('status')).not.toBeInTheDocument()
    expect(within(wrong).queryByRole('status')).not.toBeInTheDocument()
  })

  it('requires both the roots and the judgment before checking the roots activity', async () => {
    const user = userEvent.setup()
    openLesson()

    await user.click(openStep('الحروف الأصلية أولًا'))
    const item = screen.getByTestId('rt-1')
    const check = within(item).getByRole('button', { name: 'تحقق من التحليل' })
    expect(check).toBeDisabled()

    await user.selectOptions(within(item).getByLabelText('حروف أَكْرَمَ الأصلية'), 'ك ر م')
    expect(check).toBeDisabled()
    await user.selectOptions(within(item).getByLabelText('الحكم على أَكْرَمَ من حيث الأصول'), 'صحيح')
    expect(check).toBeEnabled()
    await user.click(check)
    expect(within(item).getByRole('status')).toHaveTextContent('تحليل صحيح')
    expect(within(item).getByRole('status')).toHaveTextContent('أَفْعَلَ')
  })

  it('grades the correct-types and alif-origin activities only after checking', async () => {
    const user = userEvent.setup()
    openLesson()

    await user.click(openStep('سالم أم مهموز أم مضعّف'))
    const item = screen.getByTestId('ty-3')
    expect(within(item).queryByRole('status')).not.toBeInTheDocument()
    await user.selectOptions(within(item).getByLabelText('نوع مَدَّ من أصوله'), 'مهموز')
    await user.click(within(item).getByRole('button', { name: 'تحقق من التصنيف' }))
    expect(within(item).getByRole('status')).toHaveTextContent('تصنيف غير صحيح')
    expect(within(item).getByRole('status')).toHaveTextContent('مضعّف')

    await user.click(openStep('من أين نعرف أصل الحرف'))
    const alif = screen.getByTestId('al-2')
    await user.selectOptions(within(alif).getByLabelText('أصل الحرف المنقلب في بَاعَ'), 'الياء')
    await user.click(within(alif).getByRole('button', { name: 'تحقق من الأصل' }))
    expect(within(alif).getByRole('status')).toHaveTextContent('أصل صحيح')
    expect(within(alif).getByRole('status')).toHaveTextContent('يَبِيعُ')
  })

  it('runs the pairs comparison with a reason field and the mistakes activity with verdicts', async () => {
    const user = userEvent.setup()
    openLesson()

    await user.click(openStep('قارِن بين الفعلين'))
    const pair = screen.getByTestId('pr-1')
    const check = within(pair).getByRole('button', { name: 'تحقق من المقارنة' })
    expect(check).toBeDisabled()
    await user.selectOptions(within(pair).getByLabelText('نوع وَعَدَ'), 'مثال')
    await user.selectOptions(within(pair).getByLabelText('نوع وَقَى'), 'لفيف مفروق')
    expect(check).toBeDisabled()
    await user.selectOptions(
      within(pair).getByLabelText('ما سبب اختلاف النوع بينهما؟'),
      '«وَعَدَ» فيه حرف علّة واحد في الأول، و«وَقَى» فيه حرفان أصليان يفصل بينهما حرف صحيح',
    )
    await user.click(check)
    expect(within(pair).getByRole('status')).toHaveTextContent('مقارنة صحيحة')

    await user.click(openStep('اكتشف الخطأ في التحليل'))
    const judge = screen.getByTestId('jm-2')
    await user.click(within(judge).getByRole('radio', { name: 'خطأ' }))
    await user.click(within(judge).getByRole('button', { name: 'تحقق من الحكم' }))
    expect(within(judge).getByRole('status')).toHaveTextContent('حكم صحيح')
    expect(within(judge).getByRole('status')).toHaveTextContent('صحيح مضعّف')
  })

  it('shows the layyef teaching, then the comparison table and the golden rule', async () => {
    const user = userEvent.setup()
    openLesson()

    await user.click(openStep('اللفيف المقرون والمفروق'))
    expect(screen.getByText('لفيف مقرون: حرفا العلّة متجاوران، مثل طَوَى.')).toBeInTheDocument()
    expect(screen.getByText('لفيف مفروق: يفصل بين حرفَي العلّة حرف صحيح، مثل وَقَى.')).toBeInTheDocument()

    await user.click(openStep('سادسًا: مقارنة شاملة'))
    const table = screen.getByTestId('morph7-comparison-table')
    expect(within(table).getByText('سالم، مهموز، مضعّف')).toBeInTheDocument()
    expect(within(table).getByText('مثال، أجوف، ناقص، لفيف')).toBeInTheDocument()

    // بطاقة القاعدة الذهبية في خطوة الخلاصة (نص المصدر حرفيًا).
    await user.click(openStep('تاسعًا: خلاصة الدرس'))
    expect(screen.getByTestId('morph7-golden-rule')).toHaveTextContent('إذا خلت الحروف الأصلية من حروف العلّة')
  })

  it('runs both source trainings with per-item checks and source-labelled buttons acting on both', async () => {
    const user = userEvent.setup()
    openLesson()

    await user.click(openStep('التدريب الأول — صحيح أم معتلّ'))
    const trainingOne = screen.getByTestId('morph7-training-one')
    for (const id of ['t1-1', 't1-2', 't1-3', 't1-4', 't1-5', 't1-6']) {
      expect(within(trainingOne).getByTestId(`train1-${id}`)).toBeInTheDocument()
    }
    expect(screen.queryByTestId('trainings-solution')).not.toBeInTheDocument()

    const first = within(trainingOne).getByTestId('train1-t1-2')
    await user.click(within(first).getByRole('radio', { name: 'صحيح' }))
    await user.click(within(first).getByRole('button', { name: 'تحقق من الإجابة' }))
    expect(within(first).getByRole('status')).toHaveTextContent('إجابة غير صحيحة')
    expect(within(first).getByRole('status')).toHaveTextContent('الإجابة الصحيحة: معتلّ')

    // التدريب الثاني يشارك الزرَّين نفسيهما (م7-2).
    await user.click(openStep('التدريب الثاني — حدّد نوع الفعل المعتلّ'))
    const trainingTwo = screen.getByTestId('morph7-training-two')
    for (const id of ['t2-7', 't2-8', 't2-9', 't2-10', 't2-11']) {
      expect(within(trainingTwo).getByTestId(`train2-${id}`)).toBeInTheDocument()
    }
    // البنود ١٠ و١١ بخياراتهما الأصلية المختلفة (م7-8).
    expect(within(screen.getByTestId('train2-t2-10')).getAllByRole('radio')).toHaveLength(4)
    expect(within(screen.getByTestId('train2-t2-11')).getAllByRole('radio')).toHaveLength(4)
    expect(within(screen.getByTestId('train2-t2-10')).getByText('لفيف مقرون')).toBeInTheDocument()
    expect(within(screen.getByTestId('train2-t2-11')).getByText('ناقص')).toBeInTheDocument()

    const seventh = within(trainingTwo).getByTestId('train2-t2-7')
    await user.click(within(seventh).getByRole('radio', { name: 'أجوف' }))
    await user.click(within(seventh).getByRole('button', { name: 'تحقق من الإجابة' }))
    expect(within(seventh).getByRole('status')).toHaveTextContent('الإجابة الصحيحة: مثال')

    // «إظهار الإجابات والتصحيح» يكشف مفتاح التدريبين معًا.
    await user.click(screen.getByTestId('trainings-reveal'))
    expect(screen.getByTestId('trainings-solution')).toHaveTextContent('الإجابات والتصحيح للتدريب الثاني')
    await user.click(openStep('التدريب الأول — صحيح أم معتلّ'))
    expect(screen.getByTestId('trainings-solution')).toHaveTextContent('الإجابات والتصحيح للتدريب الأول')
    // الإجابات محفوظة بين الخطوتين (الحالة مرفوعة فوق LessonFlow).
    expect(within(screen.getByTestId('train1-t1-2')).getByRole('radio', { name: 'صحيح' })).toBeChecked()

    // «إعادة التدريبات» تمسح التدريبين وتُقفل الكشف من جديد.
    await user.click(screen.getByTestId('trainings-retry'))
    expect(screen.queryByTestId('trainings-solution')).not.toBeInTheDocument()
    expect(within(screen.getByTestId('train1-t1-2')).queryByRole('status')).not.toBeInTheDocument()
    expect(within(screen.getByTestId('train1-t1-2')).getByRole('radio', { name: 'صحيح' })).not.toBeChecked()
    await user.click(openStep('التدريب الثاني — حدّد نوع الفعل المعتلّ'))
    expect(screen.queryByTestId('trainings-solution')).not.toBeInTheDocument()
    expect(within(screen.getByTestId('train2-t2-7')).queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows the source summary table and a text-only lesson-8 teaser (no lesson 8 built)', async () => {
    const user = userEvent.setup()
    openLesson()

    await user.click(openStep('تاسعًا: خلاصة الدرس'))
    const table = screen.getByTestId('morph7-recap-table')
    expect(within(table).getAllByText('الصحيح')).toHaveLength(3)
    expect(within(table).getAllByText('المعتلّ')).toHaveLength(5)
    expect(within(table).getByText('لفيف مقرون')).toBeInTheDocument()
    expect(within(table).getByText('لفيف مفروق')).toBeInTheDocument()

    await user.click(openStep('الدرس الثامن'))
    expect(
      screen.getByText(/الدرس الثامن في قسم الصرف: تصريف الأفعال والإسناد إلى الضمائر/),
    ).toBeInTheDocument()
    expect(screen.getByText(/لم يُبنَ الدرس الثامن ولم يُسجَّل بعد/)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /الدرس الثامن/ })).not.toBeInTheDocument()
  })

  it('does not reveal answer correctness, page score, or solutions before final submission, and reveals them only after تسليم الاختبار كاملًا', async () => {
    const user = userEvent.setup()
    openLesson()

    await user.click(openStep('القسم الأول: المفاهيم والتصنيف'))
    expect(screen.getByTestId('test-page-morph7-concepts')).toBeInTheDocument()

    const q1 = screen.getByTestId('morph7-question-q01')
    const correctOption = 'النظر إلى حروفه الأصلية: هل فيها حرف علّة أم لا'
    await user.click(within(q1).getByRole('radio', { name: correctOption }))
    expect(within(q1).queryByText('إجابة صحيحة')).not.toBeInTheDocument()

    // «تحقّق من الإجابات» قبل التسليم يحفظ الصفحة صامتًا دون أي كشف.
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(screen.getByTestId('test-page-saved-morph7-concepts')).toHaveTextContent(
      'تم حفظ إجابات هذه الصفحة. لا تُكشف صحة الإجابات أو الحلول النموذجية إلا بعد تسليم الاختبار كاملًا.',
    )
    expect(screen.queryByTestId('test-page-summary-morph7-concepts')).not.toBeInTheDocument()
    expect(within(q1).queryByText('إجابة صحيحة')).not.toBeInTheDocument()
    expect(within(q1).queryByText('الإجابة الصحيحة:')).not.toBeInTheDocument()

    // التنقل بين الصفحات يحفظ الإجابة دون كشف.
    await user.click(openStep('القسم الثاني: أنواع الصحيح'))
    expect(screen.getByTestId('test-page-morph7-sahih')).toBeInTheDocument()
    await user.click(openStep('القسم الأول: المفاهيم والتصنيف'))
    const q1Return = screen.getByTestId('morph7-question-q01')
    expect(within(q1Return).getByRole('radio', { name: correctOption })).toBeChecked()
    expect(within(q1Return).queryByText('إجابة صحيحة')).not.toBeInTheDocument()

    // «حلول الاختبار» مقفلة قبل التسليم، حتى للصفحة المحقَّقة منها.
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('morphology7-solutions')).toHaveTextContent(
      'لا تُكشف الحلول النموذجية أو صحة الإجابات إلا بعد تسليم الاختبار كاملًا',
    )
    expect(screen.queryByTestId('solution-q01')).not.toBeInTheDocument()
    expect(screen.getByTestId('solutions-page-morph7-concepts')).toHaveTextContent('تحقّق من هذه الصفحة أولًا')
    expect(screen.getByTestId('solutions-page-morph7-analysis')).toHaveTextContent('تحقّق من هذه الصفحة أولًا')

    // صفحة التسليم قبل الضغط على الزر لا تُظهر النتيجة.
    await user.click(openStep('تسليم الاختبار والنتيجة'))
    expect(screen.getByTestId('morph7-submit')).not.toHaveTextContent('النتيجة:')

    // التسليم الكامل يكشف النتيجة النهائية ويفتح الحلول.
    await user.click(screen.getByTestId('morph7-submit-btn'))
    expect(screen.getByTestId('morph7-submit')).toHaveTextContent('النتيجة: ١ من ٢٠ إجابة صحيحة')

    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('solution-q01')).toHaveTextContent('الإجابة الصحيحة:')
    expect(screen.getByTestId('solution-q01')).toHaveTextContent(correctOption)

    // إعادة الاختبار تمسح الإجابات وتُقفل النتيجة والحلول من جديد.
    await user.click(openStep('تسليم الاختبار والنتيجة'))
    await user.click(screen.getByRole('button', { name: 'إعادة الاختبار' }))
    expect(screen.getByTestId('morph7-submit')).not.toHaveTextContent('النتيجة:')
    await user.click(openStep('حلول الاختبار'))
    expect(screen.queryByTestId('solution-q01')).not.toBeInTheDocument()
    await user.click(openStep('القسم الأول: المفاهيم والتصنيف'))
    expect(
      within(screen.getByTestId('morph7-question-q01')).getByRole('radio', { name: correctOption }),
    ).not.toBeChecked()
  })

  it('keeps the teacher key out of every student step and gates the Teacher Area behind the password', async () => {
    const user = userEvent.setup()
    openLesson()

    for (const stepName of ['تاسعًا: خلاصة الدرس', 'حلول الاختبار', 'التدريب الثاني — حدّد نوع الفعل المعتلّ']) {
      await user.click(openStep(stepName))
      expect(screen.queryByText(teacherKeyHeader)).not.toBeInTheDocument()
    }

    await user.click(openStep('منطقة خاصة بالمعلم'))
    expect(screen.getByLabelText('كلمة المرور')).toBeInTheDocument()
    expect(screen.queryByText(teacherKeyHeader)).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('كلمة المرور'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByText('كلمة المرور غير صحيحة.')).toBeInTheDocument()

    await user.clear(screen.getByLabelText('كلمة المرور'))
    await user.type(screen.getByLabelText('كلمة المرور'), COURSE_TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByText(teacherKeyHeader)).toBeInTheDocument()

    // اثنا عشر بابًا مطلوبًا، في أقسام قابلة للإغلاق.
    for (const heading of [
      '١. الأهداف التعليمية',
      '٢. خريطة محتوى الدرس (المصدر ← الخطوات)',
      '٣. شرح تفصيلي لكل قاعدة',
      '٤. جدول تصنيف جميع أمثلة المصدر',
      '٥. تحليل الحروف الأصلية لكل فعل أساسي',
      '٦. سبب كون كل فعل صحيحًا أو معتلًّا، وتفسير نوعه',
      '٧. الحل النموذجي للتدريب الأول (صحيح أم معتلّ؟) مع التعليل',
      '٨. الحل النموذجي للتدريب الثاني (حدّد نوع الفعل المعتلّ) مع التعليل',
      '٩. حلول الأنشطة التفاعلية السبعة',
      '١٠. إجابات الأسئلة العشرين في اختبار الدرس مع التفسير',
      '١١. أخطاء الطلاب الشائعة وطريقة تصحيحها',
      '١٢. الإحالات إلى مواضع المصدر وسجل التدقيق',
    ]) {
      expect(screen.getByText(heading)).toBeInTheDocument()
    }

    // الحلول التفصيلية للأسئلة العشرين، وتحليل كل أفعال المصدر.
    expect(screen.getAllByTestId(/^solution-q/)).toHaveLength(20)
    expect(screen.getAllByText(/أصوله \(ك ت ب\) خالية من حروف العلّة/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/docs\/source\/morphology-lesson-07\.md/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/docs\/morphology-lesson-07-audit\.md/).length).toBeGreaterThanOrEqual(1)
  })
})
