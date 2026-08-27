import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function ProjectTeamCard({ project }) {
  if (!project) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Project Team
          </CardTitle>
        </CardHeader>

        <CardContent className="text-sm text-muted-foreground">
          Select a project to view team members
        </CardContent>
      </Card>
    );
  }

  const members = project.members || [];

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Project Team</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {members.map((m) => (
          <div
            key={m.user_id._id}
            className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-muted/60"
          >
            <Avatar className="w-8 h-8 border border-border">
              <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                {m.user_id.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="text-sm font-medium text-foreground">
              {m.user_id.username}
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          className="justify-start w-full gap-2 border-border bg-background hover:bg-muted"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </Button>
      </CardContent>
    </Card>
  );
}