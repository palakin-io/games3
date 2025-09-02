<template>
    <div class="flex flex-wrap -mx-3 mb-5 mt-32">
        <div class="w-1/6 mb-2 ml-8">
            <label 
            class="focus-within:ring h-14 rounded-md bg-gray-200 px-2 ring-emerald-200" 
            for="genre"
            >
                <select 
                    class="bg-transparent px-6 py-4 outline-none w-full" 
                    name="genre" 
                    id="genre"
                    v-model="selectedGenre"
                >
                    <option value="">All</option> 
                    <option v-for="genre in genres" :key="genre.id" :value="genre.id">
                    {{ genre.name }}
                    </option>
                </select>
            </label>
        </div>
    <div class="w-full max-w-full px-3 mb-6  mx-auto">
        <div class="relative flex-[1_auto] flex flex-col break-words min-w-0 bg-clip-border rounded-[.95rem] bg-white m-5">
            <div class="relative flex flex-col min-w-0 break-words border border-dashed bg-clip-border rounded-2xl border-stone-200 bg-light/30">
                <div class="flex-auto block py-8 pt-6 px-9">
                <div class="overflow-x-auto">
                    <table class="w-full my-0 align-middle text-dark border-neutral-200">
                    <thead class="align-bottom">
                        <tr class="font-semibold text-[0.95rem] text-secondary-dark">
                        <th class="pb-3 text-start min-w-[175px]">TITLE</th>
                        <th class="pb-3 text-end min-w-[100px]">SCORE</th>
                        <th class="pb-3 text-end min-w-[50px]">REMOVE</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="movie in filteredMovies" :key="movie._id" class="border-b border-dashed last:border-b-0">
                            <td class="p-3 pl-0">
                                <div class="flex items-center">
                                <div class="relative inline-block shrink-0 rounded-2xl me-3">
                                    <img :src="`https://image.tmdb.org/t/p/w185${movie.posterPath}`" class="w-[60px] h-[60px] inline-block shrink-0 rounded-2xl" alt="">
                                </div>
                                    <div class="flex flex-col justify-start">
                                        <a href="javascript:void(0)" class="mb-1 font-semibold transition-colors duration-200 ease-in-out text-lg/normal text-secondary-inverse hover:text-primary"> {{ movie.title }} </a>
                                    </div>
                                </div>
                            </td>
                            <td class="p-3 pr-0 text-end">
                                <span class="text-center align-baseline inline-flex px-2 py-1 mr-auto items-center font-semibold text-base/none text-success bg-success-light rounded-lg">
                                    {{ movie.score }}
                                </span>
                            </td>
                            <td class="p-3 pr-0 text-end">
                                <button @click="removeMovie(movie)" class="ml-auto relative text-secondary-dark bg-light-dark hover:text-primary flex items-center h-[25px] w-[25px] text-base font-medium leading-normal text-center align-middle cursor-pointer rounded-2xl transition-colors duration-200 ease-in-out shadow-none border-0 justify-center">
                                    <span class="flex items-center justify-center p-0 m-0 leading-none shrink-0 ">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /> 
                                        </svg>
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
        </div>
    </div>
    <div v-if="authStore.isLoggedIn" class="fixed top-4 left-4">
        <router-link :to="{ name: 'movies' }" class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
            Search Movie
        </router-link>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';   
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { MovieDb } from 'moviedb-promise';
import { buildApiUrl } from '@/config/api';

const authStore = useAuthStore();
const tmdbApiKey = '79283fdbaeff4888ff6da67efafe0ee4' //re: should make this secure at some point
const tmdb = new MovieDb(tmdbApiKey); 

const movies = ref([]);
onMounted(async () => {
  try {
    const response = await axios.get(buildApiUrl('/api/movies/user/movies')); 
    movies.value = response.data;
    console.log(movies.value);
    
  } catch (error) {
    console.error('Error fetching movies:', error);
  }
});

const genres = ref([]);
const selectedGenre = ref('');
// Fetch genres on component mount
onMounted(async () => {
  try {
    const response = await tmdb.genreMovieList();
    genres.value = response.genres;
    console.log(response);
    
  } catch (error) {
    console.error('Error fetching genres:', error);
  }
});

// Computed property to filter movies based on selectedGenre
const filteredMovies = computed(() => {
  if (!selectedGenre.value) return movies.value;
  return movies.value.filter(movie => movie.genreIds.includes(selectedGenre.value));
});

async function removeMovie(movie) {
    try {
        if (confirm(`Are you sure you want to remove "${movie.title}"?`)) {
        const response = await axios.delete(buildApiUrl(`/api/movies/${movie._id}`));
        console.log(response.data.message); 

        movies.value = movies.value.filter(m => m._id !== movie._id);
        }
    } catch (error) {
        console.error('Error removing movie:', error);
    }
}
</script>