<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">

      <!-- Page Header -->
      <div class="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
            Games To Play
          </h1>
          <p class="text-slate-400 text-xs sm:text-sm mt-1">
            Search the Steam catalog to build your backlog, track what you're playing next, and promote finished games to your showcase.
          </p>
        </div>

        <!-- Status Summary Pills -->
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="tab in statusTabs"
            :key="tab.value"
            type="button"
            @click="selectedStatus = tab.value"
            :class="[
              'px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer',
              selectedStatus === tab.value
                ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-lg shadow-orange-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            ]"
          >
            <span>{{ tab.label }}</span>
            <span
              :class="[
                'px-1.5 py-0.5 rounded-full text-[11px] font-extrabold',
                selectedStatus === tab.value ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
              ]"
            >
              {{ getStatusCount(tab.value) }}
            </span>
          </button>
        </div>
      </div>

      <!-- Steam Search Bar + Compact Results Panel -->
      <div class="relative max-w-3xl mx-auto mb-10 z-40" ref="searchContainerRef">
        <div class="relative flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-2 sm:p-2.5 shadow-2xl focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/30 transition-all">
          <svg class="h-6 w-6 text-orange-400 ml-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          <input
            type="text"
            placeholder="Search Steam games to add to your To Play list..."
            class="w-full bg-transparent px-4 py-2 text-slate-100 placeholder-slate-500 outline-none text-sm sm:text-base"
            v-model="steamSearchQuery"
            @focus="showSearchDropdown = true"
            @input="onSteamSearchInput"
            @keyup.enter="searchSteamGames"
          />

          <button
            v-if="steamSearchQuery"
            type="button"
            @click="clearSteamSearch"
            class="p-2 text-slate-400 hover:text-slate-200 mr-1"
            title="Clear search"
          >
            ✕
          </button>

          <button
            type="button"
            @click="searchSteamGames"
            :disabled="isSearchingSteam"
            class="min-h-[44px] px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center shrink-0 shadow-md disabled:opacity-50 cursor-pointer"
          >
            <svg v-if="isSearchingSteam" class="animate-spin h-4 w-4 text-slate-950 mr-2" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isSearchingSteam ? 'Searching...' : 'Search Steam' }}</span>
          </button>
        </div>

        <!-- Compact Steam Search Results Dropdown Panel -->
        <div
          v-if="showSearchDropdown && (isSearchingSteam || steamResults !== null)"
          class="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden max-h-[420px] flex flex-col"
        >
          <div class="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span class="font-bold uppercase tracking-wider text-orange-400">
              Steam Store Results
              <span v-if="steamResults" class="text-slate-400 font-normal">({{ steamResults.length }})</span>
            </span>
            <button
              type="button"
              @click="showSearchDropdown = false"
              class="text-slate-400 hover:text-slate-200 font-semibold px-2 py-0.5 rounded hover:bg-slate-800"
            >
              Close ✕
            </button>
          </div>

          <!-- Loading Skeleton inside Dropdown -->
          <div v-if="isSearchingSteam" class="p-4 space-y-3 overflow-y-auto">
            <div v-for="n in 4" :key="n" class="flex items-center justify-between gap-4 animate-pulse">
              <div class="flex items-center gap-3">
                <div class="w-24 h-12 bg-slate-800 rounded-lg"></div>
                <div class="space-y-2">
                  <div class="w-44 h-4 bg-slate-800 rounded"></div>
                  <div class="w-20 h-3 bg-slate-800/60 rounded"></div>
                </div>
              </div>
              <div class="w-24 h-9 bg-slate-800 rounded-xl"></div>
            </div>
          </div>

          <!-- Empty Steam Search Results -->
          <div v-else-if="steamResults && steamResults.length === 0" class="p-8 text-center text-slate-400 text-sm">
            No Steam games found matching "{{ steamSearchQuery }}".
          </div>

          <!-- Results List -->
          <ul v-else-if="steamResults && steamResults.length > 0" class="divide-y divide-slate-800/70 overflow-y-auto">
            <li
              v-for="item in steamResults"
              :key="item.steamAppId"
              class="p-3 sm:px-4 hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-3"
            >
              <div class="flex items-center gap-3 min-w-0">
                <img
                  :src="item.headerImage || item.tinyImage"
                  :alt="item.title"
                  @error="handleImageError"
                  loading="lazy"
                  class="w-24 sm:w-28 aspect-[16/9] object-cover rounded-lg bg-slate-800 border border-slate-700 shrink-0"
                />
                <div class="min-w-0">
                  <h4 class="font-bold text-slate-100 text-sm sm:text-base truncate">{{ item.title }}</h4>
                  <div class="flex flex-wrap items-center gap-2 mt-1 text-xs">
                    <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                      {{ item.priceOverview || 'Steam' }}
                    </span>
                    <span
                      v-if="item.metacritic"
                      class="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30"
                    >
                      ★ {{ item.metacritic }} Metacritic
                    </span>
                    <a
                      :href="item.steamUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-indigo-400 hover:text-indigo-300 hover:underline font-medium"
                    >
                      Steam Page ↗
                    </a>
                  </div>
                </div>
              </div>

              <!-- Add Action -->
              <div class="shrink-0">
                <span
                  v-if="isGameInBacklog(item.steamAppId)"
                  class="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs"
                >
                  ✓ In List
                </span>
                <button
                  v-else
                  type="button"
                  @click="addGameToBacklog(item)"
                  :disabled="addingAppId === item.steamAppId"
                  class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-orange-500/20 hover:bg-orange-500 border border-orange-500/40 text-orange-300 hover:text-slate-950 font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <svg v-if="addingAppId === item.steamAppId" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{{ addingAppId === item.steamAppId ? 'Adding...' : '+ Add to Play' }}</span>
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Filter & Sort Toolbar for Saved Backlog List -->
      <div class="sticky top-6 z-30 mb-8 bg-slate-900/90 border border-slate-800 shadow-xl rounded-2xl p-4 sm:p-5 backdrop-blur-md">
        <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">

          <!-- Filter Backlog Input -->
          <div class="relative flex-1 min-w-[220px]">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Filter your saved To Play list..."
              v-model="listFilterQuery"
              class="w-full pl-10 pr-4 py-2.5 min-h-[44px] bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
            />
            <button
              v-if="listFilterQuery"
              @click="listFilterQuery = ''"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          </div>

          <!-- Controls Group -->
          <div class="flex flex-wrap sm:flex-nowrap items-center gap-3">

            <!-- Genre Filter -->
            <div class="relative flex-1 sm:flex-initial min-w-[150px]">
              <select
                v-model="selectedGenre"
                class="w-full appearance-none bg-slate-950 border border-slate-700/80 text-slate-200 text-sm rounded-xl pl-3.5 pr-8 py-2.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 cursor-pointer"
              >
                <option value="All Genres" class="bg-slate-900 text-slate-200">All Genres</option>
                <option v-for="genre in availableGenres" :key="genre" :value="genre" class="bg-slate-900 text-slate-200">
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
            <div class="relative flex-1 sm:flex-initial min-w-[160px]">
              <select
                v-model="sortOption"
                class="w-full appearance-none bg-slate-950 border border-slate-700/80 text-slate-200 text-sm rounded-xl pl-3.5 pr-8 py-2.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 cursor-pointer"
              >
                <option value="addedAt" class="bg-slate-900 text-slate-200">Date Added</option>
                <option value="metacritic" class="bg-slate-900 text-slate-200">Metacritic Score</option>
                <option value="releaseYear" class="bg-slate-900 text-slate-200">Release Year</option>
                <option value="title" class="bg-slate-900 text-slate-200">Title (A-Z)</option>
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
              class="min-h-[44px] min-w-[44px] px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:border-slate-500 active:scale-95 transition-all flex items-center justify-center font-bold text-base cursor-pointer"
            >
              <span v-if="sortDirection === 'asc'">↑</span>
              <span v-else>↓</span>
            </button>

          </div>
        </div>
      </div>

      <!-- Not Logged In Prompt -->
      <div
        v-if="!authStore.isLoggedIn"
        class="text-center py-16 px-6 bg-slate-900/80 rounded-3xl border border-slate-800 max-w-2xl mx-auto"
      >
        <div class="text-4xl mb-3">🎮</div>
        <h3 class="text-xl font-bold text-slate-200">Sign in to manage your Games To Play list</h3>
        <p class="text-slate-400 text-sm mt-2">
          You can search the Steam catalog above, and once signed in you can save games to your personal backlog and promote them to your played list.
        </p>
      </div>

      <!-- Skeleton Loaders -->
      <div v-else-if="isLoadingList" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div
          v-for="n in 8"
          :key="n"
          class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4 animate-pulse"
        >
          <div class="w-full aspect-[16/9] bg-slate-800 rounded-xl"></div>
          <div class="h-5 bg-slate-800 rounded w-3/4"></div>
          <div class="h-4 bg-slate-800 rounded w-full"></div>
          <div class="h-9 bg-slate-800 rounded-xl w-full mt-2"></div>
        </div>
      </div>

      <!-- Empty List State -->
      <div
        v-else-if="filteredBacklogList.length === 0"
        class="text-center py-20 bg-slate-900/60 rounded-3xl border border-slate-800"
      >
        <div class="text-5xl mb-4">🕹️</div>
        <h3 class="text-xl font-bold text-slate-200">
          {{ backlogGames.length === 0 ? 'Your To Play list is empty' : 'No matching games found' }}
        </h3>
        <p class="text-slate-400 mt-2 text-sm max-w-md mx-auto">
          {{
            backlogGames.length === 0
              ? 'Use the Steam search bar above to look up games you want to play and add them to your list.'
              : 'Try adjusting your status tab, genre filter, or search query.'
          }}
        </p>
      </div>

      <!-- Card Grid for Saved "To Play" Games -->
      <div v-else>
        <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <li
            v-for="item in filteredBacklogList"
            :key="item._id"
            class="h-full"
          >
            <div class="h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-slate-700 hover:shadow-xl flex flex-col">

              <!-- Cover Image Wrapper -->
              <div class="relative w-full aspect-[16/9] bg-slate-800 overflow-hidden group">
                <img
                  :src="item.headerImage"
                  :alt="item.title"
                  @error="handleImageError"
                  loading="lazy"
                  decoding="async"
                  class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                <!-- Priority / Status Selector Overlay (Top Left) -->
                <div class="absolute top-2.5 left-2.5">
                  <select
                    :value="item.status || 'Backlog'"
                    @change="updateGameStatus(item, $event.target.value)"
                    :class="[
                      'appearance-none text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow cursor-pointer focus:outline-none',
                      getStatusBadgeClass(item.status)
                    ]"
                    title="Change game status"
                  >
                    <option value="Playing Now" class="bg-slate-900 text-emerald-400">▶ Playing Now</option>
                    <option value="Up Next" class="bg-slate-900 text-indigo-400">⏳ Up Next</option>
                    <option value="Backlog" class="bg-slate-900 text-amber-400">📌 Backlog</option>
                  </select>
                </div>

                <!-- Metacritic Badge Overlay (Top Right) -->
                <div
                  v-if="item.metacritic"
                  class="absolute top-2.5 right-2.5 bg-slate-950/90 text-amber-400 font-extrabold px-2.5 py-1 rounded-full text-xs border border-amber-500/30 flex items-center gap-1 shadow"
                  title="Metacritic Score"
                >
                  <span>★</span>
                  <span>{{ item.metacritic }}</span>
                </div>

                <!-- Genre & Release Year Overlay (Bottom) -->
                <div class="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
                  <div class="flex flex-wrap gap-1 overflow-hidden">
                    <span
                      v-for="g in (item.genres || []).slice(0, 2)"
                      :key="g"
                      class="bg-slate-950/90 text-slate-200 font-semibold px-2 py-0.5 rounded-md text-[10px] border border-slate-800"
                    >
                      {{ g }}
                    </span>
                  </div>
                  <span
                    v-if="item.releaseYear"
                    class="bg-slate-950/90 text-slate-400 font-bold px-2 py-0.5 rounded-md text-[10px] border border-slate-800 shrink-0"
                  >
                    {{ item.releaseYear }}
                  </span>
                </div>
              </div>

              <!-- Card Content -->
              <div class="p-4 sm:p-5 flex flex-col flex-grow justify-between gap-4">
                <div>
                  <div class="flex items-start justify-between gap-2">
                    <h3 class="text-base sm:text-lg font-bold text-slate-100 line-clamp-1" :title="item.title">
                      {{ item.title }}
                    </h3>
                    <span v-if="item.priceOverview" class="text-[11px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded shrink-0">
                      {{ item.priceOverview }}
                    </span>
                  </div>

                  <p class="text-xs sm:text-sm text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {{ item.shortDescription || 'No description available from Steam.' }}
                  </p>
                </div>

                <!-- Action Buttons Footer -->
                <div class="pt-3 border-t border-slate-800 space-y-2.5">
                  <!-- Primary Action: Promote to Upload Game Form -->
                  <button
                    type="button"
                    @click="sendToUploadForm(item)"
                    class="w-full py-2.5 px-3 min-h-[40px] rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md hover:shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>🏆 Mark Played & Rate</span>
                  </button>

                  <!-- Secondary Row: Steam Store Link + Remove Button -->
                  <div class="flex items-center justify-between gap-2">
                    <a
                      :href="item.steamUrl || `https://store.steampowered.com/app/${item.steamAppId}`"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex-1 py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Steam Store</span>
                      <span>↗</span>
                    </a>

                    <button
                      type="button"
                      @click="removeBacklogGame(item)"
                      :disabled="deletingId === item._id"
                      class="py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      title="Remove from To Play list"
                    >
                      <span v-if="deletingId === item._id">...</span>
                      <span v-else>✕ Remove</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </li>
        </ul>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { useAuthStore } from '@/stores/auth';
import { buildApiUrl } from '@/config/api';
import { handleImageError } from '@/utils/image';

const router = useRouter();
const authStore = useAuthStore();

// Steam Search state
const steamSearchQuery = ref('');
const steamResults = ref(null);
const isSearchingSteam = ref(false);
const showSearchDropdown = ref(false);
const addingAppId = ref(null);
const searchContainerRef = ref(null);

// User Backlog List state
const backlogGames = ref([]);
const isLoadingList = ref(false);
const deletingId = ref(null);

// Filter & Sort state
const listFilterQuery = ref('');
const selectedStatus = ref('All');
const selectedGenre = ref('All Genres');
const sortOption = ref('addedAt');
const sortDirection = ref('desc');

const statusTabs = [
  { label: 'All Games', value: 'All' },
  { label: '▶ Playing Now', value: 'Playing Now' },
  { label: '⏳ Up Next', value: 'Up Next' },
  { label: '📌 Backlog', value: 'Backlog' }
];

async function fetchBacklogGames() {
  if (!authStore.isLoggedIn) return;
  isLoadingList.value = true;
  try {
    const response = await axios.get(buildApiUrl('/api/backlog/user'));
    backlogGames.value = response.data || [];
  } catch (error) {
    console.error('Error fetching To Play list:', error);
  } finally {
    isLoadingList.value = false;
  }
}

const debouncedSteamSearch = debounce(() => {
  searchSteamGames();
}, 400);

function onSteamSearchInput() {
  showSearchDropdown.value = true;
  if (steamSearchQuery.value && steamSearchQuery.value.trim().length >= 2) {
    debouncedSteamSearch();
  } else if (!steamSearchQuery.value.trim()) {
    steamResults.value = null;
  }
}

function clearSteamSearch() {
  steamSearchQuery.value = '';
  steamResults.value = null;
  showSearchDropdown.value = false;
}

async function searchSteamGames() {
  const q = steamSearchQuery.value.trim();
  if (!q) return;

  try {
    isSearchingSteam.value = true;
    showSearchDropdown.value = true;
    const response = await axios.get(buildApiUrl('/api/backlog/steam/search'), {
      params: { q }
    });
    steamResults.value = response.data || [];
  } catch (error) {
    console.error('Error searching Steam games:', error);
  } finally {
    isSearchingSteam.value = false;
  }
}

function isGameInBacklog(steamAppId) {
  return backlogGames.value.some(g => Number(g.steamAppId) === Number(steamAppId));
}

async function addGameToBacklog(steamItem) {
  if (!authStore.isLoggedIn) {
    alert('Please sign in first to add games to your To Play list.');
    return;
  }
  if (isGameInBacklog(steamItem.steamAppId)) return;

  try {
    addingAppId.value = steamItem.steamAppId;
    const payload = {
      steamAppId: steamItem.steamAppId,
      title: steamItem.title,
      headerImage: steamItem.headerImage,
      metacritic: steamItem.metacritic,
      priceOverview: steamItem.priceOverview,
      status: selectedStatus.value !== 'All' ? selectedStatus.value : 'Backlog'
    };

    const response = await axios.post(buildApiUrl('/api/backlog/add'), payload);
    backlogGames.value.unshift(response.data);
  } catch (error) {
    console.error('Error adding game to backlog:', error);
    alert(error.response?.data?.message || 'Failed to add game to your To Play list.');
  } finally {
    addingAppId.value = null;
  }
}

async function updateGameStatus(item, newStatus) {
  const previousStatus = item.status;
  item.status = newStatus;
  try {
    await axios.put(buildApiUrl(`/api/backlog/${item._id}/status`), { status: newStatus });
  } catch (error) {
    console.error('Error updating game status:', error);
    item.status = previousStatus;
  }
}

async function removeBacklogGame(item) {
  if (!confirm(`Remove "${item.title}" from your To Play list?`)) return;

  const targetId = item._id;
  try {
    deletingId.value = targetId;
    backlogGames.value = backlogGames.value.filter(g => g._id !== targetId);
    await axios.delete(buildApiUrl(`/api/backlog/${targetId}`));
  } catch (error) {
    console.error('Error removing backlog game:', error);
    alert('Failed to remove game. Restoring item.');
    backlogGames.value.push(item);
  } finally {
    deletingId.value = null;
  }
}

// Navigate to UploadForm with pre-filled Title, Description, Genre, Subgenres, and backlogId
function sendToUploadForm(item) {
  router.push({
    name: 'upload-game',
    query: {
      backlogId: item._id,
      steamAppId: item.steamAppId,
      title: item.title || '',
      description: item.shortDescription || '',
      genres: JSON.stringify(item.genres || []),
      categories: JSON.stringify(item.categories || [])
    }
  });
}

function getStatusCount(statusValue) {
  if (statusValue === 'All') return backlogGames.value.length;
  return backlogGames.value.filter(g => (g.status || 'Backlog') === statusValue).length;
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Playing Now':
      return 'bg-emerald-950/90 text-emerald-400 border-emerald-500/40';
    case 'Up Next':
      return 'bg-indigo-950/90 text-indigo-300 border-indigo-500/40';
    default:
      return 'bg-slate-950/90 text-amber-400 border-amber-500/40';
  }
}

const availableGenres = computed(() => {
  const set = new Set();
  backlogGames.value.forEach(g => {
    if (Array.isArray(g.genres)) {
      g.genres.forEach(genre => set.add(genre));
    }
  });
  return Array.from(set).sort();
});

const toggleSortDirection = () => {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
};

const filteredBacklogList = computed(() => {
  const search = listFilterQuery.value.trim().toLowerCase();

  let list = backlogGames.value.filter(item => {
    if (selectedStatus.value !== 'All' && (item.status || 'Backlog') !== selectedStatus.value) {
      return false;
    }
    if (selectedGenre.value !== 'All Genres') {
      if (!Array.isArray(item.genres) || !item.genres.includes(selectedGenre.value)) {
        return false;
      }
    }
    if (search) {
      const inTitle = (item.title || '').toLowerCase().includes(search);
      const inDesc = (item.shortDescription || '').toLowerCase().includes(search);
      return inTitle || inDesc;
    }
    return true;
  });

  return list.sort((a, b) => {
    let valA, valB;
    if (sortOption.value === 'addedAt') {
      valA = a.addedAt ? new Date(a.addedAt).getTime() : 0;
      valB = b.addedAt ? new Date(b.addedAt).getTime() : 0;
    } else if (sortOption.value === 'metacritic') {
      valA = a.metacritic ?? -1;
      valB = b.metacritic ?? -1;
    } else if (sortOption.value === 'releaseYear') {
      valA = parseInt(a.releaseYear, 10) || 0;
      valB = parseInt(b.releaseYear, 10) || 0;
    } else if (sortOption.value === 'title') {
      valA = (a.title || '').toLowerCase();
      valB = (b.title || '').toLowerCase();
    }

    if (valA < valB) return sortDirection.value === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection.value === 'asc' ? 1 : -1;
    return 0;
  });
});

// Close dropdown when clicking outside search container
function handleOutsideClick(e) {
  if (searchContainerRef.value && !searchContainerRef.value.contains(e.target)) {
    showSearchDropdown.value = false;
  }
}

onMounted(() => {
  fetchBacklogGames();
  document.addEventListener('mousedown', handleOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleOutsideClick);
});
</script>
