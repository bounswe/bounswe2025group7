import { config } from '@/constants/config';

export const apiClient = {
  get: async <T>(url: string, token?: string, options?: { params?: any }): Promise<T> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    // Handle query parameters
    let fullUrl = `${config.apiBaseUrl}/api${url}`;
    if (options?.params) {
      const searchParams = new URLSearchParams(options.params);
      fullUrl += `?${searchParams.toString()}`;
    }
    
    const res = await fetch(fullUrl, {
      method: 'GET',
      headers,
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    return (await res.json()) as T;
  },
  
  post: async <T>(url: string, data?: any, token?: string): Promise<T> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const res = await fetch(`${config.apiBaseUrl}/api${url}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    return (await res.json()) as T;
  },

  put: async <T>(url: string, data?: any, token?: string): Promise<T> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const res = await fetch(`${config.apiBaseUrl}/api${url}`, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    return (await res.json()) as T;
  },

  delete: async <T>(url: string, token?: string): Promise<T> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const res = await fetch(`${config.apiBaseUrl}/api${url}`, {
      method: 'DELETE',
      headers,
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    return (await res.json()) as T;
  }
};


