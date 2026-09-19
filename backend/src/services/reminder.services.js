import User from "../models/auth/User.js";
import NotificationLog from "../models/NotificationLog.js";
import {
  getPendingTasksGroupedByEmployeeIds,
  getAllTasksGroupedByEmployeeIds,
} from "./taskQuery.service.js";
import { sendEmail } from "./email.service.js";
import { buildPendingTasksEmail } from "../../templates/pendingTasksEmail.js";
import { buildAdminTaskStatusEmail } from "../../templates/adminTaskStatusEmail.js";
import { APP_URL } from "../config/email.js";
import logger from "../utils/logger.js";

// Fallback recipient for the admin digest. The admin User record is the
// preferred source (see resolveAdminRecipient); this only applies if no
// admin user exists / has no email. Overridable by env so a different
// deployment doesn't need a code change.
const ADMIN_DIGEST_EMAIL =
  process.env.ADMIN_DIGEST_EMAIL || "cto@technotrendz.co.in";

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

// =========================================
// RESOLVE ADMIN RECIPIENT
//
// Read-only: never creates or modifies the admin account. Prefers the
// admin User record whose email matches the configured digest address,
// falls back to any admin user, and finally to the configured address
// itself so the report is still delivered on a fresh/seeded database.
// =========================================
const resolveAdminRecipient = async () => {
  const admins = await User.find({ role: "admin" })
    .select("username email")
    .lean();

  const exactMatch = admins.find(
    (a) => a.email?.toLowerCase() === ADMIN_DIGEST_EMAIL.toLowerCase(),
  );

  const admin = exactMatch || admins.find((a) => a.email);

  return {
    email: admin?.email || ADMIN_DIGEST_EMAIL,
    name: admin?.username || "Admin",
  };
};

// =========================================
// RUN ADMIN TASK STATUS DIGEST
//
// Consolidated "status of every employee's tasks" report for the admin,
// sent on the same 9AM/9PM tick as the employee digest. Deliberately a
// separate function (not folded into runPendingTaskDigest) because the
// audience, the status filter (all statuses, not just pending) and the
// dedupe key differ -- but it shares the same scheduler, Resend
// transport, NotificationLog table and layout, so no parallel email
// infrastructure is introduced.
//
// Never throws: the scheduler calls this alongside the employee digest,
// and an admin-report failure must not break employee reminders.
// =========================================
export const runAdminTaskStatusDigest = async (slot) => {
  try {
    const employees = await User.find({ role: "employee" })
      .select("username email")
      .lean();

    if (!employees.length) {
      logger.info("reminder", `Admin task-status digest (${slot}): no employees, nothing to do.`);
      return;
    }

    const grouped = await getAllTasksGroupedByEmployeeIds(
      employees.map((e) => e._id),
    );

    // An employee with no assigned tasks is omitted rather than shown
    // as an empty block, keeping the report readable as headcount grows.
    const employeeSections = employees
      .filter((employee) => grouped.get(employee._id.toString())?.size)
      .map((employee) => {
        const employeeId = employee._id.toString();

        return {
          employeeId,
          employeeName: employee.username,
          employeeUrl: `${APP_URL}/admin/employees/${employeeId}`,
          projects: Array.from(grouped.get(employeeId).values()).map(
            (project) => ({
              projectName: project.projectName,
              tasks: project.tasks.map((task) => ({
                ...task,
                // Existing admin route: /admin/tasks/:componentId/:taskId
                // (AdminTaskDetails). Auth-protected, so no private
                // document is exposed by the link itself.
                taskUrl: `${APP_URL}/admin/tasks/${task.componentId}/${task.taskId}`,
              })),
            }),
          ),
        };
      });

    if (!employeeSections.length) {
      logger.info("reminder", `Admin task-status digest (${slot}): no assigned tasks, nothing to send.`);
      return;
    }

    const today = getKolkataDateString();
    const dedupeKey = `${today}:${slot}:ADMIN_TASK_STATUS`;

    // Same insert-before-send idempotency pattern as the employee
    // digest: a duplicate key means this slot was already handled.
    try {
      await NotificationLog.create({
        type: "ADMIN_STATUS_DIGEST",
        dedupeKey,
        employee: null,
      });
    } catch (err) {
      if (err?.code === 11000) {
        logger.info("reminder", `Admin task-status digest (${slot}) already sent today, skipping.`);
        return;
      }
      logger.error("reminder", "Failed to record admin digest log", err);
      return;
    }

    const admin = await resolveAdminRecipient();

    const { subject, html } = buildAdminTaskStatusEmail({
      employees: employeeSections,
      slot,
      reportDate: today,
      dashboardUrl: `${APP_URL}/admin`,
    });

    const result = await sendEmail({ to: admin.email, subject, html });

    if (result.success) {
      logger.info(
        "reminder",
        `Admin task-status digest (${slot}) sent to ${admin.email}: employees=${employeeSections.length}`,
      );
    } else {
      logger.error(
        "reminder",
        `Admin task-status digest (${slot}) not sent to ${admin.email}`,
        result.error,
      );
    }
  } catch (err) {
    logger.error("reminder", `Admin task-status digest (${slot}) failed`, err);
  }
};

export default { runPendingTaskDigest, runAdminTaskStatusDigest };
