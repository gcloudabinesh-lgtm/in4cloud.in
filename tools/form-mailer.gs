/* IN4 website form mailer — Google Apps Script web app.
   Receives every enquiry from js/lead.js and emails it from your own Gmail
   to TO_EMAIL. No third-party service, no API key.

   Setup (once, signed in as gcloud.abinesh@gmail.com):
   1. https://script.google.com → New project → paste this whole file.
   2. Deploy → New deployment → type "Web app"
        Execute as: Me    Who has access: Anyone → Deploy.
   3. Authorize access (Advanced → Go to project → Allow).
   4. Copy the Web app URL (ends in /exec) into appsScriptUrl in js/site.js.
   After editing this file later: Deploy → Manage deployments → Edit → New
   version, so the same URL keeps working. */

const TO_EMAIL = "gcloud.abinesh@gmail.com";

const FIELD_ORDER = [
  "Enquiry Type", "Interested In", "Name", "Company", "Phone", "Email",
  "Company Size", "Message", "Submitted From", "Page URL", "Submitted On"
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const rows = FIELD_ORDER
      .filter(function (k) { return data[k]; })
      .map(function (k) {
        return '<tr><td style="padding:9px 14px;background:#f4f1ff;font-weight:700;color:#3b2a8f;white-space:nowrap;border-bottom:1px solid #ebe8f6">' +
          k + '</td><td style="padding:9px 14px;color:#181632;border-bottom:1px solid #ebe8f6">' +
          escapeHtml(data[k]) + "</td></tr>";
      })
      .join("");

    const html =
      '<div style="font-family:Arial,sans-serif;max-width:640px">' +
      '<h2 style="margin:0 0 4px;color:#6C35FF">' + escapeHtml(data["Enquiry Type"] || "New Enquiry") + "</h2>" +
      '<p style="margin:0 0 16px;color:#6b6890">From the IN4 website</p>' +
      '<table style="border-collapse:collapse;width:100%;border:1px solid #ebe8f6">' + rows + "</table>" +
      '<p style="margin:16px 0 0;color:#6b6890;font-size:13px">Reply to this email to answer the customer directly.</p>' +
      "</div>";

    const mail = {
      to: TO_EMAIL,
      subject: String(data.subject || "New enquiry from the IN4 website").slice(0, 250),
      htmlBody: html,
      name: "IN4 Website"
    };
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.Email || "")) mail.replyTo = data.Email;

    MailApp.sendEmail(mail);
    return json({ success: true });
  } catch (err) {
    return json({ success: false, message: String(err) });
  }
}

// Opening the /exec URL in a browser shows this — handy to check the deploy.
function doGet() {
  return json({ ok: true, service: "IN4 form mailer" });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function escapeHtml(v) {
  return String(v)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>");
}
