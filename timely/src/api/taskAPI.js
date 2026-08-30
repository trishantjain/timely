import api from "../services/api";

export const createTask = (data) => api.post("/tasks", data);

export const getProjectTasks = (projectId) =>
  api.get(`/tasks/project/${projectId}`);

export const getMyTasks = (projectId) =>
  api.get("/project-components/my-tasks", {
    params: projectId ? { projectId } : {},
  });

export const getEmployeeProjectTasks = (projectId, employeeId) =>
  api.get(
    `/project-components/projects/${projectId}/employees/${employeeId}/tasks`,
  );
