<template>
    <footer class="footer">
        <div class="footer-content">
            <ul class="footer-list">
                <li class="footer-item">
                    <router-link to="/" class="footer-link">Home</router-link>
                </li>
                <li class="footer-item">
                    <a href="#" class="footer-link">Tiers</a>
                </li>
                <li class="footer-item">
                    <router-link to="/games-list" class="footer-link">Games List</router-link>
                </li>
                <li class="footer-item">
                    <router-link to="/movies" class="footer-link">Movies</router-link>
                </li>
                <li v-if="authStore.isLoggedIn" class="footer-item">
                    <a href="javascript:void(0)" class="footer-link" @click="logout">Log Out</a>
                </li>
            </ul>
        </div>
    </footer>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const logout = () => {
    authStore.clearTokens();
    router.push('/');
    window.location.reload();
}
</script>

<style scoped>
.footer {
    background-color: #333;
    color: white;
    padding: 2rem 0;
    margin-top: auto;
    /* Push to bottom if flex container is used in App */
    width: 100%;
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
}

.footer-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;
}

.footer-item {
    margin: 0.5rem;
}

.footer-link {
    color: #ccc;
    text-decoration: none;
    font-size: 1rem;
    text-transform: uppercase;
    transition: color 0.3s;
}

.footer-link:hover {
    color: #ff8c00;
}
</style>
