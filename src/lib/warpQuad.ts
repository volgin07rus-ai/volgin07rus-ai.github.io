/**
 * Рисует картинку в произвольный четырёхугольник.
 *
 * Простым setTransform тут не обойтись: у монитора на первых кадрах
 * настоящая перспектива, и четырёхугольник — трапеция. Аффинное
 * преобразование трапецию не строит, оно сохраняет параллельность.
 *
 * Поэтому считаем проективное отображение единичного квадрата в
 * четырёхугольник, режем его на сетку треугольников и каждый рисуем
 * своим аффинным преобразованием. На мелкой сетке разница с настоящей
 * перспективой не видна.
 */
export type Quad = [number, number][]

/** Источником может быть и картинка, и холст: на холсте мы смешиваем два снимка */
export type WarpSource = HTMLImageElement | HTMLCanvasElement

type Proj = { a: number; b: number; c: number; d: number; e: number; f: number; g: number; h: number }

function srcSize(img: WarpSource): [number, number] {
  return img instanceof HTMLImageElement ? [img.naturalWidth, img.naturalHeight] : [img.width, img.height]
}

/** Отображение единичного квадрата (0,0)-(1,0)-(1,1)-(0,1) в четырёхугольник */
function projection(q: Quad): Proj {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q
  const sx = x0 - x1 + x2 - x3
  const sy = y0 - y1 + y2 - y3

  if (Math.abs(sx) < 1e-9 && Math.abs(sy) < 1e-9) {
    // Параллелограмм — хватает аффинного
    return { a: x1 - x0, b: x3 - x0, c: x0, d: y1 - y0, e: y3 - y0, f: y0, g: 0, h: 0 }
  }

  const dx1 = x1 - x2
  const dx2 = x3 - x2
  const dy1 = y1 - y2
  const dy2 = y3 - y2
  const den = dx1 * dy2 - dx2 * dy1
  const g = (sx * dy2 - dx2 * sy) / den
  const h = (dx1 * sy - sx * dy1) / den

  return {
    a: x1 - x0 + g * x1,
    b: x3 - x0 + h * x3,
    c: x0,
    d: y1 - y0 + g * y1,
    e: y3 - y0 + h * y3,
    f: y0,
    g,
    h,
  }
}

function apply(p: Proj, u: number, v: number): [number, number] {
  const w = p.g * u + p.h * v + 1
  return [(p.a * u + p.b * v + p.c) / w, (p.d * u + p.e * v + p.f) / w]
}

/**
 * Раздувает треугольник на δ пикселей наружу.
 *
 * Сдвигаем не вершины от центра тяжести, а сами рёбра по их нормалям:
 * от центра тяжести узкое ребро уезжает заметно меньше, чем на δ, и щель
 * остаётся. По нормали каждое ребро гарантированно уходит ровно на δ,
 * поэтому соседние треугольники перекрываются непрозрачной полосой в 2δ
 * и шва не остаётся вовсе.
 */
const РАЗДУВ = 0.75

function inflate(p: number[]): number[] {
  const v = [
    [p[0], p[1]],
    [p[2], p[3]],
    [p[4], p[5]],
  ]
  const cx = (v[0][0] + v[1][0] + v[2][0]) / 3
  const cy = (v[0][1] + v[1][1] + v[2][1]) / 3

  // Каждое ребро — точка и направление, уже отодвинутые наружу
  const edge: number[][] = []
  for (let i = 0; i < 3; i++) {
    const a = v[i]
    const b = v[(i + 1) % 3]
    const rx = b[0] - a[0]
    const ry = b[1] - a[1]
    const len = Math.hypot(rx, ry)
    if (!len) return p
    // Нормаль разворачиваем от центра тяжести — так она наружу при любом обходе
    let nx = ry / len
    let ny = -rx / len
    if (((a[0] + b[0]) / 2 - cx) * nx + ((a[1] + b[1]) / 2 - cy) * ny < 0) {
      nx = -nx
      ny = -ny
    }
    edge.push([a[0] + nx * РАЗДУВ, a[1] + ny * РАЗДУВ, rx, ry])
  }

  // Новая вершина — пересечение двух сошедшихся на ней сдвинутых рёбер
  const out: number[] = []
  for (let i = 0; i < 3; i++) {
    const [px, py, rx, ry] = edge[(i + 2) % 3]
    const [qx, qy, sx, sy] = edge[i]
    const den = rx * sy - ry * sx
    if (!den) return p
    const t = ((qx - px) * sy - (qy - py) * sx) / den
    out.push(px + rx * t, py + ry * t)
  }
  return out
}

/** Один треугольник: картинка обрезается по нему и растягивается аффинно */
function triangle(
  ctx: CanvasRenderingContext2D,
  img: WarpSource,
  s: number[],
  d: number[]
) {
  const [sx0, sy0, sx1, sy1, sx2, sy2] = s
  const [dx0, dy0, dx1, dy1, dx2, dy2] = d

  const den = sx0 * (sy2 - sy1) - sx1 * sy2 + sx2 * sy1 + (sx1 - sx2) * sy0
  if (!den) return

  // Раздуваем только обрезку, а преобразование считаем по исходным
  // вершинам: тогда в полосе перекрытия соседи рисуют одно и то же
  // продолжение картинки, и стыка не видно даже вблизи.
  const [ix0, iy0, ix1, iy1, ix2, iy2] = inflate(d)

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(ix0, iy0)
  ctx.lineTo(ix1, iy1)
  ctx.lineTo(ix2, iy2)
  ctx.closePath()
  ctx.clip()

  const m11 = -(sy0 * (dx2 - dx1) - sy1 * dx2 + sy2 * dx1 + (sy1 - sy2) * dx0) / den
  const m12 = (sy1 * dy2 + sy0 * (dy1 - dy2) - sy2 * dy1 + (sy2 - sy1) * dy0) / den
  const m21 = (sx0 * (dx2 - dx1) - sx1 * dx2 + sx2 * dx1 + (sx1 - sx2) * dx0) / den
  const m22 = -(sx1 * dy2 + sx0 * (dy1 - dy2) - sx2 * dy1 + (sx2 - sx1) * dy0) / den
  const tx =
    (sx0 * (sy2 * dx1 - sy1 * dx2) + sy0 * (sx1 * dx2 - sx2 * dx1) + (sx2 * sy1 - sx1 * sy2) * dx0) /
    den
  const ty =
    (sx0 * (sy2 * dy1 - sy1 * dy2) + sy0 * (sx1 * dy2 - sx2 * dy1) + (sx2 * sy1 - sx1 * sy2) * dy0) /
    den

  ctx.transform(m11, m12, m21, m22, tx, ty)
  // Рисуем только тот кусок картинки, который нужен этому треугольнику.
  // Полный drawImage под обрезкой давал бы столько прогонов всей
  // картинки, сколько треугольников в сетке.
  //
  // Кусок берём с запасом в пиксель по краям: на границе куска браузер
  // размазывает крайний ряд вместо того, чтобы взять соседний, и в
  // полосе перекрытия это дало бы едва заметную кромку. Прямоугольник
  // источника и приёмника совпадают, так что запас ничего не смещает.
  const [iw, ih] = srcSize(img)
  const bx = Math.max(0, Math.min(sx0, sx1, sx2) - 1)
  const by = Math.max(0, Math.min(sy0, sy1, sy2) - 1)
  const bw = Math.min(iw, Math.max(sx0, sx1, sx2) + 1) - bx
  const bh = Math.min(ih, Math.max(sy0, sy1, sy2) + 1) - by
  if (bw > 0 && bh > 0) ctx.drawImage(img, bx, by, bw, bh, bx, by, bw, bh)
  ctx.restore()
}

/**
 * @param quad четыре угла в пикселях канваса, по часовой от левого верхнего
 * @param grid частота сетки; шесть уже неотличимо от настоящей перспективы
 */
export function warpQuad(
  ctx: CanvasRenderingContext2D,
  img: WarpSource,
  quad: Quad,
  grid = 6
) {
  const p = projection(quad)
  const [iw, ih] = srcSize(img)

  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      const u0 = c / grid
      const u1 = (c + 1) / grid
      const v0 = r / grid
      const v1 = (r + 1) / grid

      const s00 = [u0 * iw, v0 * ih]
      const s10 = [u1 * iw, v0 * ih]
      const s11 = [u1 * iw, v1 * ih]
      const s01 = [u0 * iw, v1 * ih]

      const d00 = apply(p, u0, v0)
      const d10 = apply(p, u1, v0)
      const d11 = apply(p, u1, v1)
      const d01 = apply(p, u0, v1)

      triangle(ctx, img, [...s00, ...s10, ...s11], [...d00, ...d10, ...d11])
      triangle(ctx, img, [...s00, ...s11, ...s01], [...d00, ...d11, ...d01])
    }
  }
}
