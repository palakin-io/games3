import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { useAuthStore } from './stores/auth'

import App from './App.vue'
import router from './router'

import './styles.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Add a request interceptor
axios.interceptors.request.use(
  async (config) => {
    const authStore = useAuthStore();
    const accessToken = authStore.accessToken;
    const refreshToken = authStore.refreshToken;
    if (accessToken) {
      const decodedToken = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000;
      // If access token is about to expire in 2 min
      if (decodedToken.exp < currentTime + 120 && refreshToken) {
        try {
          // Refresh the access token using refresh token
          const refreshResponse = await axios.post('http://localhost:3000/api/auth/refresh', {
            refreshToken: refreshToken,
          });
          const newAccessToken = refreshResponse.data.accessToken;
          authStore.setAccessToken(newAccessToken); // Update access token in the store
          config.headers.Authorization = `Bearer ${newAccessToken}`;
        } catch (refreshError) {
          console.error('Failed to refresh access token:', refreshError);
          // On refresh failure, logout the user and redirect to login
          authStore.clearTokens();
          router.push('/login');
          window.location.reload();
          return Promise.reject(refreshError);
        }
      } else {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

app.mount('#app')
