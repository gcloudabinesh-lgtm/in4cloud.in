/* IN4 Solutions — site-wide configuration (single source of truth).
   leads.webhookUrl: every enquiry form posts here (js/lead.js). It is a
   FormSubmit endpoint — https://formsubmit.co/ajax/<receiving email> — so
   each submission is emailed to that address. The first live submission
   sends an "Activate Form" email to it; click Activate once. To change the
   inbox, replace the email after /ajax/ (or the random alias FormSubmit
   gives you after activation, which hides the address). */
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
      // Inbox for the keyless mailto fallback — used when the mail service
      // below is unreachable: the visitor's email app opens with the enquiry
      // filled in, addressed here.
      mailTo: "gcloud.abinesh@gmail.com",
      // EmailJS (https://www.emailjs.com, free 200 emails/month). When all
      // three values are set, forms send through EmailJS first.
      //   serviceId  — Email Services → your Gmail service → Service ID
      //   templateId — Email Templates → your template → Template ID
      //   publicKey  — Account → General → Public Key
      // Template: Subject "{{subject}}", Reply To "{{email}}", body uses
      // {{enquiry_type}} {{interested_in}} {{name}} {{company}} {{phone}}
      // {{email}} {{company_size}} {{message}} {{page}} {{page_url}}
      // {{submitted_on}}.
      emailjs: {
        serviceId: "",
        templateId: "",
        publicKey: ""
      },
      // Web3Forms access key (free at https://web3forms.com — enter the
      // receiving email, the key is emailed to it). When set, forms send
      // through Web3Forms instead of FormSubmit.
      web3formsKey: "",
      webhookUrl: window.__IN4_LEAD_WEBHOOK__ || "https://formsubmit.co/ajax/gcloud.abinesh@gmail.com"
    }
  };
})();