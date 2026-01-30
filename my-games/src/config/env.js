// Environment Configuration
export const ENV_CONFIG = {
  // Development
  development: {
    API_URL: 'http://localhost:3000',
    SOCKET_URL: 'http://localhost:3000',
  },
  
  // Production (update these when deploying)
  production: {
    API_URL: import.meta.env.VITE_API_URL || 'https://your-production-domain.com',
    SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'https://your-production-domain.com',
  }
};

// Get current environment
const currentEnv = import.meta.env.MODE || 'development';

// Export current environment config
export default ENV_CONFIG[currentEnv];
