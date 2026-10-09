import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LessonFlow, type LessonStepDefinition } from './LessonFlow'

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
