import StatsCards from "@/components/dashboard/StatsCards";
import ProjectList from "@/components/project/ProjectList";
import { getProjects } from "@/api/projectAPI";
import { useState, useEffect } from "react";
import CreateProjectDialog from "@/components/project/CreateProjectDialog";

import { Button } from "@/components/ui/button";

import { Plus, UserPlus, FolderKanban } from "lucide-react";

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);

  const [openCreateProject, setOpenCreateProject] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await getProjects();

      setProjects(res.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      {/* PAGE HEADER */}

      <div className="flex flex-col gap-5 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center border h-11 w-11 shrink-0 rounded-xl bg-muted/40">
            <FolderKanban size={21} />
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

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button variant="outline" className="gap-2">
            <UserPlus size={17} />
            Invite Employee
          </Button>

          <Button
            className="gap-2 shadow-sm"
            onClick={() => {
              setOpenCreateProject(true);
            }}
          >
            <Plus size={17} />
            New Project
          </Button>
        </div>
      </div>

      {/* STATS */}

      <div className="mt-2">
        <StatsCards
          stats={{
            projects: projects.length,
            domains: 0,
            employees: 0,
            documents: 0,
          }}
        />
      </div>

      {/* PROJECT SECTION */}

      <div className="mt-8">
        <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold sm:text-xl">
              Recent Projects
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              View and manage your active projects.
            </p>
          </div>

          <div className="flex w-fit items-center rounded-lg border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground sm:text-sm">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </div>
        </div>

        <div className="overflow-hidden border shadow-sm rounded-2xl bg-card">
          <ProjectList projects={projects} refreshProjects={fetchProjects} />
        </div>
      </div>

      {/* CREATE PROJECT DIALOG */}

      <CreateProjectDialog
        open={openCreateProject}
        onClose={() => setOpenCreateProject(false)}
        onSuccess={() => {
          fetchProjects();

          setOpenCreateProject(false);
        }}
      />
    </div>
  );
}
