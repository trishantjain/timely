import mongoose from "mongoose";

const projectModuleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },

        description: {
            type: String,
            default: ""
        },

        color: {
            type: String,
            default: "#2563eb"
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


// Prevent duplicate active modules
projectModuleSchema.index(
    { name: 1 },
    { unique: true }
);

export default mongoose.model("ProjectModule", projectModuleSchema);