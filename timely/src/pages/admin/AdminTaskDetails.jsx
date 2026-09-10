import { useEffect, useRef, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { renderAsync as renderDocxAsync } from "docx-preview";

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
  Mail,
  FolderKanban,
  Layers,
  FileText,
  CheckCircle2,
  Clock,
  History,
  XCircle,
  ZoomIn,
  ZoomOut,
  Maximize,
  X,
  Download,
} from "lucide-react";

// ==========================================
// WORD DOCUMENT DETECTION
//
// Browsers have no built-in renderer for Word files (unlike PDFs
// and images, which <iframe>/<img> can show natively). Pointing an
// iframe straight at a docx blob just makes the browser fall back
// to downloading it — that's the bug being fixed here.
//
// Embedding a third-party viewer (Microsoft/Google) was tried first,
// but those services fetch the file from THEIR servers, which can't
// reach files that aren't reachable from the public internet (e.g.
// local/dev environments, or storage that blocks external crawlers).
//
// So instead the file is rendered entirely client-side with
// docx-preview, which reproduces actual Word layout — fonts, page
// size/margins, headers/footers, tables — rather than the plain
// semantic HTML a basic docx-to-HTML converter produces. It's given
// the bytes already fetched through the existing authenticated
// download endpoint (same one PDFs/images use) and draws into the
// SAME iframe already used below, keeping full style isolation from
// the rest of the app.
// ==========================================
const WORD_MIME_TYPES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const isWordDocument = (file) => {
  if (WORD_MIME_TYPES.includes(file?.mimeType)) return true;

  const name = (file?.originalName || "").toLowerCase();

  return name.endsWith(".doc") || name.endsWith(".docx");
};

const DOCX_RENDER_OPTIONS = {
  inWrapper: true,
  ignoreWidth: false,
  ignoreHeight: false,
  breakPages: true,
  // Keeps embedded images inline as data URLs instead of blob: URLs,
  // so there's nothing extra to track/revoke when the viewer closes.
  useBase64URL: true,
};


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
  const { componentId, taskId, submissionId: submissionIdParam } = useParams();

  const navigate = useNavigate();

  const alertDialog = useAlertDialog();

  const [loading, setLoading] = useState(true);

  const [taskData, setTaskData] = useState(null);

  const [submission, setSubmission] = useState(null);

  const [error, setError] = useState("");

  // Review panel state
  const [reviewComment, setReviewComment] = useState("");

  // Left sidebar: switches between the version history list and the
  // daily updates timeline, and which version is selected within it.
  const [sidebarTab, setSidebarTab] = useState("submissions");

  const [selectedVersion, setSelectedVersion] = useState(null);

  // Document viewer state
  const [viewerOpen, setViewerOpen] = useState(false);

  const [previewUrl, setPreviewUrl] = useState(null);

  const [previewFileName, setPreviewFileName] = useState("");

  const [previewMimeType, setPreviewMimeType] = useState("");

  const [zoom, setZoom] = useState(1);

  // Tracks whether previewUrl is a local blob: URL (needs to be
  // revoked on close) or something else, so we never call
  // revokeObjectURL on a URL we don't own.
  const [isBlobPreview, setIsBlobPreview] = useState(false);

  // True while previewing a Word file: renders via docx-preview
  // (see docxIframeRef below) instead of setting previewUrl.
  const [isDocxPreview, setIsDocxPreview] = useState(false);

  // Holds the fetched docx bytes between openFile() and the iframe's
  // onLoad handler, which is where the actual docx-preview render
  // call happens (it needs the iframe's own document to draw into).
  const docxBlobRef = useRef(null);

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
      // Fetch the bytes through the existing authenticated download
      // route — the same one already used for PDFs/images, so this
      // works with whatever storage/auth setup is already in place.
      const response = await api.get(
        `/submissions/versions/${versionId}/files/${fileIndex}/download`,
        {
          responseType: "blob",
        },
      );

      const mimeType =
        file.mimeType || response.headers["content-type"] || "application/pdf";

      // Word documents: the browser can't render these natively, so
      // draw them into the docx-preview iframe below instead. The
      // actual render call happens in that iframe's onLoad handler
      // (it needs the iframe's own document to draw into) — here we
      // just stash the bytes and flip the viewer into "docx mode".
      if (isWordDocument(file)) {
        docxBlobRef.current = response.data;

        setIsBlobPreview(false);
        setPreviewUrl(null);
        setIsDocxPreview(true);
        setPreviewFileName(file.originalName);
        setPreviewMimeType(mimeType);
        setZoom(1);
        setViewerOpen(true);
        return;
      }

      // PDFs and images: render straight from a local blob URL,
      // which browsers display inline just fine.
      const blob = new Blob([response.data], {
        type: file.mimeType || "application/pdf",
      });

      const blobUrl = URL.createObjectURL(blob);

      setIsBlobPreview(true);
      setIsDocxPreview(false);
      docxBlobRef.current = null;
      setPreviewUrl(blobUrl);
      setPreviewFileName(file.originalName);
      setPreviewMimeType(mimeType);
      setZoom(1);
      setViewerOpen(true);
    } catch (err) {
      console.error(err);
      alertDialog(
        isWordDocument(file)
          ? "Unable to preview this document. Try downloading it instead."
          : "Unable to open file.",
      );
    }
  };

  // Called once the docx-preview iframe has a live document to draw
  // into. Renders the bytes stashed by openFile() above, reproducing
  // real Word layout (fonts, page size, headers/footers, tables)
  // rather than plain HTML.
  const renderDocxPreview = async (iframeEl) => {
    const doc = iframeEl?.contentDocument;

    if (!doc || !docxBlobRef.current) return;

    try {
      await renderDocxAsync(
        docxBlobRef.current,
        doc.body,
        doc.head,
        DOCX_RENDER_OPTIONS,
      );
    } catch (err) {
      console.error(err);
      alertDialog("Unable to preview this document. Try downloading it instead.");
    }
  };

  // Explicit "Download" action — separate from "View" above, so
  // reviewers can still save a local copy of any file (docx included)
  // even though "View" now previews it inline instead of downloading.
  const downloadFile = async (file, versionId, fileIndex) => {
    try {
      const response = await api.get(
        `/submissions/versions/${versionId}/files/${fileIndex}/download`,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type:
          file.mimeType ||
          response.headers["content-type"] ||
          "application/octet-stream",
      });

      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = file.originalName || "download";
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      alertDialog("Unable to download file.");
    }
  };

  const closeViewer = () => {
    if (previewUrl && isBlobPreview) {
      URL.revokeObjectURL(previewUrl);
    }

    docxBlobRef.current = null;

    setPreviewUrl(null);
    setIsDocxPreview(false);
    setPreviewFileName("");
    setPreviewMimeType("");
    setIsBlobPreview(false);
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
      <div className="p-4 border-b bg-slate-200">
        <h2 className="font-semibold">Review Decision</h2>

        {/* <p className="mt-1 text-sm text-muted-foreground">
          Approve or reject the current submission.
        </p> */}
      </div>

      <div className="p-5">
        <div className="flex items-center gap-20 mb-5">
          <p className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
            Current Status
          </p>

          <div
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${getReviewStatusStyle(latest.reviewStatus)}`}
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

          <Button
            variant="outline"
            className="gap-2 shrink-0"
            onClick={closeViewer}
          >
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
                    onClick={() =>
                      setZoom((prev) => Math.max(0.25, prev - 0.25))
                    }
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

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setZoom(1)}
                  >
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
              ) : isDocxPreview ? (
                <iframe
                  key={previewFileName}
                  title={previewFileName}
                  className="absolute inset-0 w-full h-full bg-white border-0"
                  onLoad={(e) => renderDocxPreview(e.currentTarget)}
                />
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
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* ================================================
              LEFT SIDEBAR — jump between previous submissions
              and daily updates. Always visible, so it's never
              ambiguous which version is on screen.
             ================================================ */}
          <aside className="w-full shrink-0 lg:w-64">
            <div className="space-y-3 lg:sticky lg:top-6">
              <div className="grid grid-cols-2 gap-1 p-1 border rounded-lg bg-muted/40">
                <button
                  onClick={() => setSidebarTab("submissions")}
                  className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                    sidebarTab === "submissions"
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <History size={14} />
                  Submissions
                </button>

                <button
                  onClick={() => setSidebarTab("updates")}
                  className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                    sidebarTab === "updates"
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Calendar size={14} />
                  Daily Updates
                </button>
              </div>

              {sidebarTab === "submissions" ? (
                <div className="overflow-hidden border rounded-xl bg-background">
                  <div className="px-4 py-3 border-b bg-muted/20">
                    <p className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                      Version History
                    </p>
                  </div>

                  <div className="divide-y max-h-[520px] overflow-y-auto">
                    {[latest, ...previousVersions].map((version) => {
                      const isLatest = version._id === latest._id;
                      const isViewing = currentSubmission._id === version._id;

                      return (
                        <button
                          key={version._id}
                          onClick={() =>
                            setSelectedVersion(isLatest ? null : version)
                          }
                          className={`block w-full border-l-4 px-4 py-3 text-left transition-colors hover:bg-muted/40 ${
                            isViewing
                              ? "border-primary bg-primary/5"
                              : "border-transparent"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="flex items-center gap-1.5 text-sm font-medium">
                              Version {version.version}
                              {isLatest && (
                                <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">
                                  Latest
                                </span>
                              )}
                            </p>

                            {isViewing && (
                              <CheckCircle2
                                size={15}
                                className="text-primary shrink-0"
                              />
                            )}
                          </div>

                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {new Date(version.createdAt).toLocaleString()}
                          </p>

                          <span
                            className={`mt-2 inline-flex w-fit rounded-full border px-2 py-0.5 text-[10px] font-medium ${getReviewStatusStyle(
                              version.reviewStatus,
                            )}`}
                          >
                            {version.reviewStatus?.replaceAll("_", " ")}
                          </span>

                          {isViewing && (
                            <p className="mt-2 text-[10px] font-medium text-primary">
                              Currently viewing
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden border rounded-xl bg-background">
                  <DailyUpdatesTimeline
                    componentId={currentComponentId}
                    taskId={task._id}
                    canPost={false}
                  />
                </div>
              )}
            </div>
          </aside>

          {/* ================================================
              MAIN CONTENT — the version selected in the sidebar
             ================================================ */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold">Submission</h2>
            </div>

            {currentSubmission._id !== latest._id && (
              <div className="flex flex-col items-start justify-between gap-3 p-4 mb-6 border rounded-xl border-amber-300 bg-amber-50 sm:flex-row sm:items-center">
                <p className="text-sm text-amber-900">
                  You&apos;re viewing{" "}
                  <span className="font-semibold">
                    Version {currentSubmission.version}
                  </span>{" "}
                  — an older submission, not the current one.
                </p>

                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white border-amber-300 text-amber-900 hover:bg-amber-100 shrink-0"
                  onClick={() => setSelectedVersion(null)}
                >
                  Jump to Latest
                </Button>
              </div>
            )}

            {/* SUBMITTED CONTENT — one block: document(s) first, the
                employee's description below it. Who submitted it and
                when is already on the sidebar row, so it isn't
                repeated here. */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-6">
                <section className="overflow-hidden border rounded-xl bg-background">
                  <div className="flex items-center justify-between px-5 py-4 border-b bg-slate-200">
                    <h2 className="font-semibold ">Submitted Document</h2>

                    <p className="text-xs text-muted-foreground">
                      By {currentSubmission.submittedBy?.username || "-"} ·{" "}
                      {new Date(currentSubmission.createdAt).toLocaleString()}
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

                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  openFile(file, currentSubmission._id, index)
                                }
                              >
                                View
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                title="Download"
                                aria-label={`Download ${file.originalName}`}
                                onClick={() =>
                                  downloadFile(
                                    file,
                                    currentSubmission._id,
                                    index,
                                  )
                                }
                              >
                                <Download size={16} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-sm text-center text-muted-foreground">
                        No files uploaded.
                      </div>
                    )}

                    <div className="pt-4 mt-4 border-t">
                      {currentSubmission.textSubmission ? (
                        <p className="text-sm leading-7 whitespace-pre-wrap">
                          {currentSubmission.textSubmission}
                        </p>
                      ) : (
                        <p className="text-sm text-center text-muted-foreground">
                          No description provided.
                        </p>
                      )}
                    </div>
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
        </div>
      )}
    </div>
  );
}
