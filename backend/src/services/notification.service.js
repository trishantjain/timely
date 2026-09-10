import ProjectComponent from "../models/project/ProjectComponent.js";
import User from "../models/auth/User.js";
import NotificationLog from "../models/NotificationLog.js";
import { sendEmail } from "./email.service.js";
import { buildNewTaskEmail } from "../../templates/newTaskEmail.js";
import { APP_URL } from "../config/email.js";
import logger from "../utils/logger.js";

// =========================================
// NEW TASK ASSIGNED NOTIFICATION
//
// Deliberately re-reads the component/task from the DB by id rather
// than accepting whatever object the caller already has in memory --
// callers (assignTaskToEmployee, addManualTask, addManualTaskToProject,
// updateProjectComponent) all have different amounts of context
// available, so this stays self-sufficient and always reflects what
// was actually persisted. This is fire-and-forget from the caller's
// side, so the extra read doesn't add latency to the API response.
// =========================================
const sendNewTaskEmailIfNeeded = async ({ componentId, taskId }) => {
  const component = await ProjectComponent.findById(componentId)
    .populate("project", "name")
    .lean();

  if (!component || !component.project) return;

  const task = (component.tasks || []).find(
    (t) => t._id.toString() === taskId.toString(),
  );

  if (!task || !task.assignedEmployee) return;

  const employeeId = task.assignedEmployee.toString();

  // Idempotency: one row per (task, employee) pairing. If the same
  // assignment operation is retried (double click, network retry),
  // the second insert hits the unique index and we skip sending again.
  const dedupeKey = `${taskId}:${employeeId}`;

  try {
    await NotificationLog.create({
      type: "TASK_ASSIGNED",
      dedupeKey,
      employee: employeeId,
    });
  } catch (err) {
    if (err?.code === 11000) {
      logger.info(
        "task-notify",
        `Skipping duplicate new-task email for task ${taskId} / employee ${employeeId}`,
      );
      return;
    }
    throw err;
  }

  const employee = await User.findById(employeeId).select(
    "username email emailVerified",
  );

  if (!employee) return;

  if (!employee.emailVerified) {
    logger.info(
      "task-notify",
      `Skipping new-task email — ${employee.email} has not verified their email yet.`,
    );
    return;
  }

  const taskUrl = `${APP_URL}/employee/tasks/${componentId}/${taskId}`;

  const { subject, html } = buildNewTaskEmail({
    employeeName: employee.username,
    projectName: component.project.name,
    componentName: component.name,
    taskTitle: task.title,
    deadline: task.deadline,
    status: task.status,
    taskUrl,
  });

  const result = await sendEmail({ to: employee.email, subject, html });

  if (!result.success) {
    logger.error(
      "task-notify",
      `Failed to send new-task email to ${employee.email}`,
      result.error,
    );
  }
};

// Single task/employee pairing. Never throws -- callers use this
// fire-and-forget (no await) right after a save, so a notification
// failure never affects the task/project API response.
export const notifyTaskAssigned = async ({ componentId, taskId }) => {
  try {
    await sendNewTaskEmailIfNeeded({ componentId, taskId });
  } catch (err) {
    logger.error("task-notify", "notifyTaskAssigned failed", err);
  }
};

// Multiple tasks created/assigned in one bulk operation (e.g. a
// project-component update that adds several new tasks at once, each
// possibly assigned to a different employee).
export const notifyNewTasksAssigned = async ({ componentId, taskIds = [] }) => {
  for (const taskId of taskIds) {
    // Sequential on purpose: this is a small, low-volume operation
    // (a handful of tasks in a single admin action), and sequential
    // sends are gentler on the Resend rate limit than firing them
    // all in parallel.
    // eslint-disable-next-line no-await-in-loop
    await notifyTaskAssigned({ componentId, taskId });
  }
};

export default { notifyTaskAssigned, notifyNewTasksAssigned };
