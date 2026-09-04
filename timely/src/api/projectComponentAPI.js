import api from "@/services/api";

// ===================================
// PROJECT COMPONENTS
// ===================================

export const getProjectComponents = (projectId) =>
  api.get(`/project-components/project/${projectId}`);

export const addProjectComponent = (data) =>
  api.post("/project-components", data);

export const assignTask = (componentId, taskId, data) =>
  api.patch(`/project-components/${componentId}/tasks/${taskId}/assign`, data);

export const getTaskDetails = (componentId, taskId) =>
  api.get(`/project-components/${componentId}/tasks/${taskId}`);

// Tag another employee on a task so they can be looped in / handed
// information about it.
export const tagEmployeeOnTask = (componentId, taskId, data) =>
  api.patch(
    `/project-components/${componentId}/tasks/${taskId}/tag`,
    data,
  );

export const getMyTasks = () => api.get("/project-components/my-tasks");

// ===================================
// MANUAL TASKS
// ===================================
export const addManualTask = (componentId, data) =>
  api.post(`/project-components/${componentId}/tasks/manual`, data);

// Create a manual task directly on a project that has no work items
// yet (i.e. no task assigned to any employee in the project). The
// backend auto-creates a "Manual Tasks" container the first time.
export const addManualTaskToProject = (projectId, data) =>
  api.post(`/project-components/manual-task`, { projectId, ...data });

// ===================================
// ADMIN - EMPLOYEE PROJECT TASKS
// ===================================
export const getEmployeeProjectTasks = (projectId, employeeId) =>
  api.get(
    `/project-components/projects/${projectId}/employees/${employeeId}/tasks`,
  );

// ===================================
// ADMIN - DOMAIN TASKS IN PROJECT
// ===================================
export const getProjectDomainTasks = (projectId, domainId) =>
  api.get(
    `/project-components/projects/${projectId}/domains/${domainId}/tasks`,
  );

export const updateProjectComponent = (componentId, payload) => {
  return api.patch(`/project-components/${componentId}`, payload);
};

export const deleteProjectComponent = (componentId) => {
  return api.delete(`/project-components/${componentId}`);
};
