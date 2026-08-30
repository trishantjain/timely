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

export const getPendingReviews = () => api.get("/submissions/pending");
