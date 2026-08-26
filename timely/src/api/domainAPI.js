import api from "../services/api";

export const getDomains = () => {
  return api.get("/domains");
};

export const getDomainById = (id) => {
  return api.get(`/domains/${id}`);
};

export const createDomain = (data) => {
  return api.post("/domains", data);
};

export const updateDomain = (id, data) => {
  return api.patch(`/domains/${id}`, data);
};
