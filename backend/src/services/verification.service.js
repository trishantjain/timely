import User from "../models/auth/User.js";
import {
  generateVerificationToken,
  hashVerificationToken,
  RESEND_COOLDOWN_MS,
} from "../utils/verificationToken.js";
import { sendEmail } from "./email.service.js";
import { buildVerificationEmail } from "../../templates/verificationEmail.js";
import { APP_URL } from "../config/email.js";
import logger from "../utils/logger.js";

// =========================================
// ISSUE + SEND A VERIFICATION TOKEN
//
// Used both when an employee is created and when their email changes.
// Takes a full mongoose User document (not just an id) so callers who
// already have the doc in hand (e.g. right after User.create) don't
// need a redundant re-fetch.
// =========================================
export const issueVerificationToken = async (user) => {
  const { rawToken, tokenHash, expires } = generateVerificationToken();

  user.emailVerified = false;
  user.emailVerificationTokenHash = tokenHash;
  user.emailVerificationExpires = expires;
  user.emailVerificationLastSentAt = new Date();
  await user.save();

  const verifyUrl = `${APP_URL}/verify-email?token=${rawToken}`;
  const { subject, html } = buildVerificationEmail({
    employeeName: user.username,
    verifyUrl,
  });

  const result = await sendEmail({ to: user.email, subject, html });

  if (!result.success) {
    logger.error(
      "verification",
      `Failed to send verification email to ${user.email}`,
      result.error,
    );
  }

  return result;
};

// =========================================
// VERIFY A TOKEN (from the "Verify Email" link)
// =========================================
export const verifyEmailToken = async (rawToken) => {
  if (!rawToken) {
    return { success: false, message: "Verification token is required." };
  }

  const tokenHash = hashVerificationToken(rawToken);

  // Fields are select:false on the schema, so they must be explicitly
  // requested here.
  const user = await User.findOne({ emailVerificationTokenHash: tokenHash }).select(
    "+emailVerificationTokenHash +emailVerificationExpires",
  );

  if (!user) {
    // Deliberately vague: don't reveal whether a token existed but
    // was already used vs. never existed at all.
    return {
      success: false,
      message: "This verification link is invalid or has already been used.",
    };
  }

  if (!user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
    return {
      success: false,
      message: "This verification link has expired. Please request a new one.",
    };
  }

  user.emailVerified = true;
  user.emailVerificationTokenHash = null;
  user.emailVerificationExpires = null;
  await user.save();

  return { success: true, user };
};

// =========================================
// RESEND VERIFICATION (self-serve, rate-limited)
//
// Takes a user id (not a doc) so the controller doesn't need to worry
// about which fields were selected on whatever User doc it has on hand
// (e.g. req.user from the auth middleware).
// =========================================
export const requestResendVerification = async (userId) => {
  const user = await User.findById(userId).select(
    "+emailVerificationLastSentAt +emailVerificationExpires +emailVerificationTokenHash",
  );

  if (!user) {
    return { success: false, status: 404, message: "User not found." };
  }

  if (user.emailVerified) {
    return { success: false, status: 400, message: "This email address is already verified." };
  }

  if (user.emailVerificationLastSentAt) {
    const elapsed = Date.now() - user.emailVerificationLastSentAt.getTime();
    if (elapsed < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      return {
        success: false,
        status: 429,
        message: `Please wait ${waitSeconds}s before requesting another verification email.`,
      };
    }
  }

  // The cooldown above IS the "avoid unnecessary duplicate tokens"
  // guard: since only a hash is ever persisted, the previous raw
  // token can't be resent anyway, so a fresh token is issued here
  // (invalidating the old one) but only after the cooldown has passed.
  const result = await issueVerificationToken(user);
  console.log(result);

  if (!result.success) {
    return { success: false, status: 502, message: "Could not send verification email right now. Please try again shortly." };
  }

  return { success: true };
};

export default { issueVerificationToken, verifyEmailToken, requestResendVerification };
