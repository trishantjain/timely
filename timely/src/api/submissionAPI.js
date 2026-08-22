// import api from "@/services/api";

// // ===================================
// // SUBMISSIONS
// // ===================================

// export const submitTask = (data) =>
//     api.post("/submissions/submit", data);

// export const reviewSubmission = (
//     submissionId,
//     data
// ) =>
//     api.patch(
//         `/submissions/${submissionId}/review`,
//         data
//     );

// export const getSubmissionHistory = (
//     submissionId
// ) =>
//     api.get(
//         `/submissions/${submissionId}/history`
//     );

// export const getPendingReviews = () =>
//     api.get("/submissions/pending");
// m
 

// ==== GPT ====

import api from "@/services/api";

// ===================================
// SUBMISSIONS
// ===================================

export const submitTask = async ({
    projectComponentId,
    taskId,
    textSubmission = "",
    files = []
}) => {

    const formData = new FormData();

    formData.append(
        "projectComponentId",
        projectComponentId
    );

    formData.append(
        "taskId",
        taskId
    );

    formData.append(
        "textSubmission",
        textSubmission
    );

    files.forEach(file => {
        formData.append("files", file);
    });

    return api.post(
        "/submissions/submit",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );
};

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