import mongoose from "mongoose";

const submissionLogSchema = new mongoose.Schema(
    {

        submission: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Submission",
            required: true
        },

        version: {
            type: Number
        },

        action: {
            type: String,
            enum: [
                "CREATED",
                "SUBMITTED",
                "APPROVED",
                "REJECTED",
                "RESUBMITTED"
            ],
            required: true
        },

        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        remarks: {
            type: String,
            default: ""
        }

    },
    {
        timestamps: true
    }
);

export default mongoose.model(
    "SubmissionLog",
    submissionLogSchema
);