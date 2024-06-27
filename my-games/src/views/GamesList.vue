<template>
    <!-- <label
      class="mx-auto mt-40 relative bg-white min-w-sm max-w-2xl flex flex-col md:flex-row items-center justify-center border py-2 px-2 rounded-2xl gap-2 shadow-2xl focus-within:border-gray-300"
      for="search-bar"
    >
      <input 
        id="search-bar" 
        placeholder="your keyword here"
        class="px-6 py-2 w-full rounded-md flex-1 outline-none bg-white"
        v-model="searchGame"
      />
      <button
        class="w-full md:w-auto px-6 py-3 bg-black border-black text-white fill-white active:scale-95 duration-100 border will-change-transform overflow-hidden relative rounded-xl transition-all disabled:opacity-70"
      >
        <span class="text-sm font-semibold whitespace-nowrap truncate mx-auto">
          Search
        </span>
      </button>
    </label> -->

    <div>
      <div class="mx-auto mb-10 mt-28 flex h-10 items-center justify-start border-b-2 bg-gray-100 leading-4 ring-blue-600 min-w-sm max-w-2xl rounded-md focus-within:ring focus-within:ring-offset-2 focus-within:border-none"> 
        <input 
          placeholder="Search"
          class="peer ml-2 flex-grow bg-transparent text-gray-500 outline-none"
          v-model="searchGame"
        />
        <button type="button" class="peer-focus:mr-2 z-20 cursor-pointer text-blue-600 outline-none duration-150 hover:scale-125">
          <svg class="h-6 w-6 stroke-2" viewBox="0 0 32 32" fill="none">
            <circle cx="15" cy="14" r="8" stroke="currentColor" fill="transparent"></circle>
            <line x1="21.1514" y1="19.7929" x2="26.707" y2="25.3484" stroke="currentColor" fill="transparent"></line>
          </svg>
        </button>

        <label class="flex-shrink-0 focus-within:ring h-full rounded-md bg-gray-200 ring-emerald-200 ml-2" for="category">
          <div class="relative">
            <select class="flex items-center justify-center bg-transparent px-6 py-4 outline-none w-full appearance-none" name="category" id="category" v-model="selectedGenre"> 
              <option class="peer ml-2 flex-grow bg-transparent text-gray-500 outline-none" v-for="genre in genres" :value="genre">{{ genre }}</option>
            </select>
          </div>
        </label>
      </div>
    </div>

    <div class="list-view container mx-auto" id="scrollbar-content">
        <TransitionGroup
        ref="listContainerRef"
        name="list" 
        tag="ul" 
        :css="false"
        @before-enter="onBeforeEnter" 
        @enter="onEnter" 
        @leave="onLeave"
            >
            <li v-for="(game, index) in filteredGameList" :key="game.title" :data-index="index">
                <router-link :to="`/game-view/${game._id}`" class="link-class">
                    <div class="actual-list">
                        <figure class="score-img">
                            <img :src="game.characters[0].picture_url" alt="cover">
                            <figcaption>{{ game.ratings.main }}</figcaption>
                        </figure>
                        <h3 class="list-title">{{ game.title }}</h3>
                        <div class="list-description">
                            {{ game.description }} 
                        </div>
                    </div>
                </router-link>
            </li>
        </TransitionGroup>
  </div>
  <div v-if="authStore.isLoggedIn" class="fixed top-4 left-4">
    <router-link :to="{ name: 'upload-game' }" class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
      Upload Game
    </router-link>
  </div>
</template>

<style scoped>
    @import 'gamesList.css';
</style>

<script setup>

import { ref, computed, onMounted, watch } from 'vue';
import gsap from 'gsap';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const games = ref([]);

async function fetchGames() {
  try {
    const response = await axios.get('http://localhost:3000/api/games'); // Fetch all games
    // games.value = response.data.sort((a, b) => b.ratings.main - a.ratings.main); // Sort descending
    games.value = response.data;
  } catch (error) {
    console.error('Error fetching games:', error.response ? error.response.data : error.message);
  }
}

onMounted(fetchGames); // Call fetchGames when the component mounts

const searchGame = ref('');
const listContainerRef = ref(null);

const genres = ["All Genres","JRPG", "RPG", "Roguelite", "RTS", "MOBA", "FPS", "Action Adventure"]
const selectedGenre = ref('All Genres'); // Stores the selected genre

const filteredGameList = computed(() => {
  const searchTerm = searchGame.value.toLowerCase();
  const filteredByGenre = games.value.filter(game => {
    // Filter by genre only if selectedGenre is not null or empty
    if (selectedGenre.value !== 'All Genres') {
      return game.genre === selectedGenre.value;
    } else {
      return true; // If no genre is selected, show all games
    }
  });

  return filteredByGenre.filter(game =>
    game.title.toLowerCase().includes(searchTerm)
  );
});

function onBeforeEnter(el) {
  el.style.opacity = 0;
  el.style.height = 0;
}

function onEnter(el, done) {
  gsap.set(el, { height: 0, opacity: 0 }); // Set initial state for smooth GSAP animation
  gsap.to(el, {
    opacity: 1,
    height: "auto", // Use 'auto' to let the content determine the height
    duration: 0.3,  // Add duration for smooth transition
    onComplete: () => {
      updateContainerHeight();
      done();
    }
  });
}

function onLeave(el, done) {
  gsap.to(el, {
    opacity: 0,
    height: 0,
    duration: 0.3,
    onComplete: () => {
      updateContainerHeight();
      done();
    }
  });
}

function updateContainerHeight() {
  if (listContainerRef.value) {
    gsap.to(listContainerRef.value, {
      height: listContainerRef.value.scrollHeight, // Update the container height
      duration: 0.3 
    });
  }
}
</script>