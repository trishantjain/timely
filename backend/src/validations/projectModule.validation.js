import { body, param } from "express-validator";

export const createProjectModuleRules = [
    body("name")
        .trim()
        .notEmpty().withMessage("Module name is required")
        .isLength({ min: 2, max: 80 }).withMessage("Module name must be 2-80 characters"),

    body("description")
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 500 }).withMessage("Description must be under 500 characters"),

    body("color")
        .optional({ nullable: true })
        .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/).withMessage("Color must be a valid hex code")
];

export const updateProjectModuleRules = [
    param("id").isMongoId().withMessage("Invalid module id"),

    body("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 80 }).withMessage("Module name must be 2-80 characters"),

    body("description")
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 500 }).withMessage("Description must be under 500 characters"),

    body("color")
        .optional({ nullable: true })
        .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/).withMessage("Color must be a valid hex code"),

    body("isActive")
        .optional()
        .isBoolean().withMessage("isActive must be true or false")
];

export const idParamRule = [
    param("id").isMongoId().withMessage("Invalid id")
];
