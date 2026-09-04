import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyProjects } from "@/api/assignmentAPI";
import { getMyTasks } from "@/api/taskAPI";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  FolderKanban,
  ClipboardList,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from "lucide-react";

const STATUS_STYLES = {
  ACTIVE: "border-border bg-secondary text-secondary-foreground",
  COMPLETED: "border-border bg-muted text-muted-foreground",
  ON_HOLD: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

export default function UserDashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      try {
        setProjectsLoading(true);

        const res = await getMyProjects();

        if (isMounted) {
          setProjects(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error(err);

        if (isMounted) setProjects([]);
      } finally {
        if (isMounted) setProjectsLoading(false);
      }
    };

    const loadTasks = async () => {
      try {
        setTasksLoading(true);

        const res = await getMyTasks();

        if (isMounted) {
          setTasks(Array.isArray(res.data?.data) ? res.data.data : []);
        }
      } catch (err) {
        console.error(err);

        if (isMounted) setTasks([]);
      } finally {
        if (isMounted) setTasksLoading(false);
      }
    };

    loadProjects();
    loadTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  // ==========================================
  // DASHBOARD SUMMARY
  // ==========================================
  const stats = useMemo(() => {
    const pending = tasks.filter(
      (t) => t.status === "PENDING" || t.status === "IN_PROGRESS",
    ).length;

    const overdue = tasks.filter(
      (t) =>
        t.deadline &&
        new Date(t.deadline) < new Date() &&
        !["APPROVED", "SUBMITTED", "UNDER_REVIEW"].includes(t.status),
    ).length;

    const submitted = tasks.filter((t) =>
      ["SUBMITTED", "UNDER_REVIEW", "APPROVED"].includes(t.status),
    ).length;

    return {
      projectCount: projects.length,
      pending,
      overdue,
      submitted,
    };
  }, [tasks, projects]);

  // Small preview of the most pressing tasks — quick glance without
  // an extra click into "My Tasks".
  const upcomingTasks = useMemo(() => {
    return [...tasks]
      .filter((t) => !["APPROVED"].includes(t.status))
      .sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      })
      .slice(0, 4);
  }, [tasks]);

  return (
    <div className="p-6 mx-auto max-w-7xl lg:p-8">
      <div className="flex flex-col gap-1 mb-6">
        <p className="text-sm text-muted-foreground">Employee Workspace</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          My Projects
        </h1>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center rounded-lg h-9 w-9 bg-muted shrink-0">
              <FolderKanban size={18} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Projects</p>
              <p className="text-xl font-semibold leading-tight">
                {projectsLoading ? "—" : stats.projectCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center rounded-lg h-9 w-9 bg-muted shrink-0">
              <Clock size={18} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Open Tasks</p>
              <p className="text-xl font-semibold leading-tight">
                {tasksLoading ? "—" : stats.pending}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center rounded-lg h-9 w-9 bg-muted shrink-0">
              <CheckCircle2 size={18} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">In Review / Done</p>
              <p className="text-xl font-semibold leading-tight">
                {tasksLoading ? "—" : stats.submitted}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                stats.overdue > 0 ? "bg-destructive/10" : "bg-muted"
              }`}
            >
              <AlertTriangle
                size={18}
                className={
                  stats.overdue > 0
                    ? "text-destructive"
                    : "text-muted-foreground"
                }
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Overdue</p>
              <p className="text-xl font-semibold leading-tight">
                {tasksLoading ? "—" : stats.overdue}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* ================= PROJECTS ================= */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Projects</h2>
          </div>

          {projectsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[0, 1].map((i) => (
                <Card key={i} className="border-border bg-card">
                  <CardContent className="p-5">
                    <div className="w-2/3 h-4 rounded bg-muted animate-pulse" />
                    <div className="w-full h-3 mt-3 rounded bg-muted animate-pulse" />
                    <div className="w-1/2 h-3 mt-2 rounded bg-muted animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                <div className="flex items-center justify-center border rounded-full w-11 h-11 bg-muted">
                  <FolderKanban size={20} className="text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">
                  No projects assigned yet
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Once an admin assigns you to a project, it will show up
                  here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map((assignment) => {
                const project = assignment.project;

                if (!project) return null;

                return (
                  <Card
                    key={project._id}
                    className="transition-colors border-border bg-card hover:bg-muted/40"
                  >
                    <CardContent className="flex flex-col h-full p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold leading-snug text-foreground line-clamp-1">
                          {project.name}
                        </h3>

                        {assignment.status && (
                          <Badge
                            variant="outline"
                            className={
                              STATUS_STYLES[assignment.status] ||
                              "border-border bg-muted text-muted-foreground"
                            }
                          >
                            {assignment.status.replaceAll("_", " ")}
                          </Badge>
                        )}
                      </div>

                      {project.description && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      {assignment.domain?.name && (
                        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                          <Layers size={13} />
                          {assignment.domain.name}
                        </div>
                      )}

                      <div className="flex justify-end mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() =>
                            navigate(`/dashboard/project/${project._id}`)
                          }
                        >
                          Open Project
                          <ChevronRight size={15} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= UPCOMING TASKS ================= */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Up Next</h2>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1 -mr-2 text-muted-foreground"
              onClick={() => navigate("/employee/tasks")}
            >
              <ClipboardList size={15} />
              All Tasks
            </Button>
          </div>

          {tasksLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Card key={i} className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="w-3/4 h-3 rounded bg-muted animate-pulse" />
                    <div className="w-1/2 h-3 mt-2 rounded bg-muted animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : upcomingTasks.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="py-8 text-sm text-center text-muted-foreground">
                You're all caught up — no open tasks right now.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <Card
                  key={`${task.componentId}-${task.taskId}`}
                  className="transition-colors border-border bg-card hover:bg-muted/40"
                >
                  <button
                    className="w-full text-left"
                    onClick={() =>
                      navigate(
                        `/employee/tasks/${task.componentId}/${task.taskId}`,
                      )
                    }
                  >
                    <CardContent className="p-4">
                      <p className="text-sm font-medium truncate text-foreground">
                        {task.taskTitle}
                      </p>

                      <p className="mt-1 text-xs truncate text-muted-foreground">
                        {task.projectName}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <Badge
                          variant="outline"
                          className="border-border bg-muted text-[11px] text-muted-foreground"
                        >
                          {task.status.replaceAll("_", " ")}
                        </Badge>

                        {task.deadline && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(task.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
