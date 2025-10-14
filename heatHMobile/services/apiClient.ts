import { config } from '@/constants/config';
import { storage } from '@/utils/storage';

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  try {
    const token = await storage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (error) {
    console.error('Error getting auth token:', error);
    return {};
  }
};

// Helper function to handle token refresh on 401 errors (matches frontend interceptor)
const handleUnauthorized = async (originalRequest: RequestInit, url: string): Promise<Response> => {
  try {
    console.log('🔄 API Client: Handling 401, attempting token refresh...');
    
    // Try to refresh token (matches frontend pattern)
    const { authService } = await import('./authService');
    await authService.refreshToken();
    
    // Get new token and retry original request
    const authHeaders = await getAuthHeaders();
    const fullUrl = url.startsWith('http') ? url : `${config.apiBaseUrl}${url}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(originalRequest.headers as Record<string, string>),
    };
    
    console.log('🔄 API Client: Retrying request with new token');
    return await fetch(fullUrl, {
      ...originalRequest,
      headers,
    });
  } catch (refreshError) {
    console.error('🔄 API Client: Token refresh failed:', refreshError);
    // Clear tokens and throw error (matches frontend pattern)
    await storage.removeItem('accessToken');
    await storage.removeItem('refreshToken');
    throw new Error('Authentication failed. Please login again.');
  }
};

export const apiClient = {
  get: async <T>(url: string, options?: RequestInit): Promise<T> => {
    const fullUrl = url.startsWith('http') ? url : `${config.apiBaseUrl}${url}`;
    const authHeaders = await getAuthHeaders();
    const res = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options?.headers,
      },
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    return (await res.json()) as T;
  },

  post: async <T>(url: string, data?: any, options?: RequestInit): Promise<T> => {
    const fullUrl = url.startsWith('http') ? url : `${config.apiBaseUrl}${url}`;
    const authHeaders = await getAuthHeaders();
    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    return (await res.json()) as T;
  },

  put: async <T>(url: string, data?: any, options?: RequestInit): Promise<T> => {
    const fullUrl = url.startsWith('http') ? url : `${config.apiBaseUrl}${url}`;
    const authHeaders = await getAuthHeaders();
    const res = await fetch(fullUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    return (await res.json()) as T;
  },

  delete: async <T>(url: string, options?: RequestInit): Promise<T> => {
    const fullUrl = url.startsWith('http') ? url : `${config.apiBaseUrl}${url}`;
    const authHeaders = await getAuthHeaders();
    const res = await fetch(fullUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options?.headers,
      },
      ...options,
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    return (await res.json()) as T;
  }
};


