import mongoose from "mongoose";

const submissionRuleSchema = new mongoose.Schema(
    {

        type: {
            type: String,
            enum: [
                "TEXT",
                "FILE",
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
        },

        // ==========================================
        // DOCUMENT TEMPLATE VERIFICATION
        // ==========================================
        templateVerification: {

            enabled: {
                type: Boolean,
                default: false
            },

            templateFile: {

                originalName: {
                    type: String,
                    default: ""
                },

                publicId: {
                    type: String,
                    default: ""
                },

                url: {
                    type: String,
                    default: ""
                },

                secureUrl: {
                    type: String,
                    default: ""
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
                },

                uploadedAt: {
                    type: Date,
                    default: null
                }
            },

            // This will be generated later after
            // analyzing the reference PDF.
            templateProfile: {
                type: mongoose.Schema.Types.Mixed,
                default: null
            }

        }
    },
    {
        _id: false
    }
);

const taskSchema = new mongoose.Schema(

    {
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
            type: submissionRuleSchema,
            default: () => ({})
        }

    },

    {
        _id: true
    }
);

const componentTemplateSchema = new mongoose.Schema(

    {
        projectModule: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProjectModule",
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        tasks: {
            type: [taskSchema],
            default: []
        },

        isActive: {
            type: Boolean,
            default: true
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


export default mongoose.model(
    "ComponentTemplate",
    componentTemplateSchema
);

