import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export default {
  register: (userData) =>
    axios.post(`${API_URL}/api/auth/register`, userData),
  login: (credentials) =>
    axios.post(`${API_URL}/api/auth/login`, credentials)
  // logout, etc.
};