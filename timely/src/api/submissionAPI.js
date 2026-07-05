import api from "@/services/api";

// ===================================
// SUBMISSIONS
// ===================================

export const submitTask = (data) =>
    api.post("/submissions/submit", data);

export const reviewSubmission = (
    submissionId,
    data
) =>
    api.patch(
        `/submissions/${submissionId}/review`,
        data
    );

export const getSubmissionHistory = (
    submissionId
) =>
    api.get(
        `/submissions/${submissionId}/history`
    );

export const getPendingReviews = () =>
    api.get("/submissions/pending");
