import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  listProjectFiles,
  uploadProjectFile,
  deleteProjectFile,
  projectFileDownloadPath,
  projectFilePreviewPdfPath,
} from "@/api/projectFileAPI";

import api from "@/services/api";
import { useAlertDialog, useConfirmDialog } from "@/components/common/ConfirmDialogContext";

import {
  FileText,
  Upload,
  Download,
  Trash2,
  X,
  Loader2,
  Eye,
} from "lucide-react";

const WORD_MIME_TYPES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const isWordDocument = (file) => {
  if (WORD_MIME_TYPES.includes(file?.mimeType)) return true;

  const name = (file?.originalName || "").toLowerCase();

  return name.endsWith(".doc") || name.endsWith(".docx");
};

const formatFileSize = (bytes) => {
  if (!bytes) return "0 KB";

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * Files an admin has shared with everyone assigned to a project.
 * Admins get an upload control and a delete button per file;
 * employees get a read-only list with view/download.
 */
export default function ProjectFilesPanel({ projectId, isAdmin = false }) {
  const alertDialog = useAlertDialog();
  const confirmDialog = useConfirmDialog();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState("");
  const fileInputRef = useRef(null);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewName, setPreviewName] = useState("");
  const [previewMimeType, setPreviewMimeType] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const loadFiles = async () => {
    try {
      setLoading(true);

      const res = await listProjectFiles(projectId);

      setFiles(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];

    e.target.value = "";

    if (!file) return;

    try {
      setUploading(true);

      await uploadProjectFile(projectId, file, note);

      setNote("");

      await loadFiles();
    } catch (err) {
      console.error(err);

      alertDialog(
        err.response?.data?.message || "Unable to upload file.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (file) => {
    const confirmed = await confirmDialog({
      description: `Delete "${file.originalName}"? This can't be undone.`,
      variant: "destructive",
      confirmText: "Delete",
    });

    if (!confirmed) return;

    try {
      await deleteProjectFile(file._id);

      await loadFiles();
    } catch (err) {
      console.error(err);
      alertDialog(err.response?.data?.message || "Unable to delete file.");
    }
  };

  const openPreview = async (file) => {
    try {
      setPreviewLoading(true);
      setPreviewName(file.originalName);

      const endpoint = isWordDocument(file)
        ? projectFilePreviewPdfPath(file._id)
        : projectFileDownloadPath(file._id);

      const response = await api.get(endpoint, { responseType: "blob" });

      const mimeType = isWordDocument(file)
        ? "application/pdf"
        : file.mimeType || response.headers["content-type"] || "application/pdf";

      const blob = new Blob([response.data], { type: mimeType });

      setPreviewUrl(URL.createObjectURL(blob));
      setPreviewMimeType(mimeType);
    } catch (err) {
      console.error(err);
      alertDialog("Unable to preview this file. Try downloading it instead.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setPreviewUrl(null);
    setPreviewName("");
    setPreviewMimeType("");
  };

  const handleDownload = async (file) => {
    try {
      const response = await api.get(projectFileDownloadPath(file._id), {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: file.mimeType || "application/octet-stream",
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

  return (
    <div className="space-y-4">
      {isAdmin && (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <Input
              placeholder="Optional note for this file (e.g. 'Read section 3 first')"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="sm:flex-1"
            />

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelected}
            />

            <Button
              type="button"
              onClick={handleUploadClick}
              disabled={uploading}
              className="gap-2 shrink-0"
            >
              {uploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              {uploading ? "Uploading..." : "Upload File"}
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <Card key={i} className="border-border bg-card">
              <CardContent className="p-4">
                <div className="w-2/3 h-4 rounded bg-muted animate-pulse" />
                <div className="w-1/3 h-3 mt-3 rounded bg-muted animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : files.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <div className="flex items-center justify-center border rounded-full w-11 h-11 bg-muted">
              <FileText size={20} className="text-muted-foreground" />
            </div>

            <p className="font-medium text-foreground">
              No files shared yet
            </p>

            <p className="max-w-sm text-sm text-muted-foreground">
              {isAdmin
                ? "Files you upload here will be visible to everyone assigned to this project."
                : "When your project admin shares a file, it will appear here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <Card key={file._id} className="border-border bg-card">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start min-w-0 gap-3">
                  <div className="flex items-center justify-center border rounded-lg w-9 h-9 shrink-0 bg-muted">
                    <FileText size={16} className="text-muted-foreground" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium truncate text-foreground">
                      {file.originalName}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                      {file.uploadedBy?.name && ` · ${file.uploadedBy.name}`}
                      {file.createdAt &&
                        ` · ${new Date(file.createdAt).toLocaleDateString()}`}
                    </p>

                    {file.note && (
                      <p className="mt-1 text-xs italic text-muted-foreground">
                        “{file.note}”
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => openPreview(file)}
                  >
                    <Eye size={14} />
                    View
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDownload(file)}
                  >
                    <Download size={16} />
                  </Button>

                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(file)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* PREVIEW MODAL */}
      {(previewLoading || previewUrl) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="flex flex-col w-full h-full max-w-4xl overflow-hidden bg-background rounded-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
              <p className="text-sm font-medium truncate">{previewName}</p>

              <Button variant="outline" size="icon" onClick={closePreview}>
                <X size={16} />
              </Button>
            </div>

            <div className="relative flex-1 overflow-auto bg-muted/30">
              {previewLoading ? (
                <div className="flex items-center justify-center w-full h-full">
                  <Loader2 size={24} className="animate-spin text-muted-foreground" />
                </div>
              ) : previewMimeType?.startsWith("image/") ? (
                <div className="flex items-center justify-center min-w-full min-h-full p-6">
                  <img
                    src={previewUrl}
                    alt={previewName}
                    className="object-contain max-w-full max-h-full"
                  />
                </div>
              ) : (
                <iframe
                  src={previewUrl}
                  title={previewName}
                  className="absolute inset-0 w-full h-full border-0"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
