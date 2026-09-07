import { ClipboardList } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import ProjectWorkPackage from "./ProjectWorkPackage";

// ==========================================
// PROJECT WORK PACKAGE LIST
// ==========================================
export default function ProjectWorkPackageList({
  components,
  projectId,
  expandedWorkPackages,
  onToggleWorkPackageExpand,
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
  if (components.length === 0) {
    return (
      <Card className="border-[#d7dde5] bg-[#f8f9fb] shadow-none">
        <CardContent className="py-12 text-center">
          <ClipboardList size={30} className="mx-auto text-muted-foreground" />
          <h3 className="mt-3 text-sm font-semibold">No Work Packages selected</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            Select a Work Package above to generate its default tasks for this
            domain.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {components.map((component) => (
        <ProjectWorkPackage
          key={component._id}
          component={component}
          projectId={projectId}
          expanded={!!expandedWorkPackages[component._id]}
          onToggleExpand={() => onToggleWorkPackageExpand(component._id)}
          expandedTasks={expandedTasks}
          onToggleTaskExpand={onToggleTaskExpand}
          onOpenAssign={onOpenAssign}
          onOpenSubmission={onOpenSubmission}
          onDeleteTask={onDeleteTask}
          onAddSubtask={onAddSubtask}
          onToggleSubtask={onToggleSubtask}
          onDeleteSubtask={onDeleteSubtask}
          onAddTask={onAddTask}
          onRemoveWorkPackage={onRemoveWorkPackage}
          onEditWorkPackage={onEditWorkPackage}
          taskRefs={taskRefs}
        />
      ))}
    </div>
  );
}
