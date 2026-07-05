import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"

import { addMember } from "@/api/projectAPI"

export default function AddMemberDialog({ projectId, refreshProject }) {

  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState("")

  const handleAdd = async () => {

    try {

      await addMember(projectId,{
        user_id: userId
      })

      if (refreshProject) refreshProject()

      setUserId("")
      setOpen(false)

    } catch (err) {

      console.error(err)

    }

  }

  return (

    <Dialog open={open} onOpenChange={setOpen}>

      <DialogTrigger asChild>
        <Button>Add Member</Button>
      </DialogTrigger>

      <DialogContent>

        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          <Input
            placeholder="User ID"
            value={userId}
            onChange={(e)=>setUserId(e.target.value)}
          />

          <Button onClick={handleAdd}>
            Add Member
          </Button>

        </div>

      </DialogContent>

    </Dialog>

  )
}