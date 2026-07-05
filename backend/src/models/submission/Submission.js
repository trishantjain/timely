import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        projectComponent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProjectComponent",
            required: true
        },

        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        // assignedProjectMember: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "ProjectMember",
        //     required: true
        // },

        assignedEmployee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        currentVersion: {
            type: Number,
            default: 0
        },

        status: {
            type: String,
            enum: [
                "NOT_SUBMITTED",
                "UNDER_REVIEW",
                "APPROVED",
                "REJECTED"
            ],
            default: "NOT_SUBMITTED"
        },

        latestSubmission: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubmissionVersion",
            default: null
        }

    },
    {
        timestamps: true
    }
);


submissionSchema.index({
    projectComponent: 1,
    taskId: 1,
    assignedEmployee: 1
},
    {
        unique: true
    });

export default mongoose.model(
    "Submission",
    submissionSchema
);