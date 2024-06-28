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
      const token = authStore.token;
  
        if (token) {
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000;
    
            // Check if token is about to expire (e.g., within 5 minutes)
            if (decodedToken.exp < currentTime + 300) { 
                try {
                    // Refresh the token
                    const refreshResponse = await axios.post('http://localhost:3000/api/auth/refresh', {
                        token: token,
                    });
        
                    const newToken = refreshResponse.data.token;
                    authStore.setToken(newToken); // Update token in the store
        
                    // Update the Authorization header with the new token
                    config.headers.Authorization = `Bearer ${newToken}`;
                } catch (refreshError) {
                    console.error('Failed to refresh token:', refreshError);
                    authStore.logout();
                    throw refreshError;
                }
            } else { // Add token to header
            config.headers.Authorization = `Bearer ${token}`;
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
