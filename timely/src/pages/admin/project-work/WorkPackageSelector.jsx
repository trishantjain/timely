import { Boxes } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

// ==========================================
// WORK PACKAGE SELECTOR
//
// Available Work Packages for the active Domain, sourced entirely
// from existing predefined ComponentTemplate data (spec section 4) —
// nothing hardcoded. Checking a box selects it for the project and
// the backend generates its default Tasks (section 5); unchecking a
// box removes that Work Package (and its Tasks) from the project
// only (section 6/8). The checkbox is disabled while a request for
// that template is in flight so rapid double-clicks can't create a
// duplicate request (section 20).
// ==========================================
export default function WorkPackageSelector({
  domainTemplates,
  projectComponentsInDomain,
  onSelect,
  onRemove,
  busyTemplateId,
}) {
  const findComponentForTemplate = (template) =>
    projectComponentsInDomain.find((component) => {
      const templateId =
        component.componentTemplate?._id || component.componentTemplate;

      return templateId && templateId.toString() === template._id.toString();
    });

  if (domainTemplates.length === 0) {
    return (
      <Card className="border-dashed border-[#cbd5e1] bg-[#f3f6f9] shadow-none">
        <CardContent className="py-8 text-center">
          <Boxes size={26} className="mx-auto text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No predefined Work Packages exist for this domain yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {domainTemplates.map((template) => {
        const existingComponent = findComponentForTemplate(template);
        const isSelected = !!existingComponent;
        const isBusy = busyTemplateId === template._id;

        return (
          <label
            key={template._id}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition-colors ${
              isSelected
                ? "border-[#93c5fd] bg-[#eff6ff]"
                : "border-[#d7dde5] bg-white hover:bg-[#f8fafc]"
            } ${isBusy ? "opacity-60" : ""}`}
          >
            <Checkbox
              className="mt-0.5"
              checked={isSelected}
              disabled={isBusy}
              onCheckedChange={(checked) => {
                if (isBusy) return;

                if (checked) {
                  onSelect(template);
                } else if (existingComponent) {
                  onRemove(existingComponent);
                }
              }}
            />

            <div className="min-w-0">
              <p className="truncate font-medium text-[#1f2937]">{template.name}</p>
              {template.description && (
                <p className="mt-0.5 truncate text-xs text-[#64748b]">
                  {template.description}
                </p>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}
