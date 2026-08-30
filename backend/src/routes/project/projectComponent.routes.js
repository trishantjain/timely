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
  addManualTask,
  updateTaskCompletion,
  // updateProjectDomains,
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

// =========================================
// MANUAL TASKS
// =========================================

// Admin manually creates a task inside a component
router.post("/:componentId/tasks/manual", protect, adminOnly, addManualTask);

// Employee marks assigned task as completed / pending
router.patch(
  "/:componentId/tasks/:taskId/completion",
  protect,
  updateTaskCompletion,
);

// router.patch("/:projectId/domains", protect, adminOnly, updateProjectDomains);

export default router;
