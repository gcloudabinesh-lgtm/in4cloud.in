/* ==========================================================================
   Book a Demo popup — behaviour
   Any element carrying [data-demo-open] opens the dialog instead of following
   its href (the href stays put, so the link still works without JavaScript).
   The form inside is handed to window.IN4LeadForms() from js/lead.js, so it
   reuses the site's validation, honeypot and submission handling.
   ========================================================================== */
(function () {
  "use strict";

  var modal = null;
  var panel = null;
  var lastFocused = null;

  function buildModal() {
    if (modal) return;

    modal = document.createElement("div");
    modal.className = "demo-modal";
    modal.id = "demo-modal";
    modal.hidden = true;
    modal.innerHTML =
      '<div class="demo-modal__backdrop" data-demo-close></div>' +
      '<div class="demo-modal__panel" role="dialog" aria-modal="true" aria-labelledby="demo-modal-title">' +
        '<div class="demo-modal__head">' +
          "<div>" +
            '<h2 id="demo-modal-title">Book a Demo</h2>' +
            "<p>Tell us about your setup and we&rsquo;ll walk you through the module that fits.</p>" +
          "</div>" +
          '<button class="demo-modal__close" type="button" data-demo-close aria-label="Close dialog">' +
            '<i class="ico fa-solid fa-xmark" aria-hidden="true"></i>' +
          "</button>" +
        "</div>" +
        '<div class="demo-modal__body">' +
          '<form class="lead-form" data-lead-form novalidate>' +
            '<label class="hp-field" for="hp-demo-1" aria-hidden="true">Website</label>' +
            '<input class="hp-field" id="hp-demo-1" name="website" data-hp tabindex="-1" autocomplete="off" aria-hidden="true">' +
            '<input type="hidden" name="pageSource" value="Demo popup">' +
            '<div class="form-grid">' +
              '<div class="form-field">' +
                '<label for="demo-fullName">Full Name <span class="req">*</span></label>' +
                '<input class="form-input" id="demo-fullName" name="fullName" type="text" autocomplete="name" placeholder="e.g. Meera Iyer" required>' +
                '<span class="form-error" data-error-for="fullName" role="alert"></span>' +
              "</div>" +
              '<div class="form-field">' +
                '<label for="demo-company">Company <span class="req">*</span></label>' +
                '<input class="form-input" id="demo-company" name="company" type="text" autocomplete="organization" placeholder="e.g. Acme Corp" required>' +
                '<span class="form-error" data-error-for="company" role="alert"></span>' +
              "</div>" +
              '<div class="form-field">' +
                '<label for="demo-phone">Phone <span class="req">*</span></label>' +
                '<input class="form-input" id="demo-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="e.g. +91 98765 43210" required>' +
                '<span class="form-error" data-error-for="phone" role="alert"></span>' +
              "</div>" +
              '<div class="form-field">' +
                '<label for="demo-email">Work Email <span class="req">*</span></label>' +
                '<input class="form-input" id="demo-email" name="email" type="email" autocomplete="email" placeholder="you@company.com" required>' +
                '<span class="form-error" data-error-for="email" role="alert"></span>' +
              "</div>" +
              '<div class="form-field span-2">' +
                '<label for="demo-message">What would you like to see? <span class="optional">(optional)</span></label>' +
                '<textarea class="form-input" id="demo-message" name="message" placeholder="e.g. 3 sites, 500 employees, interested in attendance and payroll…"></textarea>' +
              "</div>" +
            "</div>" +
            '<button type="submit" class="btn btn-primary btn-lg btn-block" data-submit style="margin-top:20px">Request Demo<i class="ico fa-solid fa-arrow-right" aria-hidden="true"></i></button>' +
            '<div class="form-status" data-lead-status aria-live="polite"></div>' +
            '<p class="form-note"><i class="ico fa-solid fa-circle-check" aria-hidden="true"></i><span>We respect your privacy. Your details will only be used to respond to your enquiry.</span></p>' +
          "</form>" +
        "</div>" +
      "</div>";

    document.body.appendChild(modal);
    panel = modal.querySelector(".demo-modal__panel");

    // Hand the form to the shared lead handler (exported by js/lead.js).
    if (typeof window.IN4LeadForms === "function") {
      window.IN4LeadForms(modal.querySelector("[data-lead-form]"));
    }

    modal.addEventListener("click", function (event) {
      if (event.target.closest("[data-demo-close]")) close();
    });
  }

  function open() {
    buildModal();
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("demo-modal-open");
    var first = modal.querySelector("input:not([data-hp])");
    if (first) first.focus({ preventScroll: true });
  }

  function close() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("demo-modal-open");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  // One delegated listener covers the header CTA, the mobile menu button and
  // the sticky CTA, all of which shell.js injects with [data-demo-open].
  document.addEventListener("click", function (event) {
    var trigger = event.target.closest("[data-demo-open]");
    if (!trigger) return;
    event.preventDefault();
    open();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") close();
  });

  // Expose for debugging / programmatic use.
  window.IN4DemoModal = { open: open, close: close };
})();