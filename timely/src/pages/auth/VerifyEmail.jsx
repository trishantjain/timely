import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { verifyEmail } from "../../api/authAPI";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // "verifying" | "success" | "error"
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("This verification link is missing its token.");
      return;
    }

    verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.data?.message || "Email verified successfully.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err?.response?.data?.message ||
            "This verification link is invalid or has expired.",
        );
      });
    // Only run once per token — intentionally excludes searchParams
    // from deps so re-renders don't re-trigger the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-[380px] p-6 shadow rounded-xl space-y-4 text-center">
        <h2 className="text-xl font-bold">TIMELY</h2>

        {status === "verifying" && (
          <p className="text-sm text-gray-500">Verifying your email…</p>
        )}

        {status === "success" && (
          <>
            <p className="text-sm text-green-600 font-medium">{message}</p>
            <Button className="w-full" onClick={() => navigate("/")}>
              Go to Login
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <p className="text-sm text-red-500 font-medium">{message}</p>
            <p className="text-xs text-gray-500">
              You can request a new verification email after logging in.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/")}
            >
              Go to Login
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
