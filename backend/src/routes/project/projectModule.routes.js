import express from "express";
import { adminOnly, protect } from "../../middleware/authMiddleware.js"
import { createProjectModule, getProjectModules } from "../../controllers/project/projectModule.controller.js";

const router = express.Router();

router.post(
    "/",
    protect,
    adminOnly,
    createProjectModule
);

router.get(
    "/",
    protect,
    getProjectModules
);

export default router;