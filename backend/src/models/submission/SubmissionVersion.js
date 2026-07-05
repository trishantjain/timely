import mongoose from "mongoose";

const submissionVersionSchema = new mongoose.Schema(
    {

        submission: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Submission",
            required: true
        },

        version: {
            type: Number,
            required: true
        },

        textSubmission: {
            type: String,
            default: ""
        },

        files: [
            {
                originalName: String,
                storedName: String,
                path: String,
                mimeType: String,
                size: Number
            }
        ],

        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        submittedAt: {
            type: Date,
            default: Date.now
        },

        reviewStatus: {
            type: String,
            enum: [
                "PENDING",
                "APPROVED",
                "REJECTED"
            ],
            default: "PENDING"
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        reviewedAt: {
            type: Date,
            default: null
        },

        reviewRemark: {
            type: String,
            default: ""
        }

    },
    {
        timestamps: true
    }
);

export default mongoose.model(
    "SubmissionVersion",
    submissionVersionSchema
);