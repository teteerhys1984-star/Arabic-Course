# Lesson 1 — Authoritative Source Inventory

This inventory is the fidelity contract for the course-wide presentation/architecture
refactor. Every authoritative section, example, exercise, question, answer key, and
teacher note listed here **must still exist** after the refactor. The refactor changes
only presentation/architecture (routing, homepage index, one long page, section
navigation, narrative framing, WhatsApp removal). No source content may be summarized,
shortened, paraphrased, condensed, omitted, replaced, or silently rewritten.

## Lesson metadata

- الدرس الأول: أقسام الكلام
- العنوان: الاسم والفعل والحرف

## Authoritative sections (anchors preserved)

| # | Anchor id | Section title |
|---|-----------|---------------|
| 1 | `lesson-overview` | الهدف من الدرس |
| 2 | `speech` | أولاً: ما هو الكلام؟ |
| 3 | `parts` | ثانيًا: أقسام الكلام |
| 4 | `noun` | القسم الأول: الاسم |
| 4a | `al-definition` | العلامة الأولى: دخول (الـ) التعريف |
| 4b | (in `noun`) | العلامة الثانية: التنوين |
| 4c | (in `noun`) | العلامة الثالثة: دخول حرف الجر |
| 4d | (in `noun`) | العلامة الرابعة: النداء |
| 4e | (in `noun`) | خلاصة علامات الاسم |
| 5 | `verb` | القسم الثاني: الفعل |
| 5a | `past` | أولاً: الفعل الماضي |
| 5b | `present` | ثانيًا: الفعل المضارع (أ – ن – ي – ت / أنيت) |
| 5c | `imperative` | ثالثًا: فعل الأمر |
| 5d | (in `verb`) | مقارنة بين أنواع الفعل |
| 6 | `particle` | القسم الثالث: الحرف |
| 7 | `classification` | كيف أميز بين أقسام الكلام؟ (أمثلة تطبيقية محلولة) |
| 8 | `activities` | نشاط صفّي ممتع (لعبة المحقق اللغوي + تحدي 5 ثوانٍ) |
| 9 | `summary` | ملخص الدرس للحفظ |
| 10 | `final-test` | اختبار نهاية الدرس — 20 سؤالًا رسميًا |
| 11 | `teacher-space` | منطقة خاصة بالمعلم (الإجابات النموذجية + ملاحظات المعلم) |

## Interactive experiences (all preserved)

- Noun-sign reveal cards (`NounSignCard`) — العلامة الأولى…الرابعة.
- أ – ن – ي – ت interaction (`AynActivity`).
- Verb classification (`VerbClassificationActivity`).
- Worked-example reveals (`<details className="worked-example">`).
- Grammar Detective (`GrammarDetective`) — لعبة المحقق اللغوي.
- Five-second challenge (`FiveSecondChallenge`) — تحدي 5 ثوانٍ.
- Official final test (`OfficialTest`) — SELECT → change → CHECK → reveal.

## Official final test

- Exactly **20** questions (`officialQuestions`), numbered 1–20.
- Questions 1–6 اختيار من متعدد, 7–10 صح/خطأ, 11–13 حدد نوع الكلمة, 14–20 تطبيق عملي.
- Behaviour: student selects, may change the answer, presses تحقق, then correctness is
  revealed. Correctness is **not** revealed on selection. Open-response questions remain
  free-text answer fields.

## Teacher Space (gated)

- Password gate preserved (front-end-only presentation gate).
- الإجابات النموذجية for all 20 questions.
- تصحيح السؤال 8 / تصحيح السؤال 10.
- الأخطاء المتوقعة عند الطالب.
- معيار إتقان الدرس.

## Removed by this refactor (presentation only)

- WhatsApp / contact block ("تواصل عبر واتساب", "للاستفسار أو متابعة الدرس، تواصل عبر
  الرقم التالي.") removed from the top and bottom of the lesson and from the reusable
  lesson architecture. No replacement contact block is added. This is now a course-wide
  rule for all future lessons.
