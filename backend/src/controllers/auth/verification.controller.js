import { verifyEmailToken, requestResendVerification } from "../../services/verification.service.js";

// VERIFY EMAIL (public -- the employee may not be logged in when they
// click the link, and the token itself is the credential here)
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    const result = await verifyEmailToken(token);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    return res.json({ success: true, message: "Email verified successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// RESEND VERIFICATION EMAIL (requires login -- always resends for the
// logged-in employee's own account, never an arbitrary address)
export const resendVerification = async (req, res) => {
  try {
    const result = await requestResendVerification(req.user.id);

    if (!result.success) {
      return res.status(result.status || 400).json({ success: false, message: result.message });
    }

    return res.json({ success: true, message: "Verification email sent." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
