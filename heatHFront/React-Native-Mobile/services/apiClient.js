import axios from 'axios';
import {getAccessToken, refreshToken, logout} from './authService';

// Replace with your backend base URL
const apiClient = axios.create({
  baseURL: 'http://167.172.162.159:8080/api',
});

// Attach access token to every request
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken(); // Async in RN
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses by attempting token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await refreshToken(); // Refresh both tokens
        const newToken = await getAccessToken();
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return apiClient(originalRequest); // Retry the original request
      } catch (refreshError) {
        await logout();
        
        // 🔴 You should redirect to login screen here
        console.log('Redirect to login screen needed.');

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
