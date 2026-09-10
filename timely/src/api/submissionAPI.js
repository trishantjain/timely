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

export const getSubmissionHistory = (submissionId) =>
  api.get(`/submissions/${submissionId}/history`);

// projectId is optional — omit it for the workspace-wide pending
// reviews list, or pass it to scope the same endpoint/query to a
// single project (used by the project-level Review Tasks tab).
export const getPendingReviews = (projectId) =>
  api.get("/submissions/pending", {
    params: projectId ? { projectId } : undefined,
  });
