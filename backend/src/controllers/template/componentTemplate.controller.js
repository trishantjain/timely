import mongoose from "mongoose";

import ComponentTemplate from "../../models/template/ComponentTemplate.js";
import ProjectModule from "../../models/project/ProjectModule.js";

// ==========================================
// CREATE COMPONENT TEMPLATE
// ==========================================
export const createComponentTemplate = async (req, res) => {

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

        const module = await ProjectModule.findById(projectModule);

        if (!module) {
            return res.status(404).json({
                success: false,
                message: "Project Module not found."
            });
        }

        const exists = await ComponentTemplate.findOne({
            projectModule,
            name: name.trim()
        });

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Component already exists in this module."
            });
        }

        const component = await ComponentTemplate.create({
            projectModule,
            name: name.trim(),
            description,
            tasks,
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            message: "Component Template created successfully.",
            data: component
        });

    }
    catch (err) {
        console.error("[ComponentTemplate] ERROR", err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }

};

// ==========================================
// UPDATE COMPONENT TEMPLATE
// ==========================================
// NOTE: this updates the reusable template only. Per the project's
// snapshot design, ProjectComponents already created from this template
// keep their own copy of the tasks and are NOT retroactively changed.
export const updateComponentTemplate = async (req, res) => {

    try {
        const { id } = req.params;
        const { name, description, tasks, isActive } = req.body;

        const component = await ComponentTemplate.findById(id);

        if (!component) {
            return res.status(404).json({
                success: false,
                message: "Component Template not found."
            });
        }

        if (name !== undefined) component.name = name.trim();
        if (description !== undefined) component.description = description;
        if (Array.isArray(tasks)) component.tasks = tasks;
        if (typeof isActive === "boolean") component.isActive = isActive;

        await component.save();

        res.json({
            success: true,
            message: "Component Template updated successfully.",
            data: component
        });

    } catch (err) {
        console.error("[ComponentTemplate] Update Error", err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }

};

// ==========================================
// DEACTIVATE COMPONENT TEMPLATE (soft delete)
// ==========================================
// Soft-deleted rather than removed: existing ProjectComponents reference
// this template's _id (componentTemplate field) and a hard delete would
// break that relationship / historical data.
export const deactivateComponentTemplate = async (req, res) => {

    try {
        const { id } = req.params;

        const component = await ComponentTemplate.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!component) {
            return res.status(404).json({
                success: false,
                message: "Component Template not found."
            });
        }

        res.json({
            success: true,
            message: "Component Template deactivated successfully.",
            data: component
        });

    } catch (err) {
        console.error("[ComponentTemplate] Deactivate Error", err);

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

    try {
        const filter = {  };

        // Opt-in pagination — see employee.controller.js getEmployees for
        // the same reasoning: don't truncate existing full-list consumers.
        const paginationRequested = req.query.page !== undefined || req.query.limit !== undefined;

        if (!paginationRequested) {
            const components = await ComponentTemplate.find(filter)
                .populate("projectModule", "name color")
                .populate("createdBy", "username")
                .sort({ createdAt: -1 });

            return res.json({
                success: true,
                data: components
            });
        }

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
        const skip = (page - 1) * limit;

        const [components, total] = await Promise.all([
            ComponentTemplate.find(filter)
                .populate("projectModule", "name color")
                .populate("createdBy", "username")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            ComponentTemplate.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: components,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (err) {
        console.error("[ComponentTemplate] ERROR", err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }

};

// ==========================================
// GET COMPONENTS OF A MODULE
// ==========================================
export const getComponentsByModule = async (req, res) => {

    try {
        const moduleId = new mongoose.Types.ObjectId(req.params.moduleId);

        const components = await ComponentTemplate.find({
            projectModule: moduleId,
            // isActive: true
        }).sort({ name: 1 });

        return res.json({
            success: true,
            data: components
        });

    }
    catch (err) {
        console.error("[ComponentTemplate] ERROR", err);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }

};
