import { resendClient, emailFrom } from "../config/email.js";
import logger from "../utils/logger.js";

// =========================================
// SEND EMAIL
//
// Single reusable entry point for every outgoing TIMELY email
// (verification, new-task, pending-tasks digest, and any future
// notification type). Controllers/services never touch Resend
// directly -- they build a subject/html payload and call this.
//
// Never throws: callers (task assignment, the daily digest job, etc.)
// should not fail or block normal API requests just because an email
// provider hiccup happened. Failures are logged and returned as
// { success: false, error } so a caller CAN act on it if it wants to
// (e.g. the digest job logs which employees didn't get their email).
// =========================================
export const sendEmail = async ({ to, subject, html }) => {
  if (!resendClient || !emailFrom) {
    logger.error(
      "email-service",
      "Email not sent -- Resend is not configured (missing RESEND_API_KEY or EMAIL_FROM).",
      { to, subject }
    );

    return { success: false, error: "Email service not configured" };
  }

  if (!to || !subject || !html) {
    logger.error("email-service", "Email not sent -- missing to/subject/html.", { to, subject });
    return { success: false, error: "Missing required email fields" };
  }

  try {
    const { data, error } = await resendClient.emails.send({
      from: emailFrom,
      to,
      subject,
      html,
    });

    if (error) {
      // Resend returns a structured error object rather than throwing --
      // log the message only, never any credential/config details.
      logger.error("email-service", `Resend rejected email to ${to}`, error);
      return { success: false, error: error.message || "Resend error" };
    }

    logger.info("email-service", `Email sent to ${to}`, { subject, id: data?.id });
    return { success: true, id: data?.id };
  } catch (err) {
    logger.error("email-service", `Failed to send email to ${to}`, err);
    return { success: false, error: err.message || "Unknown email error" };
  }
};

export default { sendEmail };
