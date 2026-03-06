import Navbar from "../components/layout/Navbar"
import TaskTable from "../components/tasks/TaskTable"

const tasks = [
  {
    id: 1,
    title: "Prepare EMS report",
    project: "EMS",
    status: "Pending",
    dueDate: "2026-03-10"
  }
]

export default function UserDashboard() {

  return (

    <div>

      <Navbar />

      <div className="p-6">
        <h2 className="mb-4 text-xl font-bold">
          My Tasks
        </h2>

        <TaskTable tasks={tasks} />

      </div>

    </div>

  )
}