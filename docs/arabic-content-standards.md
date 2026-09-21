# Arabic grammatical-parsing standard

When a lesson explicitly teaches or asks for **الإعراب**, its answer is a complete
parsing, not a role-only label. The parsing should include, at the level supported by
the lesson:

- the word with the vowel ending supported by the example;
- the grammatical role;
- the state/case (مرفوع، منصوب، مجرور, etc.) when applicable;
- the علامة and its description (for example, `الضمة الظاهرة على آخره`); and
- مبني/معرب information when it is relevant to the word.

Use the construction that is correct for the word. For example:

- `كتبَ: فعل ماضٍ مبني على الفتحة الظاهرة على آخره.`
- `الطالبُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره.`
- `الدرسَ: مفعول به منصوب وعلامة نصبه الفتحة الظاهرة على آخره.`

A role-identification exercise (for example, “استخرج الفاعل”) is not automatically
an إعراب exercise. Do not add advanced analysis to ordinary vocabulary, extraction,
or classification activities. However, once a lesson labels an answer as parsing or
presents a solved parsing example, the full form above is required. Do not invent an
object in a sentence that has none, and use the appropriate construction for
prepositional phrases, defective verbs, feminine past verbs, and other exceptions.

This standard is checked by `npm run check:parsing`. Update that focused audit when a
new lesson introduces a clearly identified parsing block.
