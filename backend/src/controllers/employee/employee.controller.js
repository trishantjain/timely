import User from "../../models/auth/User.js";
import ProjectMember from '../../models/project/ProjectMember.js'
import Project from "../../models/project/Project.js";

// GET ALL EMPLOYEES
export const getEmployees = async (req, res) => {

    try {

        const filter = { role: "employee" };

        // Pagination is opt-in: if the caller doesn't pass page/limit,
        // behave exactly as before (return the full list) so the
        // existing Employees.jsx page — which renders res.data.data as
        // a complete array — doesn't silently get truncated.
        const paginationRequested = req.query.page !== undefined || req.query.limit !== undefined;

        let query = User.find(filter)
            .populate("expertise", "name color")
            .select("-password")
            .lean();

        if (!paginationRequested) {
            const employees = await query;

            return res.json({
                success: true,
                data: employees
            });
        }

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
        const skip = (page - 1) * limit;

        const [employees, total] = await Promise.all([
            query.skip(skip).limit(limit),
            User.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: employees,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
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
