import cron from "node-cron";
import { runPendingTaskDigest } from "../services/reminder.services.js";
import logger from "../utils/logger.js";

// TIMELY is currently operated in India; Asia/Kolkata is used
// explicitly (rather than the server's local time) so the 9AM/9PM
// schedule is correct regardless of what timezone the host machine is
// actually running in.
const TIMEZONE = process.env.SCHEDULER_TIMEZONE || "Asia/Kolkata";

// Runs on the backend/server via node-cron -- not dependent on React,
// browser timers, or a user keeping a tab open. Duplicate-send
// protection (if the process restarts near a scheduled tick, or if
// this is ever run as more than one process) lives in
// runPendingTaskDigest via the NotificationLog unique index, not here.
export const startReminderScheduler = () => {
  cron.schedule(
    "0 9 * * *",
    () => {
      logger.info("scheduler", "Running 9:00 AM pending-task digest");
      runPendingTaskDigest("AM").catch((err) =>
        logger.error("scheduler", "9:00 AM pending-task digest failed", err),
      );
    },
    { timezone: TIMEZONE },
  );

  cron.schedule(
    "0 21 * * *",
    () => {
      logger.info("scheduler", "Running 9:00 PM pending-task digest");
      runPendingTaskDigest("PM").catch((err) =>
        logger.error("scheduler", "9:00 PM pending-task digest failed", err),
      );
    },
    { timezone: TIMEZONE },
  );

  logger.info("scheduler", `Pending-task digest scheduler started (timezone: ${TIMEZONE}).`);
};

export default startReminderScheduler;
