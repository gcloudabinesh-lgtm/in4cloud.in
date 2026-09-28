/* IN4 Solutions — main interactions: dropdowns, mobile menu, marquee, counters, FAQ */
(function () {
  "use strict";

  /* ---- Dropdown toggles (Company menu) ---- */
  document.querySelectorAll(".has-dropdown > .nav-trigger").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var parent = btn.closest(".has-dropdown");
      var isOpen = parent.classList.contains("open");

      // Close all dropdowns and mega menus
      document.querySelectorAll(".has-dropdown.open, .has-mega.open").forEach(function (el) {
        el.classList.remove("open");
        var trigger = el.querySelector(".nav-trigger");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        parent.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---- Mega menu toggle ---- */
  document.querySelectorAll(".has-mega > .nav-trigger").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var parent = btn.closest(".has-mega");
      var isOpen = parent.classList.contains("open");

      document.querySelectorAll(".has-dropdown.open, .has-mega.open").forEach(function (el) {
        el.classList.remove("open");
        var trigger = el.querySelector(".nav-trigger");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        parent.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* Close menus when clicking outside */
  document.addEventListener("click", function () {
    document.querySelectorAll(".has-dropdown.open, .has-mega.open").forEach(function (el) {
      el.classList.remove("open");
      var trigger = el.querySelector(".nav-trigger");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
  });

  /* Close menus on Escape */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".has-dropdown.open, .has-mega.open").forEach(function (el) {
        el.classList.remove("open");
        var trigger = el.querySelector(".nav-trigger");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      });
      var mm = document.getElementById("mobile-menu");
      if (mm && mm.classList.contains("open")) {
        mm.classList.remove("open");
        mm.setAttribute("aria-hidden", "true");
        var backdrop = document.getElementById("menu-backdrop");
        if (backdrop) backdrop.classList.remove("open");
      }
    }
  });

  /* ---- Mobile menu ---- */
  var navToggle = document.getElementById("nav-toggle");
  var mobileMenu = document.getElementById("mobile-menu");
  var mobileClose = document.getElementById("mobile-close");
  var backdrop = document.getElementById("menu-backdrop");

  function openMobile() {
    if (mobileMenu) {
      mobileMenu.classList.add("open");
      mobileMenu.setAttribute("aria-hidden", "false");
    }
    if (backdrop) backdrop.classList.add("open");
    if (navToggle) navToggle.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeMobile() {
    if (mobileMenu) {
      mobileMenu.classList.remove("open");
      mobileMenu.setAttribute("aria-hidden", "true");
    }
    if (backdrop) backdrop.classList.remove("open");
    if (navToggle) navToggle.classList.remove("open");
    document.body.style.overflow = "";
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      if (mobileMenu && mobileMenu.classList.contains("open")) {
        closeMobile();
      } else {
        openMobile();
      }
    });
  }
  if (mobileClose) mobileClose.addEventListener("click", closeMobile);
  if (backdrop) backdrop.addEventListener("click", closeMobile);

  /* ---- Mobile accordions ---- */
  document.querySelectorAll(".mobile-nav-link.acc-trigger").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      var target = document.getElementById(btn.getAttribute("aria-controls"));
      if (target) target.classList.toggle("open");
    });
  });

  /* ---- Animated counters ---- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1800;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll(".counter-num, .metric-num");
  if ("IntersectionObserver" in window && counters.length) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { counterObserver.observe(c); });
  } else {
    counters.forEach(function (c) {
      var target = c.getAttribute("data-count") || "0";
      var suffix = c.getAttribute("data-suffix") || "";
      c.textContent = target + suffix;
    });
  }

  /* ---- Header scroll state ---- */
  var header = document.getElementById("site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- Back to top ---- */
  var backTop = document.getElementById("back-top");
  if (backTop) {
    window.addEventListener("scroll", function () {
      backTop.classList.toggle("show", window.scrollY > 500);
    }, { passive: true });
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---- Reveal on scroll ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Footer dropdown toggles (mobile) ---- */
  document.querySelectorAll(".foot-trigger").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      if (window.innerWidth > 860) return;
      var expanded = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!expanded));
      var list = trigger.nextElementSibling;
      if (list) {
        list.style.display = expanded ? "none" : "flex";
      }
    });
  });
})();
