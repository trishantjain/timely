import express from "express";

import { protect, adminOnly } from "../../middleware/authMiddleware.js";
import { assignDocument, getMyProjectDocuments } from "../../controllers/project/projectDocument.controller.js";

const router = express.Router();

router.post(
    "/assign",
    protect,
    adminOnly,
    assignDocument
);

router.get(
    "/project/:projectId",
    protect,
    getMyProjectDocuments
);

export default router;