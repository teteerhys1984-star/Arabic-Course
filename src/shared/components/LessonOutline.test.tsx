import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LessonOutline } from './LessonOutline'
import type { LessonStepDefinition } from './LessonFlow'

const sampleSteps: LessonStepDefinition[] = [
  {
    id: 'step-1',
    title: 'مقدمة الدرس',
    group: 'البداية',
    icon: '🎯',
    render: () => <div>محتوى الخطوة 1</div>,
  },
  {
    id: 'step-2',
    title: 'أهداف الدرس',
    group: 'البداية',
    icon: '🎯',
    render: () => <div>محتوى الخطوة 2</div>,
  },
  {
    id: 'step-3',
    title: 'المفهوم الأول بالتفصيل الكامل',
    shortTitle: 'المفهوم الأول',
    group: 'الشرح',
    icon: '💡',
    render: () => <div>محتوى الخطوة 3</div>,
  },
  {
    id: 'step-4',
    title: 'النشاط التطبيقي',
    group: 'الأنشطة',
    icon: '🚀',
    render: () => <div>محتوى الخطوة 4</div>,
  },
  {
    id: 'step-5',
    title: 'اختبار الدرس',
    group: 'التقييم',
    icon: '📝',
    render: () => <div>محتوى الخطوة 5</div>,
  },
]

describe('LessonOutline reusable component', () => {
  it('renders all section groups and steps in correct order', () => {
    const onSelect = vi.fn()
    render(
      <LessonOutline
        steps={sampleSteps}
        currentIndex={0}
        onSelectStep={onSelect}
        lessonTitle="عنوان الدرس التجريبي"
        lessonEyebrow="قواعد النحو"
      />,
    )

    expect(screen.getByText('البداية')).toBeInTheDocument()
    expect(screen.getByText('الشرح')).toBeInTheDocument()
    expect(screen.getByText('الأنشطة')).toBeInTheDocument()
    expect(screen.getByText('التقييم')).toBeInTheDocument()

    expect(screen.getByText('مقدمة الدرس')).toBeInTheDocument()
    expect(screen.getByText('أهداف الدرس')).toBeInTheDocument()
    expect(screen.getByText('المفهوم الأول')).toBeInTheDocument()
    expect(screen.getByText('النشاط التطبيقي')).toBeInTheDocument()
    expect(screen.getByText('اختبار الدرس')).toBeInTheDocument()
  })

  it('displays calculated progress indicator and step count', () => {
    const onSelect = vi.fn()
    const { rerender } = render(
      <LessonOutline steps={sampleSteps} currentIndex={1} onSelectStep={onSelect} />,
    )

    expect(screen.getByText('مسار الدرس')).toBeInTheDocument()
    expect(document.querySelector('.lesson-outline__progress-count')).toHaveTextContent('2 / 5')

    rerender(<LessonOutline steps={sampleSteps} currentIndex={3} onSelectStep={onSelect} />)
    expect(document.querySelector('.lesson-outline__progress-count')).toHaveTextContent('4 / 5')
  })

  it('clearly highlights the active step with aria-current="step" and active class', () => {
    const onSelect = vi.fn()
    render(<LessonOutline steps={sampleSteps} currentIndex={2} onSelectStep={onSelect} />)

    const buttons = screen.getAllByRole('button')
    // Step 3 (index 2) should be active
    const activeStepButton = screen.getByRole('button', { name: /المفهوم الأول/ })
    expect(activeStepButton).toHaveAttribute('aria-current', 'step')
    expect(activeStepButton).toHaveClass('is-active')

    // Prior steps should be marked as passed
    const step1 = screen.getByRole('button', { name: /مقدمة الدرس/ })
    expect(step1).toHaveClass('is-passed')
    expect(step1).not.toHaveAttribute('aria-current')

    // Next steps should neither be active nor passed
    const step4 = screen.getByRole('button', { name: /النشاط التطبيقي/ })
    expect(step4).not.toHaveClass('is-active')
    expect(step4).not.toHaveClass('is-passed')

    expect(buttons).toHaveLength(5)
  })

  it('calls onSelectStep and onClose when a step is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onClose = vi.fn()

    render(
      <LessonOutline
        steps={sampleSteps}
        currentIndex={0}
        onSelectStep={onSelect}
        onClose={onClose}
        variant="drawer"
      />,
    )

    await user.click(screen.getByRole('button', { name: /اختبار الدرس/ }))
    expect(onSelect).toHaveBeenCalledWith(4)
    expect(onClose).toHaveBeenCalled()
  })

  it('handles steps without explicit group gracefully by placing them in a default group', () => {
    const ungroupedSteps: LessonStepDefinition[] = [
      { id: 'u1', title: 'خطوة أولى', render: () => <div>1</div> },
      { id: 'u2', title: 'خطوة ثانية', render: () => <div>2</div> },
    ]
    render(<LessonOutline steps={ungroupedSteps} currentIndex={0} onSelectStep={vi.fn()} />)

    expect(screen.getByText('محتوى الدرس')).toBeInTheDocument()
    expect(screen.getByText('خطوة أولى')).toBeInTheDocument()
    expect(screen.getByText('خطوة ثانية')).toBeInTheDocument()
  })
})
