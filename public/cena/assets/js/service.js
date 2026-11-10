(() => {
  const { $ } = CD;
  const cats = CD.cats.filter((c) => c.verify);
  const DAYS = { scope: 3, multimeter: 2, psu: 2, gen: 3, spectrum: 5, thermal: 4, lcr: 3 };
  const n = (c) => CD.products.filter((p) => p.cat === c.id && p.reg).length;

  $('[data-sv-tbl]').innerHTML = cats.map((c) => `<tr>
    <th scope="row"><span class="ptbl__sg">${CD.sigSvg(c.id, 64, 20, 2)}</span>${c.name}</th>
    <td class="n">${CD.price(c.verify)}</td>
    <td class="n">${CD.price(Math.round((c.verify * 0.8) / 100) * 100)}</td>
    <td class="n">${DAYS[c.id]} ${CD.plural(DAYS[c.id], 'день', 'дня', 'дней')}</td>
    <td><a class="line" href="catalog.html?cat=${c.id}&reg=1"><span>${n(c)} в каталоге</span>${CD.icon.arrow}</a></td>
  </tr>`).join('');

  const sel = $('[data-sv-type]');
  sel.innerHTML = cats.map((c) => `<option value="${c.id}">${c.one}</option>`).join('') + '<option value="other">Другой прибор</option>';

  const form = $('[data-sv-form]');
  const RULES = {
    name: (v) => (v.trim().length < 2 ? 'Напишите, как к вам обращаться' : ''),
    contact: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || v.replace(/\D/g, '').length >= 10 ? '' : 'Нужен телефон или почта, чтобы ответить'),
    qty: (v) => (+v >= 1 && +v <= 500 ? '' : 'От 1 до 500 приборов'),
  };
  const check = (inp) => {
    const r = RULES[inp.name];
    if (!r) return true;
    const msg = r(inp.value);
    const f = inp.closest('.fld');
    f.classList.toggle('is-bad', !!msg);
    f.querySelector('em').textContent = msg;
    inp.setAttribute('aria-invalid', !!msg);
    return !msg;
  };
  form.addEventListener('focusout', (e) => { if (e.target.name) check(e.target); });
  form.addEventListener('input', (e) => { if (e.target.closest('.fld.is-bad')) check(e.target); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = [...form.querySelectorAll('input[name]')].filter((i) => !check(i));
    if (bad.length) { bad[0].focus(); return; }
    const no = 'П-' + String(Date.now()).slice(-4);
    form.innerHTML = `<div class="ok"><svg class="ok__ck" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30"/><path d="M19 33l9 9 17-19"/></svg><div><h3 class="h3">Заявка ${no} принята</h3><p class="txt">Метролог свяжется в течение рабочего дня и назовёт дату приёма</p></div></div>`;
  });
})();
