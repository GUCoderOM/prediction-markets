import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3001",
  withCredentials: false, // we use Authorization header, not cookies
});

// Automatically attach token if it exists
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle unauthorized responses (token expired or invalid)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    }
    throw err;
  }
);