import api from "../services/api";

export const createProject = (data) => api.post("/projects", data);

export const getProjects = () => api.get("/projects");

export const getProjectById = (id) => api.get(`/projects/${id}`);

export const updateProject = (id, data) => api.put(`/projects/${id}`, data);

export const addMember = (projectId, data) =>
  api.post(`/projects/${projectId}/add-member`, data);

export const deleteProject = (id) => api.delete(`/projects/${id}`);

export const updateProjectDomains = (projectId, domains) =>
  api.patch(`/projects/${projectId}/domains`, domains);
