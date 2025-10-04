import { httpClient } from './httpClient';
import { authService } from './authService';

export const feedService = {
  list: async () => {
    const token = await authService.getAccessToken();
    return httpClient.get<any[]>('/feed', undefined, token);
  },
};


