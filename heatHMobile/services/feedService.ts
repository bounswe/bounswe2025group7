import { apiClient } from './apiClient';

export const feedService = {
  /**
   * Get feed by user
   * @returns {Promise<any>} - Feed data
   */
  getFeedByUser: async (token?: string): Promise<any> => {
    try {
      const response = await apiClient.get('/feeds/feed-by-user', token);
      return response;
    } catch (error) {
      console.error('Failed to get feed by user:', error);
      throw error;
    }
  },

  /**
   * Create a new feed post
   * @param {Object} postPayload - Post data to be created
   * @returns {Promise<any>} - Created post data
   */
  createFeed: async (postPayload: any, token?: string): Promise<any> => {
    try {
      if (!token) {
        console.error('No access token found.');
        throw new Error('Unauthorized');
      }
      
      const response = await apiClient.post('/feeds/created-feed', postPayload, token);
      return response;
    } catch (error) {
      console.error('Failed to create feed:', error);
      throw error;
    }
  }
};