import api from "@/services/api";

// ===================================
// PROJECT COMPONENTS
// ===================================

export const getProjectComponents = (projectId) =>
    api.get(`/project-components/project/${projectId}`);

export const addProjectComponent = (data) =>
    api.post("/project-components", data);

export const assignTask = (
    componentId,
    taskId,
    data
) =>
    api.patch(
        `/project-components/${componentId}/tasks/${taskId}/assign`,
        data
    );

export const getTaskDetails = (
    componentId,
    taskId
) =>
    api.get(
        `/project-components/${componentId}/tasks/${taskId}`
    );
export const getMyTasks = () =>
    api.get("/project-components/my-tasks");