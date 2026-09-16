<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
    
    <!-- Header & Navigation Bar -->
    <div class="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
          My Movie List
        </h1>
        <p class="text-slate-400 text-xs sm:text-sm mt-1">Manage and filter your saved movie collection.</p>
      </div>

      <router-link 
        v-if="authStore.isLoggedIn"
        :to="{ name: 'movies' }" 
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all self-start sm:self-auto"
      >
        <span>+ Search & Add Movies</span>
      </router-link>
    </div>

    <!-- Genre Filter & Stats Bar -->
    <div class="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <label for="genre" class="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">
          Filter Genre:
        </label>
        <select 
          id="genre"
          name="genre"
          v-model="selectedGenre"
          class="bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 min-h-[44px] focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-colors cursor-pointer"
        >
          <option value="">All Genres ({{ movies.length }})</option>
          <option v-for="genre in genres" :key="genre.id" :value="genre.id">
            {{ genre.name }}
          </option>
        </select>
      </div>

      <div class="text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl flex items-center justify-between sm:justify-start gap-2">
        <span>Showing:</span>
        <span class="text-amber-400 font-extrabold text-sm">{{ filteredMovies.length }}</span>
        <span>of {{ movies.length }} titles</span>
      </div>
    </div>

    <!-- Loading Skeleton State -->
    <div v-if="isLoading" class="max-w-6xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-pulse">
      <div v-for="n in 4" :key="n" class="flex items-center justify-between py-3 border-b border-slate-800/60 last:border-b-0">
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

    <!-- Empty State Card -->
    <div v-else-if="movies.length === 0" class="max-w-2xl mx-auto text-center py-16 px-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl my-8">
      <div class="w-20 h-20 rounded-full bg-slate-800/80 border border-slate-700/80 text-amber-400 flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner">
        🎬
      </div>
      <h3 class="text-2xl font-bold text-slate-100 mb-2">Your movie list is empty</h3>
      <p class="text-slate-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
        Start building your personal movie collection by searching the TMDB database and adding your favorite titles.
      </p>
      <router-link 
        :to="{ name: 'movies' }"
        class="inline-flex items-center gap-2 px-6 py-3.5 min-h-[44px] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
      >
        <span>+ Search & Add Movies</span>
      </router-link>
    </div>

    <!-- Movie Table -->
    <div v-else class="max-w-6xl mx-auto">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-950/70 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th class="py-4 px-6">Movie Title</th>
                <th class="py-4 px-6 text-center">TMDB Rating</th>
                <th class="py-4 px-6 text-right">Remove</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr 
                v-for="movie in filteredMovies" 
                :key="movie._id" 
                class="hover:bg-slate-800/40 transition-colors"
              >
                <!-- Title & Poster -->
                <td class="py-4 px-6">
                  <div class="flex items-center gap-4">
                    <div class="w-14 h-14 sm:w-16 sm:h-16 shrink-0 bg-slate-800 rounded-xl overflow-hidden border border-slate-700/80 shadow-md">
                      <img 
                        v-if="movie.posterPath"
                        :src="`https://image.tmdb.org/t/p/w185${movie.posterPath}`" 
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
                    </div>
                  </div>
                </td>

                <!-- Rating Badge -->
                <td class="py-4 px-6 text-center whitespace-nowrap">
                  <span class="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-sm shadow-inner">
                    <span>★</span>
                    <span>{{ movie.score ? movie.score.toFixed(1) : 'N/A' }}</span>
                  </span>
                </td>

                <!-- Remove Action Button -->
                <td class="py-4 px-6 text-right whitespace-nowrap">
                  <button 
                    type="button"
                    @click="removeMovie(movie)"
                    :disabled="deletingMovieId === movie._id"
                    class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[44px] min-w-[44px] rounded-xl bg-red-500/10 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
                    title="Remove Movie"
                  >
                    <svg v-if="deletingMovieId === movie._id" class="animate-spin h-4 w-4 text-red-400" viewBox="0 0 24 24" fill="none">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span v-else class="flex items-center gap-1">
                      <span>✕</span>
                      <span class="hidden sm:inline">Remove</span>
                    </span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';   
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { MovieDb } from 'moviedb-promise';
import { buildApiUrl } from '@/config/api';

const authStore = useAuthStore();
const tmdbApiKey = '79283fdbaeff4888ff6da67efafe0ee4';
const tmdb = new MovieDb(tmdbApiKey); 

const movies = ref([]);
const genres = ref([]);
const selectedGenre = ref('');
const isLoading = ref(true);
const deletingMovieId = ref(null);

onMounted(async () => {
  try {
    isLoading.value = true;
    const [moviesRes, genresRes] = await Promise.all([
      axios.get(buildApiUrl('/api/movies/user/movies')),
      tmdb.genreMovieList()
    ]);
    movies.value = moviesRes.data || [];
    genres.value = genresRes.genres || [];
  } catch (error) {
    console.error('Error loading movie list:', error);
  } finally {
    isLoading.value = false;
  }
});

const filteredMovies = computed(() => {
  if (!selectedGenre.value) return movies.value;
  return movies.value.filter(movie => movie.genreIds && movie.genreIds.includes(Number(selectedGenre.value)));
});

async function removeMovie(movie) {
  if (!confirm(`Are you sure you want to remove "${movie.title}"?`)) {
    return;
  }

  const targetId = movie._id;
  try {
    deletingMovieId.value = targetId;

    // Optimistic state update: remove immediately from list
    movies.value = movies.value.filter(m => m._id !== targetId);

    await axios.delete(buildApiUrl(`/api/movies/${targetId}`));
  } catch (error) {
    console.error('Error removing movie:', error);
    alert('Failed to remove movie. Restoring item.');
    // Revert on error
    movies.value.push(movie);
  } finally {
    deletingMovieId.value = null;
  }
}
</script>