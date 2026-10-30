/* IN4 Solutions — lead form handler + service layer.
   - Validate client-side (name >= 2 chars, company, phone, email)
   - Honeypot spam field
   - POST to LEAD_WEBHOOK_URL when configured (architecture ready for
     Zoho CRM / webhook / email integration)
   - If no endpoint is configured, surface an explicit development
     warning instead of pretending the enquiry was submitted.
*/
(function () {
  "use strict";

  const S = window.IN4Site;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function str(v) {
    return (v || "").replace(/\s+/g, " ").trim();
  }

  function validate(values) {
    const errors = {};
    if (!values.fullName || values.fullName.length < 2) {
      errors.fullName = "Please enter your full name (at least 2 characters).";
    }
    if (!values.company) {
      errors.company = "Please enter your company name.";
    }
    if (!values.phone) {
      errors.phone = "Please enter a phone number.";
    } else if ((values.phone.replace(/\D/g, "") || "").length < 7) {
      errors.phone = "Please enter a valid phone number (at least 7 digits).";
    }
    if (!values.email || !EMAIL_RE.test(values.email)) {
      errors.email = "Please enter a valid work email address.";
    }
    if (values.productRequired && !values.product) {
      errors.product = "Please select an interested module.";
    }
    return errors;
  }

  // Page name and enquiry type from the form's pageSource, which reads like
  // "HRMS — Book a Free Demo", "Contact page — Book a Demo" or "Demo popup".
  function formInfo(pageSource) {
    const src = pageSource || document.title;
    if (/^demo popup$/i.test(src)) {
      const title = document.title.split(/\s+[—|-]\s+/)[0];
      return { page: title, type: "Demo Request" };
    }
    const page = src.split(/\s+[—-]\s+/)[0].replace(/\s+page$/i, "").trim();
    if (/^contact$/i.test(page)) return { page: "Contact", type: "Contact Enquiry" };
    if (/^homepage$/i.test(page)) return { page: "Homepage", type: "Website Enquiry" };
    return { page: page, type: "Demo Request" };
  }

  function submittedOn() {
    return new Date().toLocaleString("en-IN", {
      dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata"
    }) + " IST";
  }

  // EmailJS REST API — the email layout lives in the EmailJS template, which
  // reads these {{variables}} (see the template text in js/site.js).
  function sendEmailJS(payload, ejs) {
    const info = formInfo(payload.pageSource);
    const topic = payload.product || info.page;

    return fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: ejs.serviceId,
        template_id: ejs.templateId,
        user_id: ejs.publicKey,
        template_params: {
          subject: "New " + info.type + ": " + topic + " | " + payload.fullName + ", " + payload.company,
          enquiry_type: info.type,
          interested_in: topic,
          name: payload.fullName,
          company: payload.company,
          phone: payload.phone,
          email: payload.email,
          company_size: payload.companySize || "-",
          message: payload.message || "(no message)",
          page: info.page,
          page_url: window.location.href,
          submitted_on: submittedOn()
        }
      })
    }).then(function (res) {
      // EmailJS answers 200 "OK" when the mail is sent.
      if (res.ok) return { status: "submitted" };
      return {
        status: "error",
        message: "We could not submit your enquiry right now. Please try again or email " + S.contact.email + "."
      };
    }).catch(function () {
      return {
        status: "error",
        message: "We could not submit your enquiry right now. Please try again or email " + S.contact.email + "."
      };
    });
  }

  function leadService(payload) {
    const leads = S.leads || {};
    const ejs = leads.emailjs || {};
    if (ejs.serviceId && ejs.templateId && ejs.publicKey) {
      return sendEmailJS(payload, ejs);
    }
    // Web3Forms (when an access key is set) takes priority over FormSubmit.
    const web3Key = leads.web3formsKey || "";
    const url = web3Key ? "https://api.web3forms.com/submit" : (leads.webhookUrl || "");

    if (!url) {
      // No backend configured — explicit development warning, never fake success.
      return Promise.resolve({
        status: "not-configured",
        message:
          "Lead submission is not configured yet. Please contact " +
          S.contact.email +
          " to schedule your demo."
      });
    }

    const info = formInfo(payload.pageSource);
    const topic = payload.product || info.page;

    // Readable labels: the mail service prints field names as row titles.
    // "email" stays lower-case so FormSubmit can reply and auto-respond to it.
    const body = {
      "Enquiry Type": info.type,
      "Interested In": topic,
      "Name": payload.fullName,
      "Company": payload.company,
      "Phone": payload.phone,
      "email": payload.email
    };
    if (payload.companySize) body["Company Size"] = payload.companySize;
    body["Message"] = payload.message || "(no message)";
    body["Submitted From"] = info.page + " page";
    body["Page URL"] = window.location.href;
    body["Submitted On"] = submittedOn();

    // e.g. "New Demo Request: HRMS | Meera Iyer, Acme Corp"
    const subject = "New " + info.type + ": " + topic + " | " + payload.fullName + ", " + payload.company;

    if (web3Key) {
      body.access_key = web3Key;
      body.subject = subject;
      body.from_name = S.name + " Website";
      body.replyto = payload.email;
    } else {
      body._subject = subject;
      body._replyto = payload.email;
      body._template = "table";
      body._captcha = "false";
      // Confirmation mail sent to the person who filled in the form.
      body._autoresponse =
        "Hi " + payload.fullName + ", thank you for your interest in " + topic + ". " +
        "We have received your " + info.type.toLowerCase() + " and our team will contact you within one business day. " +
        "For anything urgent, call " + S.contact.phoneDisplay + " or email " + S.contact.email + ". " +
        "— Team " + S.name;
    }

    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body)
    }).then(function (res) {
      // FormSubmit answers 200 even when it refuses to send (e.g. the address
      // is not activated yet), so trust only its "success" flag.
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (res.ok && String(data.success) === "true") {
          return { status: "submitted" };
        }
        if (/activat/i.test(data.message || "")) {
          // One-time step: FormSubmit has emailed an "Activate Form" link.
          return {
            status: "error",
            message: "This form is awaiting one-time activation. An “Activate Form” email has been sent to the receiving inbox — click Activate, then submit again."
          };
        }
        return mailtoResult(subject, body);
      });
    }).catch(function () {
      // Network failure or the mail service is down.
      return mailtoResult(subject, body);
    });
  }

  // Keyless fallback: a mailto: link that opens the visitor's email app with
  // the enquiry already written; the visitor only presses Send.
  function mailtoResult(subject, fields) {
    const to = (S.leads && S.leads.mailTo) || S.contact.email;
    const lines = Object.keys(fields)
      .filter(function (k) { return k.charAt(0) !== "_" && k !== "access_key" && k !== "subject" && k !== "from_name" && k !== "replyto"; })
      .map(function (k) { return (k === "email" ? "Email" : k) + ": " + fields[k]; });
    return {
      status: "mailto",
      href: "mailto:" + to +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent("New enquiry from the " + S.name + " website\n\n" + lines.join("\n"))
    };
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

      const FIELDS = ["fullName", "company", "phone", "email", "product"];
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
            form.reset();
            setStatus(
              status,
              "success",
              "Thank you. Your enquiry has been received. Our team will contact you shortly."
            );
          } else if (result.status === "mailto") {
            // Hand the prepared enquiry to the visitor's email app.
            window.location.href = result.href;
            setStatus(
              status,
              "success",
              "Your email app has opened with your enquiry filled in — just press Send. If nothing opened, email us at " + S.contact.email + "."
            );
          } else if (result.status === "not-configured") {
            setStatus(status, "error", result.message);
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
            productRequired: !!(form.elements.product && form.elements.product.required)
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
            productRequired: !!(form.elements.product && form.elements.product.required)
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