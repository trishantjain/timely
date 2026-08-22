import express from "express";

import {
    createDomain,
    getAllDomains,
    updateDomain,
    deactivateDomain
} from "../controllers/domain.controller.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { createDomainRules, updateDomainRules, idParamRule } from "../validations/domain.validation.js";
import validate from "../middleware/validate.js";

const router = express.Router();

router.post("/", protect, adminOnly, createDomainRules, validate, createDomain);

router.get("/", getAllDomains);

router.patch("/:id", protect, adminOnly, updateDomainRules, validate, updateDomain);

router.delete("/:id", protect, adminOnly, idParamRule, validate, deactivateDomain);

export default router;
