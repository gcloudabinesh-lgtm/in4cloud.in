/* Home hero, right side: steps the module showcase (css/hero-showcase.css).
   - moves is-active through the module panels; the panel leaving gets is-out
     so it swings away while the next one swings in
   - sets the active module's colour (--c) on the root so the glows, bubbles,
     orbits and card follow it, and restarts the card's shine and progress line
   - counts numbers up when their panel opens (the HTML holds the final value)
   - left / right arrow keys change module while the showcase has focus
   - pauses offscreen and in a hidden tab; while hovered or focused it only
     stops moving on (the open module still finishes animating), keeping the
     time left; with reduced motion it stays on the first module, finished */
(function () {
  var root = document.querySelector('[data-hs]');
  if (!root) return;

  var card = root.querySelector('.hs-card');
  var panels = [].slice.call(root.querySelectorAll('.hs-panel'));
  if (!card || !panels.length) return;

  var STEP = parseFloat(getComputedStyle(root).getPropertyValue('--step')) * 1000 || 4200;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var index = -1;
  var timer = null;
  var startedAt = 0;
  var left = STEP;
  var inView = true;
  var held = false;
  var outTimer = null;

  /* ---- count-ups ---- */
  var counters = [];
  var frames = [];

  function format(n, el) {
    var pad = +(el.getAttribute('data-pad') || 0);
    var s = Math.round(n).toString();
    if (el.hasAttribute('data-inr')) {
      /* Indian grouping: 28,45,250 */
      var last3 = s.slice(-3);
      var rest = s.slice(0, -3);
      s = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3 : last3;
    }
    while (s.length < pad) s = '0' + s;
    return (el.getAttribute('data-pre') || '') + s + (el.getAttribute('data-suf') || '');
  }

  function stopCounters() {
    counters.forEach(clearTimeout);
    frames.forEach(cancelAnimationFrame);
    counters = [];
    frames = [];
  }

  function runCounters(panel) {
    stopCounters();
    panel.querySelectorAll('[data-to]').forEach(function (el) {
      var to = +el.getAttribute('data-to');
      var from = +(el.getAttribute('data-from') || 0);
      var dur = +(el.getAttribute('data-dur') || 1200);
      var delay = +(el.getAttribute('data-delay') || 200);
      el.textContent = format(from, el);
      counters.push(setTimeout(function () {
        var t0 = performance.now();
        (function frame(now) {
          var p = Math.min(1, (now - t0) / dur);
          el.textContent = format(from + (to - from) * (1 - Math.pow(1 - p, 3)), el);
          if (p < 1) frames.push(requestAnimationFrame(frame));
        })(t0);
      }, delay));
    });
  }

  function finishCounters(panel) {
    stopCounters();
    panel.querySelectorAll('[data-to]').forEach(function (el) {
      el.textContent = format(+el.getAttribute('data-to'), el);
    });
  }

  /* restart a CSS animation tied to a class */
  function replay(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  /* ---- stepping ---- */
  function show(i) {
    var next = (i + panels.length) % panels.length;
    var prev = index;
    index = next;

    clearTimeout(outTimer);
    panels.forEach(function (p) { p.classList.remove('is-out'); });
    if (prev >= 0 && prev !== next && !reduce.matches) {
      panels[prev].classList.add('is-out');
      outTimer = setTimeout(function () { panels[prev].classList.remove('is-out'); }, 800);
    }

    root.style.setProperty('--c', panels[next].style.getPropertyValue('--c'));
    panels.forEach(function (p, n) {
      var on = n === next;
      if (on) p.classList.remove('is-active');
      p.setAttribute('aria-hidden', on ? 'false' : 'true');
      if (!on) p.classList.remove('is-active');
    });
    void panels[next].offsetWidth;
    panels[next].classList.add('is-active');
    replay(card, 'is-swap');

    if (reduce.matches) finishCounters(panels[next]);
    else runCounters(panels[next]);
    left = STEP;
  }

  function running() {
    return inView && !held && document.visibilityState === 'visible' && !reduce.matches;
  }

  function tick() {
    timer = null;
    show(index + 1);
    sync();
  }

  function sync() {
    var run = running();
    /* offscreen or hidden: freeze everything; held (hover/focus): only the
       progress line stops, so the open module still finishes animating */
    root.classList.toggle('is-paused', !(inView && document.visibilityState === 'visible'));
    root.classList.toggle('is-held', held);
    if (run && !timer) {
      startedAt = Date.now();
      timer = setTimeout(tick, left);
    } else if (!run && timer) {
      clearTimeout(timer);
      timer = null;
      left = Math.max(400, left - (Date.now() - startedAt));
    }
  }

  function go(i) {
    if (timer) { clearTimeout(timer); timer = null; }
    show(i);
    sync();
  }

  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
  });

  /* hold while someone is reading */
  root.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { held = true; sync(); } });
  root.addEventListener('pointerleave', function () { held = false; sync(); });
  root.addEventListener('focusin', function () { held = true; sync(); });
  root.addEventListener('focusout', function (e) {
    if (!root.contains(e.relatedTarget)) { held = false; sync(); }
  });

  document.addEventListener('visibilitychange', sync);
  reduce.addEventListener('change', function () { go(reduce.matches ? 0 : index); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      /* several changes can arrive in one batch: the last one is current */
      inView = entries[entries.length - 1].isIntersecting;
      sync();
    }).observe(root);
  }

  show(0);
  sync();
})();
