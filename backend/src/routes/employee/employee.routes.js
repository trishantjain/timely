import express from "express";

import {
  getEmployees,
  getEmployeeById,
  updateEmployee,
  getMyProjectDetails,
  getMyProjects,
} from "../../controllers/employee/employee.controller.js";

import { protect, adminOnly } from "../../middleware/authMiddleware.js";

const router = express.Router();

// GET ALL EMPLOYEES
router.get("/", protect, adminOnly, getEmployees);

// GET LOGGED-IN EMPLOYEE PROJECTS
router.get("/projects", protect, getMyProjects);

// GET SINGLE PROJECT DETAILS
router.get("/projects/:projectId", protect, getMyProjectDetails);

// GET SINGLE EMPLOYEE
router.get("/:id", protect, adminOnly, getEmployeeById);

// UPDATE EMPLOYEE
router.put("/:id", protect, adminOnly, updateEmployee);

export default router;
