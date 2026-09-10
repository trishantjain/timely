import api from "@/services/api";

export const listProjectFiles = (projectId) =>
  api.get(`/project-files/${projectId}/files`);

export const uploadProjectFile = (projectId, file, note) => {
  const formData = new FormData();

  formData.append("file", file);

  if (note) {
    formData.append("note", note);
  }

  return api.post(`/project-files/${projectId}/files`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteProjectFile = (fileId) =>
  api.delete(`/project-files/files/${fileId}`);

// These two return relative API paths (not calls) — the viewer
// components fetch them as blobs themselves (same pattern used for
// submission files), since the response needs responseType: "blob".
export const projectFileDownloadPath = (fileId) =>
  `/project-files/files/${fileId}/download`;

export const projectFilePreviewPdfPath = (fileId) =>
  `/project-files/files/${fileId}/preview-pdf`;
