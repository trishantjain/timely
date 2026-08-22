import express from "express";
import { adminOnly, protect } from "../../middleware/authMiddleware.js";
import {
    createComponentTemplate,
    getComponentsByModule,
    getComponentTemplates,
    updateComponentTemplate,
    deactivateComponentTemplate
} from "../../controllers/template/componentTemplate.controller.js";

import {
    createComponentTemplateRules,
    updateComponentTemplateRules,
    idParamRule
} from "../../validations/componentTemplate.validation.js";
import validate from "../../middleware/validate.js";

const router = express.Router();

router.post(
    "/",
    protect,
    adminOnly,
    createComponentTemplateRules,
    validate,
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

router.patch(
    "/:id",
    protect,
    adminOnly,
    updateComponentTemplateRules,
    validate,
    updateComponentTemplate
);

router.delete(
    "/:id",
    protect,
    adminOnly,
    idParamRule,
    validate,
    deactivateComponentTemplate
);

export default router;
