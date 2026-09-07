import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import WorkPackageSelector from "./WorkPackageSelector";
import ProjectWorkPackageList from "./ProjectWorkPackageList";

// ==========================================
// DOMAIN WORK VIEW
//
// Everything shown for a single selected Domain tab: available Work
// Packages to select, and the project's already-selected Work
// Packages with their Tasks (spec sections 4/10).
// ==========================================
export default function DomainWorkView({
  domainTemplates,
  projectComponentsInDomain,
  onSelectTemplate,
  onRemoveWorkPackage,
  busyTemplateId,
  onAddTaskWithoutWorkPackage,
  workPackageListProps,
}) {
  return (
    <div className="space-y-6">
      {/* AVAILABLE WORK PACKAGES */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1f2937]">
            Available Work Packages
          </h3>

          {projectComponentsInDomain.length === 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-[#2563eb] hover:bg-[#eef2f7]"
              onClick={onAddTaskWithoutWorkPackage}
            >
              <Plus size={13} />
              Add a task without a Work Package
            </Button>
          )}
        </div>

        <WorkPackageSelector
          domainTemplates={domainTemplates}
          projectComponentsInDomain={projectComponentsInDomain}
          onSelect={(template) => onSelectTemplate(template)}
          onRemove={onRemoveWorkPackage}
          busyTemplateId={busyTemplateId}
        />
      </div>

      {/* SELECTED WORK PACKAGES */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-[#1f2937]">
          Selected Work Packages
        </h3>

        <ProjectWorkPackageList
          components={projectComponentsInDomain}
          {...workPackageListProps}
        />
      </div>
    </div>
  );
}
