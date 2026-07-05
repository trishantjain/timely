import mongoose from "mongoose";

const projectTaskSchema = new mongoose.Schema(
    {
        // Reference to original template task
        templateTaskId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        displayOrder: {
            type: Number,
            default: 1
        },

        required: {
            type: Boolean,
            default: true
        },

        submissionRule: {
            type: {
                type: String,
                enum: [
                    "TEXT",
                    "DOCUMENT",
                    "PDF",
                    "IMAGE",
                    "ZIP",
                    "EXCEL",
                    "MULTIPLE"
                ],
                default: "TEXT"
            },

            allowedExtensions: {
                type: [String],
                default: []
            },

            maxFiles: {
                type: Number,
                default: 1
            },

            maxFileSizeMB: {
                type: Number,
                default: 10
            }
        },

        assignedEmployee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        deadline: {
            type: Date,
            default: null
        },

        submissionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Submission",
            default: null
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "IN_PROGRESS",
                "SUBMITTED",
                "UNDER_REVIEW",
                "APPROVED",
                "REJECTED"
            ],
            default: "PENDING"
        }
    },
    {
        _id: true
    }
);

const projectComponentSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        projectModule: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProjectModule",
            required: true
        },

        componentTemplate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ComponentTemplate",
            required: true
        },

        name: {
            type: String,
            required: true
        },

        description: {
            type: String,
            default: ""
        },

        tasks: {
            type: [projectTaskSchema],
            default: []
        },

        status: {
            type: String,
            enum: [
                "NOT_STARTED",
                "IN_PROGRESS",
                "COMPLETED"
            ],
            default: "NOT_STARTED"
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

projectComponentSchema.index({
    project: 1,
    componentTemplate: 1
});

export default mongoose.model(
    "ProjectComponent",
    projectComponentSchema
);