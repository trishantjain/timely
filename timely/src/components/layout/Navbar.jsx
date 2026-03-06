import { Button } from "@/components/ui/button"

export default function Navbar() {
  return (
    <div className="flex justify-between items-center p-4 border-b bg-white">
      <h1 className="text-xl font-bold">Task Manager</h1>

      <Button variant="outline">
        Logout
      </Button>
    </div>
  )
}