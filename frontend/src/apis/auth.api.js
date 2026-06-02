import { apiClient } from "./client.js";

export const registerApi = (data) => apiClient.post("/auth/register", data);

export const loginApi = (data) => apiClient.post("/auth/login", data);

export const getMeApi = () => apiClient.get("/auth/me");
