<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
    <!-- Login Modal -->
    <modal v-if="showModal" @close="handleClose">
      <log-in-form></log-in-form>
    </modal>

    <header class="header relative min-h-[99vh] h-[99vh] flex flex-col justify-center items-center text-center px-4 py-16 overflow-hidden">
      
      <!-- Header Logo Top Left -->
      <div class="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-3 z-20">
        <img
          src="../assets/pictures/logo.png"
          alt="My Games Logo"
          loading="lazy"
          decoding="async"
          class="h-10 sm:h-14 w-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
        />
      </div>

      <!-- Hero Main Content Box -->
      <div class="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-6 px-4">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs sm:text-sm font-semibold backdrop-blur-md">
          <span class="flex h-2 w-2 rounded-full bg-orange-400 animate-ping"></span>
          <span>Your Ultimate Game Collection Hub</span>
        </div>

        <h1 class="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white drop-shadow-2xl uppercase">
          My Games
        </h1>

        <p class="text-base sm:text-xl text-slate-100 max-w-2xl font-medium leading-relaxed drop-shadow-md">
          Track, rate, and discover your favorite video games with detailed scores for story, OST, graphics, and gameplay.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-4 mt-2">
          <router-link
            to="/games-list"
            class="min-h-[44px] px-8 py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
          >
            <span>Explore Games</span>
            <span>&rarr;</span>
          </router-link>

          <button
            v-if="!authStore.isLoggedIn"
            @click.prevent="openLogIn"
            class="min-h-[44px] px-8 py-3.5 rounded-full bg-slate-900/90 border border-slate-700 hover:border-slate-500 text-slate-100 font-bold text-sm sm:text-base backdrop-blur-md hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-md"
          >
            <span>Log In</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Separation Divider -->
    <div class="w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent my-2 opacity-80"></div>

    <!-- Main Content / Tier Lists Section -->
    <main>
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        
        <!-- Section Header -->
        <div class="text-center mb-12 sm:mb-16">
          <h2 class="text-3xl sm:text-5xl font-black uppercase tracking-tight bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent inline-block">
            Tier Lists
          </h2>
          <p class="text-slate-400 text-sm sm:text-base mt-3 max-w-xl mx-auto">
            Categorize your gaming library into custom tier rankings and share your experiences.
          </p>
        </div>

        <!-- Responsive Grid with Restored Composition Hover Effects -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          <!-- Text Info Column -->
          <div class="space-y-6">
            <h3 class="text-xl sm:text-2xl font-bold text-orange-400 uppercase tracking-wide">
              All the tier Lists in one place
            </h3>
            <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
              Organize your top titles across various genres including JRPGs, Roguelites, FPS, Souls-like, and CRPGs. Rate every dimension of your playthrough from storyline depth to original soundtrack excellence.
            </p>

            <h3 class="text-xl sm:text-2xl font-bold text-amber-400 uppercase tracking-wide pt-4">
              Click for more
            </h3>
            <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
              Compare score breakdowns across gameplay mechanics, artistic direction, soundtrack compositions, and narrative progression with clean interactive filters.
            </p>

            <div class="pt-4">
              <router-link
                to="/games-list"
                class="tier-more-btn inline-flex items-center gap-2 min-h-[44px] text-orange-400 font-bold border-b-2 border-orange-500 pb-1 hover:text-slate-950 hover:bg-orange-500 transition-all px-3 py-1.5 rounded-t-md text-base"
              >
                <span>See All</span>
                <span>&rarr;</span>
              </router-link>
            </div>
          </div>

          <!-- Restored Interactive Overlapping Composition Photos -->
          <div class="composition-container">
            <img
              src="../assets/pictures/aot-mikasa.jpg"
              alt="Photo 1"
              loading="lazy"
              decoding="async"
              class="composition-photo composition-photo-1"
            />
            <img
              src="../assets/pictures/sylvanas.jpg"
              alt="Photo 2"
              loading="lazy"
              decoding="async"
              class="composition-photo composition-photo-2"
            />
            <img
              src="../assets/pictures/Mr-robot.jpg"
              alt="Photo 3"
              loading="lazy"
              decoding="async"
              class="composition-photo composition-photo-3"
            />
          </div>

        </div>
      </section>
    </main>

    <!-- Bottom Separation Line -->
    <div class="w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent my-2 opacity-80"></div>
  </div>
</template>

<script setup>
import Modal from '@/components/Modal.vue';
import LogInForm from '@/components/LogInForm.vue';
import { provide, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
if (!authStore.isLoggedIn) {
  authStore.clearTokens();
}

const showModal = ref(false);
function openLogIn() {
  showModal.value = true;
}
const handleClose = () => {
  showModal.value = false;
};

provide('close', handleClose);
</script>

<style scoped>
@import 'landing.css';
</style>