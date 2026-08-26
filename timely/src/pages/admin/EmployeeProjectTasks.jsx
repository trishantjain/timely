import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  FolderKanban,
  User,
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

  const { project, employee, tasks } = data;

  return (
    <div className="max-w-6xl p-6 mx-auto lg:p-8">
      {/* BACK */}

      <button
        onClick={() => navigate(`/admin/project/${projectId}`)}
        className="
                    flex items-center gap-2
                    mb-6 text-sm
                    text-muted-foreground
                    transition-colors
                    hover:text-foreground
                "
      >
        <ArrowLeft size={16} />
        Back to Project
      </button>

      {/* HEADER */}

      <div className="flex flex-col gap-5 pb-8 border-b md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Employee tasks in project
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            {employee.username}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">{employee.email}</p>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 border rounded-xl bg-muted/30">
          <FolderKanban size={19} className="text-muted-foreground" />

          <div>
            <p className="text-xs text-muted-foreground">Project</p>

            <p className="font-medium">{project.name}</p>
          </div>
        </div>
      </div>

      {/* SUMMARY */}

      <div className="grid gap-4 mt-6 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div
              className="
                            flex items-center justify-center
                            w-10 h-10 border rounded-lg
                            bg-muted
                        "
            >
              <User size={19} />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Employee</p>

              <p className="font-semibold">{employee.username}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div
              className="
                            flex items-center justify-center
                            w-10 h-10 border rounded-lg
                            bg-muted
                        "
            >
              <ClipboardList size={19} />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Assigned Tasks</p>

              <p className="font-semibold">{tasks.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TASKS */}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Assigned Tasks</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Tasks assigned to this employee in {project.name}.
            </p>
          </div>
        </div>

        {tasks.length === 0 ? (
          <Card>
            <CardContent className="py-14 text-center">
              <ClipboardList
                size={28}
                className="
                                        mx-auto
                                        text-muted-foreground
                                    "
              />

              <h3 className="mt-4 font-medium">No tasks assigned</h3>

              <p
                className="
                                    mt-1 text-sm
                                    text-muted-foreground
                                "
              >
                This employee does not currently have any tasks in this project.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <Card
                key={task.taskId}
                className="
                                            transition-shadow
                                            hover:shadow-sm
                                        "
              >
                <CardContent className="p-5">
                  <div
                    className="
                                                flex flex-col gap-4
                                                md:flex-row
                                                md:items-start
                                                md:justify-between
                                            "
                  >
                    <div>
                      <div
                        className="
                                                        flex flex-wrap
                                                        items-center gap-2
                                                    "
                      >
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

                      <p
                        className="
                                                        mt-2 text-sm
                                                        text-muted-foreground
                                                    "
                      >
                        {task.componentName}
                      </p>

                      {task.taskDescription && (
                        <p
                          className="
                                                                mt-3 text-sm
                                                                leading-6
                                                                text-muted-foreground
                                                            "
                        >
                          {task.taskDescription}
                        </p>
                      )}
                    </div>

                    <div
                      className="
                                                    flex items-center gap-2
                                                    text-sm
                                                    text-muted-foreground
                                                    shrink-0
                                                "
                    >
                      <Calendar size={16} />

                      {task.deadline
                        ? new Date(task.deadline).toLocaleDateString()
                        : "No deadline"}
                    </div>
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
