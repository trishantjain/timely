import { useState } from "react";
import { Plus, Trash2, Tag, UserRound } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ==========================================
// SUBTASK LIST
//
// Renders under an expanded ProjectTask. Subtasks are project-
// specific (see backend ProjectComponent.tasks[].subtasks) — deleting
// or completing one here never touches the predefined Work Package
// template.
//
// Subtasks can come from three places: the Work Package template
// (createdByRole "ADMIN", createdBy null), an admin adding one
// directly here, or an employee adding one of their own under a task
// assigned to them (createdByRole "EMPLOYEE") — this view shows which
// is which, plus anyone tagged on a subtask, so an admin can see an
// employee's self-tracked to-dos and who they've looped in.
// ==========================================
export default function SubtaskList({
  component,
  task,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
}) {
  const [addingOpen, setAddingOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const subtasks = task.subtasks || [];

  const handleAdd = async () => {
    if (!newTitle.trim() || saving) return;

    try {
      setSaving(true);

      await onAddSubtask(component._id, task._id, {
        title: newTitle.trim(),
      });

      setNewTitle("");
      setAddingOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="ml-4 space-y-1.5 border-l-2 border-[#dde3ea] pl-4 py-2"
      onClick={(event) => event.stopPropagation()}
    >
      {subtasks.length === 0 && !addingOpen && (
        <p className="text-xs italic text-[#94a3b8]">
          No subtasks yet.
        </p>
      )}

      {subtasks.map((subtask) => {
        const isEmployeeAdded = subtask.createdByRole === "EMPLOYEE";
        const tags = subtask.tags || [];

        return (
          <div
            key={subtask._id}
            className="rounded-md px-2 py-1.5 hover:bg-[#eef2f7]"
          >
            <div className="flex items-center gap-2.5">
              <Checkbox
                checked={!!subtask.completed}
                onCheckedChange={(checked) =>
                  onToggleSubtask(
                    component._id,
                    task._id,
                    subtask._id,
                    !!checked,
                  )
                }
              />

              <span
                className={`flex-1 text-xs ${
                  subtask.completed
                    ? "text-[#94a3b8] line-through"
                    : "text-[#334155]"
                }`}
              >
                {subtask.title}
              </span>

              {isEmployeeAdded && (
                <span className="flex items-center gap-1 rounded-full border border-[#dbeafe] bg-[#eff6ff] px-2 py-0.5 text-[10px] font-medium text-[#2563eb]">
                  <UserRound size={10} />
                  {subtask.createdBy?.username || "Employee"}
                </span>
              )}

              <button
                type="button"
                onClick={() =>
                  onDeleteSubtask(component._id, task._id, subtask._id)
                }
                className="text-[#94a3b8] hover:text-red-600"
                aria-label={`Delete subtask ${subtask.title}`}
              >
                <Trash2 size={13} />
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pl-7 mt-1">
                <Tag size={11} className="text-[#94a3b8]" />

                {tags.map((tag, index) => (
                  <span
                    key={tag.employee?._id || index}
                    className="rounded-full border border-[#fde68a] bg-[#fffbeb] px-2 py-0.5 text-[10px] text-[#92400e]"
                    title={tag.message || undefined}
                  >
                    {tag.employee?.username || "Employee"}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {addingOpen ? (
        <div className="flex items-center gap-2 pt-1">
          <Input
            autoFocus
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAdd();
              }
              if (event.key === "Escape") {
                setAddingOpen(false);
                setNewTitle("");
              }
            }}
            placeholder="Subtask name"
            className="flex-1 h-8 text-xs"
          />

          <Button
            type="button"
            size="sm"
            className="h-8 bg-[#2563eb] px-3 text-xs text-white hover:bg-[#1d4ed8]"
            disabled={!newTitle.trim() || saving}
            onClick={handleAdd}
          >
            Add
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs text-black"
            onClick={() => {
              setAddingOpen(false);
              setNewTitle("");
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAddingOpen(true)}
          className="mt-1 flex items-center gap-1 text-xs text-[#2563eb] hover:underline"
        >
          <Plus size={12} />
          Add subtask
        </button>
      )}
    </div>
  );
}
