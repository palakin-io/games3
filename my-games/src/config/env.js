// Environment Configuration
export const ENV_CONFIG = {
  // Development
  development: {
    API_URL: 'http://localhost:3000',
    SOCKET_URL: 'http://localhost:3000',
  },
  
  // Production (update these when deploying)
  production: {
    API_URL: import.meta.env.VITE_API_URL || 'https://games3.onrender.com',
    SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'https://games3.onrender.com',
  }
};

// Get current environment
const currentEnv = import.meta.env.MODE || 'development';

// Export current environment config
export default ENV_CONFIG[currentEnv];
