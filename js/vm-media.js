/* Visitor Management page: the Real-World Applications photo mosaic highlights
   one venue at a time, in step with the list beside it. Hovering a list row
   picks its venue. */
(function () {
  var tiles = [].slice.call(document.querySelectorAll('.vm-venue'));
  var rows = [].slice.call(document.querySelectorAll('.vm-irow'));
  if (!tiles.length) return;
  var i = 0, paused = false, visible = true;
  var show = function (n) {
    i = n;
    tiles.forEach(function (t, k) { t.classList.toggle('is-on', k === n); });
    rows.forEach(function (r, k) { r.classList.toggle('active', k === n); });
  };
  rows.forEach(function (r, k) {
    r.addEventListener('mouseenter', function () { paused = true; show(k); });
    r.addEventListener('mouseleave', function () { paused = false; });
  });
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { visible = e[e.length - 1].isIntersecting; }).observe(tiles[0].parentNode);
  }
  setInterval(function () {
    if (paused || !visible || document.visibilityState !== 'visible') return;
    show((i + 1) % tiles.length);
  }, 3200);
})();
