import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  FolderKanban,
  Search,
  Users,
  Layers,
  ArrowUpRight,
} from "lucide-react";

import DeleteProjectDialog from "@/components/project/DeleteProjectDialog";

export default function ProjectList({ projects = [], refreshProjects }) {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const filteredProjects = projects.filter((project) =>
    project.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const getMemberCount = (project) => {
    if (typeof project.memberCount === "number") {
      return project.memberCount;
    }

    return Array.isArray(project.members) ? project.members.length : 0;
  };

  const getDomainCount = (project) => {
    if (typeof project.domainCount === "number") {
      return project.domainCount;
    }

    return Array.isArray(project.domains) ? project.domains.length : 0;
  };

  const openProject = (projectId) => {
    navigate(`/admin/project/${projectId}`);
  };

  return (
    <Card className="border shadow-sm">
      {/* HEADER */}

      <CardHeader className="px-6 py-4 border-b">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Projects</CardTitle>

            <p className="mt-0.5 text-sm text-muted-foreground">
              Manage and access your active projects
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* PROJECT COUNT */}

            <span className="hidden text-sm text-muted-foreground sm:inline">
              <span className="font-semibold text-foreground">
                {filteredProjects.length}
              </span>{" "}
              {filteredProjects.length === 1 ? "project" : "projects"}
            </span>

            {/* SEARCH */}

            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className="absolute -translate-y-1/2 left-3 top-1/2 text-muted-foreground"
              />

              <Input
                className="h-10 pl-9"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="mb-4 text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {filteredProjects.length}
          </span>{" "}
          {filteredProjects.length === 1 ? "project" : "projects"}
        </div>

        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center border border-dashed rounded-xl py-14">
            <FolderKanban size={22} className="mb-3 text-muted-foreground" />

            <h3 className="font-semibold">No projects found</h3>

            <p className="mt-1 text-sm text-muted-foreground">
              {search
                ? "Try changing your search."
                : "Create your first project to get started."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => {
              const memberCount = getMemberCount(project);
              const domainCount = getDomainCount(project);

              return (
                <div
                  key={project._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openProject(project._id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openProject(project._id);
                    }
                  }}
                  className="
    group
    relative
    flex
    min-h-[150px]
    cursor-pointer
    flex-col
    rounded-xl
    border
    bg-card
    px-5
    py-4
    transition-all
    duration-200
    hover:-translate-y-[1px]
    hover:border-orange-400/70
    hover:shadow-md
    focus:outline-none
    focus:ring-2
    focus:ring-orange-400/50
  "
                >
                  {/* HEADER */}

                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center transition-colors border rounded-lg h-9 w-9 shrink-0 bg-muted/50 group-hover:border-orange-200 group-hover:bg-orange-50">
                      <FolderKanban
                        size={17}
                        className="transition-colors text-muted-foreground group-hover:text-orange-600"
                      />
                    </div>

                    {/* PROJECT NAME - PRIMARY FOCUS */}

                    <h3 className="flex-1 min-w-0 text-xl font-bold tracking-tight truncate transition-colors text-foreground group-hover:text-orange-600">
                      {project.name}
                    </h3>

                    <div
                      className="transition-opacity duration-200 opacity-0 shrink-0 group-hover:opacity-100 group-focus-within:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DeleteProjectDialog
                        project={project}
                        refreshProjects={refreshProjects}
                      />
                    </div>
                  </div>

                  {/* DESCRIPTION - CENTER OF CARD */}

                  <div className="flex items-center justify-center flex-1 py-3">
                    <p
                      className="
        line-clamp-2
        max-w-[90%]
        text-center
        text-sm
        leading-5
        text-muted-foreground
      "
                    >
                      {project.description ||
                        "No project description available."}
                    </p>
                  </div>

                  {/* COMPACT FOOTER */}

                  <div className="flex items-center justify-between border-t pt-2.5">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {/* MEMBERS */}

                      <div className="flex items-center gap-1.5">
                        <Users size={15} />

                        <span>
                          <span className="font-medium text-foreground">
                            {memberCount}
                          </span>{" "}
                          {memberCount === 1 ? "member" : "members"}
                        </span>
                      </div>

                      {/* DOMAINS */}

                      <div className="flex items-center gap-1.5">
                        <Layers size={15} />

                        <span>
                          <span className="font-medium text-foreground">
                            {domainCount}
                          </span>{" "}
                          {domainCount === 1 ? "domain" : "domains"}
                        </span>
                      </div>
                    </div>

                    {/* OPEN INDICATOR */}

                    <ArrowUpRight
                      size={17}
                      className="transition-colors text-muted-foreground group-hover:text-orange-600"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
