import mongoose from "mongoose"

const projectSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    default: ""
  },

  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  members: [
    {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      role: {
        type: String,
        enum: ["admin", "member"],
        default: "member"
      }
    }
  ],

  status: {
    type: String,
    enum: ["active", "closed"],
    default: "active"
  },

  closed_at: Date

}, { timestamps: true })

projectSchema.index({ "members.user_id": 1 })

export default mongoose.model("Project", projectSchema)