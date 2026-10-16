/* ==========================================================================
   HRMS — scattered multi-colour icon plates
   Every .icon-badge gets its own two-colour gradient plate, and no two tiles
   on the page ever share the same pairing: the brand hues are combined into
   unique ordered pairs, so 18 tiles get 18 different blends. Nothing here
   uses Math.random, so the page looks scattered but is identical on every
   reload — same icon, same colours, no flicker. CSS reads --plate/--glow.
   ========================================================================== */
(function () {
  "use strict";

  /* home page brand hues, each with its own soft glow */
  var HUES = [
    { hex: "#6C35FF", glow: "rgba(108, 53, 255, 0.22)" },   // purple
    { hex: "#8B5CF6", glow: "rgba(139, 92, 246, 0.22)" },   // violet
    { hex: "#3B82F6", glow: "rgba(59, 130, 246, 0.22)" },   // blue
    { hex: "#22C7D6", glow: "rgba(34, 199, 214, 0.22)" },   // cyan
    { hex: "#0E8C9B", glow: "rgba(14, 140, 155, 0.22)" },   // teal
    { hex: "#0891B2", glow: "rgba(8, 145, 178, 0.22)" },   // cyan-blue
    { hex: "#6DBE45", glow: "rgba(114, 191, 68, 0.22)" },   // lime
    { hex: "#3E8E2D", glow: "rgba(62, 142, 45, 0.22)" },   // green
    { hex: "#F59E0B", glow: "rgba(245, 158, 11, 0.22)" },   // amber
    { hex: "#F97316", glow: "rgba(249, 115, 22, 0.22)" },   // orange
    { hex: "#EC4899", glow: "rgba(236, 72, 153, 0.22)" },   // pink
    { hex: "#C2410C", glow: "rgba(194, 65, 12, 0.22)" }    // burnt orange
  ];

  /* Build `count` unique two-hue blends. Offsetting by 5 (coprime with the
     12 hues) keeps the blends well spread, and walking the offset on the
     outer loop makes the "from" hue change on every tile instead of running
     ten purples in a row. */
  function buildBlends(count) {
    var blends = [];
    var n = HUES.length;
    for (var k = 1; k < n && blends.length < count; k++) {
      for (var a = 0; a < n && blends.length < count; a++) {
        var b = (a + k * 5) % n;
        if (b === a) continue;
        blends.push([a, b]);
      }
    }
    return blends;
  }

  function init() {
    var badges = document.querySelectorAll(".page-hrms .icon-badge");
    if (!badges.length) return;

    var list = Array.prototype.slice.call(badges);
    var blends = buildBlends(list.length);

    list.forEach(function (badge, i) {
      var blend = blends[i % blends.length];
      var from = HUES[blend[0]];
      var to = HUES[blend[1]];
      badge.style.setProperty("--plate", "linear-gradient(135deg, " + from.hex + " 0%, " + to.hex + " 100%)");
      badge.style.setProperty("--plate-shadow", "0 8px 18px " + to.glow);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
