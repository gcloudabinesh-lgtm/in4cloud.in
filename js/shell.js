/* IN4 Solutions â€” shared site shell (header + products menu + mobile menu + footer).
   Injected once per page so markup is never duplicated across pages.
   Relies on Font Awesome 6 (CDN), site.js (contact/config). */
(function () {
  "use strict";

  const S = window.IN4Site;
  const currentFile = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();

  const pageKey = {
    "index.html": "home",
    "": "home",
    "hrms.html": "hrms",
    "visitor-management.html": "visitor",
    "parking-management.html": "parking",
    "attendance-management.html": "attendance",
    "ai camera attendance.html": "ai-camera",
    "ai-video-analytics.html": "ai-video",
    "about.html": "company",
    "contact.html": "contact",
    "resources.html": "resources",
    "pricing.html": "pricing"
  }[currentFile] || "home";

  const isProductPage = ["hrms", "visitor", "parking", "attendance", "ai-video", "ai-camera"].indexOf(pageKey) !== -1;

  function active(href, key) {
    const isActive = (href && currentFile === href) || pageKey === key;
    return isActive ? ' class="nav-link active" aria-current="page"' : ' class="nav-link"';
  }

  function mlActive(href, key) {
    const isActive = (href && currentFile === href) || pageKey === key;
    return isActive ? ' class="mobile-nav-link active"' : ' class="mobile-nav-link"';
  }

  const logoMark =
    '<img class="logo-mark" src="assets/logo-trim.png" alt="IN4 Solutions" width="1824" height="408">';

  function navLink(href, label, key) {
    return (
      '<li><a' +
      active(href, key) +
      ' href="' + href + '">' +
      label +
      "</a></li>"
    );
  }

  const header =
    '<header class="site-header" id="site-header">' +
    '<div class="container header-inner">' +
    '<a class="logo" href="index.html" aria-label="IN4 Solutions â€” Home">' + logoMark + "</a>" +
    '<nav class="nav" aria-label="Primary">' +
    '<ul class="nav-list">' +
    '<li class="has-mega' + (isProductPage ? " open" : "") + '">' +
    '<button class="nav-link nav-trigger" type="button" aria-haspopup="true" aria-expanded="false">' +
    'Products<i class="ico fa-solid fa-chevron-down" aria-hidden="true"></i></button>' +
    '<div class="mega-menu" role="menu">' +
    '<div class="mega-inner">' +
    '<div class="mega-col"><span class="mega-title">HRMS â€” Cloud HR &amp; Payroll</span><div class="mega-links">' +
    '<a href="hrms.html"><i class="ico fa-solid fa-cloud" aria-hidden="true"></i> HRMS</a>' +
    '<a href="attendance-management.html"><i class="ico fa-solid fa-fingerprint" aria-hidden="true"></i> Attendance Management</a>' +
    '<a href="ai camera attendance.html"><i class="ico fa-solid fa-camera-retro" aria-hidden="true"></i> AI Camera Attendance</a>' +
    '<a href="hrms.html#modules"><i class="ico fa-solid fa-calendar-check" aria-hidden="true"></i> Leave Management</a>' +
    '<a href="hrms.html#modules"><i class="ico fa-solid fa-money-check-dollar" aria-hidden="true"></i> Payroll Processing</a>' +
    '<a href="hrms.html#modules"><i class="ico fa-solid fa-shield-halved" aria-hidden="true"></i> Compliance</a>' +
    '<a href="hrms.html#modules"><i class="ico fa-solid fa-mobile-screen" aria-hidden="true"></i> Employee Self Service</a>' +
    "</div></div>" +
    '<div class="mega-col"><span class="mega-title">Workplace Modules</span><div class="mega-links">' +
    '<a href="visitor-management.html"><i class="ico fa-solid fa-user-check" aria-hidden="true"></i> Visitor Management</a>' +
    '<a href="parking-management.html"><i class="ico fa-solid fa-square-parking" aria-hidden="true"></i> Parking Management</a>' +
    '<a href="hrms.html#modules"><i class="ico fa-solid fa-utensils" aria-hidden="true"></i> Canteen Management</a>' +
    '<a href="ai-video-analytics.html"><i class="ico fa-solid fa-video" aria-hidden="true"></i> AI-Based Video Analytics</a>' +
    "</div></div>" +
    '<div class="mega-col"><span class="mega-title">Company</span><div class="mega-links">' +
    '<a href="about.html"><i class="ico fa-solid fa-building" aria-hidden="true"></i> About IN4 Solutions</a>' +
    '<a href="contact.html"><i class="ico fa-solid fa-envelope" aria-hidden="true"></i> Contact</a>' +
    '<a href="resources.html"><i class="ico fa-solid fa-book-open" aria-hidden="true"></i> Resources</a>' +
    '<a href="pricing.html"><i class="ico fa-solid fa-tag" aria-hidden="true"></i> Pricing</a>' +
    "</div></div>" +
    "</div>" +
    '<div class="mega-foot"><p>Modular cloud platform. One technology partner.</p>' +
    '<a class="text-link" href="contact.html#lead">Request a demo<i class="ico fa-solid fa-arrow-right" aria-hidden="true"></i></a></div>' +
    "</div></li>" +
    navLink("resources.html", "Resources", "resources") +
    navLink("pricing.html", "Pricing", "pricing") +
    '<li class="has-dropdown">' +
    '<button class="nav-link nav-trigger" type="button" aria-haspopup="true" aria-expanded="false">' +
    'Company<i class="ico fa-solid fa-chevron-down" aria-hidden="true"></i></button>' +
    '<div class="dropdown-menu" role="menu">' +
    '<a href="about.html"><i class="ico fa-solid fa-building" aria-hidden="true"></i> About Us</a>' +
    '<a href="contact.html"><i class="ico fa-solid fa-envelope" aria-hidden="true"></i> Contact</a>' +
    "</div></li>" +
    "</ul></nav>" +
    '<div class="header-actions">' +
    '<a href="contact.html#lead" class="btn btn-primary btn-sm header-cta">Book a Demo</a>' +
    '<button class="nav-toggle" id="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">' +
    '<span></span><span></span><span></span></button>' +
    "</div></div></header>";

  const mobileMenu =
    '<div class="mobile-menu" id="mobile-menu" aria-hidden="true">' +
    '<div class="mobile-menu-head">' +
    '<a class="logo" href="index.html">' + logoMark + "</a>" +
    '<button class="mobile-menu-close" id="mobile-close" type="button" aria-label="Close menu">' +
    '<i class="ico fa-solid fa-xmark" aria-hidden="true"></i></button>' +
    "</div>" +
    '<div class="mobile-menu-body">' +
    '<button class="mobile-nav-link acc-trigger" type="button" aria-expanded="false" aria-controls="m-acc-product">' +
    'Products<i class="ico ico-chev fa-solid fa-chevron-down" aria-hidden="true"></i></button>' +
    '<div class="mobile-sub" id="m-acc-product"><div class="mobile-sub-inner"><div class="mobile-sub-links">' +
    '<a href="hrms.html"><i class="ico fa-solid fa-cloud" aria-hidden="true"></i> HRMS â€” Cloud HR &amp; Payroll</a>' +
    '<a href="visitor-management.html"><i class="ico fa-solid fa-user-check" aria-hidden="true"></i> Visitor Management</a>' +
    '<a href="parking-management.html"><i class="ico fa-solid fa-square-parking" aria-hidden="true"></i> Parking Management</a>' +
    '<a href="hrms.html#modules"><i class="ico fa-solid fa-utensils" aria-hidden="true"></i> Canteen Management</a>' +
    '<a href="ai-video-analytics.html"><i class="ico fa-solid fa-video" aria-hidden="true"></i> AI-Based Video Analytics</a>' +
    "</div></div></div>" +
    '<a class="mobile-nav-link"' + mlActive("resources.html", "resources") + ' href="resources.html">' +
    '<i class="ico fa-solid fa-book-open" aria-hidden="true"></i> Resources</a>' +
    '<a class="mobile-nav-link"' + mlActive("pricing.html", "pricing") + ' href="pricing.html">' +
    '<i class="ico fa-solid fa-tag" aria-hidden="true"></i> Pricing</a>' +
    '<button class="mobile-nav-link acc-trigger" type="button" aria-expanded="false" aria-controls="m-acc-company">' +
    'Company<i class="ico ico-chev fa-solid fa-chevron-down" aria-hidden="true"></i></button>' +
    '<div class="mobile-sub" id="m-acc-company"><div class="mobile-sub-inner"><div class="mobile-sub-links">' +
    '<a href="about.html"><i class="ico fa-solid fa-building" aria-hidden="true"></i> About Us</a>' +
    '<a href="contact.html"><i class="ico fa-solid fa-envelope" aria-hidden="true"></i> Contact</a>' +
    "</div></div></div>" +
    "</div>" +
    '<div class="mobile-menu-cta">' +
    '<a href="contact.html#lead" class="btn btn-primary btn-block">Book a Demo</a>' +
    '<p style="font-size:12.5px;color:var(--text-muted);margin-top:12px;text-align:center">Modern HR &amp; Workplace Platform</p>' +
    "</div></div>" +
    '<div class="menu-backdrop" id="menu-backdrop"></div>';

  const footer =
    '<footer class="site-footer">' +
    '<div class="container footer-top">' +
    '<div class="footer-brand">' +
    '<a class="logo" href="index.html">' + logoMark + "</a>" +
    "<p>Modern HR &amp; Workplace Platform for Growing Enterprises.</p>" +
    '<p style="margin-top:10px;font-size:13px">A business automation division of ' + S.company + ".</p>" +
    '<div class="footer-social">' +
    '<a href="https://www.facebook.com/in4solution" target="_blank" rel="noopener" aria-label="Facebook"><i class="ico fa-brands fa-facebook-f" aria-hidden="true"></i></a>' +
    '<a href="https://www.linkedin.com/company/in4solution" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="ico fa-brands fa-linkedin-in" aria-hidden="true"></i></a>' +
    '<a href="https://twitter.com/in4solution" target="_blank" rel="noopener" aria-label="Twitter / X"><i class="ico fa-brands fa-x-twitter" aria-hidden="true"></i></a>' +
    '<a href="https://www.instagram.com/in4solution" target="_blank" rel="noopener" aria-label="Instagram"><i class="ico fa-brands fa-instagram" aria-hidden="true"></i></a>' +
    '<a href="https://www.youtube.com/@in4solution" target="_blank" rel="noopener" aria-label="YouTube"><i class="ico fa-brands fa-youtube" aria-hidden="true"></i></a>' +
    "</div>" +
    '<div class="footer-apps">' +
    '<a href="https://play.google.com/store/apps/details?id=com.in4solution" target="_blank" rel="noopener" class="app-badge" aria-label="Get it on Google Play">' +
    '<i class="ico fa-brands fa-google-play" aria-hidden="true"></i><span><small>GET IT ON</small>Google Play</span></a>' +
    '<a href="https://apps.apple.com/app/in4-solution/id1234567890" target="_blank" rel="noopener" class="app-badge" aria-label="Download on the App Store">' +
    '<i class="ico fa-brands fa-apple" aria-hidden="true"></i><span><small>Download on the</small>App Store</span></a>' +
    "</div>" +
    "</div>" +
    '<div class="footer-col"><h4 class="foot-trigger" role="button" tabindex="0" aria-expanded="false">Products<i class="ico fa-solid fa-chevron-down foot-caret" aria-hidden="true"></i></h4><ul>' +
    '<li><a href="hrms.html">HRMS â€” Cloud HR &amp; Payroll</a></li>' +
    '<li><a href="visitor-management.html">Visitor Management</a></li>' +
    '<li><a href="parking-management.html">Parking Management</a></li>' +
    '<li><a href="hrms.html#modules">Canteen Management</a></li>' +
    '<li><a href="ai-video-analytics.html">AI-Based Video Analytics</a></li>' +
    "</ul></div>" +
    '<div class="footer-col"><h4 class="foot-trigger" role="button" tabindex="0" aria-expanded="false">Company<i class="ico fa-solid fa-chevron-down foot-caret" aria-hidden="true"></i></h4><ul>' +
    '<li><a href="about.html">About</a></li>' +
    '<li><a href="resources.html">Resources</a></li>' +
    '<li><a href="pricing.html">Pricing</a></li>' +
    '<li><a href="contact.html">Contact</a></li>' +
    "</ul></div>" +
    '<div class="footer-col contact-col"><h4 class="foot-trigger" role="button" tabindex="0" aria-expanded="false">Contact<i class="ico fa-solid fa-chevron-down foot-caret" aria-hidden="true"></i></h4><ul>' +
    '<li class="contact-row"><i class="ico fa-solid fa-phone" aria-hidden="true"></i><a href="' + S.contact.phoneHref + '">' + S.contact.phoneDisplay + "</a></li>" +
    '<li class="contact-row"><i class="ico fa-solid fa-envelope" aria-hidden="true"></i><a href="' + S.contact.emailHref + '">' + S.contact.email + "</a></li>" +
    '<li class="contact-row"><i class="ico fa-solid fa-location-dot" aria-hidden="true"></i><address>' + S.contact.addressLines.join("<br>") + "</address></li>" +
    '<li class="contact-row"><i class="ico fa-solid fa-globe" aria-hidden="true"></i><a href="https://' + S.contact.website + '">' + S.contact.website + "</a></li>" +
    "</ul></div>" +
    "</div>" +
    '<div class="container footer-bottom">' +
    "<p>Â© 2026 " + S.name + '. All rights reserved.</p>' +
    '<p class="footer-prod"><span class="dot"></span>A business automation brand of ' + S.company + ".</p>" +
    "</div></footer>";

  const floatContact =
    '<div class="float-contact" id="float-contact">' +
    '<div class="float-pop" id="float-pop">' +
    "<span class=\"pop-title\">Reach IN4 Solutions</span>" +
    '<a href="' + S.contact.phoneHref + '"><i class="ico fa-solid fa-phone" aria-hidden="true"></i> Call us</a>' +
    '<a href="' + S.contact.emailHref + '"><i class="ico fa-solid fa-envelope" aria-hidden="true"></i> Send email</a>' +
    '<a href="contact.html#lead"><i class="ico fa-solid fa-calendar-day" aria-hidden="true"></i> Book a Demo</a>' +
    "</div>" +
    '<button class="fc-toggle" id="fc-toggle" type="button" aria-label="Contact options" aria-expanded="false">' +
    '<i class="ico fa-solid fa-phone" aria-hidden="true"></i></button></div>';

  const stickyCta =
    '<div class="sticky-cta" id="sticky-cta">' +
    '<a href="contact.html#lead" class="btn btn-primary btn-block">Book a Demo</a></div>';

  const skip =
    '<a class="skip-link" href="#main">Skip to content</a>';

  const backTop =
    '<button class="back-top" id="back-top" type="button" aria-label="Back to top">' +
    '<i class="ico fa-solid fa-chevron-down" aria-hidden="true"></i></button>';

  document.body.insertAdjacentHTML("afterbegin", header);
  document.body.insertAdjacentHTML("afterbegin", skip);
  document.body.insertAdjacentHTML("beforeend", mobileMenu);
  document.body.insertAdjacentHTML("beforeend", footer);
  document.body.insertAdjacentHTML("beforeend", floatContact);
  document.body.insertAdjacentHTML("beforeend", stickyCta);
  document.body.insertAdjacentHTML("beforeend", backTop);
})();
