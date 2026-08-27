import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { getTaskDetails } from "@/api/projectComponentAPI";
import { submitTask } from "@/api/submissionAPI";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import {
  Upload,
  CalendarDays,
  ClipboardList,
  FileText,
  ArrowLeft,
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
  const fileInputRef = useRef(null);

  const loadTask = async () => {
    try {
      const res = await getTaskDetails(componentId, taskId);

      setTaskData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, []);

  const submissionRule = taskData?.task?.submissionRule;

  const acceptedExtensions = useMemo(() => {
    if (!submissionRule) return [];

    return (
      submissionRule.allowedExtensions?.map((ext) => ext.toLowerCase()) || []
    );
  }, [submissionRule]);

  const validateFiles = (files) => {
    const validationErrors = [];

    if (!submissionRule) return [];

    if (submissionRule.maxFiles && files.length > submissionRule.maxFiles) {
      validationErrors.push(
        `Maximum ${submissionRule.maxFiles} file(s) allowed.`,
      );
    }

    files.forEach((file) => {
      const extension = "." + file.name.split(".").pop().toLowerCase();

      if (
        acceptedExtensions.length &&
        !acceptedExtensions.includes(extension)
      ) {
        validationErrors.push(`${file.name} is not an allowed file type.`);
      }

      const sizeMB = file.size / 1024 / 1024;

      if (
        submissionRule.maxFileSizeMB &&
        sizeMB > submissionRule.maxFileSizeMB
      ) {
        validationErrors.push(
          `${file.name} exceeds ${submissionRule.maxFileSizeMB} MB`,
        );
      }
    });

    return validationErrors;
  };

  const handleFiles = (incomingFiles) => {
    const files = Array.from(incomingFiles);

    const validation = validateFiles(files);

    setErrors(validation);

    if (validation.length) return;

    setSelectedFiles(files);
  };

  const handleFileChange = (event) => {
    const files = event.target.files;

    if (!files || !files.length) return;

    handleFiles(files);

    // Allows selecting the same file again after removing it
    event.target.value = "";
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
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

        files: selectedFiles,
      });

      alert("Task submitted successfully.");

      navigate("/employee/tasks");
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Submission failed.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  const task = taskData.task;

  return (
    <div className="w-full px-6 py-5 lg:px-8">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to Tasks
      </button>

      {/* TASK HEADER */}
      <div className="mb-5 text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {task.title}
        </h1>

        {task.moduleName && (
          <p className="mt-1 text-sm text-muted-foreground">
            {task.moduleName}
          </p>
        )}
      </div>

      {/* TASK SUMMARY */}
      <Card className="mb-5">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
            {/* STATUS */}
            <div className="p-4">
              <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                Status
              </p>

              <Badge variant="secondary" className="px-3 py-1 font-medium">
                {task.status || "PENDING"}
              </Badge>
            </div>

            {/* DEADLINE */}
            <div className="p-4">
              <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                Deadline
              </p>

              <div className="flex items-center gap-2 text-sm font-medium">
                <CalendarDays size={17} className="text-muted-foreground" />

                {task.deadline
                  ? new Date(task.deadline).toLocaleDateString()
                  : "No deadline"}
              </div>
            </div>

            {/* SUBMISSION TYPE */}
            <div className="p-4">
              <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                Submission Type
              </p>

              <Badge variant="outline">
                {task.submissionType || "DOCUMENT"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* INSTRUCTIONS + RULES */}
      <div className="grid gap-5 mb-6 md:grid-cols-2">
        {/* INSTRUCTIONS */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={18} className="text-muted-foreground" />

              <h2 className="font-semibold">Instructions</h2>
            </div>

            <p className="text-sm leading-6 text-muted-foreground">
              {task.description || "No instructions provided."}
            </p>
          </CardContent>
        </Card>

        {/* SUBMISSION RULES */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList size={18} className="text-muted-foreground" />

              <h2 className="font-semibold">Submission Rules</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Allowed files</span>

                <Badge variant="outline">
                  {task.allowedFileTypes?.length
                    ? task.allowedFileTypes.join(", ")
                    : "Any"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Maximum files</span>

                <span className="font-medium">{task.maxFiles || 1}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Maximum size</span>

                <span className="font-medium">{task.maxFileSize || 10} MB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SUBMISSION */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Submission</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Upload your completed work for this task.
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          {/* YOUR EXISTING UPLOAD COMPONENT / DROPZONE GOES HERE */}

          <div className="border-2 border-dashed rounded-xl">
            <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
              <div className="flex items-center justify-center mb-3 border rounded-full w-11 h-11 bg-muted">
                <Upload size={21} />
              </div>

              <p className="font-medium">Upload your submission</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Drag and drop your file here, or click to browse.
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* EXISTING SELECTED FILE UI */}
          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 p-3 border rounded-lg"
                >
                  <div className="flex items-center min-w-0 gap-3">
                    <div className="flex items-center justify-center border rounded-lg w-9 h-9 bg-muted">
                      <FileText size={17} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-5 mt-5 border-t">
            <Button
              onClick={handleSubmit}
              disabled={uploading || selectedFiles.length === 0}
            >
              {uploading ? "Submitting..." : "Submit Work"}
            </Button>{" "}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
