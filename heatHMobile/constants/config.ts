import { Platform } from 'react-native';

// For web development, we need to handle CORS differently
// Native apps (iOS/Android) don't have CORS restrictions
const getApiBaseUrl = () => {
  if (Platform.OS === 'web') {
    // IMPORTANT: CORS proxies are unreliable. Please test on iOS/Android for best results.
    // Try alternative CORS proxy (allOrigins)
    console.warn('⚠️ Using CORS proxy for web development. For production, test on iOS/Android.');
    
    // Option 1: Try allOrigins proxy
    return 'https://api.allorigins.win/raw?url=' + encodeURIComponent('http://35.198.76.72:8080/api');
    
    // Option 2: If above fails, uncomment this to try direct connection (will have CORS errors)
    // return 'http://35.198.76.72:8080/api';
  }
  
  // Native platforms - no CORS issues
  return 'http://35.198.76.72:8080/api';
};

export const config = {
  apiBaseUrl: getApiBaseUrl(),
  // Flag to check if we're on a platform with CORS restrictions
  hasCorsRestrictions: Platform.OS === 'web',
};


