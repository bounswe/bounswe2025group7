import { apiClient } from './apiClient';

export const feedService = {
  list: () => apiClient.get<any[]>('/feed').then((r: any) => r.data),
  
  getFeedByUser: async () => {
    const response = await apiClient.get('/feeds/feed-by-user');
    return response.data;
  },

  getRecentFeeds: async (pageNumber: number = 0) => {
    const response = await apiClient.get('/feeds/recent', { 
      params: { pageNumber } 
    });
    return response.data;
  },

  createFeed: async (postPayload: any) => {
    const response = await apiClient.post('/feeds/created-feed', postPayload);
    return response.data;
  },
};


