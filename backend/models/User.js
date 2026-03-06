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
    enum: ["admin", "user"],
    default: "user"
  }

}, { timestamps: true })

userSchema.index({ email: 1 }, { unique: true })

export default mongoose.model("User", userSchema)