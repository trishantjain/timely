import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// ROUTES
import authRoutes from "./routes/auth.routes.js"
import projectRoutes from "./routes/project.routes.js"
// import taskRoutes from "./routes/taskRoutes.js"
import domainRoutes from "./routes/domain.routes.js"

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
// app.use("/api/tasks", taskRoutes);

app.use("/api/domains", domainRoutes);

export default app;
