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
        accessToken: localStorage.getItem('accessToken') || null,
        refreshToken: localStorage.getItem('refreshToken') || null,
        userID: null
    }),
    getters: {
        isLoggedIn: (state) => {
            return isValidToken(state.accessToken);
        },
        userName: (state) => state.user ? state.user : "",
    },
    actions: {
        setTokens({ accessToken, refreshToken }) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            if (accessToken) {
                let decodedToken = jwtDecode(accessToken);
                this.user = decodedToken.username;
                this.userID = decodedToken.userId;
            } else {
                this.user = null;
                this.userID = null;
            }
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
        },
        clearTokens() {
            this.accessToken = null;
            this.refreshToken = null;
            this.user = null;
            this.userID = null;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        },
        setAccessToken(accessToken) {
            this.accessToken = accessToken;
            if (accessToken) {
                let decodedToken = jwtDecode(accessToken);
                this.user = decodedToken.username;
                this.userID = decodedToken.userId;
            } else {
                this.user = null;
                this.userID = null;
            }
            localStorage.setItem('accessToken', accessToken);
        },
    },
});