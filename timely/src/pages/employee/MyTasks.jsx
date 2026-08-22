import { getMyTasks } from "@/api/taskAPI";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";

import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select";

import {
    Badge
} from "@/components/ui/badge";

import {
    Card,
    CardContent
} from "@/components/ui/card";

import {
    Search,
    Calendar,
    FolderKanban,
    Layers
} from "lucide-react";


export default function MyTasks() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

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



    const statusColors = {

        PENDING:
            "bg-gray-100 text-gray-700",

        IN_PROGRESS:
            "bg-blue-100 text-blue-700",

        SUBMITTED:
            "bg-yellow-100 text-yellow-700",

        UNDER_REVIEW:
            "bg-orange-100 text-orange-700",

        APPROVED:
            "bg-green-100 text-green-700",

        REJECTED:
            "bg-red-100 text-red-700"

    };

    const filteredTasks = useMemo(() => {

        return tasks.filter(task => {

            const matchesSearch =

                task.taskTitle
                    .toLowerCase()
                    .includes(search.toLowerCase())

                ||

                task.projectName
                    .toLowerCase()
                    .includes(search.toLowerCase())

                ||

                task.moduleName
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "ALL"
                ||
                task.status === statusFilter;

            return matchesSearch &&
                matchesStatus;

        });

    }, [
        tasks,
        search,
        statusFilter
    ]);

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (

        <div className="p-8 mx-auto max-w-7xl">

            <h1 className="mb-6 text-3xl font-bold">
                My Tasks
            </h1>

            <div className="flex flex-col gap-4 mb-8 md:flex-row">

                <div className="relative flex-1">
                    <Search
                        size={18}
                        className="absolute text-gray-400 left-3 top-3"
                    />

                    <Input
                        className="pl-10"
                        placeholder="Search project, module or task"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />
                </div>

                <Select

                    value={statusFilter}

                    onValueChange={setStatusFilter}

                >

                    <SelectTrigger className="w-60">

                        <SelectValue />

                    </SelectTrigger>

                    <SelectContent>

                        <SelectItem value="ALL">
                            All Status
                        </SelectItem>

                        <SelectItem value="PENDING">
                            Pending
                        </SelectItem>

                        <SelectItem value="IN_PROGRESS">
                            In Progress
                        </SelectItem>

                        <SelectItem value="SUBMITTED">
                            Submitted
                        </SelectItem>

                        <SelectItem value="UNDER_REVIEW">
                            Under Review
                        </SelectItem>

                        <SelectItem value="APPROVED">
                            Approved
                        </SelectItem>

                        <SelectItem value="REJECTED">
                            Rejected
                        </SelectItem>

                    </SelectContent>

                </Select>

            </div>

            {
                filteredTasks.length === 0 ? (

                    <div className="p-8 text-center border rounded-lg">

                        No tasks assigned.

                    </div>

                ) : (

                    <div className="space-y-5">
                        {filteredTasks.map(task => (

                            <Card
                                key={task.taskId}
                                className="transition-shadow hover:shadow-md"
                            >

                                <CardContent className="p-6">

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

                                            <Badge
                                                className={
                                                    statusColors[task.status]
                                                }
                                            >
                                                {task.status}
                                            </Badge>

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

                                </CardContent>

                            </Card>

                        ))
                        }

                    </div>

                )

            }

        </div>

    );

}
