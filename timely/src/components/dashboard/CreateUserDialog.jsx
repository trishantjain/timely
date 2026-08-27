import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUser } from "@/api/authAPI";

export default function CreateUserDialog() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleCreate = async () => {
    try {
      await createUser({
        username,
        email,
        password,
      });

      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="bg-background"
      />

      <Input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-background"
      />

      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="bg-background"
      />

      <div className="flex justify-end pt-1">
        <Button onClick={handleCreate}>Create User</Button>
      </div>
    </div>
  );
}
