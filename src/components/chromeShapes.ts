import * as THREE from 'three'

export type ChromeShape = 'spark' | 'frame' | 'code'

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

export function buildShape(kind: ChromeShape): THREE.BufferGeometry[] {
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
