import api from "@/services/api";

// GET ALL EMPLOYEES
export const getEmployees = () => {
  return api.get("/employees");
};

// Minimal employee directory for "tag an employee" pickers — any
// authenticated user (admin or employee) can call this, and it's
// intentionally not scoped to a project (tagging is meant to reach
// employees outside the current project too).
export const getEmployeeDirectory = (search = "") =>
  api.get("/employees/directory", { params: search ? { search } : {} });

// CREATE EMPLOYEE
export const createEmployee = (data) => {
  return api.post("/auth/create-user", data);
};

export const getMyProjects = () => api.get("/employees/projects");

export const getMyProjectDetails = (projectId) =>
  api.get(`/employees/projects/${projectId}`);

// DELETE EMPLOYEE
export const deleteEmployee = (id) => {
  return api.delete(`/employees/${id}`);
};

// GET SINGLE EMPLOYEE
export const getEmployeeById = (id) => {
  return api.get(`/employees/${id}`);
};

// UPDATE EMPLOYEE
export const updateEmployee = (id, employeeData) => {
  return api.put(`/employees/${id}`, employeeData);
};

// RESET EMPLOYEE PASSWORD
export const resetEmployeePassword = (id, newPassword) => {
  return api.put(`/auth/employees/${id}/reset-password`, {
    newPassword,
  });
};
