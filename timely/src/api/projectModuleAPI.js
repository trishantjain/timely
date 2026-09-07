import api from "@/services/api";

export const getProjectModules = () => api.get("/project-modules");

export const createProjectModule = (data) => api.post("/project-modules", data);

export const updateProjectModule = (id, data) =>
  api.patch(`/project-modules/${id}`, data);

// Soft-delete: the backend deactivates the module (isActive: false) rather
// than hard-deleting it, so any ComponentTemplate still referencing it is
// never orphaned.
export const deactivateProjectModule = (id) => api.delete(`/project-modules/${id}`);
