import { Platform } from 'react-native';

const getApiBaseUrl = () => {
  if (Platform.OS === 'web') {
    console.warn('⚠️ Running on web - using direct API connection. CORS errors may occur.');
    return 'http://35.198.76.72:8080/api';
  }
  
  return 'http://35.198.76.72:8080/api';
};

export const config = {
  apiBaseUrl: getApiBaseUrl(),
  hasCorsRestrictions: Platform.OS === 'web',
};


