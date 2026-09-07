import { FolderKanban } from "lucide-react";

import { Badge } from "@/components/ui/badge";

// ==========================================
// PROJECT WORK HEADER
// ==========================================
export default function ProjectWorkHeader({ project, onBack, workPackageCount, taskCount }) {
  return (
    <>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <button onClick={onBack} className="transition-colors hover:text-foreground">
          {project?.name || "Project"}
        </button>
        <span>/</span>
        <span className="font-medium text-foreground">Project Work</span>
      </div>

      <div className="flex flex-col gap-3 border-b border-[#cfd6df] pb-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#cfd6df] bg-[#f8f9fb]">
            <FolderKanban size={19} className="text-[#334155]" />
          </div>

          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              Project Work
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {project?.name || "Manage project domains, Work Packages and tasks"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-[#cfd6df] bg-[#f8f9fb] px-3 py-1 text-xs font-medium">
            {workPackageCount} Work Packages
          </Badge>
          <Badge variant="outline" className="border-[#cfd6df] bg-[#f8f9fb] px-3 py-1 text-xs font-medium">
            {taskCount} Tasks
          </Badge>
        </div>
      </div>
    </>
  );
}
