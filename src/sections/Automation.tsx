import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CrossCorners } from '../components/Cross'
import GridLines from '../components/GridLines'
import SwooshButton from '../components/SwooshButton'
import { useLang } from '../lib/lang'

gsap.registerPlugin(ScrollTrigger)

/**
 * Автоматизация и ИИ. Тёмный блок между услугами и подвалом.
 *
 * Сайт приводит клиента, автоматизация работает дальше за ним. Поэтому
 * главное в блоке не список громких слов, а живая схема на одной заявке:
 * по линии бежит оранжевая точка, и каждый шаг проявляется, когда она до
 * него доходит. Ниже задачи, которые автоматизирую, и как работаю.
 */

type Node = { step: string; quote: string; from: string; rows: string[][]; checks: string[] }

/** Сколько точка стоит на шаге, сколько держится готовая схема и пауза перед новым кругом */
const STEP_MS = 1500
const HOLD_MS = 2800
const RESET_MS = 600
/** Переезд точки между шагами */
const MOVE = '900ms cubic-bezier(0.65, 0, 0.35, 1)'

/** Строка внутри карточки шага: приглушена, пока сигнал не дошёл, и загорается, когда дошёл.
    Карточки не бывают пустыми: пустая рамка читалась бы как недоделка */
function Line({ on, k, className = '', children }: { on: boolean; k: number; className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`transition-[opacity,transform] duration-500 ease-out ${on ? 'opacity-100 translate-y-0' : 'opacity-25 translate-y-1'} ${className}`}
      style={{ transitionDelay: on ? `${140 + k * 90}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}

function StepBody({ n, on }: { n: Node; on: boolean }) {
  if (n.quote)
    return (
      <>
        <Line on={on} k={0} className="font-grot text-body-sm leading-[1.35] text-fog">
          «{n.quote}»
        </Line>
        <Line on={on} k={1} className="mt-4 font-mono text-micro uppercase tracking-[0.08em] text-stone">
          {n.from}
        </Line>
      </>
    )
  if (n.rows.length)
    return (
      <dl className="flex flex-col gap-2.5">
        {n.rows.map(([k, v], i) => (
          <Line key={k} on={on} k={i} className="flex items-baseline justify-between gap-4 border-b border-white/[0.07] pb-2 last:border-0 last:pb-0">
            <dt className="font-mono text-micro uppercase tracking-[0.08em] text-stone">{k}</dt>
            <dd className="font-grot text-body-sm text-fog text-right">{v}</dd>
          </Line>
        ))}
      </dl>
    )
  return (
    <ul className="flex flex-col gap-3">
      {n.checks.map((c, i) => (
        <Line key={c} on={on} k={i} className="flex items-center gap-3 font-grot text-body-sm text-fog">
          <svg viewBox="0 0 16 16" className="w-4 h-4 shrink-0 text-ember" aria-hidden="true">
            <path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          {c}
        </Line>
      ))}
    </ul>
  )
}

/** Схема на одной заявке: четыре шага и бегущая по ним точка */
function Flow({ nodes, title }: { nodes: Node[]; title: string }) {
  const box = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(-1)
  const last = nodes.length - 1

  useEffect(() => {
    const el = box.current
    if (!el) return
    // При выключенных анимациях схема сразу показана целиком
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStep(last)
      return
    }
    let timer = 0
    let s = -1
    const next = () => {
      s = s >= last ? -1 : s + 1
      setStep(s)
      timer = window.setTimeout(next, s === last ? HOLD_MS : s === -1 ? RESET_MS : STEP_MS)
    }
    // Крутится, только пока схема на экране
    const io = new IntersectionObserver(
      ([e]) => {
        window.clearTimeout(timer)
        if (e.isIntersecting) timer = window.setTimeout(next, 400)
      },
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      window.clearTimeout(timer)
    }
  }, [last])

  const at = Math.max(step, 0)
  // На новом круге точка не едет назад через всю схему, а гаснет и встаёт в начало
  const moving = step >= 0

  return (
    <div ref={box}>
      <div className="font-mono text-micro uppercase tracking-[0.14em] text-stone mb-8">{title}</div>
      <div className="relative">
        <CrossCorners offset="-0.9vw" size="sm" />

        {/* Линия, пройденный путь и точка: только в ряд, на широком экране.
            Точка идёт под ярлыками: видна в пути между шагами и не наезжает на подписи.
            Колонки без зазоров, поэтому середины шагов стоят ровно на 12.5% + 25% · n */}
        <div className="hidden md:block absolute top-5 left-[12.5%] right-[12.5%] h-px bg-white/15" aria-hidden="true" />
        <div
          className="hidden md:block absolute top-5 left-[12.5%] h-px bg-ember"
          style={{ width: `${at * 25}%`, transition: moving ? `width ${MOVE}` : 'none', opacity: moving ? 1 : 0 }}
          aria-hidden="true"
        />
        <div
          className="hidden md:block absolute top-5 z-0 w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-ember shadow-[0_0_0_6px_rgba(255,100,54,0.16),0_0_24px_rgba(255,100,54,0.7)]"
          style={{ left: `${12.5 + at * 25}%`, transition: moving ? `left ${MOVE}, opacity .3s` : 'opacity .3s', opacity: moving ? 1 : 0 }}
          aria-hidden="true"
        />

        <ol className="relative grid grid-cols-1 md:grid-cols-4">
          {nodes.map((n, i) => {
            const on = i <= step
            const now = i === step
            return (
              <li
                key={i}
                className={`relative flex flex-col pl-6 md:pl-0 md:px-3 pb-10 md:pb-0 border-l md:border-l-0 transition-colors duration-500 ${on ? 'border-ember' : 'border-white/15'}`}
              >
                {/* Ярлык шага стоит прямо на линии и перекрывает её */}
                <div className="flex md:justify-center">
                  <span
                    className={`relative z-[1] inline-flex items-center gap-2.5 h-10 px-4 bg-onyx border font-mono text-micro uppercase tracking-[0.08em] whitespace-nowrap transition-colors duration-500 ${now ? 'border-ember text-fog' : on ? 'border-white/30 text-fog' : 'border-white/15 text-stone'}`}
                  >
                    <span className={`w-[7px] h-[7px] rounded-full transition-colors duration-500 ${on ? 'bg-ember' : 'bg-white/25'}`} />
                    {n.step}
                  </span>
                </div>
                <div
                  className={`flex-1 mt-5 min-h-[168px] p-5 border transition-colors duration-500 ${now ? 'border-ember/50 bg-white/[0.045]' : 'border-white/10 bg-white/[0.02]'}`}
                >
                  <StepBody n={n} on={on} />
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

export default function Automation() {
  const root = useRef<HTMLElement>(null)
  const { t } = useLang()
  const a = t.automation

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      // Строки заголовка выезжают из-под маски, как заголовки сайта
      gsap.fromTo(
        '.auto-line',
        { yPercent: 110 },
        { yPercent: 0, duration: 1, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.auto-heading', start: 'top 85%' } }
      )
      gsap.fromTo(
        '.auto-lead',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.9, delay: 0.25, ease: 'expo.out', scrollTrigger: { trigger: '.auto-heading', start: 'top 85%' } }
      )
      gsap.fromTo(
        '.auto-task',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.auto-tasks', start: 'top 85%' } }
      )
    }, root)
    return () => ctx.revert()
    // Со сменой языка меняются строки: проявление собираем заново
  }, [a.heading])

  return (
    <section id="automation" ref={root} className="relative z-10 bg-onyx text-fog py-24 md:py-30">
      <GridLines />
      <div className="relative z-[1] mx-auto max-w-page px-6 md:px-10">
        <div className="flex items-center gap-2.5 font-mono text-micro uppercase tracking-[0.14em] text-stone mb-8">
          <span className="w-[7px] h-[7px] rounded-full bg-ember" />
          {a.label}
        </div>

        <h2
          className="auto-heading font-monument font-black uppercase leading-[0.86] tracking-[-0.01em]"
          style={{ fontSize: 'clamp(46px, 9.4vw, 136px)' }}
        >
          {a.heading.split('\n').map((line, i) => (
            // Запас сверху у маски: иначе обрезались бы верхушки прописных
            <span key={i} className="block overflow-hidden pt-[0.08em] -mt-[0.08em] pb-[0.04em]">
              <span className="auto-line block">
                {line.split(' ').map((w, j) => (
                  <span key={j} className={w === a.accent ? 'text-ember' : undefined}>
                    {j > 0 && ' '}
                    {w}
                  </span>
                ))}
              </span>
            </span>
          ))}
        </h2>

        <p className="auto-lead mt-10 md:mt-12 font-grot text-body-lg md:text-heading-sm tracking-[-0.03em] leading-[1.15] max-w-[32ch] text-fog/90">
          {a.lead}
        </p>

        {/* Что умеет система: метки вместо длинного перечня в абзаце */}
        <ul className="auto-lead mt-8 flex flex-wrap gap-2 max-w-[880px]">
          {a.can.map((c) => (
            <li
              key={c}
              className="inline-flex items-center h-9 px-3.5 border border-white/15 font-mono text-micro uppercase tracking-[0.08em] text-fog/80 whitespace-nowrap"
            >
              {c}
            </li>
          ))}
        </ul>

        <div className="mt-18 md:mt-24">
          <Flow nodes={a.flow} title={a.flowTitle} />
        </div>

        {/* Задачи: не карточки, а таблица с волосными линиями, как счётчики в «О себе» */}
        <div className="auto-tasks mt-24 md:mt-30">
          <div className="font-mono text-micro uppercase tracking-[0.14em] text-stone mb-6">{a.tasksTitle}</div>
          <ul className="grid grid-cols-1 md:grid-cols-2 border-t border-white/10">
            {a.tasks.map((task, i) => (
              <li
                key={i}
                className="auto-task flex gap-5 py-8 border-b border-white/10 md:odd:pr-12 md:odd:border-r md:even:pl-12"
              >
                <span className="font-mono text-micro text-ember pt-1.5">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-grot font-semibold text-body-lg md:text-subheading tracking-[-0.02em] leading-[1.1]">
                    {task.title}
                  </h3>
                  <p className="mt-3 font-grot text-body-sm leading-[1.4] text-ash max-w-[46ch]">{task.body}</p>
                  {/* Пример из настоящего проекта, без названия компании */}
                  <p className="mt-4 pt-4 border-t border-white/[0.07] max-w-[46ch]">
                    <span className="block font-mono text-micro uppercase tracking-[0.12em] text-stone mb-1.5">{a.practice}</span>
                    <span className="font-grot text-body-sm leading-[1.4] text-fog">{task.example}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-15 md:mt-18 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div>
            <div className="font-mono text-micro uppercase tracking-[0.14em] text-stone mb-5">{a.stepsTitle}</div>
            <ol className="flex flex-col md:flex-row gap-4 md:gap-10">
              {a.steps.map((s, i) => (
                <li key={i} className="flex items-baseline gap-3">
                  <span className="font-mono text-micro text-ember">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-grot text-body-sm text-fog">{s}</span>
                </li>
              ))}
            </ol>
          </div>
          <SwooshButton href="#contact" tone="light" size="lg" cursor={t.cursor.write} className="self-start lg:self-auto shrink-0">
            {a.cta}
          </SwooshButton>
        </div>
      </div>
    </section>
  )
}
