import mongoose from "mongoose";

import ProjectComponent from "../../models/project/ProjectComponent.js";
import DailyUpdate from "../../models/update/DailyUpdate.js";

// =========================================
// HELPER — can this user read/write updates on this task?
// Mirrors the permission rule already used for tagging: the admin,
// the employee currently assigned to the task, or an employee who
// has been tagged on it.
// =========================================
const canAccessTask = (task, user) => {
  if (user.role === "admin") return true;

  const isAssignee =
    task.assignedEmployee &&
    task.assignedEmployee.toString() === user.id.toString();

  const isTagged = (task.tags || []).some(
    (tag) => tag.employee && tag.employee.toString() === user.id.toString(),
  );

  return isAssignee || isTagged;
};

// =========================================
// ADD TASK-RELATED DAILY UPDATE
// (Employee only — admins view but do not post task updates.)
// =========================================
export const addTaskUpdate = async (req, res) => {
  try {
    const { componentId, taskId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Update content is required.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(componentId) ||
      !mongoose.Types.ObjectId.isValid(taskId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid component or task ID.",
      });
    }

    const component = await ProjectComponent.findById(componentId);

    if (!component) {
      return res.status(404).json({
        success: false,
        message: "Project component not found.",
      });
    }

    const task = component.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    // Only employees post task updates from this endpoint. Admins have
    // read-only visibility into the timeline.
    if (req.user.role !== "employee") {
      return res.status(403).json({
        success: false,
        message: "Only employees can post task updates.",
      });
    }

    if (!canAccessTask(task, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to add updates to this task.",
      });
    }

    const update = await DailyUpdate.create({
      type: "TASK",
      employee: req.user.id,
      project: component.project,
      projectComponent: component._id,
      taskId: task._id,
      content: content.trim(),
    });

    await update.populate("employee", "username email");

    return res.status(201).json({
      success: true,
      message: "Update added.",
      data: update,
    });
  } catch (err) {
    console.error("addTaskUpdate error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================
// GET TASK-RELATED DAILY UPDATES
// Used by both the employee task page and the admin task detail page.
// =========================================
export const getTaskUpdates = async (req, res) => {
  try {
    const { componentId, taskId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(componentId) ||
      !mongoose.Types.ObjectId.isValid(taskId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid component or task ID.",
      });
    }

    const component = await ProjectComponent.findById(componentId);

    if (!component) {
      return res.status(404).json({
        success: false,
        message: "Project component not found.",
      });
    }

    const task = component.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    if (!canAccessTask(task, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view updates for this task.",
      });
    }

    // Date-wise (newest first) so both the employee timeline and the
    // admin review screen read top-down chronologically.
    const updates = await DailyUpdate.find({
      type: "TASK",
      projectComponent: componentId,
      taskId,
    })
      .sort({ createdAt: -1 })
      .populate("employee", "username email");

    return res.status(200).json({
      success: true,
      data: updates,
    });
  } catch (err) {
    console.error("getTaskUpdates error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================
// ADD GENERAL (NON-TASK) DAILY UPDATE
// =========================================
export const addGeneralUpdate = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({
        success: false,
        message: "Only employees can post general updates.",
      });
    }

    const { content, title } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Update content is required.",
      });
    }

    const update = await DailyUpdate.create({
      type: "GENERAL",
      employee: req.user.id,
      title: (title || "").trim(),
      content: content.trim(),
    });

    await update.populate("employee", "username email");

    return res.status(201).json({
      success: true,
      message: "Update added.",
      data: update,
    });
  } catch (err) {
    console.error("addGeneralUpdate error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================
// GET MY GENERAL UPDATES (employee — own updates only)
// =========================================
export const getMyGeneralUpdates = async (req, res) => {
  try {
    const updates = await DailyUpdate.find({
      type: "GENERAL",
      employee: req.user.id,
    })
      .sort({ createdAt: -1 })
      .populate("employee", "username email");

    return res.status(200).json({
      success: true,
      data: updates,
    });
  } catch (err) {
    console.error("getMyGeneralUpdates error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================
// GET ALL GENERAL UPDATES (admin only)
// Optional filters: employeeId, date (YYYY-MM-DD)
// =========================================
export const getAllGeneralUpdates = async (req, res) => {
  try {
    const { employeeId, date } = req.query;

    const filter = { type: "GENERAL" };

    if (employeeId) {
      if (!mongoose.Types.ObjectId.isValid(employeeId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid employee ID.",
        });
      }

      filter.employee = employeeId;
    }

    if (date) {
      const start = new Date(date);

      if (isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date.",
        });
      }

      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      filter.createdAt = { $gte: start, $lte: end };
    }

    const updates = await DailyUpdate.find(filter)
      .sort({ createdAt: -1 })
      .populate("employee", "username email");

    return res.status(200).json({
      success: true,
      data: updates,
    });
  } catch (err) {
    console.error("getAllGeneralUpdates error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
