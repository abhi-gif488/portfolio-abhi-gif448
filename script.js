/**
 * ═══════════════════════════════════════════════════════════════
 *  ABHISHEK KUMAR · PORTFOLIO · script.js  v3
 *  Theme    : Carbon Black + Electric Lime
 *  Arch     : IIFE modules, RAF loops, IntersectionObserver pooling
 *
 *  Modules:
 *   01. Utilities
 *   02. Loader
 *   03. Cursor
 *   04. Particle Canvas (hero)
 *   05. Hero Word Reveal
 *   06. Typing Effect
 *   07. Navigation (scroll class, progress, active links)
 *   08. Mobile Menu
 *   09. Scroll Reveal
 *   10. Skill Bars
 *   11. Counter Animation
 *   12. Certifications Carousel (drag + buttons)
 *   13. Magnetic Buttons
 *   14. Button Ripple
 *   15. Form Validation + Submission
 *   16. Toast System
 *   17. Theme Toggle
 *   18. Footer Year
 *   19. Back-to-Top
 *   20. Side Dot Navigation
 *   21. Keyboard Focus Guard
 *   22. Console Signature
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   01.  UTILITIES
═══════════════════════════════════════════════════════════════ */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const debounce = (fn, ms = 150) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ═══════════════════════════════════════════════════════════════
   02.  LOADER
═══════════════════════════════════════════════════════════════ */
(function initLoader() {
  const loader = $('#loader');
  if (!loader) return;

  document.body.style.overflow = 'hidden';

  const wait = new Promise(r => setTimeout(r, 1900));
  const load = new Promise(r => {
    if (document.readyState === 'complete') r();
    else window.addEventListener('load', r, { once: true });
  });

  Promise.all([wait, load]).then(() => {
    loader.classList.add('out');
    document.body.style.overflow = '';
    // Trigger hero entrance after fade
    setTimeout(triggerHeroEntrance, 180);
  });
})();

/* ═══════════════════════════════════════════════════════════════
   03.  CURSOR
═══════════════════════════════════════════════════════════════ */
(function initCursor() {
  const cur = $('#cursor');
  if (!cur || window.matchMedia('(hover: none)').matches) return;

  let cx = -100, cy = -100;

  // Direct position — no lag needed, mix-blend-mode handles the feel
  window.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    cur.style.left = cx + 'px';
    cur.style.top  = cy + 'px';
  }, { passive: true });

  window.addEventListener('mousedown', () => document.body.classList.add('c-click'), { passive: true });
  window.addEventListener('mouseup',   () => document.body.classList.remove('c-click'), { passive: true });

  // Grow on interactive elements
  document.addEventListener('mouseover', e => {
    const t = e.target.closest('a,button,[data-mag],input,textarea,.cert-card,.proj-mockup,.testi-card');
    document.body.classList.toggle('c-hover', !!t);
  }, { passive: true });
})();

/* ═══════════════════════════════════════════════════════════════
   04.  PARTICLE CANVAS (hero background)
═══════════════════════════════════════════════════════════════ */
(function initCanvas() {
  const canvas = $('#hero-canvas');
  if (!canvas || reduced) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], raf, mouse = { x: -9999, y: -9999 };

  const isDark = () => document.documentElement.dataset.theme !== 'light';
  const particleColor = () => isDark() ? 'rgba(200,255,71,' : 'rgba(90,122,0,';

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildParticles();
  }

  function buildParticles() {
    const count = Math.min(60, Math.floor(W * H / 16000));
    particles = Array.from({ length: count }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - .5) * .35,
      vy: (Math.random() - .5) * .35,
      r:  1 + Math.random() * 1.5,
      o:  .15 + Math.random() * .35,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const col = particleColor();

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Mouse repulsion
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const force = (100 - dist) / 100 * .6;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      // Damping + update
      p.vx *= .98; p.vy *= .98;
      p.x += p.vx;  p.y  += p.vy;

      // Wrap edges
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = col + p.o + ')';
      ctx.fill();

      // Connect nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const ex = p.x - q.x, ey = p.y - q.y;
        const d  = Math.sqrt(ex * ex + ey * ey);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = col + ((1 - d / 110) * .12) + ')';
          ctx.lineWidth = .6;
          ctx.stroke();
        }
      }
    }

    raf = requestAnimationFrame(draw);
  }

  canvas.closest('section').addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  }, { passive: true });
  canvas.closest('section').addEventListener('mouseleave', () => {
    mouse.x = mouse.y = -9999;
  }, { passive: true });

  // Pause when hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(draw);
  });

  resize();
  draw();
  window.addEventListener('resize', debounce(resize, 200), { passive: true });
})();

/* ═══════════════════════════════════════════════════════════════
   05.  HERO WORD REVEAL (triggered after loader)
═══════════════════════════════════════════════════════════════ */
function triggerHeroEntrance() {
  $$('.hero-word').forEach((w, i) => {
    setTimeout(() => w.classList.add('show'), i * 140);
  });
}

/* ═══════════════════════════════════════════════════════════════
   06.  TYPING EFFECT
═══════════════════════════════════════════════════════════════ */
(function initTyping() {
  const el = $('#ticker-text');
  if (!el) return;

  const roles = [
    'Full-Stack Developer',
    'Java Engineer',
    'React Enthusiast',
    'Angular Developer',
    'UI Craftsman',
    'Problem Solver',
  ];

  let roleIdx = 0, charIdx = 0, deleting = false;
  const SPEED_TYPE = 68, SPEED_DEL = 38, PAUSE = 2000;

  function tick() {
    const role = roles[roleIdx];
    if (deleting) {
      el.textContent = role.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        setTimeout(tick, 400);
        return;
      }
    } else {
      el.textContent = role.slice(0, ++charIdx);
      if (charIdx === role.length) {
        deleting = true;
        setTimeout(tick, PAUSE);
        return;
      }
    }
    setTimeout(tick, deleting ? SPEED_DEL : SPEED_TYPE);
  }

  // Start after loader animation delay
  setTimeout(tick, 2300);
})();

/* ═══════════════════════════════════════════════════════════════
   07.  NAVIGATION
═══════════════════════════════════════════════════════════════ */
(function initNav() {
  const hdr  = $('#site-header');
  const rule = $('#nav-rule');
  if (!hdr) return;

  // Scroll class + progress bar
  const onScroll = () => {
    const scrolled = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const pct = maxScroll > 0 ? (scrolled / maxScroll * 100) : 0;

    hdr.classList.toggle('scrolled', scrolled > 40);
    if (rule) rule.style.width = pct + '%';

    // Back-to-top button
    const btn = $('#back-top');
    if (btn) btn.classList.toggle('show', scrolled > 500);
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  // Active nav link via IntersectionObserver
  const sections = $$('main section[id]');
  const links    = $$('.nav-a');

  if (sections.length && links.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(a => a.classList.remove('active'));
          const active = links.find(a => a.getAttribute('href') === `#${entry.target.id}`);
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach(s => io.observe(s));
  }

  // Smooth scroll for all anchor links
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   08.  MOBILE MENU
═══════════════════════════════════════════════════════════════ */
(function initMobileMenu() {
  const btn  = $('#nav-toggle');
  const menu = $('#mobile-menu');
  if (!btn || !menu) return;

  let open = false;

  function toggle(state) {
    open = state ?? !open;
    menu.classList.toggle('open', open);
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  btn.addEventListener('click', () => toggle());

  // Close on link click
  menu.querySelectorAll('.mm-link').forEach(l => l.addEventListener('click', () => toggle(false)));

  // Escape key
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) toggle(false); });
})();

/* ═══════════════════════════════════════════════════════════════
   09.  SCROLL REVEAL
═══════════════════════════════════════════════════════════════ */
(function initReveal() {
  const els = $$('.reveal-up, .reveal-fade');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: .08 });

  els.forEach(el => io.observe(el));
})();

/* ═══════════════════════════════════════════════════════════════
   10.  SKILL BARS
═══════════════════════════════════════════════════════════════ */
(function initSkillBars() {
  const rows = $$('.sk-row[data-pct]');
  if (!rows.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const row  = entry.target;
      const pct  = parseFloat(row.dataset.pct) || 0;
      const fill = row.querySelector('.sk-fill');
      if (!fill) return;
      setTimeout(() => { fill.style.width = pct + '%'; }, 150);
      io.unobserve(row);
    });
  }, { threshold: .3 });

  rows.forEach(r => io.observe(r));
})();

/* ═══════════════════════════════════════════════════════════════
   11.  COUNTER ANIMATION
═══════════════════════════════════════════════════════════════ */
(function initCounters() {
  const nums = $$('.stat-num[data-target]');
  if (!nums.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const end = parseFloat(el.dataset.target);
      const dur = 1400;
      const start = performance.now();

      function frame(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / dur, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * end);
        if (progress < 1) requestAnimationFrame(frame);
      }

      requestAnimationFrame(frame);
      io.unobserve(el);
    });
  }, { threshold: .5 });

  nums.forEach(n => io.observe(n));
})();

/* ═══════════════════════════════════════════════════════════════
   12.  CERTIFICATIONS CAROUSEL
═══════════════════════════════════════════════════════════════ */
(function initCerts() {
  const track = $('#certs-track');
  const prev  = $('#cert-prev');
  const next  = $('#cert-next');
  if (!track) return;

  const SCROLL_BY = 310;

  prev?.addEventListener('click', () => { track.scrollBy({ left: -SCROLL_BY, behavior: 'smooth' }); });
  next?.addEventListener('click', () => { track.scrollBy({ left:  SCROLL_BY, behavior: 'smooth' }); });

  // Drag-to-scroll
  let dragging = false, startX = 0, scrollStart = 0;

  track.addEventListener('mousedown', e => {
    dragging = true; startX = e.pageX; scrollStart = track.scrollLeft;
    track.style.userSelect = 'none';
  });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    track.scrollLeft = scrollStart - (e.pageX - startX);
  }, { passive: true });
  window.addEventListener('mouseup', () => {
    dragging = false;
    track.style.userSelect = '';
  });
})();

/* ═══════════════════════════════════════════════════════════════
   13.  MAGNETIC BUTTONS
═══════════════════════════════════════════════════════════════ */
(function initMagnetic() {
  if (reduced || window.matchMedia('(hover: none)').matches) return;

  $$('[data-mag]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r    = el.getBoundingClientRect();
      const cx   = r.left + r.width  / 2;
      const cy   = r.top  + r.height / 2;
      const dx   = (e.clientX - cx) * .38;
      const dy   = (e.clientY - cy) * .38;
      el.style.transform = `translate(${dx}px,${dy}px) translateY(-3px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   14.  BUTTON RIPPLE
═══════════════════════════════════════════════════════════════ */
document.addEventListener('click', e => {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  const r    = btn.getBoundingClientRect();
  const size = Math.max(r.width, r.height) * 2;
  const rip  = document.createElement('span');
  rip.className = 'btn-ripple';
  rip.style.cssText = `
    width:${size}px; height:${size}px;
    left:${e.clientX - r.left - size/2}px;
    top:${e.clientY - r.top - size/2}px;
  `;
  btn.appendChild(rip);
  rip.addEventListener('animationend', () => rip.remove(), { once: true });
});

/* ═══════════════════════════════════════════════════════════════
   15.  FORM HANDLING
═══════════════════════════════════════════════════════════════ */
(function initForms() {
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateField(input) {
    const err = input.closest('.field')?.querySelector('.field-err');
    let msg = '';
    if (input.required && !input.value.trim()) msg = 'This field is required.';
    else if (input.type === 'email' && input.value && !emailRe.test(input.value)) msg = 'Please enter a valid email.';
    if (err) err.textContent = msg;
    input.closest('.field-wrap')?.querySelector('input,textarea')?.setAttribute('aria-invalid', !!msg);
    return !msg;
  }

  function validateForm(form) {
    let valid = true;
    form.querySelectorAll('input[required], textarea[required]').forEach(f => {
      if (!validateField(f)) valid = false;
    });
    return valid;
  }

  function handleSubmit(form, submitBtn, okId) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validateForm(form)) return;

      submitBtn.disabled = true;
      const span = submitBtn.querySelector('span');
      const orig = span?.textContent || '';
      if (span) span.textContent = 'Sending…';

      // Simulate async submit (1.4s)
      await new Promise(r => setTimeout(r, 1400));

      submitBtn.disabled = false;
      if (span) span.textContent = orig;
      form.reset();

      const ok = $('#' + okId);
      if (ok) {
        ok.textContent = '✓ Sent successfully! I\'ll get back to you soon.';
        ok.classList.add('show');
        setTimeout(() => ok.classList.remove('show'), 5000);
      }

      showToast('Message sent! I\'ll get back to you soon.', 'ok');
    });

    // Live validation on blur
    form.querySelectorAll('input, textarea').forEach(f => {
      f.addEventListener('blur', () => validateField(f), { passive: true });
      f.addEventListener('input', () => {
        const err = f.closest('.field')?.querySelector('.field-err');
        if (err?.textContent) validateField(f);
      }, { passive: true });
    });
  }

  const fbForm = $('#fb-form');
  if (fbForm) handleSubmit(fbForm, $('#fb-submit'), 'fb-ok');

  const ctForm = $('#ct-form');
  if (ctForm) handleSubmit(ctForm, $('#ct-submit'), 'ct-ok');
})();

/* ═══════════════════════════════════════════════════════════════
   16.  TOAST SYSTEM
═══════════════════════════════════════════════════════════════ */
function showToast(msg, type = 'ok') {
  const zone = $('#toast-zone');
  if (!zone) return;

  const icons = { ok: 'ph-check-circle', err: 'ph-warning-circle', info: 'ph-info' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="ph-bold ${icons[type] || icons.ok} t-ico" aria-hidden="true"></i><span class="t-msg">${msg}</span>`;
  zone.appendChild(toast);

  const dismiss = () => {
    toast.classList.add('bye');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };

  const timer = setTimeout(dismiss, 4000);
  toast.addEventListener('click', () => { clearTimeout(timer); dismiss(); });
}

/* ═══════════════════════════════════════════════════════════════
   17.  THEME TOGGLE
═══════════════════════════════════════════════════════════════ */
(function initTheme() {
  const btn = $('#theme-toggle');
  const ico = $('#theme-ico');
  if (!btn) return;

  const DARK_ICO  = 'ph-sun-dim';
  const LIGHT_ICO = 'ph-moon';

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('pf-theme', theme);
    if (ico) {
      ico.className = `ph-bold ${theme === 'dark' ? DARK_ICO : LIGHT_ICO}`;
    }
  }

  // Init icon
  applyTheme(document.documentElement.dataset.theme || 'dark');

  btn.addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });
})();

/* ═══════════════════════════════════════════════════════════════
   18.  FOOTER YEAR
═══════════════════════════════════════════════════════════════ */
const yrEl = $('#copy-year');
if (yrEl) yrEl.textContent = new Date().getFullYear();

/* ═══════════════════════════════════════════════════════════════
   19.  BACK TO TOP
═══════════════════════════════════════════════════════════════ */
$('#back-top')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ═══════════════════════════════════════════════════════════════
   20.  SIDE DOT NAVIGATION
═══════════════════════════════════════════════════════════════ */
(function initSideDots() {
  if (window.innerWidth <= 1024) return;

  const sections = $$('main section[id]');
  if (!sections.length) return;

  const nav = document.createElement('nav');
  nav.className = 'side-dots-nav';
  nav.setAttribute('aria-label', 'Section navigation');

  const dots = sections.map(sec => {
    const dot = document.createElement('a');
    dot.className = 'sd-dot';
    dot.href = `#${sec.id}`;
    dot.setAttribute('aria-label', sec.id.charAt(0).toUpperCase() + sec.id.slice(1));
    dot.addEventListener('click', e => {
      e.preventDefault();
      sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    nav.appendChild(dot);
    return { dot, sec };
  });

  document.body.appendChild(nav);

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        dots.forEach(({ dot, sec }) => dot.classList.toggle('on', sec === entry.target));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => io.observe(s));
})();

/* ═══════════════════════════════════════════════════════════════
   21.  KEYBOARD FOCUS GUARD
═══════════════════════════════════════════════════════════════ */
(function initKbGuard() {
  window.addEventListener('keydown', () => document.body.classList.add('kb-mode'), { once: false, passive: true });
  window.addEventListener('mousedown', () => document.body.classList.remove('kb-mode'), { passive: true });
})();

/* ═══════════════════════════════════════════════════════════════
   22.  CONSOLE SIGNATURE
═══════════════════════════════════════════════════════════════ */
console.log(
  '%c{ AK } %cAbhishek Kumar · Software Developer\n%cgithub.com/abhishekkumar',
  'color:#C8FF47;font-family:monospace;font-size:16px;font-weight:700;',
  'color:#EDEAE3;font-family:monospace;font-size:12px;',
  'color:#7A7770;font-family:monospace;font-size:11px;'
);
