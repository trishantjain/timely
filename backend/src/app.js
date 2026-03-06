import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// ROUTES
import authRoutes from "./routes/authRoutes.js"
import projectRoutes from "./routes/projectRoutes.js"
// import taskRoutes from "./routes/taskRoutes.js"

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
// app.use("/api/tasks", taskRoutes);

export default app;
