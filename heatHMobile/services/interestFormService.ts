import { apiClient } from './apiClient';

export const interestFormService = {
  /**
   * Returns true if the user has not yet submitted the interest form
   * @returns {Promise<boolean>} - True if first login
   */
  checkFirstLogin: async (token?: string): Promise<boolean> => {
    try {
      const response = await apiClient.get('/interest-form/check-first-login', token);
      return response;
    } catch (err: any) {
      // If endpoint not found or form doesn't exist/forbidden, treat as first login
      if (err.response?.status === 404 || err.response?.status === 403) {
        return false;
      }
      throw err;
    }
  },

  /**
   * Create a new interest form entry
   * @param {Object} data - Interest form data
   * @returns {Promise<any>} - Created form data
   */
  createInterestForm: async (data: any, token?: string): Promise<any> => {
    try {
      const response = await apiClient.post('/interest-form/submit', data, token);
      return response;
    } catch (error) {
      console.error('Failed to create interest form:', error);
      throw error;
    }
  },

  /**
   * Fetch the existing interest form data
   * @returns {Promise<any>} - Interest form data
   */
  getInterestForm: async (token?: string): Promise<any> => {
    try {
      const response = await apiClient.get('/interest-form/get-form', token);
      return response;
    } catch (error) {
      console.error('Failed to get interest form:', error);
      throw error;
    }
  },

  /**
   * Update existing interest form data
   * @param {Object} data - Updated interest form data
   * @returns {Promise<any>} - Updated form data
   */
  updateInterestForm: async (data: any, token?: string): Promise<any> => {
    try {
      const response = await apiClient.put('/interest-form/update-form', data, token);
      return response;
    } catch (error) {
      console.error('Failed to update interest form:', error);
      throw error;
    }
  }
};