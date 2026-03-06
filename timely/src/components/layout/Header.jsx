import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export default function Header() {
    return (
        <div className="flex items-center justify-between border-b bg-background px-6 py-4">
            <div>
                <h2 className="text-lg font-semibold leading-none">Admin Dashboard</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Manage projects, teams, and track real-time task progress.
                </p>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="outline">Invite Member</Button>
                <Button>+ New Project</Button>
                <Avatar className="ml-2 h-9 w-9">
                    <AvatarFallback>AJ</AvatarFallback>
                </Avatar>
            </div>
        </div>
    )
}