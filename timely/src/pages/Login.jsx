import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "../services/api"

export default function Login() {

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")

  const handleLogin = async () => {
    const res = await api.post("/auth/login",{email,password})
    console.log(res.data)
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
          onChange={(e)=>setEmail(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
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