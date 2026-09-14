import express from "express";

import {
  getEmployees,
  getEmployeeById,
  updateEmployee,
  getMyProjectDetails,
  getMyProjects,
  getEmployeeDirectory,
} from "../../controllers/employee/employee.controller.js";

import { protect, adminOnly } from "../../middleware/authMiddleware.js";

const router = express.Router();

// GET ALL EMPLOYEES
router.get("/", protect, adminOnly, getEmployees);

// GET LOGGED-IN EMPLOYEE PROJECTS
router.get("/projects", protect, getMyProjects);

// GET SINGLE PROJECT DETAILS
router.get("/projects/:projectId", protect, getMyProjectDetails);

// Minimal employee directory for the "tag an employee" picker — any
// authenticated user (admin or employee), not project-scoped. Must
// stay above "/:id" below or that param route would swallow it.
router.get("/directory", protect, getEmployeeDirectory);

// GET SINGLE EMPLOYEE
router.get("/:id", protect, adminOnly, getEmployeeById);

// UPDATE EMPLOYEE
router.put("/:id", protect, adminOnly, updateEmployee);

export default router;
