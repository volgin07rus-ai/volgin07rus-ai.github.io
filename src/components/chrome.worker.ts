/// <reference lib="webworker" />
import { handle, offscreenGL, type StageMsg } from './chromeStage'

/* Фоновый поток для хромированных фигур: вся работа WebGL идёт здесь,
   а страница только пересылает размер, видимость и курсор */
const gl = offscreenGL()
self.postMessage({ type: 'gl', ok: gl })

self.onmessage = (e: MessageEvent<StageMsg>) => {
  if (gl) handle(e.data, () => new OffscreenCanvas(1, 1))
}
