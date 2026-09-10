import { renderEmailLayout, escapeHtml } from "./layout.js";

export const buildVerificationEmail = ({ employeeName, verifyUrl }) => {
  const subject = "Verify your email address — TIMELY";

  const bodyHtml = `
    <p>Hello ${escapeHtml(employeeName)},</p>
    <p>Please verify your email address to start receiving task notifications from TIMELY (new task assignments and your pending-tasks digest).</p>
    <p>This link expires in 24 hours. If you didn't expect this email, you can safely ignore it.</p>
  `;

  const html = renderEmailLayout({
    title: "Verify Your Email",
    bodyHtml,
    ctaLabel: "Verify Email",
    ctaUrl: verifyUrl,
  });

  return { subject, html };
};

export default { buildVerificationEmail };
