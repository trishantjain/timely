import mongoose from "mongoose";

// =========================================
// NOTIFICATION LOG
//
// A lightweight idempotency ledger for outgoing email notifications.
// Rather than adding a queue/job-tracking system, a single small
// collection with a unique (type, dedupeKey) index is enough to make
// sure:
//
//   - Retrying the same "assign task" request twice never sends two
//     "new task assigned" emails for the same task/employee pairing.
//   - If the backend restarts right at 9:00 AM/PM, or (in a future
//     multi-process deployment) two processes both fire the cron job
//     for the same slot, only one pending-tasks digest per employee
//     per day/slot is ever sent.
//
// Callers insert a row BEFORE sending the email; a duplicate-key
// error (11000) means "already handled" and the caller skips sending.
// =========================================
const notificationLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["TASK_ASSIGNED", "PENDING_DIGEST"],
      required: true,
    },

    // Uniquely identifies "this exact notification" within its type,
    // e.g. `${taskId}:${employeeId}` for TASK_ASSIGNED, or
    // `${date}:${slot}:${employeeId}` for PENDING_DIGEST.
    dedupeKey: {
      type: String,
      required: true,
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

notificationLogSchema.index({ type: 1, dedupeKey: 1 }, { unique: true });

export default mongoose.model("NotificationLog", notificationLogSchema);
