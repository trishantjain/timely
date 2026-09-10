import ProjectComponent from "../models/project/ProjectComponent.js";
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

export default { getPendingTasksGroupedByEmployeeIds };
