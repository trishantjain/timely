import express from "express";
import { adminOnly, protect } from "../../middleware/authMiddleware.js"
import {
    createProjectModule,
    getProjectModules,
    updateProjectModule,
    deactivateProjectModule
} from "../../controllers/project/projectModule.controller.js";

import {
    createProjectModuleRules,
    updateProjectModuleRules,
    idParamRule
} from "../../validations/projectModule.validation.js";
import validate from "../../middleware/validate.js";

const router = express.Router();

router.post(
    "/",
    protect,
    adminOnly,
    createProjectModuleRules,
    validate,
    createProjectModule
);

router.get(
    "/",
    protect,
    getProjectModules
);

router.patch(
    "/:id",
    protect,
    adminOnly,
    updateProjectModuleRules,
    validate,
    updateProjectModule
);

router.delete(
    "/:id",
    protect,
    adminOnly,
    idParamRule,
    validate,
    deactivateProjectModule
);

export default router;
