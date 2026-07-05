import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import CreateProjectDialog from "../project/CreateProjectDialog"
import { Menu, Bell } from "lucide-react"

export default function Header({ title = "Admin Panel" }) {
    return (

        <header className="flex items-center justify-between px-6 py-4 bg-white border-b">

            <div>
                <h1 className="text-2xl font-bold">
                    {title}
                </h1>
            </div>

            <div className="flex items-center gap-4">

                <button className="p-2 rounded-full hover:bg-gray-100">
                    <Bell size={20} />
                </button>

                <div className="flex items-center justify-center w-10 h-10 font-semibold bg-gray-200 rounded-full">
                    AJ
                </div>

            </div>

        </header>
    )
}