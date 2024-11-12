<template>
  <div>
    <div class="mx-auto mb-10 mt-28 flex h-10 items-center justify-start border-b-2 bg-gray-100 leading-4 ring-blue-600 min-w-sm max-w-2xl rounded-md focus-within:ring focus-within:ring-offset-2 focus-within:border-none"> 
        <input 
            placeholder="Search"
            class="peer ml-2 flex-grow bg-transparent text-gray-500 outline-none"
            v-model="searchMovie"
            @keyup.enter="searchMovies"
        />
        <button type="button" class="peer-focus:mr-2 z-20 cursor-pointer text-blue-600 outline-none duration-150 hover:scale-125" @click="searchMovies()">
            <svg class="h-6 w-6 stroke-2" viewBox="0 0 32 32" fill="none">
                <circle cx="15" cy="14" r="8" stroke="currentColor" fill="transparent"></circle>
                <line x1="21.1514" y1="19.7929" x2="26.707" y2="25.3484" stroke="currentColor" fill="transparent"></line>
            </svg>
        </button>  

    </div>
    </div>
    <div v-if="searchResults != null && !isLoading" class="flex flex-wrap -mx-3 mb-5">
    <div class="w-full max-w-full px-3 mb-6  mx-auto">
        <div class="relative flex-[1_auto] flex flex-col break-words min-w-0 bg-clip-border rounded-[.95rem] bg-white m-5">
            <div class="relative flex flex-col min-w-0 break-words border border-dashed bg-clip-border rounded-2xl border-stone-200 bg-light/30">
                <div class="flex-auto block py-8 pt-6 px-9">
                <div class="overflow-x-auto">
                    <table class="w-full my-0 align-middle text-dark border-neutral-200">
                    <thead class="align-bottom">
                        <tr class="font-semibold text-[0.95rem] text-secondary-dark">
                        <th class="pb-3 text-start min-w-[175px]">TITLE</th>
                        <th class="pb-3 text-end min-w-[100px]">RELEASE DATE</th>
                        <th class="pb-3 text-end min-w-[100px]">SCORE</th>
                        <th class="pb-3 text-end min-w-[50px]">ADD</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="movie in searchResults" :key="movie.id" class="border-b border-dashed last:border-b-0">
                            <td class="p-3 pl-0">
                                <div class="flex items-center">
                                <div class="relative inline-block shrink-0 rounded-2xl me-3">
                                    <img :src="`https://image.tmdb.org/t/p/w185${movie.poster_path}`" class="w-[60px] h-[60px] inline-block shrink-0 rounded-2xl" alt="">
                                </div>
                                    <div class="flex flex-col justify-start">
                                        <a href="javascript:void(0)" class="mb-1 font-semibold transition-colors duration-200 ease-in-out text-lg/normal text-secondary-inverse hover:text-primary"> {{ movie.title }} </a>
                                    </div>
                                </div>
                            </td>
                            <td class="p-3 pr-0 text-end">
                                <span class="font-semibold text-light-inverse text-md/normal">{{ movie.release_date }}</span>
                            </td>
                            <td class="p-3 pr-0 text-end">
                                <span class="text-center align-baseline inline-flex px-2 py-1 mr-auto items-center font-semibold text-base/none text-success bg-success-light rounded-lg">
                                    {{ movie.vote_average }}
                                </span>
                            </td>
                            <td class="p-3 pr-0 text-end">
                                <button @click="addMovie(movie)" class="ml-auto relative text-secondary-dark bg-light-dark hover:text-primary flex items-center h-[25px] w-[25px] text-base font-medium leading-normal text-center align-middle cursor-pointer rounded-2xl transition-colors duration-200 ease-in-out shadow-none border-0 justify-center">
                                    <span class="flex items-center justify-center p-0 m-0 leading-none shrink-0 ">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
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
        <router-link :to="{ name: 'user-movies' }" class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
            My Movie List
        </router-link>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { MovieDb } from 'moviedb-promise';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const searchMovie = ref('');

const searchResults = ref(null);
const isLoading = ref(false); // Add a loading state
const tmdbApiKey = '79283fdbaeff4888ff6da67efafe0ee4' //re: should make this secure at some point
const tmdb = new MovieDb(tmdbApiKey);
const movies = ref([]);


onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/moviesByUser'); 
    movies.value = response.data;
  } catch (error) {
    console.error('Error fetching movies:', error);
  }
});

async function searchMovies() {
  if (!searchMovie.value) return;

  try {
    isLoading.value = true;

    const response = await tmdb.searchMovie({ query: searchMovie.value });
    searchResults.value = response.results; 
    console.log(response);
  } catch (error) {
    console.error('Error searching for movies:', error);
  } finally {
    isLoading.value = false;
  }
}

//remove the movie, add a loading state, check for if the movie is already added

async function addMovie(movie) {
    const existingMovie = movies.value.find(m => m.tmdbId === movie.id); 
    if (existingMovie) {
        alert('You have already added this movie!');
        return;
    }

    try {
        const movieData = {
            tmdbId: movie.id,
            title: movie.title,
            posterPath: movie.poster_path,
            score: movie.vote_average, 
            genreIds: movie.genre_ids 
        };

        const response = await axios.post('http://localhost:3000/api/movies/add', movieData);
        console.log(response.data.message);

        movies.value.push({
            tmdbId: movie.id,
            title: movie.title,
            posterPath: movie.poster_path,
            score: movie.vote_average,
            genreIds: movie.genre_ids
        }); 
    
    } catch (error) {
        console.error('Error adding movie:', error);
    }
}
</script>