# معيار اختبارات الدروس ومنطقة الحلول — Lesson test & solutions standard

هذا المعيار **ملزِم لكل درس في المنصة، الحالي والقادم**. لا يُعتبر الدرس مكتملًا إلا إذا
اجتاز التحقق الآلي: `npm run check:test-ux` و`npm run test`
(`src/shared/test/lessonConformance.test.ts`).

> The platform's two non-negotiable test rules — page-level checking and a
> structured solutions area — are implemented **once** in shared code
> (`src/shared/test/`) and enforced by automated validation. A lesson supplies
> **data** (`testDefinition`); it never re-implements test behaviour.

---

## 1. البنية المشتركة — the shared architecture

```
LessonFlow step → TestRunner (or TestPageView per step)
                      ↓
            useTestEngine (answers + per-page results, owned by the lesson component)
                      ↓
       grading.ts (pure: per-page grading + final aggregation)
                      ↓
            SolutionsArea (structured solutions, revealed per checked page)
```

| الملف | المسؤولية |
| --- | --- |
| `src/shared/test/types.ts` | `TestDefinition` / `TestPage` / `TestQuestion` / `TestField` + الحالات الأربع |
| `src/shared/test/grading.ts` | تصحيح خالص: `gradePage`, `combinePageResults`, `questionStatus` |
| `src/shared/test/useTestEngine.ts` | حالة الإجابات ونتائج الصفحات، والتحقق وإعادة التحقق والتصفير |
| `src/shared/test/components/TestPageView.tsx` | صفحة اختبار واحدة + زر «تحقّق من الإجابات» في نهايتها |
| `src/shared/test/components/TestRunner.tsx` | اختبار متعدد الصفحات + النتيجة النهائية |
| `src/shared/test/components/SolutionsArea.tsx` | منطقة الحلول الموحّدة (للطالب وللمعلم) |

**المحرك يعيش في مكوّن الدرس** (فوق `LessonFlow`)، لأن `LessonFlow` يُركّب خطوة واحدة فقط
في كل لحظة؛ فلو عاشت الحالة داخل الخطوة لضاعت إجابات الطالب عند التنقل.

```tsx
export function LessonX({ onFinish }: Props) {
  const testEngine = useTestEngine(testDefinition)   // ← هنا، لا داخل الخطوة
  const steps = [
    step('test', 'اختبار الدرس', 'الاختبار', '🏁', (
      <TestRunner test={testDefinition} engine={testEngine} testId="lessonX-official-test" />
    )),
    step('solutions', 'حلول الاختبار', 'الاختبار', '📗', (
      <SolutionsArea test={testDefinition} engine={testEngine} />
    )),
  ]
  return <LessonFlow steps={steps} onFinish={onFinish} />
}
```

---

## 2. التحقق على مستوى الصفحة — page-level checking (إلزامي)

كل صفحة اختبار تنتهي بزر **«تحقّق من الإجابات»**، والسلوك المضمون:

1. **التحقق يقيّم الصفحة الحالية فقط.** لا يحتاج الطالب إلى إكمال بقية الصفحات
   — ولا حتى بقية أسئلة الصفحة — قبل التحقق. الأسئلة غير المجابة تُحتسب «لم تُجب».
2. **تمييز أربع حالات** لكل سؤال:
   | الحالة | المعنى |
   | --- | --- |
   | `correct` — إجابة صحيحة | كل الحقول الآلية صحيحة |
   | `wrong` — إجابة غير صحيحة | أُجيب، وفيه حقل آلي خاطئ |
   | `unanswered` — لم تُجب | الحقول الآلية غير مكتملة |
   | `manual` — يُراجع يدويًا | سؤال مقالي أُجيب، يراجعه المعلم ولا يُصحَّح آليًا |
3. **الإجابات محفوظة أثناء التنقل** بين خطوات الدرس وبين صفحات الاختبار.
4. **إعادة التحقق بعد التعديل بلا تكرار:** تعديل إجابة يُبطل نتيجة صفحتها، وإعادة
   التحقق **تستبدل** النتيجة (النتائج مفهرسة بمعرّف الصفحة) فلا تُحتسب مرتين.
   الحقول تبقى قابلة للتعديل بعد التحقق — لا تُقفل.
5. **النتيجة النهائية** تجمع **أحدث نتيجة صالحة** لكل صفحة، وتظهر فقط بعد التحقق من
   كل الصفحات (`combinePageResults`).
6. **لا كشف قبل الأوان:** التحقق من صفحة لا يكشف إطلاقًا حلول الصفحات غير المتحقق منها.

**ممنوع** (ترفضه `scripts/check-test-ux.mjs`): زر تحقق واحد لكل الاختبار،
`disabled={!allAnswered}` في الاختبار، قفل الحقول بعد التسليم (`disabled={submitted}`)،
أو مكوّن اختبار/حلول خاص بالدرس (`TestArea` / `OfficialTest` / `FinalTest` / `SolutionsArea` محلي).

> **الأنشطة التطبيقية** (الدرس، لا الاختبار) تحتفظ بأزرارها «تحقق من النشاط»؛ المعيار
> هنا يخصّ اختبارات الدروس واختبارات الوحدات.

---

## 3. منطقة الحلول الموحّدة — the structured solutions area (إلزامي)

تُعرض كل الحلول عبر `SolutionsArea` المشتركة، بالترتيب الموحّد نفسه:

| الحقل | المصدر في البيانات | ملاحظات |
| --- | --- | --- |
| عنوان الاختبار | `testDefinition.title` | يظهر مرة واحدة أعلى المنطقة |
| رقم السؤال + إشارة موجزة للسؤال | `question.number` + `question.prompt` (+ `sentence`) | ليبقى الحل قابلًا للمسح بالعين |
| حالة الإجابة | من نتيجة الصفحة | صحيحة / غير صحيحة / لم تُجب / يُراجع يدويًا |
| إجابة الطالب | من إجابات المحرك | تظهر حين توجد |
| **الإجابة الصحيحة** | `question.solution` أو إجابات الحقول | لا تظهر للسؤال المقالي البحت إلا للمعلم |
| القاعدة | `question.rule` | اختياري |
| **التفسير الواضح** | `question.explanation` | **لا يُختصر** إلى حد يفقده قيمته التعليمية |
| مثال إضافي | `question.example` | **فقط عند الفائدة**، لا حشو |
| الإعراب الكامل | `question.parsing` | عند وجوده (معيار `docs/arabic-content-standards.md`) |
| **الجواب المعتمد من المصدر** | `question.sourceAnswer` | يميّز الجواب المنقول عن المصدر |
| **توضيح تعليمي من المنصة** | ضمنيًا حين لا يوجد `sourceAnswer` | يميّز ما أعدّته المنصة |
| **يُراجع يدويًا** | حقل `essay` | شارة صريحة |

**قاعدة الكشف:** في وضع الطالب تُكشف حلول الصفحة **بعد التحقق منها فقط**؛ الصفحات
الأخرى تبقى مقفلة («تحقّق من هذه الصفحة أولًا…»). وفي منطقة المعلم
(`mode="teacher"`) يظهر كل شيء، بما فيه `teacherAnswer` التفصيلي.

**ممنوع:** حلول وهمية أو صفحات اختبار مصطنعة لمجرد استيفاء الشكل. كل سؤال يجب أن
يملك حلًّا حقيقيًا (`solution`/حقول) أو إجابة معلم (`teacherAnswer`) — تتحقق منه
`lessonConformance.test.ts`.

---

## 4. كيف تضيف اختبار درس جديد — authoring a future lesson test

1. **صف الاختبار بيانات** في ملف الدرس (أو في `src/lessons/<lesson>/content.ts`):

```ts
export const testDefinition: TestDefinition = {
  id: 'lesson-11-final-test',
  title: 'اختبار نهاية الدرس',
  matching: 'strict',           // 'loose' يتجاهل الحركات في حقول الاختيار
  description: 'تحقّق من كل صفحة على حدة…',
  pages: [
    {
      id: 'page-1',
      title: 'أولًا: اختر الإجابة الصحيحة',
      questions: [
        {
          id: 'q1',
          number: 1,
          type: 'اختيار من متعدد',
          prompt: '…',
          fields: [{ kind: 'choice', options: ['أ', 'ب'], answer: 'ب' }],
          solution: 'ب',
          explanation: 'لأن…',           // تفسير حقيقي، غير مختصر
          sourceAnswer: 'ب',             // عند وجود جواب معتمد في المصدر
        },
      ],
    },
  ],
}
```

2. **اعرضه** عبر `TestRunner` (أو `TestPageView` لكل مجموعة كخطوة مستقلة)، واعرض
   الحلول عبر `SolutionsArea`، مع محرك واحد مشترك بينهما.
3. **سجّل الدرس** في `src/lessons/lessonConformance` list:
   أضف `testDefinition` إلى `lessonTests` في
   `src/shared/test/lessonConformance.test.ts` — عندها يسري المعيار عليه آليًا.
4. **شغّل** `npm run validate`.

### أنواع الحقول المتاحة

| النوع | الاستعمال | التصحيح |
| --- | --- | --- |
| `choice` | اختيار من متعدد / صح وخطأ (أزرار راديو) | آلي |
| `select` | قائمة منسدلة | آلي |
| `multi` | اختيار متعدد (مجموعة) | آلي، بلا ترتيب |
| `text` | كتابة كلمة/جذر/وزن | آلي بمفتاح مرن (تتجاهل الحركات والتطويل) |
| `essay` | تعليل وتفكير وإجابة مفتوحة | **لا يُصحَّح آليًا** → «يُراجع يدويًا» |

`revealEssaySolution: true` تُظهر الإجابة النموذجية للسؤال المقالي للطالب بعد التحقق
(تستعملها الدروس التي يعرض مصدرها الإجابة مباشرة).

---

## 5. التحقق الآلي — enforcement

| الأمر | ما يضمنه |
| --- | --- |
| `npm run check:test-ux` | وجود الإطار المشترك وسلوكه، واستعمال **كل** درس له، ورفض الأنماط القديمة |
| `npm run test` → `lessonConformance.test.ts` | سلامة `testDefinition` لكل درس: صفحات، معرّفات فريدة، حقول صحيحة، حل لكل سؤال، تحقق صفحة واحدة لا يمسّ غيرها، وتجميع بلا تكرار |
| `npm run test` → `grading/useTestEngine/TestPageView/TestRunner/SolutionsArea` | الحالات الأربع، التعديل وإعادة التحقق، بقاء الإجابات، التجميع النهائي، وعدم كشف حلول الصفحات غير المتحقق منها |
| `npm run validate` | السلسلة الكاملة (lint + كل الفحوص + الاختبارات + البناء) |

