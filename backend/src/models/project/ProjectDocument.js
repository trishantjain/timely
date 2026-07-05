import mongoose from "mongoose";

const projectDocumentSchema = new mongoose.Schema(
{
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },

    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
        required: true
    },

    documentType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DocumentType",
        required: true
    },

    status: {
        type: String,
        enum: [
            "pending",
            "in_progress",
            "submitted",
            "approved",
            "rejected"
        ],
        default: "pending"
    },

    generatedContent: {
        type: String,
        default: ""
    },

    adminRemarks: {
        type: String,
        default: ""
    },

    submittedAt: Date,

    approvedAt: Date
},
{
    timestamps: true
});

projectDocumentSchema.index({ assignment: 1 });
projectDocumentSchema.index({ project: 1 });
projectDocumentSchema.index({ documentType: 1 });

export default mongoose.model(
    "ProjectDocument",
    projectDocumentSchema
);