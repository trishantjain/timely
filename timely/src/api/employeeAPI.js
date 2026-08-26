import api from "@/services/api";

// GET ALL EMPLOYEES
export const getEmployees = () => {
  return api.get("/employees");
};

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
