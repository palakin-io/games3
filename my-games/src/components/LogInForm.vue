<template>
    <div class="py-2" v-if="!registrationForm">
        <div class="flex h-full items-center justify-center">
            <div
                class="rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900 flex-col flex h-full items-center justify-center sm:px-4">
                <div class="flex h-full flex-col justify-center gap-4 p-6">
                    <div class="left-0 right-0 inline-block border-gray-200 px-2 py-2.5 sm:px-4">
                        <form @submit.prevent="login" class="flex flex-col gap-4 pb-4">
                            <h1 class="mb-4 text-2xl font-bold  dark:text-white">Login</h1>
                            <div>
                                <div class="mb-2">
                                    <label class="text-sm font-medium text-gray-900 dark:text-gray-300"
                                        for="loginName">Email or Username:</label>
                                </div>
                                <div class="flex w-full rounded-lg pt-1">
                                    <div class="relative w-full"><input
                                            class="block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500 p-2.5 text-sm rounded-lg"
                                            v-model="loginName" id="loginName" type="text" name="loginName"
                                            required="">
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div class="mb-2">
                                    <label class="text-sm font-medium text-gray-900 dark:text-gray-300"
                                        data-testid="flowbite-label" for="password">Password</label>
                                </div>
                                <div class="flex w-full rounded-lg pt-1">
                                    <div class="relative w-full"><input
                                            class="block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500 p-2.5 text-sm rounded-lg"
                                            v-model="password" id="password" type="password" name="password" required="">
                                    </div>
                                </div>
                                <p class="mt-2 cursor-pointer text-blue-500 hover:text-blue-600">Forgot password?</p>
                            </div>
                            <div class="flex flex-col gap-2">
                                <button type="submit"
                                    class="border transition-colors focus:ring-2 p-0.5 disabled:cursor-not-allowed border-transparent bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white disabled:bg-gray-300 disabled:text-gray-700 rounded-lg ">
                                    <span
                                        class="flex items-center justify-center gap-1 font-medium py-1 px-2.5 text-base false">
                                        Login
                                    </span>
                                </button>
                            </div>
                        </form>
                        <div class="min-w-[270px]">
                            <div class="mt-4 text-center dark:text-gray-200">New user?
                                <a class="text-blue-500 underline hover:text-blue-600" href="#" @click.prevent="registrationForm = true">Create account
                                    here</a>
                                <p>Or</p>
                                <GoogleLogin :callback="handleGoogleLogin" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else>
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