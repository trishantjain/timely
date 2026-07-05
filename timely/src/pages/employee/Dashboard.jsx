import { useEffect, useState } from "react"
import Navbar from "../../components/layout/Navbar"
// import TaskTable from "../components/tasks/TaskTable"
import { getMyProjects } from "@/api/assignmentAPI";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button"

export default function UserDashboard() {
  const [projects, setProjects] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {

    const loadProjects = async () => {
      const res = await getMyProjects();
      setProjects(res.data);

      console.log("projects", projects);
    };

    loadProjects();

  }, [])

  return (

    <div>

      <Navbar />

      <div className="p-6">
        <h2 className="mb-4 text-xl font-bold">
          My Projects
        </h2>

        <Button
          onClick={() => navigate("/employee/tasks")}
        >
          My Tasks
        </Button>

        <div className="grid gap-6">

          {projects.length === 0 ? (

            <div className="p-10 text-center border rounded-lg">

              No projects assigned.

            </div>

          ) : (

            projects.map(project => (

              <div
                key={project.project._id}
                className="p-6 bg-white border shadow-sm rounded-xl"
              >

                <h3 className="text-xl font-semibold">
                  {project.project.name}
                </h3>

                <button
                  onClick={() =>
                    navigate(`/dashboard/project/${project.project._id}`)
                  }
                  className="px-5 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Open Project
                </button>

                <p className="mt-2 text-gray-500">
                  {project.project.description}
                </p>

                <div className="flex gap-3 mt-4">

                  <span className="px-3 py-1 text-sm bg-blue-100 rounded-full">
                    {project.domain.name}
                  </span>

                  <span className="px-3 py-1 text-sm bg-green-100 rounded-full">
                    {project.status}
                  </span>

                </div>

              </div>

            ))

          )}

        </div>

      </div>

    </div >

  )
}