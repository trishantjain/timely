// import { getProjectTasks } from "@/api/taskAPI";
import { Folder, LayoutDashboard, LogOut, Settings, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
    const location = useLocation();

    const logout = () => {
        localStorage.clear()
        window.location.href = "/"
    }

    const isActive = (path) => {
        if (path === "/admin") {
            return location.pathname === "/admin";
        }

        return location.pathname.startsWith(path);
    };

    const getNavClass = (path) =>
        `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive(path)
            ? "bg-muted text-foreground"
            : "hover:bg-muted text-muted-foreground hover:text-foreground"
        }`;

    return (
        <div className="flex flex-col h-full p-4">
            <div className="mb-6">
                <div className="text-lg font-semibold">
                    TIMELY AI
                </div>
            </div>

            <nav className="space-y-2">

                <Link
                    to="/admin"
                    className={getNavClass("/admin")}
                >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Dashboard
                </Link>

                <Link
                    to="/admin/employees"
                    className={getNavClass("/admin/employees")}
                >
                    <Users className="w-4 h-4" />
                    Employees
                </Link>

                <Link
                    to="/admin/projects"
                    className={getNavClass("/admin/projects")}
                >
                    <Folder className="w-4 h-4" />
                    Projects
                </Link>

                <Link
                    to="/admin/domains"
                    className={getNavClass("/admin/domains")}
                >
                    <Settings className="w-4 h-4" />
                    Domains
                </Link>

            </nav>

            <div className="pt-6 mt-auto space-y-1">
                <div onClick={logout}
                    className="flex items-center gap-3 px-3 py-2 text-sm rounded-md cursor-pointer text-destructive hover:bg-destructive/10">
                    <LogOut className="w-4 h-4" />
                    Logout
                </div>
            </div>
        </div>
    )
}