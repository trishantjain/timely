import bcrypt from "bcrypt";
import User from "../../models/auth/User.js";
import { signToken } from "../../config/jwt.js";

const isDev = process.env.NODE_ENV !== "production";

// CREATE USER CONTROLLER
export const createUser = async (req, res) => {
  try {
    const { username, email, password, role, expertise } = req.body;

    // Prevent duplicate email up front with a clear message
    // (otherwise this fails later with a raw Mongo E11000 error).
    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    // HASHING PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // CREATING USER OBJECT
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
      expertise,
    });

    // SAVING USER
    await user.save();

    user.password = undefined;

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// LOGIN USER CONTROLLER
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // Same generic message whether the email doesn't exist or the
    // password is wrong — avoids leaking which emails are registered.
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = signToken({
      id: user._id,
      role: user.role,
    });

    user.password = undefined;

    res.json({
      success: true,
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET USERS (admin-only lookup, e.g. for assignment dropdowns)
export const getUsers = async (req, res) => {
  try {
    // NOTE: this previously filtered `role: "user"`, which does not
    // exist in the User schema enum ("admin" | "employee") and so
    // always returned an empty array. Fixed to return employees,
    // which matches how this endpoint is actually consumed.
    const users = await User.find({ role: "employee" }).select(
      "_id username email",
    );

    // NOTE: kept as a bare array (not {success, data}) because the
    // frontend consumer (AddTaskDialog.jsx via api/userAPI.js) does
    // `setUsers(res.data)` expecting an array directly. Wrapping it
    // would silently break that dropdown.
    res.json(users);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// RESET EMPLOYEE PASSWORD (ADMIN)
export const resetEmployeePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // Find employee
    const employee = await User.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);

    employee.password = await bcrypt.hash(newPassword, salt);

    // Save updated password
    await employee.save();

    res.json({
      success: true,
      message: "Employee password has been reset successfully.",
    });
  } catch (err) {
    console.error("Reset password error:", err);

    res.status(500).json({
      success: false,
      message: err.message || "Failed to reset employee password.",
    });
  }
};
