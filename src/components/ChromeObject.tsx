import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export type ChromeShape = 'spark' | 'frame' | 'code'

/**
 * Тёмный хромированный объект, медленно поворачивающийся в квадрате карточки.
 *
 * В оригинале на этом месте стоят сцены Spline с логотипами Figma и Webflow.
 * Логотипы чужих продуктов сюда не годятся: рядом в счётчиках стоит «без
 * конструкторов». Поэтому объекты собраны здесь же — выдавленные из плоских
 * контуров фигуры с металлом и студийным окружением, вид тот же.
 *
 * Фон объект не рисует: под ним лежит градиент карточки, канвас прозрачный.
 */
export default function ChromeObject({ shape }: { shape: ChromeShape }) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = host.current
    if (!node) return

    const still = matchMedia('(prefers-reduced-motion: reduce)').matches

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.32
    node.appendChild(renderer.domElement)
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%'

    const scene = new THREE.Scene()
    // Узкий угол и дальняя камера: перспектива почти как у чертежа.
    // При широком угле части фигуры, разнесённые по горизонтали, видны
    // под разными углами — скобки выглядели так, будто крутятся врозь.
    // Кадр остаётся прежним: 2·10.2·tg(7.5°) = 2·5.4·tg(14°).
    const camera = new THREE.PerspectiveCamera(15, 1, 0.1, 100)
    camera.position.set(0, 0, 10.2)

    // Студийное окружение без единого файла: металл без карты отражений
    // выглядит плоско-чёрным, а тут блики берутся из процедурной комнаты
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04)
    scene.environment = envRT.texture

    const key = new THREE.DirectionalLight(0xffffff, 3.1)
    key.position.set(2.4, 3.2, 4)
    const rim = new THREE.DirectionalLight(0xcfe2e6, 2.1)
    rim.position.set(-3, -1.4, -2.6)
    // Заполняющий снизу: без него нижняя половина фигуры проваливается
    // в чёрное на тёмной части градиента
    const fill = new THREE.DirectionalLight(0xffffff, 1.1)
    fill.position.set(-1.2, -3, 2.4)
    scene.add(key, rim, fill)

    const material = new THREE.MeshPhysicalMaterial({
      color: 0x53666b,
      metalness: 1,
      roughness: 0.22,
      clearcoat: 0.4,
      clearcoatRoughness: 0.26,
      envMapIntensity: 1.5,
    })

    const group = new THREE.Group()
    for (const geo of buildShape(shape)) group.add(new THREE.Mesh(geo, material))

    // Центрируем и подгоняем под кадр всю сборку целиком, а не каждую деталь:
    // по отдельности центрировать нельзя — сдвиги внутри фигуры схлопнутся,
    // и скобки съедутся в одну точку
    const bounds = new THREE.Box3().setFromObject(group)
    const center = bounds.getCenter(new THREE.Vector3())
    group.children.forEach((m) => {
      if (m instanceof THREE.Mesh) m.geometry.translate(-center.x, -center.y, -center.z)
    })
    const size = bounds.getSize(new THREE.Vector3())
    // Кадрируем по габариту, но у каждой фигуры своя поправка: рамка
    // квадратная и по габариту кажется крупнее соседей, скобки — наоборот.
    // Числа подобраны замером оригинала: там объект занимает 40–42%
    // стороны квадрата, у всех трёх карточек одинаково.
    const FIT = { spark: 1.06, frame: 1.05, code: 1.42 }
    group.scale.setScalar(FIT[shape] / Math.max(size.x, size.y))
    scene.add(group)

    const resize = () => {
      const w = node.clientWidth || 1
      const h = node.clientHeight || 1
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(node)

    // Три WebGL-контекста на странице — уже ощутимо. Крутим только тот,
    // что виден: за пределами экрана цикл останавливается совсем.
    let visible = false
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !still) loop()
    })
    io.observe(node)

    // С мышью фигура следит за курсором, на тачскрине мыши нет — там
    // остаётся собственное покачивание
    const follows = matchMedia('(hover: hover) and (pointer: fine)').matches
    let aimX = 0
    let aimY = 0
    const onPointer = (e: PointerEvent) => {
      const r = node.getBoundingClientRect()
      // Смещение курсора от центра квадрата, приведённое к половине экрана:
      // так фигура реагирует на движение по всей странице, а не только
      // когда курсор внутри карточки
      aimX = clamp((e.clientX - (r.left + r.width / 2)) / (innerWidth / 2), -1, 1)
      aimY = clamp((e.clientY - (r.top + r.height / 2)) / (innerHeight / 2), -1, 1)
    }
    if (follows && !still) window.addEventListener('pointermove', onPointer, { passive: true })

    let frame = 0
    const clock = new THREE.Clock()
    const loop = () => {
      cancelAnimationFrame(frame)
      const t = clock.getElapsedTime()

      if (follows) {
        // За курсором тянемся плавно, иначе фигура дёргается вслед за
        // каждым событием мыши. Лёгкое собственное движение остаётся —
        // без него при неподвижной мыши объект выглядит мёртвым.
        const wantY = aimX * 0.42 + Math.sin(t * 0.28) * 0.08
        const wantX = aimY * 0.24 + Math.sin(t * 0.21 + 1.2) * 0.06
        group.rotation.y += (wantY - group.rotation.y) * 0.06
        group.rotation.x += (wantX - group.rotation.x) * 0.06
        group.rotation.z = Math.sin(t * 0.19) * 0.05
        group.position.y = Math.sin(t * 0.45) * 0.05
      } else {
        // Не полный оборот, а покачивание: на полном обороте фигура
        // раз в цикл встаёт ребром и пропадает
        group.rotation.y = Math.sin(t * 0.34) * 0.62
        group.rotation.x = Math.sin(t * 0.23 + 1.2) * 0.2
        group.rotation.z = Math.sin(t * 0.19) * 0.08
        group.position.y = Math.sin(t * 0.45) * 0.07
      }

      renderer.render(scene, camera)
      if (visible && !still) frame = requestAnimationFrame(loop)
    }

    if (still) {
      group.rotation.set(0.18, -0.42, 0)
      renderer.render(scene, camera)
    }

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointer)
      io.disconnect()
      ro.disconnect()
      group.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose()
      })
      material.dispose()
      envRT.texture.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [shape])

  return <div ref={host} className="absolute inset-0" aria-hidden="true" />
}

/* ------------------------------------------------------------------
   Контуры. Каждый рисуется плоским и выдавливается с фаской — фаска
   здесь главное: именно на её скруглении металл ловит блик.
   ------------------------------------------------------------------ */

const EXTRUDE: THREE.ExtrudeGeometryOptions = {
  depth: 0.22,
  bevelEnabled: true,
  bevelSize: 0.05,
  bevelThickness: 0.05,
  bevelSegments: 6,
  curveSegments: 32,
}

function buildShape(kind: ChromeShape): THREE.BufferGeometry[] {
  if (kind === 'spark') return [new THREE.ExtrudeGeometry(sparkShape(), EXTRUDE)]
  if (kind === 'frame') return frameShapes()
  return codeShapes()
}

/** Четырёхлучевая звезда: лучи стянуты к центру квадратичными кривыми */
function sparkShape() {
  const s = new THREE.Shape()
  const v = 1.15 // вертикальный луч
  const h = 0.78 // горизонтальный
  const k = 0.13 // насколько глубоко втянута талия
  s.moveTo(0, v)
  s.quadraticCurveTo(k, k, h, 0)
  s.quadraticCurveTo(k, -k, 0, -v)
  s.quadraticCurveTo(-k, -k, -h, 0)
  s.quadraticCurveTo(-k, k, 0, v)
  return s
}

/** Рамка макета: скруглённый квадрат с вырезом и блок внутри */
function frameShapes(): THREE.BufferGeometry[] {
  const outer = roundedRect(1.9, 1.9, 0.3)
  outer.holes.push(roundedRectPath(1.42, 1.42, 0.16))
  const inner = roundedRect(0.62, 0.62, 0.1)
  const block = new THREE.ExtrudeGeometry(inner, { ...EXTRUDE, depth: 0.16 })
  block.translate(0.32, -0.32, 0.03)
  return [new THREE.ExtrudeGeometry(outer, EXTRUDE), block]
}

/** Угловые скобки — знак кода, и заодно та же рубленая пластика, что у оригинала */
function codeShapes(): THREE.BufferGeometry[] {
  const left = new THREE.ExtrudeGeometry(chevron(1), EXTRUDE)
  left.translate(-1.02, 0, 0)
  // Правую строим зеркальным контуром, а не отрицательным масштабом:
  // при scale(-1,…) у геометрии выворачиваются нормали и порядок обхода
  // граней, свет ложится наизнанку — и скобки выглядели так, будто
  // поворачиваются в разные стороны
  const right = new THREE.ExtrudeGeometry(chevron(-1), EXTRUDE)
  right.translate(1.02, 0, 0)
  return [left, right]
}

/** dir = 1 — скобка остриём влево, dir = -1 — её зеркальная пара */
function chevron(dir: 1 | -1) {
  const s = new THREE.Shape()
  const x = (v: number) => v * dir
  s.moveTo(x(0.48), 0.74)
  s.lineTo(x(-0.26), 0)
  s.lineTo(x(0.48), -0.74)
  s.lineTo(x(0.2), -0.74)
  s.lineTo(x(-0.54), 0)
  s.lineTo(x(0.2), 0.74)
  s.closePath()
  return s
}

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape()
  traceRoundedRect(s, w, h, r)
  return s
}

function roundedRectPath(w: number, h: number, r: number) {
  const p = new THREE.Path()
  traceRoundedRect(p, w, h, r)
  return p
}

function clamp(v: number, min: number, max: number) {
  return v < min ? min : v > max ? max : v
}

function traceRoundedRect(p: THREE.Shape | THREE.Path, w: number, h: number, r: number) {
  const x = w / 2
  const y = h / 2
  p.moveTo(-x + r, -y)
  p.lineTo(x - r, -y)
  p.quadraticCurveTo(x, -y, x, -y + r)
  p.lineTo(x, y - r)
  p.quadraticCurveTo(x, y, x - r, y)
  p.lineTo(-x + r, y)
  p.quadraticCurveTo(-x, y, -x, y - r)
  p.lineTo(-x, -y + r)
  p.quadraticCurveTo(-x, -y, -x + r, -y)
}
