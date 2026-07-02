import express from "express"
import { createProject, getProjects, addMember, getProjectById } from "../controllers/project.controller.js"
import { adminOnly, protect } from "../middleware/authMiddleware.js"

const router = express.Router();

// 'CREATE PROJECT' FOR 'ADMIN' ONLY
router.post("/", protect, adminOnly, createProject);

// GET PROJECTS
router.get("/", protect, getProjects);

// ADD MEMBERS TO THE PROJECT
router.post("/:id/add-member", protect, adminOnly, addMember);

// GET PROJECT BY ID
router.get("/:id", protect, getProjectById);

export default router;