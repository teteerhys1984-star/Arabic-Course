import { readdirSync } from 'node:fs'

/**
 * Shared scope assertion used by the EXISTING morphology source guards.
 * Exact whitelist, not a looser upper bound: reject omissions, duplicates,
 * reordering, lesson 11+, unrouted components and a morphology unit assessment.
 * Text-only Arabic next-lesson teasers remain allowed in the source documents.
 */
export function morphologyScopeIssues(registry, app) {
  const failures = []
  const ordinals = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']
  const expected = ordinals.map((_, index) => `morphology-lesson-${String(index + 1).padStart(2, '0')}`)
  const entries = [...registry.matchAll(/\{\s*id:\s*['"]([^'"]+)['"],([\s\S]*?)\n  \}/g)]
  const actual = entries.filter((match) => /sectionId:\s*['"]morphology['"]/.test(match[2])).map((match) => match[1])
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    failures.push('Morphology scope: exactly lessons 01–10 must appear once, in order; no lesson 11 or unit assessment.')
  }
  const routes = [...app.matchAll(/lesson\.id\s*===\s*['"](morphology-lesson-\d+)['"]/g)].map((match) => match[1]).sort()
  if (JSON.stringify(routes) !== JSON.stringify(expected)) {
    failures.push('Morphology scope: App routes must cover exactly lessons 01–10 once; lesson 11 is forbidden.')
  }
  for (const [index, ordinal] of ordinals.entries()) {
    const route = new RegExp(`lesson\\.id\\s*===\\s*['"]${expected[index]}['"]\\s*\\?\\s*\\(\\s*<LessonMorphology${ordinal}\\b`)
    if (!route.test(app)) failures.push(`Morphology scope: ${expected[index]} must route to LessonMorphology${ordinal}.`)
  }
  const names = readdirSync('src/lessons')
  const components = names.filter((name) => /^LessonMorphology.+\.tsx$/.test(name)).sort()
  if (JSON.stringify(components) !== JSON.stringify(ordinals.map((name) => `LessonMorphology${name}.tsx`).sort())) {
    failures.push('Morphology scope: only the ten known lesson components may exist; lesson 11 is forbidden.')
  }
  const directories = names.filter((name) => /^morphology-lesson-/.test(name)).sort()
  if (JSON.stringify(directories) !== JSON.stringify(expected)) {
    failures.push('Morphology scope: only lesson directories 01–10 may exist; lesson 11 is forbidden.')
  }
  if (names.some((name) => /morphology.*unit|unit.*morphology/i.test(name))) {
    failures.push('Morphology scope: no unit assessment may be created.')
  }
  return failures
}
