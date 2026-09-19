import ProjectComponent from "../models/project/ProjectComponent.js";
import Submission from "../models/submission/Submission.js";
import { EMPLOYEE_ACTION_PENDING_STATUSES } from "../constants/taskStatus.js";

// =========================================
// GET PENDING TASKS, GROUPED BY EMPLOYEE
//
// Reuses the same EMPLOYEE_ACTION_PENDING_STATUSES definition as the
// project-scoped "pending tasks" view (getProjectPendingTasks) instead
// of re-deriving what "pending" means. Runs ONE query across every
// employee rather than looping per-employee, since the pending-task
// digest job may run for a dozen+ employees at once and per-employee
// queries would be N+1.
//
// Returns a Map<employeeId string, Map<projectId string, { projectName, tasks: [] }>>
// =========================================
export const getPendingTasksGroupedByEmployeeIds = async (employeeIds) => {
  const employeeIdSet = new Set(employeeIds.map((id) => id.toString()));

  const components = await ProjectComponent.find({
    "tasks.assignedEmployee": { $in: employeeIds },
    "tasks.status": { $in: EMPLOYEE_ACTION_PENDING_STATUSES },
  })
    .populate("project", "name")
    .select("name project tasks")
    .lean();

  const grouped = new Map();

  for (const component of components) {
    if (!component.project) continue;

    for (const task of component.tasks || []) {
      if (!task.assignedEmployee) continue;
      if (!EMPLOYEE_ACTION_PENDING_STATUSES.includes(task.status)) continue;

      const employeeId = task.assignedEmployee.toString();
      if (!employeeIdSet.has(employeeId)) continue;

      if (!grouped.has(employeeId)) {
        grouped.set(employeeId, new Map());
      }

      const employeeProjects = grouped.get(employeeId);
      const projectId = component.project._id.toString();

      if (!employeeProjects.has(projectId)) {
        employeeProjects.set(projectId, {
          projectName: component.project.name,
          tasks: [],
        });
      }

      employeeProjects.get(projectId).tasks.push({
        taskTitle: task.title,
        deadline: task.deadline,
      });
    }
  }

  return grouped;
};

// =========================================
// GET ALL TASKS, GROUPED BY EMPLOYEE (ADMIN DIGEST)
//
// Same single-query / no-N+1 approach as above, but intentionally
// status-agnostic: the admin digest reports the FULL picture
// (PENDING, IN_PROGRESS, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED)
// rather than only what is pending employee action. No new statuses
// are introduced here -- these are exactly the values in
// projectTaskSchema.status.
//
// Submission/review state is a separate collection (Submission is keyed
// by projectComponent + taskId + assignedEmployee), so it is fetched in
// ONE extra query and joined in memory instead of per task.
//
// componentId/taskId are carried through so the email template can link
// straight to the existing admin route /admin/tasks/:componentId/:taskId.
//
// Returns Map<employeeId string, Map<projectId string, {
//   projectName, tasks: [{ componentId, taskId, componentName, taskTitle,
//   status, deadline, submissionStatus, submissionVersion, subtasks }]
// }>>
// =========================================
export const getAllTasksGroupedByEmployeeIds = async (employeeIds) => {
  const employeeIdSet = new Set(employeeIds.map((id) => id.toString()));

  const [components, submissions] = await Promise.all([
    ProjectComponent.find({ "tasks.assignedEmployee": { $in: employeeIds } })
      .populate("project", "name")
      .select("name project tasks")
      .lean(),
    Submission.find({ assignedEmployee: { $in: employeeIds } })
      .select("projectComponent taskId assignedEmployee status currentVersion")
      .lean(),
  ]);

  // Keyed the same way as the Submission unique index so the lookup is
  // unambiguous even when a task title is reused across components.
  const submissionByTask = new Map(
    submissions.map((s) => [
      `${s.projectComponent}:${s.taskId}:${s.assignedEmployee}`,
      s,
    ]),
  );

  const grouped = new Map();

  for (const component of components) {
    if (!component.project) continue;

    const componentId = component._id.toString();
    const projectId = component.project._id.toString();

    for (const task of component.tasks || []) {
      if (!task.assignedEmployee) continue;

      const employeeId = task.assignedEmployee.toString();
      if (!employeeIdSet.has(employeeId)) continue;

      if (!grouped.has(employeeId)) grouped.set(employeeId, new Map());
      const employeeProjects = grouped.get(employeeId);

      if (!employeeProjects.has(projectId)) {
        employeeProjects.set(projectId, {
          projectId,
          projectName: component.project.name,
          tasks: [],
        });
      }

      const taskId = task._id.toString();
      const submission = submissionByTask.get(
        `${componentId}:${taskId}:${employeeId}`,
      );

      const subtasks = task.subtasks || [];

      employeeProjects.get(projectId).tasks.push({
        componentId,
        taskId,
        componentName: component.name,
        taskTitle: task.title,
        status: task.status,
        deadline: task.deadline,
        // null (rather than a made-up status) when the task has never
        // been submitted -- the template renders that as a dash.
        submissionStatus: submission?.status || null,
        submissionVersion: submission?.currentVersion || 0,
        subtaskTotal: subtasks.length,
        subtaskCompleted: subtasks.filter((s) => s.completed).length,
      });
    }
  }

  return grouped;
};

export default {
  getPendingTasksGroupedByEmployeeIds,
  getAllTasksGroupedByEmployeeIds,
};
