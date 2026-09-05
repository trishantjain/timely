import mongoose from "mongoose";

// =========================================
// DAILY UPDATE
//
// A single model backs both flavours of daily update requested by the
// product:
//
//   1. TASK      - tied to a specific ProjectComponent task. Used for
//                  progress notes on that task (what was done, blockers,
//                  etc). Kept completely separate from Submission /
//                  SubmissionVersion (document review flow).
//
//   2. GENERAL   - not tied to any task. Free-form "what I worked on
//                  today" entries employees log from their dashboard.
//
// Keeping both in one collection avoids duplicating the "employee +
// content + timestamp" shape twice, while `type` lets every query
// (task history, admin general-updates feed, etc) filter cleanly.
// =========================================

const dailyUpdateSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["TASK", "GENERAL"],
      required: true,
    },

    // Author of the update. Always taken from the authenticated user
    // (req.user.id) in the controller — never trusted from the body.
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // -------- TASK-RELATED FIELDS (only set when type === "TASK") --------

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    projectComponent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectComponent",
      default: null,
    },

    // Tasks live as sub-documents on ProjectComponent.tasks, so this is
    // that sub-document's _id rather than a separate collection's ref.
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // -------- GENERAL UPDATE FIELDS (only set when type === "GENERAL") ----

    title: {
      type: String,
      trim: true,
      default: "",
    },

    // -------- SHARED --------

    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

dailyUpdateSchema.index({ projectComponent: 1, taskId: 1, createdAt: -1 });
dailyUpdateSchema.index({ type: 1, employee: 1, createdAt: -1 });

export default mongoose.model("DailyUpdate", dailyUpdateSchema);
