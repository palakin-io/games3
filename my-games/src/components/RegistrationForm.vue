<template>
    <div class="py-2">
        <div class="flex h-full items-center justify-center">
            <div
                class="rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900 flex-col flex h-full items-center justify-center sm:px-4">
                <div class="flex h-full flex-col justify-center gap-4 p-6">
                    <div class="left-0 right-0 inline-block border-gray-200 px-2 py-2.5 sm:px-4">
                        <form @submit.prevent="register" class="flex flex-col gap-4 pb-4">
                            <h1 class="mb-4 text-2xl font-bold  dark:text-white">Register</h1>
                            <div>
                                <div class="mb-2">
                                    <label class="text-sm font-medium text-gray-900 dark:text-gray-300"
                                        for="email">Email:</label>
                                </div>
                                <div class="flex w-full rounded-lg pt-1">
                                    <div class="relative w-full"><input
                                            class="block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500 p-2.5 text-sm rounded-lg"
                                            v-model="email" id="email" type="email" name="email" placeholder="email@example.com"
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
                                    <div v-if="!pwdErr" class="relative w-full"><input
                                            class="block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500 p-2.5 text-sm rounded-lg"
                                            v-model="password" id="password" type="password" name="password" required="">
                                    </div>
                                    <div v-else class="relative w-full"><input
                                            class="block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-red-500 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500 p-2.5 text-sm rounded-lg"
                                            v-model="password" id="password" type="password" name="password" required="">
                                            <p class="mt-2 text-red-500">password need to be atleast 8 characters long</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div class="mb-2">
                                    <label class="text-sm font-medium text-gray-900 dark:text-gray-300"
                                        data-testid="flowbite-label" for="password">Username</label>
                                </div>
                                <div class="flex w-full rounded-lg pt-1">
                                    <div class="relative w-full"><input
                                            class="block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500 p-2.5 text-sm rounded-lg"
                                            v-model="userName" id="username" type="text" name="username" required="">
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-col gap-2">
                                <button type="submit" :disabled="isLoading"
                                    class="border transition-colors focus:ring-2 p-0.5 disabled:cursor-not-allowed border-transparent bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white disabled:bg-gray-300 disabled:text-gray-700 rounded-lg ">
                                    <span
                                        class="flex items-center justify-center gap-1 font-medium py-1 px-2.5 text-base false">
                                        Register
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'
import axios from 'axios'

const userName = ref('');
const password = ref('');
const email = ref('');

const isLoading = ref(false);
const router = useRouter();
const pwdErr = ref (false);
const emit = defineEmits(['registration-complete']);
async function register() {
    try {
        isLoading.value = true;
        const formData = new FormData();

        //validation(add more for username and email)
        // if(password.value.length < 8){
        //     pwdErr.value = true;
        //     return;
        // }
        password.value.length < 8 ? pwdErr.value = true : pwdErr.value = false;
        if (pwdErr.value) {
            return;
        }

        formData.append('email', email.value);
        formData.append('password', password.value);
        formData.append('username', userName.value);

        const response = await axios.post('http://localhost:3000/api/users/register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('Registration completed:', response.data);
        isLoading.value = false;
        emit('registration-complete');
        router.push('/')
    } catch (error) {
        isLoading.value = false;
        console.error("Registration failed:", error.response ? error.response.data.message : error.message);
    }
}
</script>