import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createUser } from "@/api/authAPI"

export default function CreateUserDialog() {

  const [username,setUsername] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")

  const handleCreate = async () => {

    try{

      await createUser({
        username,
        email,
        password
      })

      setUsername("")
      setEmail("")
      setPassword("")

    }catch(err){
      console.error(err)
    }

  }

  return(

    <div className="space-y-3">

      <Input
        placeholder="Username"
        value={username}
        onChange={(e)=>setUsername(e.target.value)}
      />

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

      <Button onClick={handleCreate}>
        Create User
      </Button>

    </div>

  )

}