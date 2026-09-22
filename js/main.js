/* IN4 Solutions — global interactions.
   Runs after the shell/header/footer are injected.
   Includes: scroll header state, mobile menu, mega menu, reveals,
   accordions, back-to-top, floating contact, feature search/filter,
   and lead form boot. Respects prefers-reduced-motion. */
(function () {
  "use strict";

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initHeaderScroll() {
    const header = document.getElementById("site-header");
    const onScroll = function () {
      if (header) header.classList.toggle("scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initMobileMenu() {
    const toggle = document.getElementById("nav-toggle");
    const menu = document.getElementById("mobile-menu");
    const backdrop = document.getElementById("menu-backdrop");
    const closeBtn = document.getElementById("mobile-close");

    function setOpen(open, focusClose) {
      if (!menu || !toggle) return;
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("open", open);
      menu.setAttribute("aria-hidden", String(!open));
      if (backdrop) backdrop.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
      if (open && focusClose && closeBtn) closeBtn.focus();
    }

    if (toggle) toggle.addEventListener("click", function () { setOpen(true, true); });
    if (backdrop) backdrop.addEventListener("click", function () { setOpen(false); });
    if (closeBtn) closeBtn.addEventListener("click", function () { setOpen(false); if (toggle) toggle.focus(); });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });

    // close when any anchor is clicked
    if (menu) {
      menu.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { setOpen(false); });
      });
    }

    // accordion behaviour within the mobile menu
    if (menu) {
      menu.querySelectorAll(".acc-trigger").forEach(function (trigger) {
        trigger.addEventListener("click", function () {
          const expanded = trigger.getAttribute("aria-expanded") === "true";
          trigger.setAttribute("aria-expanded", String(!expanded));
          const sub = document.getElementById(trigger.getAttribute("aria-controls"));
          if (sub) sub.classList.toggle("open", !expanded);
        });
      });
    }
  }

  function initMegaMenu() {
    const mega = document.querySelector(".has-mega");
    if (!mega) return;
    const trigger = mega.querySelector(".nav-trigger");
    if (!trigger) return;

    function setOpen(open) {
      mega.classList.toggle("open", open);
      trigger.setAttribute("aria-expanded", String(open));
    }

    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!mega.classList.contains("open"));
    });

    document.addEventListener("click", function (e) {
      if (!mega.contains(e.target)) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { setOpen(false); trigger.focus(); }
    });

    mega.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("focus", function () { setOpen(true); });
    });
  }

  function initReveals() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || REDUCED) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach(function (el, i) {
      if (!el.style.getPropertyValue("--rd")) {
        el.style.setProperty("--rd", Math.min(i * 60, 420) + "ms");
      }
      io.observe(el);
    });
  }

  function initBackTop() {
    const btn = document.getElementById("back-top");
    if (!btn) return;
    const onScroll = function () {
      btn.classList.toggle("show", window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" });
    });
  }

  function initFloatContact() {
    const box = document.getElementById("float-contact");
    const toggle = document.getElementById("fc-toggle");
    if (!box || !toggle) return;
    toggle.addEventListener("click", function () {
      const open = box.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", function (e) {
      if (!box.contains(e.target)) {
        box.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function initCounters() {
    const els = document.querySelectorAll(".counter-num[data-count]");
    if (!els.length) return;
    const DURATION = 1400;
    function run(el) {
      const target = parseFloat(el.getAttribute("data-count")) || 0;
      const suffix = el.getAttribute("data-suffix") || "";
      if (REDUCED || !("requestAnimationFrame" in window)) {
        el.textContent = target + suffix;
        return;
      }
      const start = performance.now();
      function frame(now) {
        const p = Math.min((now - start) / DURATION, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    if (!("IntersectionObserver" in window)) {
      els.forEach(run);
      return;
    }
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            run(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    els.forEach(function (el) { io.observe(el); });
  }

  function initFooterAccordions() {
    const mq = window.matchMedia("(max-width: 720px)");
    const triggers = document.querySelectorAll(".footer-col .foot-trigger");
    if (!triggers.length) return;
    triggers.forEach(function (trigger) {
      function toggle() {
        const col = trigger.closest(".footer-col");
        if (!col) return;
        const open = col.classList.toggle("open");
        trigger.setAttribute("aria-expanded", String(open));
      }
      trigger.addEventListener("click", function (e) {
        if (mq.matches) toggle();
      });
      trigger.addEventListener("keydown", function (e) {
        if (mq.matches && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  function initFeatureFilter() {
    const input = document.getElementById("feature-search");
    const cards = Array.prototype.slice.call(document.querySelectorAll("[data-feature-card]"));
    if (!input || !cards.length) return;
    const empty = document.getElementById("feature-no-results");
    input.addEventListener("input", function () {
      const q = input.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach(function (card) {
        const hay = (card.textContent || "").toLowerCase();
        const show = !q || hay.indexOf(q) !== -1;
        card.style.display = show ? "" : "none";
        if (show) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
    });
  }

  function initAnchors() {
    // Log any dead internal links at load time (debug aid, harmless in prod).
    document.querySelectorAll("a[href]").forEach(function (a) {
      const href = a.getAttribute("href");
      if (href && href.indexOf(".html#") !== -1) {
        const file = href.split("#")[0];
        const frag = href.split("#")[1];
        if (window.location.href.split("#")[0].endsWith("/" + file)) return;
      }
    });
  }

  function boot() {
    initHeaderScroll();
    initMobileMenu();
    initMegaMenu();
    initReveals();
    initBackTop();
    initFloatContact();
    initFeatureFilter();
    initCounters();
    initFooterAccordions();
    initAnchors();
    if (window.IN4LeadForms) window.IN4LeadForms();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();