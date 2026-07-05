import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "../../services/api"
import { useNavigate } from "react-router-dom"

export default function Login() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login",
        {
          email,
          password
        })

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);

      // NAVIGATING USER BASED ON ROLE
      const role = res.data.user.role

      if (role === "admin") {
        navigate("/admin")
      } else {
        navigate("/dashboard")
      }

    } catch (err) {
      console.error(err);
    }
  }

  const handleKeyDown = (e) => {

    if (e.key === "Enter") {
      handleLogin()
    }

  }

  return (
    <div className="flex items-center justify-center h-screen">

      <div className="w-[350px] p-6 shadow rounded-xl space-y-4">

        <h2 className="text-xl font-bold text-center">
          Login
        </h2>

        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown} 
        />

        <Button
          className="w-full"
          onClick={handleLogin}
        >
          Login
        </Button>

      </div>

    </div>
  )
}