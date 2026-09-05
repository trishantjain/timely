import express from "express";

import { protect, adminOnly } from "../../middleware/authMiddleware.js";
import {
  addTaskUpdate,
  getTaskUpdates,
  addGeneralUpdate,
  getMyGeneralUpdates,
  getAllGeneralUpdates,
} from "../../controllers/update/dailyUpdate.controller.js";

const router = express.Router();

// =========================================
// TASK-RELATED DAILY UPDATES
// =========================================

// Employee posts a progress update on a task they're assigned/tagged to.
router.post("/task/:componentId/:taskId", protect, addTaskUpdate);

// Employee (assigned/tagged) or admin views the update history for a task.
router.get("/task/:componentId/:taskId", protect, getTaskUpdates);

// =========================================
// GENERAL (NON-TASK) DAILY UPDATES
// =========================================

// Employee posts a general, project-independent update.
router.post("/general", protect, addGeneralUpdate);

// Employee views their own general updates.
router.get("/general/mine", protect, getMyGeneralUpdates);

// Admin views all employees' general updates (optionally filtered by
// ?employeeId= and/or ?date=YYYY-MM-DD).
router.get("/general", protect, adminOnly, getAllGeneralUpdates);

export default router;
