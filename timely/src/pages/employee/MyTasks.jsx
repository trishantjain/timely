import { getMyTasks } from "@/api/taskAPI";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button"



export default function MyTasks() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState([]);

    const loadTasks = async () => {

        try {

            const res = await getMyTasks();

            console.log(res.data);

            setTasks(res.data.data);

        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (

        <div className="p-8 mx-auto max-w-7xl">

            <h1 className="mb-6 text-3xl font-bold">
                My Tasks
            </h1>

            {
                tasks.length === 0 ? (

                    <div className="p-8 text-center border rounded-lg">

                        No tasks assigned.

                    </div>

                ) : (

                    <div className="space-y-5">
                        {tasks.map(task => (

                            <div
                                key={task.taskId}
                                className="p-5 bg-white border shadow-sm rounded-xl"
                            >

                                <div className="flex justify-between">

                                    <div>

                                        <h2 className="text-xl font-semibold">
                                            {task.taskTitle}
                                        </h2>

                                        <p className="text-gray-500">
                                            {task.projectName}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            {task.moduleName}
                                        </p>

                                        <p className="mt-2 text-sm">
                                            {task.taskDescription || "-"}
                                        </p>

                                    </div>

                                    <div className="text-right">

                                        <p className="font-medium">
                                            {task.status}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            {task.deadline
                                                ? new Date(task.deadline).toLocaleDateString()
                                                : "No Deadline"}
                                        </p>

                                    </div>

                                </div>

                                <div className="mt-5">

                                    <Button
                                        onClick={() =>
                                            navigate(
                                                `/employee/tasks/${task.componentId}/${task.taskId}`
                                            )
                                        }
                                    >
                                        Open Task
                                    </Button>

                                </div>

                            </div>

                        ))
                        }

                    </div>

                )

            }

        </div>

    );

}
