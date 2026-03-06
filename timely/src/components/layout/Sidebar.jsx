import { Folder, LayoutDashboard, ListTodo, LogOut, Settings, Users } from "lucide-react"

export default function Sidebar() {
    return (
        <div className="flex h-full flex-col p-4">
            <div className="mb-6">
                <div className="text-lg font-semibold">TaskFlow AI</div>
            </div>

            <div className="mb-3 text-xs font-medium text-muted-foreground">RESOURCES</div>

            <nav className="space-y-1">
                <div className="flex items-center gap-3 rounded-md bg-muted px-3 py-2 text-sm font-medium">
                    <LayoutDashboard className="h-4 w-4" />
                    Admin Dashboard
                </div>

                <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer">
                    <ListTodo className="h-4 w-4" />
                    My Tasks
                </div>

                <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer">
                    <Folder className="h-4 w-4" />
                    Projects
                </div>

                <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer">
                    <Users className="h-4 w-4" />
                    Team Members
                </div>
            </nav>

            <div className="mt-auto space-y-1 pt-6">
                <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer">
                    <Settings className="h-4 w-4" />
                    Settings
                </div>

                <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    Logout
                </div>
            </div>
        </div>
    )
}