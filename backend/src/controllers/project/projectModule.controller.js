import ProjectModule from "../../models/project/ProjectModule.js";

// CREATE MODULE
export const createProjectModule = async (req, res) => {

    console.log("\n========================================");
    console.log("[ProjectModule] Create Request");
    console.log("User :", req.user.id);
    console.log("Payload :", req.body);
    console.log("========================================");

    try {
        const { name, description, color } = req.body;

        if (!name || name.trim() === "") {

            console.log("[ProjectModule] Validation Failed : Name missing");

            return res.status(400).json({
                success: false,
                message: "Module name is required."
            });

        }

        console.log("[ProjectModule] Checking duplicate module...");

        const exists = await ProjectModule.findOne({
            name: name.trim()
        });

        if (exists) {

            console.log("[ProjectModule] Duplicate module found.");

            return res.status(400).json({
                success: false,
                message: "Module already exists."
            });

        }

        console.log("[ProjectModule] Creating module...");

        const module = await ProjectModule.create({

            name: name.trim(),
            description,
            color,
            createdBy: req.user.id

        });

        console.log("[ProjectModule] Created Successfully.");
        console.log("Module ID :", module._id);

        res.status(201).json({
            success: true,
            data: module
        });

    }
    catch (err) {

        console.error("[ProjectModule] ERROR");
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// GET ALL MODULES
export const getProjectModules = async (req, res) => {

    console.log("\n========================================");
    console.log("[ProjectModule] Fetch All");
    console.log("========================================");

    try {
        const modules = await ProjectModule.find().sort({
            name: 1
        }).lean();

        console.log(`[ProjectModule] ${modules.length} modules found.`);

        res.json({
            success: true,
            data: modules
        });
    }
    catch (err) {

        console.error("[ProjectModule] ERROR");
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};
