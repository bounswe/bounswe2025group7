import apiClient from './apiClient';

const feedService = {

  getFeedByUser: async () => {
    const accessToken = localStorage.getItem('accessToken');
    const response = await apiClient.get('/feeds/feed-by-user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
  },

  createFeed: async (postPayload) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.error('No access token found.');
      throw new Error('Unauthorized');
    }
    const response = await apiClient.post('/feeds/created-feed', postPayload, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
  },

}

export default feedService;