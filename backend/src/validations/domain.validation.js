import { body, param } from "express-validator";

export const createDomainRules = [
    body("name")
        .trim()
        .notEmpty().withMessage("Domain name is required")
        .isLength({ min: 2, max: 60 }).withMessage("Domain name must be 2-60 characters"),

    body("description")
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 500 }).withMessage("Description must be under 500 characters"),

    body("color")
        .optional({ nullable: true })
        .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/).withMessage("Color must be a valid hex code")
];

export const updateDomainRules = [
    param("id").isMongoId().withMessage("Invalid domain id"),

    body("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 60 }).withMessage("Domain name must be 2-60 characters"),

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
