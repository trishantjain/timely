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
  }],

  // =========================================
  // EMAIL VERIFICATION
  // =========================================
  emailVerified: {
    type: Boolean,
    default: false
  },

  // Only the SHA-256 hash of the verification token is stored (never
  // the raw token) so a database leak alone can't be used to verify
  // an email — matches how a password reset token would be handled.
  emailVerificationTokenHash: {
    type: String,
    default: null,
    select: false
  },

  emailVerificationExpires: {
    type: Date,
    default: null,
    select: false
  },

  // Lets the resend-verification endpoint apply a cooldown without a
  // separate rate-limiting store — reused instead of adding infra.
  emailVerificationLastSentAt: {
    type: Date,
    default: null,
    select: false
  }

}, { timestamps: true })

export default mongoose.model("User", userSchema)