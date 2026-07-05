import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import StatsCards from "@/components/dashboard/StatsCards"
import ProjectList from "@/components/project/ProjectList"
import { getProjects } from "@/api/projectAPI"
import { useState, useEffect } from "react"
import CreateProjectDialog from "@/components/project/CreateProjectDialog"

export default function AdminDashboard() {

    // const [projectName, setProjectName] = useState("")
    // const [description, setDescription] = useState("")
    const [projects, setProjects] = useState([])
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const [openCreateProject, setOpenCreateProject] = useState(false)
    // const [selectedProject, setSelectedProject] = useState(null)

    const fetchProjects = async () => {
        try {
            const res = await getProjects()
            setProjects(res.data)
        } catch (error) {
            console.error("Error fetching projects:", error)
        }
    }

    // const handleCreateProject = async () => {

    //     await createProject({
    //         name: projectName,
    //         description: description
    //     })

    //     fetchProjects()
    // }

    useEffect(() => {
        // const loadProjects = async () => {
        //     try {
        //         const res = await getProjects()
        //         setProjects(res.data)
        //     } catch (err) {
        //         console.error(err)
        //     }
        // }

        // loadProjects()
        fetchProjects();
    }, [])

    return (
        < div className="p-6" >
            <div className="flex items-center justify-between mb-6">

                <div>

                    <h2 className="text-2xl font-bold">
                        Dashboard
                    </h2>

                    <p className="text-gray-500">
                        Manage projects and employees.
                    </p>

                </div>

                <div className="flex gap-3">

                    <button>
                        Invite Employee
                    </button>

                    <button
                        onClick={() => {
                            console.log("Clicked");
                            setOpenCreateProject(true);
                        }}
                    >
                        New Project
                    </button>

                </div>

            </div>
            <StatsCards
                stats={{
                    projects: projects.length,
                    domains: 0,
                    employees: 0,
                    documents: 0
                }} />

            <div className="grid grid-cols-12 gap-6 mt-6">
                <div className="col-span-12 lg:col-span-4">
                    <ProjectList
                        projects={projects}
                        // toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                        refreshProjects={fetchProjects}
                    />
                </div>
            </ div >

            <CreateProjectDialog
                open={openCreateProject}
                onClose={() => setOpenCreateProject(false)}
                onSuccess={() => {
                    fetchProjects();
                    setOpenCreateProject(false);
                }}
            />
        </div>


    )
}