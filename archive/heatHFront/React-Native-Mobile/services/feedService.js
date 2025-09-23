import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const feedService = {
  // Get feed by user
  getFeedByUser: async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Unauthorized - No access token');
      }

      const response = await apiClient.get('/feeds/feed-by-user', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch feed by user:', error);
      throw error; // Propagate the error so the caller can handle it
    }
  },

  // Create a feed
  createFeed: async (postPayload) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        console.error('No access token found.');
        throw new Error('Unauthorized');
      }

      const response = await apiClient.post('/feeds/created-feed', postPayload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return response.data;
    } catch (error) {
      console.error('❌ Failed to create feed:', error);
      throw error; // Propagate the error so the caller can handle it
    }
  },
};

export default feedService;
