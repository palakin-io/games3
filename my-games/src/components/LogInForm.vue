<template>
    <div class="w-full max-w-md mx-auto p-2 sm:p-4 text-slate-100" v-if="!registrationForm">
        <h2 class="text-2xl font-black text-center mb-6 uppercase tracking-tight bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
            Welcome Back
        </h2>

        <form @submit.prevent="login" class="flex flex-col gap-4">
            <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5" for="loginName">
                    Email or Username
                </label>
                <input
                    class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                    v-model="loginName"
                    id="loginName"
                    type="text"
                    name="loginName"
                    placeholder="Enter email or username"
                    required
                />
            </div>

            <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5" for="password">
                    Password
                </label>
                <input
                    class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                    v-model="password"
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                />
            </div>

            <button
                type="submit"
                class="w-full mt-2 py-3 px-4 min-h-[44px] rounded-xl font-extrabold text-sm text-slate-950 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
            >
                Login
            </button>
        </form>

        <div class="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400 space-y-3">
            <div>
                New user? 
                <a class="text-orange-400 font-bold hover:underline ml-1" href="#" @click.prevent="registrationForm = true">
                    Create account here
                </a>
            </div>
            <div class="flex items-center gap-3 my-2 text-slate-500">
                <div class="h-px bg-slate-800 flex-1"></div>
                <span class="text-xs uppercase font-bold tracking-wider">or</span>
                <div class="h-px bg-slate-800 flex-1"></div>
            </div>
            <div class="flex justify-center pt-1 overflow-hidden">
                <GoogleLogin :callback="handleGoogleLogin" />
            </div>
        </div>
    </div>
    <div v-else class="w-full max-w-md mx-auto p-2">
        <registration-form @registration-complete="handleRegistrationComplete"></registration-form>
    </div>
</template>

<style scoped>

</style>

<script setup>
import { ref } from 'vue';
import RegistrationForm from './RegistrationForm.vue'
import { inject } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth.js'
import { buildApiUrl } from '@/config/api';



const registrationForm = ref(false);
const closeModal = inject('close'); // Access closeModal from parent

function handleRegistrationComplete() {
  closeModal(); // Close the modal when registration is done
  registrationForm.value = false; // Optionally, switch back to login form
}

const loginName = ref('');
const password = ref('');
const authStore = useAuthStore();
async function login() {
    try {
        const response = await axios.post(buildApiUrl('/api/auth/login'), { login: loginName.value, password: password.value });
        const { accessToken, refreshToken } = response.data;
        authStore.setTokens({ accessToken, refreshToken });
        closeModal();
    } catch (error) {
        // Handle login error
        console.log('Error logging in', error);
    }
}

const handleGoogleLogin = async (response) => {
    try {
        console.log("Google response:", response);
        // vue3-google-login passes the credential as response.credential
        const token = response.credential;
        if (!token) {
            console.error("No credential found in response. Make sure popup-type is not set to TOKEN.");
            return;
        }
        const res = await axios.post(buildApiUrl('/api/auth/google-login'), { token });
        const { accessToken, refreshToken } = res.data;
        authStore.setTokens({ accessToken, refreshToken });
        closeModal();
    } catch (error) {
        console.log('Error logging in with Google', error);
    }
}
</script>