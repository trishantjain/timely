import express from "express";

import {
    getEmployees,
    getMyProjectDetails,
    getMyProjects
} from "../../controllers/employee/employee.controller.js";

import {
    protect,
    adminOnly
} from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/",
    protect,
    adminOnly,
    getEmployees
);

router.get(
    "/projects",
    protect,
    getMyProjects
);

router.get(
    "/projects/:projectId",
    protect,
    getMyProjectDetails
);

export default router;