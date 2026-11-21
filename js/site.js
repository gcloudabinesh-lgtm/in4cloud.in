/* IN4 Solutions — site-wide configuration (single source of truth).
   leads: where the enquiry forms (js/lead.js) send their emails. */
(function () {
  "use strict";

  window.IN4Site = {
    name: "IN4 Solutions",
    company: "In4 Solution Pvt Ltd",
    tagline: "Smart Digital Solutions for Modern Businesses",
    url: "https://in4cloud.in",

    contact: {
      phoneDisplay: "+91 89258 14088",
      phoneHref: "tel:+918925814088",
      email: "info@in4solution.com",
      emailHref: "mailto:info@in4solution.com",
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
      // Web3Forms keys (web3forms.com). The live key is used only on the live
      // site (liveHosts); everywhere else (the GitHub Pages test site, local
      // files) uses the test key, so test enquiries never reach the live inbox.
      //   live: emails priya@in4solution.com  (live site https://in4cloud.in)
      //   test: emails gcloud.abinesh@gmail.com
      liveHosts: ["in4cloud.in", "www.in4cloud.in"],
      web3formsKeyLive: "1b844a65-0b9e-4364-804a-60304e57b19b",
      web3formsKeyTest: "5029946c-e60e-43ab-ad90-c0e9fb276c7e",
      // emailjs: used next when all three values are set (emailjs.com →
      // Email Services = serviceId, Email Templates = templateId,
      // Account → General = publicKey). Template: tools/emailjs-template.txt.
      emailjs: {
        serviceId: "service_a9m84pj",
        templateId: "",
        publicKey: "BOsQyD6TWdv_Fb89i"
      },
      // appsScriptUrl: the Google Apps Script mailer (tools/form-mailer.gs),
      // deployed from that Gmail account as a web app — paste its /exec URL
      // here. While it is empty, forms send through FormSubmit instead.
      appsScriptUrl: "https://script.google.com/macros/s/AKfycbwxuPqlqDxHVrCS69KUNvzD9GaTB6gwqarhb9FqZygaeyhjSbXc8s-9BmvUoN-kX1gC/exec",
      webhookUrl: window.__IN4_LEAD_WEBHOOK__ || "https://formsubmit.co/ajax/gcloud.abinesh@gmail.com"
    }
  };
})();