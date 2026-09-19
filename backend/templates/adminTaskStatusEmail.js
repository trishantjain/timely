import { renderEmailLayout, escapeHtml } from "./layout.js";

// Presentation-only labels/colours for the statuses that already exist
// in projectTaskSchema.status -- no new status is introduced here.
const STATUS_LABELS = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const STATUS_COLORS = {
  PENDING: "#6b7280",
  IN_PROGRESS: "#2563eb",
  SUBMITTED: "#7c3aed",
  UNDER_REVIEW: "#d97706",
  APPROVED: "#059669",
  REJECTED: "#dc2626",
};

const SUBMISSION_LABELS = {
  NOT_SUBMITTED: "Not submitted",
  UNDER_REVIEW: "Awaiting review",
  APPROVED: "Review approved",
  REJECTED: "Review rejected",
};

const formatDate = (date) => {
  if (!date) return "No due date";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "No due date";
  return parsed.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const statusBadge = (status) => {
  const label = STATUS_LABELS[status] || status || "—";
  const color = STATUS_COLORS[status] || "#6b7280";
  return `<span style="color:${color}; font-weight:bold;">${escapeHtml(label)}</span>`;
};

// employees: [{
//   employeeId, employeeName, employeeUrl,
//   projects: [{ projectName, tasks: [{ taskTitle, componentName, status,
//                deadline, submissionStatus, submissionVersion,
//                subtaskTotal, subtaskCompleted, taskUrl }] }]
// }]
export const buildAdminTaskStatusEmail = ({
  employees,
  slot,
  reportDate,
  dashboardUrl,
}) => {
  const totalTasks = employees.reduce(
    (sum, employee) =>
      sum +
      employee.projects.reduce((s, project) => s + project.tasks.length, 0),
    0,
  );

  const subject = `TIMELY — All Employee Task Status (${reportDate} ${slot})`;

  const employeeSections = employees
    .map((employee) => {
      const projectBlocks = employee.projects
        .map((project) => {
          const rows = project.tasks
            .map((task) => {
              const subtaskNote =
                task.subtaskTotal > 0
                  ? ` <span style="color:#9ca3af;">(${task.subtaskCompleted}/${task.subtaskTotal} subtasks)</span>`
                  : "";

              const submissionNote = task.submissionStatus
                ? `${escapeHtml(
                    SUBMISSION_LABELS[task.submissionStatus] ||
                      task.submissionStatus,
                  )}${task.submissionVersion ? ` (v${task.submissionVersion})` : ""}`
                : "—";

              return `
                <tr>
                  <td style="padding:8px 8px 8px 0; border-bottom:1px solid #f3f4f6; font-size:13px; color:#111827;">
                    <a href="${task.taskUrl}" style="color:#2563eb; text-decoration:none; font-weight:bold;">${escapeHtml(task.taskTitle)}</a>${subtaskNote}
                    <div style="color:#9ca3af; font-size:12px;">${escapeHtml(task.componentName)}</div>
                  </td>
                  <td style="padding:8px; border-bottom:1px solid #f3f4f6; font-size:13px; white-space:nowrap;">${statusBadge(task.status)}</td>
                  <td style="padding:8px; border-bottom:1px solid #f3f4f6; font-size:13px; color:#374151; white-space:nowrap;">${escapeHtml(formatDate(task.deadline))}</td>
                  <td style="padding:8px 0 8px 8px; border-bottom:1px solid #f3f4f6; font-size:13px; color:#374151;">${submissionNote}</td>
                </tr>
              `;
            })
            .join("");

          return `
            <p style="margin:14px 0 4px 0; font-size:13px; font-weight:bold; color:#111827;">${escapeHtml(project.projectName)}</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr>
                <th align="left" style="padding:0 8px 6px 0; font-size:11px; text-transform:uppercase; color:#9ca3af;">Task</th>
                <th align="left" style="padding:0 8px 6px 8px; font-size:11px; text-transform:uppercase; color:#9ca3af;">Status</th>
                <th align="left" style="padding:0 8px 6px 8px; font-size:11px; text-transform:uppercase; color:#9ca3af;">Deadline</th>
                <th align="left" style="padding:0 0 6px 8px; font-size:11px; text-transform:uppercase; color:#9ca3af;">Review</th>
              </tr>
              ${rows}
            </table>
          `;
        })
        .join("");

      return `
        <div style="margin-top:24px; padding-top:16px; border-top:2px solid #e5e7eb;">
          <p style="margin:0; font-size:15px; font-weight:bold; color:#111827;">
            <a href="${employee.employeeUrl}" style="color:#111827; text-decoration:none;">${escapeHtml(employee.employeeName)}</a>
          </p>
          ${projectBlocks}
        </div>
      `;
    })
    .join("");

  const bodyHtml = `
    <p>Task status across all employees as of ${escapeHtml(reportDate)} (${escapeHtml(slot)} report).</p>
    <p style="color:#6b7280;">${employees.length} employee${employees.length === 1 ? "" : "s"} · ${totalTasks} task${totalTasks === 1 ? "" : "s"}</p>
    ${employeeSections}
  `;

  const html = renderEmailLayout({
    title: "All Employee Task Status",
    bodyHtml,
    ctaLabel: "Open Admin Dashboard",
    ctaUrl: dashboardUrl,
  });

  return { subject, html };
};

export default { buildAdminTaskStatusEmail };
