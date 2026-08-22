import { body, param } from "express-validator";

const submissionRuleTypes = ["TEXT", "FILE", "DOCUMENT", "PDF", "IMAGE", "ZIP", "EXCEL", "MULTIPLE"];

export const createComponentTemplateRules = [
    body("projectModule")
        .notEmpty().withMessage("projectModule is required")
        .isMongoId().withMessage("Invalid projectModule id"),

    body("name")
        .trim()
        .notEmpty().withMessage("Component name is required")
        .isLength({ min: 2, max: 100 }).withMessage("Component name must be 2-100 characters"),

    body("tasks")
        .isArray({ min: 1 }).withMessage("At least one task is required"),

    body("tasks.*.title")
        .trim()
        .notEmpty().withMessage("Each task requires a title"),

    body("tasks.*.submissionRule.type")
        .optional()
        .isIn(submissionRuleTypes).withMessage("Invalid submission rule type")
];

export const updateComponentTemplateRules = [
    param("id").isMongoId().withMessage("Invalid component template id"),

    body("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage("Component name must be 2-100 characters"),

    body("tasks")
        .optional()
        .isArray({ min: 1 }).withMessage("At least one task is required"),

    body("isActive")
        .optional()
        .isBoolean().withMessage("isActive must be true or false")
];

export const idParamRule = [
    param("id").isMongoId().withMessage("Invalid id")
];
