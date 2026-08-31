import { useEffect, useState } from "react";
import { Plus, UserPlus, FolderKanban } from "lucide-react";

import StatsCards from "@/components/dashboard/StatsCards";
import ProjectList from "@/components/project/ProjectList";
import CreateProjectDialog from "@/components/project/CreateProjectDialog";

import { getProjects } from "@/api/projectAPI";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-full p-4 sm:p-5 lg:p-6">
      {/* PAGE HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 border rounded-xl shrink-0 bg-muted/40">
            <FolderKanban size={19} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-0.5 text-sm text-muted-foreground">
              Overview of your projects, employees and workspace activity.
            </p>
          </div>
        </div>

        {/* ACTIONS */}

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-2">
            <UserPlus size={16} />
            Invite Employee
          </Button>

          <Button
            className="gap-2 shadow-sm"
            onClick={() => setOpenCreateProject(true)}
          >
            <Plus size={17} />
            New Project
          </Button>
        </div>
      </div>

      {/* STATS */}

      <div className="mt-5">
        <StatsCards
          stats={{
            projects: projects.length,
            domains: 0,
            employees: 0,
            documents: 0,
          }}
        />
      </div>

      {/* PROJECTS */}

      <section className="mt-6">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <h2 className="text-lg font-semibold">Recent Projects</h2>

            <p className="mt-0.5 text-sm text-muted-foreground">
              View and manage your active projects.
            </p>
          </div>

          <div className="shrink-0 rounded-lg border bg-muted/30 px-3 py-1.5 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {projects.length}
            </span>{" "}
            {projects.length === 1 ? "project" : "projects"}
          </div>
        </div>

        {/* PROJECT LIST ALREADY CONTAINS ITS OWN CARD */}

        <ProjectList projects={projects} refreshProjects={fetchProjects} />
      </section>

      {/* CREATE PROJECT */}

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
