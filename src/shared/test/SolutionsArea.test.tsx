import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { SolutionsArea } from './components/SolutionsArea'
import { TestRunner } from './components/TestRunner'
import { useTestEngine } from './useTestEngine'
import type { TestDefinition } from './types'

const test: TestDefinition = {
  id: 'solutions-test',
  title: 'اختبار الدرس',
  pages: [
    {
      id: 'p1',
      title: 'الصفحة الأولى',
      questions: [
        {
          id: 'q1',
          number: 1,
          type: 'اختيار من متعدد',
          prompt: 'الكلمة التي تدل على إنسان هي:',
          fields: [{ kind: 'choice', options: ['يكتب', 'معلم'], answer: 'معلم' }],
          solution: 'معلم',
          explanation: 'المعلم اسم يدل على إنسان.',
          example: 'الطالبُ تلميذٌ.',
        },
        {
          id: 'q2',
          number: 2,
          prompt: 'علّل إجابتك:',
          fields: [{ kind: 'essay', label: 'التعليل' }],
          teacherAnswer: 'الإجابة التفصيلية في منطقة المعلم.',
          explanation: 'تُراجع يدويًا.',
        },
      ],
    },
    {
      id: 'p2',
      title: 'الصفحة الثانية',
      questions: [
        {
          id: 'q3',
          number: 3,
          prompt: 'استخرج الجذر من «فتحَ»:',
          fields: [{ kind: 'text', accept: ['ف ت ح'] }],
          solution: 'ف ت ح',
          sourceAnswer: 'ج',
          answerSource: 'source',
        },
      ],
    },
  ],
}

/** Renders the test and its solutions area with ONE shared engine (like a lesson does). */
function LessonHarness({ mode }: { mode?: 'student' | 'teacher' }) {
  const engine = useTestEngine(test)
  return (
    <>
      <TestRunner test={test} engine={engine} />
      <SolutionsArea test={test} engine={engine} mode={mode} />
    </>
  )
}

describe('SolutionsArea — the shared solutions standard', () => {
  it('renders the assessment title and the structured fields per question', async () => {
    const user = userEvent.setup()
    render(<LessonHarness />)
    // Check page 1 so its solutions are revealed.
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))

    expect(screen.getByTestId('solutions-solutions-test')).toHaveTextContent('حلول اختبار الدرس')

    const q1 = screen.getByTestId('solution-q1')
    expect(q1).toHaveTextContent('السؤال 1') // question number
    expect(q1).toHaveTextContent('الكلمة التي تدل على إنسان هي:') // concise question reference
    expect(q1).toHaveTextContent('الإجابة الصحيحة:') // correct answer label
    expect(q1).toHaveTextContent('معلم')
    expect(q1).toHaveTextContent('التفسير:') // explanation label
    expect(q1).toHaveTextContent('المعلم اسم يدل على إنسان.')
    expect(q1).toHaveTextContent('مثال إضافي:') // additional example
    expect(q1).toHaveTextContent('توضيح تعليمي من المنصة') // platform-generated badge
  })

  it('does not expose the solutions of unchecked pages (no premature exposure)', async () => {
    const user = userEvent.setup()
    render(<LessonHarness />)
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' })) // checks page 1 only

    // Page 2 solutions stay locked: its answer («ف ت ح») must not be visible.
    expect(screen.getByTestId('solutions-page-p2')).toHaveTextContent('تحقّق من هذه الصفحة أولًا')
    expect(screen.queryByTestId('solution-q3')).not.toBeInTheDocument()

    // Page 1 solutions are revealed.
    expect(screen.getByTestId('solution-q1')).toBeInTheDocument()
  })

  it('reveals the solutions of a page as soon as that page is checked', async () => {
    const user = userEvent.setup()
    render(<LessonHarness />)
    await user.click(screen.getByRole('button', { name: /الصفحة بعدها/ }))
    await user.type(screen.getByLabelText(/استخرج الجذر/), 'ف ت ح')
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))

    const q3 = screen.getByTestId('solution-q3')
    expect(q3).toHaveTextContent('الإجابة الصحيحة:')
    expect(q3).toHaveTextContent('ف ت ح')
    expect(q3).toHaveTextContent('الجواب المعتمد من المصدر:') // source-provided answer distinction
    expect(q3).toHaveTextContent('ج')
    // The student's own answer is shown next to the solution.
    expect(q3).toHaveTextContent('إجابتك:')
  })

  it('marks essay questions as manual review and keeps their model answer out of the student area', async () => {
    const user = userEvent.setup()
    render(<LessonHarness />)
    await user.type(screen.getByLabelText(/التعليل/), 'نصي')
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))

    const q2 = screen.getByTestId('solution-q2')
    expect(q2).toHaveTextContent('يُراجع يدويًا')
    expect(q2).toHaveTextContent('الإجابة النموذجية في منطقة المعلم')
    expect(q2).not.toHaveTextContent('الإجابة التفصيلية في منطقة المعلم.')
  })

  it('teacher mode reveals everything, including detailed teacher answers', () => {
    render(<LessonHarness mode="teacher" />)
    const q2 = screen.getByTestId('solution-q2')
    expect(q2).toHaveTextContent('الإجابة التفصيلية في منطقة المعلم.')
    expect(screen.getByTestId('solution-q3')).toBeInTheDocument()
  })
})
