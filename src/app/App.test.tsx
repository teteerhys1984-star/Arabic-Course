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
    ])
    expect(screen.getByRole('link', { name: 'الاسم والفعل والحرف' })).toHaveAttribute('href', '#/lesson/lesson-1')
    expect(screen.getAllByText(/ابدأ الدرس/)).toHaveLength(8)

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
    expect(within(screen.getByRole('list')).getAllByRole('link')).toHaveLength(8)
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
