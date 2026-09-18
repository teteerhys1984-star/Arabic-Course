import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const rootHtml = readFileSync('index.html', 'utf8')
const app = readFileSync('src/app/App.tsx', 'utf8')
const directionComponent = readFileSync('src/shared/direction/DirectionText.tsx', 'utf8')
const failures = []

if (!/<html[^>]+lang="ar"[^>]+dir="rtl"/.test(rootHtml)) failures.push('index.html must declare lang="ar" and dir="rtl".')
if (!/dir="rtl"/.test(app)) failures.push('The React application shell must declare dir="rtl".')
if (!/dir=\{direction\}/.test(directionComponent) || !/isolated/.test(directionComponent)) failures.push('DirectionText must expose explicit direction and bidi isolation.')

function filesUnder(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name)
    return statSync(path).isDirectory() ? filesUnder(path) : [path]
  })
}

for (const file of filesUnder('src').filter((path) => /\.(ts|tsx)$/.test(path))) {
  const text = readFileSync(file, 'utf8')
  if (/direction:\s*(left|right)|text-align:\s*(left|right)/.test(text)) {
    failures.push(`${file} uses physical direction; use logical RTL-safe properties.`)
  }
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log('RTL foundation check passed.')
