import api from "@/services/api";

export const getProjectModules = () => api.get("/project-modules");

export const createProjectModule = (data) => {
  api.post("/project-modules", data);
};
