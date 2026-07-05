import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["admin", "employee"],
    default: "employee"
  },

  expertise: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Domain"
  }]

}, { timestamps: true })

export default mongoose.model("User", userSchema)