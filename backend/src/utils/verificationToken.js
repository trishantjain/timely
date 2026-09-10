import crypto from "crypto";

// How long a verification token stays valid before it must be re-requested.
export const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Minimum time an employee must wait between "resend verification"
// requests, so a script (or an impatient click) can't spam the mail
// provider or flood a user's inbox.
export const RESEND_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes

// The raw token goes out in the email link; only its SHA-256 hash is
// ever persisted, so a DB read alone can't be replayed as a valid
// verification link (same principle as never storing plaintext passwords).
export const generateVerificationToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashVerificationToken(rawToken);
  const expires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

  return { rawToken, tokenHash, expires };
};

export const hashVerificationToken = (rawToken) =>
  crypto.createHash("sha256").update(rawToken).digest("hex");
