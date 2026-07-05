import express from "express"

// import {
//     createTask,
//     getProjectTasks
// } from "../controllers/taskController.js"

import { adminOnly, protect } from "../../middleware/authMiddleware.js"
import { createAssignments, getMyProjects } from "../../controllers/assignment/assignment.controller.js";

const router = express.Router()

router.post(
    "/",
    protect,
    adminOnly,
    createAssignments
);

router.get(
    "/my-projects",
    protect,
    getMyProjects
);

export default router