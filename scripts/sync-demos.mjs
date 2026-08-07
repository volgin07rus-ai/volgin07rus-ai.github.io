// Собирает демо-сайты и раскладывает их в public/demo/<slug>/,
// чтобы они уехали на GitHub Pages вместе с портфолио отдельными страницами.
//
// Запуск: npm run sync:demos
import { cp, rm, mkdir, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const PORTFOLIO = resolve(here, '..')
const SITES = resolve(PORTFOLIO, '..') // папка «Портфолио»
const OUT = join(PORTFOLIO, 'public', 'demo')

/**
 * kind: 'static' — папку копируем как есть;
 * kind: 'vite'   — сначала npm run build, копируем dist.
 * Для 'vite' в vite.config.ts обязателен base: './', иначе пути уедут.
 */
const DEMOS = [
  { slug: 'lumora', dir: 'lumora', kind: 'static', files: ['index.html'] },
  { slug: 'baseline', dir: 'baseline', kind: 'static', files: ['index.html'] },
  { slug: 'raketa', dir: 'raketa', kind: 'vite' },
  { slug: 'mesta', dir: 'mesta', kind: 'static', files: ['index.html'] },
  { slug: 'synapsex', dir: 'synapsex', kind: 'vite' },
  { slug: 'studio-agency', dir: 'studio-agency', kind: 'vite' },
  { slug: 'asme', dir: 'asme', kind: 'vite' },
  { slug: 'mindloop', dir: 'mindloop', kind: 'vite' },
  { slug: 'linkflow', dir: 'linkflow', kind: 'vite' },
  { slug: 'veldara', dir: 'veldara', kind: 'vite' },
  { slug: 'terraelix', dir: 'terraelix', kind: 'vite' },
  { slug: 'creative-studio', dir: 'creative-studio', kind: 'vite' },
]

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

// Скрипт запускается ТОЛЬКО локально и вручную (npm run sync:demos).
// В сборку его подключать нельзя: на GitHub чекаутится один репозиторий,
// соседних папок с исходниками демо там нет — и public/demo/ уедет пустой.
// Готовые файлы в public/demo/ закоммичены, для CI они и есть источник правды.
await mkdir(OUT, { recursive: true })

for (const demo of DEMOS) {
  const src = join(SITES, demo.dir)
  if (!existsSync(src)) {
    console.warn(`  пропуск: ${demo.slug} — папки ${src} нет, уже собранное не трогаем`)
    continue
  }

  const dest = join(OUT, demo.slug)
  // Чистим только ту папку, для которой реально нашёлся исходник
  await rm(dest, { recursive: true, force: true })

  if (demo.kind === 'vite') {
    console.log(`  сборка ${demo.slug}…`)
    // --base=./ переопределяет базовый путь, не трогая vite.config сайта:
    // внутри public/demo/<slug>/ ссылки должны быть относительными.
    // shell: true обязателен — Node на Windows отказывается запускать .cmd напрямую
    execFileSync(npm, ['run', 'build', '--', '--base=./'], {
      cwd: src,
      stdio: 'inherit',
      shell: true,
    })
    await cp(join(src, 'dist'), dest, { recursive: true })
  } else {
    await mkdir(dest, { recursive: true })
    for (const file of demo.files) {
      await cp(join(src, file), join(dest, file), { recursive: true })
    }
  }

  const copied = await readdir(dest)
  console.log(`  готово: demo/${demo.slug}/ (${copied.length} файл(ов))`)
}

console.log('Демо разложены в public/demo/')
