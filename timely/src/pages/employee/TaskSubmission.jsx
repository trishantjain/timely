import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getTaskDetails } from "@/api/projectComponentAPI";
import { submitTask } from "@/api/submissionAPI";

export default function TaskSubmission() {

    const navigate = useNavigate();

    const { componentId, taskId } = useParams();

    const [loading, setLoading] = useState(true);
    const [taskData, setTaskData] = useState(null);

    // const [task, setTask] = useState(null);
    const [textSubmission, setTextSubmission] = useState("");


    const loadTask = async () => {

        try {

            const res = await getTaskDetails(
                componentId,
                taskId
            );

            setTaskData(res.data.data);

        }
        catch (err) {

            console.error(err);

        }
        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadTask();

    }, []);


    const handleSubmit = async () => {

        try {

            await submitTask({

                projectComponentId: componentId,

                taskId,

                textSubmission

            });

            alert("Task submitted successfully.");

            navigate("/employee/tasks");

        }
        catch (err) {

            console.error(err);

            alert(
                err.response?.data?.message ||
                "Submission failed."
            );

        }

    };

    if (loading) {

        return <div className="p-8">Loading...</div>;

    }

    const task = taskData.task;


    return (

        <div className="max-w-5xl p-8 mx-auto">

            <h1 className="text-3xl font-bold">

                {task.title}

            </h1>

            <p className="mt-2 text-gray-500">

                {taskData.componentName}

            </p>

            <div className="grid grid-cols-2 gap-6 mt-8">

                <div>

                    <p>
                        <strong>Project :</strong>{" "}
                        {taskData.projectName}
                    </p>

                    <p>
                        <strong>Module :</strong>{" "}
                        {taskData.moduleName}
                    </p>

                </div>

                <div>

                    <p>
                        <strong>Status :</strong>{" "}
                        {task.status}
                    </p>

                    <p>
                        <strong>Deadline :</strong>{" "}
                        {
                            task.deadline
                                ? new Date(task.deadline).toLocaleDateString()
                                : "No Deadline"
                        }
                    </p>

                </div>

            </div>

            <div className="mt-8">

                <h3 className="mb-2 text-lg font-semibold">

                    Instructions

                </h3>

                <div className="p-4 border rounded-lg">

                    {
                        task.description
                            ? task.description
                            : "No instructions provided."
                    }

                </div>

            </div>

            {
                task.submissionRule.type === "TEXT" && (

                    <div className="mt-8">

                        <h3 className="mb-2 text-lg font-semibold">

                            Submission

                        </h3>

                        <Textarea
                            className="min-h-40"
                            placeholder="Enter your work..."
                            value={textSubmission}
                            onChange={(e) =>
                                setTextSubmission(e.target.value)
                            }
                        />

                    </div>

                )
            }

            <div className="mt-8">

                <Button
                    onClick={handleSubmit}
                >
                    Submit
                </Button>

            </div>

        </div>

    );



}