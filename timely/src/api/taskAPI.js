import api from "../services/api";

export const createTask = (data) => api.post("/tasks", data);

export const getProjectTasks = (projectId) =>
  api.get(`/tasks/project/${projectId}`);

export const getMyTasks = () => api.get("/project-components/my-tasks");

export const getEmployeeProjectTasks = (projectId, employeeId) =>
  api.get(`/project-components/projects/${projectId}/employees/${employeeId}/tasks`);
