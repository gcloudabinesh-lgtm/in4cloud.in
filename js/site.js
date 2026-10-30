/* IN4 Solutions — site-wide configuration (single source of truth).
   leads: where the enquiry forms (js/lead.js) send their emails. */
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
      // Every enquiry is emailed to gcloud.abinesh@gmail.com.
      // appsScriptUrl: the Google Apps Script mailer (tools/form-mailer.gs),
      // deployed from that Gmail account as a web app — paste its /exec URL
      // here. While it is empty, forms send through FormSubmit instead.
      appsScriptUrl: "https://script.google.com/macros/s/AKfycbwxuPqlqDxHVrCS69KUNvzD9GaTB6gwqarhb9FqZygaeyhjSbXc8s-9BmvUoN-kX1gC/exec",
      webhookUrl: window.__IN4_LEAD_WEBHOOK__ || "https://formsubmit.co/ajax/gcloud.abinesh@gmail.com"
    }
  };
})();