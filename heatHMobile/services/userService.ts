import { apiClient } from './apiClient';

export const userService = {
  me: () => apiClient.get<any>('/me'),
  byUsername: (username: string) => apiClient.get<any>(`/users/${username}`),
};


