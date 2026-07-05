import api from "@/services/api";

export const getProjectMembers = (projectId) =>
    api.get(`/projects/${projectId}/members`);