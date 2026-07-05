import api from "../services/api"

export const loginUser = (data) => api.post("/auth/login", data)

export const createUser = (data) => api.post("/auth/create-user", data)