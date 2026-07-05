import express from "express"
import { adminOnly, protect } from "../../middleware/authMiddleware.js";
import { getPendingReviews, getSubmissionHistory, reviewSubmission, submitTask } from "../../controllers/submission/submission.controller.js";

const router = express.Router();

router.post(
    "/submit",
    protect,
    submitTask
);

router.patch(
    "/:submissionId/review",
    protect,
    adminOnly,
    reviewSubmission
);

router.get(
    "/:submissionId/history",
    protect,
    getSubmissionHistory
);

router.get(
    "/pending",
    protect,
    adminOnly,
    getPendingReviews
);

export default router;