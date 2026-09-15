<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">

      <!-- Floating Filter & Search Toolbar (Single blurred bar at top) -->
      <div class="sticky top-6 z-30 mb-8 bg-slate-900/90 border border-slate-800 shadow-xl rounded-2xl p-4 sm:p-5">
        <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">

          <!-- Search Input -->
          <div class="relative flex-1 min-w-[240px]">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search games..."
              v-model="searchGame"
              class="w-full pl-10 pr-4 py-2.5 min-h-[44px] bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
            />
            <button
              v-if="searchGame"
              @click="searchGame = ''"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Controls Group -->
          <div class="flex flex-wrap sm:flex-nowrap items-center gap-3">

            <!-- Category Filter -->
            <div class="relative flex-1 sm:flex-initial min-w-[140px]">
              <select
                id="category"
                v-model="selectedGenre"
                class="w-full appearance-none bg-slate-950 border border-slate-700/80 text-slate-200 text-sm rounded-xl pl-3.5 pr-8 py-2.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 cursor-pointer"
              >
                <option v-for="genre in genres" :key="genre" :value="genre" class="bg-slate-900 text-slate-200">
                  {{ genre }}
                </option>
              </select>
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <!-- Sort Option Selector -->
            <div class="relative flex-1 sm:flex-initial min-w-[150px]">
              <select
                id="sort"
                v-model="sortOption"
                class="w-full appearance-none bg-slate-950 border border-slate-700/80 text-slate-200 text-sm rounded-xl pl-3.5 pr-8 py-2.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 cursor-pointer"
              >
                <option value="ratings.main" class="bg-slate-900 text-slate-200">Full Score</option>
                <option value="dateStart" class="bg-slate-900 text-slate-200">Date Start</option>
                <option value="ratings.story" class="bg-slate-900 text-slate-200">Story Score</option>
                <option value="ratings.ost" class="bg-slate-900 text-slate-200">OST Score</option>
                <option value="ratings.art" class="bg-slate-900 text-slate-200">Art Score</option>
                <option value="ratings.gameplay" class="bg-slate-900 text-slate-200">Gameplay Score</option>
              </select>
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <!-- Sort Direction Toggle -->
            <button
              type="button"
              @click="toggleSortDirection"
              title="Toggle Sort Direction"
              class="min-h-[44px] min-w-[44px] px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:border-slate-500 active:scale-95 transition-all flex items-center justify-center font-bold text-base"
            >
              <span v-if="sortDirection === 'asc'">↑</span>
              <span v-else>↓</span>
            </button>

            <!-- Upload Game Button (Logged In) -->
            <router-link
              v-if="authStore.isLoggedIn"
              :to="{ name: 'upload-game' }"
              class="min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold text-sm shadow-md hover:shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-1"
            >
              <span>+ Upload</span>
            </router-link>

          </div>
        </div>
      </div>

      <!-- Skeleton Loaders -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div
          v-for="n in 8"
          :key="n"
          class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4 animate-pulse"
        >
          <div class="w-full aspect-[4/3] bg-slate-800 rounded-xl"></div>
          <div class="h-5 bg-slate-800 rounded w-3/4"></div>
          <div class="h-4 bg-slate-800 rounded w-full"></div>
          <div class="h-4 bg-slate-800 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Empty Results State -->
      <div
        v-else-if="filteredGameList.length === 0"
        class="text-center py-20 bg-slate-900/60 rounded-3xl border border-slate-800"
      >
        <svg class="mx-auto h-16 w-16 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-xl font-bold text-slate-300">No games found</h3>
        <p class="text-slate-500 mt-2 text-sm">Try adjusting your search query or genre filter.</p>
      </div>

      <!-- Fast Fluid Grid List (No Backdrop Blur per Card for maximum FPS) -->
      <div v-else class="list-view" id="scrollbar-content">
        <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <li
            v-for="game in filteredGameList"
            :key="game._id || game.title"
            class="h-full"
          >
            <router-link
              :to="`/game-view/${game._id}`"
              class="group block h-full min-h-[44px] text-inherit focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-2xl"
            >
              <!-- Solid bg-slate-900 card without heavy backdrop-blur -->
              <div class="h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-slate-700 hover:shadow-lg flex flex-col">
                
                <!-- Image Wrapper with object-fill fit -->
                <div class="relative w-full aspect-[4/3] bg-slate-800 overflow-hidden">
                  <img
                    :src="getCoverImageUrl(game)"
                    :alt="game.title + ' cover image'"
                    loading="lazy"
                    decoding="async"
                    class="w-full h-full object-fill transition-transform duration-300 group-hover:scale-105"
                  />
                  <!-- Rating Badge Overlay -->
                  <div class="absolute top-3 right-3 bg-slate-950/90 text-amber-400 font-extrabold px-2.5 py-1 rounded-full text-xs border border-amber-500/30 flex items-center gap-1 shadow">
                    <span>★</span>
                    <span>{{ getDisplayRating(game) }}</span>
                  </div>
                  <!-- Genre Badge Overlay -->
                  <div v-if="game.genre" class="absolute bottom-3 left-3 bg-slate-950/90 text-slate-300 font-semibold px-2.5 py-0.5 rounded-md text-[11px] border border-slate-800">
                    {{ game.genre }}
                  </div>
                </div>

                <!-- Card Content -->
                <div class="p-4 sm:p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 class="text-lg font-bold text-slate-100 group-hover:text-orange-400 transition-colors duration-200 line-clamp-1">
                      {{ game.title }}
                    </h3>
                    <p class="text-xs sm:text-sm text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      {{ game.description || 'No description available for this game.' }}
                    </p>
                  </div>

                  <!-- Card Footer -->
                  <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span class="capitalize text-slate-500">
                      {{ getSortLabel() }}
                    </span>
                    <span class="text-orange-400 font-medium group-hover:translate-x-1 transition-transform duration-200 inline-flex items-center gap-1">
                      View details &rarr;
                    </span>
                  </div>
                </div>

              </div>
            </router-link>
          </li>
        </ul>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import 'gamesList.css';
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { buildApiUrl } from '@/config/api';

const authStore = useAuthStore();

const games = ref([]);
const isLoading = ref(true);
const displayedCount = ref(12);

async function fetchGames() {
  isLoading.value = true;
  try {
    const response = await axios.get(buildApiUrl('/api/games/user/games'));
    games.value = response.data;
  } catch (error) {
    console.error('Error fetching games:', error.response ? error.response.data : error.message);
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchGames);

const searchGame = ref('');

const genres = ["All Genres", "JRPG", "RPG", "Roguelite", "RTS", "MOBA", "FPS", "Action Adventure", "CRPG", "SoulsLike"];
const selectedGenre = ref('All Genres');

const sortOption = ref('ratings.main');
const sortDirection = ref('desc');

const toggleSortDirection = () => {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
};

const getCoverImageUrl = (game) => {
  if (game.characters && game.characters.length > 0 && game.characters[0].picture_url) {
    return game.characters[0].picture_url;
  }
  if (game.picture_url) {
    return game.picture_url;
  }
  return 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop';
};

const getDisplayRating = (game) => {
  if (!game || !game.ratings) return '-';
  if (sortOption.value === 'dateStart') {
    return game.ratings.main ?? '-';
  }
  if (sortOption.value.startsWith('ratings.')) {
    const key = sortOption.value.split('.')[1];
    return game.ratings[key] ?? '-';
  }
  return game.ratings.main ?? '-';
};

const getSortLabel = () => {
  switch (sortOption.value) {
    case 'ratings.main': return 'Full Rating';
    case 'ratings.story': return 'Story Score';
    case 'ratings.ost': return 'OST Score';
    case 'ratings.art': return 'Art Score';
    case 'ratings.gameplay': return 'Gameplay Score';
    case 'dateStart': return 'Date Added';
    default: return 'Rating';
  }
};

// Fast direct computed filtering (instantly computed without debounce delay)
const fullyFilteredList = computed(() => {
  const searchTerm = searchGame.value.trim().toLowerCase();
  
  let filtered = games.value.filter(game => {
    if (selectedGenre.value !== 'All Genres') {
      return game.genre === selectedGenre.value;
    }
    return true;
  });

  if (searchTerm) {
    filtered = filtered.filter(game =>
      (game.title || '').toLowerCase().includes(searchTerm) ||
      (game.description || '').toLowerCase().includes(searchTerm)
    );
  }

  return filtered.sort((a, b) => {
    let valueA, valueB;

    if (sortOption.value.includes('.')) {
      const parts = sortOption.value.split('.');
      valueA = a[parts[0]] ? a[parts[0]][parts[1]] : 0;
      valueB = b[parts[0]] ? b[parts[0]][parts[1]] : 0;
    } else {
      valueA = a[sortOption.value];
      valueB = b[sortOption.value];
    }

    if (sortOption.value === 'dateStart') {
      valueA = valueA ? new Date(valueA).getTime() : 0;
      valueB = valueB ? new Date(valueB).getTime() : 0;
    }

    if (valueA < valueB) return sortDirection.value === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection.value === 'asc' ? 1 : -1;
    return 0;
  });
});

const filteredGameList = computed(() => {
  return fullyFilteredList.value.slice(0, displayedCount.value);
});

watch([searchGame, selectedGenre, sortOption, sortDirection], () => {
  displayedCount.value = 12;
});

// Non-blocking requestAnimationFrame scroll handler
let scrollTicking = false;
const handleScroll = () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(() => {
      const buffer = 400;
      const atBottom = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - buffer);

      if (atBottom && displayedCount.value < fullyFilteredList.value.length) {
        displayedCount.value += 12;
      }
      scrollTicking = false;
    });
    scrollTicking = true;
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

</script>
