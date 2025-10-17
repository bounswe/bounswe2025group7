import { apiClient } from './apiClient';

export const feedService = {
  list: () => apiClient.get<any[]>('/feed').then((r: any) => r.data),
};


