import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
    FolderKanban,
    Search,
    Users,
    Layers,
    ArrowRight,
    MoreHorizontal
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useState } from "react";

import DeleteProjectDialog from "@/components/project/DeleteProjectDialog";

export default function ProjectList({
    projects = [],
    refreshProjects
}) {

    const navigate = useNavigate();

    const [search, setSearch] = useState("");

    const filteredProjects = projects.filter((project) =>
        project.name
            ?.toLowerCase()
            .includes(search.toLowerCase())
    );

    return (

        <Card className="border shadow-sm">

            {/* HEADER */}

            <CardHeader className="pb-5">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-3">

                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">

                            <FolderKanban
                                size={20}
                            />

                        </div>

                        <div>

                            <CardTitle className="text-lg">

                                Projects

                            </CardTitle>

                            <p className="mt-1 text-sm text-muted-foreground">

                                Manage and access your projects

                            </p>

                        </div>

                    </div>


                    {/* SEARCH */}

                    <div className="relative w-full sm:w-64">

                        <Search
                            className="absolute w-4 h-4 -translate-y-1/2  left-3 top-1/2 text-muted-foreground"
                        />

                        <Input
                            className="pl-9"
                            placeholder="Search projects..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>

                </div>

            </CardHeader>


            <CardContent>

                {filteredProjects.length === 0 ? (

                    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-xl">

                        <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-muted">

                            <FolderKanban
                                size={22}
                                className="text-muted-foreground"
                            />

                        </div>

                        <h3 className="font-semibold">

                            No projects found

                        </h3>

                        <p className="max-w-sm mt-1 text-sm text-muted-foreground">

                            {search
                                ? "Try changing your search."
                                : "Create your first project to get started."
                            }

                        </p>

                    </div>

                ) : (

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

                        {filteredProjects.map((project) => (

                            <div
                                key={project._id}
                                className="
                                    group
                                    relative
                                    flex
                                    flex-col
                                    min-h-[220px]
                                    p-5
                                    transition-all
                                    duration-200
                                    border
                                    rounded-xl
                                    cursor-pointer
                                    hover:shadow-md
                                    hover:border-foreground/20
                                "
                                onClick={() =>
                                    navigate(
                                        `/admin/project/${project._id}`
                                    )
                                }
                            >

                                {/* TOP ROW */}

                                <div className="flex items-start justify-between gap-3">

                                    <div className="flex items-center min-w-0 gap-3">

                                        <div
                                            className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-lg  bg-muted"
                                        >

                                            <FolderKanban
                                                size={19}
                                            />

                                        </div>

                                        <div className="min-w-0">

                                            <h3 className="font-semibold truncate">

                                                {project.name}

                                            </h3>

                                            <p className="mt-0.5 text-xs text-muted-foreground">

                                                Project

                                            </p>

                                        </div>

                                    </div>


                                    <div
                                        onClick={(e) =>
                                            e.stopPropagation()
                                        }
                                    >

                                        <DeleteProjectDialog
                                            project={project}
                                            refreshProjects={
                                                refreshProjects
                                            }
                                        />

                                    </div>

                                </div>


                                {/* DESCRIPTION */}

                                <p className="mt-4 text-sm leading-5 text-muted-foreground line-clamp-2">

                                    {project.description ||
                                        "No project description available."}

                                </p>


                                {/* DOMAINS */}

                                <div className="mt-4">

                                    <p className="mb-2 text-xs font-medium text-muted-foreground">

                                        Required Domains

                                    </p>

                                    <div className="flex flex-wrap gap-1.5">

                                        {project.domains?.length > 0 ? (

                                            project.domains
                                                .slice(0, 3)
                                                .map((domain) => (

                                                    <Badge
                                                        key={domain._id}
                                                        className="text-xs border-0"
                                                        style={{
                                                            backgroundColor:
                                                                domain.color,
                                                            color: "#fff"
                                                        }}
                                                    >

                                                        {domain.name}

                                                    </Badge>

                                                ))

                                        ) : (

                                            <span className="text-xs text-muted-foreground">

                                                No domains assigned

                                            </span>

                                        )}


                                        {project.domains?.length > 3 && (

                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >

                                                +{project.domains.length - 3}

                                            </Badge>

                                        )}

                                    </div>

                                </div>


                                {/* BOTTOM */}

                                <div className="flex items-center justify-between pt-4 mt-auto">

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">

                                        <div className="flex items-center gap-1.5">

                                            <Users
                                                size={14}
                                            />

                                            <span>

                                                {project.members?.length || 0}

                                                {" "}
                                                Members

                                            </span>

                                        </div>


                                        <div className="flex items-center gap-1.5">

                                            <Layers
                                                size={14}
                                            />

                                            <span>

                                                {project.domains?.length || 0}

                                                {" "}
                                                Domains

                                            </span>

                                        </div>

                                    </div>


                                    <div
                                        className="flex items-center justify-center w-8 h-8 transition rounded-full opacity-0  group-hover:opacity-100 bg-muted"
                                    >

                                        <ArrowRight
                                            size={16}
                                        />

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </CardContent>

        </Card>

    );
}