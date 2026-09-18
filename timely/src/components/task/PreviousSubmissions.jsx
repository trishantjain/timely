import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  CheckCircle2,
  Clock3,
  XCircle,
  ChevronDown,
  Download,
  Eye,
  FileText,
  FileSpreadsheet,
  FileImage,
  File as FileIcon,
  History,
  MessageSquareText,
  Paperclip,
  Quote,
  ShieldAlert,
} from "lucide-react";

// ==========================================
// PREVIOUS SUBMISSIONS
//
// Read-only history of the employee's own earlier submitted versions.
//
// UX principles applied here:
//  - Visual hierarchy: version number is the anchor, status is the
//    second-loudest element, the timestamp is tertiary.
//  - Left alignment: history is scanned, not read. Centred labels
//    force the eye to hunt for a new starting point on every line.
//  - Status colour + icon + text (never colour alone — colour-blind
//    users and greyscale printouts still get the message).
//  - Progressive disclosure: newest version open, older ones
//    collapsed, so a long history doesn't bury the submit form.
//  - One primary action per file row (View); Download is secondary.
//  - Admin feedback is treated as the most important content in a
//    rejected version, not as muted grey footnote text.
// ==========================================

const STATUS_STYLES = {
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2,
    pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "border-emerald-200 bg-emerald-500 text-white",
    rail: "bg-emerald-200",
  },
  REJECTED: {
    label: "Needs changes",
    icon: XCircle,
    pill: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "border-rose-200 bg-rose-500 text-white",
    rail: "bg-rose-200",
  },
  PENDING: {
    label: "Awaiting review",
    icon: Clock3,
    pill: "border-amber-200 bg-amber-50 text-amber-800",
    dot: "border-amber-200 bg-amber-500 text-white",
    rail: "bg-amber-200",
  },
  UNDER_REVIEW: {
    label: "Under review",
    icon: Clock3,
    pill: "border-amber-200 bg-amber-50 text-amber-800",
    dot: "border-amber-200 bg-amber-500 text-white",
    rail: "bg-amber-200",
  },
};

const FALLBACK_STATUS = {
  label: "Submitted",
  icon: Clock3,
  pill: "border-border bg-muted text-muted-foreground",
  dot: "border-border bg-slate-400 text-white",
  rail: "bg-border",
};

const getStatusStyle = (reviewStatus) =>
  STATUS_STYLES[String(reviewStatus || "").toUpperCase()] || FALLBACK_STATUS;

// File-type icon + extension chip, so a row is identifiable at a
// glance without reading the whole filename.
const getFileMeta = (fileName = "") => {
  const extension = fileName.includes(".")
    ? fileName.split(".").pop().toLowerCase()
    : "";

  if (["doc", "docx"].includes(extension))
    return { icon: FileText, tint: "bg-blue-50 text-blue-600", extension };

  if (["xls", "xlsx", "csv"].includes(extension))
    return {
      icon: FileSpreadsheet,
      tint: "bg-emerald-50 text-emerald-600",
      extension,
    };

  if (["png", "jpg", "jpeg", "gif", "webp"].includes(extension))
    return { icon: FileImage, tint: "bg-violet-50 text-violet-600", extension };

  if (extension === "pdf")
    return { icon: FileText, tint: "bg-rose-50 text-rose-600", extension };

  return { icon: FileIcon, tint: "bg-muted text-muted-foreground", extension };
};

// "2 days ago" reads faster than "10/9/2026, 11:56:26 am"; the exact
// timestamp stays available as a tooltip and as a short absolute date,
// so nothing is actually lost.
const formatRelativeTime = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  const months = Math.round(days / 30);
  if (months < 12) return `${months} mo ago`;

  return `${Math.round(months / 12)} yr ago`;
};

const formatAbsoluteDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatFullTimestamp = (value) => {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
};

// ==========================================
// FILE ROW
// ==========================================
function FileRow({
  file,
  rowKey,
  onView,
  onDownload,
  isPreviewing,
  isDownloading,
  tone = "default",
}) {
  const { icon: Icon, tint, extension } = getFileMeta(file.originalName);

  return (
    <div
      className={`group flex flex-col gap-2 rounded-lg border p-2.5 transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-3 ${
        tone === "amber"
          ? "border-amber-200 bg-white hover:border-amber-300"
          : "border-border bg-background hover:border-primary/40 hover:bg-primary/[0.03]"
      }`}
    >
      <div className="flex items-center min-w-0 gap-2.5">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${tint}`}
          aria-hidden="true"
        >
          <Icon size={16} />
        </span>

        <div className="min-w-0">
          <p
            className="text-sm font-medium truncate text-foreground"
            title={file.originalName}
          >
            {file.originalName}
          </p>

          {extension && (
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {extension} document
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-xs"
          disabled={isPreviewing}
          onClick={onView}
          aria-label={`View ${file.originalName}`}
        >
          <Eye size={14} className="mr-1.5" aria-hidden="true" />
          {isPreviewing ? "Opening…" : "View"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 text-muted-foreground hover:text-foreground"
          disabled={isDownloading}
          onClick={onDownload}
          title={`Download ${file.originalName}`}
          aria-label={`Download ${file.originalName}`}
        >
          <Download
            size={15}
            className={isDownloading ? "animate-pulse" : ""}
            aria-hidden="true"
          />
        </Button>
      </div>
    </div>
  );
}

// ==========================================
// ONE VERSION
// ==========================================
function VersionItem({
  version,
  isLast,
  defaultOpen,
  onView,
  onDownload,
  previewingKey,
  downloadingKey,
}) {
  const [open, setOpen] = useState(defaultOpen);

  const status = getStatusStyle(version.reviewStatus);
  const StatusIcon = status.icon;

  const files = version.files || [];
  const adminFiles = version.adminResponse?.files || [];

  const contentId = `submission-version-${version._id}`;

  return (
    <li className="relative pl-10 text-left sm:pl-12">
      {/* Timeline rail + version marker */}
      {!isLast && (
        <span
          className={`absolute left-[15px] top-9 bottom-0 w-px sm:left-[19px] ${status.rail}`}
          aria-hidden="true"
        />
      )}

      <span
        className={`absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold shadow-sm sm:h-10 sm:w-10 sm:text-sm ${status.dot}`}
        aria-hidden="true"
      >
        V{version.version}
      </span>

      <div className="overflow-hidden border rounded-xl border-border bg-card">
        {/* ---------- HEADER (click target) ---------- */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={contentId}
          className="flex w-full items-start justify-between gap-3 p-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 sm:p-3.5"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-semibold text-foreground">
                Version {version.version}
              </h4>

              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${status.pill}`}
              >
                <StatusIcon size={12} aria-hidden="true" />
                {status.label}
              </span>
            </div>

            <p
              className="mt-1 text-xs text-muted-foreground"
              title={formatFullTimestamp(version.createdAt)}
            >
              Submitted {formatRelativeTime(version.createdAt)}
              <span className="mx-1.5 text-border">•</span>
              {formatAbsoluteDate(version.createdAt)}
              {files.length > 0 && (
                <>
                  <span className="mx-1.5 text-border">•</span>
                  {files.length} file{files.length === 1 ? "" : "s"}
                </>
              )}
            </p>
          </div>

          <span className="flex items-center gap-1.5 shrink-0 text-xs text-muted-foreground">
            <span className="hidden sm:inline">{open ? "Hide" : "Details"}</span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </span>
        </button>

        {/* ---------- BODY ---------- */}
        {open && (
          <div
            id={contentId}
            className="px-3 pb-3.5 space-y-3.5 border-t border-border/70 pt-3.5 sm:px-3.5"
          >
            {/* Employee's own note */}
            {version.textSubmission && (
              <section>
                <h5 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Quote size={11} aria-hidden="true" />
                  Your submission note
                </h5>

                <p className="mt-1.5 rounded-lg border-l-2 border-primary/40 bg-muted/50 px-3 py-2 text-sm leading-6 text-foreground">
                  {version.textSubmission}
                </p>
              </section>
            )}

            {/* Files the employee submitted */}
            {files.length > 0 && (
              <section>
                <h5 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Paperclip size={11} aria-hidden="true" />
                  Your submitted documents
                </h5>

                <div className="mt-1.5 space-y-2">
                  {files.map((file) => {
                    const key = `${version._id}-${file.index}`;

                    return (
                      <FileRow
                        key={key}
                        file={file}
                        rowKey={key}
                        onView={() => onView(version, file)}
                        onDownload={() => onDownload(version, file)}
                        isPreviewing={previewingKey === key}
                        isDownloading={downloadingKey === key}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {/* Admin's review comment — the reason a version was
                rejected is the single most useful thing on this card,
                so it gets a real callout instead of grey italics. */}
            {version.reviewRemark && (
              <section
                className={`rounded-lg border p-3 ${
                  String(version.reviewStatus).toUpperCase() === "REJECTED"
                    ? "border-rose-200 bg-rose-50/70"
                    : "border-blue-200 bg-blue-50/70"
                }`}
              >
                <h5
                  className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide ${
                    String(version.reviewStatus).toUpperCase() === "REJECTED"
                      ? "text-rose-800"
                      : "text-blue-800"
                  }`}
                >
                  <MessageSquareText size={12} aria-hidden="true" />
                  Reviewer's comment
                </h5>

                <p
                  className={`mt-1 text-sm font-medium leading-6 ${
                    String(version.reviewStatus).toUpperCase() === "REJECTED"
                      ? "text-rose-900"
                      : "text-blue-900"
                  }`}
                >
                  {version.reviewRemark}
                </p>
              </section>
            )}

            {/* Revision document the admin sent back for this version */}
            {version.adminResponse && (
              <section className="p-3 border rounded-lg border-amber-200 bg-amber-50/70">
                <h5 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-900">
                  <ShieldAlert size={12} aria-hidden="true" />
                  Reviewer sent back a revision document
                </h5>

                {version.adminResponse.textSubmission && (
                  <p className="mt-1 text-sm leading-6 text-amber-900">
                    {version.adminResponse.textSubmission}
                  </p>
                )}

                {adminFiles.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {adminFiles.map((file) => {
                      const key = `${version.adminResponse._id}-${file.index}`;

                      return (
                        <FileRow
                          key={key}
                          file={file}
                          rowKey={key}
                          tone="amber"
                          onView={() => onView(version.adminResponse, file)}
                          onDownload={() =>
                            onDownload(version.adminResponse, file)
                          }
                          isPreviewing={previewingKey === key}
                          isDownloading={downloadingKey === key}
                        />
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

// ==========================================
// SECTION
// ==========================================
export default function PreviousSubmissions({
  versions = [],
  onView,
  onDownload,
  previewingKey,
  downloadingKey,
}) {
  if (!versions.length) return null;

  return (
    <Card className="text-left border-border bg-card">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <History size={16} className="text-muted-foreground" aria-hidden="true" />
          Previous Submissions
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {versions.length}
          </span>
        </CardTitle>

        <p className="text-xs text-muted-foreground">Newest first</p>
      </CardHeader>

      <CardContent>
        <ol className="space-y-3">
          {versions.map((version, index) => (
            <VersionItem
              key={version._id}
              version={version}
              isLast={index === versions.length - 1}
              defaultOpen={index === 0}
              onView={onView}
              onDownload={onDownload}
              previewingKey={previewingKey}
              downloadingKey={downloadingKey}
            />
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
