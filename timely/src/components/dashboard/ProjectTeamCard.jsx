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

const members = [
    { name: "Sarah Chen", initials: "SC" },
    { name: "Marcus Miller", initials: "MM" },
    { name: "Elena Rodriguez", initials: "ER" },
    { name: "David Kim", initials: "DK" },
    { name: "Jordan Smyth", initials: "JS" },
]

export default function ProjectTeamCard() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm font-semibold">Project Team</CardTitle>
                    <Select defaultValue="Cloud Infrastructure Migration">
                        <SelectTrigger className="h-8 w-[160px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Cloud Infrastructure Migration">
                                Cloud Infrastructure Migration
                            </SelectItem>
                            <SelectItem value="Mobile App Redesign">Mobile App Redesign</SelectItem>
                            <SelectItem value="Annual Security Audit">Annual Security Audit</SelectItem>
                            <SelectItem value="AI Recommendation Engine">AI Recommendation Engine</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {members.map((member) => (
                    <div key={member.name} className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback>{member.initials}</AvatarFallback>
                        </Avatar>
                        <div className="text-sm font-medium">{member.name}</div>
                    </div>
                ))}

                <Button variant="outline" className="w-full justify-start gap-2">
                    <Plus className="h-4 w-4" />
                    Add Member
                </Button>
            </CardContent>
        </Card>
    )
}
