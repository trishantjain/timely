// Single source of truth for what counts as "pending employee action"
// across the app (project-scoped pending-tasks view, the daily digest
// email job, etc). A task is pending action by its assignee when it
// hasn't been started/finished yet (PENDING/IN_PROGRESS), or it was
// reviewed and sent back for rework (REJECTED). SUBMITTED/UNDER_REVIEW
// are waiting on the admin/reviewer, and APPROVED is done, so neither
// belongs here.
export const EMPLOYEE_ACTION_PENDING_STATUSES = ["PENDING", "IN_PROGRESS", "REJECTED"];
