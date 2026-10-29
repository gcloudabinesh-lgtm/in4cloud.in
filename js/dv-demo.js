/* Device Setup laptop — the screen inside the laptop auto-slides through one
   view per capability, updates the breadcrumb, and softly marks the matching
   item in the list beside it. Runs only while the section is on screen. */
(function () {
  var stage = document.querySelector('.dv-stage');
  if (!stage) return;

  var slides = [].slice.call(stage.querySelectorAll('.dv-slide'));
  var crumb = stage.querySelector('.dv-crumb');
  var steps = [].slice.call(document.querySelectorAll('.dv-step'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var STEP_MS = 3200;
  var index = 0;
  var timer = null;

  function show(i) {
    var prev = index;
    index = (i + slides.length) % slides.length;

    slides.forEach(function (s, n) {
      s.classList.toggle('is-active', n === index);
      s.classList.toggle('is-prev', n === prev && n !== index);
    });
    steps.forEach(function (s, n) { s.classList.toggle('is-current', n === index); });

    var b = steps[index] && steps[index].querySelector('b');
    if (crumb && b) crumb.textContent = b.textContent;
  }

  function start() {
    if (timer || reduce) return;
    timer = setInterval(function () { show(index + 1); }, STEP_MS);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
  }

  show(0);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) start(); else stop(); });
    }, { threshold: 0.2 }).observe(stage);
  } else {
    start();
  }
})();
