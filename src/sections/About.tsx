import { CrossCorners } from '../components/Cross'
import GridLines from '../components/GridLines'
import ProfileCard from '../components/ProfileCard'
import { useLang } from '../lib/lang'
// Узор и зерно карточка подставляет в CSS-переменные, а оттуда — в url().
// Ссылка внутри стилей считается от самого файла стилей, а он лежит в
// assets: относительный путь из public превращался бы в assets/... и не
// находился. Поэтому эти два файла импортируются — сборщик сам проставит
// верный адрес.
import grainUrl from '../assets/grain.webp'
import iconUrl from '../assets/iconpattern.png'

export default function About() {
  const { t } = useLang()

  return (
    <section id="about" className="relative z-10 bg-onyx text-fog py-24 md:py-30">
      <GridLines />
      <div className="relative z-[1] mx-auto max-w-page px-6 md:px-10">
        {/* Без проявления по прокрутке: абзац читается сразу */}
        <p className="font-grot text-heading-sm md:text-heading tracking-[-0.03em] leading-[1.08] max-w-[22ch] md:max-w-[26ch]">
          {t.about.lead}
        </p>

        {/* Ряд не сеточный, а гибкий: у карточки собственный размер, и
            доля колонки её бы сдавила. shrink-0 отдаёт ей ровно столько,
            сколько она просит, остальное забирают счётчики. */}
        {/* На узком экране карточка стоит по центру, на широком — в ряд
            со счётчиками и по нижнему краю */}
        <div className="mt-18 md:mt-24 flex flex-col lg:flex-row gap-12 lg:gap-16 items-center lg:items-end">
          {/* Карточка ProfileCard из React Bits — компонент и стили как
              есть, без правок. Свойства сняты с рабочей демонстрации на
              reactbits.dev: узор и зерно те же самые, заливка, свечение
              и радиус — по умолчанию, нижней плашки нет.

              Зерно тут не украшение: без него на наведении не проступает
              вторая, «мокрая» половина блика.

              Портрет подготовлен отдельно — кадр уменьшен и растворён по
              краю прямо в файле, потому что компонент ставит снимок во
              всю ширину и рассчитан на фигуру, вырезанную по контуру. */}
          <div className="shrink-0">
            <ProfileCard
              avatarUrl={`${import.meta.env.BASE_URL}portrait-card.png`}
              iconUrl={iconUrl}
              grainUrl={grainUrl}
              name={t.about.cardName}
              title={t.about.cardTitle}
              showUserInfo={false}
              enableTilt
              enableMobileTilt
              innerGradient="linear-gradient(145deg, #6e402a8c 0%, #ff643644 100%)"
              behindGlowColor="rgba(255, 140, 80, 0.62)"
            />
          </div>

          {/* Счётчики — вместо логотипов клиентов, которых у нас нет */}
          <div className="relative w-full lg:flex-1">
            {/* Крестики по углам таблицы — та же метка, что у карточек услуг */}
            <CrossCorners offset="-0.9vw" size="sm" />
            <div className="font-mono text-micro uppercase tracking-[0.14em] text-stone mb-6">
              {t.about.statsTitle}
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 border-y border-white/10">
              {t.about.stats.map((s, i) => (
                <div key={i} className="py-6 sm:px-6 first:sm:pl-0">
                  <dt className="font-monument font-black text-heading-sm md:text-heading leading-none">
                    {s.v}
                    {s.u && <span className="ml-2 text-subheading text-stone">{s.u}</span>}
                  </dt>
                  <dd className="font-mono text-micro uppercase tracking-[0.12em] text-stone mt-3">
                    {s.l}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
