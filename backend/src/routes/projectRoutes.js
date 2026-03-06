import express from "express"
import { createProject, getProjects, addMember } from "../controllers/projectController.js"
import { adminOnly, protect } from "../middleware/authMiddleware.js"

const router = express.Router();

// 'CREATE PROJECT' FOR 'ADMIN' ONLY
router.post("/", protect, adminOnly, createProject);

// GET PROJECTS
router.get("/", protect, getProjects);

// ADD MEMBERS TO THE PROJECT
router.post("/:id/add-member", protect, adminOnly, addMember);

export default router;