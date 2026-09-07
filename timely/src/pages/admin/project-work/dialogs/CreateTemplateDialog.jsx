import { Plus, Trash2 } from "lucide-react";

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

// ==========================================
// CREATE WORK PACKAGE TEMPLATE DIALOG
//
// Defines a brand-new reusable Work Package (ComponentTemplate) and
// immediately adds it to the current project. This is the same
// createComponentTemplate + addProjectComponent flow the app already
// had — only the terminology and module picker changed.
// ==========================================
export default function CreateTemplateDialog({
  open,
  onClose,
  modules,
  newComponent,
  onChangeField,
  onAddTask,
  onUpdateTask,
  onRemoveTask,
  saving,
  onSubmit,
}) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-[#cfd6df] bg-[#f8f9fb]">
        <DialogHeader>
          <DialogTitle>New Work Package Template</DialogTitle>
          <DialogDescription>
            Create a reusable Work Package and define its default tasks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label>Project Module</Label>
            <select
              value={newComponent.projectModule}
              onChange={(event) => onChangeField("projectModule", event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
            >
              <option value="">Select module</option>
              {modules.map((module) => (
                <option key={module._id} value={module._id}>
                  {module.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Work Package Name</Label>
            <Input
              value={newComponent.name}
              onChange={(event) => onChangeField("name", event.target.value)}
              placeholder="Enter Work Package name"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={newComponent.description}
              onChange={(event) => onChangeField("description", event.target.value)}
              placeholder="Optional description"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Default Tasks</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Every project that selects this Work Package gets these tasks
                  automatically.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={onAddTask}>
                <Plus size={14} />
                Add Task
              </Button>
            </div>

            <div className="space-y-3">
              {newComponent.tasks.map((task, index) => (
                <div key={index} className="rounded-lg border border-[#d7dde5] bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">Task {index + 1}</p>
                    {newComponent.tasks.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => onRemoveTask(index)}
                      >
                        <Trash2 size={15} />
                      </Button>
                    )}
                  </div>

                  <div className="mt-3 grid gap-3">
                    <Input
                      value={task.title}
                      onChange={(event) => onUpdateTask(index, "title", event.target.value)}
                      placeholder="Task title"
                    />
                    <Textarea
                      value={task.description}
                      onChange={(event) => onUpdateTask(index, "description", event.target.value)}
                      placeholder="Task description"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={saving}
            className="bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
          >
            {saving ? "Creating..." : "Create Work Package"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
