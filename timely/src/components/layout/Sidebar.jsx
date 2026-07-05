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

    // const [tasks, setTasks] = useState([]);

    // useEffect(() => {

    //     if (!projectId) return

    //     const loadTasks = async () => {

    //         try {

    //             // later connect API
    //             const res = await getProjectTasks(projectId)
    //             setTasks(res.data)

    //             // setTasks([]);

    //         } catch (err) {
    //             console.error(err);
    //         }

    //     }

    //     loadTasks()

    // }, [projectId])

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
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-muted">
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Dashboard
                </Link>

                <Link
                    to="/admin/employees"
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                >
                    <Users className="w-4 h-4" />
                    Employees
                </Link>

                <Link
                    to="/admin"
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                >
                    <Folder className="w-4 h-4" />
                    Projects
                </Link>

                <Link
                    to="/admin/domains"
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                >
                    <Settings className="w-4 h-4" />
                    Domains
                </Link>

                {/* {projectId && (

                    <div className="mt-4">

                        <div className="mb-2 text-xs text-muted-foreground">
                            TASKS
                        </div>

                        {tasks.map(task => (

                            <div
                                key={task.id}
                                className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted"
                            >
                                <ListTodo className="w-4 h-4" />

                                {task.title}
                            </div>
                        ))}

                    </div>

                )} */}
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