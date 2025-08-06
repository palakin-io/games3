<template>
    <modal v-if="showModal" @close="handleClose">
        <log-in-form></log-in-form>
    </modal>

    <header class="header">
        <div class="logo-box">
            <img src="../assets/pictures/logo.png" alt="Logo" class="logo">
        </div>

        <div class="text-box">
            <h1 class="heading-primary">
                <span class="heading-primary-main">My Games</span>
                <!-- <span v-if="token !=''" class="heading-primary-sub">Welcome:  {{ userStore.user.first_name }}</span> -->
            </h1>
            <a v-if="!authStore.isLoggedIn" href="#" class="boton btn-white" @click.prevent="openLogIn">Log In</a>
        </div>
    </header>


    <hr class="separation">

    <main>
        <section class="section-about">
            <div class="about-title-container">
                <h2 class="about-title">Tier Lists</h2>
            </div>
            <div class="row">
                <div class="col-1-of-2">
                    <h3 class="heading-tiers">All the tier Lists in one place</h3>
                    <p class="tiers-paragraph">Professor Dumbledore!" he said, his eyes widening. "Harry - what the - ?" "Hagrid, I need you to fetch Professor Karkaroff," said Dumbledore. "His student has been attacked. When you've done that, kindly alert Professor Moody -" "No need, Dumbledore," said a wheezy growl. "I'm here." Moody was limping toward them, leaning on his staff, his wand lit. "Damn leg," he said furiously</p>

                    <h3 class="heading-tiers">Click for more</h3>
                    <p class="tiers-paragraph">Professor Dumbledore!" he said, his eyes widening. "Harry - what the - ?" "Hagrid, I need you to fetch Professor Karkaroff," said Dumbledore. "His student has been attacked. When you've done that, kindly alert Professor Moody -" "No need, Dumbledore," said a wheezy growl. "I'm here."</p>

                    <a href="#" class="tier-more-btn">See All &rarr;</a>
                </div>
                <div class="col-1-of-2">
                    <div class="composition-container">
                        <img src="../assets/pictures/aot-mikasa.jpg" alt="Photo 1" class="composition-photo-1">
                        <img src="../assets/pictures/sylvanas.png" alt="Photo 2" class="composition-photo-2">
                        <img src="../assets/pictures/Mr-robot.jpg" alt="Photo 2" class="composition-photo-3">
                    </div>
                </div>
            </div>
        </section>
    </main>

    <hr class="separation">
</template>

<script setup>
import Modal from '@/components/Modal.vue';
import LogInForm from '@/components/LogInForm.vue'
import { provide, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
if (!authStore.isLoggedIn) { // Check isLoggedIn first
    authStore.clearTokens(); 
}

const showModal = ref(false)
function openLogIn(){
    showModal.value = true;
}
const handleClose = () => {
    showModal.value = false;
}

provide('close', handleClose);

</script>

<style scoped>
    @import 'landing.css';
</style>