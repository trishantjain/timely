import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

// ==========================================
// EDIT WORK PACKAGE DIALOG
//
// Renames/describes a project's Work Package and lets the admin edit
// or remove individual generated Tasks (spec section 7). Only ever
// touches this project's snapshot — the predefined template is
// never modified (spec section 8).
// ==========================================
export default function EditWorkPackageDialog({
  open,
  onClose,
  editingComponent,
  onChangeField,
  onUpdateTask,
  onAddTask,
  onRemoveTask,
  saving,
  onSubmit,
}) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border border-[#334155] bg-[#192330] p-0 text-slate-100">
        <DialogHeader className="border-b border-[#334155] px-6 py-5">
          <DialogTitle className="text-lg font-semibold text-white">
            Edit Work Package
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-400">
            Changes here affect only this project's Work Package.
          </DialogDescription>
        </DialogHeader>

        {editingComponent && (
          <div className="space-y-5 px-6 py-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-300">Work Package Name</Label>
              <Input
                value={editingComponent.name}
                onChange={(event) => onChangeField("name", event.target.value)}
                placeholder="Work Package name"
                className="h-10 border-[#3b4b60] bg-[#222e3d] text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-300">Description</Label>
              <Textarea
                value={editingComponent.description}
                onChange={(event) => onChangeField("description", event.target.value)}
                placeholder="Work Package description"
                className="min-h-[90px] resize-none border-[#3b4b60] bg-[#222e3d] text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end justify-between gap-4 pt-1">
              <div>
                <Label className="text-sm font-semibold text-slate-200">Tasks</Label>
                <p className="mt-1 text-xs text-slate-400">
                  Manage the tasks included in this Work Package.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddTask}
                className="h-9 gap-2 border-[#3b4b60] bg-[#222e3d] px-4 text-sm text-slate-200 hover:bg-[#2a3849] hover:text-white"
              >
                <Plus size={16} />
                Add Task
              </Button>
            </div>

            <div className="space-y-3">
              {editingComponent.tasks.map((task, index) => (
                <Card key={task._id || index} className="overflow-hidden border-[#3b4b60] bg-[#222e3d] shadow-none">
                  <div className="flex items-center justify-between border-b border-[#3b4b60] px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dce3eb] text-sm font-semibold text-[#334155]">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-slate-300">Task {index + 1}</span>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveTask(index)}
                      className="h-8 w-8 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                      title="Delete Task"
                    >
                      <Trash2 size={17} />
                    </Button>
                  </div>

                  <CardContent className="space-y-4 p-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-300">Task Title</Label>
                      <Input
                        value={task.title}
                        onChange={(event) => onUpdateTask(index, "title", event.target.value)}
                        placeholder="Enter task title"
                        className="h-10 border-[#3b4b60] bg-[#1b2634] text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-300">Description</Label>
                      <Textarea
                        value={task.description}
                        onChange={(event) => onUpdateTask(index, "description", event.target.value)}
                        placeholder="Enter task description"
                        className="min-h-[80px] resize-none border-[#3b4b60] bg-[#1b2634] text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="border-t border-[#334155] bg-[#192330] px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={saving}
            className="h-10 min-w-[145px] bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
