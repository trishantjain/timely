import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  FolderKanban,
  ListChecks,
  ListTodo,
  Mail,
} from "lucide-react";

import { getAllPendingTasks } from "@/api/taskAPI";
import { getPendingReviews } from "@/api/submissionAPI";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Employee-side task status pills — kept intentionally muted so the
// amber "awaiting review" pill (admin-side) reads as visually distinct.
const statusStyles = {
  PENDING: "border-border bg-muted/60 text-muted-foreground",
  IN_PROGRESS: "border-sky-200 bg-sky-50 text-sky-700",
  REJECTED: "border-destructive/30 bg-destructive/10 text-destructive",
};

const formatDate = (value) => {
  if (!value) return "No deadline";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "No deadline";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (name) => {
  if (!name) return "?";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

export default function PendingTasks() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [employeeTasks, setEmployeeTasks] = useState([]);
  const [reviewTasks, setReviewTasks] = useState([]);

  // Per-employee-group collapsed state, keyed by employee id.
  const [collapsed, setCollapsed] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // Reuse the two existing, already-scoped endpoints rather than
      // introducing a new combined one:
      //  - getAllPendingTasks(): tasks still needing employee action
      //    (PENDING / IN_PROGRESS / REJECTED — see
      //    EMPLOYEE_ACTION_PENDING_STATUSES on the backend).
      //  - getPendingReviews(): submissions with status UNDER_REVIEW,
      //    i.e. work the employee has already submitted and which is
      //    now waiting on the admin. Called with no projectId so it
      //    stays workspace-wide, same as the pending-tasks list.
      const [tasksRes, reviewsRes] = await Promise.all([
        getAllPendingTasks(),
        getPendingReviews(),
      ]);

      setEmployeeTasks(tasksRes.data?.data || []);
      setReviewTasks(reviewsRes.data?.data || []);
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Unable to load pending tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Merge both lists into one employee-keyed map so each employee shows
  // up once, with their employee-side pending tasks and admin-review
  // submissions grouped separately underneath them.
  const groupedByEmployee = useMemo(() => {
    const groups = new Map();

    const ensureGroup = (id, employee) => {
      if (!groups.has(id)) {
        groups.set(id, { id, employee: employee || null, pending: [], review: [] });
      } else if (employee && !groups.get(id).employee) {
        groups.get(id).employee = employee;
      }

      return groups.get(id);
    };

    for (const task of employeeTasks) {
      const id = task.assignedEmployee?._id || "unknown";

      ensureGroup(id, task.assignedEmployee).pending.push(task);
    }

    for (const item of reviewTasks) {
      const id = item.assignedEmployee?._id || "unknown";

      ensureGroup(id, item.assignedEmployee).review.push(item);
    }

    return Array.from(groups.values()).sort(
      (a, b) => b.pending.length + b.review.length - (a.pending.length + a.review.length),
    );
  }, [employeeTasks, reviewTasks]);

  const totalPending = employeeTasks.length;
  const totalReview = reviewTasks.length;

  const allCollapsed =
    groupedByEmployee.length > 0 &&
    groupedByEmployee.every((g) => collapsed[g.id]);

  const toggleGroup = (id) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = () => {
    const next = {};

    groupedByEmployee.forEach((g) => {
      next[g.id] = !allCollapsed;
    });

    setCollapsed(next);
  };

  const handleTaskClick = (task) => {
    navigate(`/admin/tasks/${task.componentId}/${task.taskId}`);
  };

  const handleReviewClick = (item) => {
    navigate(`/admin/reviews/${item._id}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading pending tasks...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-full px-4 py-4 mx-auto sm:px-6 sm:py-5 lg:px-8">
      {/* BACK */}

      <button
        onClick={() => navigate("/admin")}
        className="flex items-center gap-1.5 mb-3 text-xs font-medium transition-colors text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </button>

      {/* HEADER */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center border rounded-lg h-8 w-8 shrink-0 bg-muted/40">
            <ListTodo size={16} />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight sm:text-xl">
              Pending Tasks
            </h1>

            <p className="text-xs text-muted-foreground">
              Employee action items and admin review requests, across all projects.
            </p>
          </div>
        </div>

        {/* SUMMARY COUNTS */}

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
            <ListChecks size={12} />
            {totalPending} Pending from Employee
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
            <ClipboardCheck size={12} />
            {totalReview} Awaiting Admin Review
          </span>

          {groupedByEmployee.length > 0 && (
            <button
              onClick={toggleAll}
              className="text-xs font-medium underline-offset-2 hover:underline text-muted-foreground hover:text-foreground"
            >
              {allCollapsed ? "Expand all" : "Collapse all"}
            </button>
          )}
        </div>
      </div>

      {/* EMPLOYEE GROUPS */}

      <div className="mt-4 space-y-2.5">
        {groupedByEmployee.length === 0 ? (
          <Card>
            <CardContent className="text-center py-14">
              <div className="flex items-center justify-center w-12 h-12 mx-auto border rounded-xl bg-muted/40">
                <ClipboardList size={21} className="text-muted-foreground" />
              </div>

              <h3 className="mt-4 font-medium">No pending tasks</h3>

              <p className="max-w-md mx-auto mt-1 text-sm text-muted-foreground">
                Every employee is caught up — nothing is pending right now.
              </p>
            </CardContent>
          </Card>
        ) : (
          groupedByEmployee.map(({ id, employee, pending, review }) => {
            const isOpen = !collapsed[id];
            const total = pending.length + review.length;

            return (
              <div
                key={id}
                className="overflow-hidden border rounded-xl bg-card"
              >
                {/* EMPLOYEE HEADER */}

                <button
                  type="button"
                  onClick={() => toggleGroup(id)}
                  className="flex flex-wrap items-center justify-between w-full gap-2.5 px-3.5 py-2.5 text-left transition-colors sm:px-4 hover:bg-muted/20"
                >
                  <div className="flex items-center min-w-0 gap-2.5">
                    <ChevronDown
                      size={15}
                      className={cn(
                        "shrink-0 text-muted-foreground transition-transform duration-150",
                        !isOpen && "-rotate-90",
                      )}
                    />

                    <div className="flex items-center justify-center text-[11px] font-semibold border rounded-full h-7 w-7 shrink-0 bg-muted/50 text-foreground/80">
                      {getInitials(employee?.username)}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-tight truncate">
                        {employee?.username || "Unassigned"}
                      </p>

                      {employee?.email && (
                        <p className="flex items-center gap-1 text-[11px] truncate text-muted-foreground">
                          <Mail size={10} />
                          {employee.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {pending.length > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        {pending.length} Employee
                      </span>
                    )}

                    {review.length > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                        {review.length} Review
                      </span>
                    )}

                    {pending.length === 0 && review.length === 0 && (
                      <span className="text-[11px] text-muted-foreground">
                        {total} tasks
                      </span>
                    )}
                  </div>
                </button>

                {/* BODY */}

                {isOpen && (
                  <div className="border-t divide-y">
                    {/* EMPLOYEE PENDING */}

                    {pending.length > 0 && (
                      <div>
                        <p className="px-3.5 pt-2.5 pb-1 text-[10px] font-semibold tracking-wide uppercase sm:px-4 text-muted-foreground">
                          Pending from Employee
                        </p>

                        <div className="divide-y">
                          {pending.map((task) => (
                            <button
                              key={task.taskId}
                              type="button"
                              onClick={() => handleTaskClick(task)}
                              className="flex flex-col w-full gap-1.5 px-3.5 py-2 text-left transition-colors sm:px-4 hover:bg-muted/20 md:flex-row md:items-center md:justify-between"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <h3 className="text-sm font-medium truncate">
                                    {task.taskTitle}
                                  </h3>

                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[10px] font-medium px-1.5 py-0",
                                      statusStyles[task.status] || statusStyles.PENDING,
                                    )}
                                  >
                                    {task.status}
                                  </Badge>
                                </div>

                                <p className="flex items-center gap-1 mt-0.5 text-[11px] text-muted-foreground">
                                  <FolderKanban size={10} />
                                  {task.projectName}
                                  {task.componentName ? ` · ${task.componentName}` : ""}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 text-[11px] shrink-0 text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar size={11} />
                                  {formatDate(task.deadline)}
                                </span>

                                <ChevronRight size={14} className="shrink-0" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ADMIN REVIEW PENDING */}

                    {review.length > 0 && (
                      <div>
                        <p className="px-3.5 pt-2.5 pb-1 text-[10px] font-semibold tracking-wide uppercase sm:px-4 text-muted-foreground">
                          Pending Admin Review
                        </p>

                        <div className="divide-y">
                          {review.map((item) => (
                            <button
                              key={item._id}
                              type="button"
                              onClick={() => handleReviewClick(item)}
                              className="flex flex-col w-full gap-1.5 px-3.5 py-2 text-left transition-colors sm:px-4 hover:bg-muted/20 md:flex-row md:items-center md:justify-between"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <h3 className="text-sm font-medium truncate">
                                    {item.projectComponent?.name || "Untitled Component"}
                                  </h3>

                                  <Badge
                                    variant="outline"
                                    className="text-[10px] font-medium px-1.5 py-0 border-violet-200 bg-violet-50 text-violet-700"
                                  >
                                    Awaiting Review
                                  </Badge>
                                </div>

                                <p className="flex items-center gap-1 mt-0.5 text-[11px] text-muted-foreground">
                                  <FolderKanban size={10} />
                                  {item.project?.name || "Unknown project"}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 text-[11px] shrink-0 text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar size={11} />
                                  Submitted {formatDate(item.updatedAt)}
                                </span>

                                <ChevronRight size={14} className="shrink-0" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
