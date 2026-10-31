/* ESS Mobile App — the app recording inside the phone screen.
   The clip is ~10 MB, so it only starts downloading when the phone scrolls
   near the viewport, then plays muted on a loop and pauses off-screen. With
   reduced motion the poster frame stays as a still. */
(function () {
  var video = document.querySelector('.ma-video[data-src]');
  if (!video) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function load() {
    if (!video.getAttribute('src')) {
      video.src = video.getAttribute('data-src');
      video.preload = 'auto';
    }
  }

  function play() {
    load();
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  if (!('IntersectionObserver' in window)) { play(); return; }

  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) play();
      else if (video.getAttribute('src')) video.pause();
    });
  }, { rootMargin: '200px 0px' }).observe(video);
})();
