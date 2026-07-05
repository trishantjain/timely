import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"

import { createTask } from "@/api/taskAPI"
import { Textarea } from "../ui/textarea"
import { getUsers } from "@/api/userAPI"

export default function AddTaskDialog({ projectId, refreshTasks }) {

    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState([])
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [priority, setPriority] = useState("medium");
    const [dueDate, setDueDate] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            const res = await getUsers()
            setUsers(res.data)
        }
        fetchUsers()
    }, [])

    const handleCreate = async () => {

        try {

            await createTask({
                title,
                description,
                assigned_to: assignedTo,
                priority,
                due_date: dueDate,
                project_id: projectId
            })


            refreshTasks()
            setOpen(false)

            setTitle("")
            setDescription("")
            setDueDate("")

            setOpen(false)

        } catch (err) {

            console.error(err)

        }

    }

    return (

        <Dialog open={open} onOpenChange={setOpen}>

            <DialogTrigger asChild>
                <Button>Add Task</Button>
            </DialogTrigger>

            <DialogContent>

                <DialogHeader>
                    <DialogTitle>Add Task</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">

                    <Input
                        placeholder="Task title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <Textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <select
                        className="w-full p-2 border rounded"
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                    >


                        <option value="">Assign user</option>

                        {users.map(user => (
                            <option key={user._id} value={user._id}>
                                {user.username}
                            </option>
                        ))}
                    </select>

                    <select
                        className="w-full p-2 border rounded"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >

                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>

                    </select>

                    <Input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />

                    <Button onClick={handleCreate}>
                        Create Task
                    </Button>

                </div>

            </DialogContent>

        </Dialog>

    )
}