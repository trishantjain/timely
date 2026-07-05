import User from "../../models/auth/User.js";
import ProjectMember from '../../models/project/ProjectMember.js'
import Project from "../../models/project/Project.js";

// GET ALL EMPLOYEES
export const getEmployees = async (req, res) => {

    try {

        const employees = await User.find({
            role: "employee"
        })
            .populate("expertise", "name color")
            .select("-password");

        res.json({
            success: true,
            data: employees
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }

};

// GET LOGGED IN EMPLOYEE PROJECTS
export const getMyProjects = async (req, res) => {
    try {

        const assignments = await ProjectMember.find({
            employee: req.user.id
        })
            .populate({
                path: "project",
                populate: {
                    path: "domains",
                    select: "name color"
                }
            })
            .sort({ createdAt: -1 });

        const projects = assignments.map(item => ({
            assignmentId: item._id,
            status: item.status,
            assignedAt: item.createdAt,
            ...item.project.toObject()
        }));

        res.json({
            success: true,
            data: projects
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

// GET SINGLE PROJECT DETAILS OF LOGGED-IN EMPLOYEE
export const getMyProjectDetails = async (req, res) => {

    try {
        const { projectId } = req.params;

        // Verify that this employee is assigned to the project
        const assignment = await ProjectMember.findOne({
            employee: req.user.id,
            project: projectId
        });

        if (!assignment) {
            return res.status(403).json({
                success: false,
                message: "You are not assigned to this project."
            });
        }

        const project = await Project.findById(projectId)
            .populate("domains", "name color")
            .populate("created_by", "username email");

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        res.json({
            success: true,
            data: {
                assignment,
                project
            }
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }

};
