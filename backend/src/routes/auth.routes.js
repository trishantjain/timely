import express from "express"
import { login, createUser, getUsers } from "../controllers/auth.controller.js"
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// LOGIN ROUTE
router.post("/login", login);

// 'CREATE USER' ROUTE
router.post("/create-user", protect, adminOnly, createUser);

router.get("/users", protect, adminOnly, getUsers)

export default router;
