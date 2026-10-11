/**
 * اختبار التدفق التفاعلي للدرس الخامس من قسم الصرف (أوزان الفعل الثلاثي المزيد).
 *
 * يغطي:
 *  - ربط الدرس بقسم الصرف وفتحه من بطاقته؛
 *  - بطاقة الوزن والمقارنة الموثقة «سَلِمَ — أَسْلَمَ» والتوضيح التعليمي للزيادة؛
 *  - المختبرات التفاعلية الخمسة، مع حجب الحلول قبل محاولة الطالب وطلبها؛
 *  - التدريبات الأصلية الثلاثة (٨ + ٥ + ٦) مع «إعادة التدريب» و«إظهار الحل»؛
 *  - الاختبار النهائي (٢٠ سؤالًا في ٤ صفحات) مع حجب الصحة والدرجة والحلول أثناء الحل،
 *    وبوابتَي الحلول والنتيجة قبل التسليم الكامل وبعده؛
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

describe('Morphology Lesson 05 — Interactive Flow & Navigation', () => {
  it('links the lesson from the الصرف section and opens its first step', () => {
    window.location.hash = '#/sections/morphology'
    const section = render(<App />)
    expect(screen.getByRole('link', { name: 'أوزان الفعل الثلاثي المزيد' })).toHaveAttribute(
      'href',
      '#/lesson/morphology-lesson-05',
    )
    section.unmount()

    window.location.hash = '#/lesson/morphology-lesson-05'
    render(<App />)
    expect(
      screen.getByRole('heading', { name: 'الدرس الخامس: أوزان الفعل الثلاثي المزيد', level: 2 }),
    ).toBeInTheDocument()
    expect(screen.getByText(/٩ أوزان مشهورة/)).toBeInTheDocument()
  })

  it('presents the audited pair سَلِمَ — أَسْلَمَ and the extra-letter clarification on the weight card', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/lesson/morphology-lesson-05'
    render(<App />)

    await user.click(openStep('الوزن الأول أَفْعَلَ'))
    const table = screen.getByRole('table')
    expect(within(table).getByText('سَلِمَ')).toBeInTheDocument()
    expect(within(table).getByText('أَسْلَمَ')).toBeInTheDocument()
    expect(within(table).queryByText('سْلَمَ')).not.toBeInTheDocument()
    expect(screen.getByText(/همزة قطع/)).toBeInTheDocument()
    expect(screen.getByText(/مضبوطة بالفتح على السين/)).toBeInTheDocument()
  })

  it('hides the decompose lab analysis until the student checks, then shows the full analysis', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/lesson/morphology-lesson-05'
    render(<App />)

    await user.click(openStep('مختبر: فكّك الوزن وحروف الزيادة'))
    const item = screen.getByTestId('dec-1')
    expect(within(item).queryByRole('status')).not.toBeInTheDocument()

    await user.selectOptions(within(item).getByLabelText('حروف الزيادة في أَنْزَلَ'), 'الهمزة')
    await user.selectOptions(within(item).getByLabelText('وزن أَنْزَلَ'), 'أَفْعَلَ')
    await user.click(within(item).getByRole('button', { name: 'تحقق من التحليل' }))

    expect(within(item).getByRole('status')).toHaveTextContent('تحليل صحيح ودقيق')
    expect(within(item).getByRole('status')).toHaveTextContent('نَزَلَ')
  })

  it('keeps every lab solution hidden until requested, and covers all five labs', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/lesson/morphology-lesson-05'
    render(<App />)

    await user.click(openStep('مختبر: طابِق كل فعل بوزنه'))
    const matchItem = screen.getByTestId('match-1')
    expect(within(matchItem).queryByRole('status')).not.toBeInTheDocument()
    await user.selectOptions(within(matchItem).getByLabelText('وزن الفعل أَعْلَمَ'), 'أَفْعَلَ')
    await user.click(within(matchItem).getByRole('button', { name: 'تحقق من الإجابة' }))
    expect(within(matchItem).getByRole('status')).toHaveTextContent('إجابة صحيحة')

    await user.click(openStep('مختبر: ميّز بين الأوزان المتشابهة'))
    const distItem = screen.getByTestId('dist-1')
    expect(within(distItem).queryByRole('status')).not.toBeInTheDocument()
    await user.click(within(distItem).getByRole('radio', { name: /تَذَكَّرَ» تاء مع تضعيف الحرف الثاني/ }))
    await user.click(within(distItem).getByRole('button', { name: 'تحقق من الإجابة' }))
    expect(within(distItem).getByRole('status')).toHaveTextContent('إجابة صحيحة')

    await user.click(openStep('مختبر: صنّف الأفعال بحسب عدد الزيادات'))
    const clsItem = screen.getByTestId('cls-1')
    expect(within(clsItem).queryByRole('status')).not.toBeInTheDocument()
    await user.selectOptions(within(clsItem).getByLabelText('تصنيف عَلِمَ'), 'مجرّد ثلاثي')
    await user.click(within(clsItem).getByRole('button', { name: 'تحقق من التصنيف' }))
    expect(within(clsItem).getByRole('status')).toHaveTextContent('تصنيف صحيح')
  })

  it('keeps the order-lab solution hidden until requested via إظهار الحل', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/lesson/morphology-lesson-05'
    render(<App />)

    await user.click(openStep('مختبر: رتّب خطوات تحليل فعل مزيد'))
    expect(screen.queryByTestId('lab-order-solution')).not.toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('وصف الخطوة ١'), 'اكتب الفعل مضبوطًا')
    await user.selectOptions(screen.getByLabelText('وصف الخطوة ٢'), 'حدّد أصله الثلاثي')
    await user.selectOptions(screen.getByLabelText('وصف الخطوة ٣'), 'استخرج الحروف الأصلية والزائدة')
    await user.selectOptions(screen.getByLabelText('وصف الخطوة ٤'), 'حدّد الوزن الصرفي')
    await user.selectOptions(screen.getByLabelText('وصف الخطوة ٥'), 'افهم المعنى في السياق')
    await user.click(screen.getByRole('button', { name: 'تحقق من الترتيب' }))
    expect(screen.getByTestId('lab-order-feedback')).toHaveTextContent('ترتيب صحيح ودقيق')
    expect(screen.queryByTestId('lab-order-solution')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'إظهار الحل' }))
    expect(screen.getByTestId('lab-order-solution')).toHaveTextContent('اسْتَخْرَجَ = اسْتَفْعَلَ')
  })

  it('renders all 8 items of Training 1 with check and إعادة التدريب', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/lesson/morphology-lesson-05'
    render(<App />)

    await user.click(openStep('التدريب الأول — حدّد وزن الفعل'))
    const trainingOne = screen.getByTestId('morph5-training-one')
    for (let i = 1; i <= 8; i += 1) {
      expect(within(trainingOne).getByTestId(`train1-t1-${i}`)).toBeInTheDocument()
    }

    const first = within(trainingOne).getByTestId('train1-t1-1')
    const radio = within(first).getByRole('radio', { name: 'أَفْعَلَ' })
    await user.click(radio)
    expect(radio).toBeChecked()
    expect(within(first).queryByRole('status')).not.toBeInTheDocument()

    await user.click(within(first).getByRole('button', { name: 'تحقق من الإجابة' }))
    expect(within(first).getByRole('status')).toHaveTextContent('إجابة صحيحة')

    await user.click(screen.getByTestId('train1-retry'))
    expect(radio).not.toBeChecked()
    expect(within(first).queryByRole('status')).not.toBeInTheDocument()
  })

  it('keeps Training 2 solutions hidden until requested and supports إعادة التدريب', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/lesson/morphology-lesson-05'
    render(<App />)

    await user.click(openStep('التدريب الثاني — الحروف الأصلية والزائدة'))
    const trainingTwo = screen.getByTestId('morph5-training-two')
    for (let i = 1; i <= 5; i += 1) {
      expect(within(trainingTwo).getByTestId(`train2-t2-${i}`)).toBeInTheDocument()
    }

    const first = within(trainingTwo).getByTestId('train2-t2-1')
    expect(within(first).queryByTestId('train2-t2-1-solution')).not.toBeInTheDocument()
    await user.click(within(first).getByRole('button', { name: 'إظهار الحل' }))
    expect(within(first).getByTestId('train2-t2-1-solution')).toBeInTheDocument()
    await user.click(within(first).getByRole('button', { name: 'إخفاء الحل' }))
    expect(within(first).queryByTestId('train2-t2-1-solution')).not.toBeInTheDocument()

    await user.selectOptions(within(first).getByLabelText(/حروف الزيادة في/), 'الهمزة')
    await user.selectOptions(within(first).getByLabelText(/وزن/), 'أَفْعَلَ')
    await user.click(within(first).getByRole('button', { name: 'تحقق من الإجابة' }))
    expect(within(first).getByRole('status')).toHaveTextContent('إجابة صحيحة')

    await user.click(screen.getByTestId('train2-retry'))
    expect(within(first).queryByRole('status')).not.toBeInTheDocument()
  })

  it('reveals Training 3 full solution only through إظهار الحل الكامل', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/lesson/morphology-lesson-05'
    render(<App />)

    await user.click(openStep('التدريب الثالث — ميّز بين المجرّد'))
    const trainingThree = screen.getByTestId('morph5-training-three')
    for (let i = 1; i <= 6; i += 1) {
      expect(within(trainingThree).getByTestId(`train3-t3-${i}`)).toBeInTheDocument()
    }
    expect(screen.queryByTestId('train3-solution')).not.toBeInTheDocument()

    await user.click(screen.getByTestId('train3-reveal'))
    expect(screen.getByTestId('train3-solution')).toHaveTextContent('كَتَبَ: مجرّد ثلاثي')
    await user.click(screen.getByTestId('train3-retry'))
    expect(screen.queryByTestId('train3-solution')).not.toBeInTheDocument()
  })

  it('does not reveal answer correctness, page score, or solutions before final submission, and reveals them only after تسليم الاختبار كاملًا', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/lesson/morphology-lesson-05'
    render(<App />)

    await user.click(openStep('القسم الأول: المفاهيم والتقسيم'))
    expect(screen.getByTestId('test-page-morph5-concepts')).toBeInTheDocument()

    const q1 = screen.getByTestId('morph5-question-q01')
    await user.click(within(q1).getByRole('radio', { name: 'فعل له ثلاثة أحرف أصلية، زِيدَ عليها حرف أو حرفان أو ثلاثة أحرف' }))
    expect(within(q1).queryByText('إجابة صحيحة')).not.toBeInTheDocument()

    // «تحقّق من الإجابات» قبل التسليم يحفظ الصفحة صامتًا دون أي كشف.
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    expect(screen.getByTestId('test-page-saved-morph5-concepts')).toHaveTextContent(
      'تم حفظ إجابات هذه الصفحة. لا تُكشف صحة الإجابات أو الحلول النموذجية إلا بعد تسليم الاختبار كاملًا.',
    )
    expect(screen.queryByTestId('test-page-summary-morph5-concepts')).not.toBeInTheDocument()
    expect(within(q1).queryByText('إجابة صحيحة')).not.toBeInTheDocument()
    expect(within(q1).queryByText('الإجابة الصحيحة:')).not.toBeInTheDocument()

    // التنقل بين الصفحات يحفظ الإجابة دون كشف.
    await user.click(openStep('القسم الثاني: أوزان المزيد بحرف واحد'))
    expect(screen.getByTestId('test-page-morph5-one-letter')).toBeInTheDocument()
    await user.click(openStep('القسم الأول: المفاهيم والتقسيم'))
    expect(
      within(screen.getByTestId('morph5-question-q01')).getByRole('radio', {
        name: 'فعل له ثلاثة أحرف أصلية، زِيدَ عليها حرف أو حرفان أو ثلاثة أحرف',
      }),
    ).toBeChecked()
    expect(within(screen.getByTestId('morph5-question-q01')).queryByText('إجابة صحيحة')).not.toBeInTheDocument()

    // «حلول الاختبار» مقفلة قبل التسليم، حتى للصفحة المحقَّقة منها.
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('morphology5-solutions')).toHaveTextContent(
      'لا تُكشف الحلول النموذجية أو صحة الإجابات إلا بعد تسليم الاختبار كاملًا',
    )
    expect(screen.queryByTestId('solution-q01')).not.toBeInTheDocument()
    expect(screen.getByTestId('solutions-page-morph5-concepts')).toHaveTextContent('تحقّق من هذه الصفحة أولًا')
    expect(screen.getByTestId('solutions-page-morph5-analysis')).toHaveTextContent('تحقّق من هذه الصفحة أولًا')

    // صفحة التسليم قبل الضغط على الزر لا تُظهر النتيجة.
    await user.click(openStep('تسليم الاختبار والنتيجة'))
    expect(screen.getByTestId('morph5-submit')).not.toHaveTextContent('النتيجة:')

    // التسليم الكامل يكشف النتيجة النهائية ويفتح الحلول.
    await user.click(screen.getByTestId('morph5-submit-btn'))
    expect(screen.getByTestId('morph5-submit')).toHaveTextContent('النتيجة: ١ من ٢٠ إجابة صحيحة')

    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('solution-q01')).toHaveTextContent('الإجابة الصحيحة:')
    expect(screen.getByTestId('solution-q01')).toHaveTextContent(
      'فعل له ثلاثة أحرف أصلية، زِيدَ عليها حرف أو حرفان أو ثلاثة أحرف',
    )
  })

  it('gates the Teacher Area behind the password and displays keys, training solutions, and audit notes', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/lesson/morphology-lesson-05'
    render(<App />)

    await user.click(openStep('منطقة خاصة بالمعلم'))
    expect(screen.getByLabelText('كلمة المرور')).toBeInTheDocument()
    expect(screen.queryByText(teacherKeyHeader)).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('كلمة المرور'), COURSE_TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByText(teacherKeyHeader)).toBeInTheDocument()
    for (const heading of [
      'أ. الحلول التفصيلية لاختبار الدرس (٢٠ سؤالًا)',
      'ب. حل التدريب الأول: حدّد وزن الفعل (٨ أسئلة)',
      'ج. حل التدريب الثاني: استخرج الحروف الأصلية والزائدة (٥ عناصر)',
      'د. حل التدريب الثالث: ميّز بين المجرّد والمزيد (٦ عناصر)',
      'هـ. حلول المختبرات التفاعلية الخمسة',
      'و. سجل التدقيق العلمي وحسم التصحيحات',
      'ز. أخطاء متوقعة عند الطلاب وكيفية معالجتها',
    ]) {
      expect(screen.getByRole('heading', { name: heading, level: 3 })).toBeInTheDocument()
    }
  })
})
