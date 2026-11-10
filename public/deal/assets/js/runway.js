/* Подиум: кольцо на компьютере, диагональная очередь на телефоне, панель образа */
(() => {
  'use strict';

  const D = window.RW;
  const Site = window.Site;
  const esc = Site.esc;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const mod = (a, n) => ((a % n) + n) % n;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const TAU = Math.PI * 2;
  const SECTION_KEY = 'template--28035983671601__the_runway_wdM8BG';

  const FEEL = { K: 95, C: 2 * Math.sqrt(95), lag: 0.04 };
  const CLASSIC_PHONE = { ax: 0.3, ay: 22, sx: 0.32, sy: 22, sr: 0.76, ex: 0.55, d: 4 };
  const CLASSIC_DESK = { ax: 0.4, ay: 36, sx: 0.125, sy: 58, sr: 0.76, ex: 0.38, d: 5 };
  const SHEET_VARS = ['--rw-panel', '--rw-text', '--rw-muted', '--rw-line', '--rw-accent', '--rw-on-accent', '--rw-btn-bg', '--rw-btn-fg', '--rw-btn-radius', '--rw-pill-radius', '--rw-bar-r', '--rw-thumb-radius', '--rw-pt-size', '--rw-price', '--rw-opt', '--rw-ease', '--rw-ease-sheet', '--rw-ease-spring'];

  const SVG = {
    plus: '<svg class="rw__add-plus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M12 4v16M4 12h16"/></svg>',
    check: '<svg class="rw__add-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4.5 12.5l5 5L19.5 7"/></svg>',
    spin: '<svg class="rw__add-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3a9 9 0 1 1-9 9"/></svg>',
    arrowL: '<svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M25 7H1M7 1L1 7l6 6"/></svg>',
    arrowR: '<svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 7h24M19 1l6 6-6 6"/></svg>',
    close: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>'
  };

  const modelImg = (look, lazy) => `<img src="${look.src}" srcset="${look.src} 640w, ${look.orig} 1080w" sizes="(min-width: 1800px) 540px, (min-width: 750px) 420px, 320px" loading="${lazy ? 'lazy' : 'eager'}" decoding="async" width="1100" height="1956" draggable="false" data-model-image alt="${esc(look.name)}">`;

  class RunwaySection extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      const d = this.dataset;
      this.cfg = {
        blur: d.blur === 'true',
        autoplay: d.autoplay === 'true',
        speed: Number(d.speed) || 5000,
        mheightVh: Number(d.mheightVh) || 109,
        msgChoose: d.msgChoose || '',
        msgError: d.msgError || '',
        msgSoldout: d.msgSoldout || ''
      };
      this.looks = D.looks;
      this.n = this.looks.length;
      this.N = this.n * Math.ceil(8 / this.n);
      this.mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
      this.mqMobile = matchMedia('(max-width: 749px)');
      this.mqFine = matchMedia('(hover: hover) and (pointer: fine)');
      this.reduced = this.mqReduce.matches;
      this.start = this.reduced ? 0 : 1.15;
      this.ac = new AbortController();
      this.loop = this.loop.bind(this);
      this.onClick = this.onClick.bind(this);
      this.onChange = this.onChange.bind(this);

      const m = /^#look-(\d+)$/.exec(location.hash);
      this.index = m ? mod(Number(m[1]) - 1, this.n) : 0;

      this.renderMarkup();
      this.cache();
      this.build();
    }

    disconnectedCallback() {
      this.ac?.abort();
      cancelAnimationFrame(this.raf);
      cancelAnimationFrame(this.curRaf);
      clearTimeout(this.timer);
      clearTimeout(this.zoomTimer);
      this.ioVisible?.disconnect();
      this.ioReveal?.disconnect();
      this.ro?.disconnect();
      this.closeSheet(false);
      this._ready = false;
    }

    /* Разметка */
    pieceHTML(look, li, p, n) {
      const pid = `Picker-${SECTION_KEY}-look_${look.key}-${n}`;
      const optName = `Opt-${SECTION_KEY}-look_${look.key}-${n}-1`;
      const url = Site.productUrl(p);
      const tag = look.tag === n - 1 ? '<span class="rw__tag"><span class="rw__tag-text">Новинка</span></span>' : '';
      const thumb = p.h ? `width="400" height="${p.h}"` : '';
      const small = p.h ? `width="160" height="${Math.round(p.h * 0.4)}"` : '';
      return `
        <li class="rw__item" data-rw-card="${n}" style="--i:${n}" data-title="${esc(p.name)}">
          ${tag}
          <a class="rw__media" href="${url}" tabindex="-1" aria-hidden="true">
            <img src="${p.img}" ${thumb} loading="lazy" decoding="async" alt="">
            <span class="rw__num">${n}</span>
          </a>
          <div class="rw__info">
            <span class="rw__type">${esc(p.vendor)}</span>
            <a class="rw__name" href="${url}">${esc(p.name)}</a>
            <span class="rw__price"><span>${D.money(p.price)}</span></span>
          </div>
          <button class="rw__add" type="button" data-rw-add aria-expanded="false" aria-controls="${pid}" aria-label="Добавить в корзину: ${esc(p.name)}" data-added-label="Уже в корзине: ${esc(p.name)}">${SVG.plus}${SVG.check}${SVG.spin}</button>
          <div class="rw__picker" id="${pid}" data-rw-picker hidden>
            <div class="rw__picker-head">
              <span class="rw__picker-thumb"><img src="${p.img}" ${small} loading="lazy" decoding="async" alt=""></span>
              <div><p class="rw__picker-title">${esc(p.name)}</p><p class="rw__picker-price">${D.money(p.price)}</p></div>
              <button class="rw__picker-close" type="button" data-rw-pick-close aria-label="Закрыть">${SVG.close}</button>
            </div>
            <fieldset class="rw__opt">
              <legend class="rw__opt-name">${p.legend}</legend>
              <div class="rw__values">
                ${p.sizes.map((s, i) => `<label class="rw__pill"><input type="radio" name="${optName}" value="${s}" data-rw-option="0"${i === 0 ? ' checked' : ''}><span class="rw__pill-label">${s}</span></label>`).join('')}
              </div>
            </fieldset>
            <script type="application/json" data-rw-variants>${JSON.stringify(p.variants)}<\/script>
            <button class="rw__confirm" type="button" data-rw-confirm>
              <span data-rw-confirm-label data-add="В корзину">В корзину</span><span class="rw__sr">, ${esc(p.name)}</span>
            </button>
          </div>
        </li>`;
    }

    renderMarkup() {
      const start = this.index;
      const pieces = D.pieces(3);
      const bodies = this.looks.map((l, i) => `
        <div class="rw__model" data-rw-model data-index="${i}" aria-hidden="true">
          <span class="rw__shadow"></span>
          <div class="rw__figure" style="--rw-ar:0.5625"><div class="rw__art">
            ${modelImg(l)}
            <button class="rw__hit" type="button" data-rw-go="${i}" aria-label="Образ ${i + 1}: ${esc(l.name)}" tabindex="-1"></button>
          </div></div>
        </div>`).join('');

      const heroes = this.looks.map((l, i) => `
        <div class="rw__hero${i === start ? ' is-on' : ''}" data-rw-hero data-index="${i}" data-name="${esc(l.name)}" data-label="Образ ${i + 1}: ${esc(l.name)}" data-probe="${l.src}">
          <div class="rw__morph">
            <span class="rw__shadow"></span>
            <div class="rw__figure" style="--rw-ar:0.5625"><div class="rw__art">
              ${modelImg(l)}
              <button class="rw__zoom" type="button" data-rw-zoom aria-label="Смотреть образ: ${esc(l.name)}" tabindex="-1"></button>
              <div class="rw__pins">
                ${l.items.map((id, k) => `<button class="rw__pin" type="button" data-rw-pin="${k + 1}" data-tip="${esc(D.byId[id].name)}" style="left:${l.pins[k][0]}%;top:${l.pins[k][1]}%;--pi:${k + 1}" aria-label="${k + 1}: ${esc(D.byId[id].name)}" tabindex="-1"><span class="rw__pin-dot">${k + 1}</span></button>`).join('')}
              </div>
            </div></div>
          </div>
        </div>`).join('');

      const ticks = this.looks.map((l, i) => `
        <button class="rw__tick" type="button" data-rw-tick="${i}" aria-current="false" aria-label="Образ ${i + 1}: ${esc(l.name)}">
          <span class="rw__tick-bar"></span>
          <span class="rw__tick-label">0${i + 1}<span class="rw__tick-name">&nbsp;&nbsp;${esc(l.name)}</span></span>
        </button>`).join('');

      const panels = this.looks.map((l, i) => {
        const full = D.lookTotal(l), deal = D.lookBundle(l);
        return `
          <div class="rw__look-panel${i === start ? ' is-in' : ''}" data-rw-panel="${i}"${i === start ? '' : ' hidden'}>
            <div class="rw__mhead"><span class="rw__mhead-title">${esc(l.name)}</span><span class="rw__label">${pieces}</span></div>
            <ul class="rw__items" role="list">${l.items.map((id, k) => this.pieceHTML(l, i, D.byId[id], k + 1)).join('')}</ul>
            <div class="rw__bundle has-rule">
              <p class="rw__msg" data-rw-msg role="status" aria-live="polite"></p>
              <div class="rw__bundle-row">
                <div class="rw__bundle-copy"><span class="rw__bundle-title">Собери образ</span><span class="rw__bundle-note">Все 3 вещи со скидкой 10%</span></div>
                <div class="rw__bundle-price"><s>${D.money(full)}</s><strong>${D.money(deal)}</strong></div>
              </div>
              <button class="rw__cta" type="button" data-rw-all>
                <span class="rw__cta-add">Весь образ в корзину</span>
                <span class="rw__cta-m">Весь образ за ${D.money(deal)}</span>
                <span class="rw__cta-done">Весь образ в корзине</span>
                <svg class="rw__cta-arrow" width="22" height="12" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M1 7h24M19 1l6 6-6 6"/></svg>
                <svg class="rw__cta-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3a9 9 0 1 1-9 9"/></svg>
              </button>
            </div>
            <template data-rw-pieces-text>${pieces}</template>
          </div>`;
      }).join('');

      this.innerHTML = `
        <div class="rw__sticky">
          <div class="rw__grid">
            <div class="rw__left">
              <div class="rw__head">
                <div class="rw__intro">
                  <h2 class="rw__title">Примерь образ.</h2>
                  <p class="rw__sub">Шесть образов с головы до ног. Нажми на точку и смотри вещь.</p>
                </div>
                <span class="rw__sr" aria-live="polite" aria-atomic="true" data-rw-live></span>
              </div>
              <div class="rw__stage" data-rw-stage tabindex="0" role="region" aria-roledescription="карусель" aria-label="Примерь образ. Листай стрелками или свайпом">
                <div class="rw__actors" data-rw-actors>${bodies}</div>
                <div class="rw__heroes" data-rw-heroes>${heroes}</div>
                <span class="rw__sweep"></span>
                <span class="rw__cursor" data-rw-cursor><span class="rw__cursor-in"><span class="rw__cursor-label rw__cursor-drag">Тяни</span><span class="rw__cursor-label rw__cursor-view">Смотри</span></span></span>
                <span class="rw__walk"><span class="rw__walk-line"></span></span>
              </div>
              <div class="rw__controls">
                <button class="rw__icon" type="button" data-rw-prev aria-label="Предыдущий образ">${SVG.arrowL}</button>
                <div class="rw__ticks">${ticks}</div>
                <button class="rw__icon rw__auto" type="button" data-rw-auto aria-pressed="false" aria-label="Автопрокрутка">
                  <svg class="rw__ico-play" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z"/></svg>
                  <svg class="rw__ico-pause" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.5 4.5h3.5v15H6.5zM14 4.5h3.5v15H14z"/></svg>
                </button>
                <button class="rw__icon" type="button" data-rw-next aria-label="Следующий образ">${SVG.arrowR}</button>
              </div>
              <div class="rw__lb" data-rw-lb data-word="Образ" role="region" aria-label="Просмотр образа" aria-hidden="true">
                <div class="rw__lb-stage" data-rw-lb-stage></div>
                <div class="rw__lb-top">
                  <p class="rw__lb-cap"><span class="rw__lb-kicker" data-rw-lb-kicker></span><span class="rw__lb-name" data-rw-lb-name></span></p>
                  <button class="rw__lb-close" type="button" data-rw-zoom-close aria-label="Закрыть">${SVG.close}</button>
                </div>
                <p class="rw__lb-hint">Нажми на точку, чтобы посмотреть вещь</p>
              </div>
            </div>
            <div class="rw__panel has-rule">
              <div class="rw__panel-inner">
                <div class="rw__panel-head"><h3 class="rw__panel-title">В этом образе</h3><span class="rw__label" data-rw-pieces></span></div>
                ${panels}
              </div>
            </div>
          </div>
        </div>`;
    }

    cache() {
      const $ = s => this.querySelector(s);
      this.stage = $('[data-rw-stage]');
      this.actors = $('[data-rw-actors]');
      this.heroes = [...this.querySelectorAll('[data-rw-hero]')];
      this.ticks = [...this.querySelectorAll('[data-rw-tick]')];
      this.panels = [...this.querySelectorAll('[data-rw-panel]')];
      this.piecesLabel = $('[data-rw-pieces]');
      this.live = $('[data-rw-live]');
      this.cursor = $('[data-rw-cursor]');
      this.lb = $('[data-rw-lb]');
      this.lbStage = $('[data-rw-lb-stage]');
      this.lbKicker = $('[data-rw-lb-kicker]');
      this.lbName = $('[data-rw-lb-name]');
      this.lbClose = $('[data-rw-zoom-close]');
      this.autoBtn = $('[data-rw-auto]');
      this.panelEl = $('.rw__panel');
    }

    build() {
      const sig = { signal: this.ac.signal };

      /* Клоны тел для кольца из 12 фигур */
      const originals = [...this.actors.children];
      for (let a = this.n; a < this.N; a++) {
        const c = originals[a % this.n].cloneNode(true);
        c.setAttribute('data-rw-clone', '');
        c.dataset.index = a;
        c.querySelectorAll('img').forEach(img => { img.loading = 'lazy'; });
        this.actors.append(c);
      }
      this.bodies = [...this.actors.children].map((el, a) => ({
        el, a, look: a % this.n, w: 0, x: 0, v: 0, g: 0, goal: null, from: 0, trip: false, blur: -1,
        hit: el.querySelector('.rw__hit')
      }));
      this.bodies.forEach(s => { s.el._s = s; });

      this.querySelectorAll('[data-model-image]').forEach(img => this.watchImage(img));
      this.querySelectorAll('[data-rw-card]').forEach(card => {
        const pk = card.querySelector('[data-rw-picker]');
        card._picker = pk;
        pk._card = card;
        pk._variants = JSON.parse(pk.querySelector('[data-rw-variants]').textContent);
        this.syncPicker(pk, true);
      });

      this.classList.add('rw--js');
      this.target = this.index;
      this.cur = this.index - this.start;
      this.vel = 0;
      this.still = true;
      this.started = false;
      this.visible = false;
      this.playing = false;
      this.engaged = false;
      this.panelHover = false;
      this.zoomed = false;
      this.dragging = false;
      this.noClickUntil = 0;
      this.wheelAcc = 0;
      this.wheelLock = 0;
      this.mobile = this.mqMobile.matches;
      this.mode = this.mobile ? 'classic' : 'ring';

      this.measure();
      this.initClassic();
      this.setStill(false);
      this.renderAll();
      this.setIndex(this.index, true);
      this.detectFeet();
      this.bind(sig);
      this.initCursor(sig);
      this.observe();
      if (this.cfg.autoplay && !this.reduced) this.play(true);
    }

    watchImage(img) {
      const mark = () => img.classList.add('is-decoded');
      const go = () => {
        if (img.decode) img.decode().then(mark, () => { if (img.naturalWidth) mark(); });
        else mark();
      };
      if (img.complete && img.naturalWidth) go();
      else img.addEventListener('load', go, { once: true });
    }

    /* Замеры */
    headerHeight() {
      let h = 0;
      document.querySelectorAll('.shopify-section-group-header-group, #shopify-section-header, #shopify-section-announcement-bar').forEach(el => {
        if (el.contains(this)) return;
        const r = el.getBoundingClientRect();
        if (r.height && getComputedStyle(el).display !== 'none') h += r.height;
      });
      return h;
    }

    measure() {
      const mobile = this.mqMobile.matches;
      if (mobile !== this.mobile) {
        this.mobile = mobile;
        this.mode = mobile ? 'classic' : 'ring';
        this.closeSheet(false);
        this.cur = this.target;
        this.vel = 0;
        this.bodies.forEach(s => { s.goal = null; s.trip = false; });
        this.initClassic(true);
      }

      let frame;
      if (mobile) {
        const iw = innerWidth, ih = innerHeight;
        if (this.latchH == null || this.latchW !== iw || Math.abs(ih - this.latchH) >= 160) {
          this.latchH = ih;
          this.latchW = iw;
        }
        frame = this.latchH * clamp(this.cfg.mheightVh, 50, 120) / 100;
      } else {
        frame = Math.max(380, innerHeight - this.headerHeight());
      }
      this.style.setProperty('--rw-frame-h', `${Math.round(frame)}px`);

      const W = this.stage.clientWidth, H = this.stage.clientHeight;
      this.W = W;
      this.H = H;
      const ring = this.mode === 'ring';
      this.fs = ring ? 1.08 : 1;
      const modelH = ring
        ? Math.max(200, Math.round((H - 34 - 18) / 1.08))
        : Math.max(200, Math.round(H - (mobile ? 24 : 36) - 18));
      const hx = ring ? 0.5 * W : (mobile ? 0.3 : CLASSIC_DESK.ax) * W;
      const hy = ring ? 34 : (mobile ? 22 : 36);
      this.stage.style.setProperty('--rw-model-h', `${modelH}px`);
      this.stage.style.setProperty('--rw-fs', this.fs);
      this.stage.style.setProperty('--rw-hx', `${hx}px`);
      this.stage.style.setProperty('--rw-hy', `${hy}px`);
      this.style.setProperty('--rw-ax', `${W ? (hx / W * 100).toFixed(2) : 40}%`);
      this.bodies.forEach(s => { s.w = s.el.offsetWidth; });
      this.unit = ring ? Math.max(mobile ? 90 : 120, 0.3 * W) : Math.max(90, W * 0.32 * 1.6);
    }

    initClassic(noEntrance) {
      const off = noEntrance ? 0 : this.start;
      this.bodies.forEach(s => {
        const goal = mod(s.a - this.target, this.N);
        s.goal = goal;
        s.x = goal + off;
        s.g = s.x;
        s.v = 0;
        s.trip = false;
      });
    }

    /* Расстановка */
    put(s, x, bottom, scale, op, blur, z) {
      const half = s.w * scale / 2;
      if (x + half < -4 || x - half > this.W + 4) op = 0;
      const st = s.el.style;
      st.transform = `translate3d(${x.toFixed(2)}px,${(-bottom).toFixed(2)}px,0) translateX(-50%) scale(${scale.toFixed(4)})`;
      st.opacity = op.toFixed(3);
      st.zIndex = z;
      st.visibility = op < 0.01 ? 'hidden' : 'visible';
      st.pointerEvents = op < 0.5 ? 'none' : '';
      const b = this.cfg.blur ? Math.round(blur * 10) / 10 : 0;
      if (b !== s.blur) {
        s.blur = b;
        st.filter = b > 0.05 ? `blur(${b}px)` : '';
      }
    }

    renderRing() {
      const { W, H, fs, mobile, N } = this;
      const cx = 0.5 * W, R = (mobile ? 0.72 : 0.62) * W, P = (mobile ? 1.9 : 1.65) * W;
      const floor = H - 34, horizon = 0.36 * H, step = TAU / N;
      for (const s of this.bodies) {
        let phi = mod((s.a - this.cur) * step, TAU);
        if (phi > Math.PI) phi -= TAU;
        const z = R * (1 - Math.cos(phi));
        const persp = P / (P + z);
        const sl = Math.abs(phi) / step;
        const scale = persp * (1 + (fs - 1) * clamp(1 - sl, 0, 1));
        const x = cx + R * Math.sin(phi) * persp;
        const feet = horizon + (floor - horizon) * persp;
        const blur = sl <= 1 ? 1.8 * sl : Math.min(1.8 + (sl - 1) * 2, 6.5);
        let op = clamp((Math.cos(phi) + 0.55) / 0.3, 0, 1);
        if (this.still && sl < 0.02) op = 0;
        this.put(s, x, H - feet, scale, op, blur, Math.round(scale * 1000));
      }
    }

    renderClassic() {
      const c = this.mobile ? CLASSIC_PHONE : CLASSIC_DESK;
      const { W } = this;
      for (const s of this.bodies) {
        let k = s.x, e = -1;
        if (s.trip) {
          const dist = Math.abs(s.goal - s.from) || 1;
          const u = clamp(Math.abs(s.x - s.from) / dist, 0, 1);
          if (s.goal > s.from) {
            if (u < 0.5) e = 2 * u * 1.4;
            else k = s.goal + 2 * (1 - u);
          } else if (u < 0.5) {
            k = s.from + 2 * u;
          } else {
            e = 2 * (1 - u) * 1.4;
          }
        } else if (k < 0) {
          e = Math.min(-k, 1.4);
        }
        if (e >= 0) {
          this.put(s, W * (c.ax - c.ex * e), c.ay - 22 * e, 1 + 0.14 * e, Math.max(0, 1 - 1.05 * e), 4 * Math.min(e, 1), 1100);
          continue;
        }
        let op = k <= c.d - 1 ? 1 - 0.13 * k : Math.max(0, 0.61 * (c.d - k));
        if (this.still && Math.abs(k) < 0.02) op = 0;
        this.put(s, W * (c.ax + c.sx * k), c.ay + c.sy * k, Math.pow(c.sr, k), op, Math.min(0.9 * k, 3.2), 1000 - Math.round(10 * k));
      }
    }

    renderAll() {
      if (this.mode === 'ring') this.renderRing();
      else this.renderClassic();
    }

    /* Пружины */
    stepRing(dt) {
      if (this.reduced) { this.cur = this.target; this.vel = 0; return true; }
      const h = dt / 3;
      for (let i = 0; i < 3; i++) {
        const acc = -FEEL.K * (this.cur - this.target) - FEEL.C * this.vel;
        this.vel += acc * h;
        this.cur += this.vel * h;
      }
      if (Math.abs(this.cur - this.target) <= 0.0005 && Math.abs(this.vel) <= 0.0005) {
        this.cur = this.target;
        this.vel = 0;
        return true;
      }
      return false;
    }

    stepClassic(dt) {
      let done = true;
      const h = dt / 3;
      for (const s of this.bodies) {
        const goal = mod(s.a - this.target, this.N);
        if (s.goal != null && Math.abs(goal - s.goal) > this.N / 2) {
          s.trip = true;
          s.from = s.x;
        }
        s.goal = goal;
        if (this.reduced) { s.x = s.g = goal; s.v = 0; s.trip = false; continue; }
        const tau = this.dragging ? 0.016 : s.trip ? 0.1 : 0.03 + FEEL.lag * Math.min(goal, 4);
        s.g += (goal - s.g) * (1 - Math.exp(-dt / tau));
        for (let i = 0; i < 3; i++) {
          const acc = -FEEL.K * (s.x - s.g) - FEEL.C * s.v;
          s.v += acc * h;
          s.x += s.v * h;
        }
        if (s.trip && Math.abs(s.x - goal) < 0.02) s.trip = false;
        if (Math.abs(s.x - goal) <= 0.0006 && Math.abs(s.v) <= 0.0006 && Math.abs(s.g - goal) <= 0.0006) {
          s.x = s.g = goal;
          s.v = 0;
        } else {
          done = false;
        }
      }
      return done;
    }

    setStill(v) {
      if (this.still === v) return;
      this.still = v;
      this.classList.toggle('rw--still', v);
    }

    canRun() { return this.started && this.visible && !document.hidden; }

    kick() {
      if (this.raf || !this.canRun()) return;
      this.lastT = 0;
      this.raf = requestAnimationFrame(this.loop);
    }

    loop(now) {
      this.raf = 0;
      if (!this.canRun()) return;
      const dt = this.lastT ? Math.min(0.034, (now - this.lastT) / 1000) : 1 / 60;
      this.lastT = now;
      const settled = this.mode === 'ring' ? this.stepRing(dt) : this.stepClassic(dt);
      if (settled && !this.dragging) {
        this.setStill(true);
        this.renderAll();
        return;
      }
      this.setStill(false);
      this.renderAll();
      this.raf = requestAnimationFrame(this.loop);
    }

    /* Смена образа */
    rank(a) {
      const t = Math.round(this.target);
      let k = mod(a - t, this.N);
      if (this.mode === 'ring' && k > this.N / 2) k -= this.N;
      return k;
    }

    setIndex(i, silent) {
      const prev = this.index;
      const changed = i !== prev;
      this.index = i;

      const limit = this.mode === 'ring' ? 2 : 3;
      for (const s of this.bodies) {
        const k = this.rank(s.a);
        const on = k !== 0 && Math.abs(k) <= limit;
        s.hit.tabIndex = on ? 0 : -1;
        if (on) s.el.removeAttribute('aria-hidden');
        else s.el.setAttribute('aria-hidden', 'true');
      }

      if (!changed && !silent) return;

      if (!silent) {
        this.closeZoom();
        if (this.mobile) this.closeSheet(false);
      }

      this.style.setProperty('--rw-progress', ((i + 1) / this.n).toFixed(3));

      this.heroes.forEach((h, j) => {
        const on = j === i;
        h.classList.toggle('is-on', on);
        h.classList.toggle('was', j === prev && changed);
        h.setAttribute('aria-hidden', String(!on));
        h.querySelector('[data-rw-zoom]').tabIndex = on ? 0 : -1;
      });

      if (!silent && !this.reduced) {
        this.stage.classList.remove('is-sweep');
        void this.stage.offsetWidth;
        this.stage.classList.add('is-sweep');
      }

      if (!silent) this.live.textContent = `Образ ${i + 1}: ${this.looks[i].name}`;

      this.ticks.forEach((t, j) => {
        t.setAttribute('aria-current', String(j === i));
        t.classList.toggle('is-past', j < i);
      });

      if (!silent) {
        this.panels.forEach((p, j) => {
          p.hidden = j !== i;
          p.classList.remove('is-in');
        });
        void this.panels[i].offsetWidth;
        this.panels[i].classList.add('is-in');
      }

      this.piecesLabel.textContent = this.panels[i].querySelector('[data-rw-pieces-text]').content.textContent;
      if (!silent) {
        this.piecesLabel.classList.remove('is-swap');
        void this.piecesLabel.offsetWidth;
        this.piecesLabel.classList.add('is-swap');
      }

      this.clearHot();
      this.restartBar();
    }

    moveTo(T) {
      this.target = T;
      this.setStill(false);
      this.setIndex(mod(T, this.n));
      this.kick();
    }
    next() { this.moveTo(Math.round(this.target) + 1); }
    prev() { this.moveTo(Math.round(this.target) - 1); }
    go(i) {
      let d = mod(i - this.index, this.n);
      if (d > this.n / 2) d -= this.n;
      this.moveTo(Math.round(this.target) + d);
    }

    /* Автопрокрутка */
    play(on) {
      this.playing = on;
      this.classList.toggle('is-playing', on);
      this.autoBtn.setAttribute('aria-pressed', String(on));
      this.restartBar();
    }

    restartBar() {
      clearTimeout(this.timer);
      this.ticks.forEach(t => t.classList.remove('is-run'));
      if (!this.playing) return;
      void this.stage.offsetWidth;
      this.ticks[this.index].classList.add('is-run');
      this.timer = setTimeout(() => {
        if (this.playing && this.visible && !this.dragging && !document.hidden && !this.panelHover && !this.zoomed && !this.engaged) this.next();
        else this.restartBar();
      }, this.cfg.speed);
    }

    engage() {
      if (this.engaged) return;
      this.engaged = true;
      this.play(false);
    }

    /* События */
    bind(sig) {
      const st = this.stage;
      st.addEventListener('pointerdown', e => this.onDown(e), sig);
      st.addEventListener('pointermove', e => this.onMove(e), sig);
      st.addEventListener('pointerup', e => this.onUp(e), sig);
      st.addEventListener('pointercancel', e => this.onUp(e), sig);
      st.addEventListener('wheel', e => this.onWheel(e), { passive: false, signal: this.ac.signal });
      st.addEventListener('keydown', e => {
        if (e.target !== st) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); this.next(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); this.prev(); }
      }, sig);

      this.addEventListener('click', e => {
        if (performance.now() < this.noClickUntil) { e.preventDefault(); e.stopPropagation(); }
      }, { capture: true, signal: this.ac.signal });
      this.addEventListener('click', this.onClick, sig);
      this.addEventListener('change', this.onChange, sig);

      this.panelEl.addEventListener('click', e => {
        if (e.target.closest('button, a, input, select, label')) this.engage();
      }, sig);
      this.panelEl.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') this.panelHover = true; }, sig);
      this.panelEl.addEventListener('pointerleave', e => {
        if (e.pointerType !== 'mouse') return;
        this.panelHover = false;
        this.restartBar();
      }, sig);
      this.panelEl.addEventListener('pointerover', e => {
        if (e.pointerType !== 'mouse') return;
        const card = e.target.closest('[data-rw-card]');
        if (card) this.hot(Number(card.dataset.rwCard));
      }, sig);
      this.panelEl.addEventListener('pointerout', e => {
        if (e.pointerType !== 'mouse') return;
        const card = e.target.closest('[data-rw-card]');
        if (card && !card.contains(e.relatedTarget)) this.clearHot();
      }, sig);

      document.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return;
        if (this.sheet) { this.closeSheet(true); return; }
        if (this.zoomed) this.closeZoom();
      }, sig);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) this.kick(); }, sig);
      window.addEventListener('hashchange', () => {
        const m = /^#look-(\d+)$/.exec(location.hash);
        if (m) this.go(mod(Number(m[1]) - 1, this.n));
      }, sig);

      let t = 0;
      const onResize = () => {
        clearTimeout(t);
        t = setTimeout(() => {
          this.measure();
          this.renderAll();
          if (this.zoomed) this.layoutZoom();
          this.kick();
        }, 120);
      };
      window.addEventListener('resize', onResize, sig);
      this.ro = new ResizeObserver(onResize);
      this.ro.observe(st);
    }

    observe() {
      this.ioVisible = new IntersectionObserver(items => {
        this.visible = items[items.length - 1].isIntersecting;
        if (this.visible) this.kick();
      }, { threshold: 0 });
      this.ioVisible.observe(this);

      const reveal = () => {
        this.classList.add('is-revealed');
        this.started = true;
        this.setStill(false);
        this.kick();
      };
      if (this.reduced) { this.visible = true; reveal(); return; }
      this.ioReveal = new IntersectionObserver(items => {
        if (!items.some(i => i.isIntersecting)) return;
        this.ioReveal.disconnect();
        requestAnimationFrame(() => requestAnimationFrame(reveal));
      }, { threshold: 0, rootMargin: '0px 0px -22% 0px' });
      this.ioReveal.observe(this);
    }

    onDown(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      this.p = { id: e.pointerId, x: e.clientX, y: e.clientY, t: this.target, drag: false, samples: [{ x: e.clientX, time: performance.now() }] };
    }

    onMove(e) {
      const p = this.p;
      if (!p || e.pointerId !== p.id) return;
      if (e.pointerType === 'mouse' && !(e.buttons & 1)) { this.onUp(e); return; }
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.samples.push({ x: e.clientX, time: performance.now() });
      if (p.samples.length > 6) p.samples.shift();
      if (!p.drag) {
        if (Math.abs(dx) > 8 && Math.abs(dx) > 1.2 * Math.abs(dy)) {
          p.drag = true;
          this.dragging = true;
          this.classList.add('is-dragging');
          try { this.stage.setPointerCapture(e.pointerId); } catch (err) { /* указатель уже ушёл */ }
          this.cursor?.classList.remove('is-link', 'is-view');
        } else if (Math.abs(dy) > 10) {
          this.p = null;
          return;
        } else {
          return;
        }
      }
      this.target = p.t - dx / this.unit;
      this.setStill(false);
      this.kick();
    }

    onUp(e) {
      const p = this.p;
      if (!p || e.pointerId !== p.id) return;
      this.p = null;
      if (!p.drag) return;
      this.dragging = false;
      this.classList.remove('is-dragging');
      try { this.stage.releasePointerCapture(e.pointerId); } catch (err) { /* уже отпущен */ }
      const S = p.samples, a = S[0], b = S[S.length - 1];
      const vx = (b.x - a.x) / ((b.time - a.time) || 1);
      const from = Math.round(p.t), dx = b.x - p.x, sign = -1;
      this.noClickUntil = performance.now() + 60;
      if (this.mobile) {
        if (Math.abs(dx) > 30 || Math.abs(vx) > 0.3) this.moveTo(from + sign * (dx > 0 ? 1 : -1));
        else this.moveTo(from);
        return;
      }
      let i = Math.round(this.target + sign * vx * 160 / this.unit);
      if (i === from && Math.abs(vx) > 0.3) i = from + sign * Math.sign(vx);
      this.moveTo(clamp(i, from - 2, from + 2));
    }

    onWheel(e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (performance.now() < this.wheelLock) return;
      this.wheelAcc += e.deltaX;
      if (Math.abs(this.wheelAcc) > 45) {
        if (this.wheelAcc > 0) this.next();
        else this.prev();
        this.wheelAcc = 0;
        this.wheelLock = performance.now() + 520;
      }
    }

    onClick(e) {
      const t = e.target;
      const is = s => t.closest(s);
      let n;
      if (is('[data-rw-pick-close]')) { this.closeSheet(true); return; }
      if (is('[data-rw-zoom-close]')) { this.closeZoom(); return; }
      if (this.zoomed && is('[data-rw-lb]') && !is('.rw__lb-model') && !is('.rw__lb-top')) { this.closeZoom(); return; }
      if (is('[data-rw-zoom]')) { this.openZoom(); return; }
      if (is('[data-rw-next]')) { this.next(); return; }
      if (is('[data-rw-prev]')) { this.prev(); return; }
      if ((n = is('[data-rw-tick]'))) { this.go(Number(n.dataset.rwTick)); return; }
      if (is('[data-rw-auto]')) {
        if (!this.playing) this.engaged = false;
        this.play(!this.playing);
        return;
      }
      if ((n = is('[data-rw-pin]'))) { this.engage(); this.hot(Number(n.dataset.rwPin), true); return; }
      if ((n = is('[data-rw-go]'))) {
        const s = n.closest('[data-rw-model]')._s;
        const k = this.rank(s.a);
        if (k === 0) this.openZoom();
        else if (Math.abs(k) < this.N / 2) this.moveTo(Math.round(this.target) + k);
        return;
      }
      if ((n = is('[data-rw-confirm]'))) { this.onConfirm(n); return; }
      if ((n = is('[data-rw-add]'))) { this.onPlus(n); return; }
      if ((n = is('[data-rw-all]'))) { this.onAll(n); }
    }

    onChange(e) {
      if (!e.target.matches('[data-rw-option]')) return;
      this.engage();
      this.syncPicker(e.target.closest('[data-rw-picker]'), false);
    }

    /* Свой курсор */
    initCursor(sig) {
      if (!this.mqFine.matches) { this.cursor.remove(); this.cursor = null; return; }
      this.classList.add('rw--cursor');
      const el = this.cursor, st = this.stage;
      const factor = this.reduced ? 1 : 0.18;
      let x = 0, y = 0, tx = 0, ty = 0, seen = false;
      const step = () => {
        x += (tx - x) * factor;
        y += (ty - y) * factor;
        el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
        this.curRaf = (Math.hypot(tx - x, ty - y) >= 0.2) ? requestAnimationFrame(step) : 0;
      };
      st.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        const r = st.getBoundingClientRect();
        tx = e.clientX - r.left;
        ty = e.clientY - r.top;
        if (!seen) { x = tx; y = ty; seen = true; el.classList.add('is-on'); }
        const t = e.target;
        const dragging = this.dragging;
        el.classList.toggle('is-view', !dragging && !!t.closest('.rw__zoom'));
        el.classList.toggle('is-link', !dragging && !!t.closest('.rw__pin, .rw__hit'));
        if (!this.curRaf) this.curRaf = requestAnimationFrame(step);
      }, sig);
      st.addEventListener('pointerleave', () => {
        seen = false;
        el.classList.remove('is-on', 'is-link', 'is-view');
      }, sig);
    }

    /* Связь точек и строк */
    clearHot() {
      this.querySelectorAll('.is-hot').forEach(n => n.classList.remove('is-hot'));
    }

    hot(n, scroll) {
      this.clearHot();
      const scope = this.zoomed ? this.lbStage : this.heroes[this.index];
      scope.querySelector(`[data-rw-pin="${n}"]`)?.classList.add('is-hot');
      const card = this.panels[this.index].querySelector(`[data-rw-card="${n}"]`);
      if (!card) return;
      card.classList.add('is-hot');
      if (scroll) this.reveal(card);
    }

    reveal(card) {
      const list = card.closest('.rw__items');
      const behavior = this.reduced ? 'auto' : 'smooth';
      if (list.scrollWidth > list.clientWidth + 1) {
        list.scrollTo({ left: card.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft - 20, behavior });
      } else if (list.scrollHeight > list.clientHeight + 1) {
        list.scrollTo({ top: card.offsetTop - list.offsetTop - 12, behavior });
      } else {
        const r = card.getBoundingClientRect();
        if (r.top < 0 || r.bottom > innerHeight - 140) window.scrollBy({ top: r.top - 0.3 * innerHeight, behavior });
      }
    }

    /* Просмотр образа */
    figRect(root) { return root.querySelector('.rw__figure').getBoundingClientRect(); }

    layoutZoom() {
      const m = this.lbStage.firstElementChild;
      if (!m) return 0;
      const r = this.lbStage.getBoundingClientRect();
      const h = Math.max(160, Math.min(r.height, r.width / 0.5625));
      m.style.setProperty('--rw-model-h', `${h}px`);
      m.querySelectorAll('img').forEach(img => { img.sizes = `${Math.round(h * 0.5625)}px`; });
      return h;
    }

    openZoom() {
      if (this.zoomed) return;
      this.engage();
      this.clearHot();
      clearTimeout(this.zoomTimer);
      const hero = this.heroes[this.index];
      const wrap = document.createElement('div');
      wrap.className = 'rw__lb-model';
      wrap.style.setProperty('--rw-foot', hero.style.getPropertyValue('--rw-foot') || 0);
      const shadow = hero.querySelector('.rw__shadow').cloneNode(true);
      const fig = hero.querySelector('.rw__figure').cloneNode(true);
      fig.querySelector('.rw__zoom').remove();
      fig.querySelectorAll('.rw__pin').forEach(p => { p.tabIndex = 0; p.classList.remove('is-hot'); });
      fig.querySelectorAll('img').forEach(img => { img.loading = 'eager'; img.classList.add('is-decoded'); });
      wrap.append(shadow, fig);
      this.lbKicker.textContent = `${this.lb.dataset.word} 0${this.index + 1}`;
      this.lbName.textContent = this.looks[this.index].name;
      this.lbStage.replaceChildren(wrap);
      this.layoutZoom();
      this.zoomHero = hero;
      this.zoomed = true;
      this.classList.add('rw--zoom');
      this.lb.setAttribute('aria-hidden', 'false');
      this.lbClose.focus({ preventScroll: true });

      if (!this.reduced) {
        wrap.style.transition = 'none';
        wrap.style.transform = this.flipTo(wrap, hero);
        void wrap.offsetWidth;
        wrap.style.transition = '';
        wrap.style.transform = '';
      }
    }

    flipTo(wrap, hero) {
      const prior = wrap.style.transform;
      wrap.style.transform = '';
      const a = this.figRect(hero), b = this.figRect(wrap);
      wrap.style.transform = prior;
      return `translate3d(${a.left - b.left}px,${a.bottom - b.bottom}px,0) scale(${a.height / b.height})`;
    }

    closeZoom() {
      if (!this.zoomed) return;
      this.zoomed = false;
      const wrap = this.lbStage.firstElementChild;
      if (wrap && !this.reduced) wrap.style.transform = this.flipTo(wrap, this.zoomHero);
      this.classList.remove('rw--zoom');
      this.lb.setAttribute('aria-hidden', 'true');
      if (this.lb.contains(document.activeElement)) this.stage.focus({ preventScroll: true });
      clearTimeout(this.zoomTimer);
      this.zoomTimer = setTimeout(() => this.lbStage.replaceChildren(), 950);
      this.restartBar();
    }

    /* Размеры и добавление */
    syncPicker(pk, init) {
      const card = pk._card, vars = pk._variants;
      const sets = [...pk.querySelectorAll('.rw__opt')];
      const selected = sets.map(fs => fs.querySelector('input:checked')?.value);
      const match = vars.find(v => v.o.every((o, i) => o === selected[i]));
      sets.forEach((fs, i) => fs.querySelectorAll('.rw__pill').forEach(lbl => {
        const val = lbl.querySelector('input').value;
        const ok = vars.some(v => v.a && v.o[i] === val && v.o.every((o, j) => j === i || o === selected[j]));
        lbl.classList.toggle('is-unavailable', !ok);
      }));
      const available = !!(match && match.a);
      const btn = pk.querySelector('[data-rw-confirm]');
      const lab = pk.querySelector('[data-rw-confirm-label]');
      btn.disabled = !available;
      lab.textContent = available ? lab.dataset.add : this.cfg.msgSoldout;
      card.dataset.selected = available ? match.id : '';
      if (!init) card.dataset.touched = '1';
    }

    onPlus(btn) {
      const card = btn.closest('[data-rw-card]');
      if (card.classList.contains('is-added') || card.classList.contains('is-loading')) return;
      if (card.classList.contains('is-picking')) this.closePicker(card);
      else this.openPicker(card);
    }

    openPicker(card) {
      if (this.mobile) { this.openSheet(card); return; }
      const pk = card._picker;
      pk.hidden = false;
      card.classList.add('is-picking');
      card.querySelector('[data-rw-add]').setAttribute('aria-expanded', 'true');
      pk.querySelector('input:checked')?.focus({ preventScroll: true });
      this.reveal(card);
    }

    closePicker(card) {
      if (this.sheet && this.sheet.card === card) { this.closeSheet(false); return; }
      card._picker.hidden = true;
      card.classList.remove('is-picking');
      const add = card.querySelector('[data-rw-add]');
      if (add.hasAttribute('aria-expanded')) add.setAttribute('aria-expanded', 'false');
    }

    openSheet(card) {
      this.closeSheet(false);
      const pk = card._picker;
      const host = document.createElement('div');
      host.className = 'rw-sheet-host';
      const cs = getComputedStyle(this);
      SHEET_VARS.forEach(v => host.style.setProperty(v, cs.getPropertyValue(v)));
      host.style.fontFamily = cs.fontFamily;
      host.style.color = cs.color;
      const scrim = document.createElement('button');
      scrim.type = 'button';
      scrim.className = 'rw__pick-scrim';
      scrim.dataset.rwPickClose = '';
      scrim.tabIndex = -1;
      scrim.setAttribute('aria-hidden', 'true');
      pk.hidden = false;
      host.append(scrim, pk);
      document.body.append(host);
      host.addEventListener('click', this.onClick);
      host.addEventListener('change', this.onChange);
      this.classList.add('rw--picking');
      card.classList.add('is-picking');
      card.querySelector('[data-rw-add]').setAttribute('aria-expanded', 'true');
      requestAnimationFrame(() => host.classList.add('is-open'));
      pk.querySelector('input:checked')?.focus({ preventScroll: true });
      this.sheet = { host, card, pk };
    }

    closeSheet(returnFocus) {
      if (!this.sheet) return;
      const { host, card, pk } = this.sheet;
      this.sheet = null;
      pk.hidden = true;
      card.append(pk);
      host.remove();
      this.classList.remove('rw--picking');
      card.classList.remove('is-picking');
      const add = card.querySelector('[data-rw-add]');
      if (add.hasAttribute('aria-expanded')) add.setAttribute('aria-expanded', 'false');
      if (returnFocus) add.focus({ preventScroll: true });
    }

    onConfirm(btn) {
      const pk = btn.closest('[data-rw-picker]');
      const card = pk._card;
      const id = Number(card.dataset.selected);
      if (!id) return;
      card.dataset.touched = '1';
      this.engage();
      this.addCards([card], [{ id, quantity: 1 }]);
    }

    setMsg(panel, text) {
      panel.querySelector('[data-rw-msg]').textContent = text;
    }

    markAdded(card) {
      card.classList.add('is-added');
      this.closePicker(card);
      const add = card.querySelector('[data-rw-add]');
      add.setAttribute('aria-label', add.dataset.addedLabel);
      add.removeAttribute('aria-expanded');
      if (this.mobile && !this.reduced && navigator.vibrate) navigator.vibrate(12);
    }

    async addCards(cards, items, cta) {
      const panel = cards[0].closest('[data-rw-panel]') || cards[0]._picker.closest('[data-rw-panel]');
      cards.forEach(c => c.classList.add('is-loading'));
      cta?.classList.add('is-loading');
      try {
        if (!this.reduced) await wait(260);
        await Site.bag.add(items);
        cards.forEach(c => this.markAdded(c));
      } catch (err) {
        this.setMsg(panel, this.cfg.msgError);
      } finally {
        cards.forEach(c => c.classList.remove('is-loading'));
        cta?.classList.remove('is-loading');
      }
      const all = [...panel.querySelectorAll('[data-rw-card]')];
      if (all.length >= 2 && all.every(c => c.classList.contains('is-added'))) {
        panel.classList.add('is-complete');
        this.setMsg(panel, '');
      }
    }

    async onAll(btn) {
      const panel = btn.closest('[data-rw-panel]');
      if (panel.classList.contains('is-complete') || btn.classList.contains('is-loading')) return;
      this.setMsg(panel, '');
      const cards = [...panel.querySelectorAll('[data-rw-card]')].filter(c => !c.classList.contains('is-added'));
      const ready = cards.filter(c => c.dataset.touched && c.dataset.selected);
      const pending = cards.filter(c => !ready.includes(c));
      if (ready.length) await this.addCards(ready, ready.map(c => ({ id: Number(c.dataset.selected), quantity: 1 })), btn);
      if (!pending.length) return;
      if (this.mobile) this.openPicker(pending[0]);
      else pending.forEach(c => { if (!c.classList.contains('is-picking')) this.openPicker(c); });
      this.reveal(pending[0]);
      this.setMsg(panel, this.cfg.msgChoose.replace('[items]', pending.map(c => c.dataset.title).join(', ')));
    }

    /* Опускаем модель так, чтобы подошвы стояли на линии пола */
    detectFeet() {
      this.heroes.forEach((hero, i) => {
        Site.feet(hero.dataset.probe).then(value => {
          const foot = value.toFixed(4);
          hero.style.setProperty('--rw-foot', foot);
          this.bodies.filter(s => s.look === i).forEach(s => s.el.style.setProperty('--rw-foot', foot));
        });
      });
    }
  }

  customElements.define('runway-section', RunwaySection);
})();
