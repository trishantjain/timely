import { renderEmailLayout, escapeHtml } from "./layout.js";

const formatDate = (date) => {
  if (!date) return "No due date set";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "No due date set";
  return parsed.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatStatus = (status) => {
  if (!status) return "Pending";
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const row = (label, value) => `
  <tr>
    <td style="padding:4px 0; color:#6b7280; width:110px; vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:4px 0; color:#111827;">${escapeHtml(value)}</td>
  </tr>
`;

// employeeName, projectName, componentName, taskTitle, deadline, status, taskUrl
export const buildNewTaskEmail = ({
  employeeName,
  projectName,
  componentName,
  taskTitle,
  deadline,
  status,
  taskUrl,
}) => {
  const subject = `New task assigned: ${taskTitle} — TIMELY`;

  const bodyHtml = `
    <p>Hello ${escapeHtml(employeeName)},</p>
    <p>You've been assigned a new task in TIMELY. Here are the details:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; margin-top:8px;">
      ${row("Project", projectName)}
      ${componentName ? row("Component", componentName) : ""}
      ${row("Task", taskTitle)}
      ${row("Due Date", formatDate(deadline))}
      ${row("Status", formatStatus(status))}
    </table>
  `;

  const html = renderEmailLayout({
    title: "New Task Assigned",
    bodyHtml,
    ctaLabel: "Open Task in TIMELY",
    ctaUrl: taskUrl,
  });

  return { subject, html };
};

export default { buildNewTaskEmail };
