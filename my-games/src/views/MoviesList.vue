<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
    
    <!-- Header & Navigation Bar -->
    <div class="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
          Discover Movies
        </h1>
        <p class="text-slate-400 text-xs sm:text-sm mt-1">Search TMDB database and add titles to your personal collection.</p>
      </div>

      <router-link 
        v-if="authStore.isLoggedIn"
        :to="{ name: 'user-movies' }" 
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all self-start sm:self-auto"
      >
        <span>🎬 My Movie List</span>
        <span v-if="movies.length > 0" class="px-2 py-0.5 text-xs bg-slate-950 text-amber-400 rounded-full font-black">
          {{ movies.length }}
        </span>
      </router-link>
    </div>

    <!-- Search Input Bar -->
    <div class="max-w-2xl mx-auto mb-10">
      <div class="relative flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-2 sm:p-2.5 shadow-2xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all">
        <svg class="h-6 w-6 text-slate-400 ml-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <input 
          type="text"
          placeholder="Search for movies by title..."
          class="w-full bg-transparent px-4 py-2 text-slate-100 placeholder-slate-500 outline-none text-base"
          v-model="searchMovie"
          @input="onSearchInput"
          @keyup.enter="searchMovies"
        />

        <button 
          type="button" 
          @click="searchMovies()" 
          class="min-h-[44px] min-w-[44px] px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center shrink-0 shadow-md"
        >
          <span>Search</span>
        </button>  
      </div>
      <p class="text-xs text-slate-500 mt-2 text-center">Auto-searches as you type (500ms delay) or press Enter.</p>
    </div>

    <!-- Loading Skeleton State -->
    <div v-if="isLoading" class="max-w-6xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-pulse">
      <div v-for="n in 5" :key="n" class="flex items-center justify-between py-3 border-b border-slate-800/60 last:border-b-0">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 sm:w-16 sm:h-16 bg-slate-800 rounded-xl"></div>
          <div class="space-y-2">
            <div class="w-48 sm:w-64 h-5 bg-slate-800 rounded-md"></div>
            <div class="w-24 h-4 bg-slate-800/60 rounded-md"></div>
          </div>
        </div>
        <div class="w-16 h-8 bg-slate-800 rounded-lg"></div>
      </div>
    </div>

    <!-- Results Table -->
    <div v-else-if="searchResults && searchResults.length > 0" class="max-w-6xl mx-auto">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-950/70 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th class="py-4 px-6">Movie Title</th>
                <th class="py-4 px-6 text-center sm:text-right">Release Date</th>
                <th class="py-4 px-6 text-center">TMDB Rating</th>
                <th class="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr 
                v-for="movie in searchResults" 
                :key="movie.id" 
                class="hover:bg-slate-800/40 transition-colors"
              >
                <!-- Title & Poster -->
                <td class="py-4 px-6">
                  <div class="flex items-center gap-4">
                    <div class="w-14 h-14 sm:w-16 sm:h-16 shrink-0 bg-slate-800 rounded-xl overflow-hidden border border-slate-700/80 shadow-md">
                      <img 
                        v-if="movie.poster_path"
                        :src="`https://image.tmdb.org/t/p/w185${movie.poster_path}`" 
                        loading="lazy"
                        decoding="async"
                        class="w-full h-full object-cover" 
                        :alt="movie.title"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center text-slate-600 text-xs font-bold">
                        No Poster
                      </div>
                    </div>
                    <div class="flex flex-col">
                      <span class="font-bold text-slate-100 text-base sm:text-lg leading-snug">
                        {{ movie.title }}
                      </span>
                      <span v-if="movie.overview" class="text-xs text-slate-400 line-clamp-1 mt-0.5 max-w-lg">
                        {{ movie.overview }}
                      </span>
                    </div>
                  </div>
                </td>

                <!-- Release Date -->
                <td class="py-4 px-6 text-center sm:text-right text-sm font-semibold text-slate-300 whitespace-nowrap">
                  {{ movie.release_date || 'N/A' }}
                </td>

                <!-- Score Badge -->
                <td class="py-4 px-6 text-center whitespace-nowrap">
                  <span class="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-sm shadow-inner">
                    <span>★</span>
                    <span>{{ movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A' }}</span>
                  </span>
                </td>

                <!-- Add Button -->
                <td class="py-4 px-6 text-right whitespace-nowrap">
                  <button 
                    v-if="isMovieAdded(movie.id)"
                    disabled
                    type="button"
                    class="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs sm:text-sm cursor-default"
                  >
                    <span>✓ Added</span>
                  </button>

                  <button 
                    v-else
                    type="button"
                    @click="addMovie(movie)"
                    :disabled="addingMovieId === movie.id"
                    class="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] min-w-[44px] rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-300 hover:text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    <svg v-if="addingMovieId === movie.id" class="animate-spin h-4 w-4 text-indigo-400" viewBox="0 0 24 24" fill="none">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{{ addingMovieId === movie.id ? 'Adding...' : '+ Add Movie' }}</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- No Results State -->
    <div v-else-if="searchResults && searchResults.length === 0 && !isLoading" class="max-w-2xl mx-auto text-center py-12 px-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
      <div class="text-4xl mb-3">🎬</div>
      <h3 class="text-xl font-bold text-slate-200">No movies found</h3>
      <p class="text-slate-400 text-sm mt-1">Try searching for a different title or keyword.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { MovieDb } from 'moviedb-promise';
import { useAuthStore } from '@/stores/auth';
import { buildApiUrl } from '@/config/api';
import debounce from 'lodash/debounce';

const authStore = useAuthStore();

const searchMovie = ref('');
const searchResults = ref(null);
const isLoading = ref(false);
const addingMovieId = ref(null);

const tmdbApiKey = '79283fdbaeff4888ff6da67efafe0ee4';
const tmdb = new MovieDb(tmdbApiKey);
const movies = ref([]);

onMounted(async () => {
  if (authStore.isLoggedIn) {
    try {
      const response = await axios.get(buildApiUrl('/api/movies/user/movies')); 
      movies.value = response.data;
    } catch (error) {
      console.error('Error fetching user movies:', error);
    }
  }
});

const debouncedSearch = debounce(() => {
  searchMovies();
}, 500);

function onSearchInput() {
  if (searchMovie.value && searchMovie.value.trim().length >= 2) {
    debouncedSearch();
  }
}

async function searchMovies() {
  if (!searchMovie.value || !searchMovie.value.trim()) return;

  try {
    isLoading.value = true;
    const response = await tmdb.searchMovie({ query: searchMovie.value.trim() });
    searchResults.value = response.results || [];
  } catch (error) {
    console.error('Error searching for movies:', error);
  } finally {
    isLoading.value = false;
  }
}

function isMovieAdded(tmdbId) {
  return movies.value.some(m => m.tmdbId === tmdbId);
}

async function addMovie(movie) {
  if (isMovieAdded(movie.id)) {
    return;
  }

  try {
    addingMovieId.value = movie.id;
    const movieData = {
      tmdbId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      score: movie.vote_average, 
      genreIds: movie.genre_ids 
    };

    await axios.post(buildApiUrl('/api/movies/add'), movieData);

    // Optimistic state update
    movies.value.push({
      tmdbId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      score: movie.vote_average,
      genreIds: movie.genre_ids
    }); 
  } catch (error) {
    console.error('Error adding movie:', error);
    alert('Failed to add movie to your list.');
  } finally {
    addingMovieId.value = null;
  }
}
</script>