import { httpClient } from './httpClient';
import { authService } from './authService';

export const userService = {
  me: async () => {
    const token = await authService.getAccessToken();
    return httpClient.get<any>('/me', undefined, token);
  },
  byUsername: async (username: string) => {
    const token = await authService.getAccessToken();
    return httpClient.get<any>(`/users/${username}`, undefined, token);
  },
};


