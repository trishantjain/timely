import mongoose from "mongoose";

const projectMemberSchema = new mongoose.Schema(

    {

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        domain: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Domain",
            required: true
        },

        status: {
            type: String,
            enum: [
                "assigned",
                "in_progress",
                "completed"
            ],
            default: "assigned"
        }

    },

    {
        timestamps: true
    }

);

export default mongoose.model(
    "ProjectMember",
    projectMemberSchema
);

