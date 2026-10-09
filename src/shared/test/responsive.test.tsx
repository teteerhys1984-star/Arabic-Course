import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { TestRunner } from './components/TestRunner'
import type { TestDefinition } from './types'

/**
 * Desktop + mobile behaviour of the shared test framework.
 *
 * jsdom has no layout engine, so the responsive STYLE rules are validated
 * statically by `npm run check:test-ux`; here the interaction itself is
 * asserted to work through accessible names and roles only — i.e. it does not
 * depend on pointer size, hover, or a wide viewport, so it behaves the same on
 * a phone and on a desktop.
 */

const test: TestDefinition = {
  id: 'responsive-test',
  title: 'اختبار الاستجابة',
  pages: [
    {
      id: 'p1',
      title: 'الصفحة الأولى',
      questions: [
        { id: 'q1', number: 1, prompt: 'سؤال', fields: [{ kind: 'choice', options: ['أ', 'ب'], answer: 'ب' }], solution: 'ب' },
      ],
    },
    {
      id: 'p2',
      title: 'الصفحة الثانية',
      questions: [
        { id: 'q2', number: 2, prompt: 'سؤال آخر', fields: [{ kind: 'text', accept: ['كتب'] }], solution: 'كتب' },
      ],
    },
  ],
}

describe('shared test framework — desktop and mobile', () => {
  it('keeps the test controls reachable by accessible name alone (no hover, no wide viewport)', async () => {
    const user = userEvent.setup()
    render(<TestRunner test={test} />)

    // The page-level action is a real button with a stable accessible name.
    const check = screen.getByRole('button', { name: 'تحقّق من الإجابات' })
    expect(check).toBeEnabled()

    // The page navigation is reachable as buttons too (tap targets, not hover menus).
    const runner = screen.getByTestId('test-runner-responsive-test')
    expect(within(runner).getByRole('button', { name: /الصفحة الأولى/ })).toBeInTheDocument()
    expect(within(runner).getByRole('button', { name: /الصفحة بعدها/ })).toBeInTheDocument()

    // Answering and checking work through the keyboard/pointer-agnostic API.
    await user.click(screen.getByLabelText('ب'))
    await user.click(check)
    expect(screen.getByTestId('test-page-summary-p1')).toHaveTextContent('1 صحيحة')
  })

  it('isolates numbers with <bdi> so RTL never reorders the score', async () => {
    const user = userEvent.setup()
    const { container } = render(<TestRunner test={test} />)
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    const summary = screen.getByTestId('test-page-summary-p1')
    expect(summary.querySelectorAll('bdi').length).toBeGreaterThanOrEqual(3)
    // The intro counts are isolated as well.
    expect(container.querySelector('.official-test__intro bdi')).not.toBeNull()
  })
})
