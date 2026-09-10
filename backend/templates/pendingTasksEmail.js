import { renderEmailLayout, escapeHtml } from "./layout.js";

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

// projects: [{ projectName, tasks: [{ taskTitle, deadline }] }]
export const buildPendingTasksEmail = ({ employeeName, projects, tasksUrl }) => {
  const totalTasks = projects.reduce((sum, project) => sum + project.tasks.length, 0);

  const subject = "TIMELY — Your Pending Tasks";

  const projectSections = projects
    .map((project) => {
      const items = project.tasks
        .map(
          (task) => `
            <li style="margin-bottom:4px;">
              ${escapeHtml(task.taskTitle)} — Due ${escapeHtml(formatDate(task.deadline))}
            </li>
          `,
        )
        .join("");

      return `
        <p style="margin:16px 0 4px 0; font-weight:bold; color:#111827;">${escapeHtml(project.projectName)}</p>
        <ul style="margin:0; padding-left:20px; color:#374151;">${items}</ul>
      `;
    })
    .join("");

  const bodyHtml = `
    <p>Hello ${escapeHtml(employeeName)},</p>
    <p>You currently have ${totalTasks} pending task${totalTasks === 1 ? "" : "s"} in TIMELY.</p>
    ${projectSections}
  `;

  const html = renderEmailLayout({
    title: "Your Pending Tasks",
    bodyHtml,
    ctaLabel: "View My Tasks",
    ctaUrl: tasksUrl,
  });

  return { subject, html };
};

export default { buildPendingTasksEmail };
