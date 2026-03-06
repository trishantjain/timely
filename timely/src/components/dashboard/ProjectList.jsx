import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Folder, ListTodo, Search, Users } from "lucide-react"

const projects = [
    {
        name: "Cloud Infrastructure Migration",
        desc: "Moving legacy servers to AWS environment.",
        tag: { label: "High", variant: "default" },
        members: 12,
        tasks: 48,
    },
    {
        name: "Mobile App Redesign",
        desc: "Updating UI/UX for the customer app.",
        tag: { label: "Medium", variant: "secondary" },
        members: 8,
        tasks: 27,
    },
    {
        name: "Annual Security Audit",
        desc: "Compliance checks and penetration testing.",
        tag: { label: "Low", variant: "outline" },
        members: 6,
        tasks: 20,
    },
    {
        name: "AI Recommendation Engine",
        desc: "Personalized content suggestions pipeline.",
        tag: { label: "High", variant: "default" },
        members: 10,
        tasks: 41,
    },
]

export default function ProjectList() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">ALL PROJECTS</CardTitle>
                    <Folder className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Search..." />
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {projects.map((project) => (
                    <div
                        key={project.name}
                        className="rounded-lg border bg-background p-3 hover:bg-muted/40 cursor-pointer"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <div className="truncate text-sm font-medium">{project.name}</div>
                                <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                    {project.desc}
                                </div>
                            </div>
                            <Badge variant={project.tag.variant} className="shrink-0">
                                {project.tag.label}
                            </Badge>
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {project.members} members
                            </div>
                            <div className="flex items-center gap-1">
                                <ListTodo className="h-3.5 w-3.5" />
                                {project.tasks} tasks
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
