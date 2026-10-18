/* ==========================================================================
   HRMS — icon plates in the page's dual brand gradient
   The section titles carry one accent phrase in the purple → violet → teal
   gradient, and the icon tiles now repeat exactly that gradient so the page
   reads as a single colour system. CSS reads --plate / --plate-shadow.
   ========================================================================== */
(function () {
  "use strict";

  /* same gradient as .section-title em.hr-dual in css/hrms.css */
  var PLATE = "linear-gradient(96deg, #6C35FF 0%, #8B5CF6 46%, #0E8C9B 100%)";
  var SHADOW = "0 8px 18px rgba(108, 53, 255, 0.22)";

  function init() {
    var badges = document.querySelectorAll(".page-hrms .icon-badge");
    if (!badges.length) return;

    Array.prototype.forEach.call(badges, function (badge) {
      badge.style.setProperty("--plate", PLATE);
      badge.style.setProperty("--plate-shadow", SHADOW);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
