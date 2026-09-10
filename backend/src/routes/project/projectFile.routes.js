import express from "express";
import { adminOnly, protect } from "../../middleware/authMiddleware.js";
import upload from "../../middleware/uploadMiddleware.js";
import {
  uploadProjectFile,
  listProjectFiles,
  downloadProjectFile,
  previewProjectFileAsPdf,
  deleteProjectFile,
} from "../../controllers/project/projectFile.controller.js";

const router = express.Router();

// Admin uploads a file for a project; every employee assigned to that
// project (see ProjectMember) can then list/view/download it.
router.post(
  "/:projectId/files",
  protect,
  adminOnly,
  upload.single("file"),
  uploadProjectFile,
);

router.get("/:projectId/files", protect, listProjectFiles);

router.get("/files/:fileId/download", protect, downloadProjectFile);

router.get("/files/:fileId/preview-pdf", protect, previewProjectFileAsPdf);

router.delete("/files/:fileId", protect, adminOnly, deleteProjectFile);

export default router;
