/* RedLabel enhancement layer — mevcut script'lerle çakışmaz */
(() => {
  const d = document, root = d.documentElement, $ = (s, r = d) => r.querySelector(s), $$ = (s, r = d) => [...r.querySelectorAll(s)];
  const rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (!rm) root.classList.add('rl-on');

  // scroll ilerleme çubuğu, nav durumu, aktif menü
  const bar = Object.assign(d.createElement('div'), { className: 'rl-progress' }); d.body.prepend(bar);
  const nav = $('.navbar'), links = $$('.nav-link'), secs = links.map(a => $(a.getAttribute('href')));
  let tick = false;
  const onScroll = () => {
    tick = false;
    const h = root.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    nav && nav.classList.toggle('rl-scrolled', scrollY > 30);
    links.forEach((a, i) => { const r = secs[i] && secs[i].getBoundingClientRect(); a.classList.toggle('rl-active', !!r && r.top < innerHeight * .4 && r.bottom > innerHeight * .4); });
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  if (rm) return;

  // hero giriş sırası
  $$('.hero-content>*').forEach((el, i) => el.style.setProperty('--i', i));

  // aurora arka plan
  const au = d.createElement('div'); au.className = 'rl-aurora'; au.setAttribute('aria-hidden', 'true'); au.innerHTML = '<i></i><i></i><i></i>'; d.body.prepend(au);

  // imleci yumuşak takip eden ışık
  if (fine) {
    const c = d.createElement('div'); c.className = 'rl-cursor'; d.body.appendChild(c);
    let x = innerWidth / 2, y = innerHeight / 3, tx = x, ty = y;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() { x += (tx - x) * .12; y += (ty - y) * .12; c.style.transform = `translate(${x}px,${y}px)`; requestAnimationFrame(loop); })();
  }

  // scroll ile beliren bölümler
  const targets = $$('.section-header,.showcase-header,.showcase-detail-card,.showcase-thumbs-strip,.stat-card,.bento-card,.pricing-card,.faq-item,.footer');
  targets.forEach(el => {
    const sib = [...el.parentElement.children].filter(n => targets.includes(n));
    el.setAttribute('data-rl', ''); el.style.setProperty('--rl-d', sib.indexOf(el) * 90 + 'ms');
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target; io.unobserve(el); el.classList.add('rl-in');
      setTimeout(() => { el.removeAttribute('data-rl'); el.classList.remove('rl-in'); el.style.removeProperty('--rl-d'); }, 1400 + parseInt(el.style.getPropertyValue('--rl-d') || 0));
    }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(el => io.observe(el));
  } else targets.forEach(el => el.removeAttribute('data-rl'));

  // sayaçlar
  const co = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; co.unobserve(e.target);
    const el = e.target, raw = el.textContent, m = raw.match(/\d[\d.,]*/);
    if (!m || raw.includes('/')) return;
    const thousands = /^\d{1,3}(\.\d{3})+$/.test(m[0]), dec = !thousands && /[.,]\d$/.test(m[0]);
    const end = parseFloat(thousands ? m[0].replace(/\./g, '') : m[0].replace(',', '.')), t0 = performance.now();
    (function f(t) {
      const k = Math.min(1, (t - t0) / 1800), v = end * (1 - Math.pow(1 - k, 4));
      el.textContent = raw.replace(m[0], thousands ? Math.round(v).toLocaleString('tr-TR') : dec ? v.toFixed(1) : Math.round(v));
      if (k < 1) requestAnimationFrame(f); else el.textContent = raw;
    })(t0);
  }), { threshold: .6 });
  $$('.stat-num').forEach(el => co.observe(el));

  if (fine) {
    // kart ışığı + 3D eğim
    $$('.bento-card,.pricing-card').forEach(c => {
      c.classList.add('rl-spot');
      c.addEventListener('pointermove', e => {
        if (c.hasAttribute('data-rl')) return;
        const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        c.style.setProperty('--mx', px * r.width + 'px'); c.style.setProperty('--my', py * r.height + 'px');
        c.style.setProperty('--ry', (px - .5) * 8 + 'deg'); c.style.setProperty('--rx', (.5 - py) * 8 + 'deg'); c.classList.add('rl-tilt');
      });
      c.addEventListener('pointerleave', () => c.classList.remove('rl-tilt'));
    });
    // mıknatıslı butonlar
    $$('.btn-primary-hero,.btn-secondary-hero,.btn-nav-download').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .3}px)`; });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }

  // vitrin: otomatik gezinti + ilerleme çubuğu + hafif eğim
  const vp = $('#mockupViewport'), S = window.RedLabelShowcase;
  if (vp && S) {
    const ab = Object.assign(d.createElement('div'), { className: 'rl-autobar' }); vp.appendChild(ab);
    const DUR = 6500, lb = $('#hdLightbox'); let t0 = performance.now(), hold = false, vis = true;
    new MutationObserver(() => { t0 = performance.now(); }).observe($('.frame-screens', vp) || vp, { attributes: true, subtree: true, attributeFilter: ['class'] });
    new IntersectionObserver(e => { vis = e[0].isIntersecting; }, { threshold: .35 }).observe(vp);
    vp.addEventListener('pointerenter', () => hold = true); vp.addEventListener('pointerleave', () => { hold = false; t0 = performance.now(); });
    (function loop(t) {
      const busy = hold || !vis || d.hidden || (lb && lb.classList.contains('active'));
      if (busy) t0 = t - (parseFloat(ab.dataset.k || 0) * DUR);
      const k = Math.min(1, (t - t0) / DUR); ab.dataset.k = k; ab.style.transform = `scaleX(${k})`;
      if (k >= 1) { S.switchScreen(S.getCurrentIndex() + 1); t0 = t; }
      requestAnimationFrame(loop);
    })(performance.now());
    if (fine) {
      const fr = vp.parentElement;
      fr.style.transition = 'transform .15s ease-out'; fr.style.willChange = 'transform';
      fr.addEventListener('pointermove', e => { const r = fr.getBoundingClientRect(); fr.style.transform = `perspective(1400px) rotateY(${((e.clientX - r.left) / r.width - .5) * 4}deg) rotateX(${(.5 - (e.clientY - r.top) / r.height) * 3}deg)`; });
      fr.addEventListener('pointerleave', () => { fr.style.transform = ''; });
    }
  }

  // ═══ v3 ek animasyonlar ═══
  // hero içeriği scroll'da yukarı kayıp solar (paralaks)
  const hc = $('.hero-content');
  if (hc) addEventListener('scroll', () => { const k = Math.min(1, scrollY / (innerHeight * .8)); hc.style.transform = `translateY(${scrollY * .18}px)`; hc.style.opacity = 1 - k * .85; }, { passive: true });

  // tıklama dalgası
  $$('.btn-primary-hero,.btn-secondary-hero,.btn-nav-download,.btn-detail-cta').forEach(b => b.addEventListener('pointerdown', e => {
    const r = b.getBoundingClientRect(), s = d.createElement('span'); s.className = 'rl-ripple';
    s.style.left = e.clientX - r.left + 'px'; s.style.top = e.clientY - r.top + 'px'; b.appendChild(s); setTimeout(() => s.remove(), 750);
  }));

  // vitrin detay metni değişince yumuşak geçiş
  ['detailPill', 'detailTitle', 'detailDesc', 'detailFeatureList'].forEach((id, i) => {
    const el = d.getElementById(id); if (!el) return;
    new MutationObserver(() => { el.classList.remove('rl-swap'); void el.offsetWidth; el.style.animationDelay = i * 70 + 'ms'; el.classList.add('rl-swap'); }).observe(el, { childList: true, characterData: true, subtree: true });
  });

  // bento ikonlarında imleci hafifçe takip eden parıltı
  $$('.bento-card').forEach(c => c.addEventListener('pointermove', e => {
    const ic = $('.bento-icon', c); if (!ic) return; const r = ic.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (e.clientX - r.left - r.width / 2) / 160)), y = Math.max(-1, Math.min(1, (e.clientY - r.top - r.height / 2) / 160));
    ic.style.translate = `${x * 5}px ${y * 5}px`;
  }));
  $$('.bento-card').forEach(c => c.addEventListener('pointerleave', () => { const ic = $('.bento-icon', c); if (ic) ic.style.translate = ''; }));
})();

// ═══ v4 ═══
(() => {
  const d = document, $$ = (s, r = d) => [...r.querySelectorAll(s)];
  const rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const items = $$('.faq-item');

  // SSS: aria, cevabı kelime kelime açma, ışık takibi, klavye oku
  const split = p => {
    if (p.dataset.rlSplit) return; p.dataset.rlSplit = '1';
    p.innerHTML = p.textContent.trim().split(/\s+/).map((w, i) => `<span class="rl-w" style="--wi:${i}">${w}</span>`).join(' ');
  };
  const play = it => { const p = $('.faq-content p', it); if (!p || rm) return; split(p); $$('.rl-w', p).forEach(w => { w.style.animation = 'none'; void w.offsetWidth; w.style.animation = ''; }); };
  function $(s, r = d) { return r.querySelector(s); }
  items.forEach((it, i) => {
    const t = $('.faq-trigger', it);
    new MutationObserver(() => { const on = it.classList.contains('active'); t.setAttribute('aria-expanded', on); if (on) play(it); }).observe(it, { attributes: true, attributeFilter: ['class'] });
    it.addEventListener('pointermove', e => { const r = it.getBoundingClientRect(); it.style.setProperty('--mx', e.clientX - r.left + 'px'); it.style.setProperty('--my', e.clientY - r.top + 'px'); });
    t.addEventListener('keydown', e => {
      const k = { ArrowDown: 1, ArrowUp: -1 }[e.key]; if (!k) return; e.preventDefault();
      $('.faq-trigger', items[(i + k + items.length) % items.length]).focus();
    });
  });
  const first = items.find(i => i.classList.contains('active')); if (first) play(first);
  if (rm) return;

  // istatistik ve küçük resim kartlarında ışık takibi
  $$('.stat-card,.thumb-card').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px');
  }));
})();

// ═══ v4.1 ═══
(() => {
  const d = document, $ = (s, r = d) => r.querySelector(s), $$ = (s, r = d) => [...r.querySelectorAll(s)];
  const rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

  // sekmeler: aktif sekmenin arkasında kayan hap
  const nav = $('.showcase-tabs-nav');
  if (nav) {
    const pill = Object.assign(d.createElement('span'), { className: 'rl-tabpill' }); nav.prepend(pill);
    const place = () => {
      const a = $('.showcase-tab-btn.active', nav); if (!a) return;
      pill.style.width = a.offsetWidth + 'px'; pill.style.transform = `translateX(${a.offsetLeft}px)`;
      const l = a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2;
      if (nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: l, behavior: rm ? 'auto' : 'smooth' });
    };
    $$('.showcase-tab-btn', nav).forEach(b => new MutationObserver(place).observe(b, { attributes: true, attributeFilter: ['class'] }));
    addEventListener('resize', place); addEventListener('load', place);
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(place);
    place();
  }
  if (rm) return;

  // başlıklar: kelime kelime belirir (gradyan başlıklara dokunmaz)
  const heads = $$('.section-header h2');
  heads.forEach(h => {
    let i = 0;
    const walk = n => [...n.childNodes].forEach(c => {
      if (c.nodeType === 3) {
        if (!c.textContent.trim()) return;
        const f = d.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(t => {
          if (!t) return;
          if (/^\s+$/.test(t)) f.appendChild(d.createTextNode(' '));
          else { const s = d.createElement('span'); s.className = 'rl-hw'; s.style.setProperty('--wi', i++); s.textContent = t; f.appendChild(s); }
        });
        c.replaceWith(f);
      } else if (c.nodeType === 1 && !c.classList.contains('gradient-title') && c.tagName !== 'BR') walk(c);
    });
    walk(h);
  });
  const hio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; hio.unobserve(e.target);
    e.target.classList.add('rl-h-in'); e.target.parentElement.classList.add('rl-hh');
  }), { threshold: .4 });
  heads.forEach(h => hio.observe(h));

  // tıklama kıvılcımları
  if (fine) addEventListener('pointerdown', e => {
    for (let i = 0; i < 9; i++) {
      const s = d.createElement('i'); s.className = 'rl-spark'; d.body.appendChild(s);
      const a = Math.PI * 2 * i / 9 + Math.random() * .5, r = 26 + Math.random() * 34;
      s.animate([{ transform: `translate(${e.clientX}px,${e.clientY}px) scale(1)`, opacity: 1 },
        { transform: `translate(${e.clientX + Math.cos(a) * r}px,${e.clientY + Math.sin(a) * r}px) scale(.1)`, opacity: 0 }],
        { duration: 650 + Math.random() * 200, easing: 'cubic-bezier(.16,1,.3,1)' }).onfinish = () => s.remove();
    }
  });

  // vitrin çerçevesi: kaydırırken hafif yaklaşma
  const fr = $('#mockupViewport') && $('#mockupViewport').parentElement;
  if (fr) {
    const io = new IntersectionObserver(e => { fr.dataset.vis = e[0].isIntersecting ? '1' : ''; }, { threshold: 0 }); io.observe(fr);
    addEventListener('scroll', () => {
      if (!fr.dataset.vis) return;
      const r = fr.getBoundingClientRect(), k = 1 - Math.min(1, Math.abs(r.top + r.height / 2 - innerHeight / 2) / innerHeight);
      fr.style.scale = (.96 + k * .04).toFixed(3);
    }, { passive: true });
  }
})();

// ═══ v4.3: yumuşak, yavaş tekerlek kaydırma ═══
(() => {
  if (!matchMedia('(hover:hover) and (pointer:fine)').matches || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const html = document.documentElement;
  let target = scrollY, cur = scrollY, raf = 0;
  const max = () => html.scrollHeight - innerHeight;
  const inner = el => { for (; el && el !== document.body && el !== html; el = el.parentElement) { const o = getComputedStyle(el).overflowY; if (/(auto|scroll)/.test(o) && el.scrollHeight > el.clientHeight + 1) return true; } return false; };
  function step() {
    cur += (target - cur) * 0.07;
    if (Math.abs(target - cur) < 0.5) { cur = target; raf = 0; } else raf = requestAnimationFrame(step);
    scrollTo({ top: cur, behavior: 'instant' });
  }
  addEventListener('wheel', e => {
    if (e.ctrlKey || e.defaultPrevented || Math.abs(e.deltaX) > Math.abs(e.deltaY) || inner(e.target) || document.querySelector('#hdLightbox.active')) return;
    e.preventDefault();
    const dy = e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? innerHeight : 1);
    target = Math.max(0, Math.min(max(), target + dy * 0.8));
    if (!raf) raf = requestAnimationFrame(step);
  }, { passive: false });
  addEventListener('scroll', () => { if (!raf) target = cur = scrollY; }, { passive: true });
  // menü / buton bağlantıları da aynı yavaş hareketle kayar
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href'), el = id.length > 1 ? document.querySelector(id) : null;
    if (id.length > 1 && !el) return;
    e.preventDefault();
    target = Math.max(0, Math.min(max(), el ? el.getBoundingClientRect().top + scrollY - 80 : 0));
    if (!raf) { cur = scrollY; raf = requestAnimationFrame(step); }
  });
})();
