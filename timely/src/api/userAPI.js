import api from "../services/api"

export const getUsers = () => api.get("/auth/users")