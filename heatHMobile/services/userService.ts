import { apiClient } from './apiClient';
import { User } from '@/models/User';

export const userService = {
  me: (): Promise<User> => apiClient.get<User>('/me'),
  byUsername: (username: string): Promise<User> => apiClient.get<User>(`/users/${username}`),
  updateProfile: (data: Partial<User>): Promise<User> => apiClient.put<User>('/users/profile', data),
};


