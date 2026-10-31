import apiClient from "../../../services/apiClient";

export const registerApi = (data) => apiClient.post("/auth/register", data);
export const loginApi = (data) => apiClient.post("/auth/login", data);
export const googleLoginApi = (token) => apiClient.post("/auth/google", { token });
export const logoutApi = () => apiClient.post("/auth/logout");
export const getMeApi = () => apiClient.get("/auth/me");
export const updateProfileApi = (data) => apiClient.patch("/auth/update-profile", data);
export const changePasswordApi = (data) => apiClient.post("/auth/change-password", data);