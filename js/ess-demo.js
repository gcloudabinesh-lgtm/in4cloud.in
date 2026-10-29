/* Mobile ESS walkthrough — a slider of app screens inside the phone frame.
   Each slide slides in, a finger tap lands on its main control and the
   screen shows the result; then it auto-advances to the next one. The
   matching feature row on the right lights up, and the visitor can swipe
   the phone or click a row to jump to that screen. Hovering the phone
   pauses the slideshow.

   A slide may be built from HTML or be a single real screenshot:
     <div class="ess-screen"><img src="assets/mobile-app/1.png" alt="…"></div>
   Screenshot slides have no tap target, so they simply show and advance. */
(function () {
  var demo = document.querySelector('.ess-demo');
  if (!demo) return;

  var phone = demo.querySelector('.ess-phone');
  var screens = [].slice.call(demo.querySelectorAll('.ess-screen'));
  var tap = demo.querySelector('.ess-tap');
  var steps = [].slice.call(document.querySelectorAll('.ess-step'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* the control the finger taps on each HTML screen */
  var targets = ['.ess-btn-in', '.ess-cta', '.ess-cta', '.ess-goal', '.ess-lang'];

  var STEP_MS = 5200;
  var TAP_AT = 1500;
  var index = 0;
  var timers = [];
  var inView = false;
  var hover = false;

  function clear() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function running() {
    return inView && !hover && !reduce;
  }

  /* tap position in % of the phone, so it stays right at any phone size */
  function placeTap(el) {
    var p = phone.getBoundingClientRect();
    var r = el.getBoundingClientRect();
    tap.style.left = ((r.left - p.left + r.width / 2) / p.width * 100) + '%';
    tap.style.top = ((r.top - p.top + r.height / 2) / p.height * 100) + '%';
  }

  function show(i) {
    clear();
    var prev = index;
    index = (i + screens.length) % screens.length;

    screens.forEach(function (s, n) {
      s.classList.toggle('is-active', n === index);
      s.classList.toggle('is-prev', n === prev && n !== index);
      s.classList.remove('is-done');
    });
    steps.forEach(function (s, n) {
      var on = n === index;
      s.classList.toggle('is-current', on);
      s.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    if (tap) tap.classList.remove('is-tapping');

    var target = targets[index] && screens[index].querySelector(targets[index]);
    if (reduce || !target) {
      screens[index].classList.add('is-done');
    } else {
      timers.push(setTimeout(function () {
        placeTap(target);
        tap.classList.remove('is-tapping');
        void tap.offsetWidth;            /* restart the tap animation */
        tap.classList.add('is-tapping');
        timers.push(setTimeout(function () {
          screens[index].classList.add('is-done');
        }, 320));
      }, TAP_AT));
    }

    if (running()) {
      timers.push(setTimeout(function () { show(index + 1); }, STEP_MS));
    }
  }

  function resume() {
    /* pick the slideshow back up on the current screen */
    if (running()) show(index);
    else clear();
  }

  steps.forEach(function (row, n) {
    row.addEventListener('click', function () { show(n); });
    row.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        show(n);
      }
    });
  });

  /* swipe the phone left / right */
  var x0 = null;
  phone.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  phone.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
  });

  phone.addEventListener('mouseenter', function () { hover = true; resume(); });
  phone.addEventListener('mouseleave', function () { hover = false; resume(); });

  /* play only while the section is on screen */
  show(0);
  if (reduce) return;

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var was = inView;
        inView = e.isIntersecting;
        if (inView !== was) resume();
      });
    }, { threshold: 0.35 }).observe(demo);
  } else {
    inView = true;
    resume();
  }
})();
