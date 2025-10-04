import { config } from '@/constants/config';
import { storage } from '@/utils/storage';

const getAuthHeaders = async () => {
  try {
    const token = await storage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (error) {
    console.error('Error getting auth token:', error);
    return {};
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
};


