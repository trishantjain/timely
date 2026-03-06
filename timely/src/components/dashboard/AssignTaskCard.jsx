import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function AssignTaskCard() {
    const assignees = useMemo(
        () => ["Sarah Chen", "Marcus Miller", "Elena Rodriguez", "David Kim"],
        []
    )

    const [title, setTitle] = useState("")
    const [dueDate, setDueDate] = useState("")
    const [assignee, setAssignee] = useState("")
    const [priority, setPriority] = useState("Medium")
    const [description, setDescription] = useState("")

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Assign New Task</CardTitle>
            </CardHeader>

            <CardContent>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="task-title" className="text-xs text-muted-foreground">
                            TASK TITLE
                        </Label>
                        <Input
                            id="task-title"
                            placeholder="e.g. Design User Profile"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="task-due" className="text-xs text-muted-foreground">
                                DUE DATE
                            </Label>
                            <Input
                                id="task-due"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-xs text-muted-foreground">ASSIGNEE</Label>
                            <Select value={assignee} onValueChange={setAssignee}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select assignee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {assignees.map((name) => (
                                        <SelectItem key={name} value={name}>
                                            {name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label className="text-xs text-muted-foreground">PRIORITY</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-xs text-muted-foreground">PROJECT</Label>
                            <Select defaultValue="Cloud Infrastructure Migration">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Cloud Infrastructure Migration">
                                        Cloud Infrastructure Migration
                                    </SelectItem>
                                    <SelectItem value="Mobile App Redesign">Mobile App Redesign</SelectItem>
                                    <SelectItem value="Annual Security Audit">Annual Security Audit</SelectItem>
                                    <SelectItem value="AI Recommendation Engine">
                                        AI Recommendation Engine
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label
                            htmlFor="task-desc"
                            className="text-xs text-muted-foreground"
                        >
                            DESCRIPTION
                        </Label>
                        <Textarea
                            id="task-desc"
                            placeholder="Explain the task requirements and success criteria..."
                            className="min-h-[96px]"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={() => {
                                // UI-only: no persistence wired yet.
                                setTitle("")
                                setDueDate("")
                                setAssignee("")
                                setPriority("Medium")
                                setDescription("")
                            }}
                        >
                            Assign Task
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
