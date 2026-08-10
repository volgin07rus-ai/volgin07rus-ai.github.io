import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CrossCorners } from '../components/Cross'
import GridLines from '../components/GridLines'
import SwooshButton from '../components/SwooshButton'
import TiltedCard from '../components/TiltedCard'
import { PROJECTS } from '../data/projects'
import { useLang } from '../lib/lang'

gsap.registerPlugin(ScrollTrigger)

/** Сколько работ показываем сразу, до нажатия «смотреть ещё» */
const FIRST = 6

export default function Work() {
  const root = useRef<HTMLElement>(null)
  const { t } = useLang()
  const [все, показатьВсе] = useState(false)
  const видимые = все ? PROJECTS : PROJECTS.slice(0, FIRST)

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.work-card').forEach((card) => {
        gsap.fromTo(
          card,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'expo.out',
            scrollTrigger: { trigger: card, start: 'top 88%' },
          }
        )
      })
    }, root)
    // Раскрытые карточки появляются после первого прохода, и своих
    // привязок у них нет — собираем эффект заново. Заодно пересчитываем
    // привязки на странице: высота секции разом меняется.
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [все])

  return (
    <section id="work" ref={root} className="relative z-10 bg-fog text-graphite py-24 md:py-30">
      <GridLines />
      <div className="relative z-[1] mx-auto max-w-page px-6 md:px-10">
        {/* Крестики по углам всего блока работ — та же метка, что у
            карточек услуг, только масштабом больше */}
        <CrossCorners offset="-0.6vw" />
        <div className="mb-12 md:mb-18">
          <h2 className="font-monument font-black uppercase text-heading-sm md:text-heading leading-none tracking-[-0.02em]">
            {t.work.title}
          </h2>
        </div>

        {/* Ни рамок, ни теней, ни скруглений: картинка и есть карточка.
            items-start обязателен — иначе карточки тянутся по высоте ряда
            и под короткой картинкой остаётся серая пустота. */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 items-start">
          {видимые.map((p, i) => {
            // Работ нечётное число, и последняя осталась бы в ряду одна,
            // оставив полряда пустым. Растягиваем её на всю ширину и режем
            // пониже: получается не дыра, а широкая карточка в конце.
            const одна = видимые.length % 2 === 1 && i === видимые.length - 1
            return (
            <a
              key={p.slug}
              href={p.href}
              target="_blank"
              rel="noreferrer"
              data-cursor={t.cursor.open}
              className={`work-card group relative block ${
                одна ? 'md:col-span-12' : p.wide ? 'md:col-span-7' : 'md:col-span-5'
              }`}
            >
              {/* Наклон и подписи держит TiltedCard из React Bits — компонент
                  и стили взяты как есть. Размеры заданы долями, а не в
                  пикселях, как в примере: колонки сетки резиновые.

                  Своя подсказка у курсора выключена — на сайте уже есть
                  общая, две гонялись бы наперегонки. Предупреждение для
                  телефона тоже: оно английское и на весь экран. */}
              {/* Без подложки: наклонённая карточка приподнимается, и серый
                  прямоугольник за ней выглядывал по краям */}
              <div className={одна ? 'aspect-[24/10]' : 'aspect-[16/10]'}>
                <TiltedCard
                  imageSrc={`${import.meta.env.BASE_URL}covers/${p.slug}.jpg`}
                  altText={p.title}
                  containerWidth="100%"
                  containerHeight="100%"
                  imageWidth="100%"
                  imageHeight="100%"
                  rotateAmplitude={11}
                  scaleOnHover={1.05}
                  showTooltip={false}
                  showMobileWarning={false}
                  displayOverlayContent
                  overlayContent={
                    <div className="relative w-full h-full">
                      {p.fresh && (
                        <span className="absolute left-3 top-3 bg-ember text-onyx font-mono text-micro uppercase px-2 py-1">
                          {t.work.fresh}
                        </span>
                      )}

                      {/* Ярлык внизу слева: точка, название, категория
                          отдельным блоком */}
                      <span className="absolute left-3 bottom-3 flex items-stretch font-mono text-micro uppercase">
                        <span className="inline-flex items-center gap-2 bg-onyx text-fog px-3 py-1.5">
                          <span className="w-[7px] h-[7px] rounded-full bg-ember" />
                          {p.title}
                        </span>
                        <span className="inline-flex items-center bg-onyx/70 text-fog/70 px-3 py-1.5 border-l border-white/15">
                          {t.work.tags[p.tag]}
                        </span>
                      </span>
                    </div>
                  }
                />
              </div>
            </a>
            )
          })}
        </div>

        {/* Остальные работы прячем за кнопкой: пятнадцать карточек подряд
            листаются дольше, чем весь остальной сайт */}
        {!все && (
          <div className="mt-10 md:mt-14 flex justify-center">
            <SwooshButton size="lg" cursor={t.cursor.open} onClick={() => показатьВсе(true)}>
              {t.work.more}
            </SwooshButton>
          </div>
        )}
      </div>
    </section>
  )
}
