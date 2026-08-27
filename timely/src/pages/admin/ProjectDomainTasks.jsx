import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ChevronRight,
  Mail,
  User,
  ClipboardList,
  Clock,
  CalendarDays,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { getProjectDomainTasks } from "@/api/projectComponentAPI";

export default function ProjectDomainTasks() {
  const navigate = useNavigate();

  const { projectId, domainId } = useParams();

  const [loading, setLoading] = useState(true);

  const [data, setData] = useState(null);

  // ===================================
  // LOAD DOMAIN TASK DATA
  // ===================================

  const loadData = async () => {
    try {
      setLoading(true);

      const res = await getProjectDomainTasks(projectId, domainId);

      setData(res.data?.data || null);
    } catch (error) {
      console.error("Failed to load domain tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId, domainId]);

  // ===================================
  // STATUS STYLE
  // ===================================

  const getStatusClass = (status) => {
    switch (status) {
      case "COMPLETED":
      case "APPROVED":
        return "border-green-200 bg-green-50 text-green-700";

      case "IN_PROGRESS":
        return "border-blue-200 bg-blue-50 text-blue-700";

      case "UNDER_REVIEW":
        return "border-yellow-200 bg-yellow-50 text-yellow-700";

      case "REJECTED":
        return "border-red-200 bg-red-50 text-red-700";

      default:
        return "border-slate-200 bg-slate-50 text-slate-600";
    }
  };

  // ===================================
  // FORMAT DATE
  // ===================================

  const formatDate = (date) => {
    if (!date) return "No deadline";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ===================================
  // LOADING
  // ===================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading domain tasks...</p>
      </div>
    );
  }

  // ===================================
  // NO DATA
  // ===================================

  if (!data) {
    return (
      <div className="p-8">
        <Button
          variant="outline"
          onClick={() => navigate(`/admin/project/${projectId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Project
        </Button>

        <div className="py-20 text-center">
          Unable to load domain information.
        </div>
      </div>
    );
  }

  const { project, domain, summary, employees = [] } = data;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-6xl p-6 lg:p-8">
        {/* ===================================
                    BACK
                =================================== */}

        <Button
          variant="ghost"
          className="mb-6 -ml-2"
          onClick={() => navigate(`/admin/project/${projectId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Project
        </Button>

        {/* ===================================
                    HEADER
                =================================== */}

        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {domain?.name}
            </h1>

            <Badge
              style={{
                backgroundColor: domain?.color || "#64748b",
                color: "white",
              }}
            >
              Domain
            </Badge>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            {project?.name} • View employees and their assigned tasks.
          </p>
        </div>

        {/* ===================================
                    SUMMARY
                =================================== */}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-lg bg-muted p-3">
                <Users className="h-5 w-5" />
              </div>

              <div>
                <p className="text-2xl font-semibold">
                  {summary?.employees || 0}
                </p>

                <p className="text-sm text-muted-foreground">Employees</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-lg bg-muted p-3">
                <ClipboardList className="h-5 w-5" />
              </div>

              <div>
                <p className="text-2xl font-semibold">
                  {summary?.totalTasks || 0}
                </p>

                <p className="text-sm text-muted-foreground">Assigned Tasks</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-lg bg-muted p-3">
                <Clock className="h-5 w-5" />
              </div>

              <div>
                <p className="text-2xl font-semibold">
                  {summary?.pendingTasks || 0}
                </p>

                <p className="text-sm text-muted-foreground">Active Tasks</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ===================================
                    EMPLOYEE SECTION
                =================================== */}

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Employee Work Overview</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              See what each employee is working on.
            </p>
          </div>
        </div>

        {/* ===================================
                    EMPTY STATE
                =================================== */}

        {employees.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />

              <h3 className="font-medium">No employees assigned</h3>

              <p className="mt-1 text-sm text-muted-foreground">
                No employees are currently assigned to this domain.
              </p>
            </CardContent>
          </Card>
        )}

        {/* ===================================
                    EMPLOYEE CARDS
                =================================== */}

        <div className="space-y-5">
          {employees.map((item) => {
            const employee = item.employee;

            const tasks = item.tasks || [];

            return (
              <Card key={employee?._id} className="overflow-hidden">
                {/* =========================
                                    EMPLOYEE HEADER
                                ========================= */}

                <div className="flex flex-col gap-4 border-b bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border bg-background">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div>
                      <h3 className="font-semibold">{employee?.username}</h3>

                      <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />

                        <span>{employee?.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="px-3 py-1">
                      {item.taskCount || tasks.length} Tasks
                    </Badge>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(
                          `/admin/project/${projectId}/employees/${employee._id}/tasks`,
                        )
                      }
                    >
                      View Details
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* =========================
                                    TASK LIST
                                ========================= */}

                <div>
                  {tasks.length === 0 ? (
                    <div className="p-6 text-sm text-muted-foreground">
                      No tasks assigned to this employee yet.
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <div
                        key={task.taskId}
                        className="flex flex-col gap-3 border-b p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                      >
                        {/* TASK INFO */}

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{task.taskTitle}</p>

                            <Badge
                              variant="outline"
                              className={getStatusClass(task.status)}
                            >
                              {task.status?.replaceAll("_", " ")}
                            </Badge>
                          </div>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {task.componentName}

                            {task.moduleName && ` • ${task.moduleName}`}
                          </p>
                        </div>

                        {/* DEADLINE */}

                        <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />

                          {formatDate(task.deadline)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
