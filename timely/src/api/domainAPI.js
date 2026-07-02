import api from "../services/api";

export const getDomains = () => api.get("/domains");

export const createDomain = (data) =>
    api.post("/domains", data);