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

// Flag to check if a token refresh is already in progress
let isRefreshing = false;
// Queue for requests that came in while the token was being refreshed
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add a request interceptor
axios.interceptors.request.use(
  (config) => {
    // Do not intercept refresh token requests to avoid infinite loops
    if (config.url.endsWith('/auth/refresh')) {
      return config;
    }

    const authStore = useAuthStore();
    const accessToken = authStore.accessToken;

    if (accessToken) {
      const decodedToken = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000;

      // If access token is not expiring soon, attach it and proceed
      if (decodedToken.exp >= currentTime + 120) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        return config;
      }

      // If a refresh is already in progress, queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        });
      }

      // This is the first request with an expiring token, so start the refresh
      isRefreshing = true;
      const refreshToken = authStore.refreshToken;

      return new Promise((resolve, reject) => {
        axios.post('http://localhost:3000/api/auth/refresh', { refreshToken })
          .then(response => {
            const newAccessToken = response.data.accessToken;
            authStore.setAccessToken(newAccessToken);
            // Update the header for the original request
            config.headers.Authorization = `Bearer ${newAccessToken}`;
            // Process the queue with the new token
            processQueue(null, newAccessToken);
            // Resolve the original request
            resolve(config);
          })
          .catch(err => {
            // If refresh fails, reject all queued requests and logout
            processQueue(err, null);
            authStore.clearTokens();
            router.push('/login');
            window.location.reload();
            reject(err);
          })
          .finally(() => {
            // Reset the flag
            isRefreshing = false;
          });
      });
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

app.mount('#app')
