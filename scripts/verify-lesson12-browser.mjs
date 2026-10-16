/** Optional production-browser audit; no new application dependency.
 * Install playwright, @sparticuz/chromium and axe-core in an external BROWSER_TOOLS
 * directory, start `npm run preview -- --host 0.0.0.0 --port 4173`, then:
 * BROWSER_TOOLS=/path/to/tools node scripts/verify-lesson12-browser.mjs
 * Screenshots and the JSON report go outside Git via BROWSER_OUTPUT.
 */
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const require = createRequire(join(process.env.BROWSER_TOOLS ?? process.cwd(), 'package.json'))
const { chromium: playwright } = require('playwright')
const chromiumModule = require.resolve('@sparticuz/chromium')
const { default: chromium } = await import(pathToFileURL(chromiumModule))
// This sandbox lacks system NSS/NSPR libraries. Use the browser package's bundled
// libraries, without installing system packages or modifying the application.
const { inflate } = await import(pathToFileURL(join(dirname(chromiumModule), 'lambdafs.js')))
const lib = await inflate(join(dirname(chromiumModule), '../bin/al2023.tar.br'))
let browser
const output = process.env.BROWSER_OUTPUT ?? '/home/user/lesson12-browser'
mkdirSync(output, { recursive: true })
const report = { browser: '', viewports: [], errors: [], accessibility: [] }
const password = readFileSync('src/shared/teacher/teacherPassword.ts', 'utf8').match(/COURSE_TEACHER_PASSWORD = '([^']+)'/)[1]
const url = process.env.BROWSER_URL ?? 'http://127.0.0.1:4173/Arabic-Course/'
const challengeKeys = ['مهندسانِ', 'ـَيْنِ', 'معلّمونَ', 'ينَ', 'ممرضاتٌ', 'الكسرة نيابةً عن الفتحة', 'رجال', 'الألف']
const examKeys = ['مثنّى', 'جمع مذكر سالم', 'جمع مؤنث سالم', 'جمع تكسير', 'مثنّى', 'الألف', 'الياء', 'الياء', 'الضمة', 'الكسرة نيابةً عن الفتحة', null, null, null, 'رأيتُ الطالبَيْنِ.', 'نجحَ المجتهدونَ.', 'كرّمتُ المتفوّقاتِ.']
try {
  for (const width of [390, 1280]) {
    browser = await playwright.launch({ executablePath: await chromium.executablePath(), args: chromium.args.filter((arg) => arg !== '--single-process'), headless: true, env: { ...process.env, LD_LIBRARY_PATH: `${lib}/lib:${process.env.LD_LIBRARY_PATH ?? ''}` } })
    report.browser = browser.version()
    const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 900 } })
    page.on('pageerror', (error) => report.errors.push({ width, message: error.message }))
    await page.goto(`${url}#/sections/basics-grammar`)
    await page.getByRole('link', { name: 'المثنّى وجمع المذكر السالم وجمع المؤنث السالم', exact: true }).click()
    await page.locator('.twelve-hero').waitFor()
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') })
    const viewport = { width, height: width === 390 ? 844 : 900, steps: [], states: [] }
    report.viewports.push(viewport)
    async function jump(number) {
      if (width === 390) await page.getByRole('button', { name: 'عرض فهرس خطوات الدرس' }).click()
      const outline = page.getByRole('navigation', { name: 'فهرس خطوات الدرس', exact: true })
      await outline.getByRole('button', { name: new RegExp(`^الخطوة ${number}:`) }).click()
      await page.locator('.lesson-step h2').waitFor()
    }
    async function audit(state, screenshot = false) {
      // Let finite shared step/drawer transitions finish before contrast sampling.
      await page.evaluate(async () => {
        await Promise.all(document.getAnimations().filter((a) => a.effect?.getComputedTiming().iterations !== Infinity).map((a) => a.finished.catch(() => {})))
      })
      const layout = await page.evaluate(() => ({
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        clipped: [...document.querySelectorAll('.lesson-step__body p, .twelve-table caption, .twelve-table td, .twelve-table th, .test-question legend, .test-field--choice label')]
          .filter((el) => !el.closest('.twelve-table thead') && el.getClientRects().length && el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 2)
          .map((el) => el.textContent.slice(0, 80)),
      }))
      assert(layout.scrollWidth <= width + 1, `${width} horizontal overflow: ${state}`)
      assert.deepEqual(layout.clipped, [], `${width} clipped text: ${state}`)
      viewport.states.push({ state, ...layout })
      const axe = await page.evaluate(async () => {
        const { violations, incomplete } = await window.axe.run('.lesson-step__body', { preload: false, runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })
        return { violations: violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => n.target) })), incomplete: incomplete.map((v) => v.id) }
      })
      report.accessibility.push({ width, state, ...axe })
      if (screenshot) await page.screenshot({ path: join(output, `${width}-${state}.png`), fullPage: true, animations: 'disabled', timeout: 90000 })
    }
    for (let step = 1; step <= 25; step++) {
      await jump(step)
      viewport.steps.push(await page.locator('.lesson-step h2').innerText())
      await audit(`step-${step}`, [1, 11, 12, 15, 17].includes(step))
    }
    await jump(15)
    for (let i = 0; i < challengeKeys.length; i++) await page.getByTestId(`test-question-twelve-challenge-${i + 1}`).getByRole('radio', { name: challengeKeys[i], exact: true }).check()
    assert.equal(await page.locator('[data-testid^="test-feedback-"]').count(), 0)
    await page.getByRole('button', { name: 'تحقّق من الإجابات', exact: true }).click()
    assert.match(await page.getByTestId('twelve-challenge-progress').innerText(), /8 \/ 8/)
    assert.equal(await page.locator('[data-testid^="test-feedback-"]').count(), 8)
    await audit('challenge-correct', true)
    await page.getByTestId('test-question-twelve-challenge-1').getByRole('radio', { name: 'مهندسونَ', exact: true }).check()
    assert.equal(await page.locator('[data-testid^="test-feedback-"]').count(), 0)
    await page.getByRole('button', { name: 'تحقّق من الإجابات', exact: true }).click()
    assert.match(await page.getByTestId('twelve-challenge-progress').innerText(), /7 \/ 8/)
    await audit('challenge-retry', true)
    await page.getByRole('button', { name: 'إعادة محاولة التحدّي' }).click()
    assert.equal(await page.locator('input:checked').count(), 0)
    for (const [step, first, last] of [[16, 1, 5], [17, 6, 10], [18, 11, 13], [19, 14, 16]]) {
      await jump(step)
      for (let i = first; i <= last; i++) {
        const q = page.getByTestId(`test-question-twelve-exam-${i}`)
        if (examKeys[i - 1] === null) await q.getByRole('textbox').fill('تحليل مكتوب يراجعه المعلم')
        else await q.getByRole('radio', { name: examKeys[i - 1], exact: true }).check()
      }
      await page.getByRole('button', { name: 'تحقّق من الإجابات', exact: true }).click()
      assert.equal(await page.locator('[data-testid^="test-feedback-"]').count(), 0)
      assert.equal(await page.locator('[data-testid^="test-page-summary-"]').count(), 0)
    }
    await jump(21)
    assert(await page.getByRole('button', { name: 'كشف نموذج الإجابة' }).isDisabled())
    assert.equal(await page.locator('.solution-item').count(), 0)
    await jump(20)
    await page.getByRole('button', { name: 'تسليم الاختبار', exact: true }).click()
    assert.match(await page.getByTestId('twelve-result').innerText(), /13 \/ 13/)
    await audit('exam-result', true)
    await jump(21)
    assert.equal(await page.locator('.solution-item').count(), 0)
    await page.getByRole('button', { name: 'كشف نموذج الإجابة' }).click()
    assert.equal(await page.locator('.solution-item').count(), 16)
    await audit('exam-solutions', true)
    await jump(16)
    await page.getByTestId('test-question-twelve-exam-1').getByRole('radio', { name: 'جمع تكسير', exact: true }).check()
    await jump(21)
    assert.equal(await page.locator('.solution-item').count(), 0)
    await jump(16)
    await page.getByRole('button', { name: 'تحقّق من الإجابات', exact: true }).click()
    await jump(20)
    await page.getByRole('button', { name: 'تسليم الاختبار', exact: true }).click()
    assert.match(await page.getByTestId('twelve-result').innerText(), /12 \/ 13/)
    await page.getByRole('button', { name: 'إعادة ضبط الاختبار' }).click()
    assert(await page.getByRole('button', { name: 'تسليم الاختبار', exact: true }).isDisabled())
    await jump(22)
    assert.equal(await page.getByTestId('twelve-homework-answers').count(), 0)
    await page.getByRole('button', { name: 'عرض الحلول النموذجية' }).click()
    await page.getByTestId('twelve-homework-answers').waitFor()
    await audit('homework-solutions', true)
    await jump(24)
    assert.equal(await page.getByTestId('twelve-teacher-guide').count(), 0)
    await page.getByLabel('كلمة المرور', { exact: true }).fill(password)
    await page.getByRole('button', { name: 'دخول', exact: true }).click()
    await page.getByTestId('twelve-teacher-guide').waitFor()
    assert.equal(await page.locator('.solution-item').count(), 24)
    await audit('teacher-unlocked')
    await page.getByRole('button', { name: 'إغلاق المساحة' }).click()
    await jump(25)
    await page.getByRole('button', { name: 'إتمام الدرس' }).click()
    assert.equal(new URL(page.url()).hash, '#/sections/basics-grammar')
    await browser.close()

  }
  assert.equal(report.errors.length, 0)
  writeFileSync(join(output, 'report.json'), JSON.stringify(report, null, 2))
  const violations = report.accessibility.filter((s) => s.violations.length)
  console.log(JSON.stringify({ browser: report.browser, viewports: report.viewports.map((v) => ({ width: v.width, steps: v.steps.length, states: v.states.length })), runtimeErrors: report.errors, axeStatesWithViolations: violations, axeIncomplete: report.accessibility.filter((s) => s.incomplete.length).map((s) => ({ width: s.width, state: s.state, rules: s.incomplete })), output }, null, 2))
  assert.equal(violations.length, 0, 'Accessibility violations — see report')
} finally {
  await browser?.close()
}
