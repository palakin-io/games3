import ENV_CONFIG from './env';

// API Configuration
const API_CONFIG = {
  // Backend server URL
  BASE_URL: ENV_CONFIG.API_URL,
  
  // API endpoints
  ENDPOINTS: {
    // Authentication
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH_TOKEN: '/api/auth/refresh',
    
    // Games
    GAMES: '/api/games',
    GAME_BY_ID: (id) => `/api/games/${id}`,
    GAMES_BY_USER: '/api/games/user/games',
    UPLOAD_GAME: '/api/games/upload',
    EDIT_GAME: '/api/games/edit',
    
    // Movies
    MOVIES: '/api/movies',
    MOVIES_BY_USER: '/api/movies/user/movies',
    ADD_MOVIE: '/api/movies/add',
    DELETE_MOVIE: (id) => `/api/movies/${id}`,
  },
  
  // Socket.io
  SOCKET_URL: ENV_CONFIG.SOCKET_URL,
  
  // External APIs
  EXTERNAL: {
    RAWG_API: 'https://api.rawg.io/api/games',
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export default API_CONFIG;
