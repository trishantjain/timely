import { getProjectById } from "@/api/projectAPI";
import { getMyTasks } from "@/api/taskAPI";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  ArrowLeft,
  FileText,
  FolderKanban,
  ClipboardList,
  ChevronRight,
  Calendar,
  CheckSquare,
  Tag,
  UserCircle2,
  ClipboardCheck,
} from "lucide-react";

const STATUS_COLORS = {
  PENDING: "border-border bg-muted text-muted-foreground",
  IN_PROGRESS: "border-border bg-secondary text-secondary-foreground",
  SUBMITTED: "border-border bg-secondary text-secondary-foreground",
  UNDER_REVIEW: "border-border bg-secondary text-secondary-foreground",
  APPROVED: "border-border bg-secondary text-secondary-foreground",
  REJECTED: "border-destructive/40 bg-destructive/10 text-destructive",
};

export default function EmployeeProjectDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState("tasks");

  // TASKS FOR THIS PROJECT — shown inline in the "My Tasks" tab so employees
  // don't have to leave the project to see (and open) their tasks.
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  // KEEPING THE ORIGINAL WORKING API LOGIC
  const loadProject = async () => {
    try {
      const res = await getProjectById(id);

      setProject(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTasks = async () => {
    try {
      setTasksLoading(true);

      const res = await getMyTasks(id);

      setTasks(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);

      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  // Re-run whenever the project id changes so switching projects (e.g. via
  // the sidebar) always reloads the right project's tasks — never stale
  // tasks left over from a previously viewed project.
  useEffect(() => {
    loadProject();
    loadTasks();
  }, [id]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  }, [tasks]);

  if (!project) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[50vh]">
        <p className="text-sm text-muted-foreground">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl p-6 mx-auto lg:p-8">
      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-5 text-sm transition-colors text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to Projects
      </button>

      {/* COMPACT PROJECT HEADER */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center border rounded-lg w-11 h-11 shrink-0 bg-muted">
              <FolderKanban size={21} />
            </div>

            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Project</p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight">
                {project.name}
              </h1>

              {project.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {project.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TABS */}
      <div className="flex gap-6 mt-6 border-b">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "tasks"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ClipboardList size={17} />
          My Tasks
        </button>

        <button
          onClick={() => setActiveTab("documents")}
          className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "documents"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText size={17} />
          Documents
        </button>
      </div>

      {/* ================= TASKS TAB ================= */}
      {activeTab === "tasks" && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">My Project Tasks</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                View and open tasks assigned to you under this project.
              </p>
            </div>

            {!tasksLoading && sortedTasks.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-muted-foreground"
                onClick={() => navigate(`/employee/tasks/${project._id}`)}
              >
                <ClipboardList size={15} />
                Full Task View
              </Button>
            )}
          </div>

          {tasksLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Card key={i} className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="w-2/3 h-4 rounded bg-muted animate-pulse" />
                    <div className="w-1/2 h-3 mt-3 rounded bg-muted animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedTasks.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center gap-2 text-center py-14">
                <div className="flex items-center justify-center border rounded-full w-11 h-11 bg-muted">
                  <ClipboardCheck size={20} className="text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">
                  No tasks assigned yet
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Tasks assigned to you under this project will show up here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sortedTasks.map((task) => {
                const submissionType =
                  task.submissionRule?.type ||
                  task.submissionRuleType ||
                  "TEXT";

                return (
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
                      <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium truncate text-foreground">
                              {task.taskTitle}
                            </p>

                            {submissionType === "CHECKBOX" && (
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1 text-green-700 border-green-500/30 bg-green-500/10 dark:text-green-400"
                              >
                                <CheckSquare size={12} />
                                Checkbox
                              </Badge>
                            )}

                            <Badge
                              variant="outline"
                              className={
                                STATUS_COLORS[task.status] ||
                                STATUS_COLORS.PENDING
                              }
                            >
                              {task.status.replaceAll("_", " ")}
                            </Badge>

                            {task.isTagged && !task.isAssignee && (
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                              >
                                <Tag size={12} />
                                Tagged
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                            {task.moduleName && <span>{task.moduleName}</span>}

                            {task.deadline && (
                              <div className="flex items-center gap-1.5">
                                <Calendar size={13} />
                                {new Date(task.deadline).toLocaleDateString()}
                              </div>
                            )}

                            {task.isTagged && !task.isAssignee && (
                              <div className="flex items-center gap-1.5">
                                <UserCircle2 size={13} />
                                Owner:{" "}
                                {task.assignedEmployee?.username ||
                                  "Unassigned"}
                              </div>
                            )}
                          </div>
                        </div>

                        <ChevronRight
                          size={18}
                          className="shrink-0 text-muted-foreground"
                        />
                      </CardContent>
                    </button>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= DOCUMENTS TAB ================= */}
      {activeTab === "documents" && (
        <div className="mt-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Assigned Documents</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Documents and templates assigned to you for this project.
            </p>
          </div>

          {/* CURRENTLY EMPTY STATE */}
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex items-center justify-center border rounded-full w-11 h-11 bg-muted">
                <FileText size={20} className="text-muted-foreground" />
              </div>

              <h3 className="mt-3 font-medium">No documents assigned yet</h3>

              <p className="max-w-md mt-1 text-sm text-muted-foreground">
                When your project manager assigns a document or template, it
                will appear here.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}