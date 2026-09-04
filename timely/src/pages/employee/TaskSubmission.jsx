import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { getTaskDetails, tagEmployeeOnTask } from "@/api/projectComponentAPI";
import { submitTask } from "@/api/submissionAPI";
import { getProjectMembers } from "@/api/projectMemberAPI";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import {
  Upload,
  File,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Users,
  Tag,
} from "lucide-react";

export default function TaskSubmission() {
  const navigate = useNavigate();

  const { componentId, taskId } = useParams();

  const [loading, setLoading] = useState(true);
  const [taskData, setTaskData] = useState(null);

  const [textSubmission, setTextSubmission] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [supportingPdfs, setSupportingPdfs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState([]);

  const [projectMembers, setProjectMembers] = useState([]);
  const [tagEmployeeId, setTagEmployeeId] = useState("");
  const [tagMessage, setTagMessage] = useState("");
  const [tagging, setTagging] = useState(false);
  const [tagError, setTagError] = useState("");

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

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

  useEffect(() => {
    const projectId = taskData?.projectId || taskData?.project?._id;

    if (!projectId) return;

    getProjectMembers(projectId)
      .then((res) => setProjectMembers(res.data?.data || []))
      .catch((err) => console.error(err));
  }, [taskData?.projectId]);

  const taggedIds = useMemo(
    () => (taskData?.task?.tags || []).map((t) => t.employee?._id),
    [taskData],
  );

  const taggableMembers = useMemo(
    () =>
      projectMembers.filter(
        (m) =>
          m.employee &&
          m.employee._id !== currentUser?._id &&
          !taggedIds.includes(m.employee._id),
      ),
    [projectMembers, currentUser, taggedIds],
  );

  const handleTagEmployee = async () => {
    if (!tagEmployeeId) {
      setTagError("Choose an employee to tag.");
      return;
    }

    try {
      setTagging(true);
      setTagError("");

      await tagEmployeeOnTask(componentId, taskId, {
        employeeId: tagEmployeeId,
        message: tagMessage,
      });

      setTagEmployeeId("");
      setTagMessage("");

      await loadTask();
    } catch (err) {
      console.error(err);

      setTagError(err.response?.data?.message || "Unable to tag employee.");
    } finally {
      setTagging(false);
    }
  };

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
    const newFiles = Array.from(incomingFiles);

    const combinedFiles = [...selectedFiles, ...newFiles];

    const validation = validateFiles(combinedFiles);

    setErrors(validation);

    if (validation.length) return;

    setSelectedFiles(combinedFiles);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (isTextSubmission && !textSubmission.trim()) {
      setErrors(["Please enter your task submission."]);
      return;
    }

    try {
      setUploading(true);

      await submitTask({
        projectComponentId: componentId,
        taskId,
        textSubmission,
        files: selectedFiles,
        supportingPdfs,
      });

      alert("Task submitted successfully.");

      // Return to wherever the employee opened this task from (their
      // project's task list, the global My Tasks list, or the dashboard)
      // instead of always forcing them back to the unfiltered task list.
      navigate(-1);
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Unable to submit task.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-muted-foreground">Loading task...</p>
      </div>
    );
  }

  if (!taskData?.task) {
    return <div className="p-8 text-muted-foreground">Task not found.</div>;
  }

  const { task, component, project, module } = taskData;

  const isTextSubmission = submissionRule?.type === "TEXT";

  return (
    <div className="max-w-5xl p-6 mx-auto lg:p-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-5 text-sm transition-colors text-muted-foreground hover:text-foreground"
      >
        ← Back
      </button>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {project?.name}
                  </p>

                  <CardTitle className="mt-1 text-xl">{task.title}</CardTitle>
                </div>

                <Badge
                  variant="outline"
                  className="border-border bg-muted text-muted-foreground"
                >
                  {task.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              {task.description && (
                <p className="text-sm leading-6 text-muted-foreground">
                  {task.description}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Submit Work</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              {isTextSubmission && (
                <>
                  <Textarea
                    placeholder="Write your submission here..."
                    value={textSubmission}
                    onChange={(e) => setTextSubmission(e.target.value)}
                    className="min-h-[220px] resize-y bg-background"
                  />
                </>
              )}

              {!isTextSubmission && (
                <>
                  <div
                    className={`flex flex-col items-center justify-center rounded-lg border border-dashed p-8 transition-colors ${
                      dragging
                        ? "border-primary bg-muted"
                        : "border-border bg-muted/30 hover:bg-muted/60"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();

                      setDragging(false);

                      handleFiles(e.dataTransfer.files);
                    }}
                  >
                    <Upload className="w-6 h-6 text-muted-foreground" />

                    <p className="mt-3 text-sm font-medium">
                      Drag and drop files here
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      or select files from your device
                    </p>

                    <label className="mt-4">
                      <Button type="button" variant="outline" asChild>
                        <span>Select Files</span>
                      </Button>

                      <input
                        type="file"
                        className="hidden"
                        multiple={submissionRule?.maxFiles !== 1}
                        onChange={(e) => handleFiles(e.target.files)}
                      />
                    </label>
                  </div>
                </>
              )}

              {/* OPTIONAL SUPPORTING PDF */}
              <div className="pt-2">
                <p className="mb-2 text-sm font-medium">Supporting Document</p>

                <div className="flex flex-wrap items-center gap-3">
                  <label>
                    <Button type="button" variant="outline" asChild>
                      <span>
                        <Upload size={16} className="mr-2" />
                        Upload PDF
                      </span>
                    </Button>

                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);

                        if (!files.length) return;

                        const invalidFiles = files.filter(
                          (file) => file.type !== "application/pdf",
                        );

                        if (invalidFiles.length > 0) {
                          setErrors(["Only PDF files are allowed."]);
                          e.target.value = "";
                          return;
                        }

                        setErrors([]);

                        setSupportingPdfs((prev) => [...prev, ...files]);

                        e.target.value = "";
                      }}
                    />
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);

                        if (!files.length) return;

                        const invalidFiles = files.filter(
                          (file) => file.type !== "application/pdf",
                        );

                        if (invalidFiles.length > 0) {
                          setErrors(["Only PDF files are allowed."]);
                          e.target.value = "";
                          return;
                        }

                        setErrors([]);

                        setSupportingPdfs((prev) => [...prev, ...files]);

                        e.target.value = "";
                      }}
                    />
                  </label>

                  <span className="text-xs text-muted-foreground">
                    Optional
                  </span>
                </div>
              </div>

              {errors.length > 0 && (
                <div className="space-y-2">
                  {errors.map((error, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-destructive"
                    >
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  ))}
                </div>
              )}

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between gap-3 p-3 border rounded-lg border-border bg-muted/40"
                    >
                      <div className="flex items-center min-w-0 gap-3">
                        <File
                          size={18}
                          className="shrink-0 text-muted-foreground"
                        />

                        <div className="min-w-0">
                          <p className="text-sm truncate">{file.name}</p>

                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {supportingPdfs.length > 0 && (
                <div className="mt-3 space-y-2">
                  {supportingPdfs.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between gap-3 p-3 border rounded-lg border-border bg-muted/40"
                    >
                      <div className="flex items-center min-w-0 gap-3">
                        <File
                          size={18}
                          className="shrink-0 text-muted-foreground"
                        />

                        <div className="min-w-0">
                          <p className="text-sm truncate">{file.name}</p>

                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setSupportingPdfs((prev) =>
                            prev.filter((_, i) => i !== index),
                          )
                        }
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button onClick={handleSubmit} disabled={uploading}>
                  {uploading ? "Submitting..." : "Submit Task"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-xs uppercase text-muted-foreground">
                Component
              </p>

              <p className="mt-1 text-sm font-medium">{component?.name}</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-xs uppercase text-muted-foreground">Module</p>

              <p className="mt-1 text-sm font-medium">{module?.name}</p>
            </CardContent>
          </Card>

          {task.deadline && (
            <Card className="border-border bg-card">
              <CardContent className="flex items-center gap-3 p-4">
                <Calendar size={18} className="text-muted-foreground" />

                <div>
                  <p className="text-xs uppercase text-muted-foreground">
                    Deadline
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {new Date(task.deadline).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 text-muted-foreground"
                />

                <div>
                  <p className="text-sm font-medium">Submission Rules</p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Type: {submissionRule?.type || "Not specified"}
                  </p>

                  {submissionRule?.maxFiles && (
                    <p className="text-xs leading-5 text-muted-foreground">
                      Maximum files: {submissionRule.maxFiles}
                    </p>
                  )}

                  {submissionRule?.maxFileSizeMB && (
                    <p className="text-xs leading-5 text-muted-foreground">
                      Maximum size: {submissionRule.maxFileSizeMB} MB
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users size={16} className="text-muted-foreground" />
                Tag a Colleague
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-xs leading-5 text-muted-foreground">
                Loop in another employee on this task so you can hand off
                context or information about it.
              </p>

              {(task.tags || []).length > 0 && (
                <div className="space-y-2">
                  {task.tags.map((tag) => (
                    <div
                      key={tag._id}
                      className="p-3 text-sm border rounded-lg border-border bg-muted/40"
                    >
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-muted-foreground" />

                        <span className="font-medium">
                          {tag.employee?.username || "Unknown"}
                        </span>

                        <span className="text-xs text-muted-foreground">
                          tagged by {tag.taggedBy?.username || "someone"}
                        </span>
                      </div>

                      {tag.message && (
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {tag.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Select value={tagEmployeeId} onValueChange={setTagEmployeeId}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>

                <SelectContent>
                  {taggableMembers.length === 0 && (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      No other project members to tag.
                    </div>
                  )}

                  {taggableMembers.map((member) => (
                    <SelectItem
                      key={member.employee._id}
                      value={member.employee._id}
                    >
                      {member.employee.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Optional note for them..."
                value={tagMessage}
                onChange={(e) => setTagMessage(e.target.value)}
                className="bg-background"
              />

              {tagError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle size={16} />
                  {tagError}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleTagEmployee}
                disabled={tagging || !tagEmployeeId}
              >
                {tagging ? "Tagging..." : "Tag Employee"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
