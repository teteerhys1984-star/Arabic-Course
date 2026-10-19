/// <reference types="node" />
// @vitest-environment node
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { lessonRegistry } from '../registry'
import { getSectionLessons, sectionRegistry } from '../../sections/sectionRegistry'

const expectedIds = Array.from({ length: 13 }, (_, index) => `morphology-lesson-${String(index + 1).padStart(2, '0')}`)
const guards = ['check-morphology-lesson-01.mjs', 'check-morphology-lesson-02.mjs', 'check-morphology-source.mjs']
const root = resolve('.')
let sandbox: string
let registrySource: string
let appSource: string

function runGuards(cwd: string) {
  return guards.map((guard) => ({
    guard,
    ...spawnSync(process.execPath, ['--experimental-strip-types', '--no-warnings', `scripts/${guard}`], {
      cwd, encoding: 'utf8', timeout: 30_000,
    }),
  }))
}
function expectRejected() {
  for (const result of runGuards(sandbox)) {
    expect(result.status, `${result.guard}: ${result.stdout}\n${result.stderr}`).toBe(1)
    expect(result.stderr).toContain('Morphology scope:')
  }
}

describe('morphology registration — the thirteen section-local lesson ids', () => {
  beforeAll(() => {
    sandbox = mkdtempSync(join(tmpdir(), 'arabic-morph12-guards-'))
    for (const directory of ['src', 'docs', 'scripts']) cpSync(join(root, directory), join(sandbox, directory), { recursive: true })
    cpSync(join(root, 'package.json'), join(sandbox, 'package.json'))
    registrySource = readFileSync(join(root, 'src/lessons/registry.ts'), 'utf8')
    appSource = readFileSync(join(root, 'src/app/App.tsx'), 'utf8')
  })
  afterAll(() => rmSync(sandbox, { recursive: true, force: true }))

  it('registers 01–13 once, in order, inside morphology, while preserving the separate basics lesson 12', () => {
    expect(getSectionLessons('morphology').map((lesson) => lesson.id)).toEqual(expectedIds)
    expect(new Set(lessonRegistry.map((lesson) => lesson.id)).size).toBe(lessonRegistry.length)
    expect(getSectionLessons('morphology').map((lesson) => lesson.number)).toEqual(['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠', '١١', '١٢', '١٣'])
    expect(getSectionLessons('morphology')[10]).toMatchObject({
      id: 'morphology-lesson-11',
      title: 'اسم الفاعل: كيف نعرف مَن قام بالفعل؟',
      documentTitle: 'الدرس الحادي عشر: اسم الفاعل',
      sectionId: 'morphology',
      strand: 'الصرف',
      available: true,
    })
    expect(getSectionLessons('morphology')[11]).toMatchObject({
      id: 'morphology-lesson-12',
      title: 'اسم المفعول: كيف نعرف مَن وقع عليه الفعل؟',
      documentTitle: 'الدرس الثاني عشر: اسم المفعول',
      sectionId: 'morphology',
      strand: 'الصرف',
      available: true,
    })
    expect(getSectionLessons('morphology')[9]).toMatchObject({ title: 'أنواع المصادر وأوزانها', available: true })
    expect(getSectionLessons('basics-grammar').map((lesson) => lesson.id)).toEqual(
      Array.from({ length: 13 }, (_, index) => `lesson-${index + 1}`),
    )
    expect(getSectionLessons('basics-grammar')[11].id).toBe('lesson-12')
    expect(getSectionLessons('spelling').length).toBeGreaterThan(0)
    expect(sectionRegistry.map((section) => section.id)).toEqual([
      'basics-grammar', 'morphology', 'spelling', 'rhetoric', 'reading-expression',
    ])
    expect(lessonRegistry.some((lesson) => /unit/i.test(lesson.id))).toBe(false)
    expect(lessonRegistry.some((lesson) => lesson.id === 'morphology-lesson-13')).toBe(true)
  })

  it('keeps the prior morphology guards valid with exactly thirteen lessons', () => {
    for (const result of runGuards(sandbox)) expect(result.status, `${result.guard}: ${result.stderr}`).toBe(0)
  })

  it('rejects lesson 14 even when it replaces lesson 13', () => {
    try {
      writeFileSync(join(sandbox, 'src/lessons/registry.ts'), registrySource.replace("id: 'morphology-lesson-13'", "id: 'morphology-lesson-14'"))
      expectRejected()
    } finally {
      writeFileSync(join(sandbox, 'src/lessons/registry.ts'), registrySource)
    }
  })

  it('rejects a duplicate lesson 11 with lesson 10 dropped, even when the count remains thirteen', () => {
    try {
      writeFileSync(join(sandbox, 'src/lessons/registry.ts'), registrySource.replace("id: 'morphology-lesson-10'", "id: 'morphology-lesson-11'"))
      expectRejected()
    } finally {
      writeFileSync(join(sandbox, 'src/lessons/registry.ts'), registrySource)
    }
  })

  it('rejects a wrong lesson-12 route and an unregistered lesson-14 component', () => {
    try {
      writeFileSync(join(sandbox, 'src/app/App.tsx'), appSource.replace('<LessonMorphologyTwelve onFinish=', '<LessonMorphologyEleven onFinish='))
      expectRejected()
    } finally {
      writeFileSync(join(sandbox, 'src/app/App.tsx'), appSource)
    }
    const path = join(sandbox, 'src/lessons/LessonMorphologyFourteen.tsx')
    try {
      writeFileSync(path, '// forbidden future lesson fixture\n')
      expectRejected()
    } finally {
      rmSync(path)
    }
  })

  it('rejects a morphology unit assessment without weakening the lesson sequence', () => {
    try {
      writeFileSync(join(sandbox, 'src/lessons/registry.ts'), registrySource.replace("id: 'morphology-lesson-12'", "id: 'morphology-unit-test'"))
      expectRejected()
    } finally {
      writeFileSync(join(sandbox, 'src/lessons/registry.ts'), registrySource)
    }
  })
})
