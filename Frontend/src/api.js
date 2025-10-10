import axios from "axios";

let currentUserType = "customer";

export const setCurrentUserType = (type) => {
  currentUserType = type;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve()));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      isRefreshing = true;

      try {
        const refreshEndpoint =
          currentUserType === "worker"
            ? "/api/v1/worker/refresh-token"
            : "/api/v1/customer/refresh-token";

        await axios.post(
          `${import.meta.env.VITE_API_URL}${refreshEndpoint}`,
          {},
          { withCredentials: true }
        );

        isRefreshing = false;
        processQueue(null);

        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);
        window.location.href =
          currentUserType === "worker" ? "/worker/" : "/customer/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
