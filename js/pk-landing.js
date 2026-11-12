/* IN4 Pro-Parking landing page (parking-landing.html):
   - floating header turns light once the dark hero is behind it, with a
     reading-progress line; the menu link for the section in view is marked
   - mobile menu, back to top (its ring fills as the page scrolls)
   - flow tabs (arrow keys, Home and End move between them)
   - numbers count up and blocks reveal as they scroll into view */
(function () {
  var header = document.querySelector('[data-pl-header]');
  var nav = document.querySelector('[data-pl-nav]');
  var burger = document.querySelector('[data-pl-burger]');
  var bar = document.querySelector('[data-pl-progress]');
  var top = document.querySelector('[data-pl-top]');
  var ring = document.querySelector('[data-pl-ring]');
  var hero = document.querySelector('.pl-hero');
  var RING = 138.2;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- header, progress, back to top, current section ---- */
  var links = nav ? [].slice.call(nav.querySelectorAll('a[href^="#"]')) : [];
  var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var ticking = false;

  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, y / max) : 0;
    if (header && hero) header.classList.toggle('is-light', hero.getBoundingClientRect().bottom < 70);
    if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    if (ring) ring.style.strokeDashoffset = (RING * (1 - p)).toFixed(2);
    if (top) top.classList.toggle('is-shown', y > window.innerHeight * 0.7);

    var line = 130;
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
      var logo = document.querySelector('.pl-logo');
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

  /* ---- flow tabs ---- */
  document.querySelectorAll('[data-pl-tabs]').forEach(function (group) {
    var tabs = [].slice.call(group.querySelectorAll('[role="tab"]'));
    function select(i, focus) {
      tabs.forEach(function (t, n) {
        var on = n === i;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        if (panel) {
          panel.hidden = !on;
          if (on) { panel.classList.remove('is-in'); void panel.offsetWidth; panel.classList.add('is-in'); }
        }
      });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i, false); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = (i + 1) % tabs.length;
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); select(n, true); }
      });
    });
  });

  /* ---- count-ups (the HTML holds the final value) ---- */
  function countUp(el) {
    var to = +el.getAttribute('data-count');
    var pre = el.getAttribute('data-pre') || '';
    var suf = el.getAttribute('data-suf') || '';
    if (reduce || !to) return;
    var t0 = performance.now();
    var dur = 1300;
    (function frame(now) {
      var p = Math.min(1, (now - t0) / dur);
      el.textContent = pre + Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString('en-IN') + suf;
      if (p < 1) requestAnimationFrame(frame);
    })(t0);
  }

  /* ---- "Parking available at" carousel ---- */
  document.querySelectorAll('[data-pl-carousel]').forEach(function (wrap) {
    var track = wrap.querySelector('[data-pl-track]');
    var cards = [].slice.call(track.children);
    var prev = wrap.querySelector('[data-pl-prev]');
    var next = wrap.querySelector('[data-pl-next]');
    var dotsBox = wrap.querySelector('[data-pl-dots]');
    var timer = null;
    var held = false;
    var seen = false;

    function step() { return cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth; }
    function perView() { return Math.max(1, Math.round(track.clientWidth / step())); }
    function pages() { return Math.max(1, cards.length - perView() + 1); }
    function current() { return Math.round(track.scrollLeft / step()); }
    function go(i) {
      var n = pages();
      i = (i + n) % n;
      track.scrollTo({ left: i * step(), behavior: reduce ? 'auto' : 'smooth' });
    }
    function drawDots() {
      var n = pages();
      if (dotsBox.children.length !== n) {
        dotsBox.innerHTML = '';
        for (var k = 0; k < n; k++) dotsBox.appendChild(document.createElement('i'));
      }
      var c = Math.min(current(), n - 1);
      [].forEach.call(dotsBox.children, function (d, k) { d.classList.toggle('is-on', k === c); });
    }
    if (prev) prev.addEventListener('click', function () { go(current() - 1); restart(); });
    if (next) next.addEventListener('click', function () { go(current() + 1); restart(); });
    track.addEventListener('scroll', function () { requestAnimationFrame(drawDots); }, { passive: true });
    window.addEventListener('resize', drawDots);
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(current() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(current() - 1); }
    });

    /* auto-slide while visible and not hovered or focused */
    function sync() {
      var run = seen && !held && !reduce && document.visibilityState === 'visible';
      if (run && !timer) timer = setInterval(function () { go(current() + 1); }, 3500);
      else if (!run && timer) { clearInterval(timer); timer = null; }
    }
    function restart() { if (timer) { clearInterval(timer); timer = null; } sync(); }
    wrap.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { held = true; sync(); } });
    wrap.addEventListener('pointerleave', function () { held = false; sync(); });
    wrap.addEventListener('focusin', function () { held = true; sync(); });
    wrap.addEventListener('focusout', function (e) { if (!wrap.contains(e.relatedTarget)) { held = false; sync(); } });
    document.addEventListener('visibilitychange', sync);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        seen = entries[entries.length - 1].isIntersecting;
        sync();
      }, { threshold: 0.3 }).observe(wrap);
    }
    drawDots();
  });

  /* ---- reveal on scroll ---- */
  var items = document.querySelectorAll('.pl-head, .pl-stop, .pl-tabs, .pl-bay, .pl-dash, .pl-roles li, .pl-photo, .pl-hw-list li, .pl-ticket, .pl-form, .pl-faq details, .pl-footer-cta, .pl-calm, .pl-mess, .pl-row-copy, .pl-mock, .pl-venue-head, .pl-roll li');
  var counts = document.querySelectorAll('[data-count]');
  if (!('IntersectionObserver' in window) || reduce) {
    document.querySelectorAll('.pl-dash').forEach(function (d) { d.classList.add('is-in'); });
    return;
  }
  items.forEach(function (el, i) {
    el.classList.add('pl-reveal');
    el.style.transitionDelay = (i % 4) * 70 + 'ms';
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
  counts.forEach(function (el) { io.observe(el); });
})();
