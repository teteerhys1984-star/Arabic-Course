import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { App } from './App'

/** The one official contact element: exact spec, not a mirror of the implementation. */
const CONTACT_HREF = 'https://wa.me/963930215022'
const CONTACT_LABEL = 'التواصل عبر واتساب مع المهندس سومر شاهين على الرقم 0930215022'

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
    expect(
      screen.getByRole('heading', {
        name: 'المثنى وجمع المذكر السالم وجمع المؤنث السالم',
        level: 3,
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'الأسماء الخمسة', level: 3 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'كان وأخواتها', level: 3 })).toBeInTheDocument()
    // Every lesson card is one real link to its unchanged hash route, in registry order.
    const lessonLinks = within(screen.getByRole('list')).getAllByRole('link')
    expect(lessonLinks.map((link) => link.getAttribute('href'))).toEqual([
      '#/lesson/lesson-1',
      '#/lesson/lesson-2',
      '#/lesson/lesson-3',
      '#/lesson/lesson-4',
      '#/lesson/lesson-5',
      '#/lesson/lesson-6',
      '#/lesson/lesson-7',
      '#/lesson/lesson-8',
      '#/lesson/lesson-9',
      '#/lesson/lesson-10',
    ])
    expect(screen.getByRole('link', { name: 'الاسم والفعل والحرف' })).toHaveAttribute('href', '#/lesson/lesson-1')
    expect(screen.getByRole('link', { name: 'كان وأخواتها' })).toHaveAttribute('href', '#/lesson/lesson-9')
    expect(screen.getByRole('link', { name: 'إنَّ وأخواتها' })).toHaveAttribute('href', '#/lesson/lesson-10')
    expect(screen.getByRole('heading', { name: 'إنَّ وأخواتها', level: 3 })).toBeInTheDocument()
    expect(screen.getAllByText(/ابدأ الدرس/)).toHaveLength(10)

    // The official contact element lives once, in the shell header.
    const contact = screen.getByRole('link', { name: CONTACT_LABEL })
    expect(contact).toHaveAttribute('href', CONTACT_HREF)
    expect(contact).toHaveTextContent('المهندس سومر شاهين: 0930215022')

    // The index must not embed the full lesson content.
    expect(screen.queryByTestId('official-test')).not.toBeInTheDocument()
    expect(screen.queryByText('لعبة المحقق اللغوي')).not.toBeInTheDocument()
  })
})

describe('Official contact element (shell header)', () => {
  it('is one real, keyboard-reachable WhatsApp link for the instructor', () => {
    render(<App />)

    const contact = screen.getByRole('link', { name: CONTACT_LABEL })
    expect(contact.tagName).toBe('A')
    expect(contact).toHaveAttribute('href', CONTACT_HREF)
    expect(contact).toHaveAttribute('target', '_blank')
    expect(contact).toHaveAttribute('rel', 'noopener noreferrer')
    expect(contact).toHaveTextContent('المهندس سومر شاهين: 0930215022')

    // Keyboard navigation reaches it and focus is visible (focus-visible styling is
    // declared in src/styles/contact.css on top of the project-wide outline).
    contact.focus()
    expect(contact).toHaveFocus()
  })

  it('isolates the displayed number so RTL cannot reorder its digits', () => {
    render(<App />)

    const number = document.querySelector('.instructor-contact__number')
    expect(number).not.toBeNull()
    expect(number?.tagName).toBe('BDI')
    expect(number).toHaveAttribute('dir', 'ltr')
    expect(number).toHaveTextContent('0930215022')
  })

  it('keeps the WhatsApp mark decorative so it is never announced twice', () => {
    render(<App />)

    const contact = screen.getByRole('link', { name: CONTACT_LABEL })
    expect(contact.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(contact).toHaveAccessibleName(CONTACT_LABEL)
  })

  it('exists exactly once on the index and once in a lesson shell, never inside a step', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    expect(screen.getAllByRole('link', { name: CONTACT_LABEL })).toHaveLength(1)
    unmount()

    goToLesson()
    render(<App />)
    expect(screen.getAllByRole('link', { name: CONTACT_LABEL })).toHaveLength(1)

    // Walking through the lesson steps never adds a second contact element.
    await user.click(screen.getByRole('button', { name: /التالي/ }))
    await user.click(screen.getByRole('button', { name: /التالي/ }))
    expect(screen.getAllByRole('link', { name: CONTACT_LABEL })).toHaveLength(1)
    expect(document.querySelectorAll('.instructor-contact')).toHaveLength(1)
  })
})

describe('Lesson cards navigation', () => {
  it('opens the same lesson route when a lesson card is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('link', { name: 'المبتدأ والخبر' }))
    expect(window.location.hash).toBe('#/lesson/lesson-2')
  })

  it('opens the eighth lesson from its card on the index', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('link', { name: 'الأسماء الخمسة' }))
    expect(window.location.hash).toBe('#/lesson/lesson-8')
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

  it('shows the single official contact element and no contact block in lesson content', () => {
    goToLesson()
    render(<App />)

    // Exactly one contact element on the page: the shared one in the lesson shell.
    const contacts = screen.getAllByRole('link', { name: CONTACT_LABEL })
    expect(contacts).toHaveLength(1)
    expect(document.querySelectorAll('.instructor-contact')).toHaveLength(1)
    expect(contacts[0]).toHaveAttribute('href', CONTACT_HREF)
    expect(contacts[0]).toHaveTextContent('المهندس سومر شاهين: 0930215022')

    // Lesson content itself still carries no contact block and no raw contact data.
    expect(screen.queryByText('تواصل عبر واتساب')).not.toBeInTheDocument()
    expect(
      screen.queryByText('للاستفسار أو متابعة الدرس، تواصل عبر الرقم التالي.'),
    ).not.toBeInTheDocument()
    expect(document.querySelector('.whatsapp-card')).toBeNull()
    expect(document.querySelector('button[data-contact]')).toBeNull()
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

describe('Lesson 7 as a sequential, one-step-at-a-time flow', () => {
  const lessonSevenTitle = 'الدرس السابع: المثنى وجمع المذكر السالم وجمع المؤنث السالم'

  function openStep(name: string) {
    return screen.getByRole('button', { name: new RegExp(`الخطوة \\d+: ${name}`) })
  }

  it('starts on step 1 of 59 and shows only the current step content', () => {
    goToLesson('lesson-7')
    render(<App />)

    expect(screen.getByRole('heading', { name: lessonSevenTitle, level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 1 من 59')
    expect(screen.queryByTestId('lesson7-official-test')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'خامسًا: منطقة خاصة بالمعلم', level: 2 })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /السابق/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /التالي/ })).toBeEnabled()
  })

  it('moves forward and backward with السابق / التالي and reaches the source sections', async () => {
    goToLesson('lesson-7')
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /التالي/ }))
    expect(screen.getByRole('heading', { name: 'أهداف الدرس', level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 2 من 59')

    await user.click(openStep('9. جدول المثنى'))
    expect(screen.getByRole('heading', { name: '9. جدول المثنى', level: 2 })).toBeInTheDocument()
    expect(screen.getAllByText('طالبانِ').length).toBeGreaterThan(0)

    await user.click(openStep('31. جدول الحفظ الأساسي'))
    expect(screen.getByRole('heading', { name: '31. جدول الحفظ الأساسي', level: 2 })).toBeInTheDocument()
    expect(screen.getByText('هذا الجدول من أهم جداول الكورس.')).toBeInTheDocument()
    expect(screen.getByRole('row', { name: /جمع المؤنث السالم/ })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /السابق/ }))
    expect(screen.getByRole('heading', { name: '30. مقارنة الأنواع الثلاثة', level: 2 })).toBeInTheDocument()
  })

  it('exposes the five source activities with exactly 10 + 8 + 9 + 5 + 5 prompts', async () => {
    goToLesson('lesson-7')
    const user = userEvent.setup()
    render(<App />)

    const activityOne = openStep('النشاط الأول: حدد النوع')
    await user.click(activityOne)
    const groupOne = screen.getByTestId('lesson7-activity-one')
    expect(groupOne.querySelectorAll('.lesson-seven-activity-row')).toHaveLength(10)

    await user.click(openStep('النشاط الثاني: حدد نوع الجمع'))
    expect(screen.getByTestId('lesson7-activity-two').querySelectorAll('.lesson-seven-activity-row')).toHaveLength(8)

    await user.click(openStep('النشاط الثالث: حدد الحالة والعلامة'))
    const groupThree = screen.getByTestId('lesson7-activity-three')
    expect(groupThree.querySelectorAll('.lesson-seven-activity-row')).toHaveLength(9)
    expect(within(groupThree).getAllByRole('combobox')).toHaveLength(18)

    await user.click(openStep('النشاط الرابع: حوّل إلى المثنى'))
    expect(screen.getByTestId('lesson7-activity-four').querySelectorAll('.lesson-seven-activity-row')).toHaveLength(5)

    await user.click(openStep('النشاط الخامس: حوّل إلى الجمع المناسب'))
    expect(screen.getByTestId('lesson7-activity-five').querySelectorAll('.lesson-seven-activity-row')).toHaveLength(5)
  })

  it('checks activity one interactively and reports the score only after checking', async () => {
    goToLesson('lesson-7')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('النشاط الأول: حدد النوع'))
    const activity = screen.getByTestId('lesson7-activity-one')
    const answers = ['مفرد', 'مثنى', 'جمع', 'جمع', 'مفرد', 'مثنى', 'جمع', 'جمع', 'جمع', 'مفرد']

    const rowGroups = activity.querySelectorAll('.lesson-seven-choice-group')
    expect(rowGroups).toHaveLength(10)
    rowGroups.forEach((row, index) => {
      const option = within(row as HTMLElement).getByRole('button', { name: answers[index] })
      option.click()
    })

    expect(within(activity).queryByText(/النتيجة:/)).not.toBeInTheDocument()
    await user.click(within(activity).getByRole('button', { name: 'تحقق من النشاط' }))

    expect(within(activity).getByText(/10 \/ 10/)).toBeInTheDocument()
    expect(within(activity).queryByText(/الإجابة الصحيحة:/)).not.toBeInTheDocument()
  })

  it('keeps the 25-question official test unrevealed until submission and clears the draft on restart', async () => {
    goToLesson('lesson-7')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('رابعًا: اختبار نهاية الدرس'))
    const officialTest = screen.getByTestId('lesson7-official-test')
    expect(officialTest.querySelectorAll('.official-question')).toHaveLength(25)
    expect(screen.getByRole('heading', { name: 'السؤال السابع: تحدٍّ إضافي', level: 3 })).toBeInTheDocument()
    expect(within(officialTest).getByText('٢٥ سؤالًا')).toBeInTheDocument()
    expect(within(officialTest).getByText(/مسلمان – مسلمين – معلمان – معلمين – معلمون – معلمات/)).toBeInTheDocument()

    // Answering reveals nothing by itself.
    const firstQuestion = officialTest.querySelector('.official-question') as HTMLElement
    const firstOption = within(firstQuestion).getAllByRole('radio')[1]
    await user.click(firstOption)
    expect(within(officialTest).queryByText(/الإجابة النموذجية/)).not.toBeInTheDocument()
    expect(within(officialTest).queryByText(/النتيجة الموضوعية/)).not.toBeInTheDocument()
    expect(firstOption).toBeChecked()

    await user.click(within(officialTest).getByRole('button', { name: 'تسليم الاختبار' }))
    expect(within(officialTest).getByText(/النتيجة الموضوعية/)).toHaveTextContent('1 / 15')
    expect(within(officialTest).getAllByText(/الإجابة النموذجية/).length).toBeGreaterThan(0)

    // Restart clears the draft.
    await user.click(within(officialTest).getByRole('button', { name: 'أعد الاختبار' }))
    const restarted = screen.getByTestId('lesson7-official-test')
    const firstAgain = restarted.querySelector('.official-question') as HTMLElement
    expect(within(firstAgain).getAllByRole('radio')[1]).not.toBeChecked()
    expect(within(restarted).queryByText(/النتيجة الموضوعية/)).not.toBeInTheDocument()
    expect(within(restarted).queryByText(/الإجابة النموذجية/)).not.toBeInTheDocument()
  })

  it('keeps the teacher area gated and exposes the complete source answer material', async () => {
    goToLesson('lesson-7')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('خامسًا: منطقة خاصة بالمعلم'))
    expect(screen.getByRole('heading', { name: 'خامسًا: منطقة خاصة بالمعلم', level: 2 })).toBeInTheDocument()
    expect(screen.queryByText('إجابات النشاط التطبيقي')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('كلمة المرور'), 'معلم')
    await user.click(screen.getByRole('button', { name: 'دخول' }))

    expect(screen.getByText('إجابات النشاط التطبيقي')).toBeInTheDocument()
    expect(screen.getByText('النشاط الأول: حدد النوع (١٠ مطالب)')).toBeInTheDocument()
    expect(screen.getByText('النشاط الثالث: حدد الحالة والعلامة (٩ مطالب)')).toBeInTheDocument()
    expect(screen.getByText('النشاط الخامس: حوّل إلى الجمع المناسب (٥ مطالب)')).toBeInTheDocument()
    expect(screen.getByText('الإجابات النموذجية لاختبار نهاية الدرس')).toBeInTheDocument()
    expect(screen.getByText('1. لا تختصر درس المثنى بقاعدة "ان/ين"')).toBeInTheDocument()
    expect(screen.getByText('أخطاء متوقعة من الطالب')).toBeInTheDocument()
    expect(screen.getByText('لأن جمع المؤنث السالم منصوب بالكسرة.')).toBeInTheDocument()
    expect(
      screen.getAllByText('الطالباتُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.').length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByText('الطالباتِ: اسم مجرور بـ"على"، وعلامة جره الكسرة الظاهرة على آخره.').length,
    ).toBeGreaterThan(0)
  })

  it('ends with the homework, the advanced challenge, the one-page summary and the golden rules', async () => {
    goToLesson('lesson-7')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('واجب منزلي'))
    expect(screen.getByText('أولًا: صنّف الكلمات')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'ثانيًا: أعرب الكلمات المحددة', level: 3 })).toBeInTheDocument()

    await user.click(openStep('تحدي إضافي للطالب المتقدم'))
    expect(
      screen.getByText('جاءَ طالبانِ، ورأيتُ طالبينِ آخرينِ، ثم سلَّمتُ على المعلمينَ والمعلماتِ.'),
    ).toBeInTheDocument()

    await user.click(openStep('خلاصة الدرس في صفحة واحدة'))
    expect(screen.getByText('واحد أو واحدة')).toBeInTheDocument()
    expect(screen.getByText('ثلاثة فأكثر من المذكر وفق شروطه')).toBeInTheDocument()
    expect(screen.getByText('ثلاثة فأكثر من المؤنث وفق شروطه')).toBeInTheDocument()

    await user.click(openStep('قاعدة الحفظ الذهبية'))
    expect(screen.getByText('المثنى: ألف في الرفع، ياء في النصب والجر.')).toBeInTheDocument()
    expect(screen.getByText('جمع المذكر السالم: واو في الرفع، ياء في النصب والجر.')).toBeInTheDocument()
    expect(screen.getByText('جمع المؤنث السالم: ضمة في الرفع، كسرة في النصب والجر.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'إتمام الدرس' })).toBeInTheDocument()
  })
})

describe('Lesson 8 as a native multi-step lesson (الأسماء الخمسة)', () => {
  const lessonEightTitle = 'الدرس الثامن: الأسماء الخمسة'

  function openStep(name: string) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return screen.getByRole('button', { name: new RegExp(`الخطوة \\d+: ${escaped}`) })
  }

  function expectListItems(texts: string[]) {
    const items = screen.getAllByRole('listitem').map((item) => item.textContent)
    for (const text of texts) expect(items).toContain(text)
  }

  it('starts on step 1 of 43 and shows only the current step content', () => {
    goToLesson('lesson-8')
    render(<App />)

    expect(screen.getByRole('heading', { name: lessonEightTitle, level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 1 من 43')
    expect(screen.queryByTestId('lesson8-official-test')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lesson8-solutions')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /السابق/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /التالي/ })).toBeEnabled()
  })

  it('moves forward and backward with السابق / التالي and lists the source sections in the outline', async () => {
    goToLesson('lesson-8')
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /التالي/ }))
    expect(screen.getByRole('heading', { name: 'أهداف الدرس', level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 2 من 43')

    const outline = screen.getByRole('navigation', { name: 'فهرس خطوات الدرس' })
    for (const group of [
      'التمهيد والربط',
      'التعرف إلى الأسماء الخمسة',
      'القاعدة الأساسية',
      'الأسماء واحدًا واحدًا',
      'الجدول الجامع',
      'الشروط',
      'المقارنات',
      'الأمثلة المحلولة',
      'النشاط التطبيقي',
      'مراجعة أسئلة المصدر',
      'الأخطاء الشائعة',
      'الخلاصة',
      'التحدي والواجب',
      'الاختبار الإلكتروني',
      'منطقة المعلم',
    ]) {
      expect(within(outline).getByText(group)).toBeInTheDocument()
    }

    await user.click(openStep('14. جدول الأسماء الخمسة'))
    expect(screen.getByRole('heading', { name: '14. جدول الأسماء الخمسة', level: 2 })).toBeInTheDocument()
    expect(screen.getByText('احفظ هذا الجدول جيدًا:')).toBeInTheDocument()
    expect(screen.getByRole('row', { name: /ذو/ })).toBeInTheDocument()
    expect(screen.getByRole('row', { name: /حم/ })).toBeInTheDocument()
    expect(screen.getByText('واو = رفع')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /السابق/ }))
    expect(screen.getByRole('heading', { name: '13. الاسم الخامس: «ذو»', level: 2 })).toBeInTheDocument()
  })

  it('teaches the five names with their three forms and meanings, and the dual comparison', async () => {
    goToLesson('lesson-8')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('4. لماذا سُمّيت الأسماء الخمسة؟'))
    for (const meaning of [
      'الوالد',
      'الأخ',
      'قريب الزوج أو الزوجة من أهلها، ويُستعمل في ألفاظ القرابة',
      'الفم',
      'صاحب',
    ]) {
      expect(screen.getByText(meaning)).toBeInTheDocument()
    }
    for (const form of ['أبو', 'أبا', 'أبي', 'أخو', 'أخا', 'أخي', 'حمو', 'حما', 'حمي', 'ذو', 'ذا', 'ذي']) {
      expect(screen.getAllByText(form).length).toBeGreaterThan(0)
    }

    await user.click(openStep('24. مقارنة مهمة جدًا: الأسماء الخمسة والمثنى'))
    expect(screen.getByText('جاءَ أبوانِ.')).toBeInTheDocument()
    expect(screen.getByText('جاءَ أبو الطالبِ.')).toBeInTheDocument()
    expect(screen.getByTestId('lesson8-interaction-6')).toBeInTheDocument()

    await user.click(openStep('11. الاسم الثالث: «حم»'))
    expect(screen.getAllByText(/حمو العروسِ/).length).toBeGreaterThan(0)

    await user.click(openStep('12. الاسم الرابع: «فو»'))
    expect(screen.getByText('هذا فمُ الطفلِ.')).toBeInTheDocument()
    expect(screen.getByText('هذا فو الطفلِ.')).toBeInTheDocument()
    expect(screen.getByTestId('lesson8-interaction-4')).toBeInTheDocument()
  })

  it('keeps the five conditions explicit with a counter-example for each', async () => {
    goToLesson('lesson-8')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('16. شروط إعراب الأسماء الخمسة'))
    expectListItems([
      'أن تكون مفردة.',
      'أن تكون مضافة.',
      'ألا تكون مضافة إلى ياء المتكلم.',
      'في «فو»: حذف الميم.',
      '«ذو» تكون بمعنى صاحب.',
    ])

    await user.click(openStep('17. الشرط الأول: أن تكون مفردة'))
    expect(screen.getByText('جاءَ أبوانِ.')).toBeInTheDocument()

    await user.click(openStep('20. الشرط الثالث: ألا تكون مضافة إلى ياء المتكلم'))
    expect(screen.getByText('أبي: فاعل مرفوع، وعلامة رفعه ضمة مقدرة.')).toBeInTheDocument()
  })

  it('provides real interactive activities that check answers only after pressing التحقق', async () => {
    goToLesson('lesson-8')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('5. الصور الثلاث مع الحالات'))
    expect(screen.getByTestId('lesson8-interaction-1')).toBeInTheDocument()
    expect(within(screen.getByTestId('lesson8-interaction-1')).getAllByRole('combobox')).toHaveLength(3)

    await user.click(openStep('6. القاعدة الأساسية'))
    const signs = screen.getByTestId('lesson8-interaction-3')
    const selects = within(signs).getAllByRole('combobox')
    expect(selects).toHaveLength(3)
    await user.selectOptions(selects[0], 'الواو')
    await user.selectOptions(selects[1], 'الألف')
    await user.selectOptions(selects[2], 'الياء')

    // Nothing is graded before the student presses the check button.
    expect(within(signs).queryByText(/النتيجة:/)).not.toBeInTheDocument()
    await user.click(within(signs).getByRole('button', { name: 'تحقق من الإجابة' }))
    expect(within(signs).getByText(/3 \/ 3/)).toBeInTheDocument()

    await user.click(openStep('7. نفهمها بطريقة سهلة'))
    expect(screen.getAllByText('أبو').length).toBeGreaterThan(0)
    expect(screen.getByText('رأيتُ أبا خالدٍ.')).toBeInTheDocument()
    expect(screen.getByText('سلّمتُ على أبي خالدٍ.')).toBeInTheDocument()

    await user.click(openStep('8. لماذا تتغير الكلمة؟'))
    expect(screen.getByText('أبو ← أبا ← أبي')).toBeInTheDocument()

    await user.click(openStep('29. النشاط التطبيقي'))
    const application = screen.getByTestId('lesson8-application')
    expect(within(application).getAllByRole('combobox')).toHaveLength(27)
  })

  it('reveals the nine worked examples with complete parsing on demand', async () => {
    goToLesson('lesson-8')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('26. أمثلة محلولة: 1–3'))
    const reveals = screen.getAllByRole('button', { name: 'أظهر الإعراب الكامل' })
    expect(reveals).toHaveLength(3)
    expect(screen.queryByText(/أبو: فاعل مرفوع، وعلامة رفعه الواو نيابة عن الضمة/)).not.toBeInTheDocument()

    await user.click(reveals[0])
    expect(
      screen.getByText('أبو: فاعل مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.'),
    ).toBeInTheDocument()

    await user.click(openStep('28. أمثلة محلولة: 7–9'))
    expect(screen.getByText('رجلٌ ذو أدبٍ.')).toBeInTheDocument()
    expect(screen.getByText('مررتُ برجلٍ ذي أدبٍ.')).toBeInTheDocument()
  })

  it('represents the 25 source end-of-lesson questions across three review steps', async () => {
    goToLesson('lesson-8')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('30. مراجعة أسئلة المصدر 1–13'))
    const first = screen.getByTestId('lesson8-source-review-1')
    for (let number = 1; number <= 13; number += 1) {
      expect(within(first).getByTestId(`lesson8-source-q${number}`)).toBeInTheDocument()
    }
    expect(within(first).queryByText(/إجابة صحيحة/)).not.toBeInTheDocument()

    const questionOne = within(first).getByTestId('lesson8-source-q1')
    expect(within(questionOne).getAllByRole('radio')).toHaveLength(4)
    await user.click(within(questionOne).getByRole('button', { name: 'أظهر الإجابة النموذجية' }))
    expect(within(questionOne).getByText('ب) أب.')).toBeInTheDocument()

    await user.click(openStep('31. مراجعة أسئلة المصدر 14–18'))
    const second = screen.getByTestId('lesson8-source-review-14')
    for (let number = 14; number <= 18; number += 1) {
      expect(within(second).getByTestId(`lesson8-source-q${number}`)).toBeInTheDocument()
    }
    await user.click(within(second).getByRole('button', { name: 'أظهر الإجابات النموذجية' }))
    expect(
      within(second).getAllByText(/مفعول به منصوب، وعلامة نصبه الألف نيابة عن الفتحة/).length,
    ).toBeGreaterThan(0)

    await user.click(openStep('32. مراجعة أسئلة المصدر 19–25'))
    const third = screen.getByTestId('lesson8-source-review-19')
    for (let number = 19; number <= 25; number += 1) {
      expect(within(third).getByTestId(`lesson8-source-q${number}`)).toBeInTheDocument()
    }
    const thinking = within(third).getByTestId('lesson8-source-q24')
    await user.type(within(thinking).getByLabelText('إجابة السؤال 24'), 'أبو مرفوع بالواو، وأبوان مثنى مرفوع بالألف')
    await user.click(within(thinking).getByRole('button', { name: 'أظهر الإجابة النموذجية' }))
    expect(within(thinking).getByText(/مثنى، مرفوع بالألف/)).toBeInTheDocument()
  })

  it('keeps the 20-question platform test unrevealed until submission and clears the draft on restart', async () => {
    goToLesson('lesson-8')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('39. اختبار الدرس الثامن (٢٠ سؤالًا)'))
    const officialTest = screen.getByTestId('lesson8-official-test')
    expect(officialTest.querySelectorAll('.official-question')).toHaveLength(20)
    expect(within(officialTest).getByText('أساسي: ٦')).toBeInTheDocument()
    expect(within(officialTest).getByText('متوسط: ٧')).toBeInTheDocument()
    expect(within(officialTest).getByText('متقدم: ٤')).toBeInTheDocument()
    expect(within(officialTest).getByText('تفكير: ٣')).toBeInTheDocument()

    // Answering reveals nothing by itself.
    const questionOne = screen.getByTestId('lesson8-test-q1')
    await user.selectOptions(within(questionOne).getByRole('combobox'), 'جد')
    await user.selectOptions(within(screen.getByTestId('lesson8-test-q2')).getByRole('combobox'), 'صح')
    expect(within(officialTest).queryByText(/النتيجة:/)).not.toBeInTheDocument()
    expect(within(officialTest).queryByText(/الإجابة الصحيحة/)).not.toBeInTheDocument()

    await user.click(within(officialTest).getByRole('button', { name: 'تسليم الاختبار' }))
    expect(within(officialTest).getByText(/2 \/ 20/)).toBeInTheDocument()
    expect(within(officialTest).getByText(/إجابات صحيحة:/)).toBeInTheDocument()

    // Restart clears the draft and the previous result.
    await user.click(within(officialTest).getByRole('button', { name: 'أعد الاختبار' }))
    const restarted = screen.getByTestId('lesson8-official-test')
    expect(within(restarted).queryByText(/النتيجة:/)).not.toBeInTheDocument()
    expect(within(screen.getByTestId('lesson8-test-q1')).getByRole('combobox')).toHaveValue('')
  })

  it('gates the explanatory solutions area behind the submitted test', async () => {
    goToLesson('lesson-8')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('40. حلول الاختبار'))
    expect(screen.getByTestId('lesson8-solutions')).toBeInTheDocument()
    expect(screen.getByText(/أكمل «اختبار الدرس الثامن» وسلّمه أولًا/)).toBeInTheDocument()
    expect(screen.queryByText('التفسير:')).not.toBeInTheDocument()

    await user.click(openStep('39. اختبار الدرس الثامن (٢٠ سؤالًا)'))
    const officialTest = screen.getByTestId('lesson8-official-test')
    await user.selectOptions(within(screen.getByTestId('lesson8-test-q1')).getByRole('combobox'), 'جد')
    await user.click(within(officialTest).getByRole('button', { name: 'تسليم الاختبار' }))

    await user.click(openStep('40. حلول الاختبار'))
    expect(screen.getByText('المجموعة الأولى: الأسئلة 1–5')).toBeInTheDocument()
    expect(screen.getByText('المجموعة الثانية: الأسئلة 6–10')).toBeInTheDocument()
    expect(screen.getByText('المجموعة الثالثة: الأسئلة 11–15')).toBeInTheDocument()
    expect(screen.getByText('المجموعة الرابعة: الأسئلة 16–20')).toBeInTheDocument()
    expect(screen.getAllByText(/الإجابة الصحيحة:/).length).toBe(20)
    expect(screen.getAllByText(/التفسير:/).length).toBe(20)
    expect(screen.getByText(/1 \/ 20/)).toBeInTheDocument()
  })

  it('keeps the Teacher Area behind somer173 with the complete answer material', async () => {
    goToLesson('lesson-8')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('41. منطقة خاصة بالمعلم'))
    expect(screen.getByRole('heading', { name: '41. منطقة خاصة بالمعلم', level: 2 })).toBeInTheDocument()
    expect(screen.queryByText('د. حلول أسئلة نهاية الدرس في المصدر (١–٢٥)')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('كلمة المرور'), 'somer173')
    await user.click(screen.getByRole('button', { name: 'دخول' }))

    for (const heading of [
      'أ. شرح الدرس للمعلم',
      'ب. حلول أنشطة الدرس',
      'ج. حلول الأمثلة المحلولة (٩ أمثلة)',
      'د. حلول أسئلة نهاية الدرس في المصدر (١–٢٥)',
      'هـ. الواجب: نموذج الإجابة',
      'و. ملاحظات تدريسية',
    ]) {
      expect(screen.getByText(heading)).toBeInTheDocument()
    }

    expect(
      screen.getAllByText('أخا: مفعول به منصوب، وعلامة نصبه الألف نيابة عن الفتحة؛ لأنه من الأسماء الخمسة، وهو مضاف.')
        .length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText('ذي: نعت مجرور، وعلامة جره الياء نيابة عن الكسرة؛ لأنه من الأسماء الخمسة، وهو مضاف.').length)
      .toBeGreaterThan(0)
    expect(screen.getAllByText(/الفرق بين الأسماء الخمسة والمثنى/).length).toBeGreaterThan(0)
    expect(screen.getByText(/فو وفم/)).toBeInTheDocument()
    expect(screen.getByText(/ذو بمعنى صاحب/)).toBeInTheDocument()
    expect(screen.getByText('حلول التفاعلات السبعة')).toBeInTheDocument()
    expect(screen.getByText(/الربط بالدرس السابق: علامات الإعراب الفرعية/)).toBeInTheDocument()
    expect(screen.getAllByText('ب) أب.').length).toBeGreaterThan(0)
  })

  it('ends with the challenge, the homework, the summary and the memorization key', async () => {
    goToLesson('lesson-8')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('37. تحدي إضافي للطالب المتقدم'))
    expect(screen.getByText('أعرب الجمل الآتية إعرابًا كاملًا:')).toBeInTheDocument()
    expect(screen.getByText('جاءَ أبو صديقي.')).toBeInTheDocument()
    expect(screen.getByText('مررتُ برجلٍ ذي خبرةٍ.')).toBeInTheDocument()

    await user.click(openStep('38. واجب الدرس'))
    expect(screen.getByText('اكتب ثلاث جمل باستخدام كلمة «أب»:')).toBeInTheDocument()
    expect(screen.getByText('ثم اكتب ثلاث جمل باستخدام كلمة «ذو» بمعنى صاحب:')).toBeInTheDocument()

    await user.click(openStep('35. الخلاصة'))
    expect(screen.getByText('ذو = صاحب')).toBeInTheDocument()
    expect(screen.getByText('الأسماء الخمسة: واو في الرفع، ألف في النصب، ياء في الجر.')).toBeInTheDocument()

    await user.click(openStep('36. قاعدة سريعة للحفظ ومفتاح الحفظ'))
    expect(screen.getByText('الأسماء الخمسة ترفع بالواو، وتنصب بالألف، وتجر بالياء.')).toBeInTheDocument()
    expect(screen.getAllByText('واو = رفع').length).toBeGreaterThan(0)
    expect(screen.getAllByText('ألف = نصب').length).toBeGreaterThan(0)
    expect(screen.getAllByText('ياء = جر').length).toBeGreaterThan(0)
  })

  it('does not regress Lessons 1–7 after adding the eighth lesson', () => {
    const { unmount } = render(<App />)
    expect(within(screen.getByRole('list')).getAllByRole('link')).toHaveLength(10)
    unmount()

    goToLesson('lesson-1')
    const one = render(<App />)
    expect(screen.getByRole('heading', { name: 'مقدمة / ابدأ رحلتك', level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 1 من 19')
    one.unmount()
    window.location.hash = ''

    goToLesson('lesson-7')
    render(<App />)
    expect(
      screen.getByRole('heading', {
        name: 'الدرس السابع: المثنى وجمع المذكر السالم وجمع المؤنث السالم',
        level: 2,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 1 من 59')
  })
})

describe('Lesson 9 as a native multi-step lesson (كان وأخواتها)', () => {
  const lessonNineTitle = 'الدرس التاسع: كان وأخواتها'

  function openStep(name: string) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return screen.getByRole('button', { name: new RegExp(`الخطوة \\d+: ${escaped}`) })
  }

  it('opens from its index card and starts on step 1 of 41 showing only the current step', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('link', { name: 'كان وأخواتها' }))
    expect(window.location.hash).toBe('#/lesson/lesson-9')

    expect(screen.getByRole('heading', { name: lessonNineTitle, level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 1 من 41')
    expect(screen.queryByTestId('lesson9-official-test')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lesson9-solutions')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /السابق/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /التالي/ })).toBeEnabled()

    // The eight sisters are announced on the hero, and so is the golden rule.
    for (const verb of ['كانَ', 'أصبحَ', 'أمسى', 'أضحى', 'ظلَّ', 'باتَ', 'صارَ', 'ليسَ']) {
      expect(screen.getAllByText(verb).length).toBeGreaterThan(0)
    }
    expect(screen.getAllByText('كان وأخواتها ترفع الاسم وتنصب الخبر.').length).toBeGreaterThan(0)
  })

  it('lists the nine objectives and the nominal-sentence review with complete parsing', async () => {
    goToLesson('lesson-9')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('أهداف الدرس'))
    const items = screen.getAllByRole('listitem').map((item) => item.textContent)
    for (const objective of [
      'معرفة معنى كان وأخواتها.',
      'معرفة تأثيرها في الجملة الاسمية.',
      'التمييز بين اسم كان وخبر كان.',
      'معرفة إعراب اسم كان وخبرها.',
      'استخدام أشهر أخوات كان في جمل صحيحة.',
      'التمييز بين الجملة الاسمية قبل دخول كان وبعد دخولها.',
      'إعراب الجمل التي تحتوي على كان وأخواتها.',
      'فهم الفرق بين اسم كان وخبر كان.',
      'تجنب الأخطاء الشائعة في استعمالها.',
    ]) {
      expect(items).toContain(objective)
    }

    await user.click(openStep('1. مراجعة سريعة: الجملة الاسمية'))
    expect(screen.getByText('مبتدأ + خبر')).toBeInTheDocument()
    expect(screen.getByText('الجوُّ جميلٌ.')).toBeInTheDocument()
    expect(screen.getByText('الجوُّ: مبتدأ مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.')).toBeInTheDocument()
    expect(screen.getByText('جميلٌ: خبر مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.')).toBeInTheDocument()
    expect(screen.getByText('المبتدأ مرفوع، والخبر مرفوع.')).toBeInTheDocument()
  })

  it('moves forward and backward with السابق / التالي and lists every outline group', async () => {
    goToLesson('lesson-9')
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /التالي/ }))
    expect(screen.getByRole('heading', { name: 'أهداف الدرس', level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 2 من 41')

    const outline = screen.getByRole('navigation', { name: 'فهرس خطوات الدرس' })
    for (const group of [
      'البداية',
      'التمهيد والمراجعة',
      'القاعدة الأساسية',
      'أخوات كان',
      'القاعدة الذهبية',
      'طريقة الاكتشاف',
      'الأمثلة السهلة',
      'قبل كان وبعدها',
      'الإعراب الكامل',
      'الإعراب الفرعي',
      'خبر كان',
      'كان وليس وصار',
      'الأخطاء الشائعة',
      'المقارنة النهائية',
      'الأمثلة المحلولة',
      'الأنشطة التطبيقية',
      'مراجعة أسئلة المصدر',
      'التحدي المتقدم',
      'الخلاصة',
      'الاختبار الإلكتروني',
      'منطقة المعلم',
    ]) {
      expect(within(outline).getByText(group)).toBeInTheDocument()
    }

    await user.click(openStep('7. جدول أشهر أخوات كان'))
    expect(screen.getByRole('heading', { name: '7. جدول أشهر أخوات كان', level: 2 })).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(9)
    expect(
      screen.getByText('لا تحتاج إلى حفظ جميع التفاصيل الزمنية لكل فعل الآن؛ المهم أن تفهم عملها النحوي.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /السابق/ }))
    expect(screen.getByRole('heading', { name: '6. أشهر أخوات كان', level: 2 })).toBeInTheDocument()
  })

  it('teaches the rule through an interactive before/after transformation', async () => {
    goToLesson('lesson-9')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('2. ماذا يحدث إذا دخلت «كان»؟'))
    const transform = screen.getByTestId('lesson9-transform-weather')
    expect(within(transform).getByText('الجوُّ جميلٌ.')).toBeInTheDocument()
    // The "after" side stays hidden until the student asks for the transformation.
    expect(within(transform).queryByText('كانَ الجوُّ جميلًا.')).not.toBeInTheDocument()

    await user.click(within(transform).getByRole('button', { name: /شاهد التحوّل/ }))
    expect(within(transform).getByText('كانَ الجوُّ جميلًا.')).toBeInTheDocument()
    expect(within(transform).getAllByText('جميلًا').length).toBeGreaterThan(0)
    expect(within(transform).getByText('تغيّر إعراب الخبر')).toBeInTheDocument()
    expect(
      within(transform).queryByText('الجوُّ: اسم كان مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.'),
    ).not.toBeInTheDocument()

    await user.click(openStep('4. نفهم القاعدة من مثال بسيط'))
    expect(screen.getByTestId('lesson9-transform-student')).toBeInTheDocument()
    // The role-shift strip renders before → after as its own nodes (the arrow is decorative).
    const shift = document.querySelector('.lesson-nine-shift') as HTMLElement
    expect(within(shift).getByText('مبتدأ')).toBeInTheDocument()
    expect(within(shift).getByText('اسم كان')).toBeInTheDocument()
    expect(within(shift).getByText('خبر')).toBeInTheDocument()
    expect(within(shift).getByText('خبر كان')).toBeInTheDocument()
    expect(within(shift).getByText('مرفوع ← مرفوع')).toBeInTheDocument()
    expect(within(shift).getByText('مرفوع ← منصوب')).toBeInTheDocument()

    await user.click(openStep('5. لماذا نقول «اسم كان» و«خبر كان»؟'))
    expect(screen.getByText('كانَ الطفلُ سعيدًا.')).toBeInTheDocument()
    expect(screen.getByText('الطفلُ: اسم كان.')).toBeInTheDocument()
    expect(screen.getByText('سعيدًا: خبر كان.')).toBeInTheDocument()
  })

  it('explores the eight sisters interactively with each meaning and example', async () => {
    goToLesson('lesson-9')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('6. أشهر أخوات كان'))
    const explorer = screen.getByTestId('lesson9-sisters-explorer')
    expect(within(explorer).getAllByRole('button')).toHaveLength(8)
    // The first sister is open by default.
    expect(within(explorer).getByText('اتصاف في الماضي.')).toBeInTheDocument()
    expect(within(explorer).getByText('كانَ الجوُّ جميلًا.')).toBeInTheDocument()

    await user.click(within(explorer).getByRole('button', { name: 'صارَ' }))
    expect(within(explorer).getByText('التحول.')).toBeInTheDocument()
    expect(within(explorer).getByText('تدل على التحول والانتقال من حالة إلى أخرى.')).toBeInTheDocument()
    expect(within(explorer).getByText('صارَ الماءُ ثلجًا.')).toBeInTheDocument()
    expect(within(explorer).getByText('أي أن الماء تحوّل إلى ثلج.')).toBeInTheDocument()

    await user.click(within(explorer).getByRole('button', { name: 'ليسَ' }))
    expect(within(explorer).getByText('النفي.')).toBeInTheDocument()
    expect(within(explorer).getByText('ليسَ الطالبُ غائبًا.')).toBeInTheDocument()
    expect(within(explorer).getByText('أي: الطالب ليس غائبًا.')).toBeInTheDocument()

    await user.click(openStep('8. المعنى قبل الحفظ'))
    const meaningCheck = screen.getByTestId('lesson9-meaning-check')
    expect(within(meaningCheck).getAllByRole('combobox')).toHaveLength(6)
    expect(within(meaningCheck).queryByText(/النتيجة:/)).not.toBeInTheDocument()
  })

  it('guides the three-step discovery method as a real interaction', async () => {
    goToLesson('lesson-9')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('10. كيف أتعرف على اسم كان وخبرها؟'))
    expect(screen.getByText('ابحث عن كان أو إحدى أخواتها.')).toBeInTheDocument()
    expect(screen.getAllByText('من أو ما الذي نتحدث عنه؟').length).toBeGreaterThan(0)
    expect(screen.getAllByText('ماذا نقول عنه؟').length).toBeGreaterThan(0)

    await user.click(openStep('11. جرّب الطريقة الثلاثية'))
    const discovery = screen.getByTestId('lesson9-discovery')
    const selects = within(discovery).getAllByRole('combobox')
    expect(selects).toHaveLength(3)
    await user.selectOptions(selects[0], 'كانَ')
    await user.selectOptions(selects[1], 'الجوُّ')
    await user.selectOptions(selects[2], 'جميلًا')
    expect(within(discovery).queryByText(/النتيجة:/)).not.toBeInTheDocument()

    await user.click(within(discovery).getByRole('button', { name: 'تحقق من الإجابة' }))
    expect(within(discovery).getByText(/1 \/ 1/)).toBeInTheDocument()
    expect(within(discovery).getByText('الجوُّ ← اسم كان. جميلًا ← خبر كان.')).toBeInTheDocument()
    expect(
      within(discovery).getByText('الجوُّ: اسم كان مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.'),
    ).toBeInTheDocument()
  })

  it('applies the sub-signs of the dual, both plurals and the five names', async () => {
    goToLesson('lesson-9')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('16. كان وأخواتها مع المثنى'))
    expect(screen.getByText('كانَ الطالبانِ مجتهدَينِ.')).toBeInTheDocument()
    expect(screen.getByText('الطالبانِ: اسم كان مرفوع، وعلامة رفعه الألف لأنه مثنى.')).toBeInTheDocument()
    expect(screen.getByText('مجتهدَينِ: خبر كان منصوب، وعلامة نصبه الياء لأنه مثنى.')).toBeInTheDocument()
    expect(screen.getByText('كان وأخواتها لا تلغي قواعد الإعراب الفرعية، بل نطبق القواعد معًا.')).toBeInTheDocument()

    await user.click(openStep('17. كان وأخواتها مع جمع المذكر السالم'))
    expect(screen.getByText('كانَ المعلمونَ حاضرينَ.')).toBeInTheDocument()
    expect(screen.getByText('المعلمونَ: اسم كان مرفوع، وعلامة رفعه الواو لأنه جمع مذكر سالم.')).toBeInTheDocument()

    await user.click(openStep('18. كان وأخواتها مع جمع المؤنث السالم'))
    expect(screen.getByText('كانتِ الطالباتُ مجتهداتٍ.')).toBeInTheDocument()
    expect(
      screen.getByText('مجتهداتٍ: خبر كان منصوب، وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم.'),
    ).toBeInTheDocument()

    await user.click(openStep('19. كان وأخواتها مع الأسماء الخمسة'))
    expect(screen.getByText('كانَ أبوك كريمًا.')).toBeInTheDocument()
    expect(
      screen.getByText('أبوك: اسم كان مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.'),
    ).toBeInTheDocument()

    await user.click(openStep('20. خبر كان ليس دائمًا كلمة واحدة'))
    expect(screen.getByText('كانَ الطالبُ في المدرسةِ.')).toBeInTheDocument()
    expect(screen.getAllByText('شبه جملة').length).toBeGreaterThan(0)
    expect(screen.getByText('وسنتوسع في أنواع الخبر لاحقًا.')).toBeInTheDocument()
    // The advanced predicate topics stay out of the student's lesson.
    expect(screen.queryByText(/كان التامة/)).not.toBeInTheDocument()
    expect(screen.queryByText(/حذف خبر كان/)).not.toBeInTheDocument()
  })

  it('separates كان from ليس and from صار, then corrects the four common errors', async () => {
    goToLesson('lesson-9')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('21. كان وأخواتها مع النفي'))
    expect(screen.getByTestId('lesson9-transform-lazy')).toBeInTheDocument()
    expect(screen.getByText('الطالبُ: اسم ليس مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.')).toBeInTheDocument()

    await user.click(openStep('22. الفرق بين «كان» و«ليس»'))
    expect(screen.getByText('كانَ الطفلُ صغيرًا.')).toBeInTheDocument()
    expect(screen.getByText('ليسَ الطفلُ صغيرًا.')).toBeInTheDocument()

    await user.click(openStep('23. الفرق بين «كان» و«صار»'))
    expect(screen.getByText('كانَ الماءُ باردًا.')).toBeInTheDocument()
    expect(screen.getByText('صارَ الماءُ باردًا.')).toBeInTheDocument()
    expect(screen.getByText('اتصاف أو حالة').textContent).toContain('كان')
    expect(screen.getByText('تحوّل').textContent).toContain('صار')
    expect(screen.getByTestId('lesson9-meaning-activity')).toBeInTheDocument()

    await user.click(openStep('24. أخطاء شائعة جدًا'))
    expect(screen.getByText('كانَ الطالبُ مجتهدٌ.')).toBeInTheDocument()
    expect(screen.getByText('صارَ الماءُ ثلجٌ.')).toBeInTheDocument()
    expect(screen.getByText('لأن خبر كان منصوب.')).toBeInTheDocument()

    await user.click(openStep('25. صحّح الخطأ بنفسك'))
    const errors = screen.getByTestId('lesson9-errors-activity')
    expect(within(errors).getAllByRole('combobox')).toHaveLength(8)
    expect(within(errors).queryByText(/إجابة صحيحة/)).not.toBeInTheDocument()
    const firstRow = within(errors).getAllByRole('combobox')
    await user.selectOptions(firstRow[0], 'كانَ الطالبُ مجتهدًا.')
    await user.selectOptions(firstRow[1], 'لأن خبر كان منصوب')
    await user.click(within(errors).getByRole('button', { name: 'تحقق من الإجابة' }))
    expect(within(errors).getByText(/النتيجة:/)).toBeInTheDocument()
    expect(within(errors).getAllByText('إجابة صحيحة').length).toBe(1)
  })

  it('runs the two source activities as real interactions that grade only after التحقق', async () => {
    goToLesson('lesson-9')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('29. النشاط التطبيقي الأول: أدخل كان على الجملة'))
    for (const sentence of [
      'الجوُّ جميلٌ.',
      'الطالبُ نشيطٌ.',
      'الطريقُ طويلٌ.',
      'السماءُ صافيةٌ.',
      'الطفلانِ سعيدانِ.',
      'المعلمونَ حاضرونَ.',
      'الطالباتُ مجتهداتٌ.',
    ]) {
      // Each sentence appears in the printed list and again as an interactive row.
      expect(screen.getAllByText(sentence)).toHaveLength(2)
    }
    const activityOne = screen.getByTestId('lesson9-activity-1')
    const selects = within(activityOne).getAllByRole('combobox')
    expect(selects).toHaveLength(21)
    expect(within(activityOne).queryByText(/النتيجة:/)).not.toBeInTheDocument()

    // First row: الجوُّ جميلٌ → كانَ الجوُّ جميلًا.
    await user.selectOptions(selects[0], 'كانَ')
    await user.selectOptions(selects[1], 'الجوُّ')
    await user.selectOptions(selects[2], 'جميلًا')
    // Fourth row: السماءُ صافيةٌ → كانتِ السماءُ صافيةً.
    await user.selectOptions(selects[9], 'كانتِ')
    await user.selectOptions(selects[10], 'السماءُ')
    await user.selectOptions(selects[11], 'صافيةً')
    await user.click(within(activityOne).getByRole('button', { name: 'تحقق من الإجابة' }))
    expect(within(activityOne).getByText(/2 \/ 7/)).toBeInTheDocument()
    expect(within(activityOne).getByText('الجملة بعد التحويل: كانَ الجوُّ جميلًا.')).toBeInTheDocument()

    await user.click(openStep('30. النشاط التطبيقي الثاني: حدد عناصر الجملة'))
    const activityTwo = screen.getByTestId('lesson9-activity-2')
    expect(within(activityTwo).getAllByRole('combobox')).toHaveLength(15)
    expect(screen.getAllByText('كانَ الأبُ متعبًا.')).toHaveLength(2)
    expect(screen.getAllByText('ظلَّ الطالبُ مجتهدًا.')).toHaveLength(2)
  })

  it('offers the advanced challenge with six requirements per sentence and a revealable solution', async () => {
    goToLesson('lesson-9')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('34. تحدي للطالب المتقدم'))
    expect(screen.getByText('أعرب الجمل الآتية إعرابًا كاملًا:')).toBeInTheDocument()
    for (const sentence of [
      'كانَ أبو خالدٍ كريمًا.',
      'أصبحَ الطالبانِ مستعدَّينِ.',
      'صارَ المعلمونَ محبوبينَ.',
      'كانتِ الطالباتُ نشيطاتٍ.',
      'ليسَ أخو الطالبِ غائبًا.',
    ]) {
      expect(screen.getAllByText(sentence).length).toBeGreaterThan(0)
    }
    const challenge = screen.getByTestId('lesson9-challenge')
    expect(within(challenge).getAllByRole('combobox')).toHaveLength(30)

    // The complete parsing of the first sentence stays hidden until it is requested.
    expect(
      screen.queryByText('أبو: اسم كان مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.'),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /أظهر الحل النهائي: كانَ أبو خالدٍ كريمًا/ }))
    expect(
      screen.getByText('أبو: اسم كان مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.'),
    ).toBeInTheDocument()
    expect(screen.getByText('خالدٍ: مضاف إليه مجرور، وعلامة جره الكسرة الظاهرة على آخره.')).toBeInTheDocument()
  })

  it('reveals the four easy examples and the five worked examples with complete parsing', async () => {
    goToLesson('lesson-9')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('12. أمثلة سهلة جدًا'))
    expect(screen.getByText('كانَ الطالبُ نشيطًا.')).toBeInTheDocument()
    expect(screen.getByText('ليسَ الطريقُ طويلًا.')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'أظهر الإعراب الكامل' })).toHaveLength(4)

    await user.click(openStep('27. أمثلة محلولة: 1–3'))
    const reveals = screen.getAllByRole('button', { name: 'أظهر الإعراب الكامل' })
    expect(reveals).toHaveLength(3)
    expect(screen.queryByText(/الجوُّ: اسم كان مرفوع، وعلامة رفعه الضمة الظاهرة على آخره./)).not.toBeInTheDocument()
    await user.click(reveals[0])
    expect(screen.getByText('كانَ الجوُّ جميلًا.')).toBeInTheDocument()
    expect(screen.getByText('الجوُّ: اسم كان مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.')).toBeInTheDocument()
    expect(screen.getByText('جميلًا: خبر كان منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.')).toBeInTheDocument()

    await user.click(openStep('28. أمثلة محلولة: 4–5'))
    expect(screen.getByText('ظلَّ المعلمونَ حاضرينَ.')).toBeInTheDocument()
    expect(screen.getByText('كانتِ الطالباتُ سعيداتٍ.')).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: 'أظهر الإعراب الكامل' })[1])
    expect(
      screen.getByText('سعيداتٍ: خبر كان منصوب، وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم.'),
    ).toBeInTheDocument()
  })

  it('represents all 27 source end-of-lesson questions across three review steps', async () => {
    goToLesson('lesson-9')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('31. مراجعة أسئلة المصدر 1–15'))
    const first = screen.getByTestId('lesson9-source-review-1')
    for (let number = 1; number <= 15; number += 1) {
      expect(within(first).getByTestId(`lesson9-source-q${number}`)).toBeInTheDocument()
    }
    expect(within(first).queryByText(/إجابة صحيحة/)).not.toBeInTheDocument()
    expect(
      within(first).getByText('هذه أسئلة المصدر للمراجعة، وليست اختبار المنصة النهائي؛ فاختبار الدرس التاسع خطوة مستقلة بأسئلة جديدة.'),
    ).toBeInTheDocument()

    const questionOne = within(first).getByTestId('lesson9-source-q1')
    expect(within(questionOne).getAllByRole('radio')).toHaveLength(4)
    await user.click(within(questionOne).getByRole('button', { name: 'أظهر الإجابة النموذجية' }))
    expect(within(questionOne).getByText('ب) ترفع الاسم وتنصب الخبر.')).toBeInTheDocument()

    await user.click(openStep('32. مراجعة أسئلة المصدر 16–20'))
    const second = screen.getByTestId('lesson9-source-review-16')
    for (let number = 16; number <= 20; number += 1) {
      expect(within(second).getByTestId(`lesson9-source-q${number}`)).toBeInTheDocument()
    }
    await user.click(within(second).getByRole('button', { name: 'أظهر الإجابات النموذجية' }))
    expect(
      within(second).getAllByText(/مجتهداتٍ: خبر كان منصوب، وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم./)
        .length,
    ).toBeGreaterThan(0)

    await user.click(openStep('33. مراجعة أسئلة المصدر 21–27'))
    const third = screen.getByTestId('lesson9-source-review-21')
    for (let number = 21; number <= 27; number += 1) {
      expect(within(third).getByTestId(`lesson9-source-q${number}`)).toBeInTheDocument()
    }
    const thinking = within(third).getByTestId('lesson9-source-q27')
    await user.type(
      within(thinking).getByLabelText('إجابة السؤال 27'),
      'كان تفيد اتصاف الماء بالبرودة، أما صار فتفيد تحوّله إلى البرودة',
    )
    await user.click(within(thinking).getByRole('button', { name: 'أظهر الإجابة النموذجية' }))
    expect(within(thinking).getByText(/الماء تحوّل وأصبح باردًا/)).toBeInTheDocument()
  })

  it('keeps the 20-question platform test unrevealed until submission and clears the draft on restart', async () => {
    goToLesson('lesson-9')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('37. اختبار الدرس التاسع (٢٠ سؤالًا)'))
    const officialTest = screen.getByTestId('lesson9-official-test')
    expect(officialTest.querySelectorAll('.official-question')).toHaveLength(20)
    expect(within(officialTest).getByText('أساسي: ٦')).toBeInTheDocument()
    expect(within(officialTest).getByText('متوسط: ٧')).toBeInTheDocument()
    expect(within(officialTest).getByText('متقدم: ٤')).toBeInTheDocument()
    expect(within(officialTest).getByText('تفكير: ٣')).toBeInTheDocument()

    // Answering reveals nothing by itself.
    await user.selectOptions(within(screen.getByTestId('lesson9-test-q1')).getByRole('combobox'), 'إنَّ')
    await user.selectOptions(within(screen.getByTestId('lesson9-test-q2')).getByRole('combobox'), 'صح')
    expect(within(officialTest).queryByText(/النتيجة:/)).not.toBeInTheDocument()
    expect(within(officialTest).queryByText(/الإجابة الصحيحة/)).not.toBeInTheDocument()

    await user.click(within(officialTest).getByRole('button', { name: 'تسليم الاختبار' }))
    expect(within(officialTest).getByText(/2 \/ 20/)).toBeInTheDocument()
    expect(within(officialTest).getByText(/إجابات صحيحة:/)).toBeInTheDocument()

    // Restart clears the draft and the previous result.
    await user.click(within(officialTest).getByRole('button', { name: 'أعد الاختبار' }))
    const restarted = screen.getByTestId('lesson9-official-test')
    expect(within(restarted).queryByText(/النتيجة:/)).not.toBeInTheDocument()
    expect(within(screen.getByTestId('lesson9-test-q1')).getByRole('combobox')).toHaveValue('')
  })

  it('gates the explanatory solutions area behind the submitted test in four groups of five', async () => {
    goToLesson('lesson-9')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('38. حلول الاختبار'))
    expect(screen.getByTestId('lesson9-solutions')).toBeInTheDocument()
    expect(screen.getByText(/أكمل «اختبار الدرس التاسع» وسلّمه أولًا/)).toBeInTheDocument()
    expect(screen.queryByText('التفسير:')).not.toBeInTheDocument()

    await user.click(openStep('37. اختبار الدرس التاسع (٢٠ سؤالًا)'))
    const officialTest = screen.getByTestId('lesson9-official-test')
    await user.selectOptions(within(screen.getByTestId('lesson9-test-q1')).getByRole('combobox'), 'إنَّ')
    await user.click(within(officialTest).getByRole('button', { name: 'تسليم الاختبار' }))

    await user.click(openStep('38. حلول الاختبار'))
    expect(screen.getByText('المجموعة الأولى: الأسئلة 1–5')).toBeInTheDocument()
    expect(screen.getByText('المجموعة الثانية: الأسئلة 6–10')).toBeInTheDocument()
    expect(screen.getByText('المجموعة الثالثة: الأسئلة 11–15')).toBeInTheDocument()
    expect(screen.getByText('المجموعة الرابعة: الأسئلة 16–20')).toBeInTheDocument()
    expect(screen.getAllByText(/الإجابة الصحيحة:/).length).toBe(20)
    expect(screen.getAllByText(/التفسير:/).length).toBe(20)
    expect(screen.getByText(/1 \/ 20/)).toBeInTheDocument()
  })

  it('keeps the Teacher Area behind somer173 with the complete answer material', async () => {
    goToLesson('lesson-9')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('39. منطقة خاصة بالمعلم'))
    expect(screen.getByRole('heading', { name: '39. منطقة خاصة بالمعلم', level: 2 })).toBeInTheDocument()
    expect(screen.queryByText('د. حلول أسئلة نهاية الدرس في المصدر (١–٢٧)')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('كلمة المرور'), 'somer173')
    await user.click(screen.getByRole('button', { name: 'دخول' }))

    for (const heading of [
      'أ. شرح الدرس للمعلم',
      'ب. حلول أنشطة الدرس',
      'ج. حلول الأمثلة المحلولة (٥ أمثلة)',
      'د. حلول أسئلة نهاية الدرس في المصدر (١–٢٧)',
      'هـ. حلول التحدي المتقدم (٥ جمل)',
      'و. ملاحظات المعلم',
      'ز. ملخص الدرس',
      'النشاط الأول: أدخل كان على الجملة (٧ جمل)',
      'النشاط الثاني: حدد عناصر الجملة (٥ جمل)',
      'حلول تفاعلات الدرس',
    ]) {
      expect(screen.getByText(heading)).toBeInTheDocument()
    }

    // Complete parsing, the eight sisters, and all 27 model answers are inside the gate.
    expect(
      screen.getAllByText('الطالبُ: اسم كان مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.').length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByText('أبوك: اسم كان مرفوع، وعلامة رفعه الواو نيابة عن الضمة؛ لأنه من الأسماء الخمسة، وهو مضاف.')
        .length,
    ).toBeGreaterThan(0)
    expect(screen.getByText('1. لا تجعل الطالب يحفظ قائمة الأخوات فقط')).toBeInTheDocument()
    expect(screen.getByText('2. اربط الدرس بالدروس السابقة')).toBeInTheDocument()
    expect(screen.getByText('3. وضّح أن قواعد الإعراب الفرعية ما زالت تعمل')).toBeInTheDocument()
    expect(screen.getByText('4. لا تدخل في التفاصيل المتقدمة الآن')).toBeInTheDocument()
    expect(screen.getAllByText('ب) ترفع الاسم وتنصب الخبر.').length).toBeGreaterThan(0)
    expect(screen.getAllByText('خطأ؛ خبر كان منصوب في الأصل.').length).toBeGreaterThan(0)
    expect(screen.getAllByText('كانَ الولدُ سعيدًا.').length).toBeGreaterThan(0)
    expect(screen.getByText('13. خبر كان شبه الجملة (مثال تمهيدي فقط)')).toBeInTheDocument()
    expect(screen.getByText('6. اختبار المنصة وحلوله')).toBeInTheDocument()
  })

  it('ends with the summary, the memorization key and the teaser of إنَّ وأخواتها', async () => {
    goToLesson('lesson-9')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('35. ملخص الدرس'))
    expect(screen.getByRole('heading', { name: 'ملخص الدرس', level: 3 })).toBeInTheDocument()
    expect(screen.getByText('كان – أصبح – أمسى – أضحى – ظل – بات – صار – ليس')).toBeInTheDocument()
    expect(screen.getByText('كان ← اتصاف في الماضي.')).toBeInTheDocument()
    expect(screen.getByText('ليس ← النفي.')).toBeInTheDocument()
    expect(screen.getAllByText('كان وأخواتها ترفع الاسم وتنصب الخبر.').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/إنَّ وأخواتها/).length).toBeGreaterThan(0)
    expect(screen.getByTestId('lesson9-transform-student')).toBeInTheDocument()

    await user.click(openStep('36. قاعدة سريعة للحفظ ومفتاح الحفظ'))
    expect(screen.getByText('قاعدة سريعة للحفظ')).toBeInTheDocument()
    expect(screen.getByText('مفتاح الحفظ')).toBeInTheDocument()
    expect(screen.getAllByText('اسم كان = مرفوع').length).toBeGreaterThan(0)
    expect(screen.getAllByText('خبر كان = منصوب').length).toBeGreaterThan(0)

    // Lesson 10 is never started: the teaser is one sentence only.
    expect(screen.queryByRole('heading', { name: /الدرس العاشر/ })).not.toBeInTheDocument()
  })

  it('does not regress Lessons 1–9 after adding the tenth lesson', () => {
    const { unmount } = render(<App />)
    expect(within(screen.getByRole('list')).getAllByRole('link')).toHaveLength(10)
    unmount()

    goToLesson('lesson-2')
    const two = render(<App />)
    expect(screen.getByRole('heading', { name: 'مدخل الدرس: الجملة الاسمية', level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 1 من 27')
    two.unmount()
    window.location.hash = ''

    goToLesson('lesson-8')
    const eight = render(<App />)
    expect(screen.getByRole('heading', { name: 'الدرس الثامن: الأسماء الخمسة', level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 1 من 43')
    eight.unmount()
    window.location.hash = ''

    goToLesson('lesson-10')
    render(<App />)
    expect(screen.getByRole('heading', { name: 'الدرس العاشر: إنَّ وأخواتها', level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 1 من 41')
  })
})

describe('Lesson 10 as a native multi-step lesson (إنَّ وأخواتها)', () => {
  const lessonTenTitle = 'الدرس العاشر: إنَّ وأخواتها'
  const coreRuleText = 'إنَّ وأخواتها تنصب الاسم وترفع الخبر.'

  function openStep(name: string) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return screen.getByRole('button', { name: new RegExp(`الخطوة \\d+: ${escaped}`) })
  }

  it('opens from its index card and starts on step 1 of 41 showing only the current step', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('link', { name: 'إنَّ وأخواتها' }))
    expect(window.location.hash).toBe('#/lesson/lesson-10')

    expect(screen.getByRole('heading', { name: lessonTenTitle, level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 1 من 41')
    expect(screen.queryByTestId('lesson10-official-test')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lesson10-solutions')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /السابق/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /التالي/ })).toBeEnabled()
    expect(screen.getAllByText('إنَّ وأخواتها تنصب الاسم وترفع الخبر.').length).toBeGreaterThan(0)
  })

  it('moves one step at a time with السابق and التالي and lists the nine objectives', async () => {
    goToLesson('lesson-10')
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /التالي/ }))
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 2 من 41')
    expect(screen.getByRole('heading', { name: 'أهداف الدرس', level: 2 })).toBeInTheDocument()
    expect(screen.getByText('معرفة ما المقصود بإنَّ وأخواتها.')).toBeInTheDocument()
    expect(screen.getByText('اكتشاف الأخطاء الشائعة في إعراب اسم إنَّ وخبرها وتصحيحها.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /السابق/ }))
    expect(screen.getByText(/الخطوة/).closest('div')).toHaveTextContent('الخطوة 1 من 41')
  })

  it('shows the base transformation, the golden rule and complete parsing of the base example', async () => {
    goToLesson('lesson-10')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('5. المثال الأساسي: من الجملة الاسمية إلى إنَّ'))
    expect(screen.getByRole('button', { name: 'أدخل «إنَّ» على الجملة' })).toBeInTheDocument()
    expect(screen.queryByText('الطالبَ: اسم إنَّ منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'أدخل «إنَّ» على الجملة' }))
    expect(screen.getAllByText('إنَّ الطالبَ مجتهدٌ.').length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: 'أظهر الإعراب الكامل بعد الدخول' }))
    expect(screen.getByText('الطالبَ: اسم إنَّ منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.')).toBeInTheDocument()
    expect(screen.getByText('مجتهدٌ: خبر إنَّ مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.')).toBeInTheDocument()

    await user.click(openStep('6. القاعدة الذهبية'))
    expect(screen.getAllByText(coreRuleText).length).toBeGreaterThan(0)
    expect(screen.getAllByText('منصوب').length).toBeGreaterThan(0)
    expect(screen.getAllByText('مرفوع').length).toBeGreaterThan(0)
  })

  it('compares the sisters in an explorer that shows each meaning and its complete parsing', async () => {
    goToLesson('lesson-10')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('8. أشهر إنَّ وأخواتها'))
    await user.click(screen.getByRole('button', { name: 'لعلَّ' }))
    expect(screen.getByRole('button', { name: 'لعلَّ' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('heading', { name: /لعلَّ — حرف ترجٍّ ونصب/ })).toBeInTheDocument()
    expect(screen.getByText('الخيرَ: اسم لعلَّ منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'كأنَّ' }))
    expect(screen.getByText('معناها:').closest('p')).toHaveTextContent('معناها: التشبيه')
    expect(screen.getByText('القمرَ: اسم كأنَّ منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.')).toBeInTheDocument()
  })

  it('applies the sub-signs with complete parsing: dual, masculine plural, feminine plural and the five names', async () => {
    goToLesson('lesson-10')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('13. اسم إنَّ المثنى'))
    await user.click(screen.getByRole('button', { name: 'أدخل «إنَّ» على الجملة' }))
    expect(screen.getAllByText('إنَّ الطالبينِ مجتهدانِ.').length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: 'أظهر الإعراب الكامل' }))
    expect(screen.getByText('الطالبينِ: اسم إنَّ منصوب، وعلامة نصبه الياء لأنه مثنى.')).toBeInTheDocument()

    await user.click(openStep('15. اسم إنَّ جمع المؤنث السالم'))
    await user.click(screen.getByRole('button', { name: 'أدخل «إنَّ» على الجملة' }))
    await user.click(screen.getByRole('button', { name: 'أظهر الإعراب الكامل' }))
    expect(
      screen.getByText(
        'الطالباتِ: اسم إنَّ منصوب، وعلامة نصبه الكسرة نيابة عن الفتحة لأنه جمع مؤنث سالم.',
      ),
    ).toBeInTheDocument()

    await user.click(openStep('16. اسم إنَّ من الأسماء الخمسة'))
    expect(screen.getAllByRole('button', { name: 'أدخل «إنَّ» على الجملة' })).toHaveLength(2)
    await user.click(screen.getAllByRole('button', { name: 'أدخل «إنَّ» على الجملة' })[0])
    expect(screen.getAllByText('إنَّ أباكَ كريمٌ.').length).toBeGreaterThan(0)
  })

  it('grades the seven-sentence activity by exact case endings and reveals the answer only after checking', async () => {
    goToLesson('lesson-10')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('28. النشاط التطبيقي الأول'))
    const activity = screen.getByTestId('lesson10-activity-one')
    const check = within(activity).getByRole('button', { name: 'تحقق من الإجابات' })
    expect(check).toBeDisabled()
    expect(within(activity).queryByText('الجوَّ: اسم إنَّ منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.')).not.toBeInTheDocument()

    const selects = within(activity).getAllByRole('combobox')
    expect(selects).toHaveLength(14)
    const answers = [
      ['الجوُّ', 'جميلٌ'],
      ['الطالبَ', 'مجتهدٌ'],
      ['الطريقَ', 'طويلٌ'],
      ['الطالبينِ', 'حاضرانِ'],
      ['المعلمينَ', 'حاضرونَ'],
      ['الطالباتِ', 'مجتهداتٌ'],
      ['أباكَ', 'كريمٌ'],
    ]
    for (const [rowIndex, [name, khabar]] of answers.entries()) {
      await user.selectOptions(selects[rowIndex * 2], name)
      await user.selectOptions(selects[rowIndex * 2 + 1], khabar)
    }
    expect(check).toBeEnabled()
    await user.click(check)

    expect(within(activity).getByRole('status')).toHaveTextContent('النتيجة: 6 / 7')
    expect(within(activity).getByText('إجابة غير صحيحة')).toBeInTheDocument()
    expect(within(activity).getByText('الجوَّ', { selector: 'bdi' })).toBeInTheDocument()
    expect(within(activity).getAllByText('إجابة صحيحة')).toHaveLength(6)
  })

  it('keeps the 20-question test unrevealed, keeps answers across steps, and clears them on restart', async () => {
    goToLesson('lesson-10')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('37. اختبار الدرس العاشر (٢٠ سؤالًا)'))
    expect(document.querySelectorAll('[data-testid^="lesson10-test-q"]')).toHaveLength(20)
    expect(screen.getByText('أساسي: ٦')).toBeInTheDocument()
    expect(screen.getByText('متوسط: ٧')).toBeInTheDocument()
    expect(screen.getByText('متقدم: ٤')).toBeInTheDocument()
    expect(screen.getByText('تفكير: ٣')).toBeInTheDocument()
    expect(screen.queryByText('إجابة صحيحة')).not.toBeInTheDocument()
    expect(screen.queryByText('إجابة خاطئة')).not.toBeInTheDocument()

    await user.selectOptions(within(screen.getByTestId('lesson10-test-q01')).getByRole('combobox'), 'كانَ')
    await user.type(within(screen.getByTestId('lesson10-test-q04')).getByRole('textbox'), 'لعل')
    await user.click(within(screen.getByTestId('lesson10-test-q13')).getByRole('checkbox', { name: 'الفريقَ: اسم ليتَ منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.' }))
    await user.click(within(screen.getByTestId('lesson10-test-q13')).getByRole('checkbox', { name: 'فائزٌ: خبر ليتَ مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.' }))

    await user.click(openStep('38. حلول الاختبار'))
    expect(screen.getByText(/أكمل «اختبار الدرس العاشر» وسلّمه أولًا/)).toBeInTheDocument()
    await user.click(openStep('37. اختبار الدرس العاشر (٢٠ سؤالًا)'))
    expect(within(screen.getByTestId('lesson10-test-q01')).getByRole('combobox')).toHaveValue('كانَ')
    expect(within(screen.getByTestId('lesson10-test-q04')).getByRole('textbox')).toHaveValue('لعل')

    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار' }))
    expect(screen.getByText(/إجابات صحيحة:/)).toHaveTextContent('إجابات صحيحة: 3')
    expect(screen.getByText(/إجابات خاطئة:/)).toHaveTextContent('إجابات خاطئة: 0')
    expect(screen.getByText(/أسئلة غير مجابة:/)).toHaveTextContent('أسئلة غير مجابة: 17')
    expect(within(screen.getByTestId('lesson10-test-q01')).getByRole('combobox')).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'أعد الاختبار' }))
    expect(within(screen.getByTestId('lesson10-test-q01')).getByRole('combobox')).toHaveValue('')
    expect(within(screen.getByTestId('lesson10-test-q04')).getByRole('textbox')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'تسليم الاختبار' })).toBeEnabled()
  })

  it('gates the solutions behind the submitted test and shows four groups of five with the student answer', async () => {
    goToLesson('lesson-10')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('38. حلول الاختبار'))
    expect(screen.getByText(/أكمل «اختبار الدرس العاشر» وسلّمه أولًا/)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'المجموعة الأولى: الأسئلة 1–5', level: 4 })).not.toBeInTheDocument()

    await user.click(openStep('37. اختبار الدرس العاشر (٢٠ سؤالًا)'))
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار' }))
    await user.click(openStep('38. حلول الاختبار'))

    for (const title of [
      'المجموعة الأولى: الأسئلة 1–5',
      'المجموعة الثانية: الأسئلة 6–10',
      'المجموعة الثالثة: الأسئلة 11–15',
      'المجموعة الرابعة: الأسئلة 16–20',
    ]) {
      expect(screen.getByRole('heading', { name: title, level: 4 })).toBeInTheDocument()
    }
    expect(screen.getAllByText('لم تُجب')).toHaveLength(20)
    expect(screen.getAllByText('الإعراب الكامل:').length).toBeGreaterThan(0)
  })

  it('reviews all 27 source questions across four steps, with model answers hidden until requested', async () => {
    goToLesson('lesson-10')
    const user = userEvent.setup()
    render(<App />)

    let total = 0
    for (const [name, count] of [
      ['30. مراجعة أسئلة المصدر (1–8)', 8],
      ['31. مراجعة أسئلة المصدر (9–15)', 7],
      ['32. مراجعة أسئلة المصدر (16–20)', 5],
      ['33. مراجعة أسئلة المصدر (21–27)', 7],
    ] as const) {
      await user.click(openStep(name))
      const questions = document.querySelectorAll('[data-testid^="lesson10-source-q"]')
      expect(questions).toHaveLength(count)
      total += questions.length
      expect(screen.queryByText('الإجابة النموذجية:')).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'أظهر الإجابات النموذجية' }))
      expect(screen.getAllByText('الإجابة النموذجية:')).toHaveLength(count)
    }
    expect(total).toBe(27)
  })

  it('asks why the sign changed in the advanced challenge and reveals the model answer on request', async () => {
    goToLesson('lesson-10')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('34. التحدي المتقدم'))
    expect(screen.getByRole('heading', { name: 'لماذا تغيّرت علامة الإعراب؟', level: 3 })).toBeInTheDocument()
    expect(screen.queryByText(/لأن الحرف الناسخ ينصب الاسم فتتغير علامته/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'أظهر نموذج الجواب' }))
    expect(screen.getByText(/لأن الحرف الناسخ ينصب الاسم فتتغير علامته/)).toBeInTheDocument()
  })

  it('keeps the Teacher Area behind somer173 with the complete answer material', async () => {
    goToLesson('lesson-10')
    const user = userEvent.setup()
    render(<App />)

    await user.click(openStep('39. منطقة خاصة بالمعلم'))
    expect(screen.getByRole('heading', { name: '39. منطقة خاصة بالمعلم', level: 2 })).toBeInTheDocument()
    expect(screen.queryByText('ب. إجابات أسئلة المصدر (27 سؤالًا)')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('كلمة المرور'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByText('كلمة المرور غير صحيحة.')).toBeInTheDocument()

    await user.clear(screen.getByLabelText('كلمة المرور'))
    await user.type(screen.getByLabelText('كلمة المرور'), 'somer173')
    await user.click(screen.getByRole('button', { name: 'دخول' }))

    for (const heading of [
      'أ. شرح الدرس للمعلم',
      'ب. إجابات أسئلة المصدر (27 سؤالًا)',
      'ج. حلول النشاط التطبيقي الأول',
      'د. حلول النشاط التطبيقي الثاني',
      'هـ. حلول الأمثلة المحلولة (7)',
      'و. حلول التحدي المتقدم',
      'ز. حلول اختبار المنصة (20 سؤالًا)',
    ]) {
      expect(screen.getByRole('heading', { name: heading, level: 3 })).toBeInTheDocument()
    }
    expect(screen.getAllByText('الجواب:')).toHaveLength(27)
    expect(screen.getAllByText('إنَّ الجوَّ جميلٌ.').length).toBeGreaterThan(0)
    expect(screen.getAllByText('إنَّ أباكَ كريمٌ.').length).toBeGreaterThan(0)
  })
})

