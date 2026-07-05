import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"

// const members = [
//     { name: "Sarah Chen", initials: "SC" },
//     { name: "Marcus Miller", initials: "MM" },
//     { name: "Elena Rodriguez", initials: "ER" },
//     { name: "David Kim", initials: "DK" },
//     { name: "Jordan Smyth", initials: "JS" },
// ]

export default function ProjectTeamCard({ project }) {

    if (!project) return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-semibold">
                    Project Team
                </CardTitle>
            </CardHeader>

            <CardContent className="text-sm text-muted-foreground">
                Select a project to view team members
            </CardContent>
        </Card>
    );

    const members = project.members || [];

    return (
        <Card>

            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                    Project Team
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">

                {members.map((m) => (

                    <div
                        key={m.user_id._id}
                        className="flex items-center gap-3"
                    >

                        <Avatar className="w-8 h-8">
                            <AvatarFallback>
                                {m.user_id.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="text-sm">
                            {m.user_id.username}
                        </div>

                    </div>

                ))}

                <Button
                    variant="outline"
                    className="justify-start w-full gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Member
                </Button>

            </CardContent>

        </Card>
    )
}
