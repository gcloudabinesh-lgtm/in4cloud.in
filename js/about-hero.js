/* About hero: the office walk-through plays muted behind the headline. With
   reduced motion it stays on its poster frame, and it pauses while offscreen. */
(function () {
  var video = document.querySelector('.ab-hero-video');
  if (!video) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var inView = true;

  function sync() {
    if (reduce.matches || !inView) {
      video.pause();
    } else {
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    }
  }

  reduce.addEventListener('change', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      sync();
    }).observe(video);
  }
  sync();
})();
