import Constants from 'expo-constants';

// Environment-based configuration
const getApiConfig = () => {
  // Check if we're in development mode
  
  const isDev = __DEV__ || Constants.expoConfig?.extra?.env === 'development';
  
  // Use environment variable if available (for EAS builds)
  const apiUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;
  
  // Check if apiUrl is a valid string
  if (apiUrl && typeof apiUrl === 'string' && apiUrl.trim() !== '') {
    const isHttps = apiUrl.startsWith('https');
    return {
      BASE_URL: apiUrl,
      WS_URL: apiUrl.replace(/^https?/, isHttps ? 'wss' : 'ws').replace('/api', ''),
    };
  }
  
  // Development defaults - FORCE PRODUCTION FOR TESTING
  // Comment out the isDev check to always use production
  // if (isDev) {
  //   return {
  //     BASE_URL: 'http://10.100.102.97:3000/api', // Local dev server
  //     WS_URL: 'ws://10.100.102.97:3000',
  //   };
  // }
  
  // Production defaults - HTTPS/WSS with Let's Encrypt certificate (Certbot configured)
  return {
    BASE_URL: 'https://babysip.click/api', // Production API URL (HTTPS with valid SSL certificate)
    WS_URL: 'wss://babysip.click/ws', // Production WebSocket URL (WSS with valid SSL certificate)
  };
};

export const API_CONFIG = getApiConfig();

// Debug: Log the API configuration
console.log('🔍 [API CONFIG] BASE_URL:', API_CONFIG.BASE_URL);
console.log('🔍 [API CONFIG] WS_URL:', API_CONFIG.WS_URL);
console.log('🔍 [API CONFIG] __DEV__:', __DEV__);
