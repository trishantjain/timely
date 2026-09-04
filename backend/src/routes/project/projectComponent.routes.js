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
  addManualTaskToProject,
  updateTaskCompletion,
  tagEmployeeOnTask,
  updateProjectComponent,
  deleteProjectComponent,
} from "../../controllers/project/projectComponent.controller.js";
const router = express.Router();

router.post("/", protect, adminOnly, addProjectComponent);

router.get("/project/:projectId", protect, getProjectComponents);

// =========================================
// UPDATE PROJECT WORK ITEM
// =========================================
router.patch("/:componentId", protect, adminOnly, updateProjectComponent);

// =========================================
// DELETE PROJECT WORK ITEM
// =========================================
router.delete("/:componentId", protect, adminOnly, deleteProjectComponent);

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

// Admin manually creates a task directly on a project that has no
// work items / tasks yet (auto-creates a "Manual Tasks" container).
router.post("/manual-task", protect, adminOnly, addManualTaskToProject);

// Employee marks assigned task as completed / pending
router.patch(
  "/:componentId/tasks/:taskId/completion",
  protect,
  updateTaskCompletion,
);

// Tag another employee on a task so they can be handed context /
// information about it (admin, the task's assignee, or an already
// tagged employee can tag further employees).
router.patch(
  "/:componentId/tasks/:taskId/tag",
  protect,
  tagEmployeeOnTask,
);

// router.patch("/:projectId/domains", protect, adminOnly, updateProjectDomains);

export default router;
