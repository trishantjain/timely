import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"

export default function Assignments() {

    const tasks = [
        "Fix Authentication Middleware Bug",
        "Design System Documentation",
        "Database Migration Script"
    ]

    return (

        <div className="flex">

            <Sidebar />

            <div className="flex-1">

                <Header />

                <div className="p-6 space-y-4">

                    <h2 className="text-xl font-semibold">
                        My Assignments
                    </h2>

                    {tasks.map((task, i) => (
                        <div
                            key={i}
                            className="border rounded p-4 bg-white"
                        >
                            {task}
                        </div>
                    ))}

                </div>

            </div>

        </div>

    )

}