import api from "../services/api"

export const loginUser = (data) => api.post("/auth/login", data)

export const createUser = (data) => api.post("/auth/create-user", data)

export const verifyEmail = (token) => api.post("/auth/verify-email", { token })

export const resendVerification = () => api.post("/auth/resend-verification")