(() => {
  const { $, $$ } = CD;
  const root = $('[data-cart]');
  const ARROW = CD.icon.arrow, X = CD.icon.x;
  let done = null;

  /* Проверка полей формы */
  const RULES = {
    name: (v) => (v.trim().length < 2 ? 'Напишите, как к вам обращаться' : ''),
    phone: (v) => (v.replace(/\D/g, '').length < 10 ? 'Нужен номер из 10 или 11 цифр' : ''),
    email: (v) => (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Похоже, в адресе опечатка' : ''),
    city: (v) => (v.trim().length < 2 ? 'Укажите город доставки' : ''),
  };

  function render() {
    if (done) {
      root.innerHTML = `<div class="ok"><svg class="ok__ck" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30"/><path d="M19 33l9 9 17-19"/></svg>
        <div><h2 class="h2">Заказ ${done.no} принят</h2><p class="txt">Перезвоним в течение часа в рабочее время и пришлём счёт на ${CD.esc(done.email || 'почту, которую назовёте')}. Поверка добавит к сроку три рабочих дня</p>
        <a class="btn" href="catalog.html"><span>Вернуться в каталог</span>${ARROW}</a></div></div>`;
      return;
    }
    const items = CD.cart.items();
    if (!items.length) {
      root.innerHTML = `<div class="zero zero--big"><p class="zero__ol" aria-hidden="true">0,000</p><div><h2 class="h3">Корзина пуста</h2><p>Прибор можно добавить из каталога или собрать целый стол под задачу</p>
        <div class="zero__b"><a class="btn" href="catalog.html"><span>В каталог</span>${ARROW}</a><a class="btn btn--line" href="podbor.html"><span>Подбор стола</span></a></div></div></div>`;
      return;
    }
    const total = CD.cart.total();
    const verifyN = items.filter((i) => i.verify).length;
    root.innerHTML = `<div class="cart__g">
      <ul class="cart__l" aria-label="Приборы в корзине">${items.map((i) => {
        const p = CD.byId(i.id), c = CD.catOf(p.cat);
        const can = p.reg && c.verify;
        return `<li class="ci" data-id="${p.id}">
          <a class="ci__fig" href="product.html?id=${p.id}" tabindex="-1" aria-hidden="true">${CD.figure(p)}</a>
          <div class="ci__t"><p class="tile__meta">${c.one} · ${p.brand}</p><a class="ci__n" href="product.html?id=${p.id}">${p.name}</a>
            ${can ? `<label class="chk"><input type="checkbox" data-v${i.verify ? ' checked' : ''}><i></i><span>Поверка, +${CD.price(c.verify)} за штуку</span></label>` : `<span class="ci__nv">${p.reg ? 'Поверка не нужна' : 'Не в Госреестре, поверка недоступна'}</span>`}</div>
          <div class="qty" role="group" aria-label="Количество ${p.name}"><button type="button" data-q="-1" aria-label="Меньше"${i.qty < 2 ? ' disabled' : ''}>−</button><output>${i.qty}</output><button type="button" data-q="1" aria-label="Больше">+</button></div>
          <b class="ci__p">${CD.price(CD.cart.lineTotal(i))}</b>
          <button type="button" class="ci__x" data-rm aria-label="Убрать ${p.name}">${X}</button>
        </li>`;
      }).join('')}</ul>

      <aside class="sum" aria-label="Итог">
        <dl>
          <div><dt>Приборы, ${CD.cart.count()} шт</dt><dd>${CD.price(items.reduce((s, i) => s + CD.byId(i.id).price * i.qty, 0))}</dd></div>
          <div><dt>Поверка${verifyN ? `, ${verifyN}` : ''}</dt><dd>${CD.price(items.reduce((s, i) => s + (i.verify ? CD.catOf(CD.byId(i.id).cat).verify * i.qty : 0), 0))}</dd></div>
          <div><dt>Доставка</dt><dd>${total >= 30000 ? 'Бесплатно' : 'По тарифу СДЭК'}</dd></div>
          <div class="sum__t"><dt>Итого</dt><dd>${CD.price(total)}</dd></div>
        </dl>
        <p class="sum__m">Масса посылки ${CD.cart.mass().toLocaleString('ru-RU', { maximumFractionDigits: 1 })} кг</p>
      </aside>

      <form class="ord" novalidate data-ord>
        <h2 class="h3">Оформление</h2>
        <div class="ord__type" role="radiogroup" aria-label="Покупатель">
          <label class="chk"><input type="radio" name="who" value="p" checked><i></i><span>Частное лицо</span></label>
          <label class="chk"><input type="radio" name="who" value="c"><i></i><span>Компания, нужен счёт</span></label>
        </div>
        <div class="ord__g">
          <label class="fld"><span>Имя</span><input name="name" autocomplete="name" aria-describedby="e-name"><em id="e-name"></em></label>
          <label class="fld"><span>Телефон</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7" aria-describedby="e-phone"><em id="e-phone"></em></label>
          <label class="fld"><span>Почта <small>для счёта, по желанию</small></span><input name="email" type="email" autocomplete="email" aria-describedby="e-email"><em id="e-email"></em></label>
          <label class="fld"><span>Город</span><input name="city" autocomplete="address-level2" aria-describedby="e-city"><em id="e-city"></em></label>
          <label class="fld ord__inn" hidden><span>ИНН компании</span><input name="inn" inputmode="numeric" autocomplete="off"><em></em></label>
          <label class="fld ord__w"><span>Комментарий</span><textarea name="note" placeholder="Например, нужен протокол калибровки"></textarea><em></em></label>
        </div>
        <button class="btn" type="submit"><span>Отправить заказ на ${CD.price(total)}</span>${ARROW}</button>
        <p class="ord__note">Оплата после звонка менеджера. Счёт для организации пришлём на почту</p>
      </form>
    </div>`;
  }

  root.addEventListener('click', (e) => {
    const li = e.target.closest('[data-id]');
    if (!li) return;
    const id = li.dataset.id;
    const it = CD.cart.items().find((i) => i.id === id);
    const q = e.target.closest('[data-q]');
    if (q) CD.cart.set(id, { qty: Math.max(1, it.qty + +q.dataset.q) });
    if (e.target.closest('[data-rm]')) {
      CD.cart.remove(id);
      CD.toast(`${CD.byId(id).name} убран из корзины`, { label: 'Вернуть', fn: () => CD.cart.add(id, it.verify, it.qty) });
    }
  });
  root.addEventListener('change', (e) => {
    if (e.target.matches('[data-v]')) CD.cart.set(e.target.closest('[data-id]').dataset.id, { verify: e.target.checked });
    if (e.target.name === 'who') $('.ord__inn', root).hidden = e.target.value !== 'c';
  });

  const check = (inp) => {
    const rule = RULES[inp.name];
    if (!rule) return true;
    const msg = rule(inp.value);
    const f = inp.closest('.fld');
    f.classList.toggle('is-bad', !!msg);
    $('em', f).textContent = msg;
    inp.setAttribute('aria-invalid', !!msg);
    return !msg;
  };
  root.addEventListener('focusout', (e) => { if (e.target.matches('[data-ord] input')) check(e.target); });
  root.addEventListener('input', (e) => { if (e.target.closest('.fld.is-bad')) check(e.target); });
  root.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    const bad = [...f.querySelectorAll('input[name]')].filter((i) => !check(i));
    if (bad.length) { bad[0].focus(); return; }
    done = { no: 'ЦД-' + String(Date.now()).slice(-5), email: f.email.value.trim() };
    CD.cart.clear();
    render();
    scrollTo({ top: 0, behavior: CD.reduced ? 'auto' : 'smooth' });
  });

  /* Перерисовка при изменении корзины не сбивает начатую форму */
  document.addEventListener('cd:cart', () => {
    if (done) return;
    const f = $('[data-ord]', root);
    const saved = f ? Object.fromEntries(new FormData(f)) : null;
    const focus = document.activeElement && document.activeElement.closest('[data-id]') ? [document.activeElement.closest('[data-id]').dataset.id, document.activeElement.dataset.q] : null;
    render();
    const nf = $('[data-ord]', root);
    if (saved && nf) {
      for (const [k, v] of Object.entries(saved)) { const el = nf.elements[k]; if (!el) continue; if (el instanceof RadioNodeList) el.value = v; else el.value = v; }
      $('.ord__inn', root).hidden = saved.who !== 'c';
    }
    if (focus) { const b = $(`[data-id="${focus[0]}"] [data-q="${focus[1]}"]`, root); b && !b.disabled && b.focus(); }
  });
  render();
})();
