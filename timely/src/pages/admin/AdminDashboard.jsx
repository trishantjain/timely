import StatsCards from "@/components/dashboard/StatsCards";
import ProjectList from "@/components/project/ProjectList";
import { getProjects } from "@/api/projectAPI";
import { useState, useEffect } from "react";
import CreateProjectDialog from "@/components/project/CreateProjectDialog";

import { Button } from "@/components/ui/button";

import {
    Plus,
    UserPlus,
    FolderKanban
} from "lucide-react";

export default function AdminDashboard() {

    const [projects, setProjects] = useState([]);

    const [openCreateProject, setOpenCreateProject] =
        useState(false);

    const fetchProjects = async () => {

        try {

            const res = await getProjects();

            setProjects(res.data);

        }
        catch (error) {

            console.error(
                "Error fetching projects:",
                error
            );

        }

    };

    useEffect(() => {

        fetchProjects();

    }, []);

    return (

        <div className="min-h-full p-4 sm:p-6 lg:p-8">

            {/* PAGE HEADER */}

            <div className="flex flex-col gap-5 pb-6 mb-6 border-b lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-start gap-4">

                    <div
                        className="flex items-center justify-center border w-11 h-11 rounded-xl bg-muted"
                    >
                        <FolderKanban
                            size={22}
                        />
                    </div>

                    <div>

                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">

                            Dashboard

                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground sm:text-base">

                            Overview of your projects, employees and workspace activity.

                        </p>

                    </div>

                </div>


                {/* ACTION BUTTONS */}

                <div className="flex flex-wrap items-center gap-3">

                    <Button
                        variant="outline"
                        className="gap-2"
                    >

                        <UserPlus size={18} />

                        Invite Employee

                    </Button>


                    <Button
                        className="gap-2 shadow-sm"
                        onClick={() => {

                            setOpenCreateProject(true);

                        }}
                    >

                        <Plus size={18} />

                        New Project

                    </Button>

                </div>

            </div>


            {/* STATS */}

            <StatsCards
                stats={{

                    projects: projects.length,

                    domains: 0,

                    employees: 0,

                    documents: 0

                }}
            />


            {/* PROJECT SECTION */}

            <div className="mt-8">

                <div className="flex items-end justify-between mb-4">

                    <div>

                        <h2 className="text-xl font-semibold">

                            Recent Projects

                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">

                            View and manage your active projects.

                        </p>

                    </div>

                    <div className="hidden text-sm text-muted-foreground sm:block">

                        {projects.length}{" "}

                        {projects.length === 1
                            ? "project"
                            : "projects"}

                    </div>

                </div>


                <div className="w-full">

                    <ProjectList
                        projects={projects}
                        refreshProjects={fetchProjects}
                    />

                </div>

            </div>


            {/* CREATE PROJECT DIALOG */}

            <CreateProjectDialog

                open={openCreateProject}

                onClose={() =>
                    setOpenCreateProject(false)
                }

                onSuccess={() => {

                    fetchProjects();

                    setOpenCreateProject(false);

                }}

            />

        </div>

    );

}