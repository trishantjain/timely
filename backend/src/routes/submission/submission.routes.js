import express from "express"
import { adminOnly, protect } from "../../middleware/authMiddleware.js";
import upload from "../../middleware/uploadMiddleware.js";
import {
    getPendingReviews,
    getSubmissionHistory,
    reviewSubmission,
    submitTask,
    downloadSubmissionFile
} from "../../controllers/submission/submission.controller.js";
import { submitTaskRules, reviewSubmissionRules } from "../../validations/submission.validation.js";
import validate from "../../middleware/validate.js";

const router = express.Router();

// `upload.array("files", 10)` only kicks in for multipart/form-data
// requests — plain JSON text-only submissions (existing frontend
// behavior) pass through untouched, so this is backward compatible.
router.post(
    "/submit",
    protect,
    upload.array("files", 10),
    submitTaskRules,
    validate,
    submitTask
);

router.patch(
    "/:submissionId/review",
    protect,
    adminOnly,
    reviewSubmissionRules,
    validate,
    reviewSubmission
);

router.get(
    "/:submissionId/history",
    protect,
    getSubmissionHistory
);

router.get(
    "/versions/:versionId/files/:fileIndex/download",
    protect,
    downloadSubmissionFile
);

router.get(
    "/pending",
    protect,
    adminOnly,
    getPendingReviews
);

export default router;
