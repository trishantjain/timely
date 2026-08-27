import { Button } from "@/components/ui/button"

export default function Navbar() {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <h1 className="text-xl font-bold">Task Manager</h1>

      {/* <Button variant="outline">
        Logout
      </Button> */}
    </div>
  )
}