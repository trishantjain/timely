import api from "@/services/api";

export const getProjectModules = () =>
    api.get("/project-modules");