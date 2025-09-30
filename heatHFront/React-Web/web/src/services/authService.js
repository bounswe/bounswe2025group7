import axios from 'axios';

export default {
  register: async (userData) => {
    const response = await axios.post('/api/auth/register', userData);
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    return response;
  },

  login: async (credentials) => {
    const response = await axios.post('/api/auth/login', credentials);
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    return response;
  },
  sendVerification: async (userData) => {
    const response = await axios.post('/api/auth/send-verification-code', userData);
    console.log("data: ", response.data);
    return response;
  },

  refreshToken: async () => {
    const refresh = localStorage.getItem('refreshToken');
    const response = await axios.post('/api/auth/refresh-token', { refreshToken: refresh });
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
    const response = await axios.post('/api/auth/send-verification-code', { email });
    return response.data;
  },

  // Verify a received code given email and code
  verifyCode: async (email, code) => {
    const response = await axios.post('/api/auth/verify-code', { email, code });
    return response.data;
  },

  // Check if an email is already registered
  exists: async (email) => {
    const response = await axios.get('/api/auth/exists', { params: { email } });
    return response.data;
  },
};