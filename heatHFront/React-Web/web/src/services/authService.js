import axios from 'axios';

// 1. Construct the API URL manually to avoid Circular Dependency
// If Docker env is present, use it. Otherwise, default to localhost:8080.
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const API_URL = `${BASE_URL}/api/auth`; 

export default {
  register: async (userData) => {
    // 2. Use the full API_URL instead of relative path '/api/auth/...'
    const response = await axios.post(`${API_URL}/register`, userData);
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    return response;
  },

  login: async (credentials) => {
    const response = await axios.post(`${API_URL}/login`, credentials);
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    return response;
  },

  sendVerification: async (userData) => {
    const response = await axios.post(`${API_URL}/send-verification-code`, userData);
    console.log("data: ", response.data);
    return response;
  },

  refreshToken: async () => {
    const refresh = localStorage.getItem('refreshToken');
    const response = await axios.post(`${API_URL}/refresh-token`, { refreshToken: refresh });
    const { accessToken, refreshToken: newRefresh } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', newRefresh);
    return response;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),

  // Send a verification code to the given email
  sendVerificationCode: async (email) => {
    const response = await axios.post(`${API_URL}/send-verification-code`, { email });
    return response.data;
  },

  // Verify a received code given email and code
  verifyCode: async (email, code) => {
    const response = await axios.post(`${API_URL}/verify-code`, { email, code });
    return response.data;
  },

  // Check if an email is already registered
  exists: async (email) => {
    // Note: Use params for GET requests correctly
    const response = await axios.get(`${API_URL}/exists`, { params: { email } });
    return response.data;
  },
};