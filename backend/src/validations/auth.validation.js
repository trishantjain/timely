import { body } from "express-validator";

export const loginRules = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Enter a valid email"),

    body("password")
        .notEmpty().withMessage("Password is required")
];

export const createUserRules = [
    body("username")
        .trim()
        .notEmpty().withMessage("Username is required")
        .isLength({ min: 2, max: 50 }).withMessage("Username must be 2-50 characters"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Enter a valid email"),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .matches(/\d/).withMessage("Password must contain at least one number"),

    body("role")
        .optional()
        .isIn(["admin", "employee"]).withMessage("Role must be admin or employee"),

    body("expertise")
        .optional()
        .isArray().withMessage("Expertise must be an array of domain IDs")
];
