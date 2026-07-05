import express from "express";
import { adminOnly, protect } from "../../middleware/authMiddleware.js";
import { addProjectComponent, assignTaskToEmployee, getMyTasks, getProjectComponents, getTaskDetails } from "../../controllers/project/projectComponent.controller.js";
const router = express.Router();

router.post(
    "/",
    protect,
    adminOnly,
    addProjectComponent
);

router.get(
    "/project/:projectId",
    protect,
    getProjectComponents
);

router.patch(
    "/:componentId/tasks/:taskId/assign",
    protect,
    adminOnly,
    assignTaskToEmployee
);

router.get(
    "/my-tasks",
    protect,
    getMyTasks
);

router.get(
    "/:componentId/tasks/:taskId",
    protect,
    getTaskDetails
);


export default router;