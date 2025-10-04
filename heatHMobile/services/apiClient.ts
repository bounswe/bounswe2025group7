import { config } from '@/constants/config';
import { storage } from '@/utils/storage';

// Helper function to get auth headers (matches frontend pattern)
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
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options?.headers as Record<string, string>),
    };
    
    let res = await fetch(fullUrl, {
      ...options,
      headers,
    });
    
    // Handle 401 Unauthorized
    if (res.status === 401) {
      res = await handleUnauthorized(options || {}, url);
    }
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    return (await res.json()) as T;
  },

  post: async <T>(url: string, data?: any, options?: RequestInit): Promise<T> => {
    const fullUrl = url.startsWith('http') ? url : `${config.apiBaseUrl}${url}`;
    const authHeaders = await getAuthHeaders();
    
    console.log('🌐 API Client: POST request to:', fullUrl);
    console.log('🌐 API Client: Data:', data);
    console.log('🌐 API Client: Auth headers:', authHeaders);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options?.headers as Record<string, string>),
    };
    
    const requestOptions: RequestInit = {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    };
    
    let res = await fetch(fullUrl, requestOptions);
    console.log('🌐 API Client: Response status:', res.status);
    console.log('🌐 API Client: Response ok:', res.ok);
    
    // Handle 401 Unauthorized
    if (res.status === 401) {
      res = await handleUnauthorized(requestOptions, url);
    }
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('🌐 API Client: Error response:', errorText);
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const responseData = await res.json();
    console.log('🌐 API Client: Response data:', responseData);
    return responseData as T;
  },

  put: async <T>(url: string, data?: any, options?: RequestInit): Promise<T> => {
    const fullUrl = url.startsWith('http') ? url : `${config.apiBaseUrl}${url}`;
    const authHeaders = await getAuthHeaders();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options?.headers as Record<string, string>),
    };
    
    const requestOptions: RequestInit = {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    };
    
    let res = await fetch(fullUrl, requestOptions);
    
    // Handle 401 Unauthorized
    if (res.status === 401) {
      res = await handleUnauthorized(requestOptions, url);
    }
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    return (await res.json()) as T;
  },
};


