import express from "express";
import { adminOnly, protect } from "../../middleware/authMiddleware.js";
import {
  addProjectComponent,
  assignTaskToEmployee,
  getMyTasks,
  getProjectComponents,
  getTaskDetails,
  getEmployeeProjectTasks,
  getProjectDomainTasks,
} from "../../controllers/project/projectComponent.controller.js";
const router = express.Router();

router.post("/", protect, adminOnly, addProjectComponent);

router.get("/project/:projectId", protect, getProjectComponents);

router.patch(
  "/:componentId/tasks/:taskId/assign",
  protect,
  adminOnly,
  assignTaskToEmployee,
);

router.get("/my-tasks", protect, getMyTasks);

router.get("/:componentId/tasks/:taskId", protect, getTaskDetails);

router.get(
  "/projects/:projectId/employees/:employeeId/tasks",
  protect,
  adminOnly,
  getEmployeeProjectTasks,
);

router.get(
  "/projects/:projectId/domains/:domainId/tasks",
  protect,
  adminOnly,
  getProjectDomainTasks,
);

export default router;
