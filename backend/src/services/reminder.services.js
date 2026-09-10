import User from "../models/auth/User.js";
import NotificationLog from "../models/NotificationLog.js";
import { getPendingTasksGroupedByEmployeeIds } from "./taskQuery.service.js";
import { sendEmail } from "./email.service.js";
import { buildPendingTasksEmail } from "../../templates/pendingTasksEmail.js";
import { APP_URL } from "../config/email.js";
import logger from "../utils/logger.js";

// YYYY-MM-DD for "today" in Asia/Kolkata, used as part of the dedupe
// key so a restart mid-run (or, in a future multi-process deployment,
// two processes both waking up for the same cron tick) never sends
// the same employee two digests for the same day/slot.
const getKolkataDateString = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

// =========================================
// RUN PENDING TASK DIGEST
//
// slot: "AM" | "PM" -- identifies which of the two daily runs this is,
// purely for the dedupe key and logging (the actual send time is
// controlled by the cron schedule, not by this function).
// =========================================
export const runPendingTaskDigest = async (slot) => {
  const employees = await User.find({ role: "employee", emailVerified: true })
    .select("username email")
    .lean();

  if (!employees.length) {
    logger.info("reminder", `Pending-task digest (${slot}): no verified employees, nothing to do.`);
    return;
  }

  const employeeIds = employees.map((e) => e._id);
  const groupedByEmployee = await getPendingTasksGroupedByEmployeeIds(employeeIds);
  const today = getKolkataDateString();

  let sent = 0;
  let skippedNoPending = 0;
  let skippedDuplicate = 0;
  let failed = 0;

  for (const employee of employees) {
    const employeeId = employee._id.toString();
    const employeeProjects = groupedByEmployee.get(employeeId);

    // No pending tasks at all -- don't send an empty/zero-task email.
    if (!employeeProjects || employeeProjects.size === 0) {
      skippedNoPending += 1;
      // eslint-disable-next-line no-continue
      continue;
    }

    const dedupeKey = `${today}:${slot}:${employeeId}`;

    try {
      await NotificationLog.create({
        type: "PENDING_DIGEST",
        dedupeKey,
        employee: employeeId,
      });
    } catch (err) {
      if (err?.code === 11000) {
        skippedDuplicate += 1;
        // eslint-disable-next-line no-continue
        continue;
      }
      logger.error("reminder", `Failed to record digest log for ${employee.email}`, err);
      failed += 1;
      // eslint-disable-next-line no-continue
      continue;
    }

    try {
      const { subject, html } = buildPendingTasksEmail({
        employeeName: employee.username,
        projects: Array.from(employeeProjects.values()),
        tasksUrl: `${APP_URL}/employee/tasks`,
      });

      const result = await sendEmail({ to: employee.email, subject, html });

      if (result.success) {
        sent += 1;
      } else {
        failed += 1;
        logger.error("reminder", `Pending-task digest not sent to ${employee.email}`, result.error);
      }
    } catch (err) {
      // One employee's failure (bad data, unexpected error) must never
      // stop the rest of the run.
      failed += 1;
      logger.error("reminder", `Unexpected error building/sending digest for ${employee.email}`, err);
    }
  }

  logger.info(
    "reminder",
    `Pending-task digest (${slot}) complete: sent=${sent}, no-pending=${skippedNoPending}, duplicate=${skippedDuplicate}, failed=${failed}`,
  );
};

export default { runPendingTaskDigest };
