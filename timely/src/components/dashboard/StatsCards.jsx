import {
  FolderKanban,
  ClipboardList,
  CircleCheck,
  TriangleAlert,
  ArrowUpRight,
} from "lucide-react";

import { Card } from "@/components/ui/card";

export default function StatsCards({ stats = {} }) {
  const cards = [
    {
      label: "Active Projects",
      value: stats.projects ?? 0,
      description: "Projects currently available",
      icon: FolderKanban,
    },
    {
      label: "Pending Tasks",
      value: stats.pending ?? 0,
      description: "Tasks waiting for completion",
      icon: ClipboardList,
    },
    {
      label: "Completed Tasks",
      value: stats.completed ?? 0,
      description: "Tasks completed successfully",
      icon: CircleCheck,
    },
    {
      label: "Alerts",
      value: stats.alerts ?? 0,
      description: "No items require attention",
      icon: TriangleAlert,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.label}
            className="
              group
              min-h-[122px]
              border
              px-4
              py-3
              shadow-sm
              transition-all
              duration-200
              hover:border-orange-400/60
              hover:shadow-md
            "
          >
            {/* TOP */}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center transition-colors border rounded-lg h-9 w-9 bg-muted/40 text-muted-foreground group-hover:border-orange-200 group-hover:bg-orange-50 group-hover:text-orange-600">
                  <Icon size={17} />
                </div>

                <span className="text-sm font-medium">{card.label}</span>
              </div>

              <ArrowUpRight
                size={16}
                className="transition-colors text-muted-foreground group-hover:text-orange-600"
              />
            </div>

            {/* CONTENT */}

            <div className="mt-4">
              <div className="text-2xl font-bold tracking-tight">
                {card.value}
              </div>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {card.description}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
