import { ChevronDown, ChevronUp, Layers, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import ProjectTask from "./ProjectTask";

// ==========================================
// PROJECT WORK PACKAGE
//
// Visually the parent/container for its Tasks (spec section 10):
// Work Package > Task > Subtask, each level clearly subordinate to
// the one above. Clicking anywhere on the header expands/collapses
// the Task list (spec section 22).
// ==========================================
export default function ProjectWorkPackage({
  component,
  projectId,
  expanded,
  onToggleExpand,
  expandedTasks,
  onToggleTaskExpand,
  onOpenAssign,
  onOpenSubmission,
  onDeleteTask,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onAddTask,
  onRemoveWorkPackage,
  onEditWorkPackage,
  taskRefs,
}) {
  const tasks = component.tasks || [];

  return (
    <Card className="overflow-hidden border-[#d7dde5] bg-[#f8f9fb] shadow-none">
      {/* WORK PACKAGE HEADER */}
      <div
        className="flex cursor-pointer items-center justify-between gap-4 bg-[#e4e9f0] px-4 py-3 transition-colors hover:bg-[#dde4ec]"
        onClick={onToggleExpand}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#c9d4e0]">
            <Layers size={17} className="text-[#334155]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h3 className="truncate text-sm font-semibold text-[#1f2937]">
                {component.name}
              </h3>

              <Badge variant="outline" className="shrink-0 border-[#cfd6df] bg-white text-[10px]">
                {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"}
              </Badge>
            </div>

            {component.description && (
              <p className="mt-1 truncate text-xs text-[#64748b]">{component.description}</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 text-[#475569] hover:text-[#1f2937]"
            onClick={(event) => {
              event.stopPropagation();
              onEditWorkPackage(component);
            }}
            aria-label={`Edit ${component.name}`}
            title="Edit Work Package"
          >
            <Pencil size={14} />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 text-red-600 hover:text-red-700"
            onClick={(event) => {
              event.stopPropagation();
              onRemoveWorkPackage(component);
            }}
            aria-label={`Remove ${component.name} from project`}
            title="Remove this Work Package from the project"
          >
            <Trash2 size={15} />
          </Button>

          <div className="ml-1 flex h-8 w-8 items-center justify-center">
            {expanded ? (
              <ChevronUp size={18} className="text-[#64748b]" />
            ) : (
              <ChevronDown size={18} className="text-[#64748b]" />
            )}
          </div>
        </div>
      </div>

      {/* TASK LIST */}
      {expanded && (
        <div className="border-t border-[#d7dde5] bg-white">
          {tasks.length === 0 ? (
            <div className="px-6 py-6 text-center">
              <p className="text-sm text-muted-foreground">
                No tasks in this Work Package yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#eef1f5]">
              {tasks.map((task) => (
                <ProjectTask
                  key={task._id}
                  component={component}
                  task={task}
                  projectId={projectId}
                  expanded={!!expandedTasks[task._id]}
                  onToggleExpand={() => onToggleTaskExpand(task._id)}
                  onOpenAssign={(task) => onOpenAssign(component, task)}
                  onOpenSubmission={onOpenSubmission}
                  onDeleteTask={(t) => onDeleteTask(component, t)}
                  onAddSubtask={onAddSubtask}
                  onToggleSubtask={onToggleSubtask}
                  onDeleteSubtask={onDeleteSubtask}
                  taskRef={(element) => {
                    if (element && taskRefs?.current) {
                      taskRefs.current[task._id] = element;
                    }
                  }}
                />
              ))}
            </div>
          )}

          <div className="border-t border-[#eef1f5] px-4 py-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-[#2563eb] hover:bg-[#eef2f7] hover:text-[#1d4ed8]"
              onClick={() => onAddTask(component)}
            >
              <Plus size={14} />
              Add Task
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
