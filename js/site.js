/* IN4 Solutions — site-wide configuration (single source of truth).
   LEAD_WEBHOOK_URL is optional; set it to a real CRM/webhook endpoint
   when integrating (e.g. Zoho CRM). Leave blank in development. */
(function () {
  "use strict";

  window.IN4Site = {
    name: "IN4 Solutions",
    company: "In4 Solution Pvt Ltd",
    tagline: "Smart Digital Solutions for Modern Businesses",
    url: "https://www.in4solution.com",

    contact: {
      person: "Priya",
      role: "Senior Business Consultant",
      phoneDisplay: "+91 89258 14088",
      phoneHref: "tel:+918925814088",
      email: "Priya@in4solution.com",
      emailHref: "mailto:Priya@in4solution.com",
      website: "www.in4solution.com",
      addressLines: [
        "No-4, 2nd Floor, Pillaiyar Kovil street,",
        "Kasi City Park, Kasi Estate, Ashok Nagar,",
        "Chennai–600 083"
      ],
      addressSearch:
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent("Kasi Estate, Pillaiyar Kovil Street, Ashok Nagar, Chennai 600083")
    },

    leads: {
      webhookUrl: window.__IN4_LEAD_WEBHOOK__ || ""
    }
  };
})();