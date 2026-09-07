import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg = type === "error" ? "bg-red-500" : "bg-green-600";

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm ${bg} animate-in fade-in slide-in-from-top-2`}
    >
      {message}
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }
  const navigate = useNavigate();

  const showToast = (message, type = "error") => {
    setToast({ message, type });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showToast("Please enter both email and password.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      showToast("Login successful! Redirecting...", "success");

      const role = res.data.user.role;

      setTimeout(() => {
        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }, 800);
    } catch (err) {
      console.error(err);

      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status === 401 || status === 400) {
        showToast(message || "Invalid email or password.", "error");
      } else if (!err?.response) {
        showToast("Network error. Please check your connection.", "error");
      } else {
        showToast(
          message || "Something went wrong. Please try again.",
          "error",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="w-[350px] p-6 shadow rounded-xl space-y-4">
        <h2 className="text-xl font-bold text-center">Login</h2>

        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />

        <Button className="w-full" onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </div>
    </div>
  );
}
