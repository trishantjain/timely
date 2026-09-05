import api from "@/services/api";

// ===================================
// TASK-RELATED DAILY UPDATES
// ===================================

export const addTaskUpdate = (componentId, taskId, data) =>
  api.post(`/daily-updates/task/${componentId}/${taskId}`, data);

export const getTaskUpdates = (componentId, taskId) =>
  api.get(`/daily-updates/task/${componentId}/${taskId}`);

// ===================================
// GENERAL (NON-TASK) DAILY UPDATES
// ===================================

export const addGeneralUpdate = (data) =>
  api.post("/daily-updates/general", data);

export const getMyGeneralUpdates = () =>
  api.get("/daily-updates/general/mine");

// Admin — optionally filter by { employeeId, date }
export const getAllGeneralUpdates = (params) =>
  api.get("/daily-updates/general", { params });
