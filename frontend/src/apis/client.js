import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const apiClient = axios.create({
   baseURL: BASE_URL,
   headers: {
      "Content-Type": "application/json",
   },
});

apiClient.interceptors.request.use(
   (config) => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      if (token) {
         config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
   },
   (error) => {
      return Promise.reject(error);
   },
);

function clearAuthStorage() {
   localStorage.removeItem("token");
   sessionStorage.removeItem("token");
   localStorage.removeItem("user");
   sessionStorage.removeItem("user");
}

apiClient.interceptors.response.use(
   (response) => response,
   (error) => {
      if (
         error.response &&
         (error.response.status === 401 || error.response.status === 403)
      ) {
         const requestUrl = error.config?.url || "";
         const isBootstrapMe = requestUrl.includes("/auth/me");
         const isOnAuthPage = window.location.pathname === "/auth";

         clearAuthStorage();

         if (!isBootstrapMe && !isOnAuthPage) {
            window.location.href = "/auth";
         }
      }
      return Promise.reject(error);
   },
);
