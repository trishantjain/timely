import { getSubmissionHistory, reviewSubmission } from "@/api/submissionAPI";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import api from "@/services/api";
import { useAlertDialog } from "@/components/common/ConfirmDialogContext";

import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  GitCommitHorizontal,
  Mail,
  MessageSquareText,
  Paperclip,
  User,
  XCircle,
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  X,
} from "lucide-react";

// ==========================================
// FORMAT FILE SIZE
// ==========================================

const formatFileSize = (bytes) => {
  if (!bytes) return "0 KB";

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// ==========================================
// STATUS STYLE
// ==========================================
const getStatusStyle = (status) => {
  const styles = {
    UNDER_REVIEW: "border-border bg-secondary text-secondary-foreground",

    APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",

    REJECTED: "border-destructive/40 bg-destructive/10 text-destructive",

    PENDING: "border-border bg-muted text-muted-foreground",
  };

  return styles[status] || styles.PENDING;
};

// ==========================================
// STATUS DOT (used in the version timeline)
// ==========================================
const getStatusDot = (status) => {
  const styles = {
    UNDER_REVIEW: "border-amber-400 bg-amber-400",

    APPROVED: "border-emerald-500 bg-emerald-500",

    REJECTED: "border-destructive bg-destructive",

    PENDING: "border-muted-foreground/40 bg-background",
  };

  return styles[status] || styles.PENDING;
};

const getStatusIcon = (status, size = 16) => {
  if (status === "APPROVED") return <CheckCircle2 size={size} />;
  if (status === "REJECTED") return <XCircle size={size} />;
  return <Clock size={size} />;
};

// ==========================================
// COMPONENT
// ==========================================

export default function ReviewSubmission() {
  const { submissionId } = useParams();

  const navigate = useNavigate();

  const alertDialog = useAlertDialog();

  // ==========================================
  // STATE
  // ==========================================

  const [loading, setLoading] = useState(true);

  const [submission, setSubmission] = useState(null);

  const [reviewComment, setReviewComment] = useState("");

  const [selectedVersion, setSelectedVersion] = useState(null);

  const [previewUrl, setPreviewUrl] = useState(null);

  const [previewFileName, setPreviewFileName] = useState("");

  const [zoom, setZoom] = useState(1);

  const [previewMimeType, setPreviewMimeType] = useState("");

  const [loadError, setLoadError] = useState("");

  // ==========================================
  // LOAD SUBMISSION
  // ==========================================

  const loadSubmission = async () => {
    try {
      setLoadError("");

      const res = await getSubmissionHistory(submissionId);

      setSubmission(res.data);
    } catch (err) {
      console.error(err);

      setLoadError(
        err.response?.data?.message || "Unable to load submission.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmission();
  }, []);

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
    } catch (err) {
      console.error(err);
      alertDialog("Unable to open file.");
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setPreviewFileName("");
    setPreviewMimeType("");
    setZoom(1);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closePreview();
      }
    };

    if (previewUrl) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewUrl]);

  // ==========================================
  // REVIEW
  // ==========================================
  const handleReview = async (status) => {
    try {
      await reviewSubmission(submissionId, {
        reviewStatus: status,

        reviewRemark: reviewComment,
      });

      await alertDialog({
        description: "Review submitted successfully.",
        variant: "success",
      });

      navigate(-1);
    } catch (err) {
      console.error(err);

      alertDialog(err.response?.data?.message || "Review failed.");
    }
  };

  // ==========================================
  // VERSIONS (sorted newest first) — derived, hooks must run
  // unconditionally so this sits above the early returns below.
  // ==========================================

  const sortedVersions = useMemo(() => {
    if (!submission?.history) return [];

    return [...submission.history].sort((a, b) => b.version - a.version);
  }, [submission]);

  const reviewedVersions = useMemo(
    () => sortedVersions.filter((version) => version.reviewRemark),
    [sortedVersions],
  );

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-sm text-muted-foreground">
          Loading submission...
        </div>
      </div>
    );
  }

  // ==========================================
  // NOT FOUND
  // ==========================================

  if (loadError) {
    return (
      <div className="p-8">
        <p className="text-sm text-destructive">{loadError}</p>
      </div>
    );
  }

  if (!submission || !submission.history || submission.history.length === 0) {
    return <div className="p-8">Submission not found.</div>;
  }

  // ==========================================
  // CURRENT VERSION
  // ==========================================

  const latest = submission.latestSubmission;

  const currentSubmission = selectedVersion || latest;

  const reviewed =
    latest.reviewStatus === "APPROVED" || latest.reviewStatus === "REJECTED";

  const isViewingLatest = currentSubmission._id === latest._id;

  return (
    <div className="w-full p-4 mx-auto max-w-[1600px] md:p-6">
      {/* ======================================
                HEADER
            ====================================== */}

      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-5 text-sm">
          <button
            onClick={() => navigate("/admin/projects")}
            className="transition-colors text-muted-foreground hover:text-foreground"
          >
            Projects
          </button>

          <span className="text-muted-foreground">/</span>

          <button
            onClick={() => navigate(-1)}
            className="transition-colors text-muted-foreground hover:text-foreground"
          >
            {submission.project?.name || "Project"}
          </button>

          <span className="text-muted-foreground">/</span>

          <span className="font-medium text-foreground">
            {submission.task?.title || "Review Submission"}
          </span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {submission.task?.title || "Review Submission"}
              </h1>

              <span
                className={`
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    rounded-full
                                    border
                                    px-3
                                    py-1
                                    text-xs
                                    font-medium
                                    ${getStatusStyle(latest.reviewStatus)}
                                `}
              >
                {getStatusIcon(latest.reviewStatus, 13)}
                {latest.reviewStatus?.replaceAll("_", " ")}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
              <span>{submission.project?.name}</span>

              <span>•</span>

              <span>{submission.component?.name}</span>

              <span>•</span>

              <span>{submission.module?.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2 text-sm text-muted-foreground shrink-0">
            <GitCommitHorizontal size={16} />
            {sortedVersions.length}{" "}
            {sortedVersions.length === 1 ? "version" : "versions"} submitted
          </div>
        </div>
      </div>

      {/* ======================================
                MAIN WORKSPACE
                Left: version timeline · Middle: submission · Right: review
            ====================================== */}

      <div
        className="
                    grid
                    grid-cols-1
                    gap-6
                    lg:grid-cols-[260px_minmax(0,1fr)_340px]
                "
      >
        {/* ==================================
                    LEFT — VERSION TIMELINE
                ================================== */}

        <aside className="h-fit lg:sticky lg:top-6">
          <div className="overflow-hidden border rounded-xl bg-background">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Version History</h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Every file the employee has submitted for this task.
              </p>
            </div>

            <ol className="p-3">
              {sortedVersions.map((version, index) => {
                const isSelected = currentSubmission._id === version._id;

                const isLatestVersion = version._id === latest._id;

                const isLastItem = index === sortedVersions.length - 1;

                const previousVersion = sortedVersions[index + 1];

                const fileDelta = previousVersion
                  ? (version.files?.length || 0) -
                    (previousVersion.files?.length || 0)
                  : null;

                return (
                  <li key={version._id} className="relative">
                    {!isLastItem && (
                      <span className="absolute left-[15px] top-9 bottom-0 w-px bg-border" />
                    )}

                    <button
                      onClick={() =>
                        setSelectedVersion(isLatestVersion ? null : version)
                      }
                      className={`
                                                flex
                                                w-full
                                                gap-3
                                                rounded-lg
                                                p-2
                                                text-left
                                                transition-colors
                                                hover:bg-muted/40
                                                ${
                                                  isSelected
                                                    ? "bg-primary/5 ring-1 ring-primary/20"
                                                    : ""
                                                }
                                            `}
                    >
                      <span
                        className={`
                                                    relative
                                                    z-10
                                                    mt-1
                                                    h-3
                                                    w-3
                                                    shrink-0
                                                    rounded-full
                                                    border-2
                                                    ${getStatusDot(
                                                      version.reviewStatus,
                                                    )}
                                                `}
                      />

                      <div className="min-w-0 flex-1 pb-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-sm font-medium">
                            Version {version.version}
                          </span>

                          {isLatestVersion && (
                            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                              Latest
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {new Date(version.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>

                        <span
                          className={`
                                                        mt-2
                                                        inline-flex
                                                        items-center
                                                        rounded-full
                                                        border
                                                        px-2
                                                        py-0.5
                                                        text-[10px]
                                                        font-medium
                                                        ${getStatusStyle(
                                                          version.reviewStatus,
                                                        )}
                                                    `}
                        >
                          {version.reviewStatus?.replaceAll("_", " ")}
                        </span>

                        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                          <Paperclip size={12} />

                          {version.files?.length || 0} file
                          {version.files?.length === 1 ? "" : "s"}

                          {fileDelta ? (
                            <span
                              className={
                                fileDelta > 0
                                  ? "text-emerald-600"
                                  : "text-muted-foreground"
                              }
                            >
                              ({fileDelta > 0 ? "+" : ""}
                              {fileDelta} vs v{previousVersion.version})
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>

            {!isViewingLatest && (
              <div className="p-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setSelectedVersion(null)}
                >
                  Back to latest version
                </Button>
              </div>
            )}
          </div>
        </aside>

        {/* ==================================
                    MIDDLE — SUBMISSION
                ================================== */}

        <div className="space-y-6">
          {/* VERSION META STRIP */}

          <div className="grid grid-cols-1 gap-px overflow-hidden border rounded-xl bg-border sm:grid-cols-2 lg:grid-cols-4">
            {/* Submitted By */}

            <div className="p-4 bg-background">
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                <User size={15} />
                Submitted By
              </div>

              <p className="font-medium">
                {currentSubmission.submittedBy?.username || "-"}
              </p>
            </div>

            {/* Email */}

            <div className="p-4 bg-background">
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                <Mail size={15} />
                Email
              </div>

              <p className="text-sm font-medium truncate ">
                {currentSubmission.submittedBy?.email || "-"}
              </p>
            </div>

            {/* Submitted On */}

            <div className="p-4 bg-background">
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                <Calendar size={15} />
                Submitted On
              </div>

              <p className="text-sm font-medium">
                {new Date(currentSubmission.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Version */}

            <div className="p-4 bg-background">
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                <GitCommitHorizontal size={15} />
                Viewing
              </div>

              <p className="flex items-center gap-2 font-medium">
                Version {currentSubmission.version}
                {isViewingLatest && (
                  <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    Latest
                  </span>
                )}
              </p>
            </div>
          </div>

          {!isViewingLatest && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <Clock size={16} className="shrink-0" />
              You&apos;re viewing an earlier version. Review decisions can
              only be made on the latest submission.
            </div>
          )}

          {/* TEXT SUBMISSION */}

          <section className="overflow-hidden border rounded-xl bg-background">
            <div className="flex items-center justify-between px-5 py-4 border-b ">
              <div>
                <h2 className="font-semibold">Employee Submission</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Text submitted by the employee.
                </p>
              </div>
            </div>

            <div className="p-5">
              {currentSubmission.textSubmission ? (
                <div className="text-sm leading-7 whitespace-pre-wrap ">
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
            <div className="flex items-center justify-between px-5 py-4 border-b ">
              <div>
                <h2 className="font-semibold">Submitted Documents</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {currentSubmission.files?.length || 0} file(s) in version{" "}
                  {currentSubmission.version}.
                </p>
              </div>
            </div>

            <div className="p-4">
              {currentSubmission.files?.length > 0 ? (
                <div className="space-y-3">
                  {currentSubmission.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-4 p-4 border rounded-lg "
                    >
                      <div className="flex items-center min-w-0 gap-3 ">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted shrink-0">
                          <FileText size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="font-medium truncate ">
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
                      </Button>{" "}
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

          {/* REVIEW REMARK FOR THIS VERSION */}

          {currentSubmission?.reviewRemark && (
            <section
              className={`p-5 border rounded-xl ${
                currentSubmission.reviewStatus === "REJECTED"
                  ? "bg-destructive/5"
                  : "bg-emerald-50/60"
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquareText size={16} />
                <h3 className="font-semibold">
                  Review feedback for version {currentSubmission.version}
                </h3>
              </div>

              <p className="mt-3 text-sm leading-6 whitespace-pre-wrap text-muted-foreground">
                {currentSubmission.reviewRemark}
              </p>
            </section>
          )}
        </div>

        {/* ==================================
                    RIGHT — REVIEW DECISION + REVIEW HISTORY
                ================================== */}

        <aside className="space-y-6 h-fit lg:sticky lg:top-6">
          {/* REVIEW DECISION */}

          <div className="overflow-hidden border rounded-xl bg-background">
            <div className="p-5 border-b">
              <h2 className="font-semibold">Review Decision</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Approve or reject the current submission.
              </p>
            </div>

            <div className="p-5">
              {/* STATUS */}

              <div className="mb-5">
                <p className="mb-2 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                  Current Status
                </p>

                <div
                  className={`
                                        inline-flex
                                        items-center
                                        gap-2
                                        rounded-lg
                                        border
                                        px-3
                                        py-2
                                        text-sm
                                        font-medium
                                        ${getStatusStyle(latest.reviewStatus)}
                                    `}
                >
                  {getStatusIcon(latest.reviewStatus, 16)}

                  {latest.reviewStatus?.replaceAll("_", " ")}
                </div>
              </div>

              {/* REVIEW COMMENT */}

              <div>
                <label className="block mb-2 text-sm font-medium ">
                  Review Comment
                </label>

                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="
                                        Add feedback for
                                        the employee...
                                    "
                  disabled={reviewed || !isViewingLatest}
                  className="
                                        min-h-[140px]
                                        resize-none
                                    "
                />
              </div>

              {/* ACTIONS */}
              <div className="grid grid-cols-2 gap-3 pt-5 ">
                <Button
                  disabled={reviewed || !isViewingLatest}
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleReview("REJECTED")}
                >
                  Reject
                </Button>

                <Button
                  disabled={reviewed || !isViewingLatest}
                  onClick={() => handleReview("APPROVED")}
                >
                  Approve
                </Button>
              </div>

              {!isViewingLatest && (
                <p className="mt-4 text-xs leading-5 text-center text-muted-foreground">
                  You are viewing a previous version. Switch back to the
                  current submission to review it.
                </p>
              )}

              {reviewed && isViewingLatest && (
                <p className="mt-4 text-xs leading-5 text-center text-muted-foreground">
                  This submission has already been reviewed.
                </p>
              )}
            </div>
          </div>

          {/* REVIEW HISTORY — every remark left across all versions */}

          <div className="overflow-hidden border rounded-xl bg-background">
            <div className="p-5 border-b">
              <h2 className="flex items-center gap-2 font-semibold">
                <MessageSquareText size={16} />
                Review Points
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Feedback left across every version of this submission.
              </p>
            </div>

            <div className="p-4">
              {reviewedVersions.length === 0 ? (
                <div className="py-6 text-sm text-center text-muted-foreground">
                  No review feedback has been left yet.
                </div>
              ) : (
                <ol className="space-y-4">
                  {reviewedVersions.map((version) => (
                    <li
                      key={version._id}
                      className="pl-3 border-l-2"
                      style={{
                        borderColor:
                          version.reviewStatus === "REJECTED"
                            ? "hsl(var(--destructive))"
                            : version.reviewStatus === "APPROVED"
                              ? "#10b981"
                              : "#f59e0b",
                      }}
                    >
                      <button
                        onClick={() =>
                          setSelectedVersion(
                            version._id === latest._id ? null : version,
                          )
                        }
                        className="text-left"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">
                            Version {version.version}
                          </span>

                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getStatusStyle(
                              version.reviewStatus,
                            )}`}
                          >
                            {version.reviewStatus?.replaceAll("_", " ")}
                          </span>
                        </div>

                        <p className="mt-1.5 text-sm leading-6 text-muted-foreground line-clamp-4">
                          {version.reviewRemark}
                        </p>
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </aside>
      </div>

      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onMouseDown={(e) => {
            // Close only when clicking the outer backdrop
            if (e.target === e.currentTarget) {
              closePreview();
            }
          }}
        >
          <div
            className="flex flex-col w-full max-w-[95vw] h-[92vh] overflow-hidden rounded-xl bg-background shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between gap-4 px-5 py-3 border-b">
              <div className="min-w-0">
                <h2 className="font-semibold truncate">{previewFileName}</h2>

                <p className="text-sm text-muted-foreground">File Preview</p>
              </div>

              <div className="flex items-center gap-2">
                {/* ZOOM OUT */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom((prev) => Math.max(0.25, prev - 0.25))}
                >
                  <ZoomOut size={18} />
                </Button>

                {/* ZOOM IN */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom((prev) => Math.min(3, prev + 0.25))}
                >
                  <ZoomIn size={18} />
                </Button>

                {/* FIT TO SCREEN */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(1)}
                >
                  <Maximize size={18} />
                </Button>

                {/* RESET */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(1)}
                >
                  <RotateCcw size={18} />
                </Button>

                {/* CLOSE */}
                <Button variant="outline" size="icon" onClick={closePreview}>
                  <X size={18} />
                </Button>
              </div>
            </div>

            {/* PREVIEW AREA */}
            <div className="relative flex-1 overflow-auto bg-muted/30">
              {/* IMAGE */}
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
                /* PDF */
                <iframe
                  src={previewUrl}
                  title={previewFileName}
                  className="absolute inset-0 w-full h-full border-0"
                />
              )}
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-between px-5 py-2 text-xs border-t text-muted-foreground">
              <span>
                {previewMimeType?.startsWith("image/")
                  ? `${Math.round(zoom * 100)}%`
                  : "PDF Preview"}
              </span>

              <span>Press ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
