import asyncHandler from "../../utils/asyncHandler.js";
import ProjectFile from "../../models/project/ProjectFile.js";
import ProjectMember from "../../models/project/ProjectMember.js";
import {
  uploadFileToCloudinary,
  deleteFileFromCloudinary,
} from "../../utils/cloudinaryUpload.js";
import { convertToPdf } from "../../utils/docxToPdf.js";

const OFFICE_PREVIEW_EXTENSIONS = [".doc", ".docx", ".ppt", ".pptx"];

// Small in-memory cache, same approach as submission previews — avoids
// re-running the (slow) LibreOffice conversion on every view of the
// same file during a session.
const pdfPreviewCache = new Map();
const PDF_PREVIEW_CACHE_LIMIT = 50;

const cachePdfPreview = (key, buffer) => {
  if (pdfPreviewCache.size >= PDF_PREVIEW_CACHE_LIMIT) {
    const oldestKey = pdfPreviewCache.keys().next().value;
    pdfPreviewCache.delete(oldestKey);
  }

  pdfPreviewCache.set(key, buffer);
};

// A user can see a project's files if they're an assigned member of
// that project, or an admin.
const assertProjectAccess = async (req, projectId) => {
  if (req.user.role === "admin") return true;

  const isMember = await ProjectMember.exists({
    project: projectId,
    employee: req.user.id,
  });

  return Boolean(isMember);
};

// ==========================================
// ADMIN: UPLOAD A FILE TO A PROJECT
// ==========================================
export const uploadProjectFile = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { note } = req.body;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file was uploaded.",
    });
  }

  const result = await uploadFileToCloudinary(req.file, {
    folder: "timely/project-files",
  });

  const projectFile = await ProjectFile.create({
    project: projectId,
    uploadedBy: req.user.id,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    secureUrl: result.secure_url,
    publicId: result.public_id,
    note: note || "",
  });

  return res.status(201).json({
    success: true,
    data: projectFile,
  });
});

// ==========================================
// LIST FILES FOR A PROJECT (admin or assigned employees)
// ==========================================
export const listProjectFiles = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const hasAccess = await assertProjectAccess(req, projectId);

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: "You do not have access to this project's files.",
    });
  }

  const files = await ProjectFile.find({ project: projectId })
    .sort({ createdAt: -1 })
    .populate("uploadedBy", "name email");

  return res.json({
    success: true,
    data: files,
  });
});

// ==========================================
// DOWNLOAD A PROJECT FILE
// ==========================================
export const downloadProjectFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;

  const file = await ProjectFile.findById(fileId);

  if (!file) {
    return res.status(404).json({
      success: false,
      message: "File not found.",
    });
  }

  const hasAccess = await assertProjectAccess(req, file.project);

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: "You do not have access to this file.",
    });
  }

  // Cloudinary stores uploads under a generated public_id, so its own
  // URL never carries the original filename — inject fl_attachment so
  // Cloudinary serves it with the right Content-Disposition filename
  // on any download path (custom button, native browser download, etc).
  // NEW:
  const rawName = file.originalName || "download";
  const safeName = rawName.replace(/["\r\n,/:]/g, "_");
  const encodedName = encodeURIComponent(safeName).replace(/\./g, "%2E");

  const attachmentUrl = file.secureUrl.replace(
    "/upload/",
    `/upload/fl_attachment:${encodedName}/`,
  );

  return res.redirect(attachmentUrl);
});

// ==========================================
// PREVIEW A PROJECT FILE AS PDF (Word/PowerPoint)
// ==========================================
export const previewProjectFileAsPdf = asyncHandler(async (req, res) => {
  const { fileId } = req.params;

  const file = await ProjectFile.findById(fileId);

  if (!file) {
    return res.status(404).json({
      success: false,
      message: "File not found.",
    });
  }

  const hasAccess = await assertProjectAccess(req, file.project);

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: "You do not have access to this file.",
    });
  }

  const extension =
    "." + (file.originalName || "").split(".").pop().toLowerCase();

  if (!OFFICE_PREVIEW_EXTENSIONS.includes(extension)) {
    return res.status(400).json({
      success: false,
      message: "This file type doesn't need PDF conversion.",
    });
  }

  const cacheKey = String(file._id);
  let pdfBuffer = pdfPreviewCache.get(cacheKey);

  if (!pdfBuffer) {
    const sourceResponse = await fetch(file.secureUrl);

    if (!sourceResponse.ok) {
      throw new Error(
        `Failed to fetch source file from storage (status ${sourceResponse.status}).`,
      );
    }

    const sourceBuffer = Buffer.from(await sourceResponse.arrayBuffer());

    pdfBuffer = await convertToPdf(sourceBuffer, extension);

    cachePdfPreview(cacheKey, pdfBuffer);
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline");

  return res.send(pdfBuffer);
});

// ==========================================
// ADMIN: DELETE A PROJECT FILE
// ==========================================
export const deleteProjectFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;

  const file = await ProjectFile.findById(fileId);

  if (!file) {
    return res.status(404).json({
      success: false,
      message: "File not found.",
    });
  }

  await deleteFileFromCloudinary(
    file.publicId,
    file.mimeType?.startsWith("image/") ? "image" : "raw",
  );

  await file.deleteOne();

  return res.json({
    success: true,
    message: "File deleted.",
  });
});
