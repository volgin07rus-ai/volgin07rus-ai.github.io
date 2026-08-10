import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ChromeObject, { type ChromeShape } from '../components/ChromeObject'
import { CrossCorners } from '../components/Cross'
import GridLines from '../components/GridLines'
import RevealWords from '../components/RevealWords'
import { useLang } from '../lib/lang'

gsap.registerPlugin(ScrollTrigger)

/**
 * Услуги — блок собран по устройству оригинала: гигантское белое слово
 * позади, три карточки на полупрозрачной подложке, в каждой квадрат с
 * градиентом и вращающимся объектом, крестики по углам через difference,
 * карточки плывут с разной скоростью.
 *
 * Замеры оригинала при ширине 1400: карточка 399 из 1353 (29.5%), отступы
 * 11.67px, заголовок карточки 52.5px с заливкой linear-gradient(270deg,
 * #000, #a2a2a2), текст 16px цветом #7b7a7c, крестики 11.66px с выносом
 * 17.5px за край, скорости сдвига 0.05 / 0.1 / 0.15.
 *
 * Тексты переведены построчно, но названия инструментов заменены: в
 * оригинале в карточках стоят Figma и Webflow, а тут рядом в счётчиках —
 * «без конструкторов». По той же причине объекты в квадратах свои, а не
 * трёхмерные логотипы чужих продуктов.
 *
 * Подписи карточек лежат в словаре языков, здесь остаётся только то, что
 * от языка не зависит: фигура в квадрате и скорость сноса.
 */
const SHAPES: { shape: ChromeShape; speed: number }[] = [
  { shape: 'spark', speed: 0.05 },
  { shape: 'frame', speed: 0.1 },
  { shape: 'code', speed: 0.15 },
]

export default function Services() {
  const root = useRef<HTMLElement>(null)
  const { t } = useLang()
  const cards = SHAPES.map((s, i) => ({ ...s, ...t.services.cards[i] }))

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      // Карточки плывут с разной скоростью — то самое расхождение по высоте,
      // из-за которого блок «шевелится» при прокрутке. На узком экране они
      // стоят стопкой, и расхождение читалось бы как рваные отступы.
      const drifting = innerWidth >= 768 ? gsap.utils.toArray<HTMLElement>('.svc-card') : []
      drifting.forEach((card) => {
        const amp = Number(card.dataset.speed || 0) * 600
        gsap.fromTo(
          card,
          { y: amp },
          {
            y: -amp,
            ease: 'none',
            scrollTrigger: {
              trigger: root.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        )
      })

      gsap.fromTo(
        '.svc-word',
        { opacity: 0, filter: 'blur(10px)' },
        {
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.9,
          stagger: 0.06,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.svc-heading', start: 'top 88%' },
          // Размытие и слой снимаем после проигрыша: иначе на каждой
          // букве навсегда остаётся фильтр и слово мерцает при любой
          // перерисовке рядом
          onComplete: () => {
            gsap.set('.svc-word', { clearProps: 'filter,willChange' })
          },
        }
      )

      // Слово оседает вниз, а карточки идут вверх — так они его
      // постепенно закрывают. Встречное движение заметнее, чем если бы
      // ехали только карточки.
      if (innerWidth >= 768) {
        gsap.fromTo(
          '.svc-heading',
          { y: -30 },
          {
            y: 90,
            ease: 'none',
            scrollTrigger: {
              trigger: root.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        )
      }
    }, root)
    return () => ctx.revert()
    // Со сменой языка в слове меняется число букв, а проявление построено
    // по буквам: старые цели остались бы висеть, новые не проявились бы
  }, [t.services.heading])

  return (
    <section id="services" ref={root} className="relative z-10 bg-fog text-graphite pb-[6.7vw]">
      <GridLines />
      {/* Блок тянется по всей ширине окна, как в оригинале: там обёртка
          занимает 1353 из 1400, то есть по 1.68vw полей. Жёсткий предел
          ширины оставлял на широком мониторе пустые поля по краям, и
          карточки выходили заметно мельче. */}
      <div className="relative z-[1] w-full px-[1.68vw]">
        {/* Заголовок: белым по светлому, читается только кромкой. Отрицательный
            нижний отступ — карточки должны наезжать на нижнюю треть букв. */}
        {/* Слово стоит выше карточек, нахлёст создаётся уже движением */}
        <div className="pt-[6.7vw] mb-[1vw]">
          <h2
            className="svc-heading font-monument font-black uppercase text-white leading-[0.74] tracking-[-0.01em] select-none"
            style={{ fontSize: t.services.headingSize }}
          >
            {t.services.heading.split('').map((ch, i) => (
              <span key={i} className="svc-word inline-block will-change-[filter,opacity]">
                {ch}
              </span>
            ))}
          </h2>
        </div>

        {/* Ряд карточек: у оригинала flex с space-between и боковым отступом */}
        <div className="relative flex flex-col md:flex-row md:justify-between gap-12 md:gap-0 px-[0.83vw]">
          {cards.map((c) => (
            /* Метка по фигуре, а не по названию: название меняется с
               языком, и React пересоздавал бы карточку целиком вместе с
               трёхмерным объектом внутри — на каждое переключение по три
               новых контекста WebGL */
            <article
              key={c.shape}
              data-speed={c.speed}
              data-cursor={c.title}
              className="svc-card relative flex flex-col gap-[0.83vw] w-full md:w-[30%] bg-white/50 p-[0.83vw] pb-[1.25vw]"
            >
              {/* Квадрат с градиентом — тот же перепад от черноты к свету,
                  что и в монументальном тексте. Объект рисуется поверх. */}
              <div
                className="svc-figure relative aspect-square overflow-hidden"
                style={{
                  backgroundImage:
                    'linear-gradient(rgb(0,0,0), rgb(110,108,112) 25%, rgb(185,183,187) 50%, rgb(220,214,214) 75%, rgb(241,241,241))',
                }}
              >
                <ChromeObject shape={c.shape} />
              </div>

              <div className="flex flex-col items-start">
                <h3
                  className="font-grot font-semibold leading-none tracking-[-0.03em] pb-[0.47vw] bg-clip-text text-transparent"
                  style={{
                    fontSize: 'clamp(30px, 3.75vw, 60px)',
                    backgroundImage: 'linear-gradient(270deg, rgb(0,0,0), rgb(162,162,162))',
                  }}
                >
                  {c.title}
                </h3>
                <RevealWords
                  once
                  text={c.body}
                  className="font-grot font-medium text-graphite leading-[1.35] tracking-[-0.01em] text-[clamp(15px,1.35vw,22px)]"
                />
              </div>

              {/* Крестики вынесены за край карточки — сетка сквозь неё */}
              <CrossCorners />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
