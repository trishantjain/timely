import mongoose from "mongoose";

// ==========================================
// CREATE COMPONENT TEMPLATE

import ComponentTemplate from "../../models/template/ComponentTemplate.js";

// ==========================================
export const createComponentTemplate = async (req, res) => {

    console.log("\n========================================");
    console.log("[ComponentTemplate] Create Request");
    console.log("User :", req.user.id);
    console.log("Payload :", JSON.stringify(req.body, null, 2));
    console.log("========================================");

    try {
        const {
            projectModule,
            name,
            description,
            tasks
        } = req.body;

        // -----------------------------
        // VALIDATION
        // -----------------------------
        if (!projectModule) {
            return res.status(400).json({
                success: false,
                message: "Project Module is required."
            });
        }

        if (!name || name.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Component name is required."
            });
        }

        if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one task is required."
            });
        }

        console.log("[ComponentTemplate] Validating Module...");

        const module = await ProjectModule.findById(projectModule);

        if (!module) {

            console.log("[ComponentTemplate] Invalid Module");

            return res.status(404).json({
                success: false,
                message: "Project Module not found."
            });

        }

        console.log("[ComponentTemplate] Checking duplicate...");

        const exists = await ComponentTemplate.findOne({
            projectModule,
            name: name.trim()
        });

        if (exists) {

            console.log("[ComponentTemplate] Duplicate Found");

            return res.status(400).json({
                success: false,
                message: "Component already exists in this module."
            });

        }

        console.log("[ComponentTemplate] Creating Component Template...");

        const component = await ComponentTemplate.create({
            projectModule,
            name: name.trim(),
            description,
            tasks,
            createdBy: req.user.id
        });

        console.log("[ComponentTemplate] Created Successfully");
        console.log("Component :", component._id);

        res.status(201).json({
            success: true,
            message: "Component Template created successfully.",
            data: component
        });

    }
    catch (err) {

        console.error("[ComponentTemplate] ERROR");
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// ==========================================
// GET ALL COMPONENT TEMPLATES
// ==========================================
export const getComponentTemplates = async (req, res) => {

    console.log("\n========================================");
    console.log("[ComponentTemplate] Fetch All");
    console.log("========================================");

    try {
        const components = await ComponentTemplate.find({
            isActive: true
        })
            .populate(
                "projectModule",
                "name color"
            )
            .populate(
                "createdBy",
                "username"
            )
            .sort({
                createdAt: -1
            });

        console.log(
            `[ComponentTemplate] ${components.length} components found.`
        );

        res.json({
            success: true,
            data: components
        });
    }
    catch (err) {

        console.error("[ComponentTemplate] ERROR");
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};


// ==========================================
// GET COMPONENTS OF A MODULE
// ==========================================
// export const getComponentsByModule = async (req, res) => {

//     console.log("\n========================================");
//     console.log("[ComponentTemplate] Fetch By Module");
//     console.log("Module :", req.params.moduleId);
//     console.log("========================================");

//     try {
//         const components = await ComponentTemplate.find({
//             projectModule: req.params.moduleId
//         }).sort({
//             name: 1
//         });
//         console.log(
//             `[ComponentTemplate] ${components.length} components found.`
//         );

//         res.json({
//             success: true,
//             data: components
//         });

//     }
//     catch (err) {

//         console.error("[ComponentTemplate] ERROR");
//         console.error(err);

//         res.status(500).json({
//             success: false,
//             message: err.message
//         });

//     }

// };

// ==========================================
// GET COMPONENTS OF A MODULE
// ==========================================
export const getComponentsByModule = async (req, res) => {

    console.log("\n========================================");
    console.log("[ComponentTemplate] Fetch By Module");
    console.log("Requested Module ID :", req.params.moduleId);
    console.log("========================================");

    try {

        console.log("\n[Step 1] Fetching ALL Component Templates...");

        const allComponents = await ComponentTemplate.find();

        console.log("Total Components in DB :", allComponents.length);

        console.log("\n===== DEBUG =====");

        allComponents.forEach(component => {

            console.log("Name :", component.name);

            console.log("Stored Value :", component.projectModule);

            console.log("Stored Type :", typeof component.projectModule);

            console.log(
                "instanceof ObjectId :",
                component.projectModule instanceof mongoose.Types.ObjectId
            );

        });

        console.log(
            "Requested Value :",
            req.params.moduleId
        );

        console.log(
            "Requested Type :",
            typeof req.params.moduleId
        );
        console.log("\n[Step 2] Filtering by Module...");

        const moduleId = new mongoose.Types.ObjectId(
            req.params.moduleId
        );

        const components = await ComponentTemplate.find({
            projectModule: moduleId
        });

        console.log("Matched Components :", components.length);

        components.forEach((component) => {
            console.log("Matched ->", component.name);
        });

        return res.json({
            success: true,
            data: components
        });

    }
    catch (err) {

        console.error("[ComponentTemplate] ERROR");
        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};