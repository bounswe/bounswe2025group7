import apiClient from './apiClient';
import axios from 'axios';

const feedService = {

  getFeedByUser: async () => {
    const response = await apiClient.get('/feeds/feed-by-user');
    return response.data;
  },

  createFeed: async (postPayload) => {
    const response = await apiClient.post('/feeds/created-feed', postPayload);
    return response.data;
  },

};

export default feedService; 