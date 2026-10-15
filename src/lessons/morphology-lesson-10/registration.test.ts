/// <reference types="node" />
// @vitest-environment node
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { lessonRegistry } from '../registry'
import { getSectionLessons, sectionRegistry } from '../../sections/sectionRegistry'

const expectedIds = Array.from({ length: 10 }, (_, index) => `morphology-lesson-${String(index + 1).padStart(2, '0')}`)
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

describe('morphology 10 — التسجيل وحدود النطاق بعد إضافة الدرس العاشر', () => {
  beforeAll(() => {
    sandbox = mkdtempSync(join(tmpdir(), 'arabic-morph10-guards-'))
    for (const directory of ['src', 'docs', 'scripts']) cpSync(join(root, directory), join(sandbox, directory), { recursive: true })
    cpSync(join(root, 'package.json'), join(sandbox, 'package.json'))
    registrySource = readFileSync(join(root, 'src/lessons/registry.ts'), 'utf8')
    appSource = readFileSync(join(root, 'src/app/App.tsx'), 'utf8')
  })
  afterAll(() => rmSync(sandbox, { recursive: true, force: true }))

  it('يسجّل ١–١٠ مرة واحدة بالترتيب بعد التاسع، دون حادي عشر أو اختبار وحدة', () => {
    expect(getSectionLessons('morphology').map((lesson) => lesson.id)).toEqual(expectedIds)
    expect(new Set(lessonRegistry.map((lesson) => lesson.id)).size).toBe(lessonRegistry.length)
    expect(getSectionLessons('morphology').map((lesson) => lesson.number)).toEqual(['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠'])
    expect(getSectionLessons('morphology')[9]).toMatchObject({
      title: 'أنواع المصادر وأوزانها', sectionId: 'morphology', available: true,
    })
    expect(getSectionLessons('morphology')[8]).toMatchObject({ title: 'المصدر — تعريفه وأوزانه الأساسية', available: true })
    expect(getSectionLessons('morphology')[7]).toMatchObject({ title: 'تصريف الأفعال والإسناد إلى الضمائر', available: true })
    expect(getSectionLessons('basics-grammar').map((lesson) => lesson.id)).toEqual(
      Array.from({ length: 11 }, (_, index) => `lesson-${index + 1}`),
    )
    expect(getSectionLessons('spelling').length).toBeGreaterThan(0)
    expect(sectionRegistry.map((section) => section.id)).toEqual([
      'basics-grammar', 'morphology', 'spelling', 'rhetoric', 'reading-expression',
    ])
    expect(lessonRegistry.some((lesson) => /unit/i.test(lesson.id))).toBe(false)
  })

  it('يقبل الدرس العاشر مع بقاء كل حراس المصدر السابقة فعّالة', () => {
    for (const result of runGuards(sandbox)) expect(result.status, `${result.guard}: ${result.stderr}`).toBe(0)
  })

  it('يرفض الدرس الحادي عشر حتى لو عوّض العاشر للحفاظ على العدد', () => {
    try {
      writeFileSync(join(sandbox, 'src/lessons/registry.ts'), registrySource.replace("id: 'morphology-lesson-10'", "id: 'morphology-lesson-11'"))
      expectRejected()
    } finally {
      writeFileSync(join(sandbox, 'src/lessons/registry.ts'), registrySource)
    }
  })

  it('يرفض تكرار العاشر وإسقاط التاسع والعدد ما زال عشرة', () => {
    try {
      writeFileSync(join(sandbox, 'src/lessons/registry.ts'), registrySource.replace("id: 'morphology-lesson-09'", "id: 'morphology-lesson-10'"))
      expectRejected()
    } finally {
      writeFileSync(join(sandbox, 'src/lessons/registry.ts'), registrySource)
    }
  })

  it('يرفض توجيهًا خاطئًا للدرس العاشر ومكوّنًا حادي عشر غير مسجّل', () => {
    try {
      writeFileSync(join(sandbox, 'src/app/App.tsx'), appSource.replace('<LessonMorphologyTen onFinish=', '<LessonMorphologyNine onFinish='))
      expectRejected()
    } finally {
      writeFileSync(join(sandbox, 'src/app/App.tsx'), appSource)
    }
    const path = join(sandbox, 'src/lessons/LessonMorphologyEleven.tsx')
    try {
      writeFileSync(path, '// forbidden future lesson fixture\n')
      expectRejected()
    } finally {
      rmSync(path)
    }
  })

  it('يرفض اختبار وحدة للصرف دون إضعاف قائمة الدروس', () => {
    try {
      writeFileSync(join(sandbox, 'src/lessons/registry.ts'), registrySource.replace("id: 'morphology-lesson-10'", "id: 'morphology-unit-test'"))
      expectRejected()
    } finally {
      writeFileSync(join(sandbox, 'src/lessons/registry.ts'), registrySource)
    }
  })
})
