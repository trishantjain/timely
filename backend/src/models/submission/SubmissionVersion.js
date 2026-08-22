import mongoose from "mongoose";

const submissionFileSchema = new mongoose.Schema(
    {
        originalName: {
            type: String,
            required: true
        },

        publicId: {
            type: String,
            required: true
        },

        url: {
            type: String,
            required: true
        },

        secureUrl: {
            type: String,
            required: true
        },

        resourceType: {
            type: String,
            default: "raw"
        },

        mimeType: {
            type: String,
            default: ""
        },

        size: {
            type: Number,
            default: 0
        }
    },
    {
        _id: false
    }
);

const submissionVersionSchema = new mongoose.Schema(
    {
        submission: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Submission",
            required: true,
            index: true
        },

        version: {
            type: Number,
            required: true
        },

        textSubmission: {
            type: String,
            default: ""
        },

        files: {
            type: [submissionFileSchema],
            default: []
        },

        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
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

        reviewRemark: {
            type: String,
            default: ""
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        reviewedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

submissionVersionSchema.index(
    {
        submission: 1,
        version: 1
    },
    {
        unique: true
    }
);

export default mongoose.model(
    "SubmissionVersion",
    submissionVersionSchema
);