import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '@/constants/config';
import { storage } from '@/utils/storage';

// Create axios instance similar to web app
const client: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach access token
client.interceptors.request.use(async (axiosConfig: InternalAxiosRequestConfig) => {
  const token = await storage.getItem('accessToken');
  if (token) {
    axiosConfig.headers = axiosConfig.headers ?? {};
    axiosConfig.headers.Authorization = `Bearer ${token}`;
  }
  return axiosConfig;
});

// Response interceptor: handle 401 with refresh flow similar to web
client.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config || {};
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { authService } = await import('./authService');
        await authService.refreshToken();
        const newToken = await storage.getItem('accessToken');
        if (newToken) {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        }
        return client(originalRequest);
      } catch (refreshError) {
        await storage.removeItem('accessToken');
        await storage.removeItem('refreshToken');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Export a simple API like the existing one but returning parsed data (like web)
export const apiClient = {
  get: async <T>(
    url: string,
    optionsOrToken?: { headers?: Record<string, string>; params?: Record<string, any> } | string
  ): Promise<T> => {
    const headers =
      typeof optionsOrToken === 'string'
        ? { Authorization: `Bearer ${optionsOrToken}` }
        : optionsOrToken?.headers;
    const params = typeof optionsOrToken === 'object' ? optionsOrToken?.params : undefined;
    const res = await client.get<T>(url, { headers, params });
    return res.data;
  },
  post: async <T>(
    url: string,
    data?: any,
    optionsOrToken?: { headers?: Record<string, string>; params?: Record<string, any> } | string
  ): Promise<T> => {
    const headers =
      typeof optionsOrToken === 'string'
        ? { Authorization: `Bearer ${optionsOrToken}` }
        : optionsOrToken?.headers;
    const params = typeof optionsOrToken === 'object' ? optionsOrToken?.params : undefined;
    const res = await client.post<T>(url, data, { headers, params });
    return res.data;
  },
  put: async <T>(
    url: string,
    data?: any,
    optionsOrToken?: { headers?: Record<string, string>; params?: Record<string, any> } | string
  ): Promise<T> => {
    const headers =
      typeof optionsOrToken === 'string'
        ? { Authorization: `Bearer ${optionsOrToken}` }
        : optionsOrToken?.headers;
    const params = typeof optionsOrToken === 'object' ? optionsOrToken?.params : undefined;
    const res = await client.put<T>(url, data, { headers, params });
    return res.data;
  },
  delete: async <T>(
    url: string,
    optionsOrToken?: { headers?: Record<string, string>; params?: Record<string, any> } | string
  ): Promise<T> => {
    const headers =
      typeof optionsOrToken === 'string'
        ? { Authorization: `Bearer ${optionsOrToken}` }
        : optionsOrToken?.headers;
    const params = typeof optionsOrToken === 'object' ? optionsOrToken?.params : undefined;
    const res = await client.delete<T>(url, { headers, params });
    return res.data;
  },
};

export default client;

// Saved-recipe helper functions for convenience (parity with web apiClient)
export const checkIfRecipeSaved = async (recipeId: number): Promise<boolean> => {
  try {
    const saved = await apiClient.get<Array<{ recipeId: number }>>('/saved-recipes/get');
    return saved.some((r) => r.recipeId === recipeId);
  } catch (error) {
    return false;
  }
};

export const saveRecipe = async (recipeId: number) => {
  return apiClient.post('/saved-recipes/save', { recipeId });
};

export const unsaveRecipe = async (recipeId: number) => {
  return apiClient.post('/saved-recipes/unsave', { recipeId });
};
