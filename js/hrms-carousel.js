/* ==========================================================================
   Product screenshot carousel — HRMS page
   Any [data-carousel] whose slides are [data-carousel] > viewport > .hr-carousel-slide
   Autoplays, cross-fades with a rise + slow drift, pauses on hover/focus,
   is keyboard operable and stops completely under prefers-reduced-motion.
   No dependencies: the page's own CSS owns the animation.
   ========================================================================== */
(function () {
  "use strict";

  var SLIDE_SELECTOR = ".hr-carousel-slide";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function buildCarousel(root) {
    var viewport = root.querySelector(".hr-carousel-viewport");
    var dotsWrap = root.querySelector(".hr-carousel-dots");
    if (!viewport) return;

    var slides = Array.prototype.slice.call(viewport.querySelectorAll(SLIDE_SELECTOR));
    if (slides.length < 2) return;

    var interval = parseInt(root.getAttribute("data-interval"), 10) || 6000;
    var index = 0;
    var timer = null;
    var dots = [];

    root.style.setProperty("--interval", interval + "ms");
    slides.forEach(function (slide, i) { slide.style.setProperty("--drift", Math.round(interval * 1.5) + "ms"); });

    /* ---- frame shape follows the slide on screen ---------------------
       Publishes each shot's intrinsic ratio as --ar so the viewport can
       resize to the image instead of letterboxing it. */
    function ratioFor(slide) {
      var img = slide.querySelector("img");
      if (!img) return;
      var publish = function () {
        if (img.naturalWidth && img.naturalHeight) {
          viewport.style.setProperty("--ar", img.naturalWidth + " / " + img.naturalHeight);
        }
      };
      if (img.complete && img.naturalWidth) publish();
      else img.addEventListener("load", publish, { once: true });
    }

    slides.forEach(ratioFor);

    /* ---- dots ------------------------------------------------------- */
    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "hr-carousel-dot" + (i === 0 ? " is-active" : "");
        b.setAttribute("role", "tab");
        b.setAttribute("aria-label", "Show screen " + (i + 1) + " of " + slides.length);
        b.setAttribute("aria-selected", i === 0 ? "true" : "false");
        b.addEventListener("click", function () { go(i, true); });
        dotsWrap.appendChild(b);
        dots.push(b);
      });
    }

    /* ---- slide change ----------------------------------------------- */
    function go(next, userDriven) {
      var from = index;
      index = (next + slides.length) % slides.length;
      if (index === from && userDriven) return;

      slides.forEach(function (slide, i) {
        var active = i === index;
        slide.classList.toggle("is-active", active);
        slide.classList.toggle("is-previous", !active && i === from);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
        if (active) { slide.removeAttribute("inert"); ratioFor(slide); }
        else slide.setAttribute("inert", "");
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
        dot.setAttribute("aria-selected", i === index ? "true" : "false");
        /* restart the progress fill on the dot that just became active */
        if (i === index) {
          dot.style.animation = "none";
          void dot.offsetWidth;
          dot.style.animation = "";
        }
      });

      restart();
    }

    /* ---- autoplay ---------------------------------------------------- */
    function play() {
      if (reduce.matches || timer) return;
      timer = setInterval(function () { go(index + 1, false); }, interval);
    }

    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    function restart() { stop(); play(); }

    /* pause while the reader is looking at it, or has focus inside */
    root.addEventListener("mouseenter", function () { root.classList.add("is-paused"); stop(); });
    root.addEventListener("mouseleave", function () { root.classList.remove("is-paused"); play(); });
    root.addEventListener("focusin", function () { root.classList.add("is-paused"); stop(); });
    root.addEventListener("focusout", function () { root.classList.remove("is-paused"); play(); });

    /* never autoplay in a background tab — it jumps when you come back */
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else if (!root.matches(":hover") && !root.contains(document.activeElement)) play();
    });

    /* keyboard: arrows + home/end */
    root.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = index + 1;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = index - 1;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = slides.length - 1;
      if (next === null) return;
      e.preventDefault();
      go(next, true);
    });

    root.tabIndex = 0;
    root.setAttribute("aria-label", (root.getAttribute("aria-label") || "Product screens") + " — use the left and right arrow keys to change screen");

    if (reduce.addEventListener) {
      reduce.addEventListener("change", function () {
        root.classList.toggle("is-paused", reduce.matches);
        restart();
      });
    }

    play();
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-carousel]"), buildCarousel);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
