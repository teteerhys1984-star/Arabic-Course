import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from '../../app/App'
import { LessonSpellingNine } from '../LessonSpellingNine'
import { COURSE_TEACHER_PASSWORD } from '../../shared/teacher/teacherPassword'
import { practice, quiz, homework, sections, testDefinition } from './content'
function jump(title: string) {
  return within(screen.getByRole('complementary', {name:'فهرس الدرس الجانبي'})).getByRole('button', {name: n=>n.includes(title)})
}
beforeEach(()=>{window.location.hash='#/'})
describe('spelling 09 shared lesson flow',()=>{
  it('opens from ordered index, has 24 steps and six groups, and no broken tenth route',async()=>{
    const user=userEvent.setup(); window.location.hash='#/sections/spelling'
    const {unmount}=render(<App />)
    const links=within(screen.getByRole('list',{name:'دروس القسم'})).getAllByRole('link')
    expect(links).toHaveLength(11)
    await user.click(links[8]); expect(window.location.hash).toBe('#/lesson/spelling-lesson-09')
    expect(document.querySelector('.spell9-lesson')).toHaveAttribute('dir','rtl')
    const outline=screen.getByRole('complementary',{name:'فهرس الدرس الجانبي'})
    expect(within(outline).getAllByRole('button')).toHaveLength(24)
    expect(outline.querySelectorAll('.lesson-outline__group')).toHaveLength(6)
    for (const s of sections.filter(s=>!['memory','summary'].includes(s.id))) {
      await user.click(jump(s.title)); expect(screen.getByText(s.paragraphs[0])).toBeInTheDocument()
    }
    await user.click(jump('جدول المقارنة'))
    expect(screen.getByRole('table')).toBeInTheDocument(); expect(screen.getAllByRole('columnheader')).toHaveLength(4)
    await user.click(jump('الخلاصة والقاعدة'))
    expect(document.querySelector('.lesson-step')!.querySelector('a[href*="spelling-lesson-12"]')).toBeNull()
    unmount(); window.location.hash='#/lesson/spelling-lesson-12'; render(<App />)
    expect(screen.getByRole('heading',{name:'الدرس غير متاح'})).toBeInTheDocument()
  })
  it('uses keyboard-compatible shared practice and quiz with explanations only after checking; persists each independently',async()=>{
    const user=userEvent.setup();render(<LessonSpellingNine />)
    for (const [title,items,prefix] of [['تدريب تفاعلي:',practice,'spell9-practice'],['الاختبار الختامي التعليمي:',quiz,'spell9-quiz']] as const) {
      await user.click(jump(title))
      expect(screen.queryByText(items[0].explanation)).not.toBeInTheDocument()
      for (const q of items) {
        const radio=within(screen.getByTestId(`${prefix}-${q.id}`)).getByRole('radio',{name:q.answer})
        radio.focus(); await user.keyboard(' ')
      }
      expect(screen.queryByText(items[0].explanation)).not.toBeInTheDocument()
      await user.click(screen.getByRole('button',{name:'تحقّق من الإجابات'}))
      for(const q of items) expect(screen.getByTestId(`test-feedback-${q.id}`)).toHaveTextContent(q.explanation)
    }
    await user.click(jump('تدريب تفاعلي:'))
    expect(within(screen.getByTestId(`spell9-practice-${practice[0].id}`)).getByRole('radio',{name:practice[0].answer})).toBeChecked()
    await user.click(jump('حلول الاختبارات')); expect(screen.queryByText(testDefinition.pages[0].questions[0].explanation!)).not.toBeInTheDocument()
  })
  it('retains homework answer and reason separately without premature models, and teacher has all 28 detailed models',async()=>{
    const user=userEvent.setup();render(<LessonSpellingNine />)
    await user.click(jump('الواجب المنزلي:'))
    expect(screen.getAllByRole('textbox')).toHaveLength(20)
    await user.type(screen.getAllByRole('textbox')[0],'نجحوا')
    await user.type(screen.getAllByRole('textbox')[1],'واو الجماعة في الماضي')
    expect(screen.queryByText(homework[0].explanation)).not.toBeInTheDocument()
    await user.click(jump('الخلاصة والقاعدة')); await user.click(jump('الواجب المنزلي:'))
    expect(screen.getAllByRole('textbox')[0]).toHaveValue('نجحوا')
    expect(screen.getAllByRole('textbox')[1]).toHaveValue('واو الجماعة في الماضي')
    await user.click(jump('منطقة المعلم'))
    expect(screen.queryByTestId('spell9-teacher')).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('كلمة المرور'),COURSE_TEACHER_PASSWORD)
    await user.click(screen.getByRole('button',{name:'دخول'}))
    for(const q of [...practice,...quiz,...homework]) expect(within(screen.getByTestId('spell9-teacher')).getByText(q.explanation)).toBeInTheDocument()
    expect(within(screen.getByTestId('spell9-teacher')).queryByText(testDefinition.pages[0].questions[0].explanation!)).not.toBeInTheDocument()
    expect(screen.getByRole('link',{name:'تنزيل سجل المصدر'})).toHaveAttribute('download')
  })
  it('checks four pages without exposure, submits 20/20, invalidates edited result, recomputes 19/20, and resets',async()=>{
    const user=userEvent.setup();render(<LessonSpellingNine />)
    await user.click(jump('تسليم الاختبار والنتيجة'))
    expect(screen.getByRole('button',{name:'تسليم الاختبار'})).toBeDisabled()
    for(const [i,page] of testDefinition.pages.entries()) {
      await user.click(jump(`اختبار: صفحة ${i+1}`))
      for(const q of page.questions) {
        const f=q.fields[0];if(f.kind!=='choice')throw Error('choice')
        await user.click(within(screen.getByTestId(`spell9-question-${q.id}`)).getByRole('radio',{name:f.answer}))
      }
      await user.click(screen.getByRole('button',{name:'تحقّق من الإجابات'}))
      expect(screen.queryByTestId(`test-page-summary-${page.id}`)).not.toBeInTheDocument()
      expect(screen.queryByTestId(`test-feedback-${page.questions[0].id}`)).not.toBeInTheDocument()
    }
    const first=testDefinition.pages[0].questions[0]
    await user.click(jump('حلول الاختبارات')); expect(screen.queryByText(first.explanation!)).not.toBeInTheDocument()
    await user.click(jump('تسليم الاختبار والنتيجة'))
    expect(screen.queryByTestId('spell9-result')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button',{name:'تسليم الاختبار'}))
    expect(screen.getByTestId('spell9-result')).toHaveTextContent('النتيجة: 20 من 20')
    await user.click(jump('حلول الاختبارات'))
    for(const page of testDefinition.pages) for(const q of page.questions) expect(screen.getByText(q.explanation!)).toBeInTheDocument()
    await user.click(jump('اختبار: صفحة 1'))
    const f=first.fields[0];if(f.kind!=='choice')throw Error('choice')
    const card=screen.getByTestId(`spell9-question-${first.id}`)
    expect(within(card).getByRole('radio',{name:f.answer})).toBeChecked()
    await user.click(within(card).getByRole('radio',{name:f.options.find(o=>o!==f.answer)!}))
    await user.click(jump('حلول الاختبارات')); expect(screen.queryByText(first.explanation!)).not.toBeInTheDocument()
    await user.click(jump('اختبار: صفحة 1')); await user.click(screen.getByRole('button',{name:'تحقّق من الإجابات'}))
    await user.click(jump('تسليم الاختبار والنتيجة')); await user.click(screen.getByRole('button',{name:'تسليم الاختبار'}))
    expect(screen.getByTestId('spell9-result')).toHaveTextContent('النتيجة: 19 من 20')
    await user.click(screen.getByRole('button',{name:'إعادة الاختبار'}))
    expect(screen.queryByTestId('spell9-result')).not.toBeInTheDocument()
    expect(screen.getByRole('button',{name:'تسليم الاختبار'})).toBeDisabled()
  })
})
