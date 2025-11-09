import Constants from 'expo-constants';

// Environment-based configuration
const getApiConfig = () => {
  // Check if we're in development mode
  const isDev = __DEV__ || Constants.expoConfig?.extra?.env === 'development';
  
  // Use environment variable if available (for EAS builds)
  const apiUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;
  
  if (apiUrl) {
    return {
      BASE_URL: apiUrl,
      WS_URL: apiUrl.replace(/^https?/, apiUrl.startsWith('https') ? 'wss' : 'ws').replace('/api', ''),
    };
  }
  
  // Development defaults
  if (isDev) {
    return {
      BASE_URL: 'http://10.100.102.97:3000/api', // Change this to your local dev server
      WS_URL: 'ws://10.100.102.97:3000',
    };
  }
  
  // Production defaults - UPDATE THESE WITH YOUR PRODUCTION URL
  return {
    BASE_URL: 'https://yourdomain.com/api', // TODO: Replace with your production API URL
    WS_URL: 'wss://yourdomain.com', // TODO: Replace with your production WebSocket URL
  };
};

export const API_CONFIG = getApiConfig();
