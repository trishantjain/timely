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
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Project
        </Button>

        <div className="py-20 text-center">
          Unable to load domain information.
        </div>
      </div>
    );
  }

  const handleTaskClick = (task) => {
    navigate(`/admin/tasks/${task.componentId}/${task.taskId}`);
  };

  const {
    project,
    domain,
    employees = [],
    totalEmployees = 0,
    totalTasks = 0,
    activeTasks = 0,
  } = data;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="w-full max-w-6xl p-6 mx-auto lg:p-8">
        {/* ===================================
                    BACK
                =================================== */}

        <Button
          variant="ghost"
          className="mb-6 -ml-2"
          onClick={() => navigate(`/admin/project/${projectId}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
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

        <div className="grid gap-4 mb-8 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="p-3 rounded-lg bg-muted">
                <Users className="w-5 h-5" />
              </div>

              <div>
                <p className="text-2xl font-semibold">{totalEmployees}</p>
                <p className="text-sm text-muted-foreground">Employees</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="p-3 rounded-lg bg-muted">
                <ClipboardList className="w-5 h-5" />
              </div>

              <div>
                <p className="text-2xl font-semibold">{totalTasks}</p>

                <p className="text-sm text-muted-foreground">Assigned Tasks</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="p-3 rounded-lg bg-muted">
                <Clock className="w-5 h-5" />
              </div>

              <div>
                <p className="text-2xl font-semibold">{activeTasks}</p>

                <p className="text-sm text-muted-foreground">Active Tasks</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ===================================
                    EMPLOYEE SECTION
                =================================== */}

        <div className="flex items-center justify-between mb-4">
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
              <Users className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />

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

                <div className="flex flex-col gap-4 p-5 border-b bg-muted/20 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center border rounded-full h-11 w-11 bg-background">
                      <User className="w-5 h-5 text-muted-foreground" />
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
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>

                {/* =========================
                        TASK LIST
                    ========================= */}

                <div className="divide-y">
                  {tasks.length === 0 ? (
                    <div className="p-6 text-sm text-muted-foreground">
                      No tasks assigned to this employee yet.
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <button
                        key={task.taskId}
                        type="button"
                        onClick={() => handleTaskClick(task)}
                        className="flex flex-col w-full gap-4 p-5 text-left transition-all duration-200 group hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                      >
                        {/* TASK INFORMATION */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold transition-colors group-hover:underline">
                              {task.taskTitle}
                            </p>

                            <Badge
                              variant="outline"
                              className={getStatusClass(task.status)}
                            >
                              {task.status?.replaceAll("_", " ")}
                            </Badge>
                          </div>

                          <div className="mt-1.5 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                            <span>{task.componentName}</span>

                            {task.moduleName && (
                              <>
                                <span>•</span>
                                <span>{task.moduleName}</span>
                              </>
                            )}
                          </div>

                          {task.taskDescription && (
                            <p className="max-w-2xl mt-2 text-sm truncate text-muted-foreground">
                              {task.taskDescription}
                            </p>
                          )}
                        </div>

                        {/* DEADLINE + ACTION */}
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="flex min-w-[135px] items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2">
                            <CalendarDays className="w-4 h-4 text-muted-foreground" />

                            <div className="text-left">
                              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                Deadline
                              </p>

                              <p className="text-sm font-medium">
                                {formatDate(task.deadline)}
                              </p>
                            </div>
                          </div>

                          <ChevronRight className="w-5 h-5 transition-transform duration-200 text-muted-foreground group-hover:translate-x-1 group-hover:text-foreground" />
                        </div>
                      </button>
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
