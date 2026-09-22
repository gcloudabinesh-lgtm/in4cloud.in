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
    return errors;
  }

  function leadService(payload) {
    const url = (S.leads && S.leads.webhookUrl) || "";

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

    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) {
        return {
          status: "error",
          message: "We could not submit your enquiry right now. Please try again."
        };
      }
      return { status: "submitted" };
    }).catch(function () {
      return {
        status: "error",
        message: "We could not submit your enquiry right now. Please try again."
      };
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

  function initLeadForms() {
    document.querySelectorAll("[data-lead-form]").forEach(function (form) {
      const status = form.querySelector("[data-lead-status]");
      const statusLoading = form.querySelector('[data-lead-status-loading]');

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
          companySize: str(form.elements.companySize ? form.elements.companySize.value : ""),
          message: str(form.elements.message ? form.elements.message.value : ""),
          pageSource: str(form.elements.pageSource ? form.elements.pageSource.value : "")
        };

        // Clear previous status + errors
        if (status) status.className = "form-status";
        form.querySelectorAll(".form-input").forEach(function (inp) {
          inp.classList.remove("has-error");
          const errBox = inp.parentElement.querySelector("[data-error-for]");
          if (errBox) errBox.textContent = "";
        });

        const errors = validate(values);
        const keys = ["fullName", "company", "phone", "email"];
        let hasError = false;
        keys.forEach(function (k) {
          const inp = form.elements[k];
          if (!inp) return;
          if (errors[k]) {
            inp.classList.add("has-error");
            const errBox = inp.parentElement.querySelector("[data-error-for]");
            if (errBox) errBox.textContent = errors[k];
            hasError = true;
          }
        });

        if (hasError) {
          if (status) setStatus(status, "error", "Please correct the highlighted fields.");
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

      // clear per-field error on input
      ["fullName", "company", "phone", "email"].forEach(function (k) {
        const inp = form.elements[k];
        if (!inp) return;
        inp.addEventListener("input", function () {
          inp.classList.remove("has-error");
          const errBox = inp.parentElement.querySelector("[data-error-for]");
          if (errBox) errBox.textContent = "";
        });
      });
    });
  }

  window.IN4LeadForms = initLeadForms;
})();