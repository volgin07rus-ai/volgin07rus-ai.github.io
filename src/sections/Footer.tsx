import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BadgeHang from '../components/BadgeHang'
import { CrossCorners } from '../components/Cross'
import SwooshButton from '../components/SwooshButton'
import { useLang, type Dict } from '../lib/lang'

gsap.registerPlugin(ScrollTrigger)

const EMAIL = 'volgin03rus@gmail.com'
const TELEGRAM = 'https://t.me/D1maVolgin'

/** Адреса от языка не зависят, подписи зависят — колонки собираем на месте */
const cols = (t: Dict) => [
  {
    title: t.footer.colSections,
    links: [
      { label: t.footer.linkAbout, href: '#about' },
      { label: t.footer.linkServices, href: '#services' },
      { label: t.footer.linkWork, href: '#work' },
    ],
  },
  {
    title: t.footer.colContact,
    links: [
      { label: 'Telegram', href: TELEGRAM },
      { label: EMAIL, href: `mailto:${EMAIL}` },
    ],
  },
]

/**
 * Подвал целиком по замеру оригинала (окно 1400):
 *
 *   высота 788 — это 56.3vw, поля 46.67 сверху и по 23.33 с боков и снизу;
 *   фон — две заливки одна на другой: серая linear-gradient(#f1f1f1,
 *     #adafae) и поверх неё оранжевая linear-gradient(340deg, #ff6436,
 *     прозрачный 50%) — наклонная, а не круглая;
 *   пропуск — канвас во всю ширину высотой 700 (50vw) с отступом
 *     сверху 116.67 (8.33vw) и наложением hard-light;
 *   ссылки 17.5px, то есть 1.25vw.
 *
 * Выезд: содержимое сдвинуто вверх и съезжает к нулю, пока окно входит
 * в экран. Заливки лежат на окне и не едут — иначе снизу открывалась бы
 * полоса пустоты.
 */
/** Подпись, подогнанная по ширине измерением, а не подобранным кеглем.
 *
 *  Ширину строки берём из вёрстки: она честная, со всеми подстановками
 *  шрифта — символ © рисуется не ABC Gravity, и на канвасе строка выходит
 *  уже на девять процентов, по нему подгонять нельзя.
 *
 *  Два прохода: ширина строки от кегля зависит не строго линейно
 *  из-за округлений, второй проход добирает остаток. */
const MARK_FONT = '"ABC Gravity", "Arial Black", sans-serif'

/** Доля колонки, которую занимает подпись. Не единица: впритык к краю
 *  строка читается обрезанной, даже когда буква целая. */
const MARK_FILL = 0.995

/**
 * Небольшая прибавка на сглаживание по краю глифа, в пикселях на сто
 * пикселей кегля. Сам вынос скоса сюда не входит: под него отведён
 * внутренний отступ у строки, и он уже сидит в её измеряемой ширине.
 */
const MARK_SKEW_OVERHANG = 2

/** @param mark сама подпись — при смене языка её надо перемерить заново */
function useFitMark(el: React.RefObject<HTMLElement>, mark: string) {
  useEffect(() => {
    const node = el.current
    if (!node) return

    const fit = () => {
      const line = node.firstElementChild
      const avail = node.clientWidth
      if (!line || !avail) return
      const вынос = MARK_SKEW_OVERHANG

      for (let i = 0; i < 2; i++) {
        const кегль = parseFloat(getComputedStyle(node).fontSize)
        const ширина = line.getBoundingClientRect().width
        if (!кегль || !ширина) return
        const наСто = (ширина / кегль) * 100
        node.style.fontSize = `${(avail / (наСто + вынос)) * 100 * MARK_FILL}px`
      }
    }

    // Ждём именно то начертание, которым будем мерить
    document.fonts.load(`italic 900 100px ${MARK_FONT}`).then(fit)
    document.fonts.ready.then(fit)
    fit()

    // Следим за шириной родителя: у самой подписи ширина от кегля не
    // зависит, а вот высота зависит — наблюдение за ней зациклилось бы
    const box = node.parentElement
    if (!box) return
    const ro = new ResizeObserver(fit)
    ro.observe(box)
    return () => ro.disconnect()
  }, [el, mark])
}

export default function Footer() {
  const wrap = useRef<HTMLElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const mark = useRef<HTMLHeadingElement>(null)
  const { t } = useLang()
  const COLS = cols(t)

  useFitMark(mark, t.footer.markHead + t.footer.markTail + t.footer.markWidth)

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Выезд заканчивается тогда, когда подвал целиком на виду. На широком
    // экране это его нижний край: подвал ровно в экран. На телефоне он
    // заметно выше экрана, и при том же условии сдвиг обнулялся уже после
    // того, как верх ушёл за край, — подпись всё время была приподнята,
    // то есть срезана. Там доводим выезд к моменту, когда верх подвала
    // поднимется на четверть экрана: подпись как раз выходит целиком.
    const узкий = innerWidth < 768
    const ctx = gsap.context(() => {
      gsap.fromTo(
        inner.current,
        { yPercent: узкий ? -10 : -14 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: wrap.current,
            start: 'top bottom',
            end: узкий ? 'top 25%' : 'bottom bottom',
            scrub: true,
          },
        }
      )
    }, wrap)
    return () => ctx.revert()
  }, [])

  return (
    <footer
      id="contact"
      ref={wrap}
      className="relative z-10 text-graphite overflow-hidden md:min-h-[56.3vw]"
    >
      {/* Серая подложка: сверху цвет страницы, книзу темнее */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(rgb(241,241,241), rgb(173,175,174))' }}
      />
      {/* Оранжевая поверх неё */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(340deg, rgb(255,100,54), rgba(255,100,54,0) 50%)' }}
      />

      {/* Пропуск во всю ширину. hard-light — то же наложение, что у
          оригинала: пропуск не лежит поверх заливки, а смешивается с ней.
          Наложение и z-index обязаны быть на одном элементе. */}
      <div
        className="absolute inset-x-0 top-0 z-0 pt-[8.33vw] hidden md:block"
        style={{ mixBlendMode: 'hard-light' }}
      >
        <div className="w-full h-[50vw]">
          <BadgeHang scene={`${import.meta.env.BASE_URL}${t.footer.badge}`} />
        </div>
      </div>

      <div ref={inner} className="relative z-[2]">
        {/* Отступ сверху на телефоне в пикселях: 3.33vw там всего тринадцать
            пикселей, и подпись вставала вплотную к стыку с верхней секцией */}
        <div className="relative flex flex-col md:min-h-[56.3vw] px-[1.67vw] pt-9 md:pt-[3.33vw] pb-[1.67vw]">
          {/* Крестики внутрь, а не наружу: у подвала нет полей, наружу им
              просто некуда выйти */}
          <CrossCorners offset="0.5vw" size="sm" />
          {/* Монументальная подпись: последнее слово наклонено, как в оригинале.
              Наклон задан курсивом, а не transform: трансформированный
              inline-block внутри текста с background-clip рисуется сплошным
              прямоугольником вместо букв.

              Кегль ставит useFitMark по замеру — в стиле лишь запасное
              значение на случай, если скрипт не отработал. */}
          <h2
            ref={mark}
            className="footer-mark font-monument font-black uppercase leading-[0.8] tracking-[-0.02em] whitespace-nowrap"
            style={{ fontSize: 'clamp(32px, 10.9vw, 220px)', fontStretch: t.footer.markWidth }}
          >
            {/* Отступ справа с равной отрицательной внешней прибавкой:
                заливка рисуется только внутри рамки строки, а скошенный
                хвост последней буквы выходит за неё и остаётся
                непрокрашенным — буква выглядит срезанной. Отступ даёт
                заливке запас, отрицательный отступ не даёт разъехаться
                вёрстке. */}
            <span
              className="bg-clip-text text-transparent pr-[0.22em] -mr-[0.22em]"
              style={{
                // Светлый конец приглушён: на светлом фоне подвала прежний
                // #a2a2a2 сливался с подложкой, и хвост фамилии пропадал —
                // казалось, что подпись выходит не целиком
                backgroundImage:
                  'linear-gradient(90deg, #161616 0%, #343337 42%, #55545a 74%, #6f6e74 100%)',
              }}
            >
              {t.footer.markHead}
              <span className="italic">{t.footer.markTail}</span>
            </span>
          </h2>

          {/* Колонки жмутся влево, как у оригинала: первая от края, вторая
              на четверти ширины. Иначе длинная почта дотягивается до
              середины и налезает на пропуск. */}
          {/* На телефоне пропуска нет, и середина свободна: там всё
              выстроено по центру одной колонкой — так почте достаётся вся
              ширина экрана. На широком экране остаётся разнос по краям,
              потому что посередине висит пропуск. */}
          <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 text-center md:text-left">
            {COLS.map((c, i) => (
              // Первая колонка узкая: подписи в ней короткие, а вторую надо
              // подвинуть левее — иначе выросшая почта дотягивается до
              // пропуска, который висит посреди подвала
              <nav key={i} className={i === 0 ? 'md:col-span-2' : 'md:col-span-3'}>
                <div className="font-mono text-caption uppercase tracking-[0.14em] text-stone mb-4">
                  {c.title}
                </div>
                <ul className="space-y-2.5">
                  {c.links.map((l, j) => (
                    <li key={j}>
                      {/* Строка прокручивается: подпись уезжает вверх,
                          снизу приходит её оранжевая копия */}
                      <a
                        href={l.href}
                        data-cursor={t.cursor.open}
                        {...(l.href.startsWith('http')
                          ? { target: '_blank', rel: 'noreferrer' }
                          : {})}
                        className="link-roll font-grot font-bold tracking-[-0.02em]"
                        style={{ fontSize: 'clamp(20px, 1.75vw, 34px)' }}
                      >
                        <span className="link-roll__a">{l.label}</span>
                        <span className="link-roll__b" aria-hidden="true">
                          {l.label}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <div className="md:col-span-4 md:col-start-9 md:text-right">
              <p
                className="font-grot text-graphite tracking-[-0.02em] leading-[1.2] max-w-[22ch] mx-auto md:mx-0 md:ml-auto"
                style={{ fontSize: 'clamp(20px, 1.75vw, 34px)' }}
              >
                {t.footer.cta}
              </p>
              <div className="mt-5 flex justify-center md:justify-end">
                <SwooshButton href={`mailto:${EMAIL}`} cursor={t.cursor.write} size="lg">
                  {t.footer.ctaButton}
                </SwooshButton>
              </div>
            </div>
          </div>

          {/* Между колонками и нижней строкой висит пропуск */}
          <div className="flex-1 min-h-[120px] md:min-h-0" aria-hidden="true" />

          <div className="border-t hairline pt-5 text-center md:text-left">
            <span className="font-mono text-caption uppercase tracking-[0.12em] text-graphite">
              {t.footer.copyright}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
