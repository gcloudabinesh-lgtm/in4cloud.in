/* Home hero, right side: moves is-active through the six modules, adds a very
   light pointer parallax, and stops everything while the hero is offscreen or
   the tab is hidden. With reduced motion the Attendance view stays as a still. */
(function () {
  var root = document.querySelector('.hx');
  if (!root) return;

  var STEP = 2400;
  var COUNT = 6;
  var parts = root.querySelectorAll('[data-m]');
  var links = root.querySelector('.hx-links');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var index = 0;
  var timer = null;
  var inView = true;

  function setActive(i) {
    index = i;
    parts.forEach(function (el) {
      el.classList.toggle('is-active', +el.getAttribute('data-m') === i);
    });
  }

  function sync() {
    var run = inView && document.visibilityState === 'visible' && !reduce.matches;
    root.classList.toggle('is-paused', !run);
    if (links) {
      if (run) links.unpauseAnimations();
      else links.pauseAnimations();
    }
    if (run && !timer) {
      timer = setInterval(function () { setActive((index + 1) % COUNT); }, STEP);
    } else if (!run && timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  document.addEventListener('visibilitychange', sync);
  reduce.addEventListener('change', function () {
    if (reduce.matches) setActive(0);
    sync();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      sync();
    }).observe(root);
  }
  sync();

  /* Pointer parallax: desktop mouse only */
  var desktop = window.matchMedia('(min-width: 1200px) and (hover: hover) and (pointer: fine)');
  var layers = [].map.call(root.querySelectorAll('[data-depth]'), function (el) {
    return { el: el, depth: +el.getAttribute('data-depth') };
  });
  var hero = root.closest('.hero') || root;
  var tx = 0;
  var ty = 0;
  var x = 0;
  var y = 0;
  var frame = 0;

  function tick() {
    x += (tx - x) * 0.08;
    y += (ty - y) * 0.08;
    var settled = Math.abs(tx - x) < 0.002 && Math.abs(ty - y) < 0.002;
    if (settled) { x = tx; y = ty; }
    layers.forEach(function (l) {
      l.el.style.transform = 'translate3d(' + (x * l.depth).toFixed(2) + 'px,' + (y * l.depth).toFixed(2) + 'px,0)';
    });
    frame = settled ? 0 : requestAnimationFrame(tick);
  }

  function aim(nx, ny) {
    tx = nx;
    ty = ny;
    if (!frame) frame = requestAnimationFrame(tick);
  }

  hero.addEventListener('pointermove', function (e) {
    if (!desktop.matches || reduce.matches || e.pointerType !== 'mouse') return;
    var r = hero.getBoundingClientRect();
    aim(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2);
  });
  hero.addEventListener('pointerleave', function () { aim(0, 0); });
})();
