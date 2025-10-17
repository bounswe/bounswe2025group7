import axios from 'axios';
import { storage } from '@/utils/storage';
import { config } from '@/constants/config';

// Create axios instance
const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to each request
apiClient.interceptors.request.use(async (cfg: any) => {
  const token = await storage.getItem('accessToken');
  cfg.headers = cfg.headers ?? {};
  if (token) {
    (cfg.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return cfg;
});

// Handle 401 by attempting token refresh once
apiClient.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest: any = error.config || {};
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { authService } = await import('./authService');
        await authService.refreshToken();
        const newToken = await storage.getItem('accessToken');
        originalRequest.headers = originalRequest.headers ?? {};
        (originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        await storage.removeItem('accessToken');
        await storage.removeItem('refreshToken');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export { apiClient };
