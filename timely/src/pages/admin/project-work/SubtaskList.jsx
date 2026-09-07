import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

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

      {subtasks.map((subtask) => (
        <div
          key={subtask._id}
          className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-[#eef2f7]"
        >
          <Checkbox
            checked={!!subtask.completed}
            onCheckedChange={(checked) =>
              onToggleSubtask(component._id, task._id, subtask._id, !!checked)
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

          <button
            type="button"
            onClick={() => onDeleteSubtask(component._id, task._id, subtask._id)}
            className="text-[#94a3b8] hover:text-red-600"
            aria-label={`Delete subtask ${subtask.title}`}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}

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
