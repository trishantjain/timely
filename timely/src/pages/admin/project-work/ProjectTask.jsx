import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronDown, ChevronRight, Trash2, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import SubtaskList from "./SubtaskList";
import {
  formatDeadline,
  getSubmissionId,
  getTaskStatusClass,
} from "./workDisplayUtils";

// ==========================================
// PROJECT TASK
//
// A single Task row inside a Work Package. Clicking anywhere on the
// row expands/collapses its Subtasks (spec section 9). Clicking the
// task title specifically opens the existing Task Detail page (spec
// section 13) — Project Work never duplicates that detail/review UI.
// ==========================================
export default function ProjectTask({
  component,
  task,
  expanded,
  onToggleExpand,
  onOpenAssign,
  onOpenSubmission,
  onDeleteTask,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  taskRef,
}) {
  const navigate = useNavigate();

  const assignedEmployee =
    task.assignedEmployee || task.employee || task.projectMember?.employee;

  const subtaskCount = task.subtasks?.length || 0;
  const completedSubtasks =
    task.subtasks?.filter((subtask) => subtask.completed).length || 0;

  const openTaskDetail = (event) => {
    event.stopPropagation();
    navigate(`/admin/tasks/${component._id}/${task._id}`);
  };

  return (
    <div
      ref={taskRef}
      className="transition-all duration-300"
    >
      <div
        className="flex cursor-pointer flex-col gap-2 px-4 py-3 hover:bg-[#f1f5f9] md:flex-row md:items-center md:justify-between"
        onClick={onToggleExpand}
      >
        {/* TASK INFO */}
        <div className="flex min-w-0 flex-1 items-start gap-2">
          {expanded ? (
            <ChevronDown size={15} className="mt-0.5 shrink-0 text-[#94a3b8]" />
          ) : (
            <ChevronRight size={15} className="mt-0.5 shrink-0 text-[#94a3b8]" />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={openTaskDetail}
                className="truncate text-sm font-medium text-[#1f2937] hover:text-[#2563eb] hover:underline"
                title="Open task details"
              >
                {task.title}
              </button>

              {task.status && (
                <Badge
                  variant="outline"
                  className={`text-[10px] ${getTaskStatusClass(task.status)}`}
                >
                  {task.status}
                </Badge>
              )}

              {subtaskCount > 0 && (
                <Badge variant="outline" className="border-[#cfd6df] bg-white text-[10px]">
                  {completedSubtasks}/{subtaskCount} Subtasks
                </Badge>
              )}
            </div>

            {task.description && (
              <p className="mt-1 truncate text-xs text-[#64748b]">{task.description}</p>
            )}

            {(assignedEmployee || task.deadline) && (
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {assignedEmployee && (
                  <div className="flex items-center gap-1.5">
                    <UserRound size={12} />
                    <span>
                      {assignedEmployee.username || assignedEmployee.name || "Assigned"}
                    </span>
                  </div>
                )}

                {task.deadline && (
                  <div className="flex items-center gap-1.5">
                    <CalendarDays size={12} />
                    <span>{formatDeadline(task.deadline)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* TASK ACTIONS */}
        <div className="flex shrink-0 items-center gap-2">
          {!assignedEmployee ? (
            <Button
              type="button"
              variant="outline"
              className="h-8 shrink-0 border-[#cbd5e1] bg-white px-3 text-xs hover:bg-[#f1f5f9]"
              onClick={(event) => {
                event.stopPropagation();
                onOpenAssign(task);
              }}
            >
              Assign
            </Button>
          ) : task.status === "PENDING" ? (
            <Badge
              variant="outline"
              className="flex h-8 shrink-0 items-center px-3 text-xs font-medium border-amber-200 bg-amber-50 text-amber-700"
            >
              Waiting for Submission
            </Badge>
          ) : getSubmissionId(task) ? (
            <Button
              type="button"
              variant="outline"
              className={`h-8 shrink-0 px-3 text-xs font-medium hover:opacity-80 ${getTaskStatusClass(task.status)}`}
              onClick={(event) => {
                event.stopPropagation();
                onOpenSubmission(task);
              }}
            >
              {task.status === "UNDER_REVIEW"
                ? "Under Review"
                : task.status === "SUBMITTED"
                  ? "View Submission"
                  : task.status === "APPROVED"
                    ? "View Approved"
                    : task.status === "REJECTED"
                      ? "View Rejected"
                      : "View Submission"}
            </Button>
          ) : (
            <Badge
              variant="outline"
              className={`flex h-8 shrink-0 items-center px-3 text-xs font-medium ${getTaskStatusClass(task.status)}`}
            >
              {task.status || "Pending"}
            </Badge>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={(event) => {
              event.stopPropagation();
              onDeleteTask(task);
            }}
            aria-label={`Delete task ${task.title}`}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {expanded && (
        <SubtaskList
          component={component}
          task={task}
          onAddSubtask={onAddSubtask}
          onToggleSubtask={onToggleSubtask}
          onDeleteSubtask={onDeleteSubtask}
        />
      )}
    </div>
  );
}
