import { config } from '@/constants/config';

interface ApiResponse<T> {
  data: T;
  status: number;
}

class HttpClient {
  private async makeRequest<T>(
    method: string,
    url: string,
    data?: any,
    headers?: Record<string, string>,
    token?: string | null
  ): Promise<ApiResponse<T>> {
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
      console.log('HttpClient: Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log('HttpClient: No token provided, request will be unauthenticated');
    }

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (data) {
      requestConfig.body = JSON.stringify(data);
    }

    const fullUrl = `${config.apiBaseUrl}${url}`;
    console.log('HttpClient: Making request to:', fullUrl);
    console.log('HttpClient: Method:', method);
    console.log('HttpClient: Headers:', requestHeaders);
    console.log('HttpClient: Body:', data);
    
    // Debug: Log the exact Authorization header being sent
    if (requestHeaders['Authorization']) {
      console.log('HttpClient: Authorization header being sent:', requestHeaders['Authorization']);
      console.log('HttpClient: Token length:', requestHeaders['Authorization'].length);
    } else {
      console.log('HttpClient: No Authorization header in request');
    }

    const response = await fetch(fullUrl, requestConfig);
    console.log('HttpClient: Response status:', response.status);
    console.log('HttpClient: Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('HttpClient: Error response body:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const responseData = await response.json();
    console.log('HttpClient: Response data:', responseData);

    return {
      data: responseData,
      status: response.status,
    };
  }

  async get<T>(url: string, params?: Record<string, string>, token?: string | null): Promise<ApiResponse<T>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    console.log('HttpClient: Making GET request to:', `${config.apiBaseUrl}${url}${queryString}`);
    return this.makeRequest<T>('GET', `${url}${queryString}`, undefined, undefined, token);
  }

  async post<T>(url: string, data?: any, token?: string | null): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', url, data, undefined, token);
  }

  async put<T>(url: string, data?: any, token?: string | null): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', url, data, undefined, token);
  }

  async delete<T>(url: string, token?: string | null): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', url, undefined, undefined, token);
  }
}

export const httpClient = new HttpClient();
