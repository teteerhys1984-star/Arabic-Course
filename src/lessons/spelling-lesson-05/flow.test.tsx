import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from '../../app/App'
import { COURSE_TEACHER_PASSWORD } from '../../shared/teacher/teacherPassword'
import sourceMarkdown from '../../../docs/source/spelling-lesson-05.md?raw'
import * as C from './content'
import {
  EXAM_ANSWERS, NOUN_ORIGIN_KEYS, ORIGINAL_ANSWERS, PARTICLE_KEYS, PRACTICE_KEYS, TREE_KEYS, VERB_KEYS,
} from './test-fixtures'

const S = C.sourceContent
const questions = C.testDefinition.pages.flatMap((page) => page.questions)
const originalQuestions = C.originalFinalTest.pages[0].questions
const TEACHING_STEPS = 23
const TOTAL_STEPS = 30

type User = ReturnType<typeof userEvent.setup>
const openStep = (name: string) =>
  within(screen.getByRole('complementary', { name: 'فهرس الدرس الجانبي' })).getByRole('button', { name: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })
function openLesson() {
  window.location.hash = '#/lesson/spelling-lesson-05'
  return render(<App />)
}
const activeStep = () => document.querySelector('.lesson-step') as HTMLElement

function noExamDisclosure() {
  expect(
    document.querySelectorAll(
      '[data-testid^="test-feedback-"], [data-testid^="test-page-summary-"], [data-testid^="solution-spell5-q"], .test-question__correct, .test-question__status',
    ),
  ).toHaveLength(0)
  expect(screen.queryByTestId('spell5-final-result')).not.toBeInTheDocument()
  const html = document.body.innerHTML
  for (const q of questions) {
    // القاعدة العامة القابلة للنقل قد تطابق نص الشرح نفسه عمدًا؛ المفتاح المحمي هو التفسير الخاص بالسؤال.
    expect(html).not.toContain(q.explanation)
  }
}
function noOriginalDisclosure() {
  expect(document.querySelectorAll('[data-testid^="solution-spell5-of"]')).toHaveLength(0)
  const html = document.body.innerHTML
  for (const q of originalQuestions) expect(html).not.toContain(q.explanation)
}

async function answerPage(user: User, pageIndex: number) {
  const page = C.testDefinition.pages[pageIndex]
  await user.click(openStep(page.title))
  for (const question of page.questions) {
    const fieldset = screen.getByTestId(`spell5-question-${question.id}`)
    const values = EXAM_ANSWERS[`${question.id}:0`]
    if (question.fields[0].kind === 'choice') await user.click(within(fieldset).getByRole('radio', { name: values[0] }))
    else for (const value of values) await user.click(within(fieldset).getByRole('checkbox', { name: value }))
  }
}

describe('spelling 5 — التسجيل والمسار وعرض المصدر', () => {
  it('يظهر بعد الدرس الرابع في قسم الإملاء، ويُفتح برابط ثابت ويعود إلى القسم', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/sections/spelling'
    render(<App />)
    const links = within(screen.getByRole('list', { name: 'دروس القسم' })).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      Array.from({ length: 5 }, (_, index) => `#/lesson/spelling-lesson-0${index + 1}`),
    )
    await user.click(links[4])
    expect(await screen.findByRole('heading', { name: S.warmup.heading, level: 2 })).toBeInTheDocument()
    expect(window.location.hash).toBe('#/lesson/spelling-lesson-05')
    expect(document.querySelector('.lesson-page')).toHaveAttribute('dir', 'rtl')
    expect(document.title).toContain('الدرس الخامس: الألف اللينة في آخر الكلمة')
    expect(within(screen.getByRole('navigation', { name: 'مسار التنقل' })).getByRole('link', { name: 'الإملاء' })).toHaveAttribute('href', '#/sections/spelling')
    expect(document.querySelectorAll('.lesson-step')).toHaveLength(1)
    expect(document.querySelector('.lesson-flow__progress')).toHaveTextContent(`الخطوة 1 من ${TOTAL_STEPS}`)
    expect(screen.getByRole('button', { name: 'السابق' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'التالي' }))
    expect(activeStep()).toHaveAttribute('id', 'spell5-layyina')
    expect(within(activeStep()).getByRole('heading', { level: 2 })).toHaveFocus()
    await user.click(openStep('منطقة خاصة بالمعلم'))
    await user.click(screen.getByRole('button', { name: 'إتمام الدرس' }))
    expect(await screen.findByRole('heading', { name: 'الإملاء', level: 1 })).toBeInTheDocument()
    expect(window.location.hash).toBe('#/sections/spelling')
  })

  it('يعرض كل سطر وخلية من المصدر في خطوات التدريس المُصيَّرة، دون كشف أي مفتاح اختبار', async () => {
    const user = userEvent.setup()
    openLesson()
    const chunks: string[] = []
    for (let index = 0; index < TEACHING_STEPS; index++) {
      expect(document.querySelectorAll('.lesson-step')).toHaveLength(1)
      if (index === 0) {
        expect(screen.queryByTestId('spell5-table-warmup')).not.toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: 'اكشف الشكل الصحيح' }))
      }
      chunks.push(activeStep().textContent ?? '')
      noExamDisclosure()
      noOriginalDisclosure()
      if (index < TEACHING_STEPS - 1) await user.click(screen.getByRole('button', { name: 'التالي' }))
    }
    expect(activeStep()).toHaveAttribute('id', 'spell5-homework')
    const text = chunks.join('\n').replace(/\s+/g, ' ')
    const body = sourceMarkdown.slice(sourceMarkdown.indexOf('-->') + 3)
    const cells = body.split('\n').flatMap((line) => {
      const trimmed = line.trim()
      if (!trimmed) return []
      if (/^\|[-:\s|]+\|$/.test(trimmed)) return []
      if (trimmed.startsWith('|')) return trimmed.split('|').map((cell) => cell.trim()).filter(Boolean)
      return [trimmed.replace(/^#+\s*/, '').replace(/^(?:- |\d+\. )/, '')]
    })
    expect(cells).toHaveLength(282)
    const missing = cells.filter((cell) => !text.includes(cell.replace(/\s+/g, ' ').trim().replace(/[.«»]$/u, '')))
    expect(missing, `Missing rendered source content:\n${missing.join('\n')}`).toEqual([])
  }, 60_000)

  it('يعرض الجداول المحورية بعناوين محددة النطاق وقابلة للتمرير', async () => {
    const user = userEvent.setup()
    openLesson()
    const tables: Array<[string, string, number]> = [
      [S.nouns.tableHeading, 'spell5-table-nouns', 5],
      [S.nouns.tableHeading, 'spell5-table-nouns-verified', 7],
      ['الأفعال — القاعدة الأولى', 'spell5-table-verbs', 6],
      ['الأفعال — القاعدة الثانية', 'spell5-table-verbs-compare', 4],
      ['الأفعال — القاعدة الثانية', 'spell5-table-verbs-count', 8],
      [S.mistakes.heading, 'spell5-table-mistakes', 4],
    ]
    for (const [stepName, testId, rows] of tables) {
      await user.click(openStep(stepName))
      const table = screen.getByTestId(testId)
      expect(table.querySelectorAll('tbody tr')).toHaveLength(rows)
      expect(table.querySelectorAll('th[scope="row"]')).toHaveLength(rows)
      expect(table.closest('[role="region"]')).toHaveAttribute('tabindex', '0')
    }
    await user.click(openStep(S.nouns.tableHeading))
    const verified = screen.getByTestId('spell5-table-nouns-verified')
    expect(within(verified).getAllByText('يحتاج إلى معجم أو حفظ')).toHaveLength(2)
    await user.click(openStep('الأفعال — القاعدة الأولى'))
    const saa = screen.getByTestId('spell5-table-verbs').querySelectorAll('tbody tr')[3]
    expect(saa).toHaveTextContent('دليل من صيغة أخرى')
    expect(saa).toHaveTextContent('سَعَيْتُ')
    expect(screen.getByTestId('spell5-correction-ت-٤')).toBeInTheDocument()
  })

  it('يرفض الرابط المباشر لدرس سادس غير موجود', () => {
    window.location.hash = '#/lesson/spelling-lesson-06'
    render(<App />)
    expect(screen.getByRole('heading', { name: 'الدرس غير متاح' })).toBeInTheDocument()
  })
})

describe('spelling 5 — الأنشطة بلوحة المفاتيح مع إعادة المحاولة', () => {
  it('التمهيد: توقّع ثم كشف، والإعادة تخفي الشكل', async () => {
    const user = userEvent.setup()
    openLesson()
    const tile = screen.getByTestId('spell5-tile-asa')
    expect(tile).not.toHaveTextContent('عصوان')
    const guess = within(tile).getByRole('button', { name: /ألف مقصورة/ })
    guess.focus()
    await user.keyboard('{Enter}')
    expect(guess).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'اكشف الشكل الصحيح' }))
    expect(tile).toHaveTextContent('توقّعك مختلف')
    expect(tile).toHaveTextContent('عَصَوان')
    await user.click(screen.getByRole('button', { name: 'أعد التوقّع' }))
    expect(screen.queryByTestId('spell5-table-warmup')).not.toBeInTheDocument()
  })

  it('مختبر ا/ى/ي: تغذية راجعة تعلل الخيار المختار والصحيح، والتغيير يخفيها، والإعادة تمسح', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('مختبر: ا أم ى أم ي؟'))
    const lab = screen.getByTestId('spell5-lab-glyphs')
    const card = screen.getByTestId('spell5-practice-g-kursi')
    const check = within(card).getByRole('button', { name: 'تحقق من الإجابة' })
    expect(check).toBeDisabled()
    await user.click(within(card).getByRole('radio', { name: 'ألف مقصورة' }))
    check.focus()
    await user.keyboard('{Enter}')
    expect(within(card).getByRole('status')).toHaveTextContent('تحتاج الإجابة إلى مراجعة')
    expect(within(card).getByRole('status')).toHaveTextContent('ولماذا الصحيح صحيح؟')
    await user.click(within(card).getByRole('radio', { name: 'ياء' }))
    expect(within(card).queryByRole('status')).not.toBeInTheDocument()
    await user.click(check)
    expect(within(card).getByRole('status')).toHaveTextContent('إجابة صحيحة')
    await user.click(within(lab).getByRole('button', { name: 'إعادة النشاط' }))
    for (const radio of within(lab).getAllByRole('radio')) expect(radio).not.toBeChecked()
    noExamDisclosure()
  })

  it('مختبر أصل الأسماء: مراحل متتابعة، والخطأ لا ينقل، ثم السلسلة الكاملة', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('مختبر أصل الألف في الأسماء'))
    const lab = screen.getByTestId('spell5-lab-noun-origin')
    for (const word of C.nounOriginLab) {
      await user.click(within(lab).getByRole('button', { name: new RegExp(word.word.replace('؟', '\\؟')) }))
      for (const [index, stage] of word.stages.entries()) {
        const li = screen.getByTestId(`spell5-lab-noun-origin-stage-${word.id}-${stage.id}`)
        if (index === 0) {
          const wrong = stage.options.find((o) => o.value !== stage.answer)!
          await user.click(within(li).getByRole('radio', { name: new RegExp(`^${wrong.value}`) }))
          await user.click(within(li).getByRole('button', { name: 'تحقق من هذه المرحلة' }))
          expect(within(li).getByRole('status')).toHaveTextContent('أعد المحاولة')
        }
        const key = NOUN_ORIGIN_KEYS[word.id][index]
        await user.click(within(li).getByRole('radio', { name: new RegExp(`^${key}`) }))
        await user.click(within(li).getByRole('button', { name: 'تحقق من هذه المرحلة' }))
      }
      expect(screen.getByTestId('spell5-lab-noun-origin-result')).toHaveTextContent(word.chain)
    }
    await user.click(within(lab).getByRole('button', { name: 'إعادة المختبر' }))
    expect(screen.queryByTestId('spell5-lab-noun-origin-result')).not.toBeInTheDocument()
  }, 30_000)

  it('مختبر الأفعال: «سعى» تتطلب صيغة بديلة بعد «لا يكشف»', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('مختبر من الماضي إلى المضارع'))
    const lab = screen.getByTestId('spell5-lab-verb')
    for (const word of C.verbPresentLab) {
      await user.click(within(lab).getByRole('button', { name: new RegExp(word.word.replace('؟', '\\؟')) }))
      for (const [index, stage] of word.stages.entries()) {
        const li = screen.getByTestId(`spell5-lab-verb-stage-${word.id}-${stage.id}`)
        await user.click(within(li).getByRole('radio', { name: new RegExp(`^${VERB_KEYS[word.id][index]}`) }))
        await user.click(within(li).getByRole('button', { name: 'تحقق من هذه المرحلة' }))
      }
      expect(screen.getByTestId('spell5-lab-verb-result')).toHaveTextContent(word.chain)
    }
  }, 30_000)

  it('تصنيف الأسماء: يرفض الشكل الصحيح مع سبب خاطئ', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('مختبر تصنيف الأسماء غير الثلاثية'))
    const card = screen.getByTestId('spell5-practice-dawa')
    await user.click(within(card).getByRole('radio', { name: /ألف مقصورة/ }))
    await user.selectOptions(within(card).getByRole('combobox', { name: 'دعو؟ — السبب' }), 'أكثر من ثلاثة أحرف وسبقت الألف ياء')
    await user.click(within(card).getByRole('button', { name: 'تحقق من الإجابة' }))
    expect(within(card).getByRole('status')).toHaveTextContent('الشكل صحيح، لكن السبب لا ينطبق')
    await user.selectOptions(within(card).getByRole('combobox', { name: 'دعو؟ — السبب' }), 'أكثر من ثلاثة أحرف ولم تسبق الألف ياء')
    await user.click(within(card).getByRole('button', { name: 'تحقق من الإجابة' }))
    expect(within(card).getByRole('status')).toHaveTextContent('إجابة صحيحة')
    expect(within(card).getByRole('status')).toHaveTextContent('والواو ليست ياءً')
  })

  it('فرز الحروف: النتيجة بعد التحقق فقط، والإعادة تمسح', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('مختبر فرز الحروف والأسماء المبنية'))
    for (const item of C.particleLab) {
      const row = screen.getByTestId(`spell5-particle-${item.id}`)
      await user.click(within(row).getByRole('button', { name: PARTICLE_KEYS[item.id] === 'ا' ? /ألف قائمة/ : /ألف مقصورة/ }))
    }
    expect(screen.queryByTestId('spell5-particles-score')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'تحقق من الفرز' }))
    expect(screen.getByTestId('spell5-particles-score')).toHaveTextContent('١١ من ١١')
    await user.click(within(screen.getByTestId('spell5-lab-particles')).getAllByRole('button', { name: 'إعادة النشاط' })[0])
    expect(screen.queryByTestId('spell5-particles-score')).not.toBeInTheDocument()
  })

  it('خريطة القرار: لكل كلمة مسارها، والخطأ يبقيك، والنتيجة تشرح المسارات المستبعدة', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep(S.map.heading))
    const tree = screen.getByTestId('spell5-lab-tree')
    for (const word of C.treeWords) {
      await user.click(within(within(tree).getByRole('group', { name: 'اختر كلمة لتمريرها في الخريطة' })).getByRole('button', { name: new RegExp(`^${word.word}`) }))
      const answers = word.type === 'حرف' ? [word.type, word.result] : word.count === 'ثلاثة' ? [word.type, word.count, word.origin!, word.result] : [word.type, word.count!, word.prevYa!, word.result]
      if (word.id === 'mustashfa') {
        await user.click(within(tree).getByRole('button', { name: 'فعل' }))
        expect(within(tree).getByRole('status')).toHaveTextContent('أعد المحاولة')
      }
      for (const answer of answers) {
        const group = within(tree).getAllByRole('group').at(-1)!
        const name = answer === 'ا' ? /ألف قائمة/ : answer === 'ى' ? /ألف مقصورة/ : new RegExp(`^${answer}$`)
        await user.click(within(group).getByRole('button', { name }))
      }
      expect(screen.getByTestId('spell5-tree-result')).toHaveTextContent('لماذا استُبعدت المسارات الأخرى؟')
      expect(TREE_KEYS[word.id]).toBe(word.result)
    }
  }, 30_000)

  it('مختبر بناء التفسير: يميّز الكتابة الصحيحة ذات التعليل الخاطئ', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('مختبر بناء التفسير'))
    const card = screen.getByTestId('spell5-practice-irtada')
    await user.click(within(card).getByRole('radio', { name: 'ارتضى' }))
    await user.click(within(card).getByRole('radio', { name: 'لأن أصل الألف ياء' }))
    await user.click(within(card).getByRole('button', { name: 'تحقق من الإجابة والسبب' }))
    expect(within(card).getByRole('status')).toHaveTextContent('الكتابة صحيحة، والتعليل يحتاج إلى مراجعة')
  })

  it('مختبر الأخطاء الجديدة يعرض الخطأ والصواب والقاعدة والدليل وسبب رفض البديل', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('مختبر تصحيح الأخطاء'))
    const card = screen.getByTestId('spell5-practice-saa')
    await user.click(within(card).getByRole('radio', { name: 'سعى' }))
    await user.click(within(card).getByRole('button', { name: 'تحقق من الإجابة' }))
    const status = within(card).getByRole('status')
    for (const label of ['الخطأ', 'الصواب', 'القاعدة', 'الدليل', 'لماذا البديل خطأ؟', 'كيف أتجنّبه؟']) expect(status).toHaveTextContent(label)
  })
})

describe('spelling 5 — تدريب المادة والاختبار الختامي الأصلي', () => {
  it('التدريب: تعليل لكل خيار بعد «تصحيح الإجابات»، والتعديل يخفي النتيجة، والإعادة تمسح', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep(S.practice.heading))
    for (const item of C.practiceQuestions) {
      const card = screen.getByTestId(`spell5-practice-${item.id}`)
      const value = item.id === 'p1' ? 'فتا' : PRACTICE_KEYS[item.id]
      await user.click(within(card).getByRole('radio', { name: value }))
      expect(within(card).queryByRole('status')).not.toBeInTheDocument()
    }
    await user.click(screen.getByRole('button', { name: S.practice.control }))
    expect(screen.getByTestId('spell5-practice-score')).toHaveTextContent('٦ / ٧')
    const first = screen.getByTestId('spell5-practice-p1')
    for (const option of C.practiceQuestions[0].options) expect(first).toHaveTextContent(option.explanation)
    expect(first).toHaveTextContent('(اختيارك)')
    await user.click(within(first).getByRole('radio', { name: 'فتى' }))
    expect(screen.queryByTestId('spell5-practice-score')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'إعادة التدريب' }))
    for (const radio of within(screen.getByTestId('spell5-practice')).getAllByRole('radio')) expect(radio).not.toBeChecked()
    noExamDisclosure()
  })

  it('الاختبار الختامي: لا كشف قبل الضغط، ثم إجابة الطالب والنموذجية والتعليل والقاعدة', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep(S.finalExam.heading))
    for (const q of originalQuestions) {
      const fieldset = screen.getByTestId(`spell5-original-${q.id}`)
      for (const [index, field] of q.fields.entries()) {
        const value = ORIGINAL_ANSWERS[`${q.id}:${index}`]?.[0]
        if (field.kind === 'choice') await user.click(within(fieldset).getByRole('radio', { name: value }))
        else if (field.kind === 'text') await user.type(within(fieldset).getByRole('textbox', { name: `${q.prompt} — ${field.label}` }), value)
        else if (field.kind === 'select') await user.selectOptions(within(fieldset).getByRole('combobox', { name: `${q.prompt} — ${field.label}` }), value)
        else if (field.kind === 'essay') await user.type(within(fieldset).getByRole('textbox', { name: `${q.prompt} — ${field.label}` }), 'تُنطق ألفًا ولا تقبل الحركة.')
      }
    }
    noOriginalDisclosure()
    await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
    noOriginalDisclosure()
    await user.click(screen.getByRole('button', { name: S.finalExam.control }))
    expect(screen.getByTestId('spell5-original-result')).toHaveTextContent('٨ / ٨')
    const solution = screen.getByTestId('solution-spell5-of3')
    expect(solution).toHaveTextContent('إجابتك:')
    expect(solution).toHaveTextContent('الإجابة الصحيحة:')
    expect(solution).toHaveTextContent('القاعدة:')
    expect(solution).toHaveTextContent('مثال إضافي:')
    await user.click(screen.getByRole('button', { name: 'إعادة الاختبار الختامي' }))
    noOriginalDisclosure()
    expect(screen.queryByTestId('spell5-original-result')).not.toBeInTheDocument()
  }, 30_000)
})

describe('spelling 5 — الاختبار المستقل (٢٠ سؤالًا)', () => {
  it('يحفظ صامتًا، ويسلّم ٢٠/٢٠، ويقفل عند التعديل، ويصفّر عند الإعادة', async () => {
    const user = userEvent.setup()
    openLesson()
    for (let index = 0; index < 4; index++) {
      await answerPage(user, index)
      noExamDisclosure()
      await user.click(screen.getByRole('button', { name: 'تحقّق من الإجابات' }))
      expect(screen.getByTestId(`test-page-saved-${C.testDefinition.pages[index].id}`)).toBeInTheDocument()
      noExamDisclosure()
    }
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('spell5-solutions-locked')).toBeInTheDocument()
    await user.click(openStep('تسليم الاختبار والنتيجة'))
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار وإظهار النتيجة' }))
    expect(screen.getByTestId('spell5-final-result')).toHaveTextContent('٢٠ / ٢٠')
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getAllByTestId(/^solution-spell5-q/)).toHaveLength(20)
    expect(screen.getAllByText(/^الصفحة/, { selector: '.solutions-area__group-title' })).toHaveLength(4)
    await user.click(openStep(C.testDefinition.pages[0].title))
    await user.click(within(screen.getByTestId('spell5-question-spell5-q01')).getByRole('radio', { name: 'هُدى' }))
    noExamDisclosure()
    await user.click(openStep('تسليم الاختبار والنتيجة'))
    await user.click(screen.getByRole('button', { name: 'تسليم الاختبار وإظهار النتيجة' }))
    expect(screen.getByTestId('spell5-final-result')).toHaveTextContent('١٩ / ٢٠')
    await user.click(screen.getByRole('button', { name: 'إعادة الاختبار' }))
    noExamDisclosure()
    await user.click(openStep('حلول الاختبار'))
    expect(screen.getByTestId('spell5-solutions-locked')).toBeInTheDocument()
  }, 60_000)
})

describe('spelling 5 — منطقة المعلم المحمية', () => {
  it('تبقى مقفلة حتى كلمة المرور، ثم تعرض الأقسام التسعة وكل المفاتيح', async () => {
    const user = userEvent.setup()
    openLesson()
    await user.click(openStep('منطقة خاصة بالمعلم'))
    expect(screen.queryByTestId('spell5-teacher-material')).not.toBeInTheDocument()
    noExamDisclosure()
    await user.type(screen.getByLabelText('كلمة المرور'), 'incorrect')
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    await user.clear(screen.getByLabelText('كلمة المرور'))
    await user.type(screen.getByLabelText('كلمة المرور'), COURSE_TEACHER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'دخول' }))
    const material = screen.getByTestId('spell5-teacher-material')
    const sections = material.querySelectorAll('details.spell5-teacher-section')
    expect(sections).toHaveLength(9)
    for (const section of sections) {
      await user.click(section.querySelector('summary')!)
      expect(section).toHaveAttribute('open')
    }
    for (const item of C.practiceQuestions) expect(screen.getByTestId(`spell5-teacher-${item.id}`)).toHaveTextContent(PRACTICE_KEYS[item.id])
    expect(within(screen.getByTestId('spell5-teacher-original')).getAllByTestId(/^solution-spell5-of/)).toHaveLength(8)
    expect(within(screen.getByTestId('spell5-teacher-test')).getAllByTestId(/^solution-spell5-q/)).toHaveLength(20)
    for (const task of [1, 2, 3, 4, 5, 6, 7]) expect(screen.getByTestId(`spell5-teacher-homework-${task}`)).toBeInTheDocument()
    expect(within(screen.getByTestId('spell5-table-teacher-corrections')).getAllByRole('row')).toHaveLength(10)
    expect(within(screen.getByTestId('spell5-table-teacher-errors')).getAllByRole('row')).toHaveLength(C.expectedErrors.length + 1)
    await user.click(screen.getByRole('button', { name: 'إغلاق المساحة' }))
    expect(screen.queryByTestId('spell5-teacher-material')).not.toBeInTheDocument()
  }, 30_000)
})
