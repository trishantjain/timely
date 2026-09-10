// Shared visual shell for every TIMELY email. Kept as a plain function
// (no template engine dependency) that returns an HTML string --
// consistent branding/CTA styling in one place instead of duplicated
// inline styles in every template file.

export const renderEmailLayout = ({ title, bodyHtml, ctaLabel, ctaUrl }) => `
<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background-color:#f4f5f7; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">
            <tr>
              <td style="background-color:#111827; padding:20px 32px;">
                <span style="color:#ffffff; font-size:18px; font-weight:bold; letter-spacing:0.5px;">TIMELY</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px 0; font-size:20px; color:#111827;">${title}</h1>
                <div style="font-size:14px; line-height:1.6; color:#374151;">
                  ${bodyHtml}
                </div>
                ${
                  ctaUrl
                    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                        <tr>
                          <td style="border-radius:6px; background-color:#111827;">
                            <a href="${ctaUrl}" style="display:inline-block; padding:12px 24px; font-size:14px; font-weight:bold; color:#ffffff; text-decoration:none; border-radius:6px;">
                              ${ctaLabel}
                            </a>
                          </td>
                        </tr>
                      </table>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px; background-color:#f9fafb; border-top:1px solid #e5e7eb;">
                <p style="margin:0; font-size:12px; color:#9ca3af;">
                  This is an automated notification from TIMELY. Please don't reply to this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

// Minimal HTML-escaping for user-controlled strings (employee names,
// task titles, project names) interpolated into email HTML.
export const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
