import { body, param } from "express-validator";

export const submitTaskRules = [
    body("projectComponentId")
        .notEmpty().withMessage("projectComponentId is required")
        .isMongoId().withMessage("Invalid projectComponentId"),

    body("taskId")
        .notEmpty().withMessage("taskId is required")
        .isMongoId().withMessage("Invalid taskId"),

    body("textSubmission")
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 20000 }).withMessage("Text submission is too long")
];

export const reviewSubmissionRules = [
    param("submissionId")
        .isMongoId().withMessage("Invalid submissionId"),

    body("reviewStatus")
        .notEmpty().withMessage("reviewStatus is required")
        .isIn(["APPROVED", "REJECTED"]).withMessage("reviewStatus must be APPROVED or REJECTED"),

    body("reviewRemark")
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 2000 }).withMessage("Review remark is too long")
];
