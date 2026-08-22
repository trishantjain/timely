import { body } from "express-validator";

// This file existed but was empty — filling in the validation rules the
// route was already implicitly relying on (createProject manually checked
// name/domains inline; this makes it declarative and reusable).

export const createProjectRules = [
    body("name")
        .trim()
        .notEmpty().withMessage("Project name is required")
        .isLength({ min: 2, max: 120 }).withMessage("Project name must be 2-120 characters"),

    body("description")
        .optional({ nullable: true })
        .isString().withMessage("Description must be text")
        .isLength({ max: 2000 }).withMessage("Description must be under 2000 characters"),

    body("domains")
        .isArray({ min: 1 }).withMessage("Select at least one domain"),

    body("domains.*")
        .isMongoId().withMessage("Invalid domain id")
];

export const addMemberRules = [
    body("user_id")
        .notEmpty().withMessage("user_id is required")
        .isMongoId().withMessage("Invalid user id"),

    body("role")
        .optional()
        .isIn(["admin", "employee"]).withMessage("Role must be admin or employee")
];
