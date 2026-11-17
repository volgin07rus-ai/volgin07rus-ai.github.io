import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { buildShape, type ChromeShape } from './chromeShapes'

/**
 * Сцена хромированных фигур услуг. Работает в фоновом потоке
 * (chrome.worker.ts), а где браузер не умеет WebGL вне страницы, прямо
 * в ней. Команды одни и те же: добавить фигуру, размер, видимость, курсор.
 *
 * Зачем поток: студийное окружение и шейдеры металла собираются синхронно,
 * и на телефоне это подвешивало страницу до 0,7 с. В потоке страница
 * этого не замечает, как и самих кадров.
 *
 * Рендерер один на все фигуры: рисует кадр в своём холсте и копирует его
 * в холст карточки. Окружение, материал и собранные шейдеры общие.
 */

type AnyCanvas = HTMLCanvasElement | OffscreenCanvas
type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

export type StageMsg =
  | { type: 'add'; id: number; shape: ChromeShape; canvas: AnyCanvas; w: number; h: number; follows: boolean; still: boolean }
  | { type: 'size'; id: number; w: number; h: number }
  | { type: 'visible'; id: number; visible: boolean }
  | { type: 'aim'; id: number; x: number; y: number }
  | { type: 'remove'; id: number }

type Item = {
  canvas: AnyCanvas
  ctx: Ctx
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  group: THREE.Group
  follows: boolean
  still: boolean
  visible: boolean
  ready: boolean
  aimX: number
  aimY: number
}

type Core = { renderer: THREE.WebGLRenderer; env: THREE.Texture; material: THREE.MeshPhysicalMaterial }

const items = new Map<number, Item>()
// Команды могут прийти раньше, чем фигура собрана: видимость запоминаем,
// а снятую до сборки фигуру не добавляем вовсе
const early = new Map<number, boolean>()
const gone = new Set<number>()
let core: Promise<Core | null> | null = null
let live: Core | null = null

// Окно и поток оба умеют requestAnimationFrame, но не все браузеры дают его потоку
const raf: (cb: () => void) => unknown =
  typeof requestAnimationFrame === 'function' ? (cb) => requestAnimationFrame(cb) : (cb) => setTimeout(cb, 16)

function getCore(make: () => AnyCanvas) {
  core ??= (async () => {
    const renderer = new THREE.WebGLRenderer({ canvas: make(), antialias: true, alpha: true })
    // Размер задаём сразу в пикселях экрана, плотность считает страница
    renderer.setPixelRatio(1)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.32
    // Студийное окружение без единого файла. Металл без карты отражений
    // выглядит плоско-чёрным, а тут блики берутся из процедурной комнаты
    const pmrem = new THREE.PMREMGenerator(renderer)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x53666b,
      metalness: 1,
      roughness: 0.22,
      clearcoat: 0.4,
      clearcoatRoughness: 0.26,
      envMapIntensity: 1.5,
    })
    live = { renderer, env, material }
    return live
  })().catch(() => null)
  return core
}

/** Есть ли WebGL у холста вне страницы. Без него сцена работает в самой странице */
export function offscreenGL() {
  try {
    return !!new OffscreenCanvas(1, 1).getContext('webgl2')
  } catch {
    return false
  }
}

export async function handle(msg: StageMsg, make: () => AnyCanvas) {
  if (msg.type === 'add') return add(msg, make)
  const it = items.get(msg.id)
  if (!it) {
    if (msg.type === 'visible') early.set(msg.id, msg.visible)
    if (msg.type === 'remove') gone.add(msg.id)
    return
  }
  if (msg.type === 'size') {
    sizeItem(it, msg.w, msg.h)
    if (it.ready && !running) draw(it)
  } else if (msg.type === 'visible') {
    it.visible = msg.visible
    wake()
  } else if (msg.type === 'aim') {
    it.aimX = msg.x
    it.aimY = msg.y
  } else {
    items.delete(msg.id)
    it.group.traverse((o) => {
      if (o instanceof THREE.Mesh) o.geometry.dispose()
    })
  }
}

function sizeItem(it: Item, w: number, h: number) {
  if (it.canvas.width !== w || it.canvas.height !== h) {
    it.canvas.width = w
    it.canvas.height = h
  }
  it.camera.aspect = w / h
  it.camera.updateProjectionMatrix()
}

async function add(msg: Extract<StageMsg, { type: 'add' }>, make: () => AnyCanvas) {
  const ctx = msg.canvas.getContext('2d') as Ctx | null
  const c = await getCore(make)
  if (!c || !ctx || gone.has(msg.id)) return

  const scene = new THREE.Scene()
  scene.environment = c.env
  // Узкий угол и дальняя камера: перспектива почти как у чертежа.
  // При широком угле части фигуры, разнесённые по горизонтали, видны
  // под разными углами, и скобки выглядели так, будто крутятся врозь.
  // Кадр остаётся прежним: 2·10.2·tg(7.5°) = 2·5.4·tg(14°).
  const camera = new THREE.PerspectiveCamera(15, 1, 0.1, 100)
  camera.position.set(0, 0, 10.2)

  const key = new THREE.DirectionalLight(0xffffff, 3.1)
  key.position.set(2.4, 3.2, 4)
  const rim = new THREE.DirectionalLight(0xcfe2e6, 2.1)
  rim.position.set(-3, -1.4, -2.6)
  // Заполняющий снизу: без него нижняя половина фигуры проваливается
  // в чёрное на тёмной части градиента
  const fill = new THREE.DirectionalLight(0xffffff, 1.1)
  fill.position.set(-1.2, -3, 2.4)
  scene.add(key, rim, fill)

  const g = new THREE.Group()
  for (const geo of buildShape(msg.shape)) g.add(new THREE.Mesh(geo, c.material))

  // Центрируем и подгоняем под кадр всю сборку целиком, а не каждую деталь:
  // по отдельности центрировать нельзя, сдвиги внутри фигуры схлопнутся,
  // и скобки съедутся в одну точку
  const bounds = new THREE.Box3().setFromObject(g)
  const center = bounds.getCenter(new THREE.Vector3())
  g.children.forEach((m) => {
    if (m instanceof THREE.Mesh) m.geometry.translate(-center.x, -center.y, -center.z)
  })
  const size = bounds.getSize(new THREE.Vector3())
  // Кадрируем по габариту, но у каждой фигуры своя поправка: рамка
  // квадратная и по габариту кажется крупнее соседей, скобки наоборот.
  // Числа подобраны замером оригинала: там объект занимает 40…42%
  // стороны квадрата, у всех трёх карточек одинаково.
  const FIT = { spark: 1.06, frame: 1.05, code: 1.42 }
  g.scale.setScalar(FIT[msg.shape] / Math.max(size.x, size.y))
  scene.add(g)

  const it: Item = {
    canvas: msg.canvas,
    ctx,
    scene,
    camera,
    group: g,
    follows: msg.follows,
    still: msg.still,
    visible: early.get(msg.id) ?? false,
    ready: false,
    aimX: 0,
    aimY: 0,
  }
  items.set(msg.id, it)
  sizeItem(it, msg.w, msg.h)

  // Шейдеры собираются в фоне. Материал и свет у фигур одинаковые:
  // собранное для первой достаётся двум другим готовым
  await c.renderer.compileAsync(scene, camera)
  if (items.get(msg.id) !== it) return
  it.ready = true
  if (it.still) g.rotation.set(0.18, -0.42, 0)
  draw(it)
  wake()
}

/** Кадр общим рендерером и сразу копия в холст карточки */
const size = new THREE.Vector2()
function draw(it: Item) {
  if (!live) return
  const r = live.renderer
  const { width: w, height: h } = it.canvas
  r.getSize(size)
  if (size.x !== w || size.y !== h) r.setSize(w, h, false)
  r.render(it.scene, it.camera)
  it.ctx.clearRect(0, 0, w, h)
  it.ctx.drawImage(r.domElement, 0, 0)
}

// Один цикл на все фигуры, и только пока хоть одна видна
let running = false
const t0 = performance.now()

function wake() {
  if (running) return
  running = true
  raf(tick)
}

function tick() {
  let any = false
  const t = (performance.now() - t0) / 1000
  for (const it of items.values()) {
    if (!it.ready || !it.visible || it.still) continue
    any = true
    const g = it.group
    if (it.follows) {
      // За курсором тянемся плавно, иначе фигура дёргается вслед за
      // каждым событием мыши. Лёгкое собственное движение остаётся:
      // без него при неподвижной мыши объект выглядит мёртвым.
      const wantY = it.aimX * 0.42 + Math.sin(t * 0.28) * 0.08
      const wantX = it.aimY * 0.24 + Math.sin(t * 0.21 + 1.2) * 0.06
      g.rotation.y += (wantY - g.rotation.y) * 0.06
      g.rotation.x += (wantX - g.rotation.x) * 0.06
      g.rotation.z = Math.sin(t * 0.19) * 0.05
      g.position.y = Math.sin(t * 0.45) * 0.05
    } else {
      // Не полный оборот, а покачивание: на полном обороте фигура
      // раз в цикл встаёт ребром и пропадает
      g.rotation.y = Math.sin(t * 0.34) * 0.62
      g.rotation.x = Math.sin(t * 0.23 + 1.2) * 0.2
      g.rotation.z = Math.sin(t * 0.19) * 0.08
      g.position.y = Math.sin(t * 0.45) * 0.07
    }
    draw(it)
  }
  if (any) raf(tick)
  else running = false
}
