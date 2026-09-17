import api from "@/services/api";

// ===================================
// SUBMISSIONS
// ===================================

export const submitTask = async ({
  projectComponentId,
  taskId,
  textSubmission = "",
  files = [],
  supportingPdfs = [],
}) => {
  const formData = new FormData();

  formData.append("projectComponentId", projectComponentId);

  formData.append("taskId", taskId);

  formData.append("textSubmission", textSubmission);

  // Main task submission files
  files.forEach((file) => {
    formData.append("files", file);
  });

  // Optional supporting PDF
  supportingPdfs.forEach((file) => {
    formData.append("supportingPdf", file);
  });

  return api.post("/submissions/submit", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const reviewSubmission = (submissionId, data) =>
  api.patch(`/submissions/${submissionId}/review`, data);

// Admin uploads a revision document against an employee's submission.
export const uploadAdminRevision = async (submissionId, { remark = "", files = [] }) => {
  const formData = new FormData();

  formData.append("remark", remark);

  files.forEach((file) => {
    formData.append("files", file);
  });

  return api.post(`/submissions/${submissionId}/admin-revision`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getSubmissionHistory = (submissionId) =>
  api.get(`/submissions/${submissionId}/history`);

// projectId is optional — omit it for the workspace-wide pending
// reviews list, or pass it to scope the same endpoint/query to a
// single project (used by the project-level Review Tasks tab).
// Employee's own submitted documents for a project (Documents tab).
export const getMyProjectSubmissions = (projectId) =>
  api.get(`/submissions/project/${projectId}/mine`);

export const getPendingReviews = (projectId) =>
  api.get("/submissions/pending", {
    params: projectId ? { projectId } : undefined,
  });
