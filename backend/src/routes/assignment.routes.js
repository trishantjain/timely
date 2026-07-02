import express from "express"

import {
    createTask,
    getProjectTasks
} from "../controllers/taskController.js"

import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

// CREATE TASK
router.post("/", protect, createTask)

// GET TASKS OF PROJECT
router.get("/project/:projectId", protect, getProjectTasks)

export default router