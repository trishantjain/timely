import api from "@/services/api";

export const createAssignments = (data) =>
    api.post("/assignments", data);

export const getAssignments = () =>
    api.get("/assignments");

export const getProjectAssignments = (projectId) =>
    api.get(`/assignments/project/${projectId}`);

export const getMyProjects = () =>
    api.get("/assignments/my-projects");