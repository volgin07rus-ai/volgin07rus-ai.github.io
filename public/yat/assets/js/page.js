/* Внутренние страницы: подвал, стена обложек, шкала состояний, формы, словарь */
(() => {
  'use strict';
  const S = window.Site, D = window.YAT;
  const { $, $$, esc } = S;

  const foot = $('[data-sitefoot]');
  if (foot) {
    foot.className = 'sitefoot';
    foot.innerHTML = `
      <div class="sitefoot__g">
        <p class="sitefoot__lead">Книги на ять с девяносто четвёртого года</p>
        <div><h3 class="lbl">Лавка</h3><ul><li><a class="ulink" href="./">Полка</a></li><li><a class="ulink" href="about.html">О лавке</a></li><li><a class="ulink" href="slovar.html">Словарь</a></li></ul></div>
        <div><h3 class="lbl">Покупателям</h3><ul><li><a class="ulink" href="info.html#delivery">Доставка</a></li><li><a class="ulink" href="info.html#state">Шкала состояний</a></li><li><a class="ulink" href="info.html#faq">Вопросы</a></li><li><a class="ulink" href="sell.html">Продать книги</a></li></ul></div>
        <div><h3 class="lbl">Адрес</h3><ul><li>Литейный проспект, Петербург</li><li>Каждый день с 11 до 20</li><li><a class="ulink" href="tel:+78125550143">+7 812 555-01-43</a></li></ul></div>
      </div>
      <div class="sitefoot__legal lbl"><span>© Ять, книжная лавка</span><a class="ulink" href="https://volgin.site" target="_blank" rel="noopener">Разработка volgin.site</a></div>`;
  }

  /* Стена обложек */
  $$('[data-wall]').forEach(w => {
    const ids = w.dataset.wall.split(' ');
    w.innerHTML = ids.map((id, i) => `<img src="${S.thumb(D.byId[id])}" alt="${esc(D.byId[id].t)}" loading="lazy" style="--i:${i}">`).join('');
  });

  /* Шкала состояний с живыми примерами */
  const sc = $('[data-scale]');
  if (sc) {
    const ex = { 5: 'chukokkala', 4: 'evgeniy-onegin', 3: 'voyna-i-mir', 2: 'oblako-v-shtanah' };
    const text = {
      5: 'Книга выглядит так, будто её только что принесли из типографии. Встречается редко и стоит дороже.',
      4: 'Лёгкая потёртость, немного времени на обрезе. Блок крепкий, ничего не утрачено.',
      3: 'Книгу читали и берегли. Углы потёрты, могут быть владельческие надписи и подклейки.',
      2: 'Есть утраты, реставрация или пятна. Все дефекты описаны в карточке, цена учитывает каждый.'
    };
    sc.innerHTML = [5, 4, 3, 2].map(c => {
      const b = D.byId[ex[c]];
      return `<button type="button" data-open="${b.id}"><img src="${S.thumb(b)}" alt="" loading="lazy"><h3>${D.conditions[c].name}</h3><p>${text[c]}</p></button>`;
    }).join('');
  }

  /* Форма с проверкой при отправке */
  $$('form[data-form]').forEach(f => {
    f.noValidate = true;
    const check = el => {
      const w = el.closest('.field'); if (!w) return true;
      let ok = true;
      if (el.required && !el.value.trim()) ok = false;
      if (ok && el.type === 'tel' && el.value.replace(/\D/g, '').length < 10) ok = false;
      w.classList.toggle('is-bad', !ok);
      return ok;
    };
    f.addEventListener('focusout', e => { if (e.target.matches('.input') && e.target.closest('.field').classList.contains('is-bad')) check(e.target); });
    f.addEventListener('submit', e => {
      e.preventDefault();
      const bad = [...f.querySelectorAll('.input')].filter(x => !check(x));
      if (bad.length) { bad[0].focus(); return; }
      f.innerHTML = `<p class="form__done wide">Спасибо. Ответим в течение дня</p>`;
    });
  });

  /* Словарь */
  const dict = $('[data-dict]');
  if (dict) {
    const T = window.YAT_TERMS;
    const letters = [...new Set(T.map(t => t[0][0].toUpperCase()))].sort((a, b) => a.localeCompare(b, 'ru'));
    $('[data-letters]').innerHTML = letters.map(l => `<a class="lbl" href="#l-${l}">${l}</a>`).join('');
    const paint = q => {
      const nq = D.norm(q).trim();
      const hits = T.filter(t => !nq || D.norm(t[0] + ' ' + t[1]).includes(nq));
      const groups = letters.map(l => [l, hits.filter(t => t[0][0].toUpperCase() === l).sort((a, b) => a[0].localeCompare(b[0], 'ru'))]).filter(g => g[1].length);
      dict.innerHTML = groups.map(([l, items]) => `<div class="dict__g" id="l-${l}"><div class="dict__l">${l}</div><dl>${items.map(t => `<div class="term"><dt>${esc(t[0])}</dt><dd>${esc(t[1])}</dd></div>`).join('')}</dl></div>`).join('') || `<p class="dict__none">Такого слова в словаре пока нет</p>`;
    };
    paint('');
    $('[data-dict-q]').addEventListener('input', e => paint(e.target.value));
  }
})();
