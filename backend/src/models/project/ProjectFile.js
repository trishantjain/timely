import mongoose from "mongoose";

// Files an admin uploads and shares with every employee assigned to
// a project (reference docs, test plans, guidelines, etc.) — distinct
// from Submission/SubmissionVersion, which are employee -> admin task
// deliverables.
const projectFileSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      default: "",
    },

    size: {
      type: Number,
      default: 0,
    },

    secureUrl: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },

    // Optional note the admin can attach — e.g. "See section 3 before
    // starting", shown alongside the file to employees.
    note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

projectFileSchema.index({ project: 1, createdAt: -1 });

export default mongoose.model("ProjectFile", projectFileSchema);
