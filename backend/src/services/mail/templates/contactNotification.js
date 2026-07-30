/**
 * Email content for a new contact submission.
 *
 * Templates are pure functions returning `{ subject, text, html }`. No
 * transport concerns here, which is what makes the same template usable by
 * any provider and trivially snapshot-testable.
 */

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Strip CR/LF from values interpolated into headers (subject, reply-to).
 * Untrusted input in a header is a header-injection vector; the provider may
 * or may not defend against it, so we do it ourselves.
 */
const singleLine = (value) => String(value).replace(/[\r\n]+/g, " ").trim();

export function contactNotification({ name, email, message, submittedAt, contactId }) {
  const safeName = singleLine(name);
  const safeEmail = singleLine(email);
  const when = (submittedAt ?? new Date()).toISOString();

  const subject = `Portfolio contact — ${safeName}`.slice(0, 200);

  const text = [
    "New message from your portfolio contact form.",
    "",
    `Name:    ${safeName}`,
    `Email:   ${safeEmail}`,
    `Time:    ${when}`,
    `Ref:     ${contactId ?? "n/a"}`,
    "",
    "Message:",
    message,
    "",
    "— Reply directly to this email to answer the sender.",
  ].join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f6f7f9;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px">
      <tr>
        <td style="padding:24px 24px 8px">
          <h1 style="margin:0;font-size:18px;font-weight:600">New portfolio message</h1>
          <p style="margin:4px 0 0;font-size:13px;color:#6b7280">${escapeHtml(when)}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 24px">
          <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.6">
            <tr><td style="color:#6b7280;padding-right:12px">Name</td><td><strong>${escapeHtml(safeName)}</strong></td></tr>
            <tr><td style="color:#6b7280;padding-right:12px">Email</td><td><a href="mailto:${encodeURI(safeEmail)}" style="color:#2563eb">${escapeHtml(safeEmail)}</a></td></tr>
            <tr><td style="color:#6b7280;padding-right:12px">Ref</td><td style="color:#6b7280;font-family:ui-monospace,monospace;font-size:12px">${escapeHtml(contactId ?? "n/a")}</td></tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 24px 24px">
          <div style="white-space:pre-wrap;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;font-size:14px;line-height:1.6">${escapeHtml(message)}</div>
          <p style="margin:16px 0 0;font-size:12px;color:#6b7280">Reply directly to this email to answer the sender.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html, replyTo: safeEmail };
}

export default contactNotification;
