import api from "@/services/api";

export const assignDocuments = (data) =>
    api.post("/project-documents/assign", data);