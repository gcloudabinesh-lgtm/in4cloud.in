/* IN4 Solutions — lead form handler + service layer.
   - Validate client-side (name >= 2 chars, company, phone, email)
   - Honeypot spam field
   - Email every enquiry to the inbox set in js/site.js (leads), through the
     Google Apps Script mailer when appsScriptUrl is set, else FormSubmit
   - Success is shown only when the mail service confirms it sent the email
   - If no endpoint is configured, surface an explicit development
     warning instead of pretending the enquiry was submitted.
*/
(function () {
  "use strict";

  const S = window.IN4Site;

  // local part @ domain . TLD (2+ letters); no spaces, no ".." anywhere
  const EMAIL_RE = /^[A-Za-z0-9._%+'-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
  // letters in any language, spaces and . ' - (e.g. "R. D'Souza-Iyer")
  const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u;
  const PHONE_CHARS_RE = /^\+?[0-9\s().-]+$/;
  const LIMITS = { fullName: 80, company: 120, phone: 20, email: 254, message: 1000 };

  // Readable page name for the lead email, from the page's file name, so
  // forms and the demo popup report the same page wherever they appear.
  const PAGE_NAMES = {
    "index.html": "Home", "": "Home",
    "about.html": "About", "contact.html": "Contact", "pricing.html": "Pricing", "resources.html": "Resources",
    "hrms.html": "HRMS", "hrms-landing.html": "HRMS Landing", "cloudhr.html": "CloudHR",
    "attendance-management.html": "Attendance Management", "leave-management.html": "Leave Management",
    "performance-management.html": "Performance Management", "geo-fencing.html": "Geo-fencing",
    "ai camera attendance.html": "AI Camera Attendance", "ai-analytics.html": "AI Analytics",
    "ai-video-analytics.html": "AI Video Analytics", "canteen-management.html": "Canteen Management",
    "parking-management.html": "Parking Management", "parking-landing.html": "Parking Landing",
    "visitor-management.html": "Visitor Management", "visitor-landing.html": "Visitor Landing"
  };
  function pageName() {
    const file = decodeURIComponent(window.location.pathname.split("/").pop() || "").toLowerCase();
    return PAGE_NAMES[file] || document.title.split(/\s+[—|-]\s+|\s*\|\s*/)[0].trim() || "Website";
  }

  function str(v) {
    return (v || "").replace(/\s+/g, " ").trim();
  }

  function escapeHtml(v) {
    return String(v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function validate(values) {
    const errors = {};
    const name = values.fullName || "";
    if (name.length < 2) {
      errors.fullName = "Please enter your full name (at least 2 characters).";
    } else if (name.length > LIMITS.fullName) {
      errors.fullName = "Please keep your name under " + LIMITS.fullName + " characters.";
    } else if (!NAME_RE.test(name) || (name.match(/\p{L}/gu) || []).length < 2) {
      errors.fullName = "Please use letters only in your name (spaces, . ' - allowed).";
    }

    const company = values.company || "";
    if (!company) {
      errors.company = "Please enter your company name.";
    } else if (company.length < 2) {
      errors.company = "Please enter your full company name.";
    } else if (company.length > LIMITS.company) {
      errors.company = "Please keep the company name under " + LIMITS.company + " characters.";
    } else if (!/[\p{L}0-9]/u.test(company)) {
      errors.company = "Please enter a valid company name.";
    }

    const phone = values.phone || "";
    const digits = phone.replace(/\D/g, "");
    if (!phone) {
      errors.phone = "Please enter a phone number.";
    } else if (!PHONE_CHARS_RE.test(phone)) {
      errors.phone = "Please use digits only (spaces, + ( ) - allowed).";
    } else if (digits.length < 7 || digits.length > 15) {
      errors.phone = "Please enter a valid phone number (7 to 15 digits).";
    }

    const email = values.email || "";
    if (!email || email.length > LIMITS.email || !EMAIL_RE.test(email) || email.indexOf("..") !== -1) {
      errors.email = "Please enter a valid work email address.";
    }

    if ((values.message || "").length > LIMITS.message) {
      errors.message = "Please keep your message under " + LIMITS.message + " characters.";
    }
    if (values.productRequired && !values.product) {
      errors.product = "Please select an interested module.";
    }
    return errors;
  }

  // Page name and enquiry type from the form's pageSource, which reads like
  // "HRMS — Book a Free Demo", "Contact page — Book a Demo", "… — Price Enquiry"
  // or "Demo popup".
  // The page always comes from the page's file (pageName), so the lead email
  // names the page the visitor was on, popup included. The form label is the
  // part after " — " in pageSource (e.g. "Price Enquiry", "Book a Demo").
  function formInfo(pageSource) {
    const src = pageSource || document.title;
    const page = pageName();
    const popup = /^demo popup$/i.test(src);
    const form = popup ? "Book a Demo popup" : (src.split(/\s+[—-]\s+/)[1] || "Enquiry form").trim();
    let type = "Demo Request";
    if (/price enquiry/i.test(src)) type = "Price Enquiry";
    else if (!popup && page === "Contact") type = "Contact Enquiry";
    else if (!popup && page === "Home") type = "Website Enquiry";
    return { page: page, form: form, type: type };
  }

  function submittedOn() {
    return new Date().toLocaleString("en-IN", {
      dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata"
    }) + " IST";
  }

  const FAIL_MESSAGE = "We could not submit your enquiry right now. Please try again in a moment.";

  // Builds the enquiry email: readable field labels (the mail services print
  // them as row titles) plus a subject that names the lead's page, e.g.
  // "New Demo Request — HRMS page | Name, Company".
  function buildEnquiry(payload) {
    const info = formInfo(payload.pageSource);
    const topic = payload.product || info.page;
    const fields = {
      "Lead Page": info.page + " page",
      "Form": info.form,
      "Enquiry Type": info.type,
      "Interested In": topic,
      "Name": payload.fullName,
      "Company": payload.company,
      "Phone": payload.phone,
      "Email": payload.email
    };
    if (payload.companySize) fields["Company Size"] = payload.companySize;
    fields["Message"] = payload.message || "(no message)";
    fields["Page URL"] = window.location.href;
    fields["Submitted On"] = submittedOn();
    return {
      info: info,
      topic: topic,
      fields: fields,
      subject: "New " + info.type + " — " + info.page + " page | " + payload.fullName + ", " + payload.company
    };
  }

  // Web3Forms — one access key, emailed to the inbox it was created for.
  // Sent as FormData (a "simple" request, so no CORS preflight). Answers
  // JSON { success: true } only when the mail was sent.
  function sendWeb3Forms(accessKey, enquiry) {
    const body = new FormData();
    body.append("access_key", accessKey);
    body.append("subject", enquiry.subject);
    body.append("from_name", S.name + " Website");
    body.append("replyto", enquiry.fields["Email"]);
    Object.keys(enquiry.fields).forEach(function (k) {
      body.append(k, enquiry.fields[k]);
    });
    return fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: body
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        return res.ok && data.success === true ? { status: "submitted" } : { status: "error", message: FAIL_MESSAGE };
      });
    });
  }

  // EmailJS REST API. The email layout lives in the EmailJS template, which
  // reads these {{variables}} (template text: tools/emailjs-template.txt).
  // EmailJS answers 200 "OK" only when the mail was sent.
  function sendEmailJS(ejs, enquiry) {
    const f = enquiry.fields;
    return fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: ejs.serviceId,
        template_id: ejs.templateId,
        user_id: ejs.publicKey,
        template_params: {
          subject: enquiry.subject,
          enquiry_type: f["Enquiry Type"],
          interested_in: f["Interested In"],
          name: f["Name"],
          company: f["Company"],
          phone: f["Phone"],
          email: f["Email"],
          company_size: f["Company Size"] || "-",
          message: f["Message"],
          page: f["Submitted From"],
          page_url: f["Page URL"],
          submitted_on: f["Submitted On"]
        }
      })
    }).then(function (res) {
      return res.ok ? { status: "submitted" } : { status: "error", message: FAIL_MESSAGE };
    });
  }

  // Google Apps Script web app (tools/form-mailer.gs) — sends the email from
  // the owner's own Gmail. text/plain keeps the request "simple", so the
  // browser needs no CORS preflight.
  function sendAppsScript(url, enquiry) {
    const body = Object.assign({ subject: enquiry.subject }, enquiry.fields);
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        return res.ok && data.success === true ? { status: "submitted" } : { status: "error", message: FAIL_MESSAGE };
      });
    });
  }

  // FormSubmit (keyless) — https://formsubmit.co/ajax/<email>. The first
  // live submission emails an "Activate Form" link to that inbox.
  function sendFormSubmit(url, enquiry) {
    const body = Object.assign({}, enquiry.fields);
    // lower-case "email" lets FormSubmit set the reply-to address
    body.email = body.Email;
    delete body.Email;
    body._subject = enquiry.subject;
    body._template = "table";
    body._captcha = "false";

    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body)
    }).then(function (res) {
      // FormSubmit answers 200 even when it refuses to send (e.g. the address
      // is not activated yet), so trust only its "success" flag.
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (res.ok && String(data.success) === "true") return { status: "submitted" };
        if (/activat/i.test(data.message || "")) {
          return {
            status: "error",
            message: "This form is awaiting one-time activation. An “Activate Form” email has been sent to the receiving inbox — click Activate, then submit again."
          };
        }
        return { status: "error", message: FAIL_MESSAGE };
      });
    });
  }

  function leadService(payload) {
    const leads = S.leads || {};
    // live key on the live domain only; the test key everywhere else
    const host = (window.location.hostname || "").toLowerCase();
    const isLive = (leads.liveHosts || []).indexOf(host) !== -1;
    const web3Key = isLive ? leads.web3formsKeyLive : (leads.web3formsKeyTest || leads.web3formsKey);
    const enquiry = buildEnquiry(payload);
    let request;

    const ejs = leads.emailjs || {};
    if (web3Key) {
      request = sendWeb3Forms(web3Key, enquiry);
    } else if (ejs.serviceId && ejs.templateId && ejs.publicKey) {
      request = sendEmailJS(ejs, enquiry);
    } else if (leads.appsScriptUrl) {
      request = sendAppsScript(leads.appsScriptUrl, enquiry);
    } else if (leads.webhookUrl) {
      request = sendFormSubmit(leads.webhookUrl, enquiry);
    } else {
      // No backend configured — explicit development warning, never fake success.
      return Promise.resolve({
        status: "not-configured",
        message: "Lead submission is not configured yet."
      });
    }

    return request.then(function (result) {
      result.enquiry = enquiry;
      return result;
    }).catch(function () {
      // Network failure or the mail service is down.
      return { status: "error", message: FAIL_MESSAGE };
    });
  }

  function setStatus(container, type, message) {
    if (!container) return;
    container.className = "form-status " + (type || "");
    let icon = "";
    if (type === "success") {
      icon = '<i class="ico fa-solid fa-circle-check" aria-hidden="true"></i>';
    } else if (type === "error") {
      icon = '<i class="ico fa-solid fa-circle-exclamation" aria-hidden="true"></i>';
    } else if (type === "loading") {
      icon = '<span class="spinner" aria-hidden="true"></span>';
    }
    container.innerHTML = icon + '<span role="status" aria-live="polite">' + message + "</span>";
  }

  function initLeadForms(target) {
    // Accepts a form, a container or nothing (defaults to the whole document),
    // so the demo popup can bind its own form without re-binding the rest.
    var scope = target || document;
    var forms = scope.matches && scope.matches("[data-lead-form]")
      ? [scope]
      : Array.prototype.slice.call(scope.querySelectorAll("[data-lead-form]"));

    forms.forEach(function (form) {
      // Binding is idempotent: initLeadForms() is called again by the popup.
      if (form.dataset.leadBound === "1") return;
      form.dataset.leadBound = "1";

      const status = form.querySelector("[data-lead-status]");
      const statusLoading = form.querySelector('[data-lead-status-loading]');

      const FIELDS = ["fullName", "company", "phone", "email", "product", "message"];

      // Length caps so nobody can type past what validation allows.
      Object.keys(LIMITS).forEach(function (k) {
        const inp = form.elements[k];
        if (inp && inp.tagName !== "SELECT" && !inp.getAttribute("maxlength")) inp.setAttribute("maxlength", LIMITS[k]);
      });
      let submitted = false;

      function errBoxFor(inp) {
        return inp ? inp.parentElement.querySelector("[data-error-for]") : null;
      }

      function setFieldError(inp, message) {
        if (!inp) return;
        const box = errBoxFor(inp);
        inp.classList.add("has-error");
        inp.setAttribute("aria-invalid", "true");
        if (box) {
          box.textContent = message;
          if (!box.id) box.id = "err-" + inp.name;
          inp.setAttribute("aria-describedby", box.id);
        }
      }

      function clearFieldError(inp) {
        if (!inp) return;
        const box = errBoxFor(inp);
        inp.classList.remove("has-error");
        inp.removeAttribute("aria-invalid");
        inp.removeAttribute("aria-describedby");
        if (box) box.textContent = "";
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();

        // Honeypot: bots fill the hidden field — silently drop.
        const hp = form.querySelector("[data-hp]");
        if (hp && str(hp.value).length > 0) {
          return;
        }

        const submitBtn = form.querySelector("[data-submit]");

        const values = {
          fullName: str(form.elements.fullName.value),
          company: str(form.elements.company.value),
          phone: str(form.elements.phone.value),
          email: str(form.elements.email.value),
          product: str(form.elements.product ? form.elements.product.value : ""),
          productRequired: !!(form.elements.product && form.elements.product.required),
          companySize: str(form.elements.companySize ? form.elements.companySize.value : ""),
          message: str(form.elements.message ? form.elements.message.value : ""),
          pageSource: str(form.elements.pageSource ? form.elements.pageSource.value : "")
        };

        // Clear previous status + errors
        if (status) status.className = "form-status";
        form.querySelectorAll(".form-input").forEach(clearFieldError);

        const errors = validate(values);
        let firstBad = null;
        FIELDS.forEach(function (k) {
          const inp = form.elements[k];
          if (!inp) return;
          if (errors[k]) {
            setFieldError(inp, errors[k]);
            if (!firstBad) firstBad = inp;
          }
        });

        if (firstBad) {
          submitted = true;
          if (status) setStatus(status, "error", "Please correct the highlighted fields.");
          firstBad.focus({ preventScroll: true });
          firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }

        const original = submitBtn ? submitBtn.innerHTML : "";
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.setAttribute("aria-busy", "true");
          submitBtn.innerHTML =
            '<span class="spinner" aria-hidden="true"></span> Submitting…';
        }
        if (statusLoading) statusLoading.hidden = false;
        if (status) setStatus(status, "loading", "Submitting your enquiry…");

        leadService(values).then(function (result) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.removeAttribute("aria-busy");
            submitBtn.innerHTML = original;
          }
          if (statusLoading) statusLoading.hidden = true;

          if (result.status === "submitted") {
            // e.g. "Thank you, Meera! Your demo request for HRMS has been
            // received. Our team will contact you shortly."
            const e = result.enquiry;
            const firstName = values.fullName.split(" ")[0];
            form.reset();
            setStatus(
              status,
              "success",
              "Thank you, " + escapeHtml(firstName) + "! Your " + e.info.type.toLowerCase() +
                " for " + escapeHtml(e.topic) + " has been received. Our team will contact you shortly."
            );
          } else {
            setStatus(status, "error", result.message);
          }

          if (status) {
            status.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        });
      });

      // Per-field error handling. Messages clear as the user types; after a failed
      // submit they also re-validate live on blur, so corrections are confirmed.
      FIELDS.forEach(function (k) {
        const inp = form.elements[k];
        if (!inp) return;

        inp.addEventListener("input", function () {
          clearFieldError(inp);
        });

        inp.addEventListener("blur", function () {
          if (!submitted) return;
          const single = validate({
            fullName: str(form.elements.fullName.value),
            company: str(form.elements.company.value),
            phone: str(form.elements.phone.value),
            email: str(form.elements.email.value),
            product: str(form.elements.product ? form.elements.product.value : ""),
            productRequired: !!(form.elements.product && form.elements.product.required),
            message: str(form.elements.message ? form.elements.message.value : "")
          });
          if (single[k]) {
            setFieldError(inp, single[k]);
          } else {
            clearFieldError(inp);
          }
        });

        inp.addEventListener("change", function () {
          if (!submitted) return;
          const single = validate({
            fullName: str(form.elements.fullName.value),
            company: str(form.elements.company.value),
            phone: str(form.elements.phone.value),
            email: str(form.elements.email.value),
            product: str(form.elements.product ? form.elements.product.value : ""),
            productRequired: !!(form.elements.product && form.elements.product.required),
            message: str(form.elements.message ? form.elements.message.value : "")
          });
          if (single[k]) setFieldError(inp, single[k]);
          else clearFieldError(inp);
        });
      });
    });
  }

  window.IN4LeadForms = initLeadForms;

  /* Bind every inline form on the page once the DOM is ready. */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { initLeadForms(); });
  } else {
    initLeadForms();
  }
})();