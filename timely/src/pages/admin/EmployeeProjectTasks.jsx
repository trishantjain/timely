import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  FolderKanban,
  User,
  ChevronRight,
} from "lucide-react";

import { getEmployeeProjectTasks } from "@/api/taskAPI";

import { Card, CardContent } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

const statusStyles = {
  PENDING: "border-border bg-muted/50 text-muted-foreground",

  IN_PROGRESS: "border-border bg-secondary text-secondary-foreground",

  SUBMITTED: "border-border bg-muted text-foreground",

  UNDER_REVIEW: "border-border bg-secondary/70 text-secondary-foreground",

  APPROVED: "border-border bg-muted text-foreground",

  REJECTED: "border-destructive/30 bg-destructive/10 text-destructive",
};

export default function EmployeeProjectTasks() {
  const { projectId, employeeId } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [data, setData] = useState(null);

  const loadTasks = async () => {
    try {
      setLoading(true);

      const res = await getEmployeeProjectTasks(projectId, employeeId);

      setData(res.data.data);
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Unable to load employee tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [projectId, employeeId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading employee tasks...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">No data found.</p>
      </div>
    );
  }

  const handleTaskClick = (task) => {
    console.log("Clicked task:", task);

    const submissionId =
      task.submissionId || task.submission?._id || task.submission;

    if (!submissionId) {
      alert("No submission is available for this task yet.");
      return;
    }

    navigate(`/admin/reviews/${submissionId}`);
  };

  const { project, employee, tasks } = data;

  return (
    <div className="max-w-6xl p-4 mx-auto sm:p-6 lg:p-8">
      {/* BACK */}

      <button
        onClick={() => navigate(`/admin/project/${projectId}`)}
        className="flex items-center gap-2 mb-5 text-sm transition-colors text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to Project
      </button>

      {/* HEADER */}

      <div className="overflow-hidden border shadow-sm rounded-2xl bg-card">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center min-w-0 gap-4">
            <div className="flex items-center justify-center w-12 h-12 border shrink-0 rounded-xl bg-muted/40">
              <User size={21} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
                Employee Tasks
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight truncate sm:text-3xl">
                {employee.username}
              </h1>

              <p className="mt-1 text-sm truncate text-muted-foreground">
                {employee.email}
              </p>
            </div>
          </div>

          <div className="flex items-center min-w-0 gap-3 px-4 py-3 border rounded-xl bg-muted/20 sm:max-w-xs">
            <div className="flex items-center justify-center border rounded-lg h-9 w-9 shrink-0 bg-muted/40">
              <FolderKanban size={17} />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Project</p>

              <p className="text-sm font-semibold truncate">{project.name}</p>
            </div>
          </div>
        </div>

        {/* SUMMARY */}

        <div className="grid border-t sm:grid-cols-2">
          <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
            <div className="flex items-center justify-center border rounded-lg h-9 w-9 bg-muted/40">
              <User size={17} />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Employee</p>

              <p className="text-sm font-semibold">{employee.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-4 border-t sm:border-l sm:border-t-0 sm:px-6">
            <div className="flex items-center justify-center border rounded-lg h-9 w-9 bg-muted/40">
              <ClipboardList size={17} />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Assigned Tasks</p>

              <p className="text-sm font-semibold">{tasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* TASKS */}

      <div className="mt-7">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Assigned Tasks</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Select a task to view its submission and review details.
            </p>
          </div>

          <Badge variant="secondary" className="font-normal w-fit">
            {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"}
          </Badge>
        </div>

        {tasks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-14">
              <div className="flex items-center justify-center w-12 h-12 mx-auto border rounded-xl bg-muted/40">
                <ClipboardList size={21} className="text-muted-foreground" />
              </div>

              <h3 className="mt-4 font-medium">No tasks assigned</h3>

              <p className="max-w-md mx-auto mt-1 text-sm text-muted-foreground">
                This employee does not currently have any tasks in this project.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-hidden border shadow-sm rounded-2xl bg-card">
            <div className="divide-y">
              {tasks.map((task) => (
                <button
                  key={task.taskId}
                  type="button"
                  onClick={() => handleTaskClick(task)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();

                      if (!task.submissionId) {
                        alert("No submission is available for this task yet.");
                        return;
                      }

                      navigate(`/admin/reviews/${task.submissionId}`);
                    }
                  }}
                  className="flex flex-col w-full gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30 sm:px-6 md:flex-row md:items-center md:justify-between"
                >
                  {/* TASK INFO */}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold truncate sm:text-base">
                        {task.taskTitle}
                      </h3>

                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium ${
                          statusStyles[task.status] || statusStyles.PENDING
                        }`}
                      >
                        {task.status}
                      </Badge>
                    </div>

                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      {task.componentName}
                    </p>

                    {task.taskDescription && (
                      <p className="max-w-2xl mt-2 text-sm truncate text-muted-foreground">
                        {task.taskDescription}
                      </p>
                    )}
                  </div>

                  {/* DEADLINE */}

                  <div className="flex items-center gap-5 text-sm shrink-0 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar size={15} />

                      <span className="text-xs sm:text-sm">
                        {task.deadline
                          ? new Date(task.deadline).toLocaleDateString()
                          : "No deadline"}
                      </span>
                    </div>

                    <ChevronRight size={18} className="shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
