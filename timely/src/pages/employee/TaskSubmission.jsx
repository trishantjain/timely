import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import {
  getTaskDetails,
  tagEmployeeOnTask,
  untagEmployeeFromTask,
  addSubtask,
  toggleSubtaskCompletion,
  deleteSubtask,
  tagEmployeeOnSubtask,
  untagEmployeeFromSubtask,
} from "@/api/projectComponentAPI";
import { submitTask } from "@/api/submissionAPI";
import { useAlertDialog } from "@/components/common/ConfirmDialogContext";
import { getEmployeeDirectory } from "@/api/employeeAPI";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import DailyUpdatesTimeline from "@/components/task/DailyUpdatesTimeline";

import {
  Upload,
  File,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Users,
  Tag,
  Plus,
  Search,
  X,
  ListTodo,
  UserRound,
} from "lucide-react";

// ==========================================
// EMPLOYEE SEARCH PICKER
//
// Small reusable "tag an employee" search box, backed by the
// directory endpoint (GET /employees/directory) rather than a
// project-scoped member list — tagging is deliberately allowed to
// reach any employee, including ones on a completely different
// project, so they can find out something elsewhere is pending on
// them (see getMyTasks on the backend).
// ==========================================
function EmployeeSearchPicker({
  selected,
  onSelect,
  onClear,
  excludeIds = [],
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        setSearching(true);

        const res = await getEmployeeDirectory(query);

        const employees = res.data?.data || [];

        setResults(
          employees.filter((employee) => !excludeIds.includes(employee._id)),
        );
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setSearching(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 300);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, open]);

  if (selected) {
    return (
      <div className="flex items-center justify-between gap-2 p-2 border rounded-lg border-border bg-muted/40">
        <span className="text-sm font-medium">{selected.username}</span>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="w-6 h-6"
          onClick={onClear}
        >
          <X size={14} />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search
          size={14}
          className="absolute -translate-y-1/2 left-2.5 top-1/2 text-muted-foreground"
        />

        <Input
          placeholder="Search employees by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="pl-8 bg-background"
        />
      </div>

      {open && (
        <div className="absolute z-10 w-full mt-1 overflow-y-auto border rounded-lg shadow-md border-border bg-popover max-h-48">
          {searching ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              No employees found.
            </div>
          ) : (
            results.map((employee) => (
              <button
                key={employee._id}
                type="button"
                // onMouseDown (not onClick) so this fires before the
                // input's onBlur closes the dropdown.
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(employee);
                  setQuery("");
                  setOpen(false);
                }}
                className="flex flex-col w-full px-3 py-2 text-left hover:bg-muted"
              >
                <span className="text-sm">{employee.username}</span>
                <span className="text-xs text-muted-foreground">
                  {employee.email}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

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

  const [tagSelectedEmployee, setTagSelectedEmployee] = useState(null);
  const [tagMessage, setTagMessage] = useState("");
  const [tagging, setTagging] = useState(false);
  const [tagError, setTagError] = useState("");
  const [removingTagId, setRemovingTagId] = useState(null);

  // Subtasks (employee's own ad-hoc to-dos under this task)
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [subtaskError, setSubtaskError] = useState("");
  const [busySubtaskId, setBusySubtaskId] = useState(null);

  const alertDialog = useAlertDialog();

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

  const currentUserId = currentUser?._id;

  const isAssignee =
    taskData?.task?.assignedEmployee &&
    taskData.task.assignedEmployee._id === currentUserId;

  const taskTagExcludeIds = useMemo(() => {
    const ids = (taskData?.task?.tags || []).map((t) => t.employee?._id);

    if (currentUserId) ids.push(currentUserId);

    return ids.filter(Boolean);
  }, [taskData, currentUserId]);

  const handleTagEmployee = async () => {
    if (!tagSelectedEmployee) {
      setTagError("Choose an employee to tag.");
      return;
    }

    try {
      setTagging(true);
      setTagError("");

      await tagEmployeeOnTask(componentId, taskId, {
        employeeId: tagSelectedEmployee._id,
        message: tagMessage,
      });

      setTagSelectedEmployee(null);
      setTagMessage("");

      await loadTask();
    } catch (err) {
      console.error(err);

      setTagError(err.response?.data?.message || "Unable to tag employee.");
    } finally {
      setTagging(false);
    }
  };

  const handleRemoveTag = async (tag) => {
    try {
      setRemovingTagId(tag._id);
      setTagError("");

      await untagEmployeeFromTask(componentId, taskId, {
        employeeId: tag.employee?._id,
      });

      await loadTask();
    } catch (err) {
      console.error(err);

      setTagError(
        err.response?.data?.message || "Unable to remove tagged employee.",
      );
    } finally {
      setRemovingTagId(null);
    }
  };

  // ==========================================
  // SUBTASKS
  //
  // An employee can add their own subtasks under a task assigned to
  // them, to track smaller to-dos the admin can see without needing
  // to be told about them separately. They can only delete subtasks
  // they created themselves (backend enforces this too).
  // ==========================================

  const handleAddSubtask = async () => {
    if (!subtaskTitle.trim()) {
      setSubtaskError("Enter a title for the subtask.");
      return;
    }

    try {
      setAddingSubtask(true);
      setSubtaskError("");

      await addSubtask(componentId, taskId, { title: subtaskTitle.trim() });

      setSubtaskTitle("");

      await loadTask();
    } catch (err) {
      console.error(err);

      setSubtaskError(err.response?.data?.message || "Unable to add subtask.");
    } finally {
      setAddingSubtask(false);
    }
  };

  const handleToggleSubtask = async (subtask) => {
    try {
      setBusySubtaskId(subtask._id);

      await toggleSubtaskCompletion(
        componentId,
        taskId,
        subtask._id,
        !subtask.completed,
      );

      await loadTask();
    } catch (err) {
      console.error(err);
    } finally {
      setBusySubtaskId(null);
    }
  };

  const handleDeleteSubtask = async (subtask) => {
    try {
      setBusySubtaskId(subtask._id);

      await deleteSubtask(componentId, taskId, subtask._id);

      await loadTask();
    } catch (err) {
      console.error(err);

      await alertDialog({
        description:
          err.response?.data?.message || "Unable to delete this subtask.",
      });
    } finally {
      setBusySubtaskId(null);
    }
  };

  const handleTagOnSubtask = async (subtask, employee, message) => {
    await tagEmployeeOnSubtask(componentId, taskId, subtask._id, {
      employeeId: employee._id,
      message,
    });

    await loadTask();
  };

  const handleUntagFromSubtask = async (subtask, employeeId) => {
    await untagEmployeeFromSubtask(componentId, taskId, subtask._id, {
      employeeId,
    });

    await loadTask();
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

      await alertDialog({
        description: "Task submitted successfully.",
        variant: "success",
      });

      // Return to wherever the employee opened this task from (their
      // project's task list, the global My Tasks list, or the dashboard)
      // instead of always forcing them back to the unfiltered task list.
      navigate(-1);
    } catch (err) {
      console.error(err);

      setErrors([err.response?.data?.message || "Unable to submit task."]);
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
              <div className="flex flex-wrap items-start justify-between gap-2">
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
                      accept=".pdf,.doc,.docx,.xlsx"
                      className="hidden"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);

                        if (!files.length) return;

                        const allowedExtensions = [
                          ".pdf",
                          ".doc",
                          ".docx",
                          ".xlsx",
                        ];

                        const invalidFiles = files.filter((file) => {
                          const extension = `.${file.name.split(".").pop().toLowerCase()}`;
                          return !allowedExtensions.includes(extension);
                        });

                        if (invalidFiles.length > 0) {
                          setErrors([
                            "Only PDF, DOC, DOCX, and XLSX files are allowed.",
                          ]);
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
                      accept=".pdf,.doc,.docx,.xlsx"
                      className="hidden"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);

                        if (!files.length) return;

                        const allowedExtensions = [
                          ".pdf",
                          ".doc",
                          ".docx",
                          ".xlsx",
                        ];

                        const invalidFiles = files.filter((file) => {
                          const extension = `.${file.name.split(".").pop().toLowerCase()}`;
                          return !allowedExtensions.includes(extension);
                        });

                        if (invalidFiles.length > 0) {
                          setErrors([
                            "Only PDF, DOC, DOCX, and XLSX files are allowed.",
                          ]);
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

          {/* DAILY UPDATES — separate from submission/review workflow */}
          <DailyUpdatesTimeline
            componentId={componentId}
            taskId={taskId}
            canPost
          />

          {/* ================= SUBTASKS ================= */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ListTodo size={16} className="text-muted-foreground" />
                Subtasks
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-xs leading-5 text-muted-foreground">
                {isAssignee
                  ? "Track your own to-dos under this task — your admin can see these too."
                  : "Smaller to-dos under this task."}
              </p>

              {(task.subtasks || []).length === 0 && (
                <p className="text-xs italic text-muted-foreground">
                  No subtasks yet.
                </p>
              )}

              {(task.subtasks || []).map((subtask) => (
                <SubtaskRow
                  key={subtask._id}
                  subtask={subtask}
                  currentUserId={currentUserId}
                  canToggle={isAssignee}
                  canDelete={
                    subtask.createdByRole === "EMPLOYEE" &&
                    subtask.createdBy?._id === currentUserId
                  }
                  busy={busySubtaskId === subtask._id}
                  onToggle={() => handleToggleSubtask(subtask)}
                  onDelete={() => handleDeleteSubtask(subtask)}
                  onTag={(employee, message) =>
                    handleTagOnSubtask(subtask, employee, message)
                  }
                  onUntag={(employeeId) =>
                    handleUntagFromSubtask(subtask, employeeId)
                  }
                />
              ))}

              {isAssignee && (
                <div className="pt-2 space-y-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="New subtask title..."
                      value={subtaskTitle}
                      onChange={(e) => setSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSubtask();
                        }
                      }}
                      className="bg-background"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddSubtask}
                      disabled={addingSubtask || !subtaskTitle.trim()}
                    >
                      <Plus size={14} className="mr-1" />
                      Add
                    </Button>
                  </div>

                  {subtaskError && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle size={16} />
                      {subtaskError}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {/* <Card className="border-border bg-card">
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
          </Card> */}

          {/* {task.deadline && (
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
          )} */}

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
                Loop in any employee on this task — even one on a different
                project — so they know it's pending on them.
              </p>

              {(task.tags || []).length > 0 && (
                <div className="space-y-2">
                  {task.tags.map((tag) => (
                    <div
                      key={tag._id}
                      className="p-3 text-sm border rounded-lg border-border bg-muted/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Tag
                              size={14}
                              className="shrink-0 text-muted-foreground"
                            />

                            <span className="font-medium">
                              {tag.employee?.username || "Unknown"}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Tagged by {tag.taggedBy?.username || "someone"}
                          </p>

                          {tag.message && (
                            <p className="mt-2 text-xs leading-5 text-muted-foreground">
                              {tag.message}
                            </p>
                          )}
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="shrink-0 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveTag(tag)}
                          disabled={removingTagId === tag._id}
                        >
                          {removingTagId === tag._id ? "Removing..." : "Remove"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <EmployeeSearchPicker
                selected={tagSelectedEmployee}
                onSelect={(employee) => {
                  setTagSelectedEmployee(employee);
                  setTagError("");
                }}
                onClear={() => setTagSelectedEmployee(null)}
                excludeIds={taskTagExcludeIds}
              />

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
                disabled={tagging || !tagSelectedEmployee}
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

// ==========================================
// SUBTASK ROW
//
// One subtask under the task, with its own completion toggle, delete
// (only for the employee who created it), and a per-subtask tag
// picker/list so an employee can loop a colleague into just that
// subtask.
// ==========================================
function SubtaskRow({
  subtask,
  currentUserId,
  canToggle,
  canDelete,
  busy,
  onToggle,
  onDelete,
  onTag,
  onUntag,
}) {
  const [tagOpen, setTagOpen] = useState(false);
  const [tagSelectedEmployee, setTagSelectedEmployee] = useState(null);
  const [tagMessage, setTagMessage] = useState("");
  const [tagging, setTagging] = useState(false);
  const [tagError, setTagError] = useState("");
  const [untaggingId, setUntaggingId] = useState(null);

  const tags = subtask.tags || [];

  const excludeIds = useMemo(() => {
    const ids = tags.map((t) => t.employee?._id).filter(Boolean);

    if (currentUserId) ids.push(currentUserId);

    return ids;
  }, [tags, currentUserId]);

  const handleTag = async () => {
    if (!tagSelectedEmployee) {
      setTagError("Choose an employee to tag.");
      return;
    }

    try {
      setTagging(true);
      setTagError("");

      await onTag(tagSelectedEmployee, tagMessage);

      setTagSelectedEmployee(null);
      setTagMessage("");
      setTagOpen(false);
    } catch (err) {
      console.error(err);

      setTagError(err.response?.data?.message || "Unable to tag employee.");
    } finally {
      setTagging(false);
    }
  };

  const handleUntag = async (employeeId) => {
    try {
      setUntaggingId(employeeId);

      await onUntag(employeeId);
    } catch (err) {
      console.error(err);
    } finally {
      setUntaggingId(null);
    }
  };

  return (
    <div className="p-2 border rounded-lg border-border bg-muted/30">
      <div className="flex items-center gap-2.5">
        <Checkbox
          checked={!!subtask.completed}
          disabled={!canToggle || busy}
          onCheckedChange={onToggle}
        />

        <span
          className={`flex-1 text-sm ${
            subtask.completed
              ? "text-muted-foreground line-through"
              : "text-foreground"
          }`}
        >
          {subtask.title}
        </span>

        {subtask.createdByRole === "EMPLOYEE" && (
          <span className="flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
            <UserRound size={10} />
            {subtask.createdBy?.username || "Employee"}
          </span>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="px-2 text-xs h-7"
          onClick={() => setTagOpen((v) => !v)}
        >
          <Tag size={12} className="mr-1" />
          Tag
        </Button>

        {canDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-destructive hover:text-destructive"
            disabled={busy}
            onClick={onDelete}
          >
            <Trash2 size={14} />
          </Button>
        )}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pl-7 mt-2">
          {tags.map((tag) => (
            <span
              key={tag.employee?._id}
              className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-700 dark:text-amber-400"
              title={tag.message || undefined}
            >
              {tag.employee?.username || "Employee"}
              <button
                type="button"
                onClick={() => handleUntag(tag.employee?._id)}
                disabled={untaggingId === tag.employee?._id}
                aria-label={`Remove tag for ${tag.employee?.username}`}
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {tagOpen && (
        <div className="mt-2 space-y-2 pl-7">
          <EmployeeSearchPicker
            selected={tagSelectedEmployee}
            onSelect={(employee) => {
              setTagSelectedEmployee(employee);
              setTagError("");
            }}
            onClear={() => setTagSelectedEmployee(null)}
            excludeIds={excludeIds}
          />

          <Input
            placeholder="Optional note for them..."
            value={tagMessage}
            onChange={(e) => setTagMessage(e.target.value)}
            className="h-8 text-xs bg-background"
          />

          {tagError && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle size={13} />
              {tagError}
            </div>
          )}

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full h-8 text-xs"
            onClick={handleTag}
            disabled={tagging || !tagSelectedEmployee}
          >
            {tagging ? "Tagging..." : "Tag Employee"}
          </Button>
        </div>
      )}
    </div>
  );
}
