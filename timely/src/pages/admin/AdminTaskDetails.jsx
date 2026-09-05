import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { getTaskDetails } from "@/api/projectComponentAPI";
import { getSubmissionHistory, reviewSubmission } from "@/api/submissionAPI";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

import DailyUpdatesTimeline from "@/components/task/DailyUpdatesTimeline";

import api from "@/services/api";
import { useAlertDialog } from "@/components/common/ConfirmDialogContext";

import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  User,
  Mail,
  FolderKanban,
  Layers,
  FileText,
  CheckCircle2,
  Clock,
  History,
  ChevronDown,
  ChevronUp,
  XCircle,
  ZoomIn,
  ZoomOut,
  Maximize,
  X,
} from "lucide-react";

const statusStyles = {
  PENDING: "bg-slate-100 text-slate-700 border-slate-200",

  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",

  SUBMITTED: "bg-yellow-50 text-yellow-700 border-yellow-200",

  UNDER_REVIEW: "bg-orange-50 text-orange-700 border-orange-200",

  APPROVED: "bg-green-50 text-green-700 border-green-200",

  REJECTED: "bg-red-50 text-red-700 border-red-200",

  COMPLETED: "bg-green-50 text-green-700 border-green-200",
};

const getReviewStatusStyle = (status) => {
  const styles = {
    UNDER_REVIEW: "border-border bg-secondary text-secondary-foreground",

    APPROVED: "border-border bg-secondary text-secondary-foreground",

    REJECTED: "border-destructive/40 bg-destructive/10 text-destructive",

    PENDING: "border-border bg-muted text-muted-foreground",
  };

  return styles[status] || styles.PENDING;
};

const formatDate = (date) => {
  if (!date) return "No deadline";

  return new Date(date).toLocaleDateString();
};

const formatFileSize = (bytes) => {
  if (!bytes) return "0 KB";

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export default function AdminTaskDetails() {
  // Route may provide either (componentId, taskId) — the classic Task
  // View route — or a submissionId — the classic Review Submission
  // route. Both resolve to this single unified page.
  const { componentId, taskId, submissionId: submissionIdParam } =
    useParams();

  const navigate = useNavigate();

  const alertDialog = useAlertDialog();

  const [loading, setLoading] = useState(true);

  const [taskData, setTaskData] = useState(null);

  const [submission, setSubmission] = useState(null);

  const [error, setError] = useState("");

  // Review panel state
  const [reviewComment, setReviewComment] = useState("");

  const [showHistory, setShowHistory] = useState(false);

  const [selectedVersion, setSelectedVersion] = useState(null);

  // Document viewer state
  const [viewerOpen, setViewerOpen] = useState(false);

  const [previewUrl, setPreviewUrl] = useState(null);

  const [previewFileName, setPreviewFileName] = useState("");

  const [previewMimeType, setPreviewMimeType] = useState("");

  const [zoom, setZoom] = useState(1);

  const loadData = async () => {
    try {
      setLoading(true);

      setError("");

      let compId = componentId;

      let tId = taskId;

      let submissionRes = null;

      // Arrived via /admin/reviews/:submissionId — resolve the
      // component/task ids from the submission first (reuses the
      // existing submission history endpoint, no new API needed).
      if (submissionIdParam) {
        const subRes = await getSubmissionHistory(submissionIdParam);

        submissionRes = subRes.data;

        compId = subRes.data.component.id;
        tId = subRes.data.task.id;
      }

      const taskRes = await getTaskDetails(compId, tId);

      setTaskData(taskRes.data.data);

      const resolvedSubmissionId =
        taskRes.data.data.task.submissionId?._id ||
        taskRes.data.data.task.submissionId ||
        null;

      if (resolvedSubmissionId) {
        // Avoid re-fetching submission history if we already loaded
        // the correct one while resolving the route above.
        if (
          !submissionRes ||
          submissionRes.submission.id !== resolvedSubmissionId
        ) {
          const subRes2 = await getSubmissionHistory(resolvedSubmissionId);

          submissionRes = subRes2.data;
        }

        setSubmission(submissionRes);
      } else {
        setSubmission(null);
      }

      setSelectedVersion(null);
      setReviewComment("");
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Unable to load task details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentId, taskId, submissionIdParam]);

  const openFile = async (file, versionId, fileIndex) => {
    try {
      const response = await api.get(
        `/submissions/versions/${versionId}/files/${fileIndex}/download`,
        {
          responseType: "blob",
        },
      );

      const mimeType =
        file.mimeType || response.headers["content-type"] || "application/pdf";

      const blob = new Blob([response.data], {
        type: file.mimeType || "application/pdf",
      });

      const blobUrl = URL.createObjectURL(blob);

      setPreviewUrl(blobUrl);
      setPreviewFileName(file.originalName);
      setPreviewMimeType(mimeType);
      setZoom(1);
      setViewerOpen(true);
    } catch (err) {
      console.error(err);
      alertDialog("Unable to open file.");
    }
  };

  const closeViewer = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setPreviewFileName("");
    setPreviewMimeType("");
    setZoom(1);
    setViewerOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeViewer();
      }
    };

    if (viewerOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerOpen]);

  const handleReview = async (status) => {
    if (!submission) return;

    try {
      await reviewSubmission(submission.submission.id, {
        reviewStatus: status,

        reviewRemark: reviewComment,
      });

      await alertDialog({
        description: "Review submitted successfully.",
        variant: "success",
      });

      await loadData();
    } catch (err) {
      console.error(err);

      alertDialog(err.response?.data?.message || "Review failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-muted-foreground">Loading task details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-sm transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!taskData) {
    return <div className="p-8">Task not found.</div>;
  }

  const {
    projectId,
    projectName,
    componentId: currentComponentId,
    componentName,
    moduleName,
    task,
  } = taskData;

  const employee = task.assignedEmployee;

  const employeeName = typeof employee === "object" ? employee?.username : null;

  const employeeEmail = typeof employee === "object" ? employee?.email : null;

  const hasSubmission = !!submission;

  const latest = submission?.latestSubmission;

  const currentSubmission = selectedVersion || latest;

  const reviewed =
    latest?.reviewStatus === "APPROVED" || latest?.reviewStatus === "REJECTED";

  const previousVersions = hasSubmission
    ? submission.history.filter((version) => version._id !== latest._id)
    : [];

  // ==========================================
  // SHARED — REVIEW PANEL (used both in the
  // normal page flow and beside the viewer)
  // ==========================================
  const reviewPanel = hasSubmission && (
    <div className="overflow-hidden border rounded-xl bg-background">
      <div className="p-5 border-b">
        <h2 className="font-semibold">Review Decision</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Approve or reject the current submission.
        </p>
      </div>

      <div className="p-5">
        <div className="mb-5">
          <p className="mb-2 text-xs font-medium tracking-wide uppercase text-muted-foreground">
            Current Status
          </p>

          <div
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${getReviewStatusStyle(
              latest.reviewStatus,
            )}`}
          >
            {latest.reviewStatus === "APPROVED" ? (
              <CheckCircle2 size={16} />
            ) : latest.reviewStatus === "REJECTED" ? (
              <XCircle size={16} />
            ) : (
              <Clock size={16} />
            )}

            {latest.reviewStatus?.replaceAll("_", " ")}
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Review Comment
          </label>

          <Textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Add feedback for the employee..."
            disabled={reviewed || currentSubmission._id !== latest._id}
            className="min-h-[160px] resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-5">
          <Button
            disabled={reviewed || currentSubmission._id !== latest._id}
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={() => handleReview("REJECTED")}
          >
            Reject
          </Button>

          <Button
            disabled={reviewed || currentSubmission._id !== latest._id}
            onClick={() => handleReview("APPROVED")}
          >
            Approve
          </Button>
        </div>

        {currentSubmission._id !== latest._id && (
          <p className="mt-4 text-xs leading-5 text-center text-muted-foreground">
            You are viewing a previous version. Switch back to the current
            submission to review it.
          </p>
        )}

        {reviewed && currentSubmission._id === latest._id && (
          <p className="mt-4 text-xs leading-5 text-center text-muted-foreground">
            This submission has already been reviewed.
          </p>
        )}
      </div>
    </div>
  );

  // ==========================================
  // STATE B — FOCUSED DOCUMENT VIEWER LAYOUT
  // ==========================================
  if (viewerOpen) {
    return (
      <div className="w-full max-w-[1600px] p-4 mx-auto md:p-6">
        <div className="flex flex-col items-start justify-between gap-3 pb-4 mb-5 border-b sm:flex-row sm:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <button
                onClick={closeViewer}
                className="flex items-center gap-1 hover:text-foreground"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <span>/</span>

              <span className="truncate max-w-[220px] text-foreground font-medium">
                {task.title}
              </span>

              <Badge
                variant="outline"
                className={statusStyles[task.status] || statusStyles.PENDING}
              >
                {task.status?.replaceAll("_", " ")}
              </Badge>
            </div>

            <p className="mt-1 text-xs truncate text-muted-foreground">
              {previewFileName}
            </p>
          </div>

          <Button variant="outline" className="gap-2 shrink-0" onClick={closeViewer}>
            <X size={16} />
            Close Viewer
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* DOCUMENT VIEWER */}
          <div className="flex flex-col overflow-hidden border rounded-xl bg-muted/30 h-[70vh] lg:h-[calc(100vh-180px)]">
            <div className="flex items-center justify-end gap-2 px-3 py-2 border-b bg-background shrink-0">
              {previewMimeType?.startsWith("image/") && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setZoom((prev) => Math.max(0.25, prev - 0.25))}
                  >
                    <ZoomOut size={16} />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setZoom((prev) => Math.min(3, prev + 0.25))}
                  >
                    <ZoomIn size={16} />
                  </Button>

                  <Button variant="outline" size="icon" onClick={() => setZoom(1)}>
                    <Maximize size={16} />
                  </Button>

                  <span className="ml-1 text-xs text-muted-foreground">
                    {Math.round(zoom * 100)}%
                  </span>
                </>
              )}
            </div>

            <div className="relative flex-1 overflow-auto">
              {previewMimeType?.startsWith("image/") ? (
                <div className="flex items-center justify-center min-w-full min-h-full p-6">
                  <img
                    src={previewUrl}
                    alt={previewFileName}
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: "center center",
                    }}
                    className="object-contain max-w-full max-h-full transition-transform duration-200"
                  />
                </div>
              ) : (
                <iframe
                  src={previewUrl}
                  title={previewFileName}
                  className="absolute inset-0 w-full h-full border-0"
                />
              )}
            </div>
          </div>

          {/* REVIEW PANEL BESIDE VIEWER */}
          <aside className="h-fit lg:sticky lg:top-6">{reviewPanel}</aside>
        </div>
      </div>
    );
  }

  // ==========================================
  // STATE A — NORMAL TASK DETAILS PAGE
  // ==========================================
  return (
    <div className="w-full max-w-6xl p-6 mx-auto lg:p-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-sm transition-colors text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={17} />
        Back
      </button>

      <div className="flex flex-wrap items-center gap-2 mb-5 text-sm text-muted-foreground">
        <button
          onClick={() => navigate(`/admin/project/${projectId}`)}
          className="hover:text-foreground"
        >
          {projectName}
        </button>

        <span>/</span>

        <span>{componentName}</span>

        <span>/</span>

        <span className="text-foreground">{task.title}</span>
      </div>

      <div className="flex flex-col gap-5 pb-6 border-b md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {task.title}
            </h1>

            <Badge
              variant="outline"
              className={statusStyles[task.status] || statusStyles.PENDING}
            >
              {task.status?.replaceAll("_", " ")}
            </Badge>
          </div>

          {task.description && (
            <p className="max-w-3xl mt-3 text-sm leading-6 text-muted-foreground">
              {task.description}
            </p>
          )}
        </div>

                <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center w-10 h-10 border rounded-lg bg-muted">
              <Calendar size={18} />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Deadline</p>

              <p className="font-semibold">{formatDate(task.deadline)}</p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* TASK INFORMATION */}
      {/* <div className="grid gap-4 mt-6 sm:grid-cols-2 lg:grid-cols-3"> */}
        {/* <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center w-10 h-10 border rounded-lg bg-muted">
              <FolderKanban size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Project</p>

              <p className="font-semibold truncate">{projectName}</p>
            </div>
          </CardContent>
        </Card> */}

        {/* <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center w-10 h-10 border rounded-lg bg-muted">
              <Layers size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Work Item</p>

              <p className="font-semibold truncate">{componentName}</p>
            </div>
          </CardContent>
        </Card> */}

        {/* <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center w-10 h-10 border rounded-lg bg-muted">
              <ClipboardList size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Module</p>

              <p className="font-semibold truncate">{moduleName}</p>
            </div>
          </CardContent>
        </Card> */}

        {/* <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center w-10 h-10 border rounded-lg bg-muted">
              <User size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                Assigned Employee
              </p>

              <p className="font-semibold truncate">
                {employeeName || "Not assigned"}
              </p>
            </div>
          </CardContent>
        </Card> */}

        {/* <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center w-10 h-10 border rounded-lg bg-muted">
              <Mail size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Employee Email</p>

              <p className="font-semibold truncate">{employeeEmail || "-"}</p>
            </div>
          </CardContent>
        </Card> */}

      {/* </div> */}

      {/* SUBMISSION REQUIREMENT / STATUS (task-level, shown once) */}
      <div className="grid gap-6 mt-6 lg:grid-cols-2">
        {/* <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <FileText size={18} />

              <h2 className="font-semibold">Submission Requirement</h2>
            </div>

            <div className="mt-4">
              <p className="text-xs text-muted-foreground">Submission Type</p>

              <p className="mt-1 font-medium">
                {task.submissionRule?.type || "Not specified"}
              </p>
            </div>
          </CardContent>
        </Card> */}

        {!hasSubmission && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <Clock size={18} />

                <h2 className="font-semibold">Submission Status</h2>
              </div>

              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  No submission has been made for this task yet.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ============================================================
          SUBMISSION + REVIEW — only rendered when a submission exists
         ============================================================ */}
      {hasSubmission && (
        <div className="">
          <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">Submission</h2>

            {previousVersions.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowHistory(!showHistory)}
                className="gap-2 shrink-0"
              >
                <History size={16} />
                Previous Versions ({previousVersions.length})
                {showHistory ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </Button>
            )}
          </div>

          {/* SUBMISSION META */}
          <div className="grid grid-cols-1 gap-px mb-6 overflow-hidden border rounded-xl bg-border sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 bg-background">
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                <User size={15} />
                Submitted By
              </div>

              <p className="font-medium">
                {currentSubmission.submittedBy?.username || "-"}
              </p>
            </div>

            {/* <div className="p-4 bg-background">
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                <Mail size={15} />
                Email
              </div>

              <p className="text-sm font-medium truncate">
                {currentSubmission.submittedBy?.email || "-"}
              </p>
            </div> */}

            <div className="p-4 bg-background">
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                <Calendar size={15} />
                Submitted On
              </div>

              <p className="text-sm font-medium">
                {new Date(currentSubmission.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="p-4 bg-background">
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                <Clock size={15} />
                Version
              </div>

              <p className="flex items-center gap-2 font-medium">
                Version {currentSubmission.version}
                {currentSubmission._id === latest._id && (
                  <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    Latest
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* PREVIOUS VERSIONS */}
          {showHistory && previousVersions.length > 0 && (
            <div className="p-4 mb-6 border rounded-xl bg-muted/20">
              <div className="mb-4">
                <h3 className="font-semibold">Previous Submissions</h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Select a previous version to view.
                </p>
              </div>

              <div className="space-y-2">
                {previousVersions.map((version) => (
                  <button
                    key={version._id}
                    onClick={() => setSelectedVersion(version)}
                    className={`w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted/50 ${
                      currentSubmission._id === version._id
                        ? "border-primary bg-primary/5"
                        : "bg-background"
                    }`}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">Version {version.version}</p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(version.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-medium ${getReviewStatusStyle(
                          version.reviewStatus,
                        )}`}
                      >
                        {version.reviewStatus?.replaceAll("_", " ")}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {selectedVersion && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4"
                  onClick={() => setSelectedVersion(null)}
                >
                  Show Current Submission
                </Button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              {/* TEXT SUBMISSION */}
              <section className="overflow-hidden border rounded-xl bg-background">
                <div className="px-2 py-1 border-b">
                  <h2 className="font-semibold">Submission Description</h2>

                  {/* <p className="mt-1 text-sm text-muted-foreground">
                    Text submitted by the employee.
                  </p> */}
                </div>

                <div className="p-2">
                  {currentSubmission.textSubmission ? (
                    <div className="text-sm leading-7 whitespace-pre-wrap">
                      {currentSubmission.textSubmission}
                    </div>
                  ) : (
                    <div className="py-6 text-sm text-center text-muted-foreground">
                      No text submission provided.
                    </div>
                  )}
                </div>
              </section>

              {/* FILES */}
              <section className="overflow-hidden border rounded-xl bg-background">
                <div className="px-5 py-4 border-b">
                  <h2 className="font-semibold">Uploaded Files</h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {currentSubmission.files?.length || 0} file(s) submitted.
                  </p>
                </div>

                <div className="p-4">
                  {currentSubmission.files?.length > 0 ? (
                    <div className="space-y-3">
                      {currentSubmission.files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-4 p-4 border rounded-lg"
                        >
                          <div className="flex items-center min-w-0 gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted shrink-0">
                              <FileText size={19} />
                            </div>

                            <div className="min-w-0">
                              <p className="font-medium truncate">
                                {file.originalName}
                              </p>

                              <p className="mt-1 text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              openFile(file, currentSubmission._id, index)
                            }
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-sm text-center text-muted-foreground">
                      No files uploaded.
                    </div>
                  )}
                </div>
              </section>

              {selectedVersion?.reviewRemark && (
                <section className="p-5 border rounded-xl bg-red-50/50">
                  <h3 className="font-semibold">Previous Review Feedback</h3>

                  <p className="mt-3 text-sm leading-6 whitespace-pre-wrap text-muted-foreground">
                    {selectedVersion.reviewRemark}
                  </p>
                </section>
              )}
            </div>

            <aside className="h-fit lg:sticky lg:top-6">{reviewPanel}</aside>
          </div>
        </div>
      )}

      {/* DAILY UPDATES — separate from submission/review workflow */}
      <div className="mt-8">
        <DailyUpdatesTimeline
          componentId={currentComponentId}
          taskId={task._id}
          canPost={false}
        />
      </div>
    </div>
  );
}
