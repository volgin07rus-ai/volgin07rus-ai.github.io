/* Интерактивы для карточки и шпаргалок */
(() => {
  /* Как прибор с полосой bw покажет меандр частотой f. Ряд Фурье через фильтр первого порядка */
  CD.meander = (host, bw) => {
    const W = 600, H = 220;
    const fmtF = (f) => (f >= 1 ? `${CD.num(+f.toFixed(f < 10 ? 1 : 0))} МГц` : `${CD.num(+(f * 1000).toFixed(0))} кГц`);
    host.innerHTML = `
      <div class="mq__scr"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path class="mq__ideal"/><path class="mq__real"/></svg>
        <span class="mq__tag">Полоса прибора ${CD.num(bw)} МГц</span></div>
      <label class="mq__ctl"><span class="lbl">Частота меандра</span><input class="rng" type="range" min="0" max="100" step="1" value="40" aria-describedby="mq-out"><output id="mq-out"></output></label>
      <p class="mq__v" aria-live="polite"></p>`;
    const [ideal, real] = host.querySelectorAll('path');
    const inp = host.querySelector('input'), out = host.querySelector('output'), verdict = host.querySelector('.mq__v');
    const fMin = 0.01, fMax = bw * 1.6;
    const f = (t) => fMin * Math.pow(fMax / fMin, t / 100);
    const y = (v) => (H / 2 - v * (H / 2 - 18)).toFixed(1);

    inp.value = Math.round((100 * Math.log(bw / 8 / fMin)) / Math.log(fMax / fMin));
    const idealPath = `M0 ${y(1)}L${W * 0.25} ${y(1)}L${W * 0.25} ${y(-1)}L${W * 0.5} ${y(-1)}L${W * 0.5} ${y(1)}L${W * 0.75} ${y(1)}L${W * 0.75} ${y(-1)}L${W} ${y(-1)}`;
    ideal.setAttribute('d', idealPath);

    const render = () => {
      const fs = f(+inp.value);
      out.textContent = fmtF(fs);
      let d = '';
      const N = 400;
      for (let i = 0; i <= N; i++) {
        const t = (i / N) * 2 + 0.0001;
        let v = 0;
        for (let n = 1; n <= 151; n += 2) {
          const r = (n * fs) / bw;
          v += (4 / (Math.PI * n)) * (1 / Math.sqrt(1 + r * r)) * Math.sin(2 * Math.PI * n * t - Math.atan(r));
        }
        d += `${i ? 'L' : 'M'}${((i / N) * W).toFixed(1)} ${y(v * 0.92)}`;
      }
      real.setAttribute('d', d);
      const k = bw / fs;
      const loss = Math.round((1 - 1 / Math.sqrt(1 + 1 / (k * k))) * 100);
      verdict.textContent =
        k >= 10 ? `Запас ${CD.num(Math.round(k))}×. Фронты видно честно, ошибка амплитуды ${loss} %`
          : k >= 5 ? `Запас ${CD.num(+k.toFixed(1))}×. Форму видно, фронты слегка сглажены`
            : k >= 2 ? `Запас ${CD.num(+k.toFixed(1))}×. Меандр уже похож на синус, синус занижен на ${loss} %`
              : `Вне полосы. Прибор показывает в основном первую гармонику, амплитуда занижена на ${loss} %`;
    };
    inp.addEventListener('input', render);
    render();
  };
})();
