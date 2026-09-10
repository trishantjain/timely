import { Resend } from "resend";
import logger from "../utils/logger.js";

// RESEND_API_KEY / EMAIL_FROM must never be hard-coded or exposed to the
// frontend -- they only ever live here, read from process.env.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;

// APP_URL is the base URL used to build links back into TIMELY from
// emails. Falls back to CLIENT_URL (already used for CORS) so existing
// deployments don't need a new required env var, but APP_URL can be set
// separately if the public app URL ever differs from CLIENT_URL.
export const APP_URL = process.env.APP_URL || process.env.CLIENT_URL || "http://localhost:5173";

if (!RESEND_API_KEY) {
  logger.warn("email-config", "RESEND_API_KEY is not set -- outgoing emails will fail until it is configured.");
}

if (!EMAIL_FROM) {
  logger.warn("email-config", "EMAIL_FROM is not set -- outgoing emails will fail until it is configured.");
}

// Resend requires a verified sending domain in production. EMAIL_FROM
// should be an address on that verified domain, e.g.
// "TIMELY <notifications@yourdomain.com>".
export const resendClient = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export const emailFrom = EMAIL_FROM;
