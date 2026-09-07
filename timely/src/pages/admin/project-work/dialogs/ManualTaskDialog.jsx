import { useRef } from "react";
import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ==========================================
// ADD TASK DIALOG
//
// Adds a project-specific Task under a Work Package (spec section
// 11). Reuses the existing addManualTask API; never touches the
// predefined Work Package template.
// ==========================================
export default function ManualTaskDialog({
  open,
  onClose,
  workPackageName,
  projectMembers,
  task,
  onChangeTask,
  saving,
  onSubmit,
}) {
  const deadlineInputRef = useRef(null);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="border-[#cfd6df] bg-[#f8f9fb]">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>
            {workPackageName
              ? `Add a project-specific task to "${workPackageName}".`
              : "Add a project-specific task."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4">
          <div className="space-y-2">
            <Label>Task Name</Label>
            <Input
              value={task.title}
              onChange={(event) =>
                onChangeTask({ ...task, title: event.target.value })
              }
              placeholder="Enter task name"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={task.description}
              onChange={(event) =>
                onChangeTask({ ...task, description: event.target.value })
              }
              placeholder="Optional task description"
              className="min-h-[80px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Assign To (optional)</Label>
            <Select
              value={task.assignedEmployee}
              onValueChange={(value) =>
                onChangeTask({ ...task, assignedEmployee: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {projectMembers.length === 0 ? (
                  <SelectItem value="no-employee" disabled>
                    No project members available
                  </SelectItem>
                ) : (
                  projectMembers.map((member) => {
                    const employee = member.employee || member;
                    const employeeId = employee._id || member.employee;
                    const employeeName =
                      employee.username || employee.name || "Unknown Employee";

                    if (!employeeId) return null;

                    return (
                      <SelectItem key={employeeId} value={employeeId}>
                        {employeeName}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Deadline</Label>
            <div className="relative">
              <Input
                ref={deadlineInputRef}
                type="date"
                value={task.deadline}
                onChange={(event) =>
                  onChangeTask({ ...task, deadline: event.target.value })
                }
                className="pr-10 [color-scheme:light]"
              />
              <button
                type="button"
                onClick={() => {
                  const input = deadlineInputRef.current;
                  if (!input) return;
                  if (typeof input.showPicker === "function") {
                    input.showPicker();
                  } else {
                    input.focus();
                    input.click();
                  }
                }}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[#64748b] transition-colors hover:bg-[#e2e8f0] hover:text-[#1f2937]"
                aria-label="Select deadline"
              >
                <CalendarDays size={16} />
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="border-[#475569] !bg-[#222e3d] text-slate-200 hover:!bg-[#2a3849] hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={saving || !task.title.trim()}
            className="bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
          >
            {saving ? "Adding..." : "Add Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
