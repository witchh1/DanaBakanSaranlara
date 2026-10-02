/* RedLabel Modern Enhancement & Smooth Transition Layer */
(() => {
  const d = document, root = d.documentElement, $ = (s, r = d) => r.querySelector(s), $$ = (s, r = d) => [...r.querySelectorAll(s)];
  const rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (!rm) root.classList.add('rl-on');

  // 1. Scroll Progress Bar & Navbar State & Active Section Tracking
  const bar = Object.assign(d.createElement('div'), { className: 'rl-progress' });
  d.body.prepend(bar);

  const nav = $('.navbar');
  const navLinks = $$('.nav-link');
  const sectionIds = navLinks.map(a => a.getAttribute('href')).filter(h => h && h.startsWith('#'));
  const sections = sectionIds.map(h => $(h));

  const updateScrollState = () => {
    const maxH = root.scrollHeight - innerHeight;
    const progress = maxH > 0 ? window.scrollY / maxH : 0;
    bar.style.transform = `scaleX(${progress})`;

    if (nav) {
      nav.classList.toggle('rl-scrolled', window.scrollY > 20);
    }

    // Active menu item tracking
    const midPoint = innerHeight * 0.38;
    sections.forEach((sec, idx) => {
      if (!sec) return;
      const rect = sec.getBoundingClientRect();
      const isActive = rect.top <= midPoint && rect.bottom > midPoint;
      navLinks[idx]?.classList.toggle('rl-active', isActive);
    });
  };

  addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();

  // 2. Hero Elements Stagger Setup
  $$('.hero-content > *').forEach((el, i) => el.style.setProperty('--i', i));

  // 3. Clean Scroll Reveal (Subtle Fade-In without 3D Distortion)
  const targets = $$('.section-header, .showcase-header, .showcase-detail-card, .showcase-thumbs-strip, .stat-card, .bento-card, .pricing-card, .faq-item, .footer');
  targets.forEach((el, idx) => {
    el.setAttribute('data-rl', '');
    el.style.setProperty('--rl-d', (idx % 4) * 80 + 'ms');
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        io.unobserve(el);
        el.classList.add('rl-in');
        setTimeout(() => {
          el.removeAttribute('data-rl');
          el.classList.remove('rl-in');
        }, 1200);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => io.observe(el));
  } else {
    targets.forEach(el => el.removeAttribute('data-rl'));
  }

  // 4. Smooth Counter Animation for Stats
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        co.unobserve(e.target);
        const el = e.target, raw = el.textContent, m = raw.match(/\d[\d.,]*/);
        if (!m || raw.includes('/')) return;
        const thousands = /^\d{1,3}(\.\d{3})+$/.test(m[0]), dec = !thousands && /[.,]\d$/.test(m[0]);
        const end = parseFloat(thousands ? m[0].replace(/\./g, '') : m[0].replace(',', '.'));
        const t0 = performance.now();
        (function f(t) {
          const k = Math.min(1, (t - t0) / 1600);
          const v = end * (1 - Math.pow(1 - k, 3));
          el.textContent = raw.replace(m[0], thousands ? Math.round(v).toLocaleString('tr-TR') : dec ? v.toFixed(1) : Math.round(v));
          if (k < 1) requestAnimationFrame(f);
          else el.textContent = raw;
        })(t0);
      });
    }, { threshold: 0.5 });
    $$('.stat-num').forEach(el => co.observe(el));
  }

  // 5. Showcase (Arayüz Vitrini) Navigation & Sliding Glass Tab Pill
  const showcaseNav = $('.showcase-tabs-nav');
  if (showcaseNav) {
    const pill = Object.assign(d.createElement('span'), { className: 'rl-tabpill' });
    showcaseNav.prepend(pill);

    const updatePill = () => {
      const activeBtn = $('.showcase-tab-btn.active', showcaseNav);
      if (!activeBtn) return;
      pill.style.width = activeBtn.offsetWidth + 'px';
      pill.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
      const centerPos = activeBtn.offsetLeft - (showcaseNav.clientWidth - activeBtn.offsetWidth) / 2;
      if (showcaseNav.scrollWidth > showcaseNav.clientWidth) {
        showcaseNav.scrollTo({ left: centerPos, behavior: rm ? 'auto' : 'smooth' });
      }
    };

    $$('.showcase-tab-btn', showcaseNav).forEach(b => {
      new MutationObserver(updatePill).observe(b, { attributes: true, attributeFilter: ['class'] });
    });
    addEventListener('resize', updatePill, { passive: true });
    addEventListener('load', updatePill);
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(updatePill);
    setTimeout(updatePill, 50);
  }

  // 6. Showcase Detail Text Gentle Crossfade
  ['detailPill', 'detailTitle', 'detailDesc', 'detailFeatureList'].forEach(id => {
    const el = d.getElementById(id);
    if (!el) return;
    new MutationObserver(() => {
      el.classList.remove('rl-swap');
      void el.offsetWidth;
      el.classList.add('rl-swap');
    }).observe(el, { childList: true, characterData: true, subtree: true });
  });

  // 7. SSS (FAQ) Sequential Word-by-Word Typing / Reveal Animation
  // Kullanıcının istediği: "SSS Sayfasındaki Yazılar Böyle Sırasıyla Yazılarak Geliyordu o Güzeldi O Efekt"
  const faqItems = $$('.faq-item');
  const splitFaqText = (p) => {
    if (p.dataset.rlSplit) return;
    p.dataset.rlSplit = '1';
    p.innerHTML = p.textContent.trim().split(/\s+/).map((w, i) => `<span class="rl-w" style="--wi:${i}">${w}</span>`).join(' ');
  };

  const playFaqAnimation = (item) => {
    const p = $('.faq-content p', item);
    if (!p || rm) return;
    splitFaqText(p);
    $$('.rl-w', p).forEach(w => {
      w.style.animation = 'none';
      void w.offsetWidth;
      w.style.animation = '';
    });
  };

  faqItems.forEach((it) => {
    const trigger = $('.faq-trigger', it);
    new MutationObserver(() => {
      if (it.classList.contains('active')) {
        playFaqAnimation(it);
      }
    }).observe(it, { attributes: true, attributeFilter: ['class'] });

    if (trigger) {
      trigger.addEventListener('click', () => {
        if (it.classList.contains('active')) {
          playFaqAnimation(it);
        }
      });
    }
  });

  const initialActiveFaq = faqItems.find(i => i.classList.contains('active'));
  if (initialActiveFaq) playFaqAnimation(initialActiveFaq);

  // 8. ULTRA-SMOOTH MOMENTUM MOUSE SCROLLING & ELEGANT SLOW ANCHOR TRANSITION
  // User requirements:
  // - "siteyi mose ile aşşağı kaydırınca Çok yavaş smooth bir şekilde geçsin"
  // - "Üstteki kısımdan Arayüz felan geçiş yaparken Çok hızlı geöçiyor" -> Slow, graceful easing curve
  // - "daha fazla smoth olsun birde"
  if (!rm) {
    const maxScroll = () => root.scrollHeight - innerHeight;
    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let wheelRaf = 0;
    let isAnchorScrolling = false;
    let lastWheelTime = performance.now();

    // Helper: Check if element has its own scroll container
    const isInnerScrollable = (el) => {
      for (; el && el !== d.body && el !== root; el = el.parentElement) {
        const style = getComputedStyle(el);
        if (/(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight + 1) return true;
      }
      return false;
    };

    // Physics Loop for Mouse Wheel Inertia
    // Smooth frame-rate independent interpolation for a buttery, slow, luxurious glide
    const LERP_SPEED = 0.046;

    function smoothWheelStep(now) {
      if (isAnchorScrolling) {
        wheelRaf = 0;
        return;
      }

      const dt = Math.min(33, now - lastWheelTime) / 16.67;
      lastWheelTime = now;

      const factor = 1 - Math.pow(1 - LERP_SPEED, dt);
      const diff = targetY - currentY;
      currentY += diff * factor;

      if (Math.abs(diff) < 0.25) {
        currentY = targetY;
        window.scrollTo(0, currentY);
        wheelRaf = 0;
      } else {
        window.scrollTo(0, currentY);
        wheelRaf = requestAnimationFrame(smoothWheelStep);
      }
    }

    if (fine) {
      addEventListener('wheel', (e) => {
        // Allow zoom (Ctrl) or inner scroll containers
        if (e.ctrlKey || e.defaultPrevented || Math.abs(e.deltaX) > Math.abs(e.deltaY) || isInnerScrollable(e.target)) return;
        const lightbox = $('#hdLightbox');
        if (lightbox && lightbox.classList.contains('active')) return;

        e.preventDefault();

        // If an anchor animation was running, interrupt it cleanly
        isAnchorScrolling = false;

        const max = maxScroll();
        const delta = e.deltaY * (e.deltaMode === 1 ? 28 : e.deltaMode === 2 ? innerHeight : 0.85);

        // Smoothly adjust target scroll position
        targetY = Math.max(0, Math.min(max, targetY + delta));

        if (!wheelRaf) {
          lastWheelTime = performance.now();
          currentY = window.scrollY;
          wheelRaf = requestAnimationFrame(smoothWheelStep);
        }
      }, { passive: false });
    }

    // Keep state in sync on native touch or scrollbar drag
    addEventListener('scroll', () => {
      if (!wheelRaf && !isAnchorScrolling) {
        targetY = currentY = window.scrollY;
      }
      updateScrollState();
    }, { passive: true });

    // Smooth Anchor Transition Engine (for Navbar Links, Buttons, etc.)
    // Resolves: "Üstteki kısımdan Arayüz felan geçiş yaparken Çok hızlı geöçiyor"
    // Uses a custom ease-in-out quartic curve over 1100ms-1250ms for a slow, cinematic glide
    function smoothScrollTo(destY, duration = 1150) {
      if (wheelRaf) {
        cancelAnimationFrame(wheelRaf);
        wheelRaf = 0;
      }

      isAnchorScrolling = true;
      const startY = window.scrollY;
      const distance = destY - startY;
      const startTime = performance.now();

      // Smooth easeInOutQuart: starts softly, glides elegantly, decelerates feather-softly
      function easeInOutQuart(t) {
        return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
      }

      function anchorStep(now) {
        if (!isAnchorScrolling) return;

        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const eased = easeInOutQuart(progress);
        const y = startY + distance * eased;

        window.scrollTo(0, y);
        currentY = targetY = y;

        if (progress < 1) {
          requestAnimationFrame(anchorStep);
        } else {
          isAnchorScrolling = false;
          window.scrollTo(0, destY);
          currentY = targetY = destY;
          updateScrollState();
        }
      }

      requestAnimationFrame(anchorStep);
    }

    // Intercept all internal anchor clicks (#onizleme, #ozellikler, #planlar, #sss, #indir, etc.)
    d.addEventListener('click', (e) => {
      const link = e.target.closest && e.target.closest('a[href^="#"]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      if (href === '#' || href === '#top') {
        e.preventDefault();
        smoothScrollTo(0, 950);
        return;
      }

      const targetEl = d.querySelector(href);
      if (targetEl) {
        e.preventDefault();
        // Offset for sticky navbar (76px)
        const topOffset = targetEl.getBoundingClientRect().top + window.scrollY - 76;
        const max = maxScroll();
        const finalDest = Math.max(0, Math.min(max, topOffset));

        // Slow, luxurious smooth scroll duration based on distance (950ms to 1250ms)
        const dist = Math.abs(finalDest - window.scrollY);
        const customDuration = Math.max(950, Math.min(1250, dist * 0.55 + 500));

        smoothScrollTo(finalDest, customDuration);

        // Update URL hash without instant jump
        if (history.pushState) {
          history.pushState(null, '', href);
        }
      }
    });
  }
})();
