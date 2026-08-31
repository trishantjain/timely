import mongoose from "mongoose";

import ComponentTemplate from "../../models/template/ComponentTemplate.js";
import ProjectModule from "../../models/project/ProjectModule.js";
import ProjectComponent from "../../models/project/ProjectComponent.js";

// ==========================================
// CREATE COMPONENT TEMPLATE
// ==========================================
export const createComponentTemplate = async (req, res) => {
  try {
    const { projectModule, name, description, tasks } = req.body;

    // -----------------------------
    // VALIDATION
    // -----------------------------
    if (!projectModule) {
      return res.status(400).json({
        success: false,
        message: "Project Module is required.",
      });
    }

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Component name is required.",
      });
    }

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one task is required.",
      });
    }

    const module = await ProjectModule.findById(projectModule);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Project Module not found.",
      });
    }

    const exists = await ComponentTemplate.findOne({
      projectModule,
      name: name.trim(),
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Component already exists in this module.",
      });
    }

    const component = await ComponentTemplate.create({
      projectModule,
      name: name.trim(),
      description,
      tasks,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Component Template created successfully.",
      data: component,
    });
  } catch (err) {
    console.error("[ComponentTemplate] ERROR", err);

    res.status(500).json({
      success: false,
      message: err.message,
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

    // ==========================================
    // FIND COMPONENT TEMPLATE
    // ==========================================

    const component = await ComponentTemplate.findById(id);

    if (!component) {
      return res.status(404).json({
        success: false,
        message: "Component Template not found.",
      });
    }

    // ==========================================
    // UPDATE COMPONENT TEMPLATE
    // ==========================================

    if (name !== undefined) {
      component.name = name.trim();
    }

    if (description !== undefined) {
      component.description = description;
    }

    if (Array.isArray(tasks)) {
      component.tasks = tasks;
    }

    if (typeof isActive === "boolean") {
      component.isActive = isActive;
    }

    // Save updated template first
    await component.save();

    // ==========================================
    // FIND ALL PROJECT WORK ITEMS CREATED
    // FROM THIS COMPONENT TEMPLATE
    // ==========================================

    const projectComponents = await ProjectComponent.find({
      componentTemplate: component._id,
    });

    // ==========================================
    // SYNC TEMPLATE CHANGES TO ALL PROJECTS
    // ==========================================

    for (const projectComponent of projectComponents) {
      /*
       * Create a map of existing project tasks.
       *
       * Key:
       * templateTaskId
       *
       * Value:
       * Existing project task
       *
       * This allows us to update an existing task
       * without losing project-specific data.
       */

      const existingProjectTasks = new Map();

      projectComponent.tasks.forEach((task) => {
        if (task.templateTaskId) {
          existingProjectTasks.set(task.templateTaskId.toString(), task);
        }
      });

      const syncedTasks = [];

      // ==========================================
      // SYNC ALL TEMPLATE TASKS
      // ==========================================

      for (const templateTask of component.tasks) {
        const templateTaskId = templateTask._id.toString();

        const existingProjectTask = existingProjectTasks.get(templateTaskId);

        // ==========================================
        // TASK ALREADY EXISTS IN PROJECT
        // ==========================================

        if (existingProjectTask) {
          /*
           * Update only template-controlled fields.
           *
           * Preserve:
           *
           * - assignedEmployee
           * - deadline
           * - status
           * - submissionId
           * - project task _id
           */

          existingProjectTask.title = templateTask.title;

          existingProjectTask.description = templateTask.description || "";

          existingProjectTask.displayOrder = templateTask.displayOrder;

          existingProjectTask.required = templateTask.required;

          existingProjectTask.submissionRule = templateTask.submissionRule;

          syncedTasks.push(existingProjectTask);
        }

        // ==========================================
        // NEW TASK ADDED TO TEMPLATE
        // ==========================================
        else {
          syncedTasks.push({
            templateTaskId: templateTask._id,

            title: templateTask.title,

            description: templateTask.description || "",

            displayOrder: templateTask.displayOrder,

            required: templateTask.required,

            submissionRule: templateTask.submissionRule,

            // Project-specific fields
            assignedEmployee: null,

            deadline: null,

            submissionId: null,

            status: "PENDING",
          });
        }
      }

      // ==========================================
      // PRESERVE MANUALLY ADDED TASKS
      // ==========================================

      /*
       * Manual tasks do not have a templateTaskId.
       *
       * Do not delete them when syncing the template.
       */

      const manualTasks = projectComponent.tasks.filter(
        (task) => !task.templateTaskId,
      );

      // ==========================================
      // REPLACE TEMPLATE TASKS + KEEP MANUAL TASKS
      // ==========================================

      projectComponent.tasks = [...syncedTasks, ...manualTasks];

      // ==========================================
      // UPDATE WORK ITEM INFORMATION
      // ==========================================

      projectComponent.name = component.name;

      projectComponent.description = component.description || "";

      projectComponent.projectModule = component.projectModule;

      await projectComponent.save();
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.json({
      success: true,

      message:
        "Component Template updated successfully and synchronized with all projects.",

      data: component,
    });
  } catch (err) {
    console.error("[ComponentTemplate] Update Error", err);

    return res.status(500).json({
      success: false,

      message: err.message,
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
      { new: true },
    );

    if (!component) {
      return res.status(404).json({
        success: false,
        message: "Component Template not found.",
      });
    }

    res.json({
      success: true,
      message: "Component Template deactivated successfully.",
      data: component,
    });
  } catch (err) {
    console.error("[ComponentTemplate] Deactivate Error", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================================
// GET ALL COMPONENT TEMPLATES
// ==========================================
export const getComponentTemplates = async (req, res) => {
  try {
    const filter = {};

    // Opt-in pagination — see employee.controller.js getEmployees for
    // the same reasoning: don't truncate existing full-list consumers.
    const paginationRequested =
      req.query.page !== undefined || req.query.limit !== undefined;

    if (!paginationRequested) {
      const components = await ComponentTemplate.find(filter)
        .populate("projectModule", "name color")
        .populate("createdBy", "username")
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        data: components,
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
      ComponentTemplate.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: components,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("[ComponentTemplate] ERROR", err);

    res.status(500).json({
      success: false,
      message: err.message,
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
      data: components,
    });
  } catch (err) {
    console.error("[ComponentTemplate] ERROR", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
