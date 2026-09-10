import express from "express";
import {
  login,
  createUser,
  getUsers,
  resetEmployeePassword,
} from "../../controllers/auth/auth.controller.js";

import {
  verifyEmail,
  resendVerification,
} from "../../controllers/auth/verification.controller.js";

import { adminOnly, protect } from "../../middleware/authMiddleware.js";

import {
  loginRules,
  createUserRules,
} from "../../validations/auth.validation.js";
import validate from "../../middleware/validate.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Brute-force protection on login: 10 attempts / 15 min per IP.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

// LOGIN ROUTE
router.post("/login", loginLimiter, loginRules, validate, login);

// 'CREATE USER' ROUTE
router.post(
  "/create-user",
  protect,
  adminOnly,
  createUserRules,
  validate,
  createUser,
);

router.get("/users", protect, adminOnly, getUsers);

// Same abuse-protection pattern as login: caps how often a token can
// be requested, on top of the per-user cooldown already enforced in
// verification.service.js.
const resendVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many verification requests. Please try again later.",
  },
});

// EMAIL VERIFICATION ROUTES
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", protect, resendVerificationLimiter, resendVerification);

router.put("/employees/:id/reset-password", resetEmployeePassword);

export default router;
