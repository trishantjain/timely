import mongoose from "mongoose"

const taskSchema = new mongoose.Schema({

    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },

    title: String,
    description: String,

    assigned_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
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
    },

    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },

    due_date: Date,

    updates: [
        {
            user_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            type: {
                type: String,
                enum: ["comment", "status_change", "description_update"]
            },
            message: String,
            created_at: {
                type: Date,
                default: Date.now
            }
        }
    ],

    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    reminders: [
        {
            scheduled_time: Date,

            sent: {
                type: Boolean,
                default: false
            },

            sent_at: Date
        }
    ],

    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },

    completed_at: Date

}, { timestamps: true })

taskSchema.index({ project_id: 1 })
taskSchema.index({ assigned_to: 1 })
taskSchema.index({ status: 1 })
taskSchema.index({ due_date: 1 })

export default mongoose.model("Task", taskSchema)