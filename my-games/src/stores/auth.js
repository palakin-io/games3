import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode";

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token') || null,
    }),
    getters: {
        isLoggedIn: (state) => !!state.token,
        userName: (state) => state.user ? state.user : "",
    },
    actions: {
        setToken(token) {
            this.token = token;
            let decodedToken = jwtDecode(token);
            this.user = decodedToken.username;
            localStorage.setItem('token', token);
        },
        clearToken() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('token');
        },
    },
});