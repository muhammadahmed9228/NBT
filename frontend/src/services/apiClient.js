import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Required for HTTP-only cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor to format errors cleanly
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || "An unexpected error occurred.";
    return Promise.reject({
      message,
      statusCode: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default apiClient;