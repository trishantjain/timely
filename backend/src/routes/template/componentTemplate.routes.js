import express from "express";
import { adminOnly, protect } from "../../middleware/authMiddleware.js";
import { createComponentTemplate, getComponentsByModule, getComponentTemplates } from "../../controllers/template/componentTemplate.controller.js";

const router = express.Router();

router.post(
    "/",
    protect,
    adminOnly,
    createComponentTemplate
);

router.get(
    "/",
    protect,
    getComponentTemplates
);

router.get(
    "/module/:moduleId",
    protect,
    getComponentsByModule
);

export default router;