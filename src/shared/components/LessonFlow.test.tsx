import { act, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LessonFlow, type LessonFlowController, type LessonStepDefinition } from './LessonFlow'

/**
 * LessonFlow owns one deliberate-navigation contract: when the student moves between
 * steps (pager or outline), the new step is committed, the view lands at its top, and
 * keyboard focus moves to its heading so assistive technology notices the change.
 *
 * That focus move must happen AS PART OF the navigation commit — never on a later
 * animation frame. A frame-scheduled focus move can fire during the student's next
 * interaction (e.g. mid-typing into an activity input) and steal every keystroke:
 * this broke the Pages build via the morphology activity test in App.test.tsx, where
 * a typed weight silently arrived blank.
 */

function makeSteps(count: number): LessonStepDefinition[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `step-${index + 1}`,
    title: `الخطوة التجريبية ${index + 1}`,
    group: 'المحتوى',
    render: () => <p>محتوى الخطوة {index + 1}</p>,
  }))
}

function headingOf(stepNumber: number) {
  return screen.getByRole('heading', { name: `الخطوة التجريبية ${stepNumber}`, level: 2 })
}

describe('LessonFlow — deliberate navigation moves focus deterministically', () => {
  it('does not move focus on the initial mount (no deliberate navigation yet)', () => {
    render(<LessonFlow steps={makeSteps(2)} />)

    expect(headingOf(1)).not.toHaveFocus()
  })

  it('focuses the new step heading when the pager advances', async () => {
    const user = userEvent.setup()
    render(<LessonFlow steps={makeSteps(2)} />)

    await user.click(screen.getByRole('button', { name: /التالي/ }))

    expect(headingOf(2)).toHaveFocus()
  })

  it('focuses the selected step heading when navigating from the outline', async () => {
    const user = userEvent.setup()
    render(<LessonFlow steps={makeSteps(3)} />)

    await user.click(screen.getByRole('button', { name: /الخطوة التجريبية 3/ }))

    expect(headingOf(3)).toHaveFocus()
  })

  it('moves focus within the navigation commit, never on a later animation frame', async () => {
    // Regression guard for the CI flake: if the focus move is ever deferred to
    // requestAnimationFrame again, the mocked (never-invoked) frame callback would
    // hold it and this assertion would fail.
    const raf = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(() => 0) // capture-only: callbacks are never invoked
    try {
      const user = userEvent.setup()
      render(<LessonFlow steps={makeSteps(2)} />)

      await user.click(screen.getByRole('button', { name: /التالي/ }))

      expect(headingOf(2)).toHaveFocus()
    } finally {
      raf.mockRestore()
    }
  })
})

describe('LessonFlow — optional controllerRef (opt-in in-content navigation)', () => {
  it('navigates to a step by id exactly like the outline, and ignores unknown ids', async () => {
    const controllerRef = createRef<LessonFlowController | null>()
    function JumpStep() {
      return <button type="button" onClick={() => controllerRef.current?.goToStep('step-2')}>العودة إلى الخطوة الثانية</button>
    }
    const steps = makeSteps(3)
    steps[2] = { ...steps[2], render: () => <JumpStep /> }
    const user = userEvent.setup()
    render(<LessonFlow steps={steps} controllerRef={controllerRef} />)

    expect(controllerRef.current).not.toBeNull()
    let result = true
    act(() => { result = controllerRef.current!.goToStep('no-such-step') })
    expect(result).toBe(false)
    expect(headingOf(1)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /الخطوة التجريبية 3/ }))
    await user.click(screen.getByRole('button', { name: 'العودة إلى الخطوة الثانية' }))

    expect(document.querySelectorAll('.lesson-step')).toHaveLength(1)
    expect(headingOf(2)).toHaveFocus()
    expect(screen.getByText('محتوى الخطوة 2')).toBeInTheDocument()
  })

  it('releases the controller on unmount, and lessons without controllerRef are unaffected', () => {
    const controllerRef = createRef<LessonFlowController | null>()
    const { unmount } = render(<LessonFlow steps={makeSteps(2)} controllerRef={controllerRef} />)
    expect(controllerRef.current).not.toBeNull()
    unmount()
    expect(controllerRef.current).toBeNull()

    render(<LessonFlow steps={makeSteps(2)} />)
    expect(headingOf(1)).toBeInTheDocument()
    expect(headingOf(1)).not.toHaveFocus()
  })
})
