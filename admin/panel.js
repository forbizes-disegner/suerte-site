/* Suerte analytics panel (Russian): reads /api/stats from the Cloudflare Worker and draws the numbers */
(function () {
  'use strict';
  /* where the stats server answers: the same site (/api/stats) on the own domain, or the Cloudflare Worker address
     while the site is hosted on GitHub Pages */
  var STATS_URL = document.querySelector('meta[name="stats-url"]') ? document.querySelector('meta[name="stats-url"]').content : '/api/stats';
  var $ = function (id) { return document.getElementById(id); };
  var nf = new Intl.NumberFormat('ru-RU');
  var pf = new Intl.NumberFormat('ru-RU', { style: 'percent', maximumFractionDigits: 1 });
  var LABELS = {
    whatsapp: 'WhatsApp', airbnb: 'Airbnb', booking: 'Booking.com', phone: 'Телефон', instagram: 'Instagram', google: 'Google', friends: 'Друзья',
    platform: 'Airbnb / Booking', other: 'Другое', unknown: 'Без ответа', en: 'Английский', tr: 'Турецкий', ru: 'Русский', el: 'Греческий',
    booked: 'Да, забронировал', waiting: 'Жду ответа', not_yet: 'Пока нет', '(internal)': 'Переходы по сайту', 'booking-bar': 'Форма с датами', header: 'Значок в шапке', mbar: 'Нижняя панель телефона',
    'wa-float': 'Зелёная кнопка WhatsApp', footer: 'Подвал', 'footer-phone': 'Телефон в подвале', menu: 'Меню', cta: 'Баннер с закатом',
    'cyprus-cta': 'Баннер «Как добраться»', 'experiences-cta': 'Баннер «Чем заняться»', 'villa-booking': 'Форма на вилле', reviews: 'Отзывы',
    faq: 'Вопросы и ответы', return: 'Вопрос при возвращении', stay: 'Страница «Я забронировал»',
    mobile: 'Телефон', desktop: 'Компьютер', laptop: 'Ноутбук', tablet: 'Планшет', '(direct)': 'Прямые заходы', '(none)': 'Прямые заходы'
  };
  var token = '';
  try { token = sessionStorage.getItem('suerte-panel-token') || ''; } catch (e) { /* ignore */ }
  var range = '30d';

  function label(k) {
    if (/^\d{4}-\d{2}$/.test(k)) { var d = new Date(k + '-01T12:00:00'); return d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }); }
    if (/^[A-Z]{2}$/.test(k) && window.Intl && Intl.DisplayNames) { try { return new Intl.DisplayNames(['ru'], { type: 'region' }).of(k); } catch (e) { /* fall through */ } }
    return LABELS[k] || k;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- example data (until Umami is connected) ---------- */
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function demo(r) {
    var days = { '7d': 7, '30d': 30, '90d': 90, '12m': 365 }[r], R = rng(days * 97 + 13), daily = [], visits = 0, pv = 0;
    var end = new Date(); end.setHours(12, 0, 0, 0);
    if (r === '12m') {
      for (var m = 11; m >= 0; m--) { var dm = new Date(end.getFullYear(), end.getMonth() - m, 1); var v = Math.round(900 + 700 * Math.sin((dm.getMonth() - 2) / 12 * Math.PI * 2 - 1) + R() * 300); daily.push({ d: dm.toISOString().slice(0, 7) + '-01', visits: v, pageviews: Math.round(v * 2.6) }); visits += v; pv += Math.round(v * 2.6); }
    } else {
      for (var i = days - 1; i >= 0; i--) { var d = new Date(end.getTime() - i * 86400000); var wk = d.getDay() === 5 || d.getDay() === 6 ? 1.35 : 1; var v2 = Math.round((32 + R() * 26) * wk); daily.push({ d: d.toISOString().slice(0, 10), visits: v2, pageviews: Math.round(v2 * (2.2 + R())) }); visits += v2; pv += daily[daily.length - 1].pageviews; }
    }
    var start = Math.round(visits * 0.12), click = Math.round(visits * 0.05), conf = Math.max(1, Math.round(visits * 0.011));
    function split(total, parts) { var out = [], left = total; parts.forEach(function (p, i) { var v = i === parts.length - 1 ? left : Math.round(total * p[1]); left -= v; out.push({ k: p[0], v: Math.max(0, v) }); }); return out.sort(function (a, b) { return b.v - a.v; }); }
    var months = []; for (var j = 0; j < 4; j++) { var mm = new Date(end.getFullYear(), end.getMonth() + j, 1); months.push([mm.getFullYear() + '-' + ('0' + (mm.getMonth() + 1)).slice(-2), [0.35, 0.3, 0.2, 0.15][j]]); }
    return {
      demo: true, range: r, updated: new Date().toISOString(),
      totals: { visits: visits, visitors: Math.round(visits * 0.82), pageviews: pv, prev: { visits: Math.round(visits * 0.88), visitors: Math.round(visits * 0.75) } },
      funnel: { visits: visits, booking_start: start, booking_click: click, booking_confirmed: conf },
      daily: daily,
      confirmed: { byChannel: split(conf, [['whatsapp', .55], ['airbnb', .25], ['booking', .15], ['phone', .05]]), byFound: split(conf, [['instagram', .42], ['google', .25], ['friends', .18], ['platform', .1], ['unknown', .05]]),
        byLang: split(conf, [['en', .45], ['ru', .3], ['tr', .25]]), byMonth: split(conf, months).sort(function (a, b) { return a.k.localeCompare(b.k); }), byVia: split(conf, [['return', .6], ['stay', .4]]) },
      clicks: { byChannel: split(click, [['whatsapp', .6], ['airbnb', .22], ['booking', .12], ['phone', .06]]), byPlace: split(click, [['booking-bar', .4], ['wa-float', .25], ['header', .12], ['mbar', .1], ['villa-booking', .08], ['cta', .05]]) },
      returnAnswers: split(Math.round(click * 0.4), [['booked', .3], ['waiting', .45], ['not_yet', .25]]),
      sources: split(visits, [['instagram.com', .38], ['google.com', .27], ['(direct)', .22], ['airbnb.com', .08], ['facebook.com', .05]]),
      countries: split(visits, [['Кипр', .52], ['Турция', .16], ['Великобритания', .12], ['Германия', .08], ['Россия', .07], ['Другие', .05]]),
      devices: split(visits, [['mobile', .71], ['desktop', .24], ['tablet', .05]]),
      pages: split(pv, [['/', .32], ['/villa.html', .16], ['/cyprus.html', .12], ['/gallery.html', .11], ['/ru/', .1], ['/experiences.html', .08], ['/tr/', .06], ['/contact.html', .05]])
    };
  }

  /* ---------- rendering ---------- */
  function bars(id, rows, max) {
    var el = $(id); rows = (rows || []).filter(function (r) { return r.v > 0; }).slice(0, 8);
    if (!rows.length) { el.innerHTML = '<li class="empty">Пока нет данных</li>'; return; }
    var top = max || Math.max.apply(null, rows.map(function (r) { return r.v; }));
    el.innerHTML = rows.map(function (r) {
      return '<li><span class="k" title="' + esc(label(r.k)) + '">' + esc(label(r.k)) + '</span><span class="track"><span class="fill" style="width:' + (r.v / top * 100).toFixed(1) + '%"></span></span><span class="v">' + nf.format(r.v) + '</span></li>';
    }).join('');
  }
  function delta(id, now, prev) {
    var el = $(id);
    if (!prev) { el.textContent = ''; return; }
    var d = (now - prev) / prev;
    el.textContent = (d >= 0 ? '▲ ' : '▼ ') + pf.format(Math.abs(d)) + ' к прошлому периоду';
    el.className = 'delta ' + (d >= 0 ? 'up' : 'down');
  }
  function funnel(f) {
    var steps = [
      ['Посещения', 'открыли сайт', f.visits],
      ['Выбрали даты', 'в форме с датами', f.booking_start],
      ['Перешли к брони', 'WhatsApp, Airbnb, Booking.com, телефон', f.booking_click],
      ['Подтвердили поездку', 'на сайте', f.booking_confirmed]
    ];
    var top = Math.max(1, f.visits);
    $('funnel').innerHTML = steps.map(function (s, i) {
      var w = s[2] / top * 100, prev = i ? steps[i - 1][2] : 0;
      var share = i && prev ? '<small>' + pf.format(s[2] / prev) + '</small>' : '';
      var inside = w > 22;
      return '<div class="fstep' + (i === 3 ? ' goal' : '') + '"><span class="name">' + s[0] + '<small>' + s[1] + '</small></span>' +
        '<div class="fbar"><div class="fill" style="width:' + w.toFixed(2) + '%"></div><span class="val" style="' + (inside ? 'left:12px;color:' + (i === 3 ? '#131510' : 'inherit') : 'left:calc(' + w.toFixed(2) + '% + 10px)') + '">' + nf.format(s[2]) + share + '</span></div></div>';
    }).join('');
  }
  function niceMax(v) { var p = Math.pow(10, Math.floor(Math.log10(Math.max(1, v)))); var n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }
  function line(rows, monthly) {
    var svg = $('daily'), W = 1000, H = 240, L = 44, R = 12, T = 12, B = 28;
    if (!rows.length) { svg.innerHTML = '<text x="500" y="120" text-anchor="middle">Пока нет данных</text>'; return; }
    var maxV = niceMax(Math.max.apply(null, rows.map(function (r) { return Math.max(r.visits, r.pageviews); })));
    var x = function (i) { return L + (rows.length === 1 ? (W - L - R) / 2 : i * (W - L - R) / (rows.length - 1)); };
    var y = function (v) { return T + (H - T - B) * (1 - v / maxV); };
    var out = '';
    [0, 0.5, 1].forEach(function (f) { var v = maxV * f; out += '<line class="grid-line" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text x="' + (L - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + nf.format(v) + '</text>'; });
    var pts = rows.map(function (r, i) { return x(i).toFixed(1) + ',' + y(r.visits).toFixed(1); });
    var pts2 = rows.map(function (r, i) { return x(i).toFixed(1) + ',' + y(r.pageviews).toFixed(1); });
    out += '<polygon class="area" points="' + x(0) + ',' + y(0) + ' ' + pts.join(' ') + ' ' + x(rows.length - 1) + ',' + y(0) + '"/>';
    out += '<polyline class="line2" points="' + pts2.join(' ') + '"/><polyline class="line" points="' + pts.join(' ') + '"/>';
    var last = rows.length - 1;
    out += '<circle class="dot" r="4.5" cx="' + x(last) + '" cy="' + y(rows[last].visits) + '"/>';
    var fmt = function (d) { var dt = new Date(d + 'T12:00:00'); return monthly ? dt.toLocaleDateString('ru-RU', { month: 'short' }) : dt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }); };
    var ticks = rows.length > 2 ? [0, Math.floor(last / 2), last] : [0, last];
    ticks.forEach(function (i, n) { out += '<text x="' + x(i) + '" y="' + (H - 6) + '" text-anchor="' + (n === 0 ? 'start' : n === ticks.length - 1 ? 'end' : 'middle') + '">' + fmt(rows[i].d) + '</text>'; });
    svg.innerHTML = out;
  }
  function render(d) {
    var t = d.totals || {}, f = d.funnel || {};
    $('k-visits').textContent = nf.format(t.visits || 0); delta('d-visits', t.visits, t.prev && t.prev.visits);
    $('k-visitors').textContent = nf.format(t.visitors || 0); delta('d-visitors', t.visitors, t.prev && t.prev.visitors);
    $('k-clicks').textContent = nf.format(f.booking_click || 0);
    $('k-confirmed').textContent = nf.format(f.booking_confirmed || 0);
    $('k-conv').textContent = f.visits ? pf.format(f.booking_confirmed / f.visits) + ' посещений закончились подтверждённой бронью' : '—';
    funnel(f);
    line(d.daily || [], d.range === '12m');
    var c = d.confirmed || {};
    bars('c-channel', c.byChannel); bars('c-found', c.byFound); bars('c-month', c.byMonth); bars('c-lang', c.byLang);
    bars('c-answer', d.returnAnswers); bars('c-place', (d.clicks || {}).byPlace);
    bars('c-sources', d.sources); bars('c-countries', d.countries); bars('c-devices', d.devices); bars('c-pages', d.pages);
    var when = new Date(d.updated || Date.now()).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    $('status').textContent = d.demo ? 'Пример данных' : 'Наш счётчик · обновлено в ' + when;
    $('status').className = 'status' + (d.demo ? ' demo' : '');
    $('demo-banner').hidden = !d.demo;
  }

  /* ---------- data ---------- */
  function load() {
    $('status').textContent = 'Загрузка…';
    var headers = token ? { authorization: 'Bearer ' + token } : {};
    fetch(STATS_URL + '?range=' + encodeURIComponent(range), { headers: headers })
      .then(function (r) {
        if (r.status === 401) { $('auth').hidden = false; throw new Error('auth'); }
        if (!r.ok) throw new Error('status ' + r.status);
        return r.json();
      })
      .then(function (d) { $('auth').hidden = true; render(d); })
      .catch(function () { render(demo(range)); });
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-range]'), function (b) {
    b.addEventListener('click', function () {
      range = b.getAttribute('data-range');
      Array.prototype.forEach.call(document.querySelectorAll('[data-range]'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      load();
    });
  });
  $('auth').addEventListener('submit', function (e) {
    e.preventDefault(); token = $('token').value.trim();
    try { sessionStorage.setItem('suerte-panel-token', token); } catch (err) { /* ignore */ }
    load();
  });
  load();
})();
