import { useState, type ReactNode } from 'react'
import { EducationalCard } from '../shared/components/EducationalCard'
import { LessonFlow, type LessonStepDefinition } from '../shared/components/LessonFlow'
import { TeacherSpace } from '../shared/teacher/TeacherSpace'

interface Props {
  onProgressChange?: (value: number) => void
  onFinish?: () => void
}

type ActivityItem = {
  prompt: string
  answer: string
  options?: string[]
}

type FinalQuestion = {
  number: number
  section: string
  type: 'choice' | 'true-false' | 'identify' | 'complete' | 'parsing' | 'thinking'
  prompt: string
  options?: string[]
  answer: string
}

const finalQuestions: FinalQuestion[] = [
  {
    number: 1,
    section: 'السؤال الأول: اختر الإجابة الصحيحة',
    type: 'choice',
    prompt: 'العلامة الأصلية للرفع هي:',
    options: ['الفتحة', 'الضمة', 'الكسرة', 'السكون'],
    answer: 'ب. الضمة.',
  },
  {
    number: 2,
    section: 'السؤال الأول: اختر الإجابة الصحيحة',
    type: 'choice',
    prompt: 'العلامة الأصلية للنصب هي:',
    options: ['الفتحة', 'الكسرة', 'الضمة', 'السكون'],
    answer: 'أ. الفتحة.',
  },
  {
    number: 3,
    section: 'السؤال الأول: اختر الإجابة الصحيحة',
    type: 'choice',
    prompt: 'العلامة الأصلية للجر هي:',
    options: ['السكون', 'الضمة', 'الكسرة', 'الفتحة'],
    answer: 'ج. الكسرة.',
  },
  {
    number: 4,
    section: 'السؤال الأول: اختر الإجابة الصحيحة',
    type: 'choice',
    prompt: 'العلامة الأصلية للجزم هي:',
    options: ['الكسرة', 'السكون', 'الضمة', 'الفتحة'],
    answer: 'ب. السكون.',
  },
  {
    number: 5,
    section: 'السؤال الأول: اختر الإجابة الصحيحة',
    type: 'choice',
    prompt: 'الكلمة المجرورة في الجملة: "ذهبتُ إلى المدرسةِ" هي:',
    options: ['ذهبت', 'إلى', 'المدرسة', 'لا توجد'],
    answer: 'ج. المدرسة.',
  },
  {
    number: 6,
    section: 'السؤال الثاني: صح أم خطأ',
    type: 'true-false',
    prompt: 'الفاعل مرفوع. ( )',
    options: ['صح', 'خطأ'],
    answer: 'صح.',
  },
  {
    number: 7,
    section: 'السؤال الثاني: صح أم خطأ',
    type: 'true-false',
    prompt: 'المفعول به مجرور. ( )',
    options: ['صح', 'خطأ'],
    answer: 'خطأ؛ المفعول به منصوب.',
  },
  {
    number: 8,
    section: 'السؤال الثاني: صح أم خطأ',
    type: 'true-false',
    prompt: 'الاسم بعد حرف الجر مجرور. ( )',
    options: ['صح', 'خطأ'],
    answer: 'صح.',
  },
  {
    number: 9,
    section: 'السؤال الثاني: صح أم خطأ',
    type: 'true-false',
    prompt: 'الجزم يدخل على الاسم. ( )',
    options: ['صح', 'خطأ'],
    answer: 'خطأ؛ الجزم لا يدخل على الاسم، وإنما يكون في الفعل المضارع المعرب.',
  },
  {
    number: 10,
    section: 'السؤال الثاني: صح أم خطأ',
    type: 'true-false',
    prompt: 'قد تكون الألف علامة رفع فرعية. ( )',
    options: ['صح', 'خطأ'],
    answer: 'صح.',
  },
  {
    number: 11,
    section: 'السؤال الثالث: حدد الحالة والعلامة',
    type: 'identify',
    prompt: 'حضرَ المعلمُ. المعلمُ: وظيفته: __________. حالته الإعرابية: __________. علامة إعرابه: __________.',
    answer: 'وظيفته: فاعل. حالته الإعرابية: مرفوع. علامة إعرابه: الضمة. والإعراب الكامل: المعلمُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.',
  },
  {
    number: 12,
    section: 'السؤال الثالث: حدد الحالة والعلامة',
    type: 'identify',
    prompt: 'قرأَ سامرٌ القصةَ. القصةَ: وظيفتها: __________. حالتهـا الإعرابية: __________. علامة إعرابها: __________.',
    answer: 'وظيفتها: مفعول به. حالتها الإعرابية: منصوبة. علامة إعرابها: الفتحة. والإعراب: القصةَ: مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره.',
  },
  {
    number: 13,
    section: 'السؤال الثالث: حدد الحالة والعلامة',
    type: 'identify',
    prompt: 'جلستُ في الصفِّ. الصفِّ: حالته الإعرابية: __________. علامة إعرابه: __________.',
    answer: 'حالته الإعرابية: مجرور. علامة إعرابه: الكسرة. والإعراب الكامل: الصفِّ: اسم مجرور بـ(في)، وعلامة جره الكسرة الظاهرة على آخره.',
  },
  {
    number: 14,
    section: 'السؤال الرابع: أكمل الفراغ',
    type: 'complete',
    prompt: 'الرفع علامته الأصلية __________.',
    answer: 'الضمة.',
  },
  {
    number: 15,
    section: 'السؤال الرابع: أكمل الفراغ',
    type: 'complete',
    prompt: 'النصب علامته الأصلية __________.',
    answer: 'الفتحة.',
  },
  {
    number: 16,
    section: 'السؤال الرابع: أكمل الفراغ',
    type: 'complete',
    prompt: 'الجر علامته الأصلية __________.',
    answer: 'الكسرة.',
  },
  {
    number: 17,
    section: 'السؤال الرابع: أكمل الفراغ',
    type: 'complete',
    prompt: 'الجزم علامته الأصلية __________.',
    answer: 'السكون.',
  },
  {
    number: 18,
    section: 'السؤال الخامس: أعرب',
    type: 'parsing',
    prompt: 'كتبَ الطالبُ الواجبَ. أعرب: الطالبُ: __________. الواجبَ: __________.',
    answer: 'الطالبُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره. الواجبَ: مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره.',
  },
  {
    number: 19,
    section: 'السؤال الخامس: أعرب',
    type: 'parsing',
    prompt: 'ذهبَ خالدٌ إلى المدرسةِ. أعرب: خالدٌ: __________. المدرسةِ: __________.',
    answer: 'خالدٌ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره. المدرسةِ: اسم مجرور بـ إلى وعلامة جره الكسرة الظاهرة على آخره.',
  },
  {
    number: 20,
    section: 'السؤال السادس: سؤال تفكير',
    type: 'thinking',
    prompt: 'قارن بين الجملتين: حضرَ الطالبُ. حضرَ الطالبانِ. أ. ما وظيفة الطالب والطالبان؟ ب. هل الكلمتان مرفوعتان؟ ج. ما علامة رفع الطالب؟ د. ما علامة رفع الطالبان؟ هـ. لماذا اختلفت علامة الرفع؟',
    answer: 'أ. كل من الطالب والطالبان فاعل. ب. نعم، كلاهما مرفوع. ج. علامة رفع الطالبُ: الضمة. د. علامة رفع الطالبانِ: الألف. هـ. لأن الطالب مفرد، أما الطالبان فمثنى، والمثنى يُرفع بالألف.',
  },
]

const activityGroups: Array<{ id: string; title: string; items: ActivityItem[] }> = [
  {
    id: 'state',
    title: 'النشاط الأول: حدد الحالة الإعرابية',
    items: [
      { prompt: 'حضرَ الطالبُ.', options: ['مرفوع', 'منصوب', 'مجرور'], answer: 'مرفوع' },
      { prompt: 'قرأَ الطالبُ الكتابَ.', options: ['مرفوع', 'منصوب', 'مجرور'], answer: 'منصوب' },
      { prompt: 'ذهبتُ إلى المدرسةِ.', options: ['مرفوع', 'منصوب', 'مجرور'], answer: 'مجرور' },
      { prompt: 'العلمُ نورٌ.', options: ['مرفوع', 'منصوب', 'مجرور'], answer: 'مرفوع' },
      { prompt: 'شربَ الطفلُ الحليبَ.', options: ['مرفوع', 'منصوب', 'مجرور'], answer: 'منصوب' },
    ],
  },
  {
    id: 'original-sign',
    title: 'النشاط الثاني: اختر العلامة الأصلية',
    items: [
      { prompt: 'علامة الرفع الأصلية', options: ['الضمة', 'الفتحة', 'الكسرة'], answer: 'الضمة' },
      { prompt: 'علامة النصب الأصلية', options: ['الضمة', 'الفتحة', 'السكون'], answer: 'الفتحة' },
      { prompt: 'علامة الجر الأصلية', options: ['الكسرة', 'الفتحة', 'الضمة'], answer: 'الكسرة' },
      { prompt: 'علامة الجزم الأصلية', options: ['السكون', 'الضمة', 'الكسرة'], answer: 'السكون' },
    ],
  },
  {
    id: 'complete',
    title: 'النشاط الثالث: أكمل',
    items: [
      { prompt: 'الفاعل ______.', answer: 'مرفوع' },
      { prompt: 'المفعول به ______.', answer: 'منصوب' },
      { prompt: 'المبتدأ ______.', answer: 'مرفوع' },
      { prompt: 'الخبر ______.', answer: 'مرفوع' },
      { prompt: 'الاسم بعد حرف الجر ______.', answer: 'مجرور' },
    ],
  },
]

export function LessonSix({ onProgressChange, onFinish }: Props) {
  const steps: LessonStepDefinition[] = [
    step('intro', 'الدرس السادس: علامات الإعراب الأصلية والفرعية', 'البداية', '📘', (
      <EducationalCard title="الدرس السادس: علامات الإعراب الأصلية والفرعية" eyebrow="عنوان الدرس" tone="accent">
        <p className="lesson-six-hero-topic">علامات الإعراب الأصلية والفرعية</p>
        <p>في هذا الدرس نفهم كيف تكشف حركة آخر الكلمة عن وظيفتها، ثم ننتقل تمهيديًا إلى العلامات الفرعية.</p>
        <div className="lesson-six-state-map" aria-label="الحالات والعلامات الأصلية">
          <div><strong>رفع</strong><span>الضمة</span></div>
          <div><strong>نصب</strong><span>الفتحة</span></div>
          <div><strong>جر</strong><span>الكسرة</span></div>
          <div><strong>جزم</strong><span>السكون</span></div>
        </div>
      </EducationalCard>
    )),
    step('objectives', 'أهداف الدرس', 'البداية', '🎯', (
      <>
        <p>في نهاية هذا الدرس يُتوقَّع من الطالب أن يستطيع:</p>
        <ul className="check-list">
          <li>فهم معنى الإعراب بطريقة مبسطة.</li>
          <li>معرفة حالات الإعراب الأربع: الرفع والنصب والجر والجزم.</li>
          <li>معرفة علامات الإعراب الأصلية: الضمة والفتحة والكسرة والسكون.</li>
          <li>فهم الفرق بين العلامة الأصلية والعلامة الفرعية.</li>
          <li>معرفة أشهر علامات الإعراب الفرعية بصورة تمهيدية.</li>
          <li>معرفة أن الجر خاص بالأسماء، والجزم خاص بالأفعال المضارعة.</li>
          <li>تحديد علامة الإعراب في أمثلة بسيطة.</li>
          <li>إجراء إعراب بسيط لكلمات سبق أن درسها.</li>
          <li>تجنب أشهر الأخطاء المتعلقة بعلامات الإعراب.</li>
        </ul>
      </>
    )),
    step('review', '1. مراجعة سريعة', 'ما الإعراب؟', '↩️', (
      <>
        <p>تعلمنا سابقًا أن الكلام ينقسم إلى:</p>
        <p className="lesson-six-formula"><bdi>اسم – فعل – حرف</bdi></p>
        <p>وتعلمنا الجملة الاسمية:</p>
        <p className="lesson-six-formula"><bdi>المبتدأ + الخبر</bdi></p>
        <p>مثل: <strong>الطالبُ مجتهدٌ.</strong></p>
        <p>وتعلمنا الجملة الفعلية:</p>
        <p className="lesson-six-formula"><bdi>الفعل + الفاعل + المفعول به</bdi></p>
        <p>مثل: <strong>كتبَ الطالبُ الدرسَ.</strong></p>
        <div className="lesson-six-example-pair"><span><bdi>الطالبُ</bdi> ← ضمة</span><span><bdi>الدرسَ</bdi> ← فتحة</span></div>
        <p>لاحظ الحركات. لماذا تغيرت الحركة؟ هذا ما سنبدأ بفهمه في هذا الدرس.</p>
      </>
    )),
    step('what-is-grammar', '2. ما الإعراب؟', 'ما الإعراب؟', '🔎', (
      <>
        <p>انظر إلى كلمة <strong>الطالب</strong> في الجمل الآتية:</p>
        <div className="lesson-six-sentence-list"><bdi>حضرَ الطالبُ.</bdi><bdi>رأيتُ الطالبَ.</bdi><bdi>سلَّمتُ على الطالبِ.</bdi></div>
        <p>الكلمة نفسها هي: <strong>الطالب</strong>، ولكن آخرها تغير:</p>
        <div className="lesson-six-ending-grid"><bdi>الطالبُ</bdi><bdi>الطالبَ</bdi><bdi>الطالبِ</bdi></div>
        <p>مرة ظهرت الضمة، ومرة الفتحة، ومرة الكسرة. لماذا؟ لأن وظيفة الكلمة في الجملة تغيرت. وهذا يقودنا إلى مفهوم مهم جدًا يسمى: <strong>الإعراب.</strong></p>
      </>
    )),
    step('definition', '3. تعريف الإعراب بطريقة مبسطة', 'ما الإعراب؟', '💡', (
      <>
        <Rule>الإعراب هو: تغيُّر علامة آخر الكلمة بسبب موقعها أو العامل المؤثر فيها في الجملة.</Rule>
        <Rule>للمبتدئ يمكن أن نقول بصورة أسهل: الإعراب يساعدنا على معرفة وظيفة الكلمة في الجملة من خلال علامتها.</Rule>
        <div className="lesson-six-example-cards">
          <article><bdi>جاءَ محمدٌ.</bdi><p>محمدٌ: فاعل مرفوع.</p></article>
          <article><bdi>رأيتُ محمدًا.</bdi><p>محمدًا: مفعول به منصوب.</p></article>
          <article><bdi>سلَّمتُ على محمدٍ.</bdi><p>محمدٍ: اسم مجرور.</p></article>
        </div>
        <p>إذن الكلمة قد يتغير آخرها عندما تتغير وظيفتها أو العوامل الداخلة عليها.</p>
      </>
    )),
    step('four-states', '4. حالات الإعراب الأربع', 'الحالات الإعرابية', '🧭', (
      <>
        <p>لدينا أربع حالات أساسية. احفظ هذه الكلمات جيدًا؛ لأنها ستتكرر معنا في معظم دروس النحو.</p>
        <div className="lesson-six-state-map lesson-six-state-map--large"><div><strong>الرفع</strong><span>حالة</span></div><div><strong>النصب</strong><span>حالة</span></div><div><strong>الجر</strong><span>حالة</span></div><div><strong>الجزم</strong><span>حالة</span></div></div>
      </>
    )),
    step('original-signs', '5. العلامات الأصلية', 'العلامات الأصلية', '✦', (
      <>
        <p>لكل حالة إعرابية علامة أصلية أساسية:</p>
        <div className="table-scroll"><table className="lesson-six-table"><thead><tr><th>الحالة</th><th>العلامة الأصلية</th></tr></thead><tbody><tr><th>الرفع</th><td>الضمة</td></tr><tr><th>النصب</th><td>الفتحة</td></tr><tr><th>الجر</th><td>الكسرة</td></tr><tr><th>الجزم</th><td>السكون</td></tr></tbody></table></div>
        <div className="lesson-six-golden-grid"><strong>الرفع → الضمة</strong><strong>النصب → الفتحة</strong><strong>الجر → الكسرة</strong><strong>الجزم → السكون</strong></div>
        <p><strong>وهذا من أهم ما يجب حفظه في الدرس.</strong></p>
      </>
    )),
    step('raf', '6. أولًا: الرفع', 'العلامات الأصلية', '⬆️', (
      <>
        <p>العلامة الأصلية للرفع هي: <strong>الضمة</strong>.</p>
        <p><strong>الطالبُ مجتهدٌ.</strong></p>
        <FullParsing lines={['الطالبُ: مبتدأ مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.', 'مجتهدٌ: خبر مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.']} />
        <p><strong>كتبَ خالدٌ الدرسَ.</strong> من الذي كتب؟ خالد. إذن خالد فاعل. والفاعل مرفوع.</p>
        <FullParsing lines={['خالدٌ: فاعل مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.']} />
      </>
    )),
    step('raised-words', '7. كلمات تعلمنا أنها مرفوعة', 'العلامات الأصلية', '📌', (
      <>
        <p>حتى الآن، عرفنا ثلاثة أشياء مهمة تكون مرفوعة في أمثلتنا الأساسية:</p>
        <div className="lesson-six-role-grid"><article><strong>المبتدأ</strong><bdi>الطفلُ سعيدٌ.</bdi><span>الطفلُ: مبتدأ مرفوع.</span></article><article><strong>الخبر</strong><bdi>الطفلُ سعيدٌ.</bdi><span>سعيدٌ: خبر مرفوع.</span></article><article><strong>الفاعل</strong><bdi>نامَ الطفلُ.</bdi><span>الطفلُ: فاعل مرفوع.</span></article></div>
        <p>تذكّر: المبتدأ، والخبر، والفاعل من الكلمات المرفوعة في هذه الأمثلة.</p>
      </>
    )),
    step('nasb', '8. ثانيًا: النصب', 'العلامات الأصلية', '⬇️', (
      <>
        <p>العلامة الأصلية للنصب هي: <strong>الفتحة</strong>. وقد تعلمنا سابقًا أن: <strong>المفعول به منصوب.</strong></p>
        <p><strong>قرأَ الطالبُ الكتابَ.</strong></p>
        <FullParsing lines={['قرأَ: فعل ماضٍ مبني على الفتحة الظاهرة على آخره.', 'الطالبُ: فاعل مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.', 'الكتابَ: مفعول به منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.']} />
        <p><strong>أكلَ الطفلُ التفاحةَ.</strong> من الذي أكل؟ الطفلُ ← فاعل مرفوع. ماذا أكل؟ التفاحةَ ← مفعول به منصوب.</p>
        <FullParsing lines={['التفاحةَ: مفعول به منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.']} />
      </>
    )),
    step('jarr', '9. ثالثًا: الجر', 'العلامات الأصلية', '↘️', (
      <>
        <p>العلامة الأصلية للجر هي: <strong>الكسرة</strong>، والجر يدخل على <strong>الأسماء</strong>.</p>
        <p><strong>ذهبتُ إلى المدرسةِ.</strong></p>
        <FullParsing lines={['إلى: حرف جر.', 'المدرسةِ: اسم مجرور بإلى، وعلامة جره الكسرة الظاهرة على آخره.']} />
        <p><strong>جلستُ في الصفِّ.</strong></p>
        <FullParsing lines={['في: حرف جر.', 'الصفِّ: اسم مجرور بـ في، وعلامة جره الكسرة الظاهرة على آخره.']} />
      </>
    )),
    step('prepositions', '10. بعض حروف الجر', 'العلامات الأصلية', '🔗', (
      <>
        <p>سندرس حروف الجر بتفصيل أكبر في درس مستقل، لكن من المفيد الآن معرفة بعض أشهرها:</p>
        <p className="lesson-six-formula"><bdi>مِنْ – إلى – عن – على – في – الباء – الكاف – اللام</bdi></p>
        <div className="lesson-six-example-cards"><article><bdi>ذهبتُ إلى المدرسةِ.</bdi></article><article><bdi>خرجتُ من البيتِ.</bdi></article><article><bdi>جلستُ في الغرفةِ.</bdi></article><article><bdi>كتبتُ بالقلمِ.</bdi></article><article><bdi>الكتابُ للطالبِ.</bdi></article></div>
        <p>لاحظ أن الاسم بعد حرف الجر يكون مجرورًا.</p>
      </>
    )),
    step('jazm', '11. رابعًا: الجزم', 'العلامات الأصلية', '⏸️', (
      <>
        <p>العلامة الأصلية للجزم هي: <strong>السكون</strong>.</p>
        <Rule>الجزم يدخل على الفعل المضارع، ولا يدخل على الاسم.</Rule>
        <p><strong>لم يكتبْ خالدٌ.</strong></p>
        <FullParsing lines={['يكتبْ: فعل مضارع مجزوم بـ لم، وعلامة جزمه السكون.', 'خالدٌ: فاعل مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.']} />
        <p><strong>لم يذهبْ سامرٌ إلى المدرسةِ.</strong></p>
        <FullParsing lines={['يذهبْ: فعل مضارع مجزوم بـ لم، وعلامة جزمه السكون.']} />
      </>
    )),
    step('golden-rule', '12. قاعدة ذهبية', 'الحالات الإعرابية', '⭐', (
      <>
        <Rule>الاسم قد يُرفع أو يُنصب أو يُجر.</Rule>
        <Rule>الفعل المضارع قد يُرفع أو يُنصب أو يُجزم.</Rule>
        <div className="lesson-six-contrast"><strong>الجر من خصائص الأسماء.</strong><strong>الجزم من خصائص الأفعال المضارعة.</strong></div>
        <p>فلا نقول: <strong>اسم مجزوم</strong> ❌ ولا نقول: <strong>فعل مجرور</strong> ❌</p>
        <p className="lesson-six-formula"><bdi>الاسم يُرفع ويُنصب ويُجر.</bdi></p>
        <p className="lesson-six-formula"><bdi>الفعل المضارع يُرفع ويُنصب ويُجزم.</bdi></p>
      </>
    )),
    step('combined-example', '13. مثال يجمع أكثر من حالة', 'الأمثلة الأساسية', '🧩', (
      <>
        <p className="lesson-six-featured-sentence"><bdi>كتبَ الطالبُ الواجبَ بالقلمِ.</bdi></p>
        <FullParsing lines={['كتبَ: فعل ماضٍ مبني على الفتحة الظاهرة على آخره.', 'الطالبُ: فاعل مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.', 'الواجبَ: مفعول به منصوب، وعلامة نصبه الفتحة الظاهرة على آخره.', 'الباء: حرف جر.', 'القلمِ: اسم مجرور بالباء، وعلامة جره الكسرة الظاهرة على آخره.']} />
        <div className="lesson-six-example-pair"><span><bdi>الطالبُ</bdi> → ضمة</span><span><bdi>الواجبَ</bdi> → فتحة</span><span><bdi>القلمِ</bdi> → كسرة</span></div>
      </>
    )),
    step('state-mark', '14. ما المقصود بعلامة الإعراب؟', 'الحالات الإعرابية', '🏷️', (
      <>
        <p>عندما نقول: <strong>الطالبُ: فاعل مرفوع وعلامة رفعه الضمة.</strong></p>
        <div className="lesson-six-state-mark"><div><strong>مرفوع</strong><span>الحالة الإعرابية</span></div><div><strong>الضمة</strong><span>علامة الإعراب</span></div></div>
        <p><strong>الكتابَ: مفعول به منصوب وعلامة نصبه الفتحة.</strong></p>
        <div className="lesson-six-state-mark"><div><strong>النصب</strong><span>الحالة</span></div><div><strong>الفتحة</strong><span>العلامة</span></div></div>
        <p>وهذا الفرق مهم.</p>
      </>
    )),
    step('do-not-confuse', '15. لا تخلط بين الحالة والعلامة', 'الحالات الإعرابية', '⚖️', (
      <>
        <div className="lesson-six-two-column"><article><h3>الحالة الإعرابية</h3><p>رفع – نصب – جر – جزم</p></article><article><h3>العلامة الأصلية</h3><p>ضمة – فتحة – كسرة – سكون</p></article></div>
        <p>إذن لا نقول: <strong>علامة رفعه الرفع.</strong> ❌</p>
        <p>بل نقول: <strong>مرفوع وعلامة رفعه الضمة.</strong> ✅</p>
      </>
    )),
    step('secondary-intro', '16. ما العلامات الفرعية؟', 'العلامات الفرعية', '🌿', (
      <>
        <p>حتى الآن الأمر يبدو بسيطًا: رفع = ضمة، نصب = فتحة، جر = كسرة، جزم = سكون.</p>
        <p>لكن اللغة العربية فيها كلمات لا تستعمل دائمًا هذه العلامات الأصلية. فقد نجد كلمة مرفوعة ولكن علامة رفعها ليست الضمة.</p>
        <p><strong>جاءَ الطالبانِ.</strong></p>
        <FullParsing lines={['الطالبانِ: فاعل مرفوع، وعلامة رفعه الألف؛ لأنه مثنى.']} />
        <p>إذن الألف هنا <strong>علامة إعراب فرعية.</strong></p>
      </>
    )),
    step('original-secondary', '17. الفرق بين العلامة الأصلية والفرعية', 'العلامات الفرعية', '🔁', (
      <>
        <div className="lesson-six-two-column"><article><h3>العلامة الأصلية</h3><p>هي العلامة الأساسية المعتادة.</p><bdi>جاءَ الطالبُ.</bdi><p>الطالبُ: مرفوع بالضمة.</p></article><article><h3>العلامة الفرعية</h3><p>هي علامة تأتي بدل العلامة الأصلية في أنواع معينة من الكلمات.</p><bdi>جاءَ الطالبانِ.</bdi><p>الطالبانِ: مرفوع بالألف.</p></article></div>
        <p>فالرفع موجود في المثالين، لكن الطالبُ → مرفوع بالضمة، والطالبانِ → مرفوع بالألف.</p>
      </>
    )),
    step('why-secondary', '18. لماذا ندرس العلامات الفرعية؟', 'العلامات الفرعية', '🗺️', (
      <>
        <p>لأننا سنواجه لاحقًا كلمات مثل:</p>
        <div className="lesson-six-chip-grid"><bdi>الطالبانِ</bdi><bdi>المعلمونَ</bdi><bdi>المعلمينَ</bdi><bdi>المعلماتِ</bdi><bdi>أبوك</bdi></div>
        <p>وكل نوع منها له قواعد خاصة. لذلك هذا الدرس يقدم لنا <strong>الخريطة العامة</strong>، ثم سندرس كل نوع بتفصيل أكبر في دروسه الخاصة.</p>
      </>
    )),
    step('raised-secondary', '19. أشهر علامات الرفع الفرعية', 'العلامات الفرعية', '⬆️', (
      <>
        <p>العلامة الأصلية للرفع: <strong>الضمة</strong>.</p>
        <p>ومن علامات الرفع الفرعية التي سنتعلمها: <strong>الألف – الواو – ثبوت النون</strong>.</p>
        <h3>الألف</h3><p>تكون علامة رفع للمثنى.</p><p><strong>حضرَ الطالبانِ.</strong></p><FullParsing lines={['الطالبانِ: فاعل مرفوع وعلامة رفعه الألف؛ لأنه مثنى.']} />
        <h3>الواو</h3><p>تكون علامة رفع في مواضع منها جمع المذكر السالم.</p><p><strong>حضرَ المعلمونَ.</strong></p><p><strong>جاءَ المعلمونَ.</strong></p><FullParsing lines={['المعلمونَ: فاعل مرفوع وعلامة رفعه الواو؛ لأنه جمع مذكر سالم.']} />
        <p>وتأتي الواو أيضًا علامة رفع في <strong>الأسماء الخمسة</strong> بشروط سنعرفها لاحقًا.</p><p><strong>جاءَ أبوك.</strong></p><FullParsing lines={['أبوك: فاعل مرفوع وعلامة رفعه الواو؛ لأنه من الأسماء الخمسة، مع تحقق شروط إعرابها بالحروف.']} />
      </>
    )),
    step('nun-raf', '20. ثبوت النون', 'العلامات الفرعية', '🔒', (
      <>
        <p>من علامات الرفع الفرعية: <strong>ثبوت النون</strong>، وذلك في <strong>الأفعال الخمسة</strong>.</p>
        <p><strong>الطلابُ يكتبونَ.</strong></p>
        <FullParsing lines={['يكتبونَ: فعل مضارع مرفوع وعلامة رفعه ثبوت النون؛ لأنه من الأفعال الخمسة.']} />
        <p>لا نحتاج الآن إلى حفظ تفاصيل الأفعال الخمسة؛ لأن لها درسًا مستقلًا لاحقًا. المطلوب الآن أن تعرف أن <strong>ثبوت النون يمكن أن يكون علامة رفع فرعية.</strong></p>
      </>
    )),
    step('nasb-secondary', '21. أشهر علامات النصب الفرعية', 'العلامات الفرعية', '⬇️', (
      <>
        <p>العلامة الأصلية للنصب: <strong>الفتحة</strong>. ومن العلامات الفرعية التي سنقابلها: <strong>الياء – الكسرة – الألف – حذف النون</strong>.</p>
        <h3>الياء</h3><p>تكون علامة نصب للمثنى وجمع المذكر السالم.</p><p><strong>رأيتُ الطالبينِ.</strong></p><FullParsing lines={['الطالبينِ: مفعول به منصوب وعلامة نصبه الياء؛ لأنه مثنى.']} /><p><strong>كرَّمَ المديرُ المعلمينَ.</strong></p><FullParsing lines={['المعلمينَ: مفعول به منصوب وعلامة نصبه الياء؛ لأنه جمع مذكر سالم.']} />
        <h3>الكسرة</h3><p>قد تأتي الكسرة علامة للنصب في <strong>جمع المؤنث السالم</strong>.</p><p><strong>كرَّمتُ الطالباتِ.</strong></p><FullParsing lines={['الطالباتِ: مفعول به منصوب وعلامة نصبه الكسرة نيابةً عن الفتحة؛ لأنه جمع مؤنث سالم.']} /><p>الكسرة عادةً علامة جر أصلية، لكنها هنا أصبحت <strong>علامة نصب فرعية</strong>.</p>
        <h3>الألف</h3><p>تأتي علامة للنصب في الأسماء الخمسة عند تحقق شروطها.</p><p><strong>رأيتُ أباكَ.</strong></p><FullParsing lines={['أبا: مفعول به منصوب وعلامة نصبه الألف؛ لأنه من الأسماء الخمسة.']} />
        <h3>حذف النون</h3><p>يكون علامة نصب في الأفعال الخمسة.</p><p><strong>لن يكتبوا.</strong></p><FullParsing lines={['يكتبوا: فعل مضارع منصوب بـ لن، وعلامة نصبه حذف النون؛ لأنه من الأفعال الخمسة.']} />
      </>
    )),
    step('jarr-secondary', '22. أشهر علامات الجر الفرعية', 'العلامات الفرعية', '↘️', (
      <>
        <p>العلامة الأصلية للجر: <strong>الكسرة</strong>. ومن العلامات الفرعية للجر: <strong>الياء – الفتحة</strong>.</p>
        <h3>الياء</h3><p>تكون علامة جر في مواضع منها: <strong>المثنى، جمع المذكر السالم، الأسماء الخمسة</strong>.</p>
        <p><strong>سلَّمتُ على الطالبينِ.</strong></p><FullParsing lines={['الطالبينِ: اسم مجرور بـ على وعلامة جره الياء؛ لأنه مثنى.']} />
        <p><strong>سلَّمتُ على المعلمينَ.</strong></p><FullParsing lines={['المعلمينَ: اسم مجرور وعلامة جره الياء؛ لأنه جمع مذكر سالم.']} />
        <p><strong>سلَّمتُ على أبيكَ.</strong></p><FullParsing lines={['أبي: اسم مجرور وعلامة جره الياء؛ لأنه من الأسماء الخمسة.']} />
        <h3>الفتحة</h3><p>قد تكون الفتحة علامة جر فرعية في <strong>الممنوع من الصرف</strong>.</p><p><strong>مررتُ بأحمدَ.</strong></p><FullParsing lines={['أحمدَ: اسم مجرور بالباء، وعلامة جره الفتحة نيابةً عن الكسرة؛ لأنه ممنوع من الصرف.']} /><p>لا نحتاج الآن إلى دراسة الممنوع من الصرف؛ سيكون له درس خاص.</p>
      </>
    )),
    step('jazm-secondary', '23. أشهر علامات الجزم الفرعية', 'العلامات الفرعية', '⏸️', (
      <>
        <p>العلامة الأصلية للجزم: <strong>السكون</strong>. ومن علامات الجزم الفرعية: <strong>حذف حرف العلة – حذف النون</strong>.</p>
        <h3>حذف حرف العلة</h3><p><strong>لم يسعَ إلى الشرِّ.</strong></p><p>أصل الفعل: <strong>يسعى</strong>. وبعد دخول <strong>لم</strong> أصبح: <strong>لم يسعَ</strong>.</p><FullParsing lines={['يسعَ: فعل مضارع مجزوم بـ لم، وعلامة جزمه حذف حرف العلة.']} />
        <p><strong>لم يدعُ إلى الشرِّ.</strong></p><p>أصل الفعل: <strong>يدعو</strong>. وبعد الجزم: <strong>لم يدعُ</strong>.</p><FullParsing lines={['يدعُ: فعل مضارع مجزوم بـ لم، وعلامة جزمه حذف حرف العلة.']} />
        <h3>حذف النون</h3><p>يكون في الأفعال الخمسة.</p><p><strong>الطلابُ لم يكتبوا.</strong></p><p>أصل الفعل في حالة الرفع: <strong>يكتبونَ</strong>، وبعد <strong>لم</strong>: <strong>لم يكتبوا</strong>.</p><FullParsing lines={['يكتبوا: فعل مضارع مجزوم بـ لم، وعلامة جزمه حذف النون.']} />
      </>
    )),
    step('secondary-table', '24. جدول شامل مبسط', 'العلامات الفرعية', '📊', (
      <>
        <div className="table-scroll"><table className="lesson-six-table"><thead><tr><th>الحالة</th><th>العلامة الأصلية</th><th>بعض العلامات الفرعية</th></tr></thead><tbody><tr><th>الرفع</th><td>الضمة</td><td>الألف، الواو، ثبوت النون</td></tr><tr><th>النصب</th><td>الفتحة</td><td>الياء، الكسرة، الألف، حذف النون</td></tr><tr><th>الجر</th><td>الكسرة</td><td>الياء، الفتحة</td></tr><tr><th>الجزم</th><td>السكون</td><td>حذف حرف العلة، حذف النون</td></tr></tbody></table></div>
        <p>هذا الجدول مهم جدًا، ولكن لا يجب أن يحفظ الطالب جميع التفاصيل في يوم واحد. الأهم في البداية: <strong>ضمة – فتحة – كسرة – سكون</strong>، ثم نتدرج في العلامات الفرعية.</p>
      </>
    )),
    step('parse-method', '25. كيف أعرب كلمة بطريقة بسيطة؟', 'التطبيق والإعراب', '🪜', (
      <>
        <p><strong>كتبَ الطالبُ الدرسَ.</strong></p>
        <ol className="lesson-six-steps-list"><li>ما وظيفة الكلمة؟ الطالب هو الذي قام بالفعل. إذن: <strong>فاعل</strong>.</li><li>ما حكم الفاعل؟ الفاعل: <strong>مرفوع</strong>.</li><li>ما علامة رفعه؟ هنا العلامة: <strong>الضمة</strong>.</li></ol>
        <FullParsing lines={['الطالبُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.']} />
      </>
    )),
    step('object-parse', '26. مثال على المفعول به', 'التطبيق والإعراب', '🎯', (
      <>
        <p><strong>قرأَ الطفلُ القصةَ.</strong></p>
        <p>ما وظيفة <strong>القصة</strong>؟ وقع عليها فعل القراءة. إذن: <strong>مفعول به</strong>، والمفعول به <strong>منصوب</strong>، وعلامة نصبه هنا: <strong>الفتحة</strong>.</p>
        <FullParsing lines={['القصةَ: مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره.']} />
      </>
    )),
    step('genitive-parse', '27. مثال على الاسم المجرور', 'التطبيق والإعراب', '🔗', (
      <>
        <p><strong>ذهبتُ إلى المدرسةِ.</strong></p><p><strong>إلى</strong>: حرف جر. والاسم بعده: المدرسة. إذن:</p>
        <FullParsing lines={['المدرسةِ: اسم مجرور بإلى وعلامة جره الكسرة الظاهرة على آخره.']} />
      </>
    )),
    step('jussive-parse', '28. مثال على الفعل المجزوم', 'التطبيق والإعراب', '⏸️', (
      <>
        <p><strong>لم يذهبْ خالدٌ.</strong></p><p>دخلت <strong>لم</strong> على الفعل المضارع: يذهب، فأصبح: يذهبْ.</p>
        <FullParsing lines={['يذهبْ: فعل مضارع مجزوم بـ(لم)، وعلامة جزمه السكون.']} />
      </>
    )),
    step('visible-estimated', '29. علامات ظاهرة وعلامات مقدرة', 'التطبيق والإعراب', '👁️', (
      <>
        <p>أحيانًا نرى الحركة على آخر الكلمة بوضوح، مثل: <strong>الطالبُ</strong>؛ الضمة ظاهرة.</p>
        <p>لكن أحيانًا تكون العلامة الإعرابية موجودة من الناحية النحوية، ولا تظهر على آخر الكلمة لسبب صرفي أو صوتي.</p>
        <p><strong>جاءَ الفتى.</strong></p><p>كلمة <strong>الفتى</strong> فاعل مرفوع، لكننا لا نضع ضمة ظاهرة على الألف المقصورة.</p>
        <FullParsing lines={['الفتى: فاعل مرفوع وعلامة رفعه الضمة المقدرة.']} />
        <Rule>هذه تسمى: علامة مقدرة. هذه الفكرة تمهيدية الآن، وسندرس الإعراب التقديري بالتفصيل لاحقًا.</Rule>
      </>
    )),
    step('built-inflected', '30. البناء والإعراب: تنبيه للمستقبل', 'التطبيق والإعراب', '🔔', (
      <>
        <p>ليس كل آخر كلمة يتغير. بعض الكلمات تكون <strong>مبنية</strong>، أي يلزم آخرها صورة معينة في استعمالها. وقد مر معنا مثلًا كثير من الضمائر، وهي من المبنيات.</p>
        <p>لكننا لن ندخل الآن في تفاصيل: <strong>المعرب والمبني</strong>؛ لأن لهما درسًا خاصًا في الكورس.</p>
        <p>المطلوب الآن هو فهم الإعراب وعلاماته الأساسية.</p>
      </>
    )),
    step('core-summary', '31. الخلاصة الأساسية', 'الخلاصة', '⭐', (
      <>
        <p>لدينا أربع حالات إعرابية:</p><p className="lesson-six-formula"><bdi>الرفع – النصب – الجر – الجزم</bdi></p>
        <div className="lesson-six-golden-grid"><strong>الرفع → الضمة</strong><strong>النصب → الفتحة</strong><strong>الجر → الكسرة</strong><strong>الجزم → السكون</strong></div>
        <div className="lesson-six-rule-list"><p>الاسم يُرفع ويُنصب ويُجر.</p><p>الفعل المضارع يُرفع ويُنصب ويُجزم.</p><p>الاسم لا يُجزم.</p><p>الفعل لا يُجر.</p></div>
      </>
    )),
    step('memorize-notes', '32. ملاحظات مهمة يجب حفظها', 'الخلاصة', '🧠', (
      <ol className="numbered-list lesson-six-memory-list"><li>المبتدأ مرفوع.</li><li>الخبر مرفوع.</li><li>الفاعل مرفوع.</li><li>المفعول به منصوب.</li><li>الاسم بعد حرف الجر مجرور.</li><li>الجر من خصائص الأسماء.</li><li>الجزم يدخل على الفعل المضارع.</li><li>العلامة الأصلية للرفع هي الضمة.</li><li>العلامة الأصلية للنصب هي الفتحة.</li><li>العلامة الأصلية للجر هي الكسرة.</li><li>العلامة الأصلية للجزم هي السكون.</li><li>توجد علامات فرعية تحل محل العلامات الأصلية في مواضع معينة.</li></ol>
    )),
    step('common-errors', '33. أخطاء شائعة', 'الخلاصة', '⚠️', (
      <div className="lesson-six-error-list">
        <ErrorPair bad="الفاعل منصوب." good="الفاعل مرفوع." />
        <ErrorPair bad="المفعول به مرفوع." good="المفعول به منصوب." />
        <ErrorPair bad="الاسم بعد حرف الجر منصوب." good="الاسم بعد حرف الجر مجرور." />
        <ErrorPair bad="الطالبُ مرفوع وعلامة رفعه الرفع." good="الطالبُ مرفوع وعلامة رفعه الضمة." />
        <ErrorPair bad="كل مرفوع يجب أن تكون علامة رفعه الضمة." good="جاءَ الطالبانِ: الطالبان مرفوع، لكن علامة رفعه الألف؛ لأنه مثنى." />
        <ErrorPair bad="الكسرة دائمًا تعني الجر." good="كرَّمتُ الطالباتِ: الطالباتِ مفعول به منصوب، وعلامة نصبه الكسرة نيابة عن الفتحة؛ لأنه جمع مؤنث سالم." />
      </div>
    )),
    step('worked-one-four', 'أمثلة محلولة: 1–4', 'الأمثلة المحلولة', '💬', (
      <div className="lesson-six-worked-list">
        <WorkedExample title="المثال الأول" sentence="العلمُ مفيدٌ." lines={['العلمُ: مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة على آخره.', 'مفيدٌ: خبر مرفوع وعلامة رفعه الضمة الظاهرة على آخره.']} />
        <WorkedExample title="المثال الثاني" sentence="قرأَ أحمدُ الكتابَ." lines={['قرأَ: فعل ماضٍ مبني على الفتحة الظاهرة على آخره.', 'أحمدُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.', 'الكتابَ: مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره.']} />
        <WorkedExample title="المثال الثالث" sentence="جلستُ في الحديقةِ." lines={['في: حرف جر.', 'الحديقةِ: اسم مجرور بـ في وعلامة جره الكسرة الظاهرة على آخره.']} />
        <WorkedExample title="المثال الرابع" sentence="لم يلعبْ خالدٌ." lines={['يلعبْ: فعل مضارع مجزوم بـ لم وعلامة جزمه السكون.', 'خالدٌ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.']} />
      </div>
    )),
    step('worked-five-eight', 'أمثلة محلولة: 5–8', 'الأمثلة المحلولة', '💬', (
      <div className="lesson-six-worked-list">
        <WorkedExample title="المثال الخامس" sentence="حضرَ الطالبانِ." lines={['الطالبانِ: فاعل مرفوع وعلامة رفعه الألف؛ لأنه مثنى.']} note="لا نقول مرفوع بالضمة لأنه مثنى." />
        <WorkedExample title="المثال السادس" sentence="رأيتُ الطالبينِ." lines={['الطالبينِ: مفعول به منصوب وعلامة نصبه الياء؛ لأنه مثنى.']} />
        <WorkedExample title="المثال السابع" sentence="حضرَ المعلمونَ." lines={['المعلمونَ: فاعل مرفوع وعلامة رفعه الواو؛ لأنه جمع مذكر سالم.']} />
        <WorkedExample title="المثال الثامن" sentence="كرَّمتُ المعلمينَ." lines={['المعلمينَ: مفعول به منصوب وعلامة نصبه الياء؛ لأنه جمع مذكر سالم.']} />
      </div>
    )),
    step('activity-one', 'النشاط الأول: حدد الحالة الإعرابية', 'الأنشطة', '📝', <Activities group={activityGroups[0]} />),
    step('activity-two', 'النشاط الثاني: اختر العلامة الأصلية', 'الأنشطة', '✅', <Activities group={activityGroups[1]} />),
    step('activity-three', 'النشاط الثالث: أكمل', 'الأنشطة', '✍️', <Activities group={activityGroups[2]} />),
    step('final-test', 'رابعًا: اختبار نهاية الدرس', 'اختبر نفسك', '🏁', <FinalTest />),
    step('teacher', 'خامسًا: منطقة خاصة بالمعلم', 'منطقة المعلم', '🔐', <TeacherArea />),
    step('homework', 'واجب منزلي مقترح', 'الواجب والخلاصة', '🏠', <Homework />),
    step('quick-summary', 'خلاصة للحفظ السريع', 'الواجب والخلاصة', '🌟', <QuickSummary />),
  ]

  return <LessonFlow steps={steps} onProgressChange={onProgressChange} onFinish={onFinish} lessonTitle="علامات الإعراب الأصلية والفرعية" lessonNumber="٦" lessonEyebrow="الدرس السادس" />
}

function step(id: string, title: string, group: string, icon: string, content: ReactNode): LessonStepDefinition {
  return {
    id,
    title,
    shortTitle: title.replace(/^\d+[–-]?\d*\.\s*/, ''),
    group,
    icon,
    description: 'تعلّم بالتدرج، ثم طبّق ما فهمته.',
    render: () => content,
  }
}

function Rule({ children }: { children: ReactNode }) {
  return <div className="lesson-six-rule"><strong>قاعدة</strong><p>{children}</p></div>
}

function FullParsing({ lines }: { lines: string[] }) {
  return <div className="lesson-six-parsing" aria-label="إعراب كامل">{lines.map((line) => <p key={line}>{line}</p>)}</div>
}

function ErrorPair({ bad, good }: { bad: string; good: string }) {
  return <article className="lesson-six-error"><p>❌ <del>{bad}</del></p><p>✅ <strong>{good}</strong></p></article>
}

function WorkedExample({ title, sentence, lines, note }: { title: string; sentence: string; lines: string[]; note?: string }) {
  const [open, setOpen] = useState(false)
  return <article className="lesson-six-worked"><h3>{title}</h3><p className="lesson-six-featured-sentence"><bdi>{sentence}</bdi></p><button type="button" className="button button--ghost" onClick={() => setOpen((value) => !value)}>{open ? 'إخفاء الإعراب' : 'أظهر الإعراب الكامل'}</button>{open && <><FullParsing lines={lines} />{note && <p className="lesson-six-note">{note}</p>}</>}</article>
}

function Activities({ group }: { group: { id: string; title: string; items: ActivityItem[] } }) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)
  const [feedback, setFeedback] = useState<Record<number, boolean>>({})

  function check() {
    const result = Object.fromEntries(group.items.map((item, index) => [index, normalize(answers[index]) === normalize(item.answer)]))
    setFeedback(result)
    setChecked(true)
  }

  return <section className="lesson-six-activity" data-activity-id={group.id}>
    <div className="lesson-six-activity-heading"><span className="activity-number">{group.items.length}</span><div><h3>{group.title}</h3><p>أجب عن جميع المطالب ثم تحقق من إجاباتك.</p></div></div>
    {group.id === 'state' && <p>حدد هل الكلمة المحددة مرفوعة أم منصوبة أم مجرورة:</p>}
    <div className="lesson-six-activity-items">{group.items.map((item, index) => <div className="lesson-six-activity-row" key={item.prompt}>
      <label htmlFor={`${group.id}-${index}`}><bdi>{index + 1}. {item.prompt}</bdi></label>
      {item.options ? <select id={`${group.id}-${index}`} value={answers[index] ?? ''} disabled={checked} onChange={(event) => setAnswers((current) => ({ ...current, [index]: event.target.value }))}><option value="">اختر الإجابة</option>{item.options.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input id={`${group.id}-${index}`} value={answers[index] ?? ''} disabled={checked} onChange={(event) => setAnswers((current) => ({ ...current, [index]: event.target.value }))} placeholder="اكتب الإجابة" />}
      {checked && <p className={feedback[index] ? 'lesson-six-feedback is-good' : 'lesson-six-feedback is-bad'}>{feedback[index] ? 'إجابة صحيحة.' : `الإجابة الصحيحة: ${item.answer}`}</p>}
    </div>)}</div>
    {!checked ? <button type="button" className="button button--primary" onClick={check}>تحقق من النشاط</button> : <button type="button" className="button button--secondary" onClick={() => { setChecked(false); setFeedback({}); setAnswers({}) }}>أعد المحاولة</button>}
  </section>
}

function FinalTest() {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState(0)

  function check() {
    // Objective questions are checked against their explicit labels; open questions receive a model answer after checking.
    const objectiveAnswers: Record<number, string> = { 1: 'الضمة', 2: 'الفتحة', 3: 'الكسرة', 4: 'السكون', 5: 'المدرسة', 6: 'صح', 7: 'خطأ', 8: 'صح', 9: 'خطأ', 10: 'صح' }
    const objectiveScore = Object.entries(objectiveAnswers).filter(([number, answer]) => normalize(answers[Number(number)]) === normalize(answer)).length
    setScore(objectiveScore)
    setChecked(true)
  }

  return <section className="official-test lesson-six-test" data-testid="lesson6-official-test">
    <div className="official-test__intro"><strong>اختبار نهاية الدرس</strong><span>٢٠ سؤالًا</span><p>أجب عن الأسئلة العشرين كاملة، مع المحافظة على الفئات والترقيم الرسمي.</p></div>
    {finalQuestions.map((question, index) => {
      const showHeading = index === 0 || finalQuestions[index - 1].section !== question.section
      return <div key={question.number}>{showHeading && <h3>{question.section}</h3>}<fieldset className="official-question lesson-six-official-question" disabled={checked}><legend><span className="question-number">{question.number}</span> {question.prompt}</legend>{question.options ? <div className="official-options">{question.options.map((option) => <label key={option}><input type="radio" name={`lesson6-q-${question.number}`} value={option} checked={answers[question.number] === option} onChange={() => setAnswers((current) => ({ ...current, [question.number]: option }))} /><span>{option}</span></label>)}</div> : <textarea rows={question.type === 'thinking' ? 5 : 3} value={answers[question.number] ?? ''} onChange={(event) => setAnswers((current) => ({ ...current, [question.number]: event.target.value }))} />}{checked && <p className="lesson-six-feedback is-good">الإجابة النموذجية: {question.answer}</p>}</fieldset></div>
    })}
    <div className="official-test__actions">{!checked ? <button type="button" className="button button--primary" onClick={check}>تحقق من الاختبار</button> : <><p className="official-test__result">النتيجة الموضوعية: <bdi>{score} / 10</bdi>، وراجِع الإجابات النموذجية للأسئلة المفتوحة.</p><button type="button" className="button button--secondary" onClick={() => { setChecked(false); setAnswers({}); setScore(0) }}>أعد الاختبار</button></>}</div>
  </section>
}

function TeacherArea() {
  return <TeacherSpace><div className="teacher-material teacher-material--lesson6">
    <h3>إجابات النشاط التطبيقي</h3>
    <h4>النشاط الأول</h4><ol><li>الطالبُ: <strong>مرفوع</strong></li><li>الكتابَ: <strong>منصوب</strong></li><li>المدرسةِ: <strong>مجرور</strong></li><li>العلمُ: <strong>مرفوع</strong></li><li>الحليبَ: <strong>منصوب</strong></li></ol>
    <h4>النشاط الثاني</h4><ol><li><strong>الضمة</strong></li><li><strong>الفتحة</strong></li><li><strong>الكسرة</strong></li><li><strong>السكون</strong></li></ol>
    <h4>النشاط الثالث</h4><ol><li>الفاعل <strong>مرفوع</strong>.</li><li>المفعول به <strong>منصوب</strong>.</li><li>المبتدأ <strong>مرفوع</strong>.</li><li>الخبر <strong>مرفوع</strong>.</li><li>الاسم بعد حرف الجر <strong>مجرور</strong>.</li></ol>
    <h3>الإجابات النموذجية لاختبار نهاية الدرس</h3>
    <ol>{finalQuestions.map((question) => <li key={question.number}><strong>{question.number}.</strong> {question.answer}{question.number === 18 && <FullParsing lines={['الطالبُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.', 'الواجبَ: مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره.']} />}{question.number === 19 && <FullParsing lines={['خالدٌ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.', 'المدرسةِ: اسم مجرور بـ إلى وعلامة جره الكسرة الظاهرة على آخره.']} />}</li>)}</ol>
    <h3>ملاحظات للمعلم</h3>
    <p>هذا الدرس من أهم الدروس التأسيسية، لذلك لا يُنصح بأن يكون هدف الطالب حفظ جميع العلامات الفرعية مباشرة.</p>
    <h4>يُدرَّس على مرحلتين</h4>
    <p><strong>المرحلة الأولى: الإتقان</strong></p>
    <p>يجب أن يحفظ الطالب جيدًا: <strong>رفع → ضمة، نصب → فتحة، جر → كسرة، جزم → سكون</strong>.</p>
    <p>ويجب أن يفهم: <strong>مبتدأ → مرفوع، خبر → مرفوع، فاعل → مرفوع، مفعول به → منصوب، بعد حرف الجر → مجرور</strong>.</p>
    <p><strong>المرحلة الثانية: التعرف</strong></p>
    <p>نعرض العلامات الفرعية لكي يعرف الطالب أن العلامة الأصلية ليست الوحيدة. يكفي في البداية أن يفهم مثلًا: <strong>طالبٌ → مرفوع بالضمة، طالبانِ → مرفوع بالألف، معلمونَ → مرفوع بالواو</strong>. ثم سنشرح سبب كل واحدة بالتفصيل في الدروس القادمة.</p>
    <h3>أخطاء متوقعة من الطالب</h3>
    <ol className="teacher-notes"><li><strong>حفظ الحركة دون فهم الوظيفة:</strong> قد يرى الطالب الضمة ويقول مباشرة: فاعل. وهذا خطأ؛ فالضمة قد تظهر على مبتدأ، خبر، فاعل، وغيرها. الحل: اسأل أولًا: ما وظيفة الكلمة؟ ثم ما حالتها الإعرابية؟ ثم ما علامة إعرابها؟</li><li><strong>الخلط بين النصب والجزم:</strong> النصب موجود في الأسماء والأفعال المضارعة بحسب الموقع والعامل، أما الجزم خاص بالفعل المضارع المعرب.</li><li><strong>اعتبار كل كسرة علامة جر:</strong> استخدم مثال كرَّمتُ الطالباتِ، واشرح أن الطالبات هنا مفعول به منصوب، لكن علامة نصبه الكسرة لأنه جمع مؤنث سالم.</li><li><strong>الخوف من العلامات الفرعية:</strong> لا تطلب من الطالب حفظ جميع تفاصيلها في هذا الدرس. قل له: سنأخذ المثنى، ثم جمع المذكر السالم، ثم جمع المؤنث السالم، ثم الأسماء الخمسة، ثم الأفعال الخمسة، وسنفهم كل علامة في مكانها.</li></ol>
    <h3>طريقة عملية للإعراب</h3>
    <p>علّم الطالب هذه الأسئلة الأربعة:</p><ol><li><strong>ما نوع الكلمة؟</strong> اسم أم فعل أم حرف؟</li><li><strong>ما وظيفتها؟</strong> مبتدأ؟ خبر؟ فاعل؟ مفعول به؟ اسم مجرور؟ فعل مضارع؟</li><li><strong>ما حالتها الإعرابية؟</strong> مرفوع؟ منصوب؟ مجرور؟ مجزوم؟</li><li><strong>ما علامة الإعراب؟</strong> ضمة؟ فتحة؟ كسرة؟ سكون؟ أم علامة فرعية؟</li></ol>
    <p><strong>قرأَ الطفلُ الكتابَ.</strong></p><p>الطفل: اسم → فاعل → مرفوع → بالضمة. الكتاب: اسم → مفعول به → منصوب → بالفتحة.</p>
    <h3>واجب منزلي مقترح</h3>
    <p><strong>أ. حدد الحالة الإعرابية للكلمة المحددة</strong></p><ol><li><strong>الطالبُ</strong> نشيطٌ.</li><li>قرأَ خالدٌ <strong>الكتابَ</strong>.</li><li>ذهبنا إلى <strong>الحديقةِ</strong>.</li><li>كتبَ <strong>المعلمُ</strong> الدرسَ.</li><li>شاهدَ الطفلُ <strong>القمرَ</strong>.</li></ol>
    <p><strong>ب. أكمل</strong></p><ol><li>علامة الرفع الأصلية __________.</li><li>علامة النصب الأصلية __________.</li><li>علامة الجر الأصلية __________.</li><li>علامة الجزم الأصلية __________.</li><li>الفاعل دائمًا __________.</li><li>المفعول به __________.</li><li>الاسم بعد حرف الجر __________.</li></ol>
    <p><strong>ج. أعرب الكلمات المحددة</strong></p><ol><li>حضرَ <strong>الطالبُ</strong>.</li><li>شاهدتُ <strong>الطائرَ</strong>.</li><li>جلستُ في <strong>الحديقةِ</strong>.</li><li>لم <strong>يخرجْ</strong> خالدٌ.</li></ol>
    <h3>خلاصة للحفظ السريع</h3><p><strong>حالات الإعراب أربع:</strong> الرفع – النصب – الجر – الجزم.</p><p><strong>العلامات الأصلية:</strong> الرفع → الضمة، النصب → الفتحة، الجر → الكسرة، الجزم → السكون.</p><p>وتوجد علامات فرعية، منها: الألف – الواو – الياء – الكسرة – الفتحة – ثبوت النون – حذف النون – حذف حرف العلة.</p><p>وتذكّر: المبتدأ مرفوع، الخبر مرفوع، الفاعل مرفوع، المفعول به منصوب، الاسم بعد حرف الجر مجرور، الجر خاص بالأسماء، والجزم خاص بالأفعال المضارعة المعربة.</p>
  </div></TeacherSpace>
}

function Homework() {
  return <EducationalCard title="واجب منزلي مقترح" eyebrow="تدريب بعد الدرس" tone="soft">
    <h3>أ. حدد الحالة الإعرابية للكلمة المحددة</h3><ol><li><strong>الطالبُ</strong> نشيطٌ.</li><li>قرأَ خالدٌ <strong>الكتابَ</strong>.</li><li>ذهبنا إلى <strong>الحديقةِ</strong>.</li><li>كتبَ <strong>المعلمُ</strong> الدرسَ.</li><li>شاهدَ الطفلُ <strong>القمرَ</strong>.</li></ol>
    <h3>ب. أكمل</h3><ol><li>علامة الرفع الأصلية __________.</li><li>علامة النصب الأصلية __________.</li><li>علامة الجر الأصلية __________.</li><li>علامة الجزم الأصلية __________.</li><li>الفاعل دائمًا __________.</li><li>المفعول به __________.</li><li>الاسم بعد حرف الجر __________.</li></ol>
    <h3>ج. أعرب الكلمات المحددة</h3><ol><li>حضرَ <strong>الطالبُ</strong>.</li><li>شاهدتُ <strong>الطائرَ</strong>.</li><li>جلستُ في <strong>الحديقةِ</strong>.</li><li>لم <strong>يخرجْ</strong> خالدٌ.</li></ol>
  </EducationalCard>
}

function QuickSummary() {
  return <>
    <EducationalCard title="خلاصة للحفظ السريع" eyebrow="الخلاصة" tone="accent">
      <p><strong>حالات الإعراب أربع:</strong> الرفع – النصب – الجر – الجزم.</p>
      <div className="lesson-six-golden-grid"><strong>الرفع → الضمة</strong><strong>النصب → الفتحة</strong><strong>الجر → الكسرة</strong><strong>الجزم → السكون</strong></div>
      <p>وتوجد علامات فرعية، منها: <strong>الألف – الواو – الياء – الكسرة – الفتحة – ثبوت النون – حذف النون – حذف حرف العلة.</strong></p>
    </EducationalCard>
    <div className="lesson-six-rule-list"><p><strong>المبتدأ مرفوع.</strong></p><p><strong>الخبر مرفوع.</strong></p><p><strong>الفاعل مرفوع.</strong></p><p><strong>المفعول به منصوب.</strong></p><p><strong>الاسم بعد حرف الجر مجرور.</strong></p><p><strong>الجر خاص بالأسماء، والجزم خاص بالأفعال المضارعة المعربة.</strong></p></div>
  </>
}

function normalize(value: string | undefined) {
  return (value ?? '').replace(/[ًٌٍَُِّْـ]/g, '').replace(/\s+/g, '').trim()
}
