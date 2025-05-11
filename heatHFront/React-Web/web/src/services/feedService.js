import apiClient from './apiClient';

const FEEDS_API = '/feeds';

const feedService = {
  /**
   * Fetch recent feeds for current user
   * @returns {Promise<Array>} Array of feed objects
   */
  getRecentFeeds: async () => {
    const response = await apiClient.get(`${FEEDS_API}/recent`);
    return response.data;
  },

  /**
   * Create a new feed (post)
   * @param {Object} payload - Feed payload (type, text, image, recipeId)
   */
  createFeed: async (payload) => {
    const response = await apiClient.post(`${FEEDS_API}/created-feed`, payload);
    return response.data;
  },

  /**
   * Like a feed
   * @param {number} feedId
   */
  likeFeed: async (feedId) => {
    const response = await apiClient.post(`${FEEDS_API}/like`, { feedId });
    return response.data;
  },

  /**
   * Unlike a feed
   * @param {number} feedId
   */
  unlikeFeed: async (feedId) => {
    const response = await apiClient.post(`${FEEDS_API}/unlike`, { feedId });
    return response.data;
  },
};

export default feedService; 