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
  getAllPendingTasks,
  addManualTask,
  addManualTaskToProject,
  updateTaskCompletion,
  tagEmployeeOnTask,
  // untagEmployeeFromTask,
  tagEmployeeOnSubtask,
  // untagEmployeeFromSubtask,
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

// Workspace-wide "Pending Tasks" — powers the admin dashboard button,
// listing every employee's pending-action tasks across all projects.
router.get("/pending-tasks", protect, adminOnly, getAllPendingTasks);

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
router.patch("/:componentId/tasks/:taskId/tag", protect, tagEmployeeOnTask);

// Remove a tag from a task (admin, the task's assignee, whoever added
// the tag, or the tagged employee removing themselves).
router.delete(
  "/:componentId/tasks/:taskId/tag",
  protect,
  // untagEmployeeFromTask,
);

// =========================================
// SUBTASKS
// =========================================

// Admin adds a project-specific subtask under a task, OR an employee
// adds one of their own under a task assigned to them — see the
// permission check inside addSubtask.
router.post("/:componentId/tasks/:taskId/subtasks", protect, addSubtask);

// Assigned employee (or admin) toggles a subtask's completion
router.patch(
  "/:componentId/tasks/:taskId/subtasks/:subtaskId/completion",
  protect,
  toggleSubtaskCompletion,
);

// Admin deletes any subtask; an employee may delete only a subtask
// they created themselves — see the permission check inside
// deleteSubtask.
router.delete(
  "/:componentId/tasks/:taskId/subtasks/:subtaskId",
  protect,
  deleteSubtask,
);

// Tag another employee on a specific subtask — see permission check
// inside tagEmployeeOnSubtask. Deliberately allows tagging employees
// outside this project (that's the point: it's how someone finds out
// a task elsewhere is waiting on them).
router.patch(
  "/:componentId/tasks/:taskId/subtasks/:subtaskId/tag",
  protect,
  tagEmployeeOnSubtask,
);

// Remove a tag from a subtask — same permission rules as untagging a
// task (see untagEmployeeFromSubtask).
router.delete(
  "/:componentId/tasks/:taskId/subtasks/:subtaskId/tag",
  protect,
  // untagEmployeeFromSubtask,
);

// router.patch("/:projectId/domains", protect, adminOnly, updateProjectDomains);

export default router;
