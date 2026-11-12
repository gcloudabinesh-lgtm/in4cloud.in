/* IN4 Pro-Visit landing page: header shadow and reading progress on scroll,
   the menu link for the section in view, back to top, mobile menu and
   scroll-in reveals. */
(function () {
  var header = document.querySelector('[data-vl-header]');
  var nav = document.querySelector('[data-vl-nav]');
  var burger = document.querySelector('[data-vl-burger]');

  /* ---- header, reading progress and back to top ---- */
  var bar = document.querySelector('[data-vl-progress]');
  var top = document.querySelector('[data-vl-top]');
  var ring = document.querySelector('[data-vl-ring]');
  var RING = 125.66;              /* circumference of the r=20 circle */
  var ticking = false;

  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, y / max) : 0;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    if (ring) ring.style.strokeDashoffset = (RING * (1 - p)).toFixed(2);
    if (top) top.classList.toggle('is-shown', y > window.innerHeight * 0.6);
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  if (top) {
    top.addEventListener('click', function () {
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      var first = document.querySelector('.vl-logo');
      if (first) first.focus({ preventScroll: true });
    });
  }

  /* ---- the menu link for the section in view ---- */
  var links = nav ? [].slice.call(nav.querySelectorAll('a[href^="#"]')) : [];
  var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  function spy() {
    /* the last section whose top has passed the line below the header */
    var line = 120;
    var current = -1;
    targets.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= line) current = i; });
    /* past the last section's end, nothing is current */
    var last = targets[targets.length - 1];
    if (last && last.getBoundingClientRect().bottom < line) current = -1;
    links.forEach(function (a, i) {
      var on = i === current;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', function () { requestAnimationFrame(spy); }, { passive: true });
  spy();

  /* ---- mobile menu ---- */
  function closeMenu() {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
  }
  if (nav && burger) {
    burger.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---- reveal on scroll (the hero shows straight away) ---- */
  var items = document.querySelectorAll('.vl-head, .vl-compare-col, .vl-step, .vl-card, .vl-console-stage, .vl-split-media, .vl-split-copy, .vl-ind, .vl-security, .vl-price, .vl-faq details, .vl-cta');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  items.forEach(function (el, i) {
    el.classList.add('vl-reveal');
    el.style.transitionDelay = (i % 4) * 60 + 'ms';
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach(function (el) { io.observe(el); });
})();
