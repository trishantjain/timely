import express from "express"
import { login, createUser } from "../controllers/authController.js"
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// LOGIN ROUTE
router.post("/login", login);

// 'CREATE USER' ROUTE
router.post("/create-user", protect, adminOnly, createUser);

export default router;
