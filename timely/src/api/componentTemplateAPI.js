import api from "@/services/api";

export const getComponentsByModule = (moduleId) =>
    api.get(`/component-template/module/${moduleId}`);

export const getComponentTemplates = () =>
    api.get("/component-template");

export const createComponentTemplate = (data) =>
    api.post("/component-template", data);

export const updateComponentTemplate = (id, data) =>
    api.patch(`/component-template/${id}`, data);