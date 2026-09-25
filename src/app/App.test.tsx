import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { App } from './App'

function goToLesson(id = 'lesson-1') {
  window.location.hash = `#/lesson/${id}`
}

beforeEach(() => {
  window.location.hash = ''
})

afterEach(() => {
  window.location.hash = ''
})

describe('Course index (homepage / lesson hub)', () => {
  it('shows a lesson index with lesson titles, not full lesson content', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'دورة أساسيات اللغة العربية' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'الاسم والفعل والحرف', level: 3 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'المبتدأ والخبر', level: 3 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'الفعل والفاعل والمفعول به', level: 3 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'الفعل الماضي، والفعل المضارع، وفعل الأمر', level: 3 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'الضمائر المنفصلة والمتصلة', level: 3 })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /ابدأ الدرس/ })).toHaveLength(5)
    expect(screen.getByText('المهندس سومر شاهين: 0930215022')).toBeInTheDocument()

    // The index must not embed the full lesson content.
    expect(screen.queryByTestId('official-test')).not.toBeInTheDocument()
    expect(screen.queryByText('لعبة المحقق اللغوي')).not.toBeInTheDocument()
  })
})

describe('Lesson 1 as a sequential, one-step-at-a-time flow', () => {
  it('starts on step 1 of 19 and shows only the current step content', () => {
    goToLesson()
    render(<App />)

    expect(screen.getByRole('heading', { name: 'مقدمة / ابدأ رحلتك', level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 1 من 19')

    // Later-step content must not be present until the student navigates there.
    expect(screen.queryByTestId('official-test')).not.toBeInTheDocument()
    expect(screen.queryByText('لعبة المحقق اللغوي')).not.toBeInTheDocument()

    // Previous is disabled on the first step.
    expect(screen.getByRole('button', { name: /السابق/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /التالي/ })).toBeEnabled()
  })

  it('moves forward and backward through steps with السابق / التالي and tracks progress', async () => {
    goToLesson()
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 1 من 19')

    await user.click(screen.getByRole('button', { name: /التالي/ }))
    expect(screen.getByRole('heading', { name: 'الهدف من الدرس', level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 2 من 19')
    expect(screen.getByRole('button', { name: /السابق/ })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: /السابق/ }))
    expect(screen.getByRole('heading', { name: 'مقدمة / ابدأ رحلتك', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /السابق/ })).toBeDisabled()
  })

  it('has no scroll-anchor section navigation and no continuous long document', () => {
    goToLesson()
    render(<App />)

    expect(screen.queryByRole('navigation', { name: 'أقسام الدرس' })).not.toBeInTheDocument()
    expect(document.querySelector('.section-nav')).toBeNull()
    // Only one step's heading is rendered at a time.
    expect(screen.queryByRole('heading', { name: 'اختبار نهاية الدرس' })).not.toBeInTheDocument()
  })

  it('shows the plain-text instructor credit without contact presentation', () => {
    goToLesson()
    render(<App />)

    expect(screen.getAllByText('المهندس سومر شاهين: 0930215022')).toHaveLength(1)
    expect(screen.queryByText('تواصل عبر واتساب')).not.toBeInTheDocument()
    expect(
      screen.queryByText('للاستفسار أو متابعة الدرس، تواصل عبر الرقم التالي.'),
    ).not.toBeInTheDocument()
    expect(document.querySelector('.whatsapp-card')).toBeNull()
    expect(document.querySelector('a[href*="0930215022"], button[data-contact]')).toBeNull()
  })

  it('supports source-based interactive activities on their own steps', async () => {
    goToLesson()
    const user = userEvent.setup()
    render(<App />)

    // Step 6: noun signs.
    for (let step = 0; step < 5; step += 1) {
      await user.click(screen.getByRole('button', { name: /التالي/ }))
    }
    expect(screen.getByRole('heading', { name: 'علامات الاسم', level: 2 })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /دخول \(الـ\) التعريف/ }))
    expect(screen.getByText('كتاب ← الكتاب.')).toBeInTheDocument()

    // Step 9: الفعل المضارع (أحرف المضارعة activity).
    await user.click(screen.getByRole('button', { name: /التالي/ }))
    await user.click(screen.getByRole('button', { name: /التالي/ }))
    await user.click(screen.getByRole('button', { name: /التالي/ }))
    expect(screen.getByRole('heading', { name: 'الفعل المضارع', level: 2 })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^أ$/ }))
    expect(document.querySelector('.ayn-result')).toHaveTextContent('أكتب')
  })

  it('exposes exactly 20 official questions once the student reaches the test step', async () => {
    goToLesson()
    const user = userEvent.setup()
    render(<App />)

    for (let step = 0; step < 16; step += 1) {
      await user.click(screen.getByRole('button', { name: /التالي/ }))
    }
    expect(screen.getByRole('heading', { name: 'اختبار نهاية الدرس', level: 2 })).toBeInTheDocument()
    const officialTest = screen.getByTestId('official-test')
    expect(officialTest.querySelectorAll('.official-question')).toHaveLength(20)
    expect(within(officialTest).getByText(/أجب عن الأسئلة العشرين كلها/)).toBeInTheDocument()
  })

  it('does not reveal correctness on selection, only after CHECK, and preserves answers when navigating away and back', async () => {
    goToLesson()
    const user = userEvent.setup()
    render(<App />)

    for (let step = 0; step < 16; step += 1) {
      await user.click(screen.getByRole('button', { name: /التالي/ }))
    }
    const officialTest = screen.getByTestId('official-test')
    const firstQuestion = officialTest.querySelector('.official-question')
    expect(firstQuestion).not.toBeNull()

    // Selecting an option must not reveal correctness by itself.
    const options = within(firstQuestion as HTMLElement).getAllByRole('radio')
    await user.click(options[1])
    expect(within(firstQuestion as HTMLElement).queryByText('إجابة صحيحة.')).not.toBeInTheDocument()
    expect(options[1]).toBeChecked()

    // Navigate away (Previous) and back (Next): the selection must be preserved.
    await user.click(screen.getByRole('button', { name: /السابق/ }))
    expect(screen.getByRole('heading', { name: 'المراجعة: ملخص الدرس للحفظ', level: 2 })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /التالي/ }))
    const testAgain = screen.getByTestId('official-test')
    const firstQuestionAgain = testAgain.querySelector('.official-question')
    const optionsAgain = within(firstQuestionAgain as HTMLElement).getAllByRole('radio')
    expect(optionsAgain[1]).toBeChecked()
  })

  it('keeps complete teacher material behind the teacher gate on its own step', async () => {
    goToLesson()
    const user = userEvent.setup()
    render(<App />)

    for (let step = 0; step < 17; step += 1) {
      await user.click(screen.getByRole('button', { name: /التالي/ }))
    }
    expect(screen.getByRole('heading', { name: 'منطقة المعلم', level: 2 })).toBeInTheDocument()
    expect(screen.queryByText('الإجابات النموذجية')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^دخول$/ }))
    expect(screen.getByText('كلمة المرور غير صحيحة.')).toBeInTheDocument()

    await user.type(screen.getByLabelText('كلمة المرور'), 'معلم')
    await user.click(screen.getByRole('button', { name: 'دخول' }))

    expect(screen.getByText('الإجابات النموذجية')).toBeInTheDocument()
    expect(screen.getByText('تصحيح السؤال 8')).toBeInTheDocument()
    expect(screen.getByText('تصحيح السؤال 10')).toBeInTheDocument()
    expect(screen.getByText('الأخطاء المتوقعة عند الطالب')).toBeInTheDocument()
    expect(screen.getByText('معيار إتقان الدرس')).toBeInTheDocument()
  })

  it('shows إتمام الدرس on the final step', async () => {
    goToLesson()
    const user = userEvent.setup()
    render(<App />)

    for (let step = 0; step < 18; step += 1) {
      await user.click(screen.getByRole('button', { name: /التالي|إتمام الدرس/ }))
    }
    expect(screen.getByRole('heading', { name: 'الخلاصة', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'إتمام الدرس' })).toBeInTheDocument()
  })
})

describe('Lesson 2 as a sequential, one-step-at-a-time flow', () => {
  it('starts on step 1 of 27 and shows only the current step content', () => {
    goToLesson('lesson-2')
    render(<App />)

    expect(screen.getByRole('heading', { name: 'مدخل الدرس: الجملة الاسمية', level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 1 من 27')
    expect(screen.queryByTestId('lesson2-official-test')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'خامسًا: منطقة خاصة بالمعلم', level: 2 })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /السابق/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /التالي/ })).toBeEnabled()
  })

  it('moves forward and backward through Lesson 2 steps with السابق / التالي', async () => {
    goToLesson('lesson-2')
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /التالي/ }))
    expect(screen.getByRole('heading', { name: 'أهداف الدرس', level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 2 من 27')

    await user.click(screen.getByRole('button', { name: /السابق/ }))
    expect(screen.getByRole('heading', { name: 'مدخل الدرس: الجملة الاسمية', level: 2 })).toBeInTheDocument()
  })

  it('exposes all 20 Lesson 2 final-test questions on the final-test step', async () => {
    goToLesson('lesson-2')
    const user = userEvent.setup()
    render(<App />)

    for (let step = 0; step < 24; step += 1) {
      await user.click(screen.getByRole('button', { name: /التالي/ }))
    }
    expect(screen.getByRole('heading', { name: 'رابعًا: اختبار نهاية الدرس', level: 2 })).toBeInTheDocument()
    const officialTest = screen.getByTestId('lesson2-official-test')
    expect(officialTest.querySelectorAll('.official-question')).toHaveLength(20)
    expect(within(officialTest).getByText(/سؤال تفكير/)).toBeInTheDocument()
    expect(within(officialTest).getByText(/أجب عن الأسئلة العشرين كلها/)).toBeInTheDocument()
  })

  it('keeps Lesson 2 teacher/reference material behind the teacher gate', async () => {
    goToLesson('lesson-2')
    const user = userEvent.setup()
    render(<App />)

    for (let step = 0; step < 25; step += 1) {
      await user.click(screen.getByRole('button', { name: /التالي/ }))
    }
    expect(screen.getByRole('heading', { name: 'خامسًا: منطقة خاصة بالمعلم', level: 2 })).toBeInTheDocument()
    expect(screen.queryByText('الإجابات النموذجية للنشاط التطبيقي')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('كلمة المرور'), 'معلم')
    await user.click(screen.getByRole('button', { name: 'دخول' }))

    expect(screen.getByText('الإجابات النموذجية للنشاط التطبيقي')).toBeInTheDocument()
    expect(screen.getByText('الإجابات النموذجية لاختبار نهاية الدرس')).toBeInTheDocument()
    expect(screen.getByText('ملاحظات التصحيح للمعلم')).toBeInTheDocument()
    expect(screen.getByText('معيار إتقان الدرس')).toBeInTheDocument()
    expect(screen.getByText('ثم إعادة اختبار قصير من 10 أسئلة قبل الانتقال إلى الدرس الثالث.')).toBeInTheDocument()
  })

  it('ends with the Lesson 2 summary and the source ending formulas', async () => {
    goToLesson('lesson-2')
    const user = userEvent.setup()
    render(<App />)

    for (let step = 0; step < 26; step += 1) {
      await user.click(screen.getByRole('button', { name: /التالي|إتمام الدرس/ }))
    }
    expect(screen.getByRole('heading', { name: 'ملخص الدرس للحفظ', level: 2 })).toBeInTheDocument()
    expect(screen.getByText('اسم في البداية')).toBeInTheDocument()
    expect(screen.getByText('فعل في البداية')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'إتمام الدرس' })).toBeInTheDocument()
  })
})

describe('Lesson 3 as a sequential, one-step-at-a-time flow', () => {
  it('starts on step 1 of 30 and shows only the current step content', () => {
    goToLesson('lesson-3')
    render(<App />)

    expect(screen.getByRole('heading', { name: 'مدخل الدرس: الجملة الفعلية', level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 1 من 30')
    expect(screen.queryByTestId('lesson3-official-test')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'خامسًا: منطقة خاصة بالمعلم', level: 2 })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /السابق/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /التالي/ })).toBeEnabled()
  })

  it('moves forward and backward through Lesson 3 steps with السابق / التالي', async () => {
    goToLesson('lesson-3')
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /التالي/ }))
    expect(screen.getByRole('heading', { name: 'أهداف الدرس', level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 2 من 30')

    await user.click(screen.getByRole('button', { name: /السابق/ }))
    expect(screen.getByRole('heading', { name: 'مدخل الدرس: الجملة الفعلية', level: 2 })).toBeInTheDocument()
  })

  it('teaches the player/ball role-discovery moment through guided reveals', async () => {
    goToLesson('lesson-3')
    const user = userEvent.setup()
    render(<App />)

    for (let step = 0; step < 12; step += 1) {
      await user.click(screen.getByRole('button', { name: /التالي/ }))
    }
    expect(screen.getByRole('heading', { name: 'المثال المهم: اللاعب والكرة', level: 2 })).toBeInTheDocument()
    expect(screen.getByText('ضربَ اللاعبُ الكرةَ.')).toBeInTheDocument()
    expect(screen.getByText('ضربتِ الكرةُ اللاعبَ.')).toBeInTheDocument()

    // The answers are hidden until the student reveals them, question by question.
    expect(screen.queryByText('→ اللاعبُ = فاعل.')).not.toBeInTheDocument()
    const revealButtons = screen.getAllByRole('button', { name: 'اكشف الإجابة' })
    await user.click(revealButtons[0])
    expect(screen.getByText('→ اللاعبُ = فاعل.')).toBeInTheDocument()
  })

  it('exposes all 20 Lesson 3 final-test questions on the final-test step', async () => {
    goToLesson('lesson-3')
    const user = userEvent.setup()
    render(<App />)

    for (let step = 0; step < 27; step += 1) {
      await user.click(screen.getByRole('button', { name: /التالي/ }))
    }
    expect(screen.getByRole('heading', { name: 'رابعًا: اختبار نهاية الدرس', level: 2 })).toBeInTheDocument()
    const officialTest = screen.getByTestId('lesson3-official-test')
    expect(officialTest.querySelectorAll('.official-question')).toHaveLength(20)
    expect(within(officialTest).getByRole('heading', { name: 'خامسًا: سؤال تفكير', level: 3 })).toBeInTheDocument()
    expect(within(officialTest).getByText(/أجب عن الأسئلة العشرين كلها/)).toBeInTheDocument()
  })

  it('keeps Lesson 3 teacher/reference material behind the teacher gate', async () => {
    goToLesson('lesson-3')
    const user = userEvent.setup()
    render(<App />)

    for (let step = 0; step < 28; step += 1) {
      await user.click(screen.getByRole('button', { name: /التالي/ }))
    }
    expect(screen.getByRole('heading', { name: 'خامسًا: منطقة خاصة بالمعلم', level: 2 })).toBeInTheDocument()
    expect(screen.queryByText('الإجابات النموذجية للنشاط التطبيقي')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('كلمة المرور'), 'معلم')
    await user.click(screen.getByRole('button', { name: 'دخول' }))

    expect(screen.getByText('الإجابات النموذجية للنشاط التطبيقي')).toBeInTheDocument()
    expect(screen.getByText('الإجابات النموذجية لاختبار نهاية الدرس')).toBeInTheDocument()
    expect(screen.getByText('ملاحظات التصحيح للمعلم')).toBeInTheDocument()
    expect(screen.getByText('تدريب علاجي سريع للطالب الضعيف')).toBeInTheDocument()
    expect(screen.getByText('معيار إتقان الدرس')).toBeInTheDocument()
  })

  it('ends with the Lesson 3 summary and the golden rule', async () => {
    goToLesson('lesson-3')
    const user = userEvent.setup()
    render(<App />)

    for (let step = 0; step < 29; step += 1) {
      await user.click(screen.getByRole('button', { name: /التالي|إتمام الدرس/ }))
    }
    expect(screen.getByRole('heading', { name: 'ملخص الدرس للحفظ', level: 2 })).toBeInTheDocument()
    expect(screen.getByText('قاعدة ذهبية:')).toBeInTheDocument()
    expect(
      screen.getByText(
        /ابحث عن الفعل أولًا، ثم اسأل: من قام بالفعل؟ فهذا هو الفاعل\. ثم اسأل: ماذا فعل؟/,
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'إتمام الدرس' })).toBeInTheDocument()
  })
})

describe('Lesson Outline roadmap navigation across Lessons 1–3', () => {
  it('navigates directly to any step when clicked in the sidebar outline and keeps flow synchronized', async () => {
    goToLesson('lesson-1')
    const user = userEvent.setup()
    render(<App />)

    // Initially on step 1
    expect(screen.getByRole('heading', { name: 'مقدمة / ابدأ رحلتك', level: 2 })).toBeInTheDocument()

    // Jump directly to علامات الاسم (step 6) via outline
    const nounSignsButton = screen.getByRole('button', { name: /الخطوة 6: علامات الاسم/ })
    await user.click(nounSignsButton)

    // Active heading should now be علامات الاسم
    expect(screen.getByRole('heading', { name: 'علامات الاسم', level: 2 })).toBeInTheDocument()
    expect(nounSignsButton).toHaveAttribute('aria-current', 'step')
    expect(nounSignsButton).toHaveClass('is-active')
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 6 من 19')

    // Pressing التالي moves to step 7 (القسم الثاني: الفعل) and updates outline highlight
    await user.click(screen.getByRole('button', { name: /التالي/ }))
    expect(screen.getByRole('heading', { name: 'القسم الثاني: الفعل', level: 2 })).toBeInTheDocument()
    const verbButton = screen.getByRole('button', { name: /الخطوة 7: القسم الثاني: الفعل/ })
    expect(verbButton).toHaveAttribute('aria-current', 'step')
  })

  it('supports direct outline navigation in Lesson 2 with full synchronization', async () => {
    goToLesson('lesson-2')
    const user = userEvent.setup()
    render(<App />)

    // Jump directly to activity four (step 24)
    const activity4Button = screen.getByRole('button', { name: /الخطوة 24: النشاط الرابع: كوّن جملة اسمية/ })
    await user.click(activity4Button)

    expect(screen.getByRole('heading', { name: 'النشاط الرابع: كوّن جملة اسمية', level: 2 })).toBeInTheDocument()
    expect(activity4Button).toHaveAttribute('aria-current', 'step')

    // Previous moves back to step 23
    await user.click(screen.getByRole('button', { name: /السابق/ }))
    expect(screen.getByRole('heading', { name: 'النشاط الثالث: أكمل الجملة', level: 2 })).toBeInTheDocument()
  })

  it('supports mobile drawer toggle, step selection, and dismissal in Lesson 3', async () => {
    goToLesson('lesson-3')
    const user = userEvent.setup()
    render(<App />)

    // Open mobile drawer
    const mobileTrigger = screen.getByRole('button', { name: 'عرض فهرس خطوات الدرس' })
    await user.click(mobileTrigger)

    // Drawer dialog is open
    const drawer = screen.getByRole('dialog', { name: 'محتويات الدرس' })
    expect(drawer).toBeInTheDocument()

    // Pick step in drawer: المثال المهم: اللاعب والكرة (step 13)
    const playerBallButton = within(drawer).getByRole('button', {
      name: /الخطوة 13: المثال المهم: اللاعب والكرة/,
    })
    await user.click(playerBallButton)

    // Drawer closes and main content shows step 13
    expect(screen.queryByRole('dialog', { name: 'محتويات الدرس' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'المثال المهم: اللاعب والكرة', level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 13 من 30')
  })
})

describe('Lesson 4 as a sequential, one-step-at-a-time flow', () => {
  it('registers the lesson and renders its full official test on its own step', async () => {
    goToLesson('lesson-4')
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByRole('heading', { name: 'مدخل الدرس: أزمنة الفعل', level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 1 من 39')

    for (let step = 0; step < 36; step += 1) {
      await user.click(screen.getByRole('button', { name: /التالي/ }))
    }

    expect(screen.getByRole('heading', { name: 'اختبار نهاية الدرس', level: 2 })).toBeInTheDocument()
    const officialTest = screen.getByTestId('lesson4-official-test')
    expect(officialTest.querySelectorAll('.official-question')).toHaveLength(20)
    expect(within(officialTest).getByText('أجب عن الأسئلة العشرين كلها. بعد التحقق تظهر التغذية الراجعة، والأسئلة المفتوحة تراجع معلمك.')).toBeInTheDocument()
  })

  it('keeps the teacher material gated and exposes the five activity steps in the outline', async () => {
    goToLesson('lesson-4')
    const user = userEvent.setup()
    render(<App />)

    const outline = screen.getByRole('navigation', { name: 'فهرس خطوات الدرس' })
    expect(within(outline).getByRole('button', { name: /تصنيف الأفعال/ })).toBeInTheDocument()
    expect(within(outline).getByRole('button', { name: /تحديد زمن الفعل/ })).toBeInTheDocument()
    expect(within(outline).getByRole('button', { name: /اختيار الفعل المناسب/ })).toBeInTheDocument()
    expect(within(outline).getByRole('button', { name: /التحويل/ })).toBeInTheDocument()
    expect(within(outline).getByRole('button', { name: /المحقق اللغوي/ })).toBeInTheDocument()

    for (let step = 0; step < 37; step += 1) {
      await user.click(screen.getByRole('button', { name: /التالي/ }))
    }
    expect(screen.getByRole('heading', { name: 'منطقة المعلم', level: 2 })).toBeInTheDocument()
    expect(screen.queryByText('الإجابات النموذجية لاختبار نهاية الدرس')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('كلمة المرور'), 'معلم')
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByText('الإجابات النموذجية لاختبار نهاية الدرس')).toBeInTheDocument()
    expect(screen.getByText(/15\/20 فأكثر/)).toBeInTheDocument()
  })
})
