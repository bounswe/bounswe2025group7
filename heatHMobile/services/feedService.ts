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

  likeFeed: async (feedId: number) => {
    const response = await apiClient.post('/feeds/like', { feedId });
    return response.data;
  },

  unlikeFeed: async (feedId: number) => {
    const response = await apiClient.post('/feeds/unlike', { feedId });
    return response.data;
  },

  getFeedOtherUser: async (userId: number) => {
    const response = await apiClient.get('/feeds/other-user', {
      params: { userId }
    });
    return response.data;
  },

  commentFeed: async (feedId: number, message: string) => {
    const response = await apiClient.post('/feeds/comment', { 
      feedId, 
      message 
    });
    return response.data;
  },

  getFeedComments: async (feedId: number) => {
    const response = await apiClient.get('/feeds/get-feed-comments', {
      params: { feedId }
    });
    return response.data;
  },
};


