import Project from "../../models/project/Project.js";
import ProjectModule from "../../models/project/ProjectModule.js";
import ComponentTemplate from "../../models/template/ComponentTemplate.js";
import ProjectComponent from "../../models/project/ProjectComponent.js";
import User from "../../models/auth/User.js";
import ProjectMember from "../../models/project/ProjectMember.js";
import Submission from "../../models/submission/Submission.js";

// =========================================
// ADD COMPONENT TO PROJECT (SNAPSHOT)
// =========================================
export const addProjectComponent = async (req, res) => {

    console.log("\n========================================");
    console.log("[ProjectComponent] Add Component");
    console.log(req.body);
    console.log("========================================");

    try {
        const {
            projectId,
            componentTemplateId
        } = req.body;

        // Validate Project
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        // Fetch Template
        const template = await ComponentTemplate.findById(componentTemplateId);

        if (!template) {
            return res.status(404).json({
                success: false,
                message: "Component Template not found."
            });
        }

        // Prevent duplicate
        const exists = await ProjectComponent.findOne({
            project: projectId,
            componentTemplate: componentTemplateId
        });

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Component already added to this project."
            });
        }

        const tasks = template.tasks.map(task => ({
            templateTaskId: task._id,
            title: task.title,
            description: task.description,
            displayOrder: task.displayOrder,
            required: task.required,
            submissionRule: task.submissionRule,
            assignedEmployee: null,
            deadline: null,
            status: "PENDING"
        }));

        // Create Snapshot
        const component = await ProjectComponent.create({
            project: projectId,
            projectModule: template.projectModule,
            componentTemplate: template._id,
            name: template.name,
            description: template.description,
            tasks,
            createdBy: req.user.id

        });

        console.log("[ProjectComponent] Snapshot Created :", component._id);

        res.status(201).json({
            success: true,
            message: "Component added successfully.",
            data: component
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

// =========================================
// GET PROJECT COMPONENTS
// =========================================
export const getProjectComponents = async (req, res) => {

    try {
        const { projectId } = req.params;

        const components = await ProjectComponent.find({
            project: req.params.projectId
        })
            .populate("projectModule", "name")
            .sort({
                createdAt: 1
            })

        console.log("Components Type:", typeof components);
        console.log("Is Array:", Array.isArray(components));
        console.log("Components:", components);

        // for (const component of components) {
        //     for (const task of component.tasks) {
        //         console.log("Component:", component);
        //         console.log("Tasks:", component.tasks);

        //         const submission = await Submission.findOne({
        //             projectComponent: component._id,
        //             taskId: task._id
        //         });

        //         task.submissionId = submission?._id || null;
        //     }
        // }

        res.status(200).json({
            success: true,
            data: components
        });
    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};


// =========================================
// ASSIGN TASK TO EMPLOYEE
// =========================================
export const assignTaskToEmployee = async (req, res) => {

    console.log("\n========================================");
    console.log("[ProjectComponent] Assign Task");
    console.log("Params :", req.params);
    console.log("Body :", req.body);
    console.log("========================================");

    try {

        const { componentId, taskId } = req.params;

        const { projectMemberId, deadline } = req.body;

        // Validate Project Member
        const member = await ProjectMember.findById(projectMemberId);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Project member not found."
            });
        }

        // Validate Component
        const component = await ProjectComponent.findById(componentId);

        if (!component) {
            return res.status(404).json({
                success: false,
                message: "Project Component not found."
            });
        }

        // Ensure member belongs to this project
        if (member.project.toString() !== component.project.toString()) {

            return res.status(400).json({
                success: false,
                message: "Project member does not belong to this project."
            });

        }

        // Find Task
        const task = component.tasks.id(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found."
            });
        }

        // Assign
        task.assignedEmployee = member.employee;
        task.deadline = deadline;

        await component.save();

        console.log("[ProjectComponent] Task Assigned Successfully");

        return res.json({
            success: true,
            message: "Task assigned successfully.",
            data: task
        });

    }
    catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// =========================================
// GET MY TASKS
// =========================================
export const getMyTasks = async (req, res) => {

    console.log("\n========================================");
    console.log("[ProjectComponent] Get My Tasks");
    console.log("Employee :", req.user.id);
    console.log("========================================");

    try {
        const components = await ProjectComponent.find({
            "tasks.assignedEmployee": req.user.id
        })
            .populate("project", "name")
            .populate("projectModule", "name");

        const myTasks = [];

        for (const component of components) {

            for (const task of component.tasks) {

                if (
                    task.assignedEmployee &&
                    task.assignedEmployee.toString() === req.user.id
                ) {

                    myTasks.push({
                        projectId: component.project._id,
                        projectName: component.project.name,
                        componentId: component._id,
                        componentName: component.name,
                        moduleId: component.projectModule._id,
                        moduleName: component.projectModule.name,
                        taskId: task._id,
                        taskTitle: task.title,
                        taskDescription: task.description,
                        deadline: task.deadline,
                        status: task.status,
                        submissionType: task.submissionRule.type
                    });

                }

            }

        }

        console.log(`[ProjectComponent] ${myTasks.length} task(s) found.`);

        return res.status(200).json({
            success: true,
            count: myTasks.length,
            data: myTasks
        });

    }
    catch (err) {

        console.error("[ProjectComponent] Get My Tasks Error");
        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

export const getTaskDetails = async (req, res) => {

    console.log("\n========================================");
    console.log("[ProjectComponent] Get Task Details");
    console.log(req.params);
    console.log("========================================");

    try {

        const { componentId, taskId } = req.params;

        const component = await ProjectComponent.findById(componentId)
            .populate("project", "name")
            .populate("projectModule", "name");

        if (!component) {

            return res.status(404).json({
                success: false,
                message: "Component not found."
            });

        }

        const task = component.tasks.id(taskId);

        if (!task) {

            return res.status(404).json({
                success: false,
                message: "Task not found."
            });

        }

        return res.json({

            success: true,

            data: {

                componentId: component._id,

                componentName: component.name,

                projectName: component.project.name,

                moduleName: component.projectModule.name,

                task

            }

        });

    }
    catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};