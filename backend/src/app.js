import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// ROUTES
import authRoutes from "./routes/auth/auth.routes.js"
import projectRoutes from "./routes/project/project.routes.js"
// import taskRoutes from "./routes/taskRoutes.js"
import domainRoutes from "./routes/domain.routes.js"
import employeeRoutes from "./routes/employee/employee.routes.js";
import projectDocumentRoutes from "./routes/project/projectDocument.routes.js"
import assignmentRoutes from "./routes/assignment/assignment.routes.js";
import projectModuleRoutes from "./routes/project/projectModule.routes.js";
import projectComponentRoutes from "./routes/project/projectComponent.routes.js";
import submissionRoutes from "./routes/submission/submission.routes.js";
import componentTemplateRoutes from "./routes/template/componentTemplate.routes.js";

dotenv.config();

const allowedOrigins = [
    "http://localhost:5173",      // Local React
    process.env.CLIENT_URL         // Production Vercel URL
].filter(Boolean);

const app = express();

app.use(cors({
    origin: function (origin, callback) {

        // Allow Postman, curl, server-to-server requests
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(
            new Error(`CORS blocked: ${origin}`)
        );
    },

    credentials: true
})
);

app.use(express.json());

app.use((req, res, next) => {

    const start = process.hrtime.bigint();

    res.on("finish", () => {

        const end = process.hrtime.bigint();

        console.log(
            `${req.method} ${req.originalUrl} : ${
                Number(end - start) / 1_000_000
            } ms`
        );

    });

    next();

});

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "API is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
// app.use("/api/tasks", taskRoutes);

app.use("/api/domains", domainRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/project-documents", projectDocumentRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/project-modules", projectModuleRoutes);
app.use("/api/project-components", projectComponentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/component-template", componentTemplateRoutes);

export default app;
