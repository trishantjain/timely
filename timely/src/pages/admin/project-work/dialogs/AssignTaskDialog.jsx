import { useRef } from "react";
import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
// ASSIGN TASK DIALOG
//
// Employee assignment stays a Task-level operation (spec section 12)
// and reuses the existing assignTask API — nothing new here.
// ==========================================
export default function AssignTaskDialog({
  open,
  onClose,
  task,
  projectMembers,
  selectedProjectMember,
  onSelectProjectMember,
  deadline,
  onChangeDeadline,
  onSubmit,
}) {
  const deadlineInputRef = useRef(null);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="border-[#cfd6df] bg-[#f8f9fb]">
        <DialogHeader>
          <DialogTitle>Assign Task</DialogTitle>
          <DialogDescription>Assign this task to a project member.</DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-300">Task</Label>
            <Input
              value={task?.title || ""}
              disabled
              className="h-11 border-[#334155] bg-[#182230] text-slate-300 opacity-100 disabled:cursor-default disabled:opacity-100"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-300">Assign To</Label>
            <Select value={selectedProjectMember} onValueChange={onSelectProjectMember}>
              <SelectTrigger className="h-11 border-[#334155] bg-[#182230] text-slate-200">
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
                    const employeeName =
                      employee.username || employee.name || "Unknown Employee";

                    return (
                      <SelectItem key={member._id} value={member._id}>
                        {employeeName}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-300">Deadline</Label>
            <div className="relative">
              <Input
                ref={deadlineInputRef}
                type="date"
                value={deadline}
                onChange={(event) => onChangeDeadline(event.target.value)}
                className="h-11 w-full border-[#334155] bg-[#182230] pr-12 text-slate-200 [color-scheme:dark] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (deadlineInputRef.current?.showPicker) {
                    deadlineInputRef.current.showPicker();
                  } else {
                    deadlineInputRef.current?.focus();
                  }
                }}
                className="absolute flex items-center justify-center transition-colors -translate-y-1/2 rounded-md right-3 top-1/2 h-7 w-7 text-slate-400 hover:bg-slate-700 hover:text-white"
                aria-label="Select deadline"
              >
                <CalendarDays className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex justify-end gap-3 mt-6 text-black">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 min-w-[100px] border-[#475569] bg-[#182230] text-slate-300 hover:bg-[#223044] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onSubmit}
              disabled={!selectedProjectMember}
              className="h-11 min-w-[130px] bg-blue-600 text-white hover:bg-blue-700"
            >
              Assign Task
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
