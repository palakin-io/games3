import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode";

function isValidToken(token) {
    if (!token) return false;
    try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decodedToken.exp > currentTime;
    } catch (error) {
        return false; 
    }
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token') || null,
        userID: null
    }),
    getters: {
        isLoggedIn: (state) => {
            if (isValidToken(state.token)) {
                return true;
            } else {
                return false;
            }
        },
        userName: (state) => state.user ? state.user : "",
    },
    actions: {
        setToken(token) {
            this.token = token;
            let decodedToken = jwtDecode(token);
            this.user = decodedToken.username;
            this.userID = decodedToken.userId;
            localStorage.setItem('token', token);
        },
        clearToken() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('token');
        },
    },
});