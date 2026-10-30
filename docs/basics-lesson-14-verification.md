# تقرير التحقق — الدرس 14 «الأسماء الخمسة»

الفرع: `arena/4917ab4e-arabic-course` — أساس العمل: `37edba737b09d690ce072399d7d7befb50c5cfef`
التاريخ: 2026-10-30 — بيئة التنفيذ: Node `v22.22.3`، npm `10.9.8`، Vitest (بيئة jsdom)، Vite `8.3.0`.

كل الأرقام أدناه مأخوذة من تشغيل فعلي في هذه الجلسة؛ لم يُنقل أي ناتج من مصادر سابقة، ولم يُدَّع اختبار لم يُجرَ.

## 1. الأوامر ونتائجها الفعلية

| # | الأمر | النتيجة الفعلية |
|---|---|---|
| 1 | `npx tsc -b` | نجاح، مخرج فارغ، رمز الخروج `0` |
| 2 | `npm run lint` | رمز الخروج `0`، **0 أخطاء و0 تحذيرات** (بعد حذف تصديرات التدقيق غير المستخدمة) |
| 3 | `npm run check:rtl` | `RTL foundation check passed.` |
| 4 | `npm run check:architecture` | `Course architecture check passed: … the five permanent sections with every lesson declaring its sectionId, hash routing with unchanged lesson deep links, …` |
| 5 | `npm run check:test-ux` | `Test UX check passed: … enforced for all 40 lessons` |
| 6 | `npm run check:parsing` | `Parsing audit passed: …` (بعد إضافة `basics-lesson-14/content.ts` إلى الملفات المفحوصة وخمس عبارات إعراب مميزة) |
| 7 | `npm run check:lesson12` | `Lesson 12 structural audit passed: … previous source unchanged, no unit test (lessons 13 and 14 are later, independent registrations).` |
| 8 | `npm run check:lesson13` | `Lesson 13 structural audit passed: … previous source unchanged, no lesson-14 id in this lesson and no unit test.` |
| 9 | `npm run check:basics-lesson-14` | **جديد**: `Basics lesson 14 structural audit passed: unique basics registration after lesson 13, verbatim source archived, 7 objectives, 20 audited axes mapped to real steps, 5 names, 3 signs, 5 conditions, 20 comparison rows/5 types, 5 common errors, 8 challenge keys, 20 exam questions (5/4/6/5 = 20 points), 6 manual parsings with the four elements, 3 homework activities with criteria, mind map, summary, mastery challenge, teacher guide, disclosure gates, previous source unchanged, no spelling/morphology lesson 14 and no unit test.` |
| 10 | `npm run check:morphology-source` | `Morphology source audit passed …: thirteen basics lessons (original 1–12 unchanged), exactly thirteen lessons in الصرف (١–١٣), …` |
| 11 | `npx vitest run` (كامل) | **93 ملفًا / 1051 اختبارًا — كلها ناجحة**، بلا فشل |
| 12 | `npm run validate` | رمز الخروج `0`: 36 خطوة متسلسلة (34 فحصًا + `test` + `build`) |
| 13 | `npm run build` | `✓ 190 modules transformed.` — `✓ built in 959ms` (المدى المرصود في التشغيلين: 918–959 مللي ثانية) |

> تحذير بناء واحد متبقٍّ (سابق للمهمة، غير متعلق بالدرس): `(!) Some chunks are larger than 500 kB after minification … index-*.js 3,900.89 kB │ gzip: 786.75 kB`. لم يُعالَج لأنه خارج نطاق المهمة (لا تغيير في الاعتماديات أو إعدادات البناء).

## 2. اختبارات الدرس 14 نفسها

`npx vitest run src/lessons/basics-lesson-14` → **3 ملفات / 24 اختبارًا، كلها ناجحة**:

- `content.test.ts` — 14 اختبارًا:
  - تسجيل واحد في نهاية `basics-grammar` (14 رابطًا)، عدم وجود `spelling-lesson-14`/`morphology-lesson-14`، بقاء `lesson-8` («الأسماء الخمسة») بلا مساس.
  - مطابقة بايتية مع `docs/lesson-12-source-inventory.json` بعد استبعاد إدخالات الدروس 12 و13 و`morphology-lesson-13` و`spelling-lesson-13` و`basics-lesson-14` (102+ ملفًا مشتركًا لم يتغيّر).
  - بصمة المصدر الحرفي + تطبيق التصحيحات ت-1 … ت-6 بقيمها النصية.
  - 20 محورًا مدقَّقًا مرتبطًا بخطوات حقيقية، 7 أهداف، 5 أسماء، 3 علامات، 5 شروط، 5 صفوف مقارنة، 5 أخطاء شائعة، خريطة ذهنية، خلاصة، الدرس التالي.
  - اكتمال الإعراب في **45 مثالًا/جملة** (وظيفة + حالة + علامة + سبب)، ودقّة قاعدة ياء المتكلم، وحدود «فو/فم»، والواجب المنزلي (3 أنشطة، 5 جمل + 5 إعرابات + 5 نماذج إنشاء + 4 معايير).
  - مفتاح التدريب الثمانية مطابق للمصدر، وتصحيح كل خيار على حِدة (لا قبول مزدوج).
  - الاختبار: 20 سؤالًا، صفحات 5/4/6/5، مفاتيح 1–20، السؤال 6 بخمسة حقول، 6 إعرابات إنشائية بمراجعة يدوية (14 آلي + 6 يدوي = 20)، وقبول صيغ بديلة، ورفض الصيغة الخاطئة.
- `flow.test.tsx` — 5 اختبارات: فتح الدرس من فهرس القسم (14 رابطًا، آخرها `#/lesson/basics-lesson-14`)، RTL، **خطوة واحدة مُركَّبة في كل مرة**، أسماء وصفية لكل `role="img"`, «صحّح إجاباتي» يعمل ويشرح ويعيد المحاولة ويصفر العدّاد، حفظ الصفحات الأربع دون تغذية راجعة، التسليم ثم الكشف فقط، إبطال الكشف بعد أي تعديل، لوحة المعلم محجوبة بكلمة المرور المشتركة، وحلول الواجب مخفية حتى الطلب، وعدم تسرّب أي حل في خطوات الطالب.
- `responsive.test.ts` — 5 اختبارات: قواعد الجوال للجداول (`display: block` + `content: attr(data-label)` + `caption` بعرض كامل)، `min-height: 48px`، `overflow-wrap: anywhere`، `:focus-visible`، لون `#40594f`، عدم وجود `white-space: nowrap` ولا خصائص اتجاه فيزيائية (`left/right`)، ووجود `dir="rtl"` و`<bdi>`.

## 3. فحوص التسجيل والتكامل

- المعرّف `basics-lesson-14` موجود مرة واحدة فقط، داخل `basics-grammar`، بترتيب `lesson-1 … lesson-13, basics-lesson-14`، ولا تغيير في ترتيب الدروس السابقة.
- `src/app/App.tsx` يعرض `<LessonBasicsFourteen onFinish={finishLesson} />` للمعرّف الجديد؛ العمق `#/lesson/basics-lesson-14` يعمل، و`App.test.tsx` يتحقق من وجود البطاقة في شبكة القسم وعدد الروابط (14) ومسار كل بطاقة.
- `/lesson/lesson-9` («كان وأخواتها») هو الدرس التالي المشار إليه، وهو مسار مسجَّل حقيقي، وليس رابطًا مكسورًا.
- لا تعارض مع `spelling-lesson-14` أو `morphology-lesson-14` (غير موجودين، ولا ملف لهما).
- `lessonConformance.test.ts` أصبح يغطي 40 درسًا (39 → 40) ويمرّ.

## 4. التحقق من عدم تسريب الحلول (من الطالب)

مُتحقَّق منه **اختبارًا فعليًا** لا تأكيدًا نظريًا:

1. قبل التصحيح: `test-feedback-<id>` غير موجود في شجرة DOM لصفحة التدريب.
2. في خطوات الاختبار الأربع: `revealFeedback={false}`، فلا تغذية راجعة ولا حلول، ولا يوجد أي عنصر `data-testid` يبدأ بـ`solution-fourteen-exam`.
3. زر «كشف نموذج الإجابة» مُعطَّل (`disabled`) قبل التسليم، و`aria-expanded` لا يصبح صحيحًا إلا بعد `submitted`.
4. بعد التسليم يعرض `SolutionsArea` كل الأسئلة العشرين؛ وأي تعديل على إجابة يُرجع `submitted` إلى `false` فيختفي الكشف ويُعطَّل الزر من جديد (مُختبَر).
5. حلول الواجب تظهر فقط بعد زر «عرض الحلول النموذجية».
6. دليل المعلم كاملًا (مع مفاتيح 28 سؤالًا + نماذج الواجب + معايير التصحيح) لا يُركَّب في DOM إلا داخل `TeacherSpace` بعد كلمة المرور المشتركة (`somer173`).

**تنبيه صريح**: آلية `TeacherSpace` حماية أمامية بسيطة (كلمة مرور في الواجهة) وليست مصادقة أمنية حقيقية؛ لم تُعدَّل هذه الآلية العامة ولم يُدَّع أنها أمان فعلي.

## 5. الاستجابة (جوال/سطح مكتب)

- لا يوجد متصفح حقيقي متاح في بيئة التنفيذ، لذلك **لم تُجرَ مراجعة بصرية ولا لقطات شاشة**، ولا يُدَّعى خلاف ذلك.
- ما تم فعليًا: (أ) اختبارات jsdom للتفاعل عبر الأدوار والأسماء فقط (لا تعتمد على عرض أو تحويم)، (ب) فحص CSS ساكن عبر `responsive.test.ts` و`check:rtl` و`check:test-ux`.
- أُشغّل خادم المعاينة `npm run dev` فعليًا: `VITE v8.3.0 ready` على المنفذ `5173` (`0.0.0.0`, `allowedHosts: true`)، و`GET /Arabic-Course/` و`GET /Arabic-Course/src/lessons/LessonBasicsFourteen.tsx` أعادا `200`، والوحدة تُحوَّل عبر Vite دون خطأ. هذا يثبت أن الوحدة تُبنى وتُخدَم، ولا يثبت المظهر البصري.

## 6. حدود وقيود متبقية

1. **تكرار موضوعي مع `lesson-8`**: الدرس الثامن يحمل عنوان «الأسماء الخمسة» أصلًا. لم يُعدّل ولم يُحذف ولم يُغيّر ترتيبه؛ الدرس 14 درس مستقل جديد كما طُلب. التفصيل في `docs/basics-lesson-14-audit.md` §5.
2. **نصّ قديم في الدرس 13**: خطوة «الدرس التالي» في الدرس 13 ما زالت تقول إن درس الأسماء الخمسة «لم يُنشأ ولم يُسجَّل بعد». صار غير مطابق للواقع بعد هذه المهمة، لكن الدرس 13 خارج النطاق وتثبّت اختباراته ذلك النص. موثّق في `docs/basics-lesson-14-audit.md` §7، ويحتاج مهمة مستقلة.
3. **الحماية**: حماية أمامية فقط (انظر §4).
4. **التصحيح الآلي للإعراب**: غير موجود في المنصة، فالأسئلة 10–15 تُراجع يدويًا وتُحتسب 6 درجات منفصلة عن 14 درجة آلية؛ المجموع 20، والدرجة المعروضة هي مجموع الأسئلة.
5. **تحذير حجم الحزمة** (>500 kB) سابق للمهمة وغير متعلق بها.

## 7. الملفات

جديدة: `docs/source/lesson-14-five-nouns.md`، `docs/basics-lesson-14-audit.md`، `docs/basics-lesson-14-verification.md`، `scripts/check-basics-lesson-14.mjs`، `src/lessons/LessonBasicsFourteen.tsx`، `src/lessons/basics-lesson-14/{content.ts,lesson.css,content.test.ts,flow.test.tsx,responsive.test.ts}`.

معدّلة: `src/lessons/registry.ts`، `src/app/App.tsx`، `package.json`، `scripts/check-lesson12.mjs`، `scripts/check-lesson13.mjs`، `scripts/check-morphology-source.mjs`، `scripts/check-parsing.mjs`، `src/shared/test/lessonConformance.test.ts`، وتوقعات الأعداد في `src/app/App.test.tsx`، `src/lessons/lesson-eleven/{content,flow}.test.*`، `src/lessons/lesson-twelve/{content,flow}.test.*`، `src/lessons/lesson-thirteen/{content,flow}.test.*`، `src/lessons/morphology-lesson-{08,09,10,11}/registration.test.ts`، `src/lessons/morphology-lesson-12/flow.test.tsx`.
