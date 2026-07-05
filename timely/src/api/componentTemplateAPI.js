import api from "@/services/api";

export const getComponentsByModule = (moduleId) =>
    api.get(`/component-template/module/${moduleId}`);