import { getSubmissionHistory, reviewSubmission } from "@/api/submissionAPI";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import api from "@/services/api";

import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  History,
  Mail,
  User,
  XCircle,
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  X,
} from "lucide-react";

// ==========================================
// OPEN FILE
// ==========================================
// const openFile = async (file, versionId, fileIndex) => {
//   try {
//     const response = await api.get(
//       `/submissions/versions/${versionId}/files/${fileIndex}/download`,
//       {
//         responseType: "blob",
//       },
//     );

//     const blob = new Blob([response.data], {
//       type: file.mimeType || "application/pdf",
//     });

//     const blobUrl = URL.createObjectURL(blob);

//     window.open(blobUrl, "_blank");
//   } catch (err) {
//     console.error("Unable to open file:", err);

//     alert("Unable to open file.");
//   }
// };

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

    APPROVED: "border-border bg-secondary text-secondary-foreground",

    REJECTED: "border-destructive/40 bg-destructive/10 text-destructive",

    PENDING: "border-border bg-muted text-muted-foreground",
  };

  return styles[status] || styles.PENDING;
};

// ==========================================
// COMPONENT
// ==========================================

export default function ReviewSubmission() {
  const { submissionId } = useParams();

  const navigate = useNavigate();

  // ==========================================
  // STATE
  // ==========================================

  const [loading, setLoading] = useState(true);

  const [submission, setSubmission] = useState(null);

  const [reviewComment, setReviewComment] = useState("");

  const [showHistory, setShowHistory] = useState(false);

  const [selectedVersion, setSelectedVersion] = useState(null);

  const [previewUrl, setPreviewUrl] = useState(null);

  const [previewFileName, setPreviewFileName] = useState("");

  const [zoom, setZoom] = useState(1);

  const [previewMimeType, setPreviewMimeType] = useState("");

  // ==========================================
  // LOAD SUBMISSION
  // ==========================================

  const loadSubmission = async () => {
    try {
      const res = await getSubmissionHistory(submissionId);

      console.log("Submission:", res.data);

      setSubmission(res.data);
    } catch (err) {
      console.error(err);

      alert("Unable to load submission.");
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
      alert("Unable to open file.");
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

      alert("Review submitted successfully.");

      navigate(-1);
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Review failed.");
    }
  };

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

  const previousVersions = submission.history.filter(
    (version) => version._id !== latest._id,
  );

  return (
    <div className="w-full p-4 mx-auto max-w-7xl md:p-6">
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
                                    rounded-full
                                    border
                                    px-3
                                    py-1
                                    text-xs
                                    font-medium
                                    ${getStatusStyle(
                                      currentSubmission.reviewStatus,
                                    )}
                                `}
              >
                {currentSubmission.reviewStatus?.replaceAll("_", " ")}
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
      </div>

      {/* ======================================
                SUBMISSION INFO
            ====================================== */}

      <div className="grid grid-cols-1 gap-px mb-6 overflow-hidden border rounded-xl bg-border sm:grid-cols-2 lg:grid-cols-4">
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

      {/* ======================================
                PREVIOUS VERSIONS
            ====================================== */}

      {showHistory && previousVersions.length > 0 && (
        <div className="p-4 mb-6 border rounded-xl bg-muted/20">
          <div className="flex items-center justify-between mb-4 ">
            <div>
              <h3 className="font-semibold">Previous Submissions</h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Select a previous version to view.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {previousVersions.map((version) => (
              <button
                key={version._id}
                onClick={() => setSelectedVersion(version)}
                className={`
                                            w-full
                                            rounded-lg
                                            border
                                            p-4
                                            text-left
                                            transition-colors
                                            hover:bg-muted/50

                                            ${
                                              currentSubmission._id ===
                                              version._id
                                                ? "border-primary bg-primary/5"
                                                : "bg-background"
                                            }
                                        `}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">Version {version.version}</p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(version.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <span
                    className={`
                                                    inline-flex
                                                    w-fit
                                                    rounded-full
                                                    border
                                                    px-2.5
                                                    py-1
                                                    text-xs
                                                    font-medium
                                                    ${getStatusStyle(
                                                      version.reviewStatus,
                                                    )}
                                                `}
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

      {/* ======================================
                MAIN REVIEW WORKSPACE
            ====================================== */}

      <div
        className="
                    grid
                    grid-cols-1
                    gap-6
                    lg:grid-cols-[minmax(0,1fr)_360px]
                "
      >
        {/* ==================================
                    LEFT — SUBMISSION
                ================================== */}

        <div className="space-y-6">
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
                <h2 className="font-semibold">Uploaded Files</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {currentSubmission.files?.length || 0} file(s) submitted.
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

          {/* PREVIOUS REVIEW REMARK */}

          {selectedVersion?.reviewRemark && (
            <section className="p-5 border rounded-xl bg-red-50/50">
              <h3 className="font-semibold">Previous Review Feedback</h3>

              <p className="mt-3 text-sm leading-6 whitespace-pre-wrap text-muted-foreground">
                {selectedVersion.reviewRemark}
              </p>
            </section>
          )}
        </div>

        {/* ==================================
                    RIGHT — REVIEW PANEL
                ================================== */}

        <aside className=" h-fit lg:sticky lg:top-6">
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
                  disabled={reviewed || currentSubmission._id !== latest._id}
                  className="
                                        min-h-[160px]
                                        resize-none
                                    "
                />
              </div>

              {/* ACTIONS */}
              <div className="grid grid-cols-2 gap-3 pt-5 ">
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
