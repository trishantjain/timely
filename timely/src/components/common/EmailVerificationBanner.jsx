import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { resendVerification } from "../../api/authAPI";

// Reads the logged-in user straight from localStorage (same object
// Login.jsx stores on sign-in) rather than adding a new context/store
// just for this. Once emailVerified flips to true server-side, it
// naturally stops appearing the next time the user logs in / the
// stored object is refreshed.
export default function EmailVerificationBanner() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // Malformed/missing localStorage value -- just don't show the banner.
    }
  }, []);

  if (!user || user.role !== "employee" || user.emailVerified) {
    return null;
  }

  const handleResend = async () => {
    setStatus("sending");
    setErrorMessage("");

    try {
      await resendVerification();
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err?.response?.data?.message || "Could not send verification email. Please try again.",
      );
    }
  };

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <p className="text-sm text-amber-800">
        Your email address isn't verified yet. You won't receive task
        notification emails until it's confirmed.
        {status === "sent" && (
          <span className="ml-2 font-medium text-green-700">
            Verification email sent — check your inbox.
          </span>
        )}
        {status === "error" && (
          <span className="ml-2 font-medium text-red-600">{errorMessage}</span>
        )}
      </p>

      <Button
        size="sm"
        variant="outline"
        disabled={status === "sending" || status === "sent"}
        onClick={handleResend}
      >
        {status === "sending"
          ? "Sending…"
          : status === "sent"
            ? "Sent"
            : "Resend verification email"}
      </Button>
    </div>
  );
}
