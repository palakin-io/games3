<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 pb-20">
    <div v-if="gameData">
      
      <!-- Hero Wallpaper Section -->
      <div class="relative w-full h-[99vh] min-h-[500px] flex items-end overflow-hidden" id="home">
        
        <!-- Wallpaper Background Image -->
        <img
          :src="wallpaperImg"
          alt="Background Image"
          loading="lazy"
          decoding="async"
          class="absolute inset-0 w-full h-full object-fill object-center select-none"
        />
        
        <!-- Dark Slate Gradient Overlays -->
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent"></div>

        <!-- Hero Content Overlay -->
        <div class="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 flex flex-col gap-4">
          
          <!-- Rating Badge & Category Tag -->
          <div class="flex flex-wrap items-center gap-3">
            <div class="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-900/90 border border-amber-500/40 backdrop-blur-md shadow-xl">
              <span class="text-amber-400 text-xl font-bold">★</span>
              <span class="text-2xl sm:text-3xl font-extrabold text-amber-400">{{ gameData.ratings.main }}</span>
              <span class="text-xs text-slate-400 font-semibold self-end pb-1">/ 10</span>
            </div>

            <div v-if="gameData.genre" class="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-orange-400 font-bold text-xs sm:text-sm backdrop-blur-md">
              {{ gameData.genre }}
            </div>
          </div>

          <!-- Game Title -->
          <h1 class="text-4xl sm:text-6xl md:text-7xl font-black text-white drop-shadow-2xl uppercase tracking-tight">
            {{ gameData.title }}
          </h1>

          <!-- Description Box -->
          <p class="max-w-3xl text-sm sm:text-lg text-slate-200 font-normal leading-relaxed bg-slate-900/70 border border-slate-800/80 p-4 sm:p-5 rounded-2xl backdrop-blur-md shadow-lg">
            {{ gameData.description || 'No detailed description available.' }}
          </p>

          <!-- Edit Game Button (Logged In) -->
          <div class="mt-2">
            <router-link
              v-if="authStore.isLoggedIn"
              :to="{ name: 'edit-game', params: { id: gameId } }"
              class="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-extrabold text-sm rounded-full shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <span>✎ Edit Game</span>
            </router-link>
          </div>

        </div>
      </div>

      <!-- Main Section Container -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 mt-12">

        <!-- Scores Breakdown Section -->
        <section class="space-y-8">
          <div class="text-center">
            <h2 class="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent inline-block">
              Score Breakdown
            </h2>
            <p class="text-slate-400 text-xs sm:text-sm mt-2">Individual rating metrics across narrative, music, art, and mechanics.</p>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            
            <!-- Story Score Card -->
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-amber-500/50 hover:shadow-orange-500/10 transition-all flex flex-col items-center justify-center text-center">
              <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-amber-500 text-amber-400 flex items-center justify-center text-3xl font-extrabold shadow-inner bg-slate-950/60">
                {{ gameData.ratings.story }}
              </div>
              <h3 class="text-xs sm:text-sm font-bold tracking-widest text-slate-300 uppercase mt-4">STORY</h3>
            </div>

            <!-- OST Score Card -->
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-amber-500/50 hover:shadow-orange-500/10 transition-all flex flex-col items-center justify-center text-center">
              <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-amber-500 text-amber-400 flex items-center justify-center text-3xl font-extrabold shadow-inner bg-slate-950/60">
                {{ gameData.ratings.ost }}
              </div>
              <h3 class="text-xs sm:text-sm font-bold tracking-widest text-slate-300 uppercase mt-4">OST</h3>
            </div>

            <!-- Art Score Card -->
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-amber-500/50 hover:shadow-orange-500/10 transition-all flex flex-col items-center justify-center text-center">
              <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-amber-500 text-amber-400 flex items-center justify-center text-3xl font-extrabold shadow-inner bg-slate-950/60">
                {{ gameData.ratings.art }}
              </div>
              <h3 class="text-xs sm:text-sm font-bold tracking-widest text-slate-300 uppercase mt-4">ART</h3>
            </div>

            <!-- Gameplay Score Card -->
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-amber-500/50 hover:shadow-orange-500/10 transition-all flex flex-col items-center justify-center text-center">
              <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-amber-500 text-amber-400 flex items-center justify-center text-3xl font-extrabold shadow-inner bg-slate-950/60">
                {{ gameData.ratings.gameplay }}
              </div>
              <h3 class="text-xs sm:text-sm font-bold tracking-widest text-slate-300 uppercase mt-4">GAMEPLAY</h3>
            </div>

          </div>
        </section>

        <!-- Divider Line -->
        <div class="w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-60"></div>

        <!-- Characters Section -->
        <section v-if="gameData.characters && gameData.characters.length > 0" class="space-y-8">
          <div class="text-center">
            <h2 class="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent inline-block">
              Characters
            </h2>
            <p class="text-slate-400 text-xs sm:text-sm mt-2">Key cast and playable characters.</p>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            <div v-for="chars in gameData.characters" :key="chars._id || chars.name">
              <cards :title="chars.name" :img="chars.picture_url"></cards>
            </div>
          </div>
        </section>

        <!-- Soundtracks Section -->
        <section v-if="gameData.soundtracks && gameData.soundtracks.length > 0" class="space-y-8 max-w-6xl mx-auto">
          <div class="text-center">
            <h2 class="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent inline-block">
              Soundtracks
            </h2>
            <p class="text-slate-400 text-sm sm:text-base mt-2">Featured music tracks and original themes.</p>
          </div>

          <!-- Doubled Size Soundtrack Container Box -->
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl w-full">
            <ul class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <li v-for="osts in gameData.soundtracks" :key="osts._id || osts.title">
                <button
                  type="button"
                  @click.prevent="openModal(osts.video_url)"
                  class="w-full p-6 min-h-[80px] rounded-2xl bg-slate-950 border border-slate-800 hover:border-orange-500/80 hover:bg-slate-800/90 text-slate-100 hover:text-orange-400 font-bold text-base sm:text-xl flex items-center justify-between transition-all cursor-pointer group shadow-lg"
                >
                  <span class="flex items-center gap-4 truncate">
                    <span class="text-2xl text-orange-400">♪</span>
                    <span class="truncate">{{ osts.title }}</span>
                  </span>
                  <span class="text-xs sm:text-sm text-orange-400 font-extrabold px-3 py-1.5 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 group-hover:translate-x-1 transition-all shrink-0">Play Track &rarr;</span>
                </button>
              </li>
            </ul>
          </div>

          <!-- Soundtrack Player Modal (Doubled Size) -->
          <modal v-if="showModal" maxWidth="6xl" @close="handleClose">
            <div class="w-full p-1">
              <div v-if="activeMedia.type === 'youtube'" class="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl">
                <iframe
                  class="w-full h-full"
                  :src="activeMedia.embedUrl"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerpolicy="strict-origin-when-cross-origin"
                  allowfullscreen
                ></iframe>
              </div>
              <div v-else-if="activeMedia.type === 'video'" class="w-full rounded-2xl overflow-hidden shadow-2xl">
                <video controls autoplay class="w-full rounded-2xl max-h-[80vh]" :src="activeMedia.embedUrl"></video>
              </div>
              <div v-else-if="activeMedia.type === 'audio'" class="w-full p-8 text-center bg-slate-950 rounded-2xl border border-slate-800">
                <audio controls autoplay class="w-full" :src="activeMedia.embedUrl"></audio>
              </div>
              <div v-else class="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800">
                <p class="text-slate-300 text-base mb-3">External media link:</p>
                <a :href="activeMedia.embedUrl" target="_blank" rel="noopener" class="text-orange-400 hover:underline font-bold text-lg">{{ activeMedia.embedUrl }}</a>
              </div>
            </div>
          </modal>

        </section>


        <!-- Extra Info Section -->
        <section class="space-y-8">
          <div class="text-center">
            <h2 class="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent inline-block">
              Extra Info
            </h2>
            <p class="text-slate-400 text-xs sm:text-sm mt-2">Playthrough timeline, video trailers, and wiki links.</p>
          </div>

          <!-- Playthrough Dates Accordion -->
          <accordion title="Playthrough Dates">
            <div class="flex flex-col md:flex-row items-center justify-around py-6 gap-6">
              
              <div class="flex flex-col items-center text-center">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Start Date</span>
                <span class="text-xl sm:text-2xl font-extrabold text-amber-400">{{ formatDate(gameData.dateStart) }}</span>
              </div>

              <div v-if="durationDays !== null" class="flex flex-col items-center flex-grow w-full md:w-auto max-w-xs">
                <span class="text-xs font-bold text-orange-400 mb-2">{{ durationDays }} Days Total</span>
                <div class="w-full h-2 bg-slate-800 rounded-full relative overflow-hidden">
                  <div class="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full w-full"></div>
                </div>
              </div>

              <div class="flex flex-col items-center text-center">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">End Date</span>
                <span class="text-xl sm:text-2xl font-extrabold text-amber-400">{{ formatDate(gameData.dateEnd) }}</span>
              </div>

            </div>
          </accordion>

          <!-- Trailer Accordion -->
          <accordion v-if="trailerURL" title="Official Trailer">
            <div class="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 mt-2 shadow-2xl">
              <iframe
                class="w-full h-full"
                :src="trailerURL"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
              ></iframe>
            </div>
          </accordion>

        </section>

      </div>
    </div>

    <!-- Loading Skeleton State -->
    <div v-else class="min-h-screen flex items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <svg class="h-16 w-16 animate-spin text-orange-500" viewBox="0 0 256 256">
          <line x1="128" y1="32" x2="128" y2="64" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
          <line x1="195.9" y1="60.1" x2="173.3" y2="82.7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
          <line x1="224" y1="128" x2="192" y2="128" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
          <line x1="195.9" y1="195.9" x2="173.3" y2="173.3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
          <line x1="128" y1="224" x2="128" y2="192" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
          <line x1="60.1" y1="195.9" x2="82.7" y2="173.3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
          <line x1="32" y1="128" x2="64" y2="128" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
          <line x1="60.1" y1="60.1" x2="82.7" y2="82.7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
        </svg>
        <span class="text-xl font-bold text-slate-300">Loading Game Details...</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.separation {
  width: 100%;
  height: 0.25rem;
  margin: 1.5rem 0;
  background: linear-gradient(to right, transparent, #f97316, transparent);
  border-radius: 1rem;
}
</style>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { buildApiUrl } from '@/config/api';
import { parseMediaUrl } from '@/utils/media';

import Cards from '@/components/CardView.vue';
import Modal from '@/components/Modal.vue';
import Accordion from '@/components/Accordion.vue';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const gameId = route.params.gameID;
const gameData = ref(null);

const trailerURL = ref('');
const wallpaperImg = ref('');

async function fetchGameData() {
  try {
    const response = await axios.get(buildApiUrl(`/api/games/${gameId}`));
    gameData.value = response.data;
    if (gameData.value.trailer_url) {
      trailerURL.value = parseMediaUrl(gameData.value.trailer_url).embedUrl;
    }

    const wallpaperPath = gameData.value.wallpaper;
    if (wallpaperPath && (wallpaperPath.startsWith('http') || wallpaperPath.startsWith('https'))) {
      wallpaperImg.value = wallpaperPath;
    } else {
      wallpaperImg.value = `${buildApiUrl('')}${wallpaperPath}`;
    }
  } catch (error) {
    console.error('Error fetching game data:', error);
  }
}

onMounted(() => {
  window.scrollTo(0, 0);
  fetchGameData();
});

watch(() => route.params.gameID, (newId) => {
  if (newId) {
    window.scrollTo(0, 0);
    fetchGameData();
  }
});

const showModal = ref(false);
const activeMedia = ref({ type: 'unknown', embedUrl: '' });

const openModal = (videoUrl) => {
  showModal.value = true;
  activeMedia.value = parseMediaUrl(videoUrl);
};
const handleClose = () => {
  showModal.value = false;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const durationDays = computed(() => {
  if (!gameData.value || !gameData.value.dateStart || !gameData.value.dateEnd) return null;
  const start = new Date(gameData.value.dateStart);
  const end = new Date(gameData.value.dateEnd);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});
</script>