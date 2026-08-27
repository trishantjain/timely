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
  PENDING: "bg-slate-100 text-slate-700 border-slate-200",

  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",

  SUBMITTED: "bg-yellow-50 text-yellow-700 border-yellow-200",

  UNDER_REVIEW: "bg-orange-50 text-orange-700 border-orange-200",

  APPROVED: "bg-green-50 text-green-700 border-green-200",

  REJECTED: "bg-red-50 text-red-700 border-red-200",
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-muted-foreground">
          Loading employee tasks...
        </p>
      </div>
    );
  }

  if (!data) {
    return <div className="p-8">No data found.</div>;
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
    <div className="max-w-6xl p-6 mx-auto lg:p-8">
      {/* BACK */}
      <button
        onClick={() => navigate(`/admin/project/${projectId}`)}
        className="flex items-center gap-2 mb-5 text-sm transition-colors text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to Project
      </button>

      {/* HEADER */}
      <div className="flex flex-col gap-4 pb-6 border-b md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Employee tasks in project
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            {employee.username}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">{employee.email}</p>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 border rounded-lg bg-muted/30">
          <FolderKanban size={18} className="text-muted-foreground" />

          <div>
            <p className="text-xs text-muted-foreground">Project</p>

            <p className="font-medium">{project.name}</p>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid gap-4 mt-5 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center border rounded-lg w-9 h-9 bg-muted">
              <User size={18} />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Employee</p>

              <p className="font-semibold">{employee.username}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center border rounded-lg w-9 h-9 bg-muted">
              <ClipboardList size={18} />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Assigned Tasks</p>

              <p className="font-semibold">{tasks.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TASKS */}
      <div className="mt-7">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Assigned Tasks</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Click a task to view its details and submission.
          </p>
        </div>

        {tasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardList
                size={28}
                className="mx-auto text-muted-foreground"
              />

              <h3 className="mt-4 font-medium">No tasks assigned</h3>

              <p className="mt-1 text-sm text-muted-foreground">
                This employee does not currently have any tasks in this project.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Card
                key={task.taskId}
                role="button"
                tabIndex={0}
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
                className="transition-all cursor-pointer hover:shadow-md hover:border-primary/40"
              >
                <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                  {/* LEFT SIDE */}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{task.taskTitle}</h3>

                      <Badge
                        variant="outline"
                        className={
                          statusStyles[task.status] || statusStyles.PENDING
                        }
                      >
                        {task.status}
                      </Badge>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {task.componentName}
                    </p>

                    {task.taskDescription && (
                      <p className="max-w-2xl mt-1 text-sm text-muted-foreground line-clamp-1">
                        {task.taskDescription}
                      </p>
                    )}
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="flex items-center gap-5 text-sm shrink-0 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />

                      <span>
                        {task.deadline
                          ? new Date(task.deadline).toLocaleDateString()
                          : "No deadline"}
                      </span>
                    </div>

                    <ChevronRight size={18} className="text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
