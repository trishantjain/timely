import Domain from "../../models/Domain.js";
import Project from '../../models/project/Project.js'
import User from '../../models/auth/User.js'
import ProjectMember from '../../models/project/ProjectMember.js'


export const createAssignments = async (req, res) => {

    try {
        const { projectId, assignments } = req.body;

        // Validate project
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        if (!assignments || assignments.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please assign at least one employee."
            });
        }

        const createdAssignments = [];
        const skippedAssignments = [];

        for (const item of assignments) {
            const { employeeId, domainId } = item;

            const employee = await User.findById(employeeId);



            if (!employee) {
                skippedAssignments.push({
                    employeeId,
                    reason: "Employee not found."
                });
                continue;
            }

            const domain = await Domain.findById(domainId);

            if (!domain) {
                skippedAssignments.push({
                    domainId,
                    reason: "Domain not found."
                });
                continue;
            }

            // Check employee expertise
            const hasExpertise = employee.expertise.some(
                exp => exp.toString() === domainId
            );

            if (!hasExpertise) {
                skippedAssignments.push({
                    employeeId,
                    reason: "Employee does not have this expertise."
                });
                continue;
            }

            // Prevent duplicate assignment
            const exists = await ProjectMember.findOne({
                project: projectId,
                domain: domainId
            });

            if (exists) {
                skippedAssignments.push({
                    domainId,
                    reason: "Domain already assigned."
                });
                continue;
            }

            const assignment = await ProjectMember.create({
                project: projectId,
                employee: employeeId,
                domain: domainId
            });

            createdAssignments.push(assignment);
        }
        res.status(201).json({
            success: true,
            createdCount: createdAssignments.length,
            skippedCount: skippedAssignments.length,
            createdAssignments,
            skippedAssignments
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};


export const getMyProjects = async (req, res) => {

    try {
        console.log("Logged in employee:", req.user.id);

        let assignments = await ProjectMember.find({
            employee: req.user.id
        })
            .populate(
                "project",
                "name description status"
            )
            .populate(
                "domain",
                "name"
            )
            .sort({
                createdAt: -1
            });

        assignments = assignments.filter(
            assignment => assignment.project
        );

        console.log(assignments);

        res.json(assignments);
    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};