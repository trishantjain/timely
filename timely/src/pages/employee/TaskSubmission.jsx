import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { getTaskDetails } from "@/api/projectComponentAPI";
import { submitTask } from "@/api/submissionAPI";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";

import {
    Badge
} from "@/components/ui/badge";

import {
    Upload,
    File,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Trash2
} from "lucide-react";

export default function TaskSubmission() {

    const navigate = useNavigate();

    const { componentId, taskId } = useParams();

    const [loading, setLoading] = useState(true);
    const [taskData, setTaskData] = useState(null);

    // const [task, setTask] = useState(null);
    const [textSubmission, setTextSubmission] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [errors, setErrors] = useState([]);


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

    const submissionRule = taskData?.task?.submissionRule;

    const acceptedExtensions = useMemo(() => {

        if (!submissionRule) return [];

        return submissionRule.allowedExtensions?.map(ext =>
            ext.toLowerCase()
        ) || [];

    }, [submissionRule]);

    const validateFiles = (files) => {

        const validationErrors = [];

        if (!submissionRule)
            return [];

        if (
            submissionRule.maxFiles &&
            files.length > submissionRule.maxFiles
        ) {

            validationErrors.push(
                `Maximum ${submissionRule.maxFiles} file(s) allowed.`
            );

        }

        files.forEach(file => {

            const extension =
                "." +
                file.name
                    .split(".")
                    .pop()
                    .toLowerCase();

            if (
                acceptedExtensions.length &&
                !acceptedExtensions.includes(extension)
            ) {

                validationErrors.push(
                    `${file.name} is not an allowed file type.`
                );

            }

            const sizeMB =
                file.size / 1024 / 1024;

            if (
                submissionRule.maxFileSizeMB &&
                sizeMB > submissionRule.maxFileSizeMB
            ) {

                validationErrors.push(
                    `${file.name} exceeds ${submissionRule.maxFileSizeMB} MB`
                );

            }

        });

        return validationErrors;

    };

    const handleFiles = (incomingFiles) => {

        const files = Array.from(incomingFiles);

        const validation =
            validateFiles(files);

        setErrors(validation);

        if (validation.length)
            return;

        setSelectedFiles(files);

    };

    const removeFile = (index) => {

        setSelectedFiles(prev =>
            prev.filter((_, i) => i !== index)
        );

    };

    // const handleSubmit = async () => {

    //     try {

    //         await submitTask({

    //             projectComponentId: componentId,

    //             taskId,

    //             textSubmission

    //         });

    //         alert("Task submitted successfully.");

    //         navigate("/employee/tasks");

    //     }
    //     catch (err) {

    //         console.error(err);

    //         alert(
    //             err.response?.data?.message ||
    //             "Submission failed."
    //         );

    //     }

    // };

    const handleSubmit = async () => {

        try {

            setUploading(true);

            await submitTask({

                projectComponentId: componentId,

                taskId,

                textSubmission,

                files: selectedFiles

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
        finally {

            setUploading(false);

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

            <div className="grid grid-cols-3 gap-5 mt-8">

                <Card>

                    <CardHeader>

                        <CardTitle>

                            Status

                        </CardTitle>

                    </CardHeader>

                    <CardContent>

                        <Badge>

                            {task.status}

                        </Badge>

                    </CardContent>

                </Card>

                <Card>

                    <CardHeader>

                        <CardTitle>

                            Deadline

                        </CardTitle>

                    </CardHeader>

                    <CardContent>

                        <div className="flex items-center gap-2">

                            <Calendar size={18} />

                            {
                                task.deadline
                                    ? new Date(task.deadline).toLocaleDateString()
                                    : "No deadline"
                            }

                        </div>

                    </CardContent>

                </Card>

                <Card>

                    <CardHeader>

                        <CardTitle>

                            Submission Type

                        </CardTitle>

                    </CardHeader>

                    <CardContent>

                        <Badge variant="secondary">

                            {submissionRule.type}

                        </Badge>

                    </CardContent>

                </Card>

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


            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>
                        Submission Rules
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">

                    <div className="flex flex-wrap gap-2">
                        {
                            acceptedExtensions.length
                                ? acceptedExtensions.map(ext => (
                                    <Badge
                                        key={ext}
                                        variant="outline"
                                    >
                                        {ext}
                                    </Badge>
                                ))
                                : (
                                    <Badge>
                                        Any
                                    </Badge>
                                )
                        }
                    </div>

                    <div>

                        Maximum Files :
                        <strong>
                            {" "}
                            {submissionRule.maxFiles}
                        </strong>

                    </div>

                    <div>

                        Maximum Size :
                        <strong>
                            {" "}
                            {submissionRule.maxFileSizeMB} MB
                        </strong>

                    </div>

                </CardContent>

            </Card>

            {
                // task.submissionRule.type === "TEXT" && (

                //     <div className="mt-8">

                //         <h3 className="mb-2 text-lg font-semibold">

                //             Submission

                //         </h3>

                //         <Textarea
                //             className="min-h-40"
                //             placeholder="Enter your work..."
                //             value={textSubmission}
                //             onChange={(e) =>
                //                 setTextSubmission(e.target.value)
                //             }
                //         />

                //     </div>

                // )

                <div className="mt-8">

                    <h3 className="mb-4 text-lg font-semibold">
                        Submission
                    </h3>

                    {submissionRule.type === "TEXT" && (

                        <Textarea

                            className="min-h-40"

                            placeholder="Enter your work..."

                            value={textSubmission}

                            onChange={(e) =>
                                setTextSubmission(e.target.value)
                            }

                        />

                    )}

                    {submissionRule.type !== "TEXT" && (

                        <>

                            <div

                                className={`border-2 border-dashed rounded-lg p-8 text-center transition

                ${dragging
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-300"
                                    }`}

                                onDragOver={(e) => {

                                    e.preventDefault();

                                    setDragging(true);

                                }}

                                onDragLeave={() =>
                                    setDragging(false)
                                }

                                onDrop={(e) => {

                                    e.preventDefault();

                                    setDragging(false);

                                    handleFiles(
                                        e.dataTransfer.files
                                    );

                                }}

                            >

                                <label className="block cursor-pointer">

                                    <input
                                        hidden
                                        type="file"
                                        multiple={submissionRule.maxFiles > 1}
                                        onChange={(e) =>
                                            handleFiles(e.target.files)
                                        }
                                    />

                                    <div className="flex flex-col items-center justify-center py-10">

                                        <Upload size={42} />

                                        <p className="mt-4 font-medium">
                                            Click or Drag Files Here
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            Upload your submission
                                        </p>

                                    </div>

                                </label>

                                <p className="mt-3 text-sm text-gray-500">

                                    Drag & Drop files here

                                </p>

                            </div>

                            {errors.length > 0 && (

                                <div className="p-4 mt-4 text-red-700 border rounded bg-red-50">

                                    {errors.map(error => (

                                        <div key={error}>
                                            • {error}
                                        </div>

                                    ))}

                                </div>

                            )}

                            {selectedFiles.length > 0 && (

                                <div className="mt-5 space-y-2">

                                    {selectedFiles.map((file, index) => (

                                        <div

                                            key={index}

                                            className="flex items-center justify-between p-3 border rounded"

                                        >

                                            <div className="flex items-center gap-3">

                                                <File size={18} />

                                                <div>

                                                    <p className="font-medium">

                                                        {file.name}

                                                    </p>

                                                    <p className="text-xs text-gray-500">

                                                        {(file.size / 1024).toFixed(1)} KB

                                                    </p>

                                                </div>

                                            </div>
                                            <Button

                                                variant="ghost"

                                                size="icon"

                                                onClick={() =>
                                                    removeFile(index)
                                                }

                                            >

                                                <Trash2 size={18} />

                                            </Button>
                                        </div>

                                    ))}

                                </div>

                            )}

                        </>

                    )}

                </div>
            }


            <div className="mt-8">

                <Button

                    disabled={
                        uploading ||
                        errors.length > 0
                    }

                    onClick={handleSubmit}

                >

                    {
                        uploading
                            ? "Submitting..."
                            : "Submit"
                    }

                </Button>
            </div>

        </div>

    );



}