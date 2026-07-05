import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Folder, Search, Users, Layers } from "lucide-react"
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import DeleteProjectDialog from "@/components/project/DeleteProjectDialog";


export default function ProjectList({ projects = [],
    refreshProjects }) {
    const navigate = useNavigate();

    const [search, setSearch] = useState("")

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">ALL PROJECTS</CardTitle>
                    <Folder className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="relative mt-2">
                    <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {filteredProjects?.map((project) => (
                    <div
                        key={project._id}
                        onClick={() => navigate(`/admin/project/${project._id}`)}
                        className="p-4 transition border rounded-lg cursor-pointer hover:bg-muted"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="text-sm font-semibold">
                                    {project.name}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                    {project.description}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">

                                    {project.domains?.map(domain => (

                                        <Badge
                                            key={domain._id}
                                            className="text-white border-0"
                                            style={{
                                                backgroundColor: domain.color
                                            }}
                                        >
                                            {domain.name}
                                        </Badge>

                                    ))}

                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">

                            <Badge
                                variant={
                                    project.status === "active"
                                        ? "secondary"
                                        : "outline"
                                }
                            >
                                {project.status}
                            </Badge>

                            <DeleteProjectDialog
                                project={project}
                                refreshProjects={refreshProjects}
                            />

                        </div>

                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {project.members?.length || 0} members
                            </div>
                            <div className="flex items-center gap-1">
                                <Layers className="h-3.5 w-3.5" />
                                {project.domains?.length || 0} Domains
                            </div>
                        </div>
                    </div>
                ))}
                {filteredProjects.length === 0 && (

                    <div className="py-8 text-sm text-center text-muted-foreground">
                        No projects found.
                    </div>

                )}
            </CardContent>
        </Card >
    )
}
