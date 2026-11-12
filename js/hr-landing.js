/* IN4 CloudHR HRMS landing page (hrms-landing.html):
   - header shadow, reading progress, the menu link for the section in view
   - mobile menu and back to top (its outline fills as the page scrolls)
   - the hire-to-retire ring: click, arrow keys or prev / next; it moves on
     by itself while in view, and holds while hovered or focused
   - the phone cycles its app screens; numbers count up; blocks reveal
   Reduced motion: no automatic movement, everything shown finished. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.querySelector('[data-hl-header]');
  var nav = document.querySelector('[data-hl-nav]');
  var burger = document.querySelector('[data-hl-burger]');
  var bar = document.querySelector('[data-hl-progress]');
  var top = document.querySelector('[data-hl-top]');
  var ring = document.querySelector('[data-hl-ring]');

  /* ---- header, progress, back to top, current section ---- */
  var links = nav ? [].slice.call(nav.querySelectorAll('a[href^="#"]')) : [];
  var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, y / max) : 0;
    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    if (ring) ring.style.strokeDashoffset = (100 * (1 - p)).toFixed(2);
    if (top) top.classList.toggle('is-shown', y > window.innerHeight * 0.7);
    var line = 140;
    var current = -1;
    targets.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= line) current = i; });
    var last = targets[targets.length - 1];
    if (last && last.getBoundingClientRect().bottom < line) current = -1;
    links.forEach(function (a, i) {
      var on = i === current;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  if (top) {
    top.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      var logo = document.querySelector('.hl-logo');
      if (logo) logo.focus({ preventScroll: true });
    });
  }

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
    links.forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !burger.contains(e.target)) closeMenu();
    });
  }

  /* ---- hire-to-retire ring ---- */
  var cycle = document.querySelector('[data-hl-cycle]');
  if (cycle) {
    var nodes = [].slice.call(cycle.querySelectorAll('.hl-node'));
    var stages = nodes.map(function (n) { return document.getElementById(n.getAttribute('aria-controls')); });
    var coreIco = cycle.querySelector('[data-hl-core-ico]');
    var coreName = cycle.querySelector('[data-hl-core-name]');
    var count = cycle.querySelector('[data-hl-count]');
    var index = 0;
    var timer = null;
    var held = false;
    var visible = false;

    function select(i, focus) {
      index = (i + nodes.length) % nodes.length;
      nodes.forEach(function (n, k) {
        var on = k === index;
        n.setAttribute('aria-selected', on ? 'true' : 'false');
        n.tabIndex = on ? 0 : -1;
        if (stages[k]) { stages[k].classList.toggle('is-on', on); stages[k].hidden = !on; }
      });
      var node = nodes[index];
      if (coreIco) coreIco.className = node.getAttribute('data-ico');
      if (coreName) coreName.textContent = node.querySelector('span').textContent;
      if (count) count.textContent = (index + 1) + ' / ' + nodes.length;
      if (focus) node.focus();
    }
    function sync() {
      var run = visible && !held && !reduce && document.visibilityState === 'visible';
      if (run && !timer) timer = setInterval(function () { select(index + 1, false); }, 4200);
      else if (!run && timer) { clearInterval(timer); timer = null; }
    }
    function restart() { if (timer) { clearInterval(timer); timer = null; } sync(); }

    nodes.forEach(function (n, k) {
      n.addEventListener('click', function () { select(k, false); restart(); });
      n.addEventListener('keydown', function (e) {
        var to = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = index + 1;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = index - 1;
        else if (e.key === 'Home') to = 0;
        else if (e.key === 'End') to = nodes.length - 1;
        if (to !== null) { e.preventDefault(); select(to, true); }
      });
    });
    var prev = cycle.querySelector('[data-hl-prev]');
    var next = cycle.querySelector('[data-hl-next]');
    if (prev) prev.addEventListener('click', function () { select(index - 1, false); restart(); });
    if (next) next.addEventListener('click', function () { select(index + 1, false); restart(); });
    cycle.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { held = true; sync(); } });
    cycle.addEventListener('pointerleave', function () { held = false; sync(); });
    cycle.addEventListener('focusin', function () { held = true; sync(); });
    cycle.addEventListener('focusout', function (e) { if (!cycle.contains(e.relatedTarget)) { held = false; sync(); } });
    document.addEventListener('visibilitychange', sync);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[entries.length - 1].isIntersecting;
        sync();
      }).observe(cycle);
    }
    select(0, false);
  }

  /* ---- phone: cycle the app screens ---- */
  var shots = [].slice.call(document.querySelectorAll('[data-hl-shots] img'));
  if (shots.length > 1 && !reduce) {
    var s = 0;
    setInterval(function () {
      if (document.visibilityState !== 'visible') return;
      shots[s].classList.remove('is-on');
      s = (s + 1) % shots.length;
      shots[s].classList.add('is-on');
    }, 3200);
  }

  /* ---- count-ups (the HTML holds the final value) ---- */
  function countUp(el) {
    var to = +el.getAttribute('data-count');
    var suf = el.getAttribute('data-suf') || '';
    if (!to) return;
    var t0 = performance.now();
    (function frame(now) {
      var p = Math.min(1, (now - t0) / 1400);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString('en-IN') + suf;
      if (p < 1) requestAnimationFrame(frame);
    })(t0);
  }

  /* ---- reveal on scroll ---- */
  if (!('IntersectionObserver' in window) || reduce) return;
  var items = document.querySelectorAll('.hl-head, .hl-ring, .hl-stages, .hl-col, .hl-method, .hl-ess-col li, .hl-phone, .hl-plan, .hl-hub, .hl-int-list div, .hl-faq details, .hl-cta');
  items.forEach(function (el, i) {
    el.classList.add('hl-reveal');
    el.style.transitionDelay = (i % 3) * 80 + 'ms';
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      if (e.target.hasAttribute('data-count')) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach(function (el) { io.observe(el); });
  document.querySelectorAll('[data-count]').forEach(function (el) { io.observe(el); });
})();
