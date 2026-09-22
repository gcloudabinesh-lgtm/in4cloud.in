(function () {
  var st = document.createElement("style");
  st.textContent = "*,*::before,*::after{transition:none!important;animation:none!important;scroll-behavior:auto!important}.reveal,.is-visible{opacity:1!important;transform:none!important}";
  (document.head || document.documentElement).appendChild(st);

  function run() {
    var R = {};
    var $ = function (s) { return document.querySelector(s); };
    var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
    var rect = function (el) {
      if (!el) return null;
      var b = el.getBoundingClientRect();
      return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), top: Math.round(b.top), l: Math.round(b.left), r: Math.round(b.right), btm: Math.round(b.bottom) };
    };

    R.viewport = { innerWidth: innerWidth, innerHeight: innerHeight, docScrollW: document.documentElement.scrollWidth };

    R.overflowEls = [];
    $$("body *").forEach(function (el) {
      var b = el.getBoundingClientRect();
      var cs = getComputedStyle(el);
      if (b.right > innerWidth + 1 || b.left < -1) {
        if (R.overflowEls.length < 30) {
          R.overflowEls.push({ tag: el.tagName, cls: String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className).slice(0, 50), pos: cs.position, l: Math.round(b.left), r: Math.round(b.right) });
        }
      }
    });

    var hd = $(".header-inner");
    var hdR = rect(hd);
    var hc = hdR.top + hdR.h / 2;
    var logoR = rect($(".site-header .logo-mark"));
    var navR = rect($(".site-header .nav"));
    var actR = rect($(".site-header .header-actions"));
    R.header = {
      innerH: hdR.h,
      logo: logoR,
      nav: navR,
      actions: actR,
      logoCenterOff: logoR ? Math.round(logoR.top + logoR.h / 2 - hc) : null,
      navCenterOff: navR ? Math.round(navR.top + navR.h / 2 - hc) : null,
      actionsCenterOff: actR ? Math.round(actR.top + actR.h / 2 - hc) : null,
      navDisplay: $(".nav") ? getComputedStyle($(".nav")).display : null,
      ctaDisplay: $(".header-cta") ? getComputedStyle($(".header-cta")).display : null
    };

    var hg = $(".hero-grid"); var hgR = rect(hg);
    var vR = rect($(".hero-visual")); var cR = rect($(".hero-content"));
    if (hgR && vR && cR) {
      R.hero = {
        grid: hgR, content: cR, visual: vR,
        contentCenterOff: Math.round(cR.top + cR.h / 2 - (hgR.top + hgR.h / 2)),
        visualCenterOff: Math.round(vR.top + vR.h / 2 - (hgR.top + hgR.h / 2))
      };
    }

    R.trust = [];
    $$(".trust-item").forEach(function (ti) {
      var icon = ti.querySelector(".ico");
      R.trust.push({ label: ti.textContent.trim().slice(0, 24), iconCenterFromTop: Math.round((icon.getBoundingClientRect().top + icon.getBoundingClientRect().height / 2) - ti.getBoundingClientRect().top) });
    });

    var stage = $(".eco-stage");
    if (stage) {
      var sb = stage.getBoundingClientRect();
      R.eco = {};
      ["eco-float-a", "eco-float-b", "eco-hub", "eco-caption", "eco-panel"].forEach(function (s) {
        var b = rect($("." + s));
        if (!b) return;
        R.eco[s] = { overL: b.l < sb.left - 1, overR: b.r > sb.right + 1, overT: b.top < sb.top - 2, overB: b.btm > sb.bottom + 2 };
      });
    }

    R.productCards = $$(".product-card").map(function (pc) {
      return { h: Math.round(pc.getBoundingClientRect().height), top: Math.round(pc.getBoundingClientRect().top), ctaBtm: Math.round(pc.querySelector(".prod-cta").getBoundingClientRect().bottom) };
    });

    R.industryIcon = $$(".industry-card").map(function (c) {
      var b = c.getBoundingClientRect();
      var i = c.querySelector(".icon-badge").getBoundingClientRect();
      return Math.round(i.top + i.height / 2 - (b.top + b.height / 2));
    });

    R.badgeIconCenter = (function () {
      var offs = [];
      $$(".icon-badge").forEach(function (badge) {
        var b = badge.getBoundingClientRect();
        var ico = badge.querySelector(".ico");
        var ib = ico.getBoundingClientRect();
        offs.push({ cls: String(badge.className).replace(/\s+/g, " ").slice(0, 40), dx: Math.round(ib.left + ib.width / 2 - (b.left + b.width / 2)), dy: Math.round(ib.top + ib.height / 2 - (b.top + b.height / 2)) });
      });
      return offs;
    })();

    R.industryRows = (function () {
      var tops = $$(".industry-card").map(function (c) { return Math.round(c.getBoundingClientRect().top); });
      var rows = [];
      tops.forEach(function (t) { if (rows.indexOf(t) === -1) rows.push(t); });
      return rows;
    })();

    R.starCellTops = $$(".stat-cell").map(function (c) { return Math.round(c.getBoundingClientRect().top); });

    var ft = $(".footer-top");
    if (ft) {
      var ftR = ft.getBoundingClientRect();
      R.footer = { cols: [] };
      R.footer.brandLogo = rect($(".footer-top .footer-brand .logo-mark"));
      var firstCol = ft.querySelector(".footer-col");
      R.footerAcc = { maxH: firstCol ? getComputedStyle(firstCol.querySelector("ul")).maxHeight : null, cols: ft.querySelectorAll(".footer-col").length, counterNums: $$(".counter-num[data-count]").map(function (c) { return c.textContent; }) };
      $$(".footer-top .footer-col").forEach(function (c) {
        var h4 = c.querySelector("h4").getBoundingClientRect().top;
        var li = c.querySelector("ul li").getBoundingClientRect().top;
        R.footer.cols.push({ title: c.querySelector("h4").textContent, h4Off: Math.round(h4 - ftR.top), liOff: Math.round(li - ftR.top) });
      });
      R.contactAlign = [];
      $$(".footer-col.contact-col .contact-row").forEach(function (r) {
        var icon = r.querySelector(".ico"); var txt = r.querySelector("a, address");
        R.contactAlign.push({ tag: txt.tagName, iconTop: Math.round(icon.getBoundingClientRect().top - r.getBoundingClientRect().top), textTop: Math.round(txt.getBoundingClientRect().top - r.getBoundingClientRect().top) });
      });
      var fb = $(".footer-bottom");
      var fbP = fb.querySelector("p"); var fbPr = fb.querySelector(".footer-prod");
      R.fb = {
        copyright: rect(fbP), prod: rect(fbPr),
        centerDiff: Math.round((fbPr.getBoundingClientRect().top + fbPr.getBoundingClientRect().height / 2) - (fbP.getBoundingClientRect().top + fbP.getBoundingClientRect().height / 2))
      };
    }

    var form = $(".lead-form");
    if (form) {
      R.formFields = [];
      $$(".form-field", form).forEach(function (f) {
        var inp = f.querySelector("input, select, textarea");
        R.formFields.push({ leftOff: Math.round(inp.getBoundingClientRect().left - f.getBoundingClientRect().left), w: Math.round(inp.getBoundingClientRect().width) });
      });
      var comp = rect($('[name="company"]')); var ph = rect($('[name="phone"]'));
      R.formRow = comp ? { companyTop: comp.top, phoneTop: ph.top, diff: ph.top - comp.top } : null;
    }

    var leadGrid = $(".lead-grid");
    if (leadGrid) {
      var lg = leadGrid.getBoundingClientRect();
      var leftCol = leadGrid.children[0]; var card = leadGrid.children[1];
      R.leadGrid = {
        leftTopOff: Math.round(leftCol.getBoundingClientRect().top - lg.top),
        cardTopOff: Math.round(card.getBoundingClientRect().top - lg.top)
      };
    }

    var ctaBand = $(".cta-band");
    if (ctaBand) {
      R.ctaBand = { padRight: Math.round(ctaBand.getBoundingClientRect().right - rect(ctaBand.firstElementChild).r), bandW: Math.round(ctaBand.getBoundingClientRect().width) };
    }
    var cdH3 = $(".cta-divider h3"); var cdA = $(".cta-divider .cta-actions");
    if (cdH3 && cdA) {
      R.ctaDividerCenterDiff = Math.round((cdA.getBoundingClientRect().top + cdA.getBoundingClientRect().height / 2) - (cdH3.getBoundingClientRect().top + cdH3.getBoundingClientRect().height / 2));
    }

    var pre = document.getElementById("__audit__");
    if (!pre) {
      pre = document.createElement("pre");
      pre.id = "__audit__";
      pre.style.cssText = "position:fixed;left:50%;top:0;transform:translateX(-50%);z-index:99999;color:#111;background:#fff;border:2px solid #c33;font:11px/1.4 monospace;white-space:pre-wrap;max-height:80vh;overflow:auto;width:96vw;padding:10px;";
      document.body.appendChild(pre);
    }
    pre.textContent = JSON.stringify(R, null, 1);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    run();
  } else {
    document.addEventListener("DOMContentLoaded", run);
  }
})();