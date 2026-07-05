import mongoose from "mongoose";

import Submission from "../../models/submission/Submission.js";
import SubmissionVersion from "../../models/submission/SubmissionVersion.js";
import SubmissionLog from "../../models/submission/SubmissionLog.js";

import ProjectComponent from "../../models/project/ProjectComponent.js";
import ProjectMember from "../../models/project/ProjectMember.js";


// ==========================================
// SUBMIT / RESUBMIT TASK
// ==========================================
export const submitTask = async (req, res) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    console.log("\n====================================");
    console.log("[Submission] Submit Task");
    console.log(req.body);
    console.log("====================================");

    try {
        const {
            projectComponentId,
            taskId,
            textSubmission
        } = req.body;

        const component = await ProjectComponent
            .findById(projectComponentId)
            .session(session);

        if (!component) {
            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({
                success: false,
                message: "Project Component not found."
            });
        }

        const task = component.tasks.id(taskId);

        if (!task) {
            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({
                success: false,
                message: "Task not found."
            });
        }

        if (
            task.submissionRule.type === "TEXT" &&
            (!textSubmission || textSubmission.trim() === "")
        ) {

            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success: false,
                message: "Text submission is required."
            });

        }


        if (!task.assignedEmployee) {
            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success: false,
                message: "Task not assigned."
            });
        }

        const projectMember = await ProjectMember.findOne({
            project: component.project,
            employee: req.user.id
        }).session(session);

        if (!projectMember) {
            await session.abortTransaction();
            session.endSession();

            return res.status(403).json({
                success: false,
                message: "You are not a member of this project."
            });
        }

        if (
            task.assignedEmployee.toString() !==
            req.user.id.toString()
        ) {
            await session.abortTransaction();
            session.endSession();

            return res.status(403).json({
                success: false,
                message: "Task is not assigned to you."
            });
        }

        let submission = await Submission.findOne({
            project: component.project,
            projectComponent: component._id,
            taskId,
            assignedEmployee: task.assignedEmployee

        }).session(session);

        console.log("===== CREATE SUBMISSION =====");
        console.log("task.assignedEmployee =", task.assignedEmployee);
        console.log("req.user.id =", req.user.id);
        console.log("=============================");

        if (!submission) {
            submission = await Submission.create([{
                project: component.project,
                projectComponent: component._id,
                taskId,
                assignedEmployee: task.assignedEmployee,
                currentVersion: 0
            }], { session });

            submission = submission[0];

            task.submissionId = submission._id;
        }
        console.log("Assigned submissionId:", task.submissionId);

        const versionNo = submission.currentVersion + 1;

        const version = await SubmissionVersion.create([{
            submission: submission._id,
            version: versionNo,
            textSubmission,
            submittedBy: req.user.id
        }], { session });

        submission.currentVersion = versionNo;
        submission.latestSubmission = version[0]._id;
        task.submissionId = submission._id;
        submission.status = "UNDER_REVIEW";

        console.log(
            component.tasks.id(task._id)
        );

        await submission.save({ session });

        task.status = "UNDER_REVIEW";

        const anyTaskStarted = component.tasks.some(
            task => task.status !== "PENDING"
        );

        if (anyTaskStarted) {
            component.status = "IN_PROGRESS";
        }

        await component.save({ session });

        const verify = await ProjectComponent.findById(component._id);

        console.log("===== AFTER SAVE =====");

        console.log(
            verify.tasks.id(task._id)
        );

        console.log("======================");

        await SubmissionLog.create([{
            submission: submission._id,
            version: versionNo,
            action:
                versionNo === 1
                    ? "SUBMITTED"
                    : "RESUBMITTED",

            performedBy: req.user.id
        }], { session });

        await session.commitTransaction();

        session.endSession();

        return res.status(201).json({
            success: true,
            message: "Submitted successfully."
        });
    }
    catch (err) {

        await session.abortTransaction();

        session.endSession();

        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }

};


// ==========================================
// REVIEW SUBMISSION
// ==========================================
export const reviewSubmission = async (req, res) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    console.log("\n====================================");
    console.log("[Submission] Review Submission");
    console.log(req.params);
    console.log(req.body);
    console.log("====================================");

    try {

        const { submissionId } = req.params;

        const {
            reviewStatus,
            reviewRemark
        } = req.body;

        if (!["APPROVED", "REJECTED"].includes(reviewStatus)) {

            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success: false,
                message: "Invalid review status."
            });

        }

        const submission = await Submission
            .findById(submissionId)
            .session(session);

        if (!submission) {

            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({
                success: false,
                message: "Submission not found."
            });

        }

        const version = await SubmissionVersion
            .findById(submission.latestSubmission)
            .session(session);

        if (!version) {
            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({
                success: false,
                message: "Submission version not found."
            });
        }

        version.reviewStatus = reviewStatus;
        version.reviewRemark = reviewRemark || "";
        version.reviewedBy = req.user.id;
        version.reviewedAt = new Date();

        await version.save({ session });

        submission.status = reviewStatus;

        await submission.save({ session });

        const component = await ProjectComponent
            .findById(submission.projectComponent)
            .session(session);

        if (!component) {
            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({
                success: false,
                message: "Project Component not found."
            });
        }

        const task = component.tasks.id(submission.taskId);

        if (!task) {
            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({
                success: false,
                message: "Task not found."
            });
        }

        task.status = reviewStatus;

        const allApproved = component.tasks.every(
            t => t.status === "APPROVED"
        );

        if (allApproved) {
            component.status = "COMPLETED";
        } else {
            component.status = "IN_PROGRESS";
        }

        await component.save({ session });

        await SubmissionLog.create([{
            submission: submission._id,
            version: version.version,
            action: reviewStatus,
            performedBy: req.user.id,
            remarks: reviewRemark || ""
        }], { session });

        await session.commitTransaction();

        session.endSession();

        return res.status(200).json({
            success: true,
            message: `Submission ${reviewStatus.toLowerCase()}successfully.`
        });
    }
    catch (err) {
        await session.abortTransaction();

        session.endSession();

        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }

};


// ==========================================
// GET SUBMISSION HISTORY
// ==========================================
export const getSubmissionHistory = async (req, res) => {

    console.log("\n====================================");
    console.log("[Submission] Get History");
    console.log("Submission ID:", req.params.submissionId);
    console.log("====================================");

    try {

        const { submissionId } = req.params;
        console.log("submission id: ", submissionId)

        const submission = await Submission.findById(submissionId);

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "Submission not found."
            });
        }

        console.log("Finding submissions: ", submission)

        const history = await SubmissionVersion.find({
            submission: submissionId
        })
            .populate("submittedBy", "username email")
            .populate("reviewedBy", "username email")
            .sort({
                version: -1
            });

        const component = await ProjectComponent.findById(
            submission.projectComponent
        ).populate("project", "name")
            .populate("projectModule", "name");

        const task = component.tasks.id(submission.taskId);

        return res.json({
            success: true,

            submission: {
                id: submission._id,
                currentVersion: submission.currentVersion,
                status: submission.status
            },

            project: {
                id: component.project._id,
                name: component.project.name
            },

            component: {
                id: component._id,
                name: component.name
            },

            module: {
                id: component.projectModule._id,
                name: component.projectModule.name
            },

            task: {
                id: task._id,
                title: task.title,
                description: task.description
            },

            latestSubmission: history[0],

            history
        });
    }
    catch (err) {

        console.error("[Submission] Get History Error");
        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};


export const getPendingReviews = async (req, res) => {

    try {

        const submissions = await Submission.find({
        })
        status: "UNDER_REVIEW"
            .populate("project", "name")
            .populate("projectComponent", "name")
            .populate("latestSubmission")
            .lean();
            
        return res.json({
            success: true,
            data: submissions
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};
