import { Boxes, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// ==========================================
// TEMPLATES TAB
//
// Lists the reusable Work Package templates (ComponentTemplate) this
// project currently uses. This is a separate concern from the Domain
// work configuration view above (spec section 15: don't mix Work
// Package selection with anything else) — it's the same "Components"
// listing the app already had, only relabeled.
// ==========================================
export default function TemplatesTab({ componentTemplates, onOpenCreateTemplate }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#1f2937]">Work Package Templates</h2>
          <p className="mt-1 text-sm text-[#64748b]">
            Reusable Work Package definitions available to every project.
          </p>
        </div>

        <Button
          type="button"
          onClick={onOpenCreateTemplate}
          className="h-9 shrink-0 gap-2 bg-[#2563eb] text-xs text-white hover:bg-[#1d4ed8]"
        >
          <Plus size={16} />
          New Template
        </Button>
      </div>

      {componentTemplates.length === 0 ? (
        <Card className="border-[#d7dde5] bg-[#f8f9fb] shadow-none">
          <CardContent className="py-14 text-center">
            <Boxes size={34} className="mx-auto text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold">No templates yet</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Create a reusable Work Package template to make it available across
              projects.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {componentTemplates.map((template) => {
            const taskCount = template?.tasks?.length || 0;
            const domainName = template?.projectModule?.domain?.name;

            return (
              <Card key={template._id} className="border-[#d7dde5] bg-[#f8f9fb] shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e4eaf1]">
                      <Boxes size={18} className="text-[#475569]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-[#1f2937]">
                        {template.name}
                      </h3>

                      {template.description && (
                        <p className="mt-1 text-sm text-[#64748b]">{template.description}</p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="border-[#cfd6df] bg-white text-[10px]">
                          {taskCount} {taskCount === 1 ? "Task" : "Tasks"}
                        </Badge>

                        {template.projectModule?.name && (
                          <Badge variant="secondary" className="text-[10px]">
                            {template.projectModule.name}
                          </Badge>
                        )}

                        {domainName && (
                          <Badge variant="outline" className="border-[#cfd6df] bg-white text-[10px]">
                            {domainName}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
