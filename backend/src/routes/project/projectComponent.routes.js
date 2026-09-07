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
  getProjectPendingTasks,
  addManualTask,
  addManualTaskToProject,
  updateTaskCompletion,
  tagEmployeeOnTask,
  updateProjectComponent,
  deleteProjectComponent,
  addSubtask,
  toggleSubtaskCompletion,
  deleteSubtask,
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

// Project-scoped "Pending Tasks" — admins see every employee's
// pending-action tasks in the project, employees see only their own
// (enforced in the controller, not just filtered on the frontend).
router.get(
  "/projects/:projectId/pending-tasks",
  protect,
  getProjectPendingTasks,
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

// =========================================
// SUBTASKS
// =========================================

// Admin adds a project-specific subtask under a task
router.post(
  "/:componentId/tasks/:taskId/subtasks",
  protect,
  adminOnly,
  addSubtask,
);

// Assigned employee (or admin) toggles a subtask's completion
router.patch(
  "/:componentId/tasks/:taskId/subtasks/:subtaskId/completion",
  protect,
  toggleSubtaskCompletion,
);

// Admin deletes a project-specific subtask
router.delete(
  "/:componentId/tasks/:taskId/subtasks/:subtaskId",
  protect,
  adminOnly,
  deleteSubtask,
);

// router.patch("/:projectId/domains", protect, adminOnly, updateProjectDomains);

export default router;
