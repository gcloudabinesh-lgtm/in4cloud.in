/* Attendance marking methods: the square cards slide one step every 2s and
   rewind at the end. Pauses while hovered, focused, touched, offscreen or in
   a hidden tab; with reduced motion it never moves on its own. The dots under
   the row jump to a position. */
(function () {
  var track = document.querySelector('[data-am-slider]');
  if (!track) return;

  var DELAY = 2000;
  var cards = [].slice.call(track.children);
  var dotsWrap = document.querySelector('[data-am-dots]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var dots = [];
  var timer = null;
  var hold = false;
  var inView = true;

  function step() {
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return cards[0].getBoundingClientRect().width + gap;
  }

  function lastIndex() {
    return Math.max(0, Math.round((track.scrollWidth - track.clientWidth) / step()));
  }

  function current() {
    return Math.min(lastIndex(), Math.round(track.scrollLeft / step()));
  }

  function go(i) {
    track.scrollTo({ left: i * step(), behavior: reduce.matches ? 'auto' : 'smooth' });
  }

  function buildDots() {
    if (!dotsWrap) return;
    var count = lastIndex() + 1;
    if (count === dots.length) return;
    dotsWrap.innerHTML = '';
    dots = [];
    for (var i = 0; i < count; i++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'am-dot';
      b.setAttribute('aria-label', 'Show attendance method ' + (i + 1));
      b.addEventListener('click', go.bind(null, i));
      dotsWrap.appendChild(b);
      dots.push(b);
    }
    dotsWrap.hidden = count < 2;
    mark();
  }

  function mark() {
    var on = current();
    dots.forEach(function (d, i) {
      d.classList.toggle('is-active', i === on);
      d.setAttribute('aria-current', i === on ? 'true' : 'false');
    });
  }

  function sync() {
    var run = !hold && inView && document.visibilityState === 'visible' && !reduce.matches;
    if (run && !timer) {
      timer = setInterval(function () {
        var i = current();
        go(i >= lastIndex() ? 0 : i + 1);
      }, DELAY);
    } else if (!run && timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function pause() { hold = true; sync(); }
  function resume() { hold = false; sync(); }

  var frame = 0;
  track.addEventListener('scroll', function () {
    if (frame) return;
    frame = requestAnimationFrame(function () { frame = 0; mark(); });
  }, { passive: true });

  track.addEventListener('mouseenter', pause);
  track.addEventListener('mouseleave', resume);
  track.addEventListener('focusin', pause);
  track.addEventListener('focusout', resume);
  track.addEventListener('touchstart', pause, { passive: true });
  track.addEventListener('touchend', function () { setTimeout(resume, 2500); });
  document.addEventListener('visibilitychange', sync);
  reduce.addEventListener('change', sync);
  window.addEventListener('resize', buildDots);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      sync();
    }).observe(track);
  }

  buildDots();
  sync();
})();
