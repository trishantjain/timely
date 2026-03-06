import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import StatsCards from "@/components/dashboard/StatsCards"
import TaskTable from "@/components/dashboard/TaskTable"
import ProjectList from "@/components/dashboard/ProjectList"
import AssignTaskCard from "@/components/dashboard/AssignTaskCard"
import ProjectTeamCard from "@/components/dashboard/ProjectTeamCard"

export default function AdminDashboard() {

    return (

        <div className="flex min-h-screen w-full bg-muted/30">
            <div className="hidden w-64 shrink-0 border-r bg-background lg:block">
                <Sidebar />
            </div>

            <div className="flex flex-1 flex-col">
                <Header />

                <div className="flex-1 p-6">
                    <StatsCards />

                    <div className="mt-6 grid grid-cols-12 gap-6">
                        <div className="col-span-12 lg:col-span-4">
                            <ProjectList />
                        </div>

                        <div className="col-span-12 lg:col-span-5 space-y-6">
                            <AssignTaskCard />
                            <TaskTable />
                        </div>

                        <div className="col-span-12 lg:col-span-3">
                            <ProjectTeamCard />
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}