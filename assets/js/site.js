(function () {
'use strict';
var C = (function () {
try { var el = document.getElementById('suerte-cfg'); if (el) return JSON.parse(el.textContent); } catch (e) {  }
return window.SUERTE || { lang: 'en', t: {}, wa: '905428604545', stay: 'stay.html' };
})();
var T = C.t || {};
var LANG = C.lang || 'en';
var LOCALE = T.locale || 'en-GB';
var doc = document.documentElement;
doc.classList.add('js');
function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function fill(tpl, o) { return String(tpl || '').replace(/\{(\w+)\}/g, function (_, k) { return o[k] != null ? o[k] : ''; }); }
var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function splitWords(el, cls) {
cls = cls || 'w';
if (el.getAttribute('data-split')) return $$('.' + cls, el);
el.setAttribute('data-split', cls);
var out = [];
(function walk(node) {
Array.prototype.slice.call(node.childNodes).forEach(function (n) {
if (n.nodeType === 3) {
var frag = document.createDocumentFragment();
n.textContent.split(/(\s+)/).forEach(function (p) {
if (!p) return;
if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
var w = document.createElement('span'); w.className = cls; w.style.setProperty('--w', String(out.length)); w.textContent = p;
frag.appendChild(w); out.push(w);
});
node.replaceChild(frag, n);
} else if (n.nodeType === 1) walk(n);
});
})(el);
return out;
}
(function startAtTop() {
var nav = window.performance && performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null;
if (location.hash || (nav && nav.type !== 'navigate')) return;
function top() {
try { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); } catch (e) { window.scrollTo(0, 0); }
var first = document.querySelector('main') || document.body;
if (first && first.scrollIntoView) {
try { first.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'instant' }); } catch (e) { first.scrollIntoView(true); }
}
}
top();
var moved = false;
['wheel', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, function () { moved = true; }, { once: true, passive: true }); });
window.addEventListener('load', function () { if (!moved) top(); }, { once: true });
})();
function track(name, data) {
data = data || {};
data.lang = LANG;
try {
if (window.umami && typeof window.umami.track === 'function') { window.umami.track(name, data); return; }
} catch (e) {  }
if (navigator.webdriver && window.console && console.debug) console.debug('[analytics]', name, data);
}
var KEY = 'suerte-stay', mem = null;
function readStay() {
try { var v = localStorage.getItem(KEY); return v ? JSON.parse(v) : mem; } catch (e) { return mem; }
}
function writeStay(v) {
mem = v;
try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {  }
}
function ym(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2); }
function hasUpcomingStay() { var s = readStay(); return !!(s && s.m && s.m >= ym(new Date())); }
function confirmStay(d) {
var s = readStay();
if (s && s.m === d.month) return false;
track('booking_confirmed', d);
writeStay({ m: d.month });
return true;
}
var header = $('.site-header');
function onScroll() { if (header) header.classList.toggle('is-solid', window.scrollY > 40); }
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
var menu = $('#menu');
$$('[data-menu-open]').forEach(function (b) {
b.addEventListener('click', function () {
if (!menu) return;
menu.hidden = false; document.body.style.overflow = 'hidden'; doc.classList.add('menu-open');
b.setAttribute('aria-expanded', 'true');
var first = $('a, button', menu); if (first) first.focus();
});
});
function closeMenu() {
if (!menu || menu.hidden) return;
menu.hidden = true; document.body.style.overflow = ''; doc.classList.remove('menu-open');
$$('[data-menu-open]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
}
$$('[data-menu-close]').forEach(function (b) { b.addEventListener('click', closeMenu); });
if (menu) $$('a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
function sunsetTatlisu(date) {
var lat = 35.4076, lon = 33.7608, zen = 90.833, rad = Math.PI / 180;
var y = date.getUTCFullYear(), m = date.getUTCMonth(), d = date.getUTCDate();
var N = Math.floor((Date.UTC(y, m, d) - Date.UTC(y, 0, 0)) / 86400000);
var lngHour = lon / 15, t = N + ((18 - lngHour) / 24);
var M = 0.9856 * t - 3.289;
var L = M + 1.916 * Math.sin(M * rad) + 0.020 * Math.sin(2 * M * rad) + 282.634;
L = ((L % 360) + 360) % 360;
var RA = Math.atan(0.91764 * Math.tan(L * rad)) / rad; RA = ((RA % 360) + 360) % 360;
RA = (RA + (Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90)) / 15;
var sinDec = 0.39782 * Math.sin(L * rad), cosDec = Math.cos(Math.asin(sinDec));
var cosH = (Math.cos(zen * rad) - sinDec * Math.sin(lat * rad)) / (cosDec * Math.cos(lat * rad));
var H = Math.acos(cosH) / rad / 15;
var Tm = H + RA - 0.06571 * t - 6.622;
var UT = (((Tm - lngHour) % 24) + 24) % 24;
return new Date(Date.UTC(y, m, d) + UT * 3600000);
}
function fmtTime(d) {
var o = { hour: '2-digit', minute: '2-digit', hour12: false };
try { return new Intl.DateTimeFormat('en-GB', Object.assign({ timeZone: 'Asia/Famagusta' }, o)).format(d); }
catch (e) { try { return new Intl.DateTimeFormat('en-GB', Object.assign({ timeZone: 'Europe/Nicosia' }, o)).format(d); } catch (e2) { return d.toTimeString().slice(0, 5); } }
}
try {
var now = new Date();
var sunset = fmtTime(sunsetTatlisu(now));
$$('[data-sunset]').forEach(function (el) { el.textContent = sunset; });
$$('[data-today]').forEach(function (el) { el.textContent = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long' }).format(now); });
} catch (e) {  }
$$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
var clocks = $$('[data-localtime]');
function tickClock() { var t = fmtTime(new Date()); clocks.forEach(function (el) { el.textContent = t; }); }
if (clocks.length) { tickClock(); setInterval(tickClock, 30000); }
function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function nice(s, loc) { try { return new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(s + 'T12:00:00')); } catch (e) { return s; } }
function plural(n, one, many, few, loc) {
var c = n === 1 ? 'one' : 'other';
try { c = new Intl.PluralRules(loc || LOCALE).select(n); } catch (e) {}
return n + ' ' + (c === 'one' ? one : (c === 'few' && few) ? few : many);
}
$$('[data-booking]').forEach(function (form) {
var a = $('[name=arrive]', form), l = $('[name=leave]', form), g = $('[name=guests]', form);
var go = $('[data-booking-go]', form), nightsEl = $('[data-nights]', form), started = false;
var today = new Date(); today.setHours(12, 0, 0, 0);
var start = new Date(today.getTime() + 21 * 86400000), end = new Date(start.getTime() + 2 * 86400000);
if (a && !a.value) a.value = iso(start);
if (l && !l.value) l.value = iso(end);
if (a) a.min = iso(today);
function update(user) {
if (l.value <= a.value) { var d = new Date(a.value + 'T12:00:00'); d.setDate(d.getDate() + 1); l.value = iso(d); }
l.min = a.value;
var nights = Math.max(1, Math.round((new Date(l.value + 'T12:00:00') - new Date(a.value + 'T12:00:00')) / 86400000));
var guests = parseInt(g.value, 10) || 2;
var n = plural(nights, T.night || 'night', T.nights || 'nights', T.nights_few);
if (nightsEl) nightsEl.textContent = n;
var msg = fill(T.wa_msg, { from: nice(a.value, LOCALE), to: nice(l.value, LOCALE), n: n, g: plural(guests, T.guest || 'guest', T.guests || 'guests', T.guests_few) });
if (T.wa_en) msg += '\n\n' + fill(T.wa_en, { from: nice(a.value, 'en-GB'), to: nice(l.value, 'en-GB'), n: plural(nights, 'night', 'nights', '', 'en'), g: plural(guests, 'guest', 'guests', '', 'en') });
if (go) go.href = 'https://wa.me/' + C.wa + '?text=' + encodeURIComponent(msg);
if (user && !started) { started = true; track('booking_start', { place: form.getAttribute('data-place') || 'page' }); }
}
[a, l, g].forEach(function (el) { el.addEventListener('change', function () { update(true); }); });
form.addEventListener('submit', function (e) { e.preventDefault(); if (go) go.click(); });
update(false);
});
var pending = null, asked = false;
document.addEventListener('click', function (e) {
var a = e.target.closest && e.target.closest('[data-book]');
if (!a) return;
var channel = a.getAttribute('data-book');
track('booking_click', { channel: channel, place: a.getAttribute('data-place') || 'page' });
pending = { channel: channel, t: Date.now() };
});
var sheet = $('#rsheet');
function step(name) { $$('[data-rs-step]', sheet).forEach(function (s) { s.hidden = s.getAttribute('data-rs-step') !== name; }); }
function openSheet() {
if (!sheet) return;
var f = $('form', sheet);
if (f && pending) { var r = $('input[value="' + pending.channel + '"]', f); if (r) r.checked = true; }
step('ask'); sheet.hidden = false;
requestAnimationFrame(function () { sheet.classList.add('open'); });
}
function closeSheet() { if (!sheet) return; sheet.classList.remove('open'); sheet.hidden = true; }
function maybeAsk() {
if (!pending || asked || !sheet || hasUpcomingStay()) return;
if (Date.now() - pending.t < 4000) return;
asked = true; openSheet();
}
document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') maybeAsk(); });
window.addEventListener('focus', maybeAsk);
window.addEventListener('pageshow', function (e) { if (e.persisted) maybeAsk(); });
if (sheet) {
$$('[data-rs-close]', sheet).forEach(function (b) { b.addEventListener('click', closeSheet); });
$$('[data-rs]', sheet).forEach(function (b) {
b.addEventListener('click', function () {
var ans = b.getAttribute('data-rs');
if (ans === 'booked') { step('form'); var first = $('select, input', sheet); if (first) first.focus(); return; }
track('booking_return', { answer: ans, channel: pending ? pending.channel : '' });
step('later'); setTimeout(closeSheet, 3200);
});
});
}
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenu(); closeSheet(); closeLightbox(); } });
function monthOptions(sel) {
var d = new Date(); d.setDate(1);
var fmt; try { fmt = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' }); } catch (e) { fmt = null; }
for (var i = 0; i < 13; i++) {
var o = document.createElement('option');
o.value = ym(d); o.textContent = fmt ? fmt.format(d) : o.value;
sel.appendChild(o); d.setMonth(d.getMonth() + 1);
}
}
$$('[data-months]').forEach(monthOptions);
function showGuide(msg) {
var g = $('[data-guide]');
if (!g) return;
g.removeAttribute('data-locked');
var note = $('[data-guide-note]'); if (note && msg) { note.textContent = msg; note.hidden = false; }
var lock = $('[data-guide-lock]'); if (lock) lock.hidden = true;
}
$$('[data-confirm]').forEach(function (form) {
form.addEventListener('submit', function (e) {
e.preventDefault();
var fd = new FormData(form), ch = '', found = '';
$$('input[type=radio]:checked', form).forEach(function (r) { if (/channel$/.test(r.name)) ch = r.value; if (/found$/.test(r.name)) found = r.value; });
var data = {
channel: ch || (pending && pending.channel) || 'whatsapp',
month: fd.get('month'), nights: Number(fd.get('nights')) || 1, guests: Number(fd.get('guests')) || 1,
found: found || 'unknown', via: form.getAttribute('data-via') || 'stay'
};
var counted = confirmStay(data);
if (form.closest('#rsheet')) { step('done'); return; }
showGuide(counted ? T.thanks : T.dup);
var g = $('#guide'); if (g) g.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
});
});
$$('[data-guide-open]').forEach(function (b) {
b.addEventListener('click', function () { showGuide(''); var g = $('#guide'); if (g) g.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); });
});
if ($('[data-guide]') && hasUpcomingStay()) showGuide(T.dup);
if ($('[data-guide]') && location.hash === '#guide' && hasUpcomingStay()) showGuide('');
var routeIcon = $('.site-header img[src*="logo-icon"], img[src*="logo-icon"]');
function buildRoute(out) {
var r = document.createElement('div'), d = 'M6 34 C 70 34, 92 8, 150 14 S 236 36, 294 12';
r.className = 'route'; r.setAttribute('aria-hidden', 'true');
r.innerHTML = '<span class="r-from"></span><svg viewBox="0 0 300 44" focusable="false"><path class="r-base" d="' + d + '"/>' +
'<path class="r-line" pathLength="1" d="' + d + '"/><circle class="r-start" cx="6" cy="34" r="3"/><circle class="r-ring" cx="294" cy="12" r="5"/>' +
'<circle class="r-end" cx="294" cy="12" r="5"/><circle class="r-dot" cx="6" cy="34" r="4.5"/></svg>' +
'<span class="r-to">' + (routeIcon ? '<img src="' + routeIcon.getAttribute('src') + '" alt="">' : '') + 'Suerte</span>';
var eb = $('.eyebrow', out);
out.insertBefore(r, eb ? eb.nextSibling : out.firstChild);
return r;
}
function minutesOf(s) {
var n = (String(s).match(/\d+/g) || []).map(Number);
if (!n.length) return 60;
if (n.length === 1 && /min|dk|мин/i.test(s)) return n[0];
return n[0] * 60 + (n[1] || 0);
}
function playRoute(r, mins) {
var base = $('.r-base', r), line = $('.r-line', r), dot = $('.r-dot', r);
if (!base || !base.getTotalLength) return;
var L = base.getTotalLength();
if (r._raf) cancelAnimationFrame(r._raf);
r.classList.remove('arrived');
if (reduceMotion) {
var end = base.getPointAtLength(L);
line.style.strokeDashoffset = '0'; dot.setAttribute('cx', end.x); dot.setAttribute('cy', end.y); r.classList.add('arrived'); return;
}
void r.offsetWidth;
var s0 = base.getPointAtLength(0);
line.style.strokeDashoffset = '1'; dot.setAttribute('cx', s0.x); dot.setAttribute('cy', s0.y);
var dur = Math.max(1100, Math.min(2800, 500 + mins * 12)), t0 = 0;
function f(t) {
if (!t0) t0 = t;
var p = Math.max(0, Math.min(1, (t - t0) / dur)), e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
line.style.strokeDashoffset = String(1 - e);
var pt = base.getPointAtLength(L * e); dot.setAttribute('cx', pt.x.toFixed(1)); dot.setAttribute('cy', pt.y.toFixed(1));
if (p < 1) r._raf = requestAnimationFrame(f); else { r._raf = 0; r.classList.add('arrived'); }
}
r._raf = requestAnimationFrame(f);
}
$$('[data-drive]').forEach(function (box) {
var out = $('[data-drive-out]', box), btns = $$('[data-city]', box);
var route = out ? buildRoute(out) : null, routeSeen = false, current = null;
function cityName(b) { var t = b.firstChild && b.firstChild.nodeType === 3 ? b.firstChild.textContent : b.textContent; return t.trim(); }
function pick(b) {
current = b;
if (route) { $('.r-from', route).textContent = cityName(b); if (routeSeen) playRoute(route, minutesOf(b.getAttribute('data-time'))); }
btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
var tEl = $('[data-drive-time]', out);
tEl.textContent = b.getAttribute('data-time');
tEl.classList.remove('swap'); void tEl.offsetWidth; tEl.classList.add('swap');
$('[data-drive-note]', out).textContent = b.getAttribute('data-note') || '';
tEl.textContent = tEl.textContent.replace('≈ ', '~');
var map = $('[data-drive-map]', out);
if (map) map.href = 'https://www.google.com/maps/dir/?api=1&origin=' + encodeURIComponent(b.getAttribute('data-origin')) + '&destination=35.4076,33.7609';
var est = $('[data-drive-est]', out); if (est) est.hidden = b.getAttribute('data-est') !== '1';
}
btns.forEach(function (b) { b.addEventListener('click', function () { pick(b); }); });
var first = $('[aria-pressed="true"]', box) || btns[0]; if (first) pick(first);
if (route) {
if (reduceMotion || !('IntersectionObserver' in window)) { routeSeen = true; if (current) playRoute(route, 0); }
else {
var rio = new IntersectionObserver(function (es) {
if (!es[0].isIntersecting) return;
routeSeen = true; rio.disconnect();
if (current) playRoute(route, minutesOf(current.getAttribute('data-time')));
}, { threshold: 0.5 });
rio.observe(out);
}
}
});
$$('[data-layer-toggle]').forEach(function (b) {
var fig = b.closest('[data-map]');
function set(on) { fig.classList.toggle('show-plot', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); }
b.addEventListener('click', function () { set(b.getAttribute('aria-pressed') !== 'true'); });
set(b.getAttribute('aria-pressed') === 'true');
});
$$('[data-carousel]').forEach(function (wrap) {
var track_ = $('.carousel', wrap);
$$('[data-dir]', wrap).forEach(function (b) {
b.addEventListener('click', function () {
var stepW = track_.firstElementChild ? track_.firstElementChild.getBoundingClientRect().width + 18 : 300;
track_.scrollBy({ left: stepW * Number(b.getAttribute('data-dir')), behavior: reduceMotion ? 'auto' : 'smooth' });
});
});
});
var saveData = navigator.connection && navigator.connection.saveData;
var vids = $$('video[data-loop]');
if (reduceMotion || saveData) {
vids.forEach(function (v) { v.removeAttribute('autoplay'); v.preload = 'none'; v.pause(); });
} else if ('IntersectionObserver' in window) {
var vio = new IntersectionObserver(function (es) {
es.forEach(function (en) {
var v = en.target;
if (en.isIntersecting) { if (v.preload === 'none') v.preload = 'auto'; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
else v.pause();
});
}, { rootMargin: '120px 0px' });
vids.forEach(function (v) { vio.observe(v); });
}
$$('[data-map]').forEach(function (map) {
var spots = $$('.spot', map), list = $$('[data-spot-link]', map);
function show(id) {
spots.forEach(function (s) {
var on = s.getAttribute('data-id') === id, btn = $('button', s), pop = $('.pop', s);
btn.setAttribute('aria-expanded', on ? 'true' : 'false'); pop.hidden = !on;
});
list.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-spot-link') === id ? 'true' : 'false'); });
}
spots.forEach(function (s) {
$('button', s).addEventListener('click', function () { show(this.getAttribute('aria-expanded') === 'true' ? '' : s.getAttribute('data-id')); });
});
list.forEach(function (b) { b.addEventListener('click', function () { show(b.getAttribute('data-spot-link')); }); });
var first = map.getAttribute('data-open'); if (first) show(first);
});
var lb = $('#lightbox'), lbImg = lb && $('img', lb), lbCap = lb && $('[data-lb-cap]', lb), lbCount = lb && $('[data-lb-count]', lb);
var items = [], cur = 0, lastFocus = null;
var zooms = lb ? $$('[data-zoom] .media').filter(function (m) { return m.querySelector('img'); }) : [];
zooms.forEach(function (m) {
var img = m.querySelector('img');
m.classList.add('zoomable');
m.setAttribute('role', 'button'); m.setAttribute('tabindex', '0');
m.setAttribute('aria-label', (T.lb_open || 'Open photo') + ': ' + img.alt);
m.setAttribute('data-cap', img.alt);
m.setAttribute('data-full', img.getAttribute('src').replace(/-(sm|md)(\.\w+)$/, '$2'));
m.addEventListener('click', function () { openLightbox(m); });
m.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(m); } });
});
function visibleItems(btn) {
if (zooms.indexOf(btn) > -1) return zooms;
return $$('.masonry button').filter(function (b) { return !b.hidden; });
}
function openLightbox(btn) {
if (!lb) return;
items = visibleItems(btn); cur = items.indexOf(btn); lastFocus = btn;
render(); lb.hidden = false; document.body.style.overflow = 'hidden'; doc.classList.add('lb-open'); $('[data-lb-close]', lb).focus();
}
var lbVid = lb && $('video', lb);
function render() {
var b = items[cur]; if (!b) return;
var img = b.querySelector('img'), cap = b.getAttribute('data-cap') || (img && img.alt) || '';
var vsrc = b.getAttribute('data-video');
if (vsrc && lbVid) {
lbImg.hidden = true; lbVid.hidden = false; lbVid.src = vsrc;
var p = lbVid.play(); if (p && p.catch) p.catch(function () {});
} else {
if (lbVid) { lbVid.pause(); lbVid.hidden = true; lbVid.removeAttribute('src'); }
lbImg.hidden = false; lbImg.src = b.getAttribute('data-full'); lbImg.alt = cap;
}
lbCap.textContent = cap; lbCount.textContent = (cur + 1) + ' / ' + items.length;
}
function stepLb(n) { cur = (cur + n + items.length) % items.length; render(); }
function closeLightbox() {
if (!lb || lb.hidden) return;
if (lbVid) { lbVid.pause(); lbVid.removeAttribute('src'); }
lb.hidden = true; document.body.style.overflow = ''; doc.classList.remove('lb-open'); if (lastFocus) lastFocus.focus();
}
$$('.masonry button').forEach(function (b) { b.addEventListener('click', function () { openLightbox(b); }); });
if (lb) {
$('[data-lb-close]', lb).addEventListener('click', closeLightbox);
$('[data-lb-prev]', lb).addEventListener('click', function () { stepLb(-1); });
$('[data-lb-next]', lb).addEventListener('click', function () { stepLb(1); });
lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-stage')) closeLightbox(); });
document.addEventListener('keydown', function (e) { if (lb.hidden) return; if (e.key === 'ArrowRight') stepLb(1); if (e.key === 'ArrowLeft') stepLb(-1); });
}
$$('[data-filter]').forEach(function (chip) {
chip.addEventListener('click', function () {
var f = chip.getAttribute('data-filter');
$$('[data-filter]').forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
$$('.masonry button').forEach(function (b) { b.hidden = !(f === 'all' || b.getAttribute('data-cat') === f); });
});
});
var cf = $('#contact-form');
if (cf) {
cf.addEventListener('submit', function (e) {
e.preventDefault();
var name = $('#cf-name').value.trim(), email = $('#cf-email').value.trim(), topic = $('#cf-topic').value, msg = $('#cf-msg').value.trim();
if (!name || !msg) { $('#cf-error').hidden = false; return; }
$('#cf-error').hidden = true;
var text = fill(T.cf_hello || 'Hello Mustafa, this is {name}. {topic}: {msg}', { name: name + (email ? ' (' + email + ')' : ''), topic: topic, msg: msg });
$('#cf-wa').href = 'https://wa.me/' + C.wa + '?text=' + encodeURIComponent(text);
$('#cf-mail').href = 'mailto:info@suertevillagecyprus.com?subject=' + encodeURIComponent(topic + ' — ' + name) + '&body=' + encodeURIComponent(msg + '\n\n' + name + (email ? '\n' + email : ''));
var r = $('#cf-result'); r.hidden = false; r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
}
$$('[data-copy]').forEach(function (b) {
b.addEventListener('click', function () {
var text = b.getAttribute('data-copy'), label = b.textContent;
function done(ok) { b.textContent = ok ? (T.copied || 'Copied') : (T.copy_fail || 'Select and copy'); setTimeout(function () { b.textContent = label; }, 1600); }
if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
else done(false);
});
});
var STAGGER = '.pfacts, .escapes, .promise, .rules, .points, .faq, .chips, .reviews, .score-row, .cards, .bento, .guide-grid, .facts, .spot-list';
if ('IntersectionObserver' in window && !reduceMotion) {
var io = new IntersectionObserver(function (entries) {
entries.forEach(function (en) {
if (!en.isIntersecting) return;
var el = en.target, n = el.classList.contains('stagger') ? el.children.length : 1;
el.classList.add('in'); io.unobserve(el);
setTimeout(function () { el.classList.remove('reveal', 'in', 'stagger'); }, 2000 + n * 85);
});
}, { rootMargin: '0px 0px -8% 0px' });
$$('[data-reveal]').forEach(function (el) {
if (el.getBoundingClientRect().top <= window.innerHeight) return;
el.classList.add('reveal');
if (el.matches(STAGGER)) {
el.classList.add('stagger');
Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--i', String(i)); });
}
$$('.points, .faq, .spot-list', el).forEach(function (list) {
Array.prototype.forEach.call(list.children, function (c, i) { c.style.setProperty('--i', String(i)); });
});
$$('h2', el).forEach(function (h) { splitWords(h, 'w'); });
io.observe(el);
});
}
if (!reduceMotion) $$('.faq details').forEach(function (d) {
var s = $('summary', d), ans = $('.ans', d), anim = null;
if (!s || !d.animate) return;
s.addEventListener('click', function (e) {
e.preventDefault();
var from = d.getBoundingClientRect().height;
var opening = !d.open || d.classList.contains('closing');
if (anim) { anim.cancel(); anim = null; }
d.classList.remove('closing');
d.open = true;
var full = d.getBoundingClientRect().height;
var shut = s.getBoundingClientRect().height + (parseFloat(getComputedStyle(d).borderBottomWidth) || 0);
if (!opening) d.classList.add('closing');
d.style.overflow = 'hidden';
anim = d.animate([{ height: from + 'px' }, { height: (opening ? full : shut) + 'px' }],
{ duration: opening ? 460 : 340, easing: 'cubic-bezier(.2, .7, .2, 1)' });
if (opening && ans) ans.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }],
{ duration: 420, delay: 90, easing: 'ease', fill: 'backwards' });
anim.onfinish = function () {
anim = null; d.style.overflow = '';
if (!opening) { d.open = false; d.classList.remove('closing'); }
};
});
});
function countUp(el) {
var to = parseFloat(el.getAttribute('data-count')), dec = Number(el.getAttribute('data-dec') || 0);
var fmt; try { fmt = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: dec, maximumFractionDigits: dec }); } catch (e) { fmt = { format: function (v) { return v.toFixed(dec); } }; }
var final = fmt.format(to), t0 = null, dur = 1500;
function frame(t) {
if (!t0) t0 = t;
var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
el.textContent = p < 1 ? fmt.format(to * e) : final;
if (p < 1) requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
}
if ('IntersectionObserver' in window && !reduceMotion) {
var cio = new IntersectionObserver(function (es) {
es.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); } });
}, { threshold: 0.6 });
$$('[data-count]').forEach(function (el) { if (el.getBoundingClientRect().top > window.innerHeight) cio.observe(el); });
}
$$('[data-map]').forEach(function (m) {
if (!('IntersectionObserver' in window) || reduceMotion) { m.classList.add('drawn'); return; }
var pio = new IntersectionObserver(function (es) {
if (es[0].isIntersecting) { m.classList.add('drawn'); pio.disconnect(); }
}, { threshold: 0.35 });
pio.observe(m);
});
var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
$$('[data-tilt]').forEach(function (stage) {
if (reduceMotion || !finePointer) return;
var raf = 0, ev = null;
function apply() {
raf = 0;
var r = stage.getBoundingClientRect();
var x = Math.max(-0.5, Math.min(0.5, (ev.clientX - r.left) / r.width - 0.5));
var y = Math.max(-0.5, Math.min(0.5, (ev.clientY - r.top) / r.height - 0.5));
stage.style.setProperty('--ry', (x * 12).toFixed(2) + 'deg');
stage.style.setProperty('--rx', (-y * 9).toFixed(2) + 'deg');
stage.style.setProperty('--mx', ((x + 0.5) * 100).toFixed(1) + '%');
stage.style.setProperty('--my', ((y + 0.5) * 100).toFixed(1) + '%');
stage.style.setProperty('--px', (x * 2).toFixed(3));
stage.style.setProperty('--py', (y * 2).toFixed(3));
}
var zone = stage.closest('.hero-v') || stage;
zone.addEventListener('pointermove', function (e) { ev = e; stage.classList.add('is-tilting'); if (!raf) raf = requestAnimationFrame(apply); });
zone.addEventListener('pointerleave', function () {
stage.classList.remove('is-tilting');
['--rx', '--ry', '--px', '--py'].forEach(function (k) { stage.style.removeProperty(k); });
});
});
var plx = reduceMotion ? [] : $$('.cta-media, .hero.page .hero-media');
var timelines = $$('.timeline');
if (reduceMotion) timelines.forEach(function (tl) { tl.style.setProperty('--p', '1'); });
var inner = reduceMotion ? [] : $$('.bento .media, .cards .card > .media, .split .media').filter(function (m) { return !m.closest('.map-figure'); });
inner.forEach(function (m) { m.classList.add('plx-in'); });
var heroV = reduceMotion ? null : $('.hero-v'), heroHS = -1;
var lits = reduceMotion ? [] : $$('.f-say, [data-lit]').map(function (el) { el.classList.add('lit'); return { el: el, ws: splitWords(el, 'fw'), done: false }; });
var subnavMarks = [];
$$('[data-subnav]').forEach(function (nav) {
var links = $$('a[href^="#"]', nav);
var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
if (!targets.length || !('IntersectionObserver' in window)) return;
var inner_ = $('.subnav-inner', nav), ind = null, curId = targets[0].id;
if (inner_ && !reduceMotion) {
ind = document.createElement('span'); ind.className = 'subnav-ind'; ind.setAttribute('aria-hidden', 'true');
inner_.insertBefore(ind, inner_.firstChild); nav.classList.add('has-ind');
}
function mark(id) {
curId = id;
links.forEach(function (a) {
var on = a.getAttribute('href') === '#' + id;
a.setAttribute('aria-current', on ? 'true' : 'false');
if (on && a.scrollIntoView && nav.scrollWidth > nav.clientWidth) a.scrollIntoView({ block: 'nearest', inline: 'center' });
if (on && ind) { ind.style.width = a.offsetWidth + 'px'; ind.style.transform = 'translateX(' + a.offsetLeft + 'px)'; }
});
}
var sio = new IntersectionObserver(function (es) {
es.forEach(function (en) { if (en.isIntersecting) mark(en.target.id); });
}, { rootMargin: '-40% 0px -55% 0px' });
targets.forEach(function (t) { sio.observe(t); });
mark(targets[0].id);
if (ind) requestAnimationFrame(function () { requestAnimationFrame(function () { ind.classList.add('ready'); }); });
subnavMarks.push(function () { mark(curId); });
});
var lastY = window.scrollY, ticking = false;
function onFrame() {
ticking = false;
var vh = window.innerHeight, y = window.scrollY;
plx.forEach(function (el) {
var r = el.parentElement.getBoundingClientRect();
if (r.bottom < -100 || r.top > vh + 100) return;
var p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
el.style.transform = 'translate3d(0,' + (-p * 6).toFixed(2) + '%,0)';
});
var seen = [];
inner.forEach(function (m) { var r = m.getBoundingClientRect(); if (r.bottom > -60 && r.top < vh + 60) seen.push([m, r]); });
seen.forEach(function (s) {
var r = s[1], p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
s[0].style.setProperty('--plx', (-p * r.height * 0.05).toFixed(1) + 'px');
});
if (heroV && (y < heroV.offsetHeight * 1.3 || heroHS < 1)) {
var hs = Math.max(0, Math.min(1, y / (heroV.offsetHeight * 0.85)));
if (Math.abs(hs - heroHS) > 0.002) { heroHS = hs; heroV.style.setProperty('--hs', hs.toFixed(3)); }
}
lits.forEach(function (l) {
var r = l.el.getBoundingClientRect();
if (r.top > vh + 40 || r.bottom < -40) return;
var p = Math.max(0, Math.min(1, (vh * 0.92 - r.top) / (vh * 0.5))), n = l.ws.length;
l.ws.forEach(function (w, i) { var o = Math.max(0, Math.min(1, p * (n + 2) - i)); w.style.opacity = (0.2 + 0.8 * o).toFixed(2); });
});
if (header) {
var busy = (menu && !menu.hidden) || (sheet && !sheet.hidden);
if (y > 520 && y > lastY + 6 && !busy) header.classList.add('is-hidden');
else if (y < lastY - 6 || y <= 520) header.classList.remove('is-hidden');
doc.classList.toggle('hdr-hidden', header.classList.contains('is-hidden'));
}
timelines.forEach(function (tl) {
var r = tl.getBoundingClientRect();
if (r.bottom < 0 || r.top > vh) return;
var p = Math.max(0, Math.min(1, (vh * 0.62 - r.top) / r.height));
tl.style.setProperty('--p', p.toFixed(3));
Array.prototype.forEach.call(tl.children, function (li) { li.classList.toggle('passed', li.getBoundingClientRect().top + 30 < vh * 0.62); });
});
lastY = y;
}
window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } }, { passive: true });
window.addEventListener('resize', function () {
subnavMarks.forEach(function (f) { f(); });
if (!ticking) { ticking = true; requestAnimationFrame(onFrame); }
}, { passive: true });
ticking = true; requestAnimationFrame(onFrame);
document.addEventListener('focusin', function (e) { if (header && header.contains(e.target)) header.classList.remove('is-hidden'); });
(function marqueeScroll() {
var mq = reduceMotion ? null : $('.marquee'), track = mq && $('.marquee-track', mq);
if (!track || !track.getAnimations || !('IntersectionObserver' in window)) return;
var anim = track.getAnimations().filter(function (a) { return a.animationName === 'marquee'; })[0];
if (!anim) return;
var rate = 1, dir = 1, skew = 0, last = window.scrollY, on = false, raf = 0;
function tick() {
var y = window.scrollY, v = y - last; last = y;
if (v > 0.5) dir = 1; else if (v < -0.5) dir = -1;
var target = dir * (1 + Math.min(Math.abs(v) * 0.25, 7));
var next = rate + (target - rate) * 0.1;
if (Math.abs(next - rate) > 0.005) { rate = next; if (anim.updatePlaybackRate) anim.updatePlaybackRate(rate); else anim.playbackRate = rate; }
var sk = Math.max(-6, Math.min(6, -v * 0.3)); skew += (sk - skew) * 0.14;
mq.style.setProperty('--mq-skew', skew.toFixed(2) + 'deg');
raf = on ? requestAnimationFrame(tick) : 0;
}
new IntersectionObserver(function (es) {
on = es[0].isIntersecting;
if (on && !raf) { last = window.scrollY; raf = requestAnimationFrame(tick); }
}).observe(mq);
})();
if ('IntersectionObserver' in window && !reduceMotion) {
var ctaIO = new IntersectionObserver(function (es) {
es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in-view'); ctaIO.unobserve(en.target); } });
}, { threshold: 0.3 });
$$('.cta').forEach(function (c) {
if (c.getBoundingClientRect().top < window.innerHeight * 0.7) return;
$$('h2', c).forEach(function (h) { splitWords(h, 'w'); });
c.classList.add('cta-anim'); ctaIO.observe(c);
});
}
if (finePointer && !reduceMotion) {
$$('.escape, .bento > *, .review, .card > .media, .split .media, .moment .media').forEach(function (card) {
var r = null;
card.addEventListener('pointerenter', function () { r = card.getBoundingClientRect(); });
card.addEventListener('pointermove', function (e) {
if (!r) r = card.getBoundingClientRect();
var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
card.style.setProperty('--try', (x * 7).toFixed(2) + 'deg');
card.style.setProperty('--trx', (-y * 6).toFixed(2) + 'deg');
});
card.addEventListener('pointerleave', function () { r = null; card.style.removeProperty('--trx'); card.style.removeProperty('--try'); });
});
}
})();
